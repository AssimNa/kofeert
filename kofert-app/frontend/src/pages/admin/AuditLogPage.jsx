import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { History, User as UserIcon, Calendar, Database, ArrowLeft, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuditLogPage = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJson, setSelectedJson] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const [logsRes, usersRes] = await Promise.all([
        api.get('/admin/audit-log'),
        api.get('/admin/users')
      ]);
      setLogs(logsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (id) => {
    const user = users.find(u => u.id === id);
    return user ? `${user.prenom} ${user.nom}` : `Inconnu (#${id})`;
  };

  const formatCible = (cible) => {
    return cible ? cible.replace(/_/g, ' ').toUpperCase() : 'N/A';
  };

  return (
    <div className="space-y-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-kofert-dark transition-colors font-medium"
      >
        <ArrowLeft size={18} />
        Retour
      </button>

      <header>
        <h1 className="text-4xl font-bold text-kofert-dark">Journal d'Audit</h1>
        <p className="text-gray-500 mt-2 text-lg">Suivez l'historique de toutes les actions système critiques.</p>
      </header>

      <div className="card !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/30 text-gray-400 text-xs font-black uppercase tracking-widest border-b border-gray-50">
                <th className="px-6 py-4">Horodatage</th>
                <th className="px-6 py-4">Utilisateur</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Cible</th>
                <th className="px-6 py-4 text-right">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log) => (
                <tr key={log.id} className="text-sm">
                  <td className="px-6 py-4 font-mono text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      {log.timestamp.split('.')[0]}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-kofert-dark flex items-center gap-2">
                    <UserIcon size={14} className="text-gray-400" /> {getUserName(log.user_id)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-black text-xs text-kofert-green bg-kofert-green/5 px-2 py-1 rounded">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Database size={14} className="text-gray-300" />
                      <span className="text-gray-600 uppercase font-bold text-[10px]">{formatCible(log.table_cible)}</span>
                      {log.record_id && <span className="text-gray-400">#{log.record_id}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedJson(log.details_json || { msg: "Aucun détail" })}
                      className="text-xs font-bold text-gray-400 hover:text-kofert-dark transition-colors underline uppercase tracking-tighter"
                    >
                      Voir JSON
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedJson && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-kofert-dark">Détails de l'action</h2>
                <button onClick={() => setSelectedJson(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
                <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap break-words">
                  {JSON.stringify(selectedJson, null, 2)}
                </pre>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuditLogPage;
