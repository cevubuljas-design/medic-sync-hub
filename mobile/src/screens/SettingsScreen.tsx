import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsScreen({ navigation }: any) {
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    Alert.alert(
      'Potvrda',
      'Da li ste sigurni da želite da se odjavite?',
      [
        { text: 'Otkaži', style: 'cancel' },
        {
          text: 'Odjavi se',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            navigation.replace('Auth');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Nazad</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Podešavanja</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Korisnički profil</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Ime i prezime</Text>
            <Text style={styles.infoValue}>{profile?.full_name || 'N/A'}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{profile?.email || 'N/A'}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Uloga</Text>
            <Text style={styles.infoValue}>{profile?.role || 'N/A'}</Text>
          </View>
          {profile?.specialization && (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Specijalizacija</Text>
              <Text style={styles.infoValue}>{profile.specialization}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aplikacija</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Verzija</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <Text style={styles.logoutButtonText}>Odjavi se</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#0a0a0a', borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  backButtonText: { color: '#10b981', fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#ffffff' },
  content: { flex: 1, padding: 20 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', marginBottom: 16 },
  infoCard: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2a2a2a' },
  infoLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 4 },
  infoValue: { fontSize: 16, color: '#ffffff', fontWeight: '600' },
  logoutButton: { backgroundColor: '#ef44441a', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20, marginBottom: 40, borderWidth: 1, borderColor: '#ef444433' },
  logoutButtonText: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
});
