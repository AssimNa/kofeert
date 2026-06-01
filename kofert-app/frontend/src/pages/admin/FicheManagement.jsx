import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { ListChecks, Plus, Trash2, ChevronRight, Package, Layout as SectionIcon, CheckCircle2, X, Save, AlertCircle, ArrowLeft, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FicheManagement = () => {
  const navigate = useNavigate();
  const [fiches, setFiches] = useState([]);
  const [equipements, setEquipements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFicheView, setSelectedFicheView] = useState(null);
  const [editingFicheId, setEditingFicheId] = useState(null);
  const [ficheHistory, setFicheHistory] = useState([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handlePdfImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsImporting(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await api.post('/admin/fiches/import-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setEditingFicheId(null);
      setNewFiche({
        nom: file.name.replace('.pdf', ''),
        reference: '',
        equipement_id: '',
        sections: res.data.sections
      });
      setIsModalOpen(true);
    } catch (err) {
      alert("Erreur lors de l'importation du PDF: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsImporting(false);
      e.target.value = ''; // reset input
    }
  };

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
      { titre: 'Général', ordre: 0, items: [{ equipement_label: '', controle_description: '', type: 'binaire', ordre: 0 }] }
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
    sections[sIdx].items.push({ equipement_label: '', controle_description: '', type: 'binaire', ordre: sections[sIdx].items.length });
    setNewFiche({ ...newFiche, sections });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      ...newFiche,
      equipement_id: parseInt(newFiche.equipement_id)
    };

    try {
      if (editingFicheId) {
        await api.put(`/admin/fiches/${editingFicheId}`, payload);
        alert("Fiche modifiée avec succès ! (Nouvelle version créée)");
      } else {
        await api.post('/admin/fiches', payload);
        alert("Fiche créée avec succès !");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Erreur lors de l'enregistrement de la fiche: " + JSON.stringify(err.response?.data || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (fiche) => {
    setEditingFicheId(fiche.id);
    setNewFiche({
      nom: fiche.nom,
      reference: fiche.reference,
      equipement_id: fiche.equipement_id || '',
      sections: fiche.sections.map(s => ({
        ...s,
        items: s.items.map(i => ({...i}))
      }))
    });
    setSelectedFicheView(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (ficheId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer (archiver) cette fiche ?")) return;
    try {
      await api.delete(`/admin/fiches/${ficheId}`);
      setSelectedFicheView(null);
      fetchData();
      alert("Fiche supprimée !");
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  };

  const handleViewHistory = async (reference) => {
    try {
      const res = await api.get(`/admin/fiches/reference/${reference}/history`);
      setFicheHistory(res.data);
      setIsHistoryModalOpen(true);
      setSelectedFicheView(null);
    } catch (err) {
      alert("Erreur lors du chargement de l'historique");
    }
  };

  const handleRestore = async (ficheId) => {
    if (!window.confirm("Voulez-vous restaurer cette ancienne version ?")) return;
    try {
      await api.post(`/admin/fiches/${ficheId}/restore`);
      setIsHistoryModalOpen(false);
      fetchData();
      alert("Version restaurée avec succès !");
    } catch (err) {
      alert("Erreur lors de la restauration");
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
        <div className="flex items-center gap-3 self-start">
          <label className={`btn-secondary flex items-center gap-2 cursor-pointer ${isImporting ? 'opacity-50 pointer-events-none' : ''}`}>
            <Upload size={20} />
            <span>{isImporting ? "Importation..." : "Importer PDF"}</span>
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handlePdfImport} 
              className="hidden" 
            />
          </label>
          <button 
            onClick={() => {
              setEditingFicheId(null);
              setNewFiche({
                nom: '', reference: '', equipement_id: '',
                sections: [{ titre: 'Général', ordre: 0, items: [{ equipement_label: '', controle_description: '', type: 'binaire', ordre: 0 }] }]
              });
              setIsModalOpen(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            <span>Nouvelle Fiche Template</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fiches.map((fiche) => (
          <motion.div 
            onClick={() => setSelectedFicheView(fiche)}
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
                                <option value="binaire">OK / KO</option>
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

      {/* View Fiche Modal */}
      <AnimatePresence>
        {selectedFicheView && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex justify-center py-10 px-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl flex flex-col max-h-full overflow-hidden"
            >
              <div className="flex justify-between items-center p-8 border-b flex-shrink-0 bg-gray-50">
                <div>
                  <h2 className="text-2xl font-black text-kofert-dark">{selectedFicheView.nom}</h2>
                  <p className="text-sm text-gray-500 mt-1">Réf: {selectedFicheView.reference} • v{selectedFicheView.version || 1}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleViewHistory(selectedFicheView.reference)} className="px-4 py-2 text-sm font-bold text-gray-500 bg-white border rounded-xl hover:bg-gray-50">Historique</button>
                  <button onClick={() => handleEdit(selectedFicheView)} className="px-4 py-2 text-sm font-bold text-kofert-dark bg-white border rounded-xl hover:bg-gray-50">Éditer</button>
                  <button onClick={() => handleDelete(selectedFicheView.id)} className="px-4 py-2 text-sm font-bold text-red-500 bg-white border border-red-100 rounded-xl hover:bg-red-50">Supprimer</button>
                  <div className="w-px h-6 bg-gray-200 mx-1"></div>
                  <button onClick={() => setSelectedFicheView(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                    <X size={24} className="text-gray-400" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50/50">
                {selectedFicheView.sections?.map((section, sIdx) => (
                  <div key={section.id || sIdx} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-kofert-dark mb-4 flex items-center gap-3">
                      <span className="w-8 h-8 bg-kofert-green/10 text-kofert-green rounded-lg flex items-center justify-center text-sm">{sIdx + 1}</span>
                      {section.titre}
                    </h3>
                    <div className="space-y-3 pl-11">
                      {section.items?.map((item, iIdx) => (
                        <div key={item.id || iIdx} className="p-4 bg-gray-50 rounded-xl border border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <p className="font-bold text-kofert-dark text-sm">{item.equipement_label}</p>
                            <p className="text-xs text-gray-500 mt-1">{item.controle_description}</p>
                          </div>
                          <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-400 whitespace-nowrap shadow-sm">
                            {item.type === 'numerique' ? 'Valeur Numérique' : 'OK / KO'}
                          </span>
                        </div>
                      ))}
                      {(!section.items || section.items.length === 0) && (
                        <p className="text-sm text-gray-400 italic">Aucun point de contrôle dans cette section.</p>
                      )}
                    </div>
                  </div>
                ))}
                {(!selectedFicheView.sections || selectedFicheView.sections.length === 0) && (
                  <div className="text-center py-10 text-gray-400">
                    <Package size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Aucune section configurée pour cette fiche.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {isHistoryModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex justify-center py-10 px-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl flex flex-col max-h-full overflow-hidden"
            >
              <div className="flex justify-between items-center p-8 border-b flex-shrink-0 bg-gray-50">
                <div>
                  <h2 className="text-2xl font-black text-kofert-dark">Historique des versions</h2>
                  <p className="text-sm text-gray-500 mt-1">Réf: {ficheHistory[0]?.reference}</p>
                </div>
                <button onClick={() => setIsHistoryModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <X size={24} className="text-gray-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-gray-50/50">
                {ficheHistory.map((fiche) => (
                  <div key={fiche.id} className="bg-white border border-gray-100 rounded-2xl p-6 flex justify-between items-center shadow-sm">
                    <div>
                      <h3 className="font-bold text-lg text-kofert-dark">Version {fiche.version || 1}</h3>
                      <p className="text-sm text-gray-400">Créée le {new Date(fiche.created_at || Date.now()).toLocaleDateString()}</p>
                      {!fiche.actif && <span className="inline-block mt-2 px-2 py-1 bg-red-50 text-red-500 text-xs font-bold rounded-md">Archivée</span>}
                      {fiche.actif && <span className="inline-block mt-2 px-2 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-md">Active (Actuelle)</span>}
                    </div>
                    {!fiche.actif && (
                      <button onClick={() => handleRestore(fiche.id)} className="px-4 py-2 text-sm font-bold text-kofert-dark bg-white border rounded-xl hover:bg-gray-50">
                        Restaurer cette version
                      </button>
                    )}
                  </div>
                ))}
              </div>
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
