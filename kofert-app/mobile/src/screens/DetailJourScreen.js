import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import Colors from '../constants/colors';

export default function DetailJourScreen({ route, navigation }) {
  const { date } = route.params;
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyInspections();
  }, [date]);

  const fetchDailyInspections = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/inspections/jour?date_req=${date}`);
      setInspections(response.data);
    } catch (error) {
      console.error('Erreur fetching detail jour:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (statut, anomalies) => {
    if (statut === 'brouillon') return Colors.blue;
    if (anomalies > 0) return Colors.orange;
    return Colors.green;
  };

  const getStatusText = (statut, anomalies) => {
    if (statut === 'brouillon') return 'Partiel';
    if (anomalies > 0) return `${anomalies} anomalie${anomalies > 1 ? 's' : ''}`;
    return 'Conforme';
  };

  const renderItem = ({ item }) => {
    const isBrouillon = item.statut === 'brouillon';
    
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          if (!isBrouillon) {
            navigation.navigate('FicheDetailScreen', { inspectionId: item.id });
          }
        }}
        disabled={isBrouillon}
      >
        <View style={styles.cardContent}>
          <Text style={styles.ficheName}>{item.fiche_nom}</Text>
          <View style={styles.row}>
            <Ionicons name="person-outline" size={14} color="#666" />
            <Text style={styles.technicienName}>{item.technicien}</Text>
          </View>
        </View>
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.statut, item.anomalies) + '20' }]}>
          <Text style={[styles.badgeText, { color: getStatusColor(item.statut, item.anomalies) }]}>
            {getStatusText(item.statut, item.anomalies)}
          </Text>
        </View>
        {!isBrouillon && (
          <Ionicons name="chevron-forward" size={20} color="#ccc" style={styles.chevron} />
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.green} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Text style={styles.headerTitle}>
        Inspections du {new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </Text>

      {inspections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={48} color="#ddd" />
          <Text style={styles.emptyText}>Aucune inspection trouvée pour cette date.</Text>
        </View>
      ) : (
        <FlatList
          data={inspections}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    padding: 16,
    textTransform: 'capitalize',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
    marginRight: 10,
  },
  ficheName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  technicienName: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  chevron: {
    marginLeft: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },
});
