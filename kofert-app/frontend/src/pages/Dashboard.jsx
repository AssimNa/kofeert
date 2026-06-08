import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { ClipboardCheck, AlertTriangle, Clock, ChevronRight, FileText, Download, ListChecks, CheckCircle, User, Calendar, Activity } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fiches, setFiches] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [supStats, setSupStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allAdminInspections, setAllAdminInspections] = useState([]);

  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (user?.role === 'admin') {
          const [statsRes, insRes] = await Promise.all([
            api.get('/admin/dashboard'),
            api.get('/admin/inspections')
          ]);
          setAdminStats(statsRes.data);
          setAllAdminInspections(insRes.data);
        } else if (user?.role === 'superviseur') {
          const res = await api.get('/inspections/supervisor/dashboard');
          setSupStats(res.data);
        } else {
          const res = await api.get('/fiches/');
          setFiches(res.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  const isToday = reportDate === new Date().toISOString().split('T')[0];
  const displayDate = isToday ? "Aujourd'hui" : `le ${new Date(reportDate).toLocaleDateString('fr-FR')}`;

  const filteredAdminInspections = allAdminInspections
    .filter(ins => ins.date.startsWith(reportDate) && ins.statut === 'soumise')
    .reverse();

  const stats = user?.role === 'admin' && adminStats ? [
    { label: 'Utilisateurs', value: adminStats.total_users, icon: User, color: 'bg-purple-50 text-purple-600' },
    { label: 'Équipements', value: adminStats.total_equipements, icon: FileText, color: 'bg-blue-50 text-blue-600' },
    { label: 'Taux Conformité', value: `${adminStats.conformity_rate}%`, icon: AlertTriangle, color: 'bg-kofert-green/10 text-kofert-green' },
  ] : user?.role === 'superviseur' && supStats ? [
    { label: 'Fiches Reçues (Aujourd\'hui)', value: `${supStats.fiches_soumises_today} / ${supStats.fiches_total_perimeter}`, icon: ClipboardCheck, color: 'bg-kofert-green/10 text-kofert-green' },
    { label: 'Anomalies Actives', value: supStats.active_anomalies, icon: AlertTriangle, color: 'bg-orange-50 text-orange-600' },
    { label: 'Taux de Conformité', value: `${supStats.conformity_rate}%`, icon: CheckCircle, color: 'bg-blue-50 text-blue-600' },
  ] : [
    { label: 'Fiches du jour', value: fiches.length, icon: ClipboardCheck, color: 'bg-blue-50 text-blue-600' },
    { label: 'Anomalies ouvertes', value: 0, icon: AlertTriangle, color: 'bg-orange-50 text-orange-600' },
    { label: 'En attente', value: fiches.length, icon: Clock, color: 'bg-gray-50 text-gray-600' },
  ];

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const response = await api.get(`/admin/reports/daily-pdf?date=${reportDate}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapport_kofert_${reportDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Erreur lors de l'exportation");
    } finally {
      setExporting(false);
    }
  };

  const handleExportSinglePDF = async (insId) => {
    try {
      // Use the generic PDF route, which checks perimeters for supervisors and users!
      const response = await api.get(`/inspections/${insId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapport_${insId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Erreur lors de l'exportation du PDF");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-t-4 border-kofert-green animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-t-4 border-kofert-orange animate-spin-reverse"></div>
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-10"
    >
      {/* Enhanced Header */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-kofert-dark via-[#2a2a2a] to-kofert-dark p-8 sm:p-10 shadow-2xl text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-kofert-green/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-kofert-orange/10 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-extrabold tracking-tight"
            >
              Bonjour, <span className="text-kofert-green">{user?.prenom}</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-300 mt-2 text-lg max-w-xl"
            >
              {user?.role === 'superviseur' 
                ? `Espace de supervision — Suivi des perimètres et anomalies.` 
                : user?.role === 'admin'
                ? "Vue globale de l'administration du système Kofert."
                : "Voici l'état du système Kofert aujourd'hui."}
            </motion.p>
          </div>
          {user?.role === 'admin' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Link to="/admin/fiches" className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg transition-all flex items-center gap-3 group">
                <div className="bg-kofert-green p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                  <ListChecks size={18} className="text-white" />
                </div>
                <span>Gérer les Fiches</span>
              </Link>
            </motion.div>
          )}
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + (i * 0.1) }}
            key={stat.label} 
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-kofert-green/20 hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">{stat.label}</p>
                <h3 className="text-4xl font-extrabold text-kofert-dark group-hover:text-kofert-green transition-colors">{stat.value}</h3>
              </div>
              <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                <stat.icon size={26} strokeWidth={2.5} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Admin Reporting Section */}
      {user?.role === 'admin' && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative overflow-hidden bg-white p-8 rounded-3xl shadow-sm border border-kofert-green/20 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-kofert-green/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-kofert-green to-[#157a5a] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-kofert-green/30">
              <FileText size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-kofert-dark">Rapports Journaliers</h2>
              <p className="text-gray-500 mt-1">Générez un rapport PDF consolidé pour une date précise.</p>
            </div>
          </div>
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto bg-gray-50 p-2 rounded-2xl border border-gray-200">
            <div className="relative w-full sm:w-auto">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="date"
                className="w-full pl-11 pr-4 py-3 bg-white rounded-xl border-none shadow-sm focus:ring-2 focus:ring-kofert-green/50 outline-none font-medium text-gray-700"
                value={reportDate}
                onChange={e => setReportDate(e.target.value)}
              />
            </div>
            <button 
              onClick={handleExportPDF}
              disabled={exporting}
              className="w-full sm:w-auto bg-kofert-dark hover:bg-black text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 hover:-translate-y-0.5"
            >
              {exporting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Download size={18} />
              )}
              <span>Exporter</span>
            </button>
          </div>
        </motion.section>
      )}

      {/* Recent Inspections List - Admin Only */}
      {user?.role === 'admin' && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-6 sm:p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-3">
              <Activity className="text-kofert-green" size={24} />
              <h2 className="text-2xl font-bold text-kofert-dark">Fiches Soumises {displayDate}</h2>
            </div>
            <span className="text-sm font-medium bg-kofert-green/10 text-kofert-green px-4 py-1.5 rounded-full border border-kofert-green/20 shadow-sm">
              {filteredAdminInspections.length} soumise{filteredAdminInspections.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="divide-y divide-gray-100">
            {filteredAdminInspections.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-16 text-center">
                 <ClipboardCheck size={40} className="text-gray-300 mb-4" />
                 <h3 className="text-lg font-bold text-kofert-dark">Aucune fiche soumise {displayDate.toLowerCase()}</h3>
                 <p className="text-gray-400 text-sm mt-1">Les fiches soumises par les techniciens apparaîtront ici.</p>
               </div>
            ) : (
              filteredAdminInspections.map((ins, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + (i * 0.05) }}
                  key={ins.id} 
                  className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-gray-50/80 transition-colors gap-4"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500 shadow-inner">
                      <ClipboardCheck size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-kofert-dark">{ins.equipement}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1 font-medium">
                        <span>{ins.date}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="flex items-center gap-1">
                          <User size={14} />
                          {ins.technicien}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-2 sm:mt-0 pl-17 sm:pl-0">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        {ins.statut === 'soumise' && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-kofert-green opacity-75"></span>
                        )}
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${ins.statut === 'soumise' ? 'bg-kofert-green' : 'bg-gray-400'}`}></span>
                      </span>
                      <span className={`text-sm font-bold uppercase tracking-wider ${ins.statut === 'soumise' ? 'text-kofert-green' : 'text-gray-500'}`}>
                        {ins.statut}
                      </span>
                    </div>
                    
                    <button 
                      onClick={() => handleExportSinglePDF(ins.id)}
                      className="flex items-center gap-2 px-4 py-2 text-kofert-dark bg-white border border-gray-200 hover:border-kofert-green hover:text-kofert-green hover:shadow-md rounded-xl transition-all text-sm font-semibold group"
                    >
                      <Download size={16} className="group-hover:-translate-y-0.5 transition-transform" />
                      <span>PDF</span>
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.section>
      )}

      {/* Superviseur view: received fiches today */}
      {user?.role === 'superviseur' && supStats && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-6 sm:p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-3">
              <Activity className="text-kofert-green" size={24} />
              <h2 className="text-2xl font-bold text-kofert-dark">Fiches Reçues Aujourd'hui</h2>
            </div>
            <span className="text-sm font-medium bg-kofert-green/10 text-kofert-green px-4 py-1.5 rounded-full">
              {supStats.recent_inspections.length} soumises
            </span>
          </div>

          {supStats.recent_inspections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <ClipboardCheck size={40} className="text-gray-300 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-kofert-dark mb-2">Aucune fiche soumise pour le moment</h3>
              <p className="text-gray-400 max-w-md mx-auto">Les rapports complétés par vos techniciens apparaîtront ici en temps réel.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {supStats.recent_inspections.map((ins, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + (i * 0.05) }}
                  key={ins.id}
                  onClick={() => navigate(`/inspection-detail/${ins.id}`)}
                  className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-gray-50/80 transition-colors gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-5">
                     <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500 shadow-inner group-hover:bg-kofert-green group-hover:text-white transition-colors">
                      <FileText size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-kofert-dark">{ins.equipement}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1 font-medium">
                        <span>{ins.date}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="flex items-center gap-1">
                          <User size={14} />
                          {ins.technicien}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 pl-17 sm:pl-0">
                    <div className="flex items-center gap-3 mr-2">
                      {ins.anomalies > 0 ? (
                        <span className="text-xs font-bold text-kofert-red bg-kofert-red/10 px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-kofert-red/20">
                          <AlertTriangle size={14} />
                          {ins.anomalies} anomalie{ins.anomalies > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-kofert-green bg-kofert-green/10 px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-kofert-green/20">
                          <CheckCircle size={14} />
                          Conforme
                        </span>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => handleExportSinglePDF(ins.id)}
                      className="p-2.5 text-gray-500 bg-white border border-gray-200 hover:border-kofert-green hover:text-kofert-green hover:shadow-sm rounded-xl transition-all"
                      title="Télécharger PDF"
                    >
                      <Download size={18} />
                    </button>
                    <Link
                      to={`/inspection-detail/${ins.id}`}
                      className="bg-kofert-dark hover:bg-black text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1 transition-all shadow-md hover:-translate-y-0.5"
                    >
                      <span>Détails</span>
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      )}

      {/* Technician view: checklists to fill */}
      {user?.role === 'technicien' && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-6 sm:p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-3">
              <ListChecks className="text-kofert-green" size={24} />
              <h2 className="text-2xl font-bold text-kofert-dark">Mes Inspections</h2>
            </div>
            <span className="text-sm font-medium bg-kofert-green/10 text-kofert-green px-4 py-1.5 rounded-full">
              {fiches.length} assignées
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {fiches.map((fiche, i) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + (i * 0.05) }}
                key={fiche.id}
              >
                <Link
                  to={`/inspection/${fiche.id}`}
                  className="p-6 flex items-center justify-between hover:bg-gray-50/80 group transition-colors"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500 shadow-inner group-hover:bg-kofert-green group-hover:text-white transition-colors">
                      <FileText size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-kofert-dark group-hover:text-kofert-green transition-colors">{fiche.nom}</h3>
                      <p className="text-sm text-gray-500 font-medium mt-1">Réf: {fiche.reference} • v{fiche.version}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Statut</span>
                      <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">À FAIRE</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-kofert-green group-hover:border-kofert-green group-hover:text-white group-hover:translate-x-1 shadow-sm transition-all">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}
    </motion.div>
  );
};

export default Dashboard;
