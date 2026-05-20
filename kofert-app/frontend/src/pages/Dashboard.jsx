import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { ClipboardCheck, AlertTriangle, Clock, ChevronRight, FileText, Download, ListChecks, CheckCircle, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();
  const [fiches, setFiches] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [supStats, setSupStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentInspections, setRecentInspections] = useState([]);

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
          setRecentInspections(insRes.data.slice(-5).reverse());
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
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-kofert-green"></div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10"
    >
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-kofert-dark">Bonjour, {user?.prenom}</h1>
          <p className="text-gray-500 mt-2 text-lg">
            {user?.role === 'superviseur' 
              ? `Espace de supervision — Suivi des perimètres et anomalies.` 
              : "Voici l'état du système Kofert aujourd'hui."}
          </p>
        </div>
        {user?.role === 'admin' && (
          <Link to="/admin/fiches" className="btn-primary flex items-center gap-2">
            <ListChecks size={20} />
            Configuration Fiches
          </Link>
        )}
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label} 
            className="card flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center shadow-sm`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-3xl font-bold text-kofert-dark mt-1">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Admin Reporting Section */}
      {user?.role === 'admin' && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card bg-white border-2 border-kofert-green/10"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-kofert-dark flex items-center gap-2">
                <FileText className="text-kofert-green" size={24} />
                Exportation des Rapports Journaliers
              </h2>
              <p className="text-gray-500 text-sm mt-1">Générez un rapport PDF consolidé pour une date précise.</p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <input 
                type="date"
                className="input-field !py-2"
                value={reportDate}
                onChange={e => setReportDate(e.target.value)}
              />
              <button 
                onClick={handleExportPDF}
                disabled={exporting}
                className="btn-primary flex items-center gap-2 whitespace-nowrap"
              >
                {exporting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Download size={20} />
                )}
                <span>Exporter Journée</span>
              </button>
            </div>
          </div>
        </motion.section>
      )}

      {/* Recent Inspections List - Admin Only */}
      {user?.role === 'admin' && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-kofert-dark">Dernières Inspections</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {recentInspections.map((ins) => (
              <div key={ins.id} className="card flex items-center justify-between bg-white hover:border-kofert-green/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-kofert-dark">{ins.equipement}</h3>
                    <p className="text-sm text-gray-400">{ins.date} • {ins.technicien}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${ins.statut === 'soumise' ? 'bg-kofert-green/10 text-kofert-green' : 'bg-gray-100 text-gray-400'}`}>
                    {ins.statut.toUpperCase()}
                  </span>
                  <button 
                    onClick={() => handleExportSinglePDF(ins.id)}
                    className="p-2 text-kofert-green hover:bg-kofert-green/5 rounded-lg transition-all"
                    title="Télécharger PDF"
                  >
                    <Download size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Superviseur view: received fiches today */}
      {user?.role === 'superviseur' && supStats && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-kofert-dark">Fiches Reçues Aujourd'hui</h2>
            <span className="text-sm font-medium text-kofert-green bg-kofert-green/10 px-3 py-1 rounded-full">
              {supStats.recent_inspections.length} soumises aujourd'hui
            </span>
          </div>

          {supStats.recent_inspections.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 text-center border-dashed">
              <ClipboardCheck size={48} className="text-gray-300 mb-4 animate-pulse" />
              <h3 className="text-lg font-bold text-kofert-dark">Aucune fiche soumise pour le moment</h3>
              <p className="text-gray-400 text-sm mt-1">Les rapports complétés par vos techniciens apparaîtront ici en temps réel.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {supStats.recent_inspections.map((ins, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  key={ins.id}
                  className="card flex flex-col sm:flex-row items-start sm:items-center justify-between hover:border-kofert-green/30 group transition-all gap-4"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-kofert-green group-hover:text-white transition-colors">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-kofert-dark">{ins.equipement}</h3>
                      <p className="text-sm text-gray-500 font-medium">Par {ins.technicien} • {ins.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                    <div className="flex items-center gap-3">
                      {ins.anomalies > 0 ? (
                        <span className="text-xs font-bold text-kofert-red bg-kofert-red/10 px-3 py-1 rounded-full flex items-center gap-1">
                          <AlertTriangle size={12} />
                          {ins.anomalies} anomalie{ins.anomalies > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-kofert-green bg-kofert-green/10 px-3 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle size={12} />
                          Conforme
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleExportSinglePDF(ins.id)}
                        className="p-2 text-kofert-green hover:bg-kofert-green/5 rounded-xl transition-all"
                        title="Télécharger PDF"
                      >
                        <Download size={20} />
                      </button>
                      <Link
                        to={`/inspection-detail/${ins.id}`}
                        className="btn-primary !px-4 !py-2 text-xs flex items-center gap-1"
                      >
                        <span>Détails</span>
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Technician view: checklists to fill */}
      {user?.role === 'technicien' && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-kofert-dark">Mes Inspections</h2>
            <span className="text-sm font-medium text-kofert-green bg-kofert-green/10 px-3 py-1 rounded-full">
              {fiches.length} fiches assignées
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {fiches.map((fiche, i) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + (i * 0.1) }}
                key={fiche.id}
              >
                <Link
                  to={`/inspection/${fiche.id}`}
                  className="card flex items-center justify-between hover:border-kofert-green/30 group transition-all"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-kofert-green group-hover:text-white transition-colors">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-kofert-dark">{fiche.nom}</h3>
                      <p className="text-sm text-gray-500 font-medium">Réf: {fiche.reference} • v{fiche.version}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Statut</span>
                      <span className="text-sm font-semibold text-orange-500 bg-orange-50 px-3 py-1 rounded-lg">À faire</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-kofert-green group-hover:text-white group-hover:translate-x-1 transition-all">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
};

export default Dashboard;
