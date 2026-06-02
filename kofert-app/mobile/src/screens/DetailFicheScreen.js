import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import Colors from '../constants/colors';

export default function DetailFicheScreen({ route, navigation }) {
  const { inspectionId } = route.params;
  const [inspection, setInspection] = useState(null);
  const [fiche, setFiche] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    fetchData();
  }, [inspectionId]);

  const fetchData = async () => {
    try {
      const insRes = await api.get(`/inspections/${inspectionId}`);
      setInspection(insRes.data);
      const ficheRes = await api.get(`/fiches/${insRes.data.fiche_template_id}`);
      setFiche(ficheRes.data);
    } catch (error) {
      console.error('Error fetching detail data', error);
      Alert.alert('Erreur', 'Impossible de charger les détails.');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !inspection || !fiche) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.green} />
      </SafeAreaView>
    );
  }

  const currentSection = fiche.sections[activeSection];
  const isGlobalConforme = inspection.resultats.every(r => r.resultat === 'conforme');

  const getItemResult = (itemId) => {
    return inspection.resultats.find(r => r.item_id === itemId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{fiche.nom}</Text>
          <Text style={styles.headerSubtitle}>{fiche.reference} • Lecture seule</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll}>
        {/* Banner */}
        <View style={[styles.banner, isGlobalConforme ? styles.bannerSuccess : styles.bannerDanger]}>
          <Ionicons 
            name={isGlobalConforme ? "checkmark-circle" : "warning"} 
            size={40} 
            color={isGlobalConforme ? Colors.green : Colors.orange} 
          />
          <View style={styles.bannerTextContainer}>
            <Text style={[styles.bannerTitle, { color: isGlobalConforme ? Colors.green : Colors.orange }]}>
              Inspection {isGlobalConforme ? 'Conforme' : 'Non Conforme'}
            </Text>
            <Text style={styles.bannerSubtitle}>
              Soumise le {new Date(inspection.soumis_le || inspection.date_inspection).toLocaleDateString('fr-FR')}
            </Text>
          </View>
        </View>

        {/* Section Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
          {fiche.sections.map((section, i) => {
            const hasAnomaly = section.items.some(item => {
              const res = getItemResult(item.id);
              return res && res.resultat === 'non_conforme';
            });

            return (
              <TouchableOpacity
                key={section.id || i}
                onPress={() => setActiveSection(i)}
                style={[
                  styles.tab,
                  activeSection === i ? styles.tabActive : styles.tabInactive
                ]}
              >
                <Text style={activeSection === i ? styles.tabTextActive : styles.tabTextInactive}>
                  {i + 1}. {section.titre}
                </Text>
                {hasAnomaly && <View style={styles.anomalyDot} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Items List */}
        <View style={styles.itemsContainer}>
          <Text style={styles.sectionTitle}>{currentSection.titre}</Text>

          {currentSection.items.map((item, idx) => {
            const res = getItemResult(item.id);
            const isConforme = res?.resultat === 'conforme';

            return (
              <View key={item.id || idx} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <Text style={styles.itemOrder}>{item.ordre}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemLabel}>{item.equipement_label}</Text>
                      <Text style={styles.itemDesc}>{item.controle_description}</Text>
                    </View>
                  </View>
                  {res ? (
                    <View style={[styles.statusBadge, isConforme ? styles.statusBadgeSuccess : styles.statusBadgeDanger]}>
                      <Ionicons name={isConforme ? "checkmark" : "warning"} size={14} color={isConforme ? Colors.green : Colors.orange} />
                      <Text style={[styles.statusBadgeText, { color: isConforme ? Colors.green : Colors.orange }]}>
                        {isConforme ? 'Conforme' : 'Anomalie'}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.statusBadgeInactive}>
                      <Text style={styles.statusBadgeTextInactive}>Non renseigné</Text>
                    </View>
                  )}
                </View>

                {item.type === 'numerique' && item.mesures?.length > 0 && (
                  <View style={styles.mesuresContainer}>
                    <Text style={styles.mesuresTitle}>MESURES ENREGISTRÉES</Text>
                    {item.mesures.map((mes) => {
                      const mVal = res?.mesures_valeurs?.find(mv => mv.item_mesure_id === mes.id);
                      return (
                        <View key={mes.id} style={styles.mesureRow}>
                          <Text style={styles.mesureLabel}>{mes.label}</Text>
                          <Text style={styles.mesureValue}>{mVal ? `${mVal.valeur} ${mes.unite}` : 'N/A'}</Text>
                        </View>
                      );
                    })}
                  </View>
                )}

                {res?.remarque ? (
                  <View style={styles.remarqueBox}>
                    <Ionicons name="information-circle" size={18} color="#C05621" style={{ marginTop: 2 }} />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.remarqueTitle}>REMARQUE</Text>
                      <Text style={styles.remarqueText}>{res.remarque}</Text>
                    </View>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity
          disabled={activeSection === 0}
          onPress={() => setActiveSection(prev => prev - 1)}
          style={[styles.footerBtn, activeSection === 0 && { opacity: 0.3 }]}
        >
          <Text style={styles.footerBtnText}>Précédent</Text>
        </TouchableOpacity>
        <Text style={styles.footerProgress}>
          Section {activeSection + 1} / {fiche.sections.length}
        </Text>
        <TouchableOpacity
          disabled={activeSection === fiche.sections.length - 1}
          onPress={() => setActiveSection(prev => prev + 1)}
          style={[styles.footerBtn, activeSection === fiche.sections.length - 1 && { opacity: 0.3 }]}
        >
          <Text style={[styles.footerBtnText, { color: '#333' }]}>Suivant</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backBtn: { padding: 4, marginRight: 10 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  headerSubtitle: { fontSize: 13, color: '#999', marginTop: 2 },
  scroll: { padding: 16 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  bannerSuccess: { backgroundColor: '#F0FFF4', borderColor: '#C6F6D5' },
  bannerDanger: { backgroundColor: '#FFF5F5', borderColor: '#FED7D7' },
  bannerTextContainer: { marginLeft: 16, flex: 1 },
  bannerTitle: { fontSize: 18, fontWeight: 'bold' },
  bannerSubtitle: { fontSize: 12, color: '#666', marginTop: 4 },
  tabsContainer: { marginBottom: 20, paddingBottom: 10 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  tabActive: { backgroundColor: '#333', borderColor: '#333' },
  tabInactive: { backgroundColor: '#fff', borderColor: '#eee' },
  tabTextActive: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  tabTextInactive: { color: '#666', fontWeight: 'bold', fontSize: 14 },
  anomalyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.orange, marginLeft: 8 },
  itemsContainer: { marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 16, paddingHorizontal: 4 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#eee' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitleContainer: { flexDirection: 'row', flex: 1, marginRight: 10 },
  itemOrder: { width: 24, height: 24, backgroundColor: '#f0f0f0', borderRadius: 6, textAlign: 'center', lineHeight: 24, fontSize: 12, fontWeight: 'bold', color: '#999', marginRight: 10, marginTop: 2 },
  itemLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  itemDesc: { fontSize: 13, color: '#666', marginTop: 4 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  statusBadgeSuccess: { backgroundColor: '#F0FFF4' },
  statusBadgeDanger: { backgroundColor: '#FFF5F5' },
  statusBadgeText: { fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  statusBadgeInactive: { backgroundColor: '#f5f5f5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  statusBadgeTextInactive: { fontSize: 12, fontWeight: 'bold', color: '#999' },
  mesuresContainer: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  mesuresTitle: { fontSize: 11, fontWeight: 'bold', color: Colors.green, marginBottom: 10 },
  mesureRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8, marginBottom: 8 },
  mesureLabel: { fontSize: 13, color: '#666', fontWeight: '600' },
  mesureValue: { fontSize: 14, fontWeight: 'bold', color: '#333', backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#eee' },
  remarqueBox: { flexDirection: 'row', backgroundColor: '#FFFAF0', padding: 12, borderRadius: 8, marginTop: 16, borderWidth: 1, borderColor: '#FEEBC8' },
  remarqueTitle: { fontSize: 10, fontWeight: 'bold', color: '#C05621', marginBottom: 4 },
  remarqueText: { fontSize: 13, color: '#9C4221' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderTopWidth: 1, borderTopColor: '#eee' },
  footerBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#f0f0f0' },
  footerBtnText: { fontWeight: 'bold', color: '#666' },
  footerProgress: { fontSize: 12, fontWeight: 'bold', color: '#999' },
});
