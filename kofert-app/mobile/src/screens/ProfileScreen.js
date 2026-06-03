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
import api, { API_URL } from '../services/api';
import { saveUserData } from '../services/storage';
import Colors from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';

export default function ProfileScreen({ navigation }) {
  const { user, setUser, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const getImageUrl = (path) => {
    if (!path) return null;
    const baseUrl = API_URL.replace(/\/api\/?$/, '');
    return `${baseUrl}${path}`;
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      if (Platform.OS !== 'web') {
        Alert.alert('Permission requise', 'Nous avons besoin de la permission pour accéder à vos photos.');
      }
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      uploadImage(result.assets[0]);
    }
  };

  const deleteImage = async () => {
    setUploading(true);
    try {
      const response = await api.delete('/auth/me/photo');
      setUser(response.data);
      await saveUserData(response.data);
      if (Platform.OS !== 'web') {
        Alert.alert('Succès', 'Photo de profil supprimée.');
      }
    } catch (error) {
      console.error('Erreur suppression photo:', error);
      const msg = error.response?.data?.detail || "Erreur lors de la suppression";
      if (Platform.OS !== 'web') {
        Alert.alert('Erreur', msg);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarPress = () => {
    if (Platform.OS === 'web') {
      // Pour le web, on utilise le simple pickImage car Alert.alert sans boutons est complexe
      if (user?.photo_profil) {
        const confirmDelete = window.confirm("Voulez-vous supprimer votre photo de profil ? Cliquez sur 'Annuler' pour choisir une nouvelle photo.");
        if (confirmDelete) {
          deleteImage();
        } else {
          pickImage();
        }
      } else {
        pickImage();
      }
      return;
    }

    const options = [
      { text: 'Prendre une photo de la galerie', onPress: pickImage },
      { text: 'Annuler', style: 'cancel' }
    ];

    if (user?.photo_profil) {
      options.unshift({ 
        text: 'Supprimer la photo actuelle', 
        onPress: () => {
          Alert.alert('Confirmation', 'Voulez-vous vraiment supprimer votre photo ?', [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Supprimer', style: 'destructive', onPress: deleteImage }
          ]);
        }, 
        style: 'destructive' 
      });
    }

    Alert.alert('Photo de profil', 'Que voulez-vous faire ?', options);
  };

  const uploadImage = async (asset) => {
    setUploading(true);
    try {
      const formData = new FormData();
      
      const filename = asset.uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('file', {
        uri: asset.uri,
        name: filename,
        type: type,
      });

      const response = await api.post('/auth/me/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUser(response.data);
      await saveUserData(response.data);
    } catch (error) {
      console.error('Erreur upload:', error);
      const msg = error.response?.data?.detail || "Erreur lors de l'upload";
      if (Platform.OS !== 'web') {
        Alert.alert('Erreur', msg);
      }
    } finally {
      setUploading(false);
    }
  };

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
      await saveUserData(response.data);
      
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
          <TouchableOpacity style={styles.avatarContainer} onPress={handleAvatarPress} disabled={uploading}>
            {user?.photo_profil ? (
              <Image source={{ uri: getImageUrl(user?.photo_profil) }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.prenom?.[0] || ''}{user?.nom?.[0] || ''}
                </Text>
              </View>
            )}
            
            <View style={styles.cameraIconContainer}>
              {uploading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="camera" size={16} color="#fff" />
              )}
            </View>
          </TouchableOpacity>
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
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1D9E75',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1D9E75',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
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
