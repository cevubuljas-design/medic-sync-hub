import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function SpecialistReportScreen({ navigation }: any) {
  const { user, profile, loading } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [reportForm, setReportForm] = useState({
    exam_date: new Date().toISOString().split('T')[0],
    anamnesis: '',
    objective_findings: '',
    diagnosis: '',
    therapy: '',
    control: '',
    echo_findings: '',
    lab_results: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      navigation.replace('Auth');
      return;
    }
    if (user) fetchPatients();
  }, [user, loading]);

  const fetchPatients = async () => {
    const { data } = await supabase
      .from('patients')
      .select('id, first_name, last_name')
      .eq('is_active', true);
    setPatients(data || []);
  };

  const saveReport = async () => {
    if (!selectedPatient) {
      Alert.alert('Greška', 'Morate izabrati pacijenta');
      return;
    }

    try {
      const { error } = await supabase.from('specialist_reports').insert({
        patient_id: selectedPatient,
        doctor_id: profile?.user_id,
        ...reportForm,
      });

      if (error) throw error;

      Alert.alert('Uspešno', 'Izveštaj je sačuvan');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Greška', error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Nazad</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Specijalistički izveštaj</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Pacijent</Text>
          {patients.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.patientOption,
                selectedPatient === p.id && styles.patientOptionSelected,
              ]}
              onPress={() => setSelectedPatient(p.id)}
            >
              <Text style={styles.patientOptionText}>
                {p.first_name} {p.last_name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Anamneza</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={4}
            value={reportForm.anamnesis}
            onChangeText={(text) =>
              setReportForm((prev) => ({ ...prev, anamnesis: text }))
            }
            placeholderTextColor="#64748b"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dijagnoza</Text>
          <TextInput
            style={styles.input}
            value={reportForm.diagnosis}
            onChangeText={(text) =>
              setReportForm((prev) => ({ ...prev, diagnosis: text }))
            }
            placeholderTextColor="#64748b"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Terapija</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={4}
            value={reportForm.therapy}
            onChangeText={(text) =>
              setReportForm((prev) => ({ ...prev, therapy: text }))
            }
            placeholderTextColor="#64748b"
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={saveReport}>
          <Text style={styles.saveButtonText}>Sačuvaj izveštaj</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#0a0a0a', borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  backButtonText: { color: '#10b981', fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#ffffff' },
  content: { flex: 1, padding: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#94a3b8', marginBottom: 8 },
  input: { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 8, padding: 12, fontSize: 16, color: '#ffffff' },
  textArea: { height: 100, textAlignVertical: 'top' },
  patientOption: { backgroundColor: '#1a1a1a', padding: 12, borderRadius: 8, marginBottom: 8 },
  patientOptionSelected: { backgroundColor: '#10b9811a', borderWidth: 1, borderColor: '#10b981' },
  patientOptionText: { color: '#ffffff', fontSize: 16 },
  saveButton: { backgroundColor: '#10b981', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 40 },
  saveButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
});
