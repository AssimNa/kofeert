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
    setInspection(prev => {
      const newResultats = { ...prev.resultats };
      if (resultat === null) {
        delete newResultats[itemId];
      } else {
        newResultats[itemId] = resultat;
      }
      return {
        ...prev,
        resultats: newResultats
      };
    });
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

  const submitInspection = useCallback(async (fiche) => {
    try {
      const resultatsPayload = Object.keys(inspection.resultats).map(itemIdStr => {
        const itemId = parseInt(itemIdStr);
        
        let mesuresForItem = [];
        if (fiche && fiche.sections) {
          for (const section of fiche.sections) {
            const item = section.items?.find(i => i.id === itemId);
            if (item && item.item_mesures) {
              item.item_mesures.forEach(m => {
                  const valStr = inspection.mesures[m.id];
                  if (valStr !== undefined && valStr !== null && valStr.trim() !== '') {
                    const parsed = parseFloat(valStr.toString().replace(',', '.'));
                    if (!isNaN(parsed)) {
                      mesuresForItem.push({
                        item_mesure_id: m.id,
                        valeur: parsed
                      });
                    }
                  }
              });
              break;
            }
          }
        }

        return {
          item_id: itemId,
          resultat: inspection.resultats[itemId],
          remarque: inspection.remarques[itemId] || null,
          mesures: mesuresForItem
        };
      });

      const payload = {
        resultats: resultatsPayload
      };

      const response = await api.post(`/inspections/${ficheId}/submit`, payload);
      await deleteFicheBrouillon(ficheId);
      return { success: true, data: response.data };
    } catch (error) {
      if (!error.response && error.request) {
        // Network Error -> Offline Sync
        await addToSyncQueue(ficheId);
        await deleteFicheBrouillon(ficheId);
        return { success: true, offline: true, message: "Enregistré hors ligne" };
      }
      
      let errorMsg = 'Erreur de soumission';
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMsg = error.response.data.detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join('\n');
        } else {
          errorMsg = error.response.data.detail;
        }
      }
      
      return { 
        success: false, 
        error: errorMsg
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
