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
import { format } from 'date-fns';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

export default function PatientsScreen({ navigation }: any) {
  const { user, loading } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [patientForm, setPatientForm] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    phone: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      navigation.replace('Auth');
      return;
    }

    if (user) {
      fetchPatients();
    }
  }, [user, loading]);

  const fetchPatients = async () => {
    try {
      setLoadingData(true);

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      Alert.alert('Greška', 'Nije moguće učitati pacijente');
    } finally {
      setLoadingData(false);
    }
  };

  const createPatient = async () => {
    if (!patientForm.first_name || !patientForm.last_name) {
      Alert.alert('Greška', 'Ime i prezime su obavezna polja');
      return;
    }

    try {
      const { error } = await supabase.from('patients').insert({
        ...patientForm,
        date_of_birth: patientForm.date_of_birth || null,
        phone: patientForm.phone || null,
      });

      if (error) throw error;

      Alert.alert('Uspešno', 'Pacijent je uspešno dodat');
      setModalVisible(false);
      resetForm();
      fetchPatients();
    } catch (error: any) {
      console.error('Error creating patient:', error);
      Alert.alert('Greška', error.message || 'Nije moguće dodati pacijenta');
    }
  };

  const updatePatient = async () => {
    if (!selectedPatient) return;

    if (!patientForm.first_name || !patientForm.last_name) {
      Alert.alert('Greška', 'Ime i prezime su obavezna polja');
      return;
    }

    try {
      const { error } = await supabase
        .from('patients')
        .update({
          ...patientForm,
          date_of_birth: patientForm.date_of_birth || null,
          phone: patientForm.phone || null,
        })
        .eq('id', selectedPatient.id);

      if (error) throw error;

      Alert.alert('Uspešno', 'Podaci o pacijentu su ažurirani');
      setEditModalVisible(false);
      resetForm();
      fetchPatients();
    } catch (error: any) {
      console.error('Error updating patient:', error);
      Alert.alert('Greška', error.message || 'Nije moguće ažurirati pacijenta');
    }
  };

  const deletePatient = async (patientId: string) => {
    Alert.alert(
      'Potvrda brisanja',
      'Da li ste sigurni da želite da obrišete ovog pacijenta?',
      [
        { text: 'Otkaži', style: 'cancel' },
        {
          text: 'Obriši',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase.from('specialist_reports').delete().eq('patient_id', patientId);
              await supabase.from('appointments').delete().eq('patient_id', patientId);
              const { error } = await supabase.from('patients').delete().eq('id', patientId);

              if (error) throw error;

              Alert.alert('Uspešno', 'Pacijent je trajno obrisan');
              fetchPatients();
            } catch (error: any) {
              Alert.alert('Greška', error.message || 'Nije moguće obrisati pacijenta');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setPatientForm({
      first_name: '',
      last_name: '',
      date_of_birth: '',
      phone: '',
    });
    setSelectedPatient(null);
  };

  const openEditModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setPatientForm({
      first_name: patient.first_name,
      last_name: patient.last_name,
      date_of_birth: patient.date_of_birth || '',
      phone: patient.phone || '',
    });
    setEditModalVisible(true);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPatients();
    setRefreshing(false);
  };

  if (loading || loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Učitavanje pacijenata...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Nazad</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Pacijenti</Text>
          <Text style={styles.headerSubtitle}>{patients.length} ukupno</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Text style={styles.addButtonText}>+ Dodaj</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />
        }
      >
        {patients.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Nema pacijenata</Text>
            <Text style={styles.emptyStateText}>
              Još uvek niste dodali nijednog pacijenta.
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => {
                resetForm();
                setModalVisible(true);
              }}
            >
              <Text style={styles.emptyStateButtonText}>Dodaj prvog pacijenta</Text>
            </TouchableOpacity>
          </View>
        ) : (
          patients.map((patient) => (
            <View key={patient.id} style={styles.patientCard}>
              <View style={styles.patientHeader}>
                <Text style={styles.patientName}>
                  {patient.first_name} {patient.last_name}
                </Text>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Aktivan</Text>
                </View>
              </View>

              {patient.date_of_birth && (
                <Text style={styles.patientInfo}>
                  📅 Rođen: {new Date(patient.date_of_birth).toLocaleDateString('sr-RS')}
                </Text>
              )}
              {patient.phone && (
                <Text style={styles.patientInfo}>📞 {patient.phone}</Text>
              )}

              <View style={styles.patientActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => openEditModal(patient)}
                >
                  <Text style={styles.actionButtonText}>Izmeni</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => deletePatient(patient.id)}
                >
                  <Text style={styles.deleteButtonText}>Obriši</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Dodavanje novog pacijenta</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ime *</Text>
              <TextInput
                style={styles.input}
                placeholder="Marko"
                placeholderTextColor="#64748b"
                value={patientForm.first_name}
                onChangeText={(text) =>
                  setPatientForm((prev) => ({ ...prev, first_name: text }))
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Prezime *</Text>
              <TextInput
                style={styles.input}
                placeholder="Marković"
                placeholderTextColor="#64748b"
                value={patientForm.last_name}
                onChangeText={(text) =>
                  setPatientForm((prev) => ({ ...prev, last_name: text }))
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Datum rođenja (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="1990-01-01"
                placeholderTextColor="#64748b"
                value={patientForm.date_of_birth}
                onChangeText={(text) =>
                  setPatientForm((prev) => ({ ...prev, date_of_birth: text }))
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefon</Text>
              <TextInput
                style={styles.input}
                placeholder="+381 11 234 5678"
                placeholderTextColor="#64748b"
                value={patientForm.phone}
                onChangeText={(text) =>
                  setPatientForm((prev) => ({ ...prev, phone: text }))
                }
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Otkaži</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={createPatient}
              >
                <Text style={styles.modalButtonTextConfirm}>Dodaj</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Izmena podataka o pacijentu</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ime *</Text>
              <TextInput
                style={styles.input}
                placeholder="Marko"
                placeholderTextColor="#64748b"
                value={patientForm.first_name}
                onChangeText={(text) =>
                  setPatientForm((prev) => ({ ...prev, first_name: text }))
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Prezime *</Text>
              <TextInput
                style={styles.input}
                placeholder="Marković"
                placeholderTextColor="#64748b"
                value={patientForm.last_name}
                onChangeText={(text) =>
                  setPatientForm((prev) => ({ ...prev, last_name: text }))
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Datum rođenja (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="1990-01-01"
                placeholderTextColor="#64748b"
                value={patientForm.date_of_birth}
                onChangeText={(text) =>
                  setPatientForm((prev) => ({ ...prev, date_of_birth: text }))
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefon</Text>
              <TextInput
                style={styles.input}
                placeholder="+381 11 234 5678"
                placeholderTextColor="#64748b"
                value={patientForm.phone}
                onChangeText={(text) =>
                  setPatientForm((prev) => ({ ...prev, phone: text }))
                }
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setEditModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Otkaži</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={updatePatient}
              >
                <Text style={styles.modalButtonTextConfirm}>Ažuriraj</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  patientCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  activeBadge: {
    backgroundColor: '#10b9811a',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10b98133',
  },
  activeBadgeText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
  },
  patientInfo: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 6,
  },
  patientActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ef44441a',
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyStateButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#ffffff',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#2a2a2a',
  },
  modalButtonConfirm: {
    backgroundColor: '#10b981',
  },
  modalButtonTextCancel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextConfirm: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
