import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  recentChanges24h: number;
  activeUsers: number;
}

interface RecentActivity {
  id: string;
  action: string;
  time: string;
  user: string;
  type: 'success' | 'warning' | 'info';
}

export default function DashboardScreen({ navigation }: any) {
  const { user, profile, loading, signOut } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    recentChanges24h: 0,
    activeUsers: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigation.replace('Auth');
      return;
    }

    if (user) {
      fetchStats();
    }
  }, [user, loading]);

  const fetchStats = async () => {
    try {
      const { count: patientsCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      const today = new Date().toISOString().split('T')[0];
      const { count: todayAppointmentsCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('appointment_date', today)
        .in('status', ['scheduled', 'in_progress']);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayISO = yesterday.toISOString();

      const [patientsChanges, appointmentsChanges, profilesChanges] = await Promise.all([
        supabase.from('patients').select('*', { count: 'exact', head: true })
          .gte('created_at', yesterdayISO),
        supabase.from('appointments').select('*', { count: 'exact', head: true })
          .gte('created_at', yesterdayISO),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
          .gte('updated_at', yesterdayISO)
      ]);

      const totalRecentChanges = (patientsChanges.count || 0) +
        (appointmentsChanges.count || 0) +
        (profilesChanges.count || 0);

      const { count: activeUsersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      setStats({
        totalPatients: patientsCount || 0,
        todayAppointments: todayAppointmentsCount || 0,
        recentChanges24h: totalRecentChanges,
        activeUsers: activeUsersCount || 0,
      });

      await fetchRecentActivities();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const { data: activities } = await supabase
        .from('activity_logs')
        .select(`
          id,
          action,
          event_type,
          table_name,
          created_at,
          profiles!activity_logs_performed_by_fkey(full_name, role)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (activities && activities.length > 0) {
        const formattedActivities: RecentActivity[] = activities.map((activity: any) => {
          const performerInfo = activity.profiles;
          const performerName = performerInfo?.full_name || 'Nepoznat korisnik';

          let actionType: 'success' | 'warning' | 'info' = 'info';
          if (activity.event_type === 'insert') actionType = 'success';
          else if (activity.event_type === 'delete') actionType = 'warning';
          else if (activity.event_type === 'update') actionType = 'info';

          let friendlyAction = activity.action;
          if (activity.table_name === 'patients') {
            if (activity.event_type === 'insert') friendlyAction = 'Registrovan novi pacijent';
            else if (activity.event_type === 'update') friendlyAction = 'Ažuriran pacijent';
          } else if (activity.table_name === 'appointments') {
            if (activity.event_type === 'insert') friendlyAction = 'Zakazan novi termin';
            else if (activity.event_type === 'update') friendlyAction = 'Ažuriran termin';
            else if (activity.event_type === 'delete') friendlyAction = 'Otkazan termin';
          }

          return {
            id: `activity-${activity.id}`,
            action: friendlyAction,
            time: formatTimeAgo(activity.created_at),
            user: performerName,
            type: actionType,
          };
        });

        setRecentActivities(formattedActivities);
      }
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'upravo sada';
    if (diffInMinutes < 60) return `prije ${diffInMinutes} min`;
    if (diffInHours < 24) return `prije ${diffInHours}h`;
    return `prije ${diffInDays} dana`;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigation.replace('Auth');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Učitavanje...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            Dobrodošli, {profile?.full_name?.split(' ')[0] || 'Korisnik'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Odjavi se</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />
        }
      >
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardBlue]}>
            <Text style={styles.statTitle}>Ukupno pacijenata</Text>
            <Text style={styles.statValue}>{stats.totalPatients}</Text>
            <Text style={styles.statChange}>+12%</Text>
          </View>

          <View style={[styles.statCard, styles.statCardGreen]}>
            <Text style={styles.statTitle}>Današnji termini</Text>
            <Text style={styles.statValue}>{stats.todayAppointments}</Text>
            <Text style={styles.statChange}>+5%</Text>
          </View>

          <View style={[styles.statCard, styles.statCardOrange]}>
            <Text style={styles.statTitle}>Promene (24h)</Text>
            <Text style={styles.statValue}>{stats.recentChanges24h}</Text>
            <Text style={styles.statChange}>📊</Text>
          </View>

          <View style={[styles.statCard, styles.statCardPurple]}>
            <Text style={styles.statTitle}>Aktivni korisnici</Text>
            <Text style={styles.statValue}>{stats.activeUsers}</Text>
            <Text style={styles.statChange}>+8%</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Brzi pristup</Text>

          <TouchableOpacity
            style={[styles.actionCard, styles.actionCardBlue]}
            onPress={() => navigation.navigate('Patients')}
          >
            <Text style={styles.actionTitle}>Pacijenti</Text>
            <Text style={styles.actionSubtitle}>Upravljaj pacijentima</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, styles.actionCardGreen]}
            onPress={() => navigation.navigate('Appointments')}
          >
            <Text style={styles.actionTitle}>Termini</Text>
            <Text style={styles.actionSubtitle}>Kalendar termina</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, styles.actionCardPurple]}
            onPress={() => navigation.navigate('SpecialistReport')}
          >
            <Text style={styles.actionTitle}>Izveštaji</Text>
            <Text style={styles.actionSubtitle}>Specijalistički izveštaji</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, styles.actionCardOrange]}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.actionTitle}>Podešavanja</Text>
            <Text style={styles.actionSubtitle}>Konfiguracija sistema</Text>
          </TouchableOpacity>

          {profile?.role === 'admin' && (
            <TouchableOpacity
              style={[styles.actionCard, styles.actionCardRed]}
              onPress={() => navigation.navigate('Admin')}
            >
              <Text style={styles.actionTitle}>Admin Panel</Text>
              <Text style={styles.actionSubtitle}>Upravljanje korisnicima</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.activitiesSection}>
          <Text style={styles.sectionTitle}>Nedavne aktivnosti</Text>
          {recentActivities.length > 0 ? (
            recentActivities.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View
                  style={[
                    styles.activityDot,
                    activity.type === 'success' && styles.activityDotSuccess,
                    activity.type === 'warning' && styles.activityDotWarning,
                    activity.type === 'info' && styles.activityDotInfo,
                  ]}
                />
                <View style={styles.activityContent}>
                  <Text style={styles.activityAction}>{activity.action}</Text>
                  <Text style={styles.activityMeta}>
                    {activity.user} • {activity.time}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Nema nedavnih aktivnosti</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    marginTop: 16,
    color: '#64748b',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  statsGrid: {
    padding: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginBottom: 12,
  },
  statCardBlue: {
    backgroundColor: '#1e3a5f1a',
    borderColor: '#1e40af33',
  },
  statCardGreen: {
    backgroundColor: '#10b9811a',
    borderColor: '#10b98133',
  },
  statCardOrange: {
    backgroundColor: '#f976201a',
    borderColor: '#f9762033',
  },
  statCardPurple: {
    backgroundColor: '#a855f71a',
    borderColor: '#a855f733',
  },
  statCardRed: {
    backgroundColor: '#ef44441a',
    borderColor: '#ef444433',
  },
  statTitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statChange: {
    fontSize: 12,
    color: '#10b981',
  },
  quickActions: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  actionCardBlue: {
    backgroundColor: '#1e3a5f1a',
    borderColor: '#1e40af33',
  },
  actionCardGreen: {
    backgroundColor: '#10b9811a',
    borderColor: '#10b98133',
  },
  actionCardPurple: {
    backgroundColor: '#a855f71a',
    borderColor: '#a855f733',
  },
  actionCardOrange: {
    backgroundColor: '#f976201a',
    borderColor: '#f9762033',
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  activitiesSection: {
    padding: 20,
    paddingBottom: 40,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  activityDotSuccess: {
    backgroundColor: '#10b981',
  },
  activityDotWarning: {
    backgroundColor: '#f59e0b',
  },
  activityDotInfo: {
    backgroundColor: '#3b82f6',
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 4,
  },
  activityMeta: {
    fontSize: 12,
    color: '#64748b',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#64748b',
    fontSize: 14,
  },
});
