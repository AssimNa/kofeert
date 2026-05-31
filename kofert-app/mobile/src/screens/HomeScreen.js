import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Colors from '../constants/colors';

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [fiches, setFiches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFiches();
  }, []);

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'en_attente': return Colors.orange;
      case 'complete': return Colors.green;
      case 'anomalie': return Colors.orange;
      default: return '#999';
    }
  };

  const renderFicheCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('FicheScreen', {
        ficheId: item.id,
        ficheName: item.nom
      })}
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={Colors.green} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
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

      <FlatList
        data={fiches}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderFicheCard}
        contentContainerStyle={styles.list}
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
