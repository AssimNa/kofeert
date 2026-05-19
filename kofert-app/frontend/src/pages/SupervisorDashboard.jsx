import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { AlertTriangle, Clock, Download, FileText, CheckCircle, User, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const SupervisorDashboard = () => {
  const { user } = useAuth();
  const [inspections, setInspections] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportingDate, setExportingDate] = useState(new Date().toISOString().split('T')[0]);
  const [exporting, setExporting] = useState(false);

  // States for anomaly modal
  const [selectedAnomalie, setSelectedAnomalie] = useState(null);
  const [actionDesc, setActionDesc] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [assignedUser, setAssignedUser] = useState("");
  const [users, setUsers] = useState([]);

  // States for inspection view modal
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [inspectionData, setInspectionData] = useState(null);
  const [ficheTemplate, setFicheTemplate] = useState(null);
  const [loadingInspection, setLoadingInspection] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [insRes, anomRes, usersRes] = await Promise.all([
        api.get('/admin/inspections'),
        api.get('/anomalies/'),
        api.get('/admin/users')
      ]);
      setInspections(insRes.data.reverse());
      setAnomalies(anomRes.data);
      setUsers(usersRes.data.filter(u => u.role === 'technicien' || u.role === 'superviseur'));
    } catch (err) {
      console.error("Error fetching supervisor data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportDaily = async () => {
    setExporting(true);
    try {
      const response = await api.get(`/admin/reports/daily-pdf?date=${exportingDate}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapport_kofert_${exportingDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Erreur lors de l'exportation");
    } finally {
      setExporting(false);
    }
  };

  const handleExportSingle = async (insId) => {
    try {
      const response = await api.get(`/admin/inspections/${insId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapport_${insId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Erreur lors de l'exportation du rapport");
    }
  };

  const handleUpdateAnomalie = async (e) => {
    e.preventDefault();
    if (!selectedAnomalie) return;
    try {
      if (newStatus && newStatus !== selectedAnomalie.statut) {
        await api.put(`/anomalies/${selectedAnomalie.id}/status`, { statut: newStatus });
      }
      if (actionDesc !== selectedAnomalie.description_action) {
        await api.put(`/anomalies/${selectedAnomalie.id}/action`, { description_action: actionDesc });
      }
      if (assignedUser && assignedUser !== selectedAnomalie.assigne_a_id) {
        await api.put(`/anomalies/${selectedAnomalie.id}/assign?user_id=${assignedUser}`);
      }
      setSelectedAnomalie(null);
      fetchData(); // refresh
    } catch (err) {
      alert("Erreur lors de la mise à jour de l'anomalie");
    }
  };

  const openAnomalieModal = (anom) => {
    setSelectedAnomalie(anom);
    setNewStatus(anom.statut);
    setActionDesc(anom.description_action || "");
    setAssignedUser(anom.assigne_a_id || "");
  };

  const handleViewInspection = async (insId) => {
    setLoadingInspection(true);
    setSelectedInspection(insId);
    try {
      const insRes = await api.get(`/inspections/${insId}`);
      setInspectionData(insRes.data);
      const ficheRes = await api.get(`/fiches/${insRes.data.fiche_template_id}`);
      setFicheTemplate(ficheRes.data);
    } catch (err) {
      alert("Erreur lors du chargement des détails");
      setSelectedInspection(null);
    } finally {
      setLoadingInspection(false);
    }
  };

  const anomaliesOuvertes = anomalies.filter(a => a.statut === 'ouverte');
  const anomaliesEnCours = anomalies.filter(a => a.statut === 'en_cours');

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-kofert-green"></div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-kofert-dark">Tableau de Bord Superviseur</h1>
          <p className="text-gray-500 mt-2 text-lg">Bonjour {user?.prenom}, voici la situation de votre périmètre.</p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card flex items-center gap-6">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
            <FileText size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Inspections Reçues</p>
            <p className="text-3xl font-bold text-kofert-dark mt-1">{inspections.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-6">
          <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shadow-sm">
            <AlertTriangle size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Anomalies Ouvertes</p>
            <p className="text-3xl font-bold text-kofert-dark mt-1">{anomaliesOuvertes.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-6">
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shadow-sm">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Anomalies En cours</p>
            <p className="text-3xl font-bold text-kofert-dark mt-1">{anomaliesEnCours.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section Anomalies */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-kofert-dark flex items-center gap-2">
            <AlertTriangle className="text-orange-500" />
            Gestion des Anomalies
          </h2>
          <div className="card space-y-4 max-h-[500px] overflow-y-auto">
            {anomalies.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucune anomalie déclarée.</p>
            ) : (
              anomalies.map(anom => (
                <div key={anom.id} onClick={() => openAnomalieModal(anom)} className="border border-gray-100 rounded-xl p-4 hover:border-kofert-green cursor-pointer transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-kofert-dark text-lg">{anom.equipement}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      anom.statut === 'ouverte' ? 'bg-orange-100 text-orange-700' :
                      anom.statut === 'en_cours' ? 'bg-purple-100 text-purple-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {anom.statut.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Défaut: {anom.item}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Clock size={12}/> {anom.date}</span>
                    <span className="flex items-center gap-1"><User size={12}/> {anom.technicien}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Section Inspections & Reports */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-kofert-dark flex items-center gap-2">
            <FileText className="text-blue-500" />
            Inspections Récentes
          </h2>
          
          <div className="card flex items-center justify-between gap-4 bg-gray-50 border-none">
            <div className="flex items-center gap-3 w-full">
              <input type="date" className="input-field !py-2 w-full" value={exportingDate} onChange={e => setExportingDate(e.target.value)} />
              <button onClick={handleExportDaily} disabled={exporting} className="btn-primary flex items-center gap-2 whitespace-nowrap px-4 py-2">
                <Download size={18} />
                <span>Rapport du jour</span>
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {inspections.slice(0, 10).map(ins => (
              <div key={ins.id} className="card flex justify-between items-center py-3 px-4 hover:border-kofert-green transition-all cursor-pointer group" onClick={() => handleViewInspection(ins.id)}>
                <div>
                  <h3 className="font-bold text-kofert-dark group-hover:text-kofert-green transition-colors">{ins.equipement}</h3>
                  <p className="text-xs text-gray-500">{ins.date} • {ins.technicien}</p>
                </div>
                <div className="flex items-center gap-3">
                  {ins.statut === 'soumise' && <CheckCircle size={18} className="text-kofert-green" />}
                  <button onClick={(e) => { e.stopPropagation(); handleExportSingle(ins.id); }} className="p-2 text-kofert-green hover:bg-kofert-green/10 rounded-lg" title="Télécharger PDF">
                    <Download size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Modal Anomalie */}
      {selectedAnomalie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-2xl font-bold text-kofert-dark mb-4">Gérer l'Anomalie</h2>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="font-semibold text-kofert-dark">{selectedAnomalie.equipement}</p>
                <p className="text-sm text-gray-600 mt-1">{selectedAnomalie.item}</p>
                <p className="text-xs text-gray-400 mt-2">Déclaré par: {selectedAnomalie.technicien} le {selectedAnomalie.date}</p>
              </div>

              <form onSubmit={handleUpdateAnomalie} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Statut</label>
                  <select className="input-field" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                    <option value="ouverte">Ouverte</option>
                    <option value="en_cours">En cours</option>
                    <option value="cloturee">Clôturée</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Actions Correctives</label>
                  <textarea 
                    className="input-field min-h-[100px]" 
                    placeholder="Décrivez les actions entreprises..."
                    value={actionDesc}
                    onChange={e => setActionDesc(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Assigné à</label>
                  <select className="input-field" value={assignedUser} onChange={e => setAssignedUser(e.target.value)}>
                    <option value="">Non assigné</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.prenom} {u.nom}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setSelectedAnomalie(null)} className="flex-1 btn-secondary py-2">Annuler</button>
                  <button type="submit" className="flex-1 btn-primary py-2">Enregistrer</button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Inspection Details */}
      {selectedInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="flex justify-between items-start mb-6 border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold text-kofert-dark">Détails de l'Inspection</h2>
                {inspectionData && (
                  <p className="text-sm text-gray-500 mt-1">
                    Soumise le {new Date(inspectionData.soumis_le || inspectionData.date_inspection).toLocaleString()}
                  </p>
                )}
              </div>
              <button onClick={() => { setSelectedInspection(null); setInspectionData(null); setFicheTemplate(null); }} className="text-gray-400 hover:bg-gray-100 p-2 rounded-lg font-bold">Fermer</button>
            </div>
            
            {loadingInspection || !inspectionData || !ficheTemplate ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-kofert-green"></div>
              </div>
            ) : (
              <div className="flex-1 space-y-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg text-kofert-dark">{ficheTemplate.nom}</h3>
                    <p className="text-sm text-gray-500">Réf: {ficheTemplate.reference}</p>
                  </div>
                  <span className={`px-4 py-1 rounded-full text-sm font-bold ${
                    inspectionData.resultats.some(r => r.resultat === 'non_conforme') ? 'bg-kofert-red/10 text-kofert-red' : 'bg-kofert-green/10 text-kofert-green'
                  }`}>
                    {inspectionData.resultats.some(r => r.resultat === 'non_conforme') ? 'Non Conforme' : 'Conforme'}
                  </span>
                </div>

                <div className="space-y-8">
                  {ficheTemplate.sections.map((section, idx) => (
                    <div key={section.id} className="space-y-4">
                      <h4 className="text-lg font-bold text-kofert-dark border-b pb-2">{idx + 1}. {section.titre}</h4>
                      <div className="grid gap-3">
                        {section.items.map(item => {
                          const res = inspectionData.resultats.find(r => r.item_id === item.id);
                          if (!res) return null;
                          return (
                            <div key={item.id} className="bg-white border border-gray-100 p-4 rounded-xl">
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                  <p className="font-bold text-kofert-dark">{item.equipement_label}</p>
                                  {res.remarque && <p className="text-sm text-gray-500 mt-1 italic">"{res.remarque}"</p>}
                                  {res.mesures_valeurs && res.mesures_valeurs.length > 0 && (
                                    <div className="mt-2 flex gap-3 text-xs font-bold text-gray-600 bg-gray-50 p-2 rounded-lg inline-flex flex-wrap">
                                      {res.mesures_valeurs.map(mv => {
                                        const mesureDef = item.mesures?.find(m => m.id === mv.item_mesure_id);
                                        return (
                                          <span key={mv.item_mesure_id}>{mesureDef?.label || 'Mesure'}: <span className="text-kofert-green">{mv.valeur} {mesureDef?.unite}</span></span>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                                <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full">
                                  {res.resultat === 'conforme' ? (
                                    <CheckCircle className="text-kofert-green" size={24} />
                                  ) : (
                                    <AlertTriangle className="text-kofert-red" size={24} />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

    </motion.div>
  );
};

export default SupervisorDashboard;
