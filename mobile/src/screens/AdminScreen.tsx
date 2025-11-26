import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function AdminScreen({ navigation }: any) {
  const { user, profile, loading } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigation.replace('Auth');
      return;
    }
    if (user && profile?.role === 'admin') {
      fetchUsers();
    }
  }, [user, profile, loading]);

  const fetchUsers = async () => {
    try {
      setLoadingData(true);
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('user_id', userId);

      if (error) throw error;

      Alert.alert('Uspešno', 'Status korisnika je ažuriran');
      fetchUsers();
    } catch (error: any) {
      Alert.alert('Greška', error.message);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  if (loading || loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Učitavanje korisnika...</Text>
      </View>
    );
  }

  if (profile?.role !== 'admin') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Nazad</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Nemate pristup admin panelu</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Nazad</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />}
      >
        {users.map((user) => (
          <View key={user.user_id} style={styles.userCard}>
            <View style={styles.userHeader}>
              <Text style={styles.userName}>{user.full_name}</Text>
              <View style={[styles.statusBadge, user.is_active ? styles.statusBadgeActive : styles.statusBadgeInactive]}>
                <Text style={styles.statusBadgeText}>
                  {user.is_active ? 'Aktivan' : 'Neaktivan'}
                </Text>
              </View>
            </View>
            <Text style={styles.userInfo}>📧 {user.email}</Text>
            <Text style={styles.userInfo}>👤 {user.role}</Text>
            {user.specialization && (
              <Text style={styles.userInfo}>🏥 {user.specialization}</Text>
            )}

            <TouchableOpacity
              style={[styles.actionButton, user.is_active ? styles.deactivateButton : styles.activateButton]}
              onPress={() => toggleUserStatus(user.user_id, user.is_active)}
            >
              <Text style={styles.actionButtonText}>
                {user.is_active ? 'Deaktiviraj' : 'Aktiviraj'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' },
  loadingText: { marginTop: 16, color: '#64748b', fontSize: 16 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: '#ef4444', fontSize: 16, textAlign: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#0a0a0a', borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  backButtonText: { color: '#10b981', fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#ffffff' },
  content: { flex: 1, padding: 20 },
  userCard: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2a2a2a' },
  userHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', flex: 1 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  statusBadgeActive: { backgroundColor: '#10b9811a', borderColor: '#10b98133' },
  statusBadgeInactive: { backgroundColor: '#ef44441a', borderColor: '#ef444433' },
  statusBadgeText: { fontSize: 12, fontWeight: '600' },
  userInfo: { fontSize: 14, color: '#94a3b8', marginBottom: 6 },
  actionButton: { marginTop: 12, padding: 12, borderRadius: 8, alignItems: 'center' },
  deactivateButton: { backgroundColor: '#ef44441a', borderWidth: 1, borderColor: '#ef444433' },
  activateButton: { backgroundColor: '#10b9811a', borderWidth: 1, borderColor: '#10b98133' },
  actionButtonText: { fontSize: 14, fontWeight: '600' },
});
