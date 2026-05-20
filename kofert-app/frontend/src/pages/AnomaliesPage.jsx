import { useEffect, useState } from 'react';
import api from '../api';
import { AlertTriangle, Clock, CheckCircle, User, FileText, ChevronRight, Loader2, X, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AnomaliesPage = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter and Search States
  const [activeTab, setActiveTab] = useState('toutes'); // toutes, ouverte, en_cours, cloturee
  
  // Modal / Editing State
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editAssigneeId, setEditAssigneeId] = useState('');
  const [editAction, setEditAction] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAnomalies = async () => {
    try {
      const response = await api.get('/anomalies/');
      setAnomalies(response.data);
    } catch (error) {
      console.error("Error fetching anomalies", error);
    }
  };

  const fetchAssignees = async () => {
    try {
      const response = await api.get('/anomalies/users');
      setAssignees(response.data);
    } catch (error) {
      console.error("Error fetching assignees", error);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchAnomalies(), fetchAssignees()]);
      setLoading(false);
    };
    initData();
  }, []);

  const handleOpenEditModal = (anomaly) => {
    setSelectedAnomaly(anomaly);
    setEditStatus(anomaly.statut);
    setEditAssigneeId(anomaly.assigne_a_id || '');
    setEditAction(anomaly.description_action || '');
  };

  const handleSaveChanges = async () => {
    if (!selectedAnomaly) return;
    setSaving(true);
    try {
      // 1. Update Status if changed
      if (editStatus !== selectedAnomaly.statut) {
        await api.put(`/anomalies/${selectedAnomaly.id}/status`, { statut: editStatus });
      }
      
      // 2. Update Action if changed
      if (editAction !== (selectedAnomaly.description_action || '')) {
        await api.put(`/anomalies/${selectedAnomaly.id}/action`, { description_action: editAction });
      }

      // 3. Update Assignee if changed
      if (editAssigneeId !== (selectedAnomaly.assigne_a_id || '')) {
        if (editAssigneeId) {
          await api.put(`/anomalies/${selectedAnomaly.id}/assign?user_id=${editAssigneeId}`);
        }
      }

      // Refresh data
      await fetchAnomalies();
      setSelectedAnomaly(null);
    } catch (error) {
      console.error("Failed to save changes", error);
      alert(error.response?.data?.detail || "Erreur de mise à jour");
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ouverte': return 'bg-kofert-red/10 text-kofert-red border-kofert-red/20';
      case 'en_cours': return 'bg-kofert-orange/10 text-kofert-orange border-kofert-orange/20';
      case 'cloturee': return 'bg-kofert-green/10 text-kofert-green border-kofert-green/20';
      default: return 'bg-gray-100 text-gray-500 border-gray-200';
    }
  };

  const getStatusIcon = (status, size = 16) => {
    switch (status) {
      case 'ouverte': return <AlertTriangle size={size} />;
      case 'en_cours': return <Clock size={size} />;
      case 'cloturee': return <CheckCircle size={size} />;
      default: return null;
    }
  };

  // Filter anomalies based on tab selection
  const filteredAnomalies = anomalies.filter(anom => {
    if (activeTab === 'toutes') return true;
    return anom.statut === activeTab;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-kofert-green font-bold" size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h1 className="text-4xl font-bold text-kofert-dark">Gestion des Anomalies</h1>
        <p className="text-gray-500 mt-2 text-lg">Visualisez, assignez et documentez les actions correctives sur votre périmètre.</p>
      </header>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-black/5">
        {['toutes', 'ouverte', 'en_cours', 'cloturee'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all border capitalize flex items-center gap-2 ${
              activeTab === tab 
                ? 'bg-kofert-dark text-white border-kofert-dark shadow-md' 
                : 'bg-white text-gray-500 border-black/5 hover:border-gray-300'
            }`}
          >
            {getStatusIcon(tab, 14)}
            <span>{tab.replace('_', ' ')}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === tab ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              {tab === 'toutes' ? anomalies.length : anomalies.filter(a => a.statut === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* Anomalies List */}
      {filteredAnomalies.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center border-dashed bg-white">
          <CheckCircle size={48} className="text-kofert-green mb-4 animate-bounce" />
          <h3 className="text-lg font-bold text-kofert-dark">Aucune anomalie à afficher</h3>
          <p className="text-gray-400 text-sm mt-1">Félicitations, tout semble en parfait état dans votre périmètre.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAnomalies.map((anom, i) => (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={anom.id}
              className="card flex flex-col justify-between hover:border-kofert-green/30 group transition-all relative overflow-hidden bg-white shadow-sm"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">{anom.equipement}</span>
                    <h3 className="font-bold text-lg text-kofert-dark mt-1 leading-snug">{anom.item}</h3>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 uppercase tracking-wide select-none ${getStatusBadgeClass(anom.statut)}`}>
                    {getStatusIcon(anom.statut, 12)}
                    {anom.statut.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-sm text-gray-500 bg-gray-50 border border-black/5 rounded-2xl p-4 space-y-2">
                  <p><strong className="text-kofert-dark font-semibold">Responsable :</strong> {anom.assigne_a}</p>
                  <p className="truncate"><strong className="text-kofert-dark font-semibold">Action corrective :</strong> {anom.description_action || "Aucune action renseignée"}</p>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-gray-50 pt-4 mt-6">
                <span className="text-xs font-medium text-gray-400">Détecté par {anom.technicien} le {new Date(anom.date).toLocaleDateString('fr-FR')}</span>
                <button
                  onClick={() => handleOpenEditModal(anom)}
                  className="btn-primary !px-4 !py-2 text-xs flex items-center gap-1"
                >
                  <span>Gérer</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Editing Dialog / Slide-over Modal */}
      <AnimatePresence>
        {selectedAnomaly && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAnomaly(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl z-50 overflow-hidden space-y-6"
            >
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">{selectedAnomaly.equipement}</span>
                  <h2 className="text-xl font-bold text-kofert-dark mt-1">{selectedAnomaly.item}</h2>
                </div>
                <button onClick={() => setSelectedAnomaly(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Status Dropdown */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Statut de l'Anomalie</label>
                  <select
                    className="input-field capitalize text-sm"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="ouverte">Ouverte</option>
                    <option value="en_cours">En cours</option>
                    <option value="cloturee">Clôturée</option>
                  </select>
                </div>

                {/* Assignee Dropdown */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Assigner à (Responsable)</label>
                  <select
                    className="input-field text-sm"
                    value={editAssigneeId}
                    onChange={(e) => setEditAssigneeId(e.target.value)}
                  >
                    <option value="">Sélectionnez un responsable...</option>
                    {assignees.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.prenom} {user.nom} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action Taken textarea */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Action Corrective</label>
                  <textarea
                    rows={4}
                    className="input-field text-sm"
                    placeholder="Saisissez les détails de l'action menée ou prévue..."
                    value={editAction}
                    onChange={(e) => setEditAction(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  onClick={() => setSelectedAnomaly(null)}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm text-gray-400 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={saving}
                  className="btn-primary flex items-center gap-2"
                >
                  {saving && <Loader2 className="animate-spin" size={16} />}
                  <span>Enregistrer les modifications</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnomaliesPage;
