import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, MapPin, Tag, Search, Plus, X, Loader2, ArrowLeft } from 'lucide-react';

const EquipmentManagement = () => {
  const navigate = useNavigate();
  const [eqs, setEqs] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingEqId, setEditingEqId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ nom: '', code: '', site: '', local: '', superviseur_id: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eqsRes, usersRes] = await Promise.all([
        api.get('/admin/equipements'),
        api.get('/admin/users')
      ]);
      setEqs(eqsRes.data);
      setSupervisors(usersRes.data.filter(u => u.role === 'superviseur'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, eq = null) => {
    setModalMode(mode);
    if (mode === 'edit' && eq) {
      setEditingEqId(eq.id);
      setFormData({ nom: eq.nom, code: eq.code, site: eq.site, local: eq.local, superviseur_id: eq.superviseur_id });
    } else {
      setEditingEqId(null);
      setFormData({ nom: '', code: '', site: '', local: '', superviseur_id: '' });
    }
    setIsModalOpen(true);
  };

  const handleSaveEq = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (modalMode === 'create') {
        await api.post('/admin/equipements', {
          ...formData,
          superviseur_id: parseInt(formData.superviseur_id)
        });
      } else {
        await api.patch(`/admin/equipements/${editingEqId}`, {
          ...formData,
          superviseur_id: parseInt(formData.superviseur_id)
        });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur lors de l'opération");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEqs = eqs.filter(e => 
    e.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-4xl font-bold text-kofert-dark">Parc Équipements</h1>
          <p className="text-gray-500 mt-2 text-lg">Gérez les machines et leurs localisations sur site.</p>
        </div>
        <button 
          onClick={() => handleOpenModal('create')}
          className="btn-primary flex items-center gap-2 self-start"
        >
          <Plus size={20} />
          <span>Nouvel Équipement</span>
        </button>
      </header>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-kofert-dark">
                  {modalMode === 'create' ? 'Ajouter un équipement' : 'Modifier l\'équipement'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveEq} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Nom de l'équipement</label>
                  <input 
                    required
                    className="input-field"
                    placeholder="ex: Transformateur T1"
                    value={formData.nom}
                    onChange={e => setFormData({...formData, nom: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Code</label>
                    <input 
                      required
                      className="input-field"
                      placeholder="ex: TR_622"
                      value={formData.code}
                      onChange={e => setFormData({...formData, code: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Site</label>
                    <input 
                      required
                      className="input-field"
                      placeholder="ex: Jorf Fertilizers"
                      value={formData.site}
                      onChange={e => setFormData({...formData, site: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Localisation précise</label>
                  <input 
                    required
                    className="input-field"
                    placeholder="ex: Local HT, Salle 02"
                    value={formData.local}
                    onChange={e => setFormData({...formData, local: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Superviseur Responsable</label>
                  <select 
                    required
                    className="input-field appearance-none"
                    value={formData.superviseur_id}
                    onChange={e => setFormData({...formData, superviseur_id: e.target.value})}
                  >
                    <option value="">Sélectionner un superviseur...</option>
                    {supervisors.map(s => (
                      <option key={s.id} value={s.id}>{s.prenom} {s.nom}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-4 mt-8">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 btn-primary"
                  >
                    {isSubmitting ? "Enregistrement..." : modalMode === 'create' ? "Ajouter" : "Enregistrer"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="card !p-0 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un équipement..." 
              className="input-field !pl-10 !py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/30 text-gray-400 text-xs font-black uppercase tracking-widest border-b border-gray-50">
                <th className="px-6 py-4">Équipement</th>
                <th className="px-6 py-4">Localisation</th>
                <th className="px-6 py-4">ID Superviseur</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredEqs.map((eq) => (
                <tr key={eq.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center font-bold">
                        <Package size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-kofert-dark">{eq.nom}</span>
                        <span className="text-sm text-gray-400 flex items-center gap-1"><Tag size={12}/> {eq.code}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-700">{eq.site}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={10}/> {eq.local}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-500">
                    #{eq.superviseur_id}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleOpenModal('edit', eq)}
                      className="text-kofert-green font-bold text-sm hover:underline"
                    >
                      Éditer
                    </button>
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

export default EquipmentManagement;
