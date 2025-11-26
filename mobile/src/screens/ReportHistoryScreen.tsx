import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function ReportHistoryScreen({ navigation }: any) {
  const { user, loading } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigation.replace('Auth');
      return;
    }
    if (user) fetchReports();
  }, [user, loading]);

  const fetchReports = async () => {
    try {
      setLoadingData(true);
      const { data } = await supabase
        .from('specialist_reports')
        .select(`
          *,
          patients!inner (first_name, last_name),
          profiles!specialist_reports_doctor_id_fkey (full_name)
        `)
        .order('exam_date', { ascending: false });

      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  };

  if (loading || loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Učitavanje izveštaja...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Nazad</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Istorija izveštaja</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />}
      >
        {reports.map((report) => (
          <View key={report.id} style={styles.reportCard}>
            <Text style={styles.patientName}>
              {report.patients.first_name} {report.patients.last_name}
            </Text>
            <Text style={styles.reportInfo}>📅 {report.exam_date}</Text>
            <Text style={styles.reportInfo}>
              👨‍⚕️ Dr {report.profiles?.full_name || 'N/A'}
            </Text>
            {report.diagnosis && (
              <Text style={styles.diagnosis}>Dijagnoza: {report.diagnosis}</Text>
            )}
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
  reportCard: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2a2a2a' },
  patientName: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 },
  reportInfo: { fontSize: 14, color: '#94a3b8', marginBottom: 4 },
  diagnosis: { fontSize: 14, color: '#10b981', marginTop: 8 },
});
