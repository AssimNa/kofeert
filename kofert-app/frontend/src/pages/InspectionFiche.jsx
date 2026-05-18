import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { ChevronLeft, Save, Send, AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InspectionFiche = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fiche, setFiche] = useState(null);
  const [inspectionId, setInspectionId] = useState(null);
  const [inspectionStatut, setInspectionStatut] = useState(null);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ficheRes, inspectionRes] = await Promise.all([
          api.get(`/fiches/${id}`),
          api.post('/inspections/', { fiche_template_id: id })
        ]);
        setFiche(ficheRes.data);
        setInspectionId(inspectionRes.data.id);
        setInspectionStatut(inspectionRes.data.statut);
        
        // Load saved draft results — only if inspection is still a draft
        const initialResults = {};
        if (inspectionRes.data.statut === 'brouillon' && inspectionRes.data.resultats && inspectionRes.data.resultats.length > 0) {
          inspectionRes.data.resultats.forEach(res => {
            // Only restore items that have an explicit status saved
            if (res.resultat) {
              initialResults[res.item_id] = {
                status: res.resultat,
                remarque: res.remarque || '',
                mesures: (res.mesures_valeurs || []).map(mv => ({
                  item_mesure_id: mv.item_mesure_id,
                  valeur: mv.valeur
                }))
              };
            }
          });
        }
        setResults(initialResults);
      } catch (error) {
        console.error("Error fetching inspection data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleResultChange = (itemId, field, value) => {
    setResults(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const calculateProgress = () => {
    if (!fiche) return 0;
    const totalItems = fiche.sections.reduce((acc, s) => acc + s.items.length, 0);
    const completedItems = Object.keys(results).length;
    return Math.round((completedItems / totalItems) * 100);
  };

  const handleSave = async () => {
    if (!inspectionId || inspectionStatut === 'soumise') return;
    setSaving(true);
    try {
      const data = {
        // Only save items with an explicit user-selected status (avoid phantom 'conforme')
        resultats: Object.entries(results)
          .filter(([_, res]) => res.status)
          .map(([itemId, res]) => ({
            item_id: parseInt(itemId),
            resultat: res.status,
            remarque: res.remarque || '',
            mesures: res.mesures || []
          }))
      };
      await api.put(`/inspections/${inspectionId}`, data);
    } catch (error) {
      console.error("Save failed", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!inspectionId || !fiche) return;

    // If already submitted, just go home
    if (inspectionStatut === 'soumise') {
      navigate('/');
      return;
    }

    // --- Validation avant soumission ---
    const allItems = fiche.sections.flatMap(s => s.items);
    const missingItems = allItems.filter(item => !results[item.id]?.status);
    if (missingItems.length > 0) {
      alert(`⚠️ Check-list incomplète !\n\n${missingItems.length} point(s) non rempli(s) :\n${missingItems.map(i => `• ${i.equipement_label}`).join('\n')}\n\nVeuillez remplir tous les points avant de soumettre.`);
      return;
    }

    setSubmitting(true);
    try {
      // 1. Save all results first
      const data = {
        resultats: Object.entries(results)
          .filter(([_, res]) => res.status)
          .map(([itemId, res]) => ({
            item_id: parseInt(itemId),
            resultat: res.status,
            remarque: res.remarque || '',
            mesures: res.mesures || []
          }))
      };
      await api.put(`/inspections/${inspectionId}`, data);

      // 2. Submit
      await api.post(`/inspections/${inspectionId}/submit`);
      navigate('/');
    } catch (error) {
      // Show the real backend error message
      const detail = error.response?.data?.detail;
      const status = error.response?.status;
      let message;
      if (status === 400 && detail === 'Déjà soumise') {
        // Already submitted — treat as success
        navigate('/');
        return;
      } else if (Array.isArray(detail)) {
        message = detail.map(d => d.msg).join('\n');
      } else {
        message = detail || `Erreur réseau (${error.message}). Vérifiez que le backend est bien démarré.`;
      }
      alert(`❌ ${message}`);
      console.error('Submit error:', { status, detail, raw: error.response?.data, msg: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !fiche) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-kofert-green" size={40} /></div>;

  const currentSection = fiche.sections[activeSection];
  const progress = calculateProgress();

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Already Submitted Banner */}
      {inspectionStatut === 'soumise' && (
        <div className="mb-6 flex items-center gap-3 bg-kofert-green/10 border border-kofert-green/30 rounded-2xl px-5 py-4">
          <CheckCircle className="text-kofert-green shrink-0" size={22} />
          <div>
            <p className="font-bold text-kofert-green text-sm">Inspection déjà soumise</p>
            <p className="text-xs text-gray-500 mt-0.5">Cette fiche a déjà été soumise aujourd'hui. Vous êtes en mode lecture seule.</p>
          </div>
          <button onClick={() => navigate('/')} className="ml-auto text-xs font-bold text-kofert-green border border-kofert-green/30 px-4 py-2 rounded-xl hover:bg-kofert-green hover:text-white transition-all">
            Retour
          </button>
        </div>
      )}

      <header className="mb-10 flex items-center justify-between sticky top-[65px] md:top-0 bg-kofert-gray/80 backdrop-blur-md z-10 py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-kofert-dark">{fiche.nom}</h1>
            <p className="text-sm text-gray-500 font-medium">{fiche.reference}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave} 
            disabled={saving || inspectionStatut === 'soumise'}
            className="flex items-center gap-2 px-4 py-2 text-kofert-green font-semibold hover:bg-kofert-green/5 rounded-xl transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            <span className="hidden sm:inline">Enregistrer</span>
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={submitting}
            className="btn-primary flex items-center gap-2 !px-5 !py-2.5"
          >
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            <span>Soumettre</span>
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="mb-10 space-y-2">
        <div className="flex justify-between text-sm font-bold">
          <span className="text-kofert-dark">Progression globale</span>
          <span className="text-kofert-green">{progress}%</span>
        </div>
        <div className="h-3 w-full bg-white rounded-full overflow-hidden border border-black/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-kofert-green shadow-[0_0_10px_rgba(29,158,117,0.3)]"
          />
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-8">
        {fiche.sections.map((section, i) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(i)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-xl font-bold text-sm transition-all border ${
              activeSection === i 
                ? 'bg-kofert-dark text-white border-kofert-dark shadow-lg shadow-kofert-dark/20' 
                : 'bg-white text-gray-500 border-black/5 hover:border-gray-300'
            }`}
          >
            {i + 1}. {section.titre}
          </button>
        ))}
      </div>

      {/* Items List */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <h2 className="text-xl font-bold text-kofert-dark px-2">{currentSection.titre}</h2>
        
        {currentSection.items.map((item) => (
          <div key={item.id} className="card !p-0 overflow-hidden group">
            <div className="p-6 space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-xs font-bold text-gray-400 group-hover:bg-kofert-green group-hover:text-white transition-colors shrink-0 mt-1">
                  {item.ordre}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-kofert-dark leading-snug">{item.equipement_label}</h3>
                  <p className="text-gray-500 text-sm mt-1 leading-relaxed">{item.controle_description}</p>
                </div>
              </div>

              {/* Input Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end pt-2 border-t border-gray-50">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleResultChange(item.id, 'status', 'conforme')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all border-2 ${
                      results[item.id]?.status === 'conforme'
                        ? 'bg-kofert-green/10 border-kofert-green text-kofert-green'
                        : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    <CheckCircle size={18} />
                    Conforme
                  </button>
                  <button
                    onClick={() => handleResultChange(item.id, 'status', 'non_conforme')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all border-2 ${
                      results[item.id]?.status === 'non_conforme'
                        ? 'bg-kofert-red/10 border-kofert-red text-kofert-red'
                        : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    <AlertTriangle size={18} />
                    Anomalie
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Remarque</label>
                  <input
                    type="text"
                    className="input-field !py-2.5 text-sm"
                    placeholder="Précisez si besoin..."
                    value={results[item.id]?.remarque || ''}
                    onChange={(e) => handleResultChange(item.id, 'remarque', e.target.value)}
                  />
                </div>
              </div>
              
              {/* Measurements if numeric */}
              {item.type === 'numerique' && item.mesures?.length > 0 && (
                <div className="pt-4 space-y-4">
                  <p className="text-xs font-bold text-kofert-green flex items-center gap-2">
                    <Info size={14} />
                    MESURES REQUISES
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {item.mesures.map((mes) => (
                      <div key={mes.id} className="space-y-2">
                        <label className="text-xs font-medium text-gray-500">{mes.label} ({mes.unite})</label>
                        <input
                          type="number"
                          className="input-field !py-2 text-sm"
                          value={results[item.id]?.mesures?.find(m => m.item_mesure_id === mes.id)?.valeur ?? ''}
                          onChange={(e) => {
                            const currentMesures = results[item.id]?.mesures || [];
                            const index = currentMesures.findIndex(m => m.item_mesure_id === mes.id);
                            const updatedMesures = [...currentMesures];
                            const rawVal = e.target.value;
                            const floatVal = rawVal === '' ? 0.0 : parseFloat(rawVal);
                            if (index >= 0) {
                              updatedMesures[index].valeur = floatVal;
                            } else {
                              updatedMesures.push({ item_mesure_id: mes.id, valeur: floatVal });
                            }
                            handleResultChange(item.id, 'mesures', updatedMesures);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 inset-x-0 md:left-72 bg-white/80 backdrop-blur-md border-t border-black/5 p-4 flex justify-between items-center z-10 shadow-2xl">
        <button
          disabled={activeSection === 0}
          onClick={() => setActiveSection(prev => prev - 1)}
          className="px-6 py-2.5 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-all"
        >
          Précédent
        </button>
        <span className="text-xs font-bold text-gray-400">Section {activeSection + 1} sur {fiche.sections.length}</span>
        <button
          disabled={activeSection === fiche.sections.length - 1}
          onClick={() => setActiveSection(prev => prev + 1)}
          className="px-6 py-2.5 rounded-xl font-bold text-sm text-kofert-dark hover:bg-gray-50 disabled:opacity-30 transition-all"
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

export default InspectionFiche;
