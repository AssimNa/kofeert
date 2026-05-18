import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { History, User as UserIcon, Calendar, Database, ArrowLeft } from 'lucide-react';

const AuditLogPage = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/admin/audit-log');
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
                    <UserIcon size={14} className="text-gray-400" /> #{log.user_id}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-black text-xs text-kofert-green bg-kofert-green/5 px-2 py-1 rounded">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Database size={14} className="text-gray-300" />
                      <span className="text-gray-600 uppercase font-bold text-[10px]">{log.table_cible}</span>
                      <span className="text-gray-400">#{log.record_id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs font-bold text-gray-300 hover:text-kofert-dark transition-colors underline uppercase tracking-tighter">Voir JSON</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogPage;
