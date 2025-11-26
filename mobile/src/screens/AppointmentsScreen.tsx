import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function AppointmentsScreen({ navigation }: any) {
  const { user, loading } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigation.replace('Auth');
      return;
    }
    if (user) fetchAppointments();
  }, [user, loading]);

  const fetchAppointments = async () => {
    try {
      setLoadingData(true);
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients!inner (id, first_name, last_name)
        `)
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  if (loading || loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Učitavanje termina...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Nazad</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Termini</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />
        }
      >
        {appointments.map((apt) => (
          <View key={apt.id} style={styles.appointmentCard}>
            <Text style={styles.patientName}>
              {apt.patients.first_name} {apt.patients.last_name}
            </Text>
            <Text style={styles.appointmentInfo}>
              📅 {apt.appointment_date} • ⏰ {apt.appointment_time}
            </Text>
            <Text style={styles.appointmentStatus}>
              Status: {apt.status}
            </Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#0a0a0a', borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  backButtonText: { color: '#10b981', fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#ffffff' },
  content: { flex: 1, padding: 20 },
  appointmentCard: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2a2a2a' },
  patientName: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 },
  appointmentInfo: { fontSize: 14, color: '#94a3b8', marginBottom: 4 },
  appointmentStatus: { fontSize: 14, color: '#10b981' },
});
