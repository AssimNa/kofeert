import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { ListChecks, Plus, Trash2, ChevronRight, Package, Layout as SectionIcon, CheckCircle2, X, Save, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FicheManagement = () => {
  const navigate = useNavigate();
  const [fiches, setFiches] = useState([]);
  const [equipements, setEquipements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick Add Equipment State
  const [isEqModalOpen, setIsEqModalOpen] = useState(false);
  const [newEq, setNewEq] = useState({ nom: '', code: '', site: '', local: '', superviseur_id: '' });
  const [supervisors, setSupervisors] = useState([]);

  // Form State for Fiche
  const [newFiche, setNewFiche] = useState({
    nom: '',
    reference: '',
    equipement_id: '',
    sections: [
      { titre: 'Général', ordre: 0, items: [{ equipement_label: '', controle_description: '', type: 'ok_ko', ordre: 0 }] }
    ]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [fRes, eRes, uRes] = await Promise.all([
        api.get('/fiches/'),
        api.get('/admin/equipements'),
        api.get('/admin/users')
      ]);
      setFiches(fRes.data);
      setEquipements(eRes.data);
      setSupervisors(uRes.data.filter(u => u.role === 'superviseur'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addSection = () => {
    setNewFiche({
      ...newFiche,
      sections: [...newFiche.sections, { titre: '', ordre: newFiche.sections.length, items: [] }]
    });
  };

  const addItem = (sIdx) => {
    const sections = [...newFiche.sections];
    sections[sIdx].items.push({ equipement_label: '', controle_description: '', type: 'ok_ko', ordre: sections[sIdx].items.length });
    setNewFiche({ ...newFiche, sections });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/admin/fiches', newFiche);
      setIsModalOpen(false);
      fetchData();
      alert("Fiche créée avec succès !");
    } catch (err) {
      alert("Erreur lors de la création de la fiche");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateEq = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/equipements', {
        ...newEq,
        superviseur_id: parseInt(newEq.superviseur_id)
      });
      setEquipements([...equipements, res.data]);
      setNewFiche({...newFiche, equipement_id: res.data.id});
      setIsEqModalOpen(false);
      setNewEq({ nom: '', code: '', site: '', local: '', superviseur_id: '' });
    } catch (err) {
      alert("Erreur lors de la création de l'équipement");
    }
  };

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-kofert-green"></div></div>;

  return (
    <div className="space-y-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-kofert-dark transition-colors font-medium"
      >
        <ArrowLeft size={18} />
        Retour
      </button>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-kofert-dark">Configuration des Fiches</h1>
          <p className="text-gray-500 mt-2 text-lg">Créez et personnalisez les check-lists d'inspection par équipement.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2 self-start"
        >
          <Plus size={20} />
          <span>Nouvelle Fiche Template</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fiches.map((fiche) => (
          <motion.div 
            whileHover={{ y: -5 }}
            key={fiche.id} 
            className="card bg-white hover:border-kofert-green/30 cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-kofert-green/10 text-kofert-green rounded-xl flex items-center justify-center">
                <ListChecks size={24} />
              </div>
              <span className="text-xs font-black text-gray-300 uppercase tracking-widest">v{fiche.version || 1}</span>
            </div>
            <h3 className="font-bold text-xl text-kofert-dark group-hover:text-kofert-green transition-colors">{fiche.nom}</h3>
            <p className="text-sm text-gray-400 mt-1">Réf: {fiche.reference}</p>
            <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400">{fiche.sections?.length || 0} Sections</span>
              <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1 transition-all" />
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] overflow-y-auto py-10 px-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl mx-auto p-10"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black text-kofert-dark tracking-tight">Configuration de la Check-list</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-10">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-2xl">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Équipement Cible</label>
                      <button 
                        type="button" 
                        onClick={() => setIsEqModalOpen(true)}
                        className="text-[10px] font-bold text-kofert-green hover:underline"
                      >
                        + Nouveau
                      </button>
                    </div>
                    <select 
                      required
                      className="input-field"
                      value={newFiche.equipement_id}
                      onChange={e => setNewFiche({...newFiche, equipement_id: e.target.value})}
                    >
                      <option value="">Sélectionner...</option>
                      {equipements.map(eq => <option key={eq.id} value={eq.id}>{eq.nom} ({eq.code})</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nom de la Fiche</label>
                      <input 
                        required
                        className="input-field"
                        placeholder="ex: Maintenance Mensuelle T1"
                        value={newFiche.nom}
                        onChange={e => setNewFiche({...newFiche, nom: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Référence</label>
                      <input 
                        required
                        className="input-field"
                        placeholder="ex: REF-MAIN-001"
                        value={newFiche.reference}
                        onChange={e => setNewFiche({...newFiche, reference: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Sections Builder */}
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-kofert-dark">Architecture de la Fiche</h3>
                    <button type="button" onClick={addSection} className="text-kofert-green font-bold text-sm flex items-center gap-1 hover:underline">
                      <Plus size={16} /> Ajouter une section
                    </button>
                  </div>

                  {newFiche.sections.map((section, sIdx) => (
                    <div key={sIdx} className="border border-gray-100 rounded-2xl p-6 space-y-6 relative group/section">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 font-bold text-xs">{sIdx + 1}</div>
                        <input 
                          required
                          className="text-lg font-bold bg-transparent border-b border-transparent focus:border-kofert-green outline-none w-full"
                          placeholder="Titre de la section..."
                          value={section.titre}
                          onChange={e => {
                            const sections = [...newFiche.sections];
                            sections[sIdx].titre = e.target.value;
                            setNewFiche({ ...newFiche, sections });
                          }}
                        />
                      </div>

                      <div className="space-y-4 pl-12">
                        {section.items.map((item, iIdx) => (
                          <div key={iIdx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-gray-50/50 p-4 rounded-xl relative group/item">
                            <div className="md:col-span-4 space-y-1">
                              <input 
                                required
                                className="input-field !py-2 !text-sm"
                                placeholder="Label (ex: Niveau d'huile)"
                                value={item.equipement_label}
                                onChange={e => {
                                  const sections = [...newFiche.sections];
                                  sections[sIdx].items[iIdx].equipement_label = e.target.value;
                                  setNewFiche({ ...newFiche, sections });
                                }}
                              />
                            </div>
                            <div className="md:col-span-5 space-y-1">
                              <input 
                                required
                                className="input-field !py-2 !text-sm"
                                placeholder="Description du contrôle"
                                value={item.controle_description}
                                onChange={e => {
                                  const sections = [...newFiche.sections];
                                  sections[sIdx].items[iIdx].controle_description = e.target.value;
                                  setNewFiche({ ...newFiche, sections });
                                }}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <select 
                                className="input-field !py-2 !text-sm appearance-none"
                                value={item.type}
                                onChange={e => {
                                  const sections = [...newFiche.sections];
                                  sections[sIdx].items[iIdx].type = e.target.value;
                                  setNewFiche({ ...newFiche, sections });
                                }}
                              >
                                <option value="ok_ko">OK / KO</option>
                                <option value="numerique">Numérique</option>
                              </select>
                            </div>
                            <div className="md:col-span-1 flex justify-end">
                              <button 
                                type="button"
                                onClick={() => {
                                  const sections = [...newFiche.sections];
                                  sections[sIdx].items.splice(iIdx, 1);
                                  setNewFiche({ ...newFiche, sections });
                                }}
                                className="text-gray-300 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        ))}
                        <button 
                          type="button" 
                          onClick={() => addItem(sIdx)}
                          className="text-gray-400 font-medium text-sm flex items-center gap-1 hover:text-kofert-green transition-colors"
                        >
                          <Plus size={16} /> Ajouter un point de contrôle
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-10 border-t border-gray-100">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-8 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] btn-primary py-4 shadow-xl shadow-kofert-green/30"
                  >
                    {isSubmitting ? "Création du template..." : "Publier la Fiche"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Add Equipment Modal */}
      <AnimatePresence>
        {isEqModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-md:w-full max-w-md p-8"
            >
              <h2 className="text-2xl font-bold mb-6">Nouvel Équipement</h2>
              <form onSubmit={handleCreateEq} className="space-y-4">
                <input required className="input-field" placeholder="Nom" value={newEq.nom} onChange={e => setNewEq({...newEq, nom: e.target.value})} />
                <input required className="input-field" placeholder="Code" value={newEq.code} onChange={e => setNewEq({...newEq, code: e.target.value})} />
                <input required className="input-field" placeholder="Site" value={newEq.site} onChange={e => setNewEq({...newEq, site: e.target.value})} />
                <input required className="input-field" placeholder="Localisation" value={newEq.local} onChange={e => setNewEq({...newEq, local: e.target.value})} />
                <select required className="input-field" value={newEq.superviseur_id} onChange={e => setNewEq({...newEq, superviseur_id: e.target.value})}>
                  <option value="">Superviseur...</option>
                  {supervisors.map(s => <option key={s.id} value={s.id}>{s.prenom} {s.nom}</option>)}
                </select>
                <div className="flex gap-4 mt-6">
                  <button type="button" onClick={() => setIsEqModalOpen(false)} className="flex-1 py-2 font-bold text-gray-400">Annuler</button>
                  <button type="submit" className="flex-1 btn-primary">Créer</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FicheManagement;
