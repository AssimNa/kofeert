import { useState, useCallback } from 'react';
import api from '../services/api';
import { saveFicheBrouillon, getFicheBrouillon, deleteFicheBrouillon, addToSyncQueue } from '../services/storage';

export function useInspection(ficheId) {
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadInspection = useCallback(async () => {
    setLoading(true);
    try {
      const draft = await getFicheBrouillon(ficheId);
      if (draft) {
        setInspection(draft);
        setLoading(false);
        return;
      }

      // Fetch the actual template from the backend
      const response = await api.get(`/fiches/${ficheId}`);
      const fiche = response.data;
      
      const newInspection = {
        fiche_id: ficheId,
        resultats: {},
        mesures: {},
        remarques: {}
      };
      
      setInspection(newInspection);
    } catch (error) {
      console.error('Erreur load inspection:', error);
    } finally {
      setLoading(false);
    }
  }, [ficheId]);

  const updateResult = useCallback((itemId, resultat) => {
    setInspection(prev => ({
      ...prev,
      resultats: { ...prev.resultats, [itemId]: resultat }
    }));
  }, []);

  const updateMesure = useCallback((itemMesureId, valeur) => {
    setInspection(prev => ({
      ...prev,
      mesures: { ...prev.mesures, [itemMesureId]: valeur }
    }));
  }, []);

  const updateRemarque = useCallback((itemId, remarque) => {
    setInspection(prev => ({
      ...prev,
      remarques: { ...prev.remarques, [itemId]: remarque }
    }));
  }, []);

  const saveBrouillon = useCallback(async () => {
    if (!inspection) return;
    setIsSaving(true);
    try {
      await saveFicheBrouillon(ficheId, inspection);
    } catch (error) {
      console.error('Erreur save brouillon:', error);
    } finally {
      setIsSaving(false);
    }
  }, [inspection, ficheId]);

  const submitInspection = useCallback(async () => {
    try {
      const payload = {
        fiche_template_id: ficheId,
        resultats: Object.keys(inspection.resultats).map(itemId => ({
          item_id: parseInt(itemId),
          resultat: inspection.resultats[itemId],
          remarque: inspection.remarques[itemId] || null
        })),
        mesures: Object.keys(inspection.mesures).map(mesureId => ({
          mesure_id: parseInt(mesureId),
          valeur: parseFloat(inspection.mesures[mesureId])
        }))
      };

      const response = await api.post(`/inspections/${ficheId}/submit`, payload);
      await deleteFicheBrouillon(ficheId);
      return { success: true, data: response.data };
    } catch (error) {
      if (!error.response && error.request) {
        // Network Error -> Offline Sync
        await addToSyncQueue(ficheId);
        return { success: true, offline: true, message: "Enregistré hors ligne" };
      }
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Erreur de soumission' 
      };
    }
  }, [inspection, ficheId]);

  return {
    inspection,
    loading,
    isSaving,
    loadInspection,
    updateResult,
    updateMesure,
    updateRemarque,
    saveBrouillon,
    submitInspection
  };
}
