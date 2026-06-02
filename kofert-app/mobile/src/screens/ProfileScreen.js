import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Colors from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ navigation }) {
  const { user, setUser, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    prenom: user?.prenom || '',
    nom: user?.nom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
    adresse: user?.adresse || '',
    ville: user?.ville || '',
    password: '',
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.password) {
        delete payload.password;
      }
      
      const response = await api.put('/auth/me', payload);
      setUser(response.data);
      
      if (Platform.OS === 'web') {
        window.alert('Profil mis à jour avec succès.');
      } else {
        Alert.alert('Succès', 'Profil mis à jour avec succès.');
      }
      setFormData({ ...formData, password: '' });
    } catch (error) {
      console.error('Update profile error', error);
      const msg = error.response?.data?.detail || 'Erreur lors de la mise à jour';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Erreur', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon Profil</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollContent}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.prenom?.[0]}{user?.nom?.[0]}
            </Text>
          </View>
          <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>PRÉNOM</Text>
          <TextInput
            style={styles.input}
            value={formData.prenom}
            onChangeText={(v) => handleChange('prenom', v)}
          />

          <Text style={styles.label}>NOM</Text>
          <TextInput
            style={styles.input}
            value={formData.nom}
            onChangeText={(v) => handleChange('nom', v)}
          />

          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={(v) => handleChange('email', v)}
          />

          <Text style={styles.label}>TÉLÉPHONE</Text>
          <TextInput
            style={styles.input}
            value={formData.telephone}
            keyboardType="phone-pad"
            onChangeText={(v) => handleChange('telephone', v)}
          />

          <Text style={styles.label}>ADRESSE</Text>
          <TextInput
            style={styles.input}
            value={formData.adresse}
            onChangeText={(v) => handleChange('adresse', v)}
          />

          <Text style={styles.label}>VILLE</Text>
          <TextInput
            style={styles.input}
            value={formData.ville}
            onChangeText={(v) => handleChange('ville', v)}
          />

          <Text style={styles.label}>NOUVEAU MOT DE PASSE (Optionnel)</Text>
          <TextInput
            style={styles.input}
            value={formData.password}
            secureTextEntry
            placeholder="Laisser vide pour ne pas changer"
            onChangeText={(v) => handleChange('password', v)}
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Enregistrer</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#E53E3E" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  backBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1D9E75',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  roleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fbfbfb',
  },
  saveBtn: {
    backgroundColor: '#1D9E75',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  logoutText: {
    color: '#E53E3E',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
