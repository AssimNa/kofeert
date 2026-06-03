import React, { useContext, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import api, { API_URL } from '../services/api';
import Colors from '../constants/colors';

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [fiches, setFiches] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadFiches = async () => {
    setLoading(true);
    try {
      const response = await api.get('/fiches');
      setFiches(response.data);
    } catch (error) {
      console.error('Erreur load fiches:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFiches();
    }, [])
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'en_attente': return Colors.orange;
      case 'complete': return Colors.green;
      case 'anomalie': return Colors.orange;
      default: return '#999';
    }
  };

    const deleteFiche = async (ficheId) => {
    try {
      await api.delete(`/admin/fiches/${ficheId}`);
      Alert.alert('Succès', 'Fiche supprimée avec succès.');
      loadFiches();
    } catch (err) {
      console.error('Erreur suppression fiche:', err);
      Alert.alert('Erreur', 'Impossible de supprimer la fiche.');
    }
  };

  const handleLongPress = (fiche) => {
    Alert.alert(
      'Gérer le Template',
      `Que voulez-vous faire avec "${fiche.nom}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Modifier', 
          onPress: () => navigation.navigate('CreateTemplateScreen', { editingFicheId: fiche.id }) 
        },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmation',
              'Voulez-vous vraiment supprimer (archiver) cette fiche ?',
              [
                { text: 'Non', style: 'cancel' },
                { text: 'Oui, supprimer', style: 'destructive', onPress: () => deleteFiche(fiche.id) }
              ]
            );
          }
        }
      ]
    );
  };

  const renderFicheCard = ({ item }) => (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('FicheScreen', {
          ficheId: item.id,
          ficheName: item.nom
        })}
        onLongPress={() => handleLongPress(item)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.nom}</Text>
        </View>
        <Text style={styles.cardMeta}>{item.local || 'Équipement'}</Text>
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.badgeText}>
            {item.status === 'en_attente' ? '📍 EN ATTENTE' : '✓ COMPLÉTÉ'}
          </Text>
        </View>
      </TouchableOpacity>
  );

  if (loading && fiches.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={Colors.green} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Inspections du jour</Text>
            <Text style={styles.headerDate}>
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')} style={user?.photo_profil ? styles.avatarButtonWithImage : styles.avatarButton}>
            {user?.photo_profil ? (
              <Image 
                source={{ uri: `${API_URL.replace(/\/api\/?$/, '')}${user.photo_profil}` }} 
                style={styles.avatarSmallImage} 
              />
            ) : (
              <Ionicons name="person" size={24} color="#333" />
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={styles.newTemplateButton}
          onPress={() => navigation.navigate('CreateTemplateScreen')}
        >
          <Text style={styles.newTemplateButtonText}>+ Nouvelle Fiche Template</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={fiches}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderFicheCard}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadFiches}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarButton: {
    padding: 8, 
    backgroundColor: '#f0f0f0', 
    borderRadius: 20,
  },
  avatarButtonWithImage: {
    padding: 0,
    borderRadius: 20,
    overflow: 'hidden',
  },
  avatarSmallImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  newTemplateButton: {
    backgroundColor: '#28A745',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  newTemplateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  list: {
    padding: 12,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  cardMeta: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
});
