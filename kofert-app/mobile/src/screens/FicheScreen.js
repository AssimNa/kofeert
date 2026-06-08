import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInspection } from '../hooks/useInspection';
import ChecklistItem from '../components/ChecklistItem';
import ProgressBar from '../components/ProgressBar';
import Colors from '../constants/colors';
import api from '../services/api';

export default function FicheScreen({ route, navigation }) {
  const { ficheId, ficheName } = route.params;
  const { inspection, loading, updateResult, updateMesure, updateRemarque, submitInspection, saveBrouillon, loadInspection } = useInspection(ficheId);
  const [fiche, setFiche] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);

  useEffect(() => {
    loadFicheTemplate();
    loadInspection();
  }, [ficheId]);

  useEffect(() => {
    if (inspection && autoSaveTimer) {
      clearInterval(autoSaveTimer);
    }

    const timer = setInterval(() => {
      saveBrouillon();
    }, 30000);

    setAutoSaveTimer(timer);

    return () => clearInterval(timer);
  }, [inspection]);

  const loadFicheTemplate = async () => {
    try {
      const response = await api.get(`/fiches/${ficheId}`);
      setFiche(response.data);
    } catch (error) {
      console.error('Erreur load fiche:', error);
    }
  };

  const countFilledPoints = () => {
    if (!inspection) return 0;
    return Object.keys(inspection.resultats).length;
  };

  const getTotalPoints = () => {
    if (!fiche) return 0;
    let count = 0;
    fiche.sections?.forEach(section => {
      section.items?.forEach(() => count++);
    });
    return count;
  };

  const handleSubmit = async () => {
    const total = getTotalPoints();
    const filled = countFilledPoints();

    if (filled < total) {
      Alert.alert('Incomplète', `Veuillez remplir tous les ${total} points avant d'envoyer.`);
      return;
    }

    Alert.alert(
      'Confirmation',
      "Êtes-vous sûr ? Cette fiche ne pourra plus être modifiée après l'envoi.",
      [
        { text: 'Annuler', onPress: () => { } },
        {
          text: 'Confirmer et envoyer',
          onPress: async () => {
            setSubmitting(true);
            const result = await submitInspection(fiche);
            setSubmitting(false);

            if (result.success) {
              Alert.alert('Succès', result.offline ? result.message : 'Fiche envoyée au superviseur', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } else {
              Alert.alert('Erreur', result.error);
            }
          },
        },
      ]
    );
  };

  if (loading || !fiche) {
    return <ActivityIndicator size="large" color={Colors.green} />;
  }

  const filled = countFilledPoints();
  const total = getTotalPoints();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll}>
        {fiche.sections?.map((section, sectionIdx) => (
          <View key={sectionIdx}>
            <Text style={styles.sectionTitle}>📍 {section.titre}</Text>

            {section.items?.map((item, itemIdx) => (
              <ChecklistItem
                key={itemIdx}
                item={item}
                result={inspection?.resultats[item.id]}
                mesures={inspection?.mesures || {}}
                remarque={inspection?.remarques[item.id] || ''}
                onResultChange={(result) => updateResult(item.id, result)}
                onMesureChange={(mesureId, value) => updateMesure(mesureId, value)}
                onRemarqueChange={(remarque) => updateRemarque(item.id, remarque)}
              />
            ))}
          </View>
        ))}

        <ProgressBar filled={filled} total={total} />

        {Object.values(inspection?.resultats || {}).some(r => r === 'non_conforme') && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>⚠️ ANOMALIE DÉTECTÉE</Text>
            <Text style={styles.warningSubtext}>
              {Object.values(inspection.resultats).filter(r => r === 'non_conforme').length} point(s) non-conforme(s)
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.submitButton,
            filled < total && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={filled < total || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              ENVOYER AU SUPERVISEUR
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 18,
    marginBottom: 10,
  },
  warningBox: {
    backgroundColor: '#FCEBEB',
    borderWidth: 0.5,
    borderColor: '#F09595',
    borderRadius: 8,
    padding: 12,
    marginVertical: 16,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#791F1F',
  },
  warningSubtext: {
    fontSize: 12,
    color: '#A32D2D',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: Colors.green,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginVertical: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  spacer: {
    height: 50,
  },
});
