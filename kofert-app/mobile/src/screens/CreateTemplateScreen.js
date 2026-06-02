import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import Colors from '../constants/colors';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

export default function CreateTemplateScreen({ route, navigation }) {
  const { editingFicheId } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [equipements, setEquipements] = useState([]);
  
  // Form State
  const [equipementId, setEquipementId] = useState('');
  const [nom, setNom] = useState('');
  const [reference, setReference] = useState('');
  
  const [sections, setSections] = useState([
    {
      titre: 'Général',
      ordre: 0,
      items: [
        { equipement_label: '', controle_description: '', type: 'binaire' }
      ]
    }
  ]);

  useEffect(() => {
    fetchEquipements();
    if (editingFicheId) {
      fetchFicheToEdit();
    }
    
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handlePdfImport} disabled={isImporting} style={{ padding: 8, flexDirection: 'row', alignItems: 'center' }}>
          {isImporting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="document-text" size={20} color="#fff" />
              <Text style={{ color: '#fff', marginLeft: 4, fontWeight: 'bold' }}>Importer PDF</Text>
            </>
          )}
        </TouchableOpacity>
      )
    });
  }, [navigation, isImporting, editingFicheId]);

  const handlePdfImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      setIsImporting(true);
      const file = result.assets[0];

      // Prepare form data for upload
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? file.uri : file.uri.replace('file://', ''),
        type: 'application/pdf',
        name: file.name || 'template.pdf'
      });

      const res = await api.post('/admin/fiches/import-pdf', formData);

      setNom(file.name.replace('.pdf', ''));
      setReference('');
      setEquipementId('');
      if (res.data.sections && res.data.sections.length > 0) {
        setSections(res.data.sections);
      }
      
      Alert.alert('Succès', 'PDF importé avec succès. Veuillez vérifier et compléter la fiche.');
    } catch (err) {
      console.error('Erreur import PDF:', err);
      Alert.alert('Erreur', "Impossible d'importer le PDF: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsImporting(false);
    }
  };

  const fetchFicheToEdit = async () => {
    try {
      const res = await api.get(`/fiches/${editingFicheId}`);
      const fiche = res.data;
      setNom(fiche.nom);
      setReference(fiche.reference);
      setEquipementId(fiche.equipement_id ? fiche.equipement_id.toString() : '');
      if (fiche.sections && fiche.sections.length > 0) {
        setSections(fiche.sections.map(s => ({
          ...s,
          items: s.items.map(i => ({...i}))
        })));
      }
    } catch (err) {
      console.error('Erreur chargement fiche pour edition', err);
    }
  };

  const fetchEquipements = async () => {
    try {
      const res = await api.get('/admin/equipements');
      setEquipements(res.data);
      if (res.data.length > 0) {
        setEquipementId(res.data[0].id.toString());
      }
    } catch (err) {
      console.error('Erreur chargement equipements', err);
    }
  };

  const addSection = () => {
    setSections([
      ...sections,
      {
        titre: `Section ${sections.length + 1}`,
        ordre: sections.length,
        items: [{ equipement_label: '', controle_description: '', type: 'binaire' }]
      }
    ]);
  };

  const addItemToSection = (sectionIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].items.push({
      equipement_label: '',
      controle_description: '',
      type: 'binaire'
    });
    setSections(newSections);
  };

  const updateItem = (sectionIndex, itemIndex, field, value) => {
    const newSections = [...sections];
    newSections[sectionIndex].items[itemIndex][field] = value;
    setSections(newSections);
  };

  const updateSectionTitle = (sectionIndex, value) => {
    const newSections = [...sections];
    newSections[sectionIndex].titre = value;
    setSections(newSections);
  };

  const removeItem = (sectionIndex, itemIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].items.splice(itemIndex, 1);
    setSections(newSections);
  };

  const submitForm = async () => {
    if (!nom || !reference || !equipementId) {
      if (Platform.OS === 'web') {
        window.alert('Veuillez remplir tous les champs principaux.');
      } else {
        Alert.alert('Erreur', 'Veuillez remplir tous les champs principaux.');
      }
      return;
    }

    const payload = {
      equipement_id: parseInt(equipementId),
      nom,
      reference,
      sections: sections.map((sec, sIdx) => ({
        titre: sec.titre || `Section ${sIdx + 1}`,
        ordre: sec.ordre,
        items: sec.items.map((item, iIdx) => ({
          equipement_label: item.equipement_label || `Item ${iIdx + 1}`,
          controle_description: item.controle_description || '',
          type: item.type,
          ordre: iIdx
        }))
      }))
    };

    setLoading(true);
    try {
      if (editingFicheId) {
        await api.put(`/admin/fiches/${editingFicheId}`, payload);
      } else {
        await api.post('/admin/fiches', payload);
      }
      if (Platform.OS === 'web') {
        window.alert(`La fiche a été ${editingFicheId ? 'modifiée' : 'publiée'} avec succès.`);
        navigation.goBack();
      } else {
        Alert.alert('Succès', `La fiche a été ${editingFicheId ? 'modifiée' : 'publiée'} avec succès.`, [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (err) {
      console.error('Erreur creation fiche:', err.response?.data || err.message);
      if (Platform.OS === 'web') {
        window.alert(`Impossible de ${editingFicheId ? 'modifier' : 'publier'} la fiche: ${err.response?.data?.detail || err.message}`);
      } else {
        Alert.alert('Erreur', `Impossible de ${editingFicheId ? 'modifier' : 'publier'} la fiche: ${err.response?.data?.detail || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView style={styles.scrollContent}>
        
        {/* Info Générales */}
        <View style={styles.card}>
          <Text style={styles.label}>ÉQUIPEMENT CIBLE</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={equipementId}
              onValueChange={(itemValue) => setEquipementId(itemValue)}
              style={styles.picker}
            >
              {equipements.map(eq => (
                <Picker.Item key={eq.id} label={eq.nom} value={eq.id.toString()} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>NOM DE LA FICHE</Text>
          <TextInput
            style={styles.input}
            placeholder="ex: Maintenance Mensuelle"
            value={nom}
            onChangeText={setNom}
          />

          <Text style={styles.label}>RÉFÉRENCE</Text>
          <TextInput
            style={styles.input}
            placeholder="ex: REF-MAIN-001"
            value={reference}
            onChangeText={setReference}
          />
        </View>

        <View style={styles.architectureHeader}>
          <Text style={styles.architectureTitle}>Architecture de la Fiche</Text>
          <TouchableOpacity onPress={addSection}>
            <Text style={styles.addSectionText}>+ Ajouter une section</Text>
          </TouchableOpacity>
        </View>

        {/* Sections */}
        {sections.map((section, sIdx) => (
          <View key={sIdx} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{sIdx + 1}</Text>
              </View>
              <TextInput
                style={styles.sectionTitleInput}
                value={section.titre}
                onChangeText={(val) => updateSectionTitle(sIdx, val)}
                placeholder="Titre de la section"
              />
            </View>

            {section.items.map((item, iIdx) => (
              <View key={iIdx} style={styles.itemRow}>
                <TextInput
                  style={[styles.input, styles.itemInput, { flex: 1 }]}
                  placeholder="Label (ex: Niveau d'huile)"
                  value={item.equipement_label}
                  onChangeText={(val) => updateItem(sIdx, iIdx, 'equipement_label', val)}
                />
                <TextInput
                  style={[styles.input, styles.itemInput, { flex: 1.5 }]}
                  placeholder="Description du contrôle"
                  value={item.controle_description}
                  onChangeText={(val) => updateItem(sIdx, iIdx, 'controle_description', val)}
                />
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>OK / KO</Text>
                </View>
                <TouchableOpacity onPress={() => removeItem(sIdx, iIdx)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={20} color="#ccc" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity onPress={() => addItemToSection(sIdx)} style={styles.addItemBtn}>
              <Text style={styles.addItemText}>+ Ajouter un point de contrôle</Text>
            </TouchableOpacity>
          </View>
        ))}

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={submitForm} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Publier la Fiche</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContent: {
    padding: 16,
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
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  picker: {
    height: 50,
  },
  architectureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  architectureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  addSectionText: {
    color: '#28A745',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionBadge: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionBadgeText: {
    fontWeight: 'bold',
    color: '#666',
  },
  sectionTitleInput: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  itemInput: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  typeBadge: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  typeBadgeText: {
    fontSize: 12,
    color: '#666',
  },
  deleteBtn: {
    padding: 4,
  },
  addItemBtn: {
    marginTop: 10,
  },
  addItemText: {
    color: '#999',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#28A745',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
