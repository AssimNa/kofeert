import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { UserPlus, UserMinus, Shield, Mail, Search, MoreVertical, Check, X, Trash2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    if (!window.confirm(`Voulez-vous vraiment ${currentStatus ? 'désactiver' : 'réactiver'} cet utilisateur ?`)) return;
    try {
      await api.patch(`/admin/users/${userId}`, { actif: !currentStatus });
      fetchUsers();
    } catch (err) {
      alert("Erreur lors de la modification");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cet utilisateur ?")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchUsers();
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  };

  const filteredUsers = users.filter(u =>
    u.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({ nom: '', prenom: '', email: '', password: '', role: 'technicien' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = (mode, user = null) => {
    setModalMode(mode);
    if (mode === 'edit' && user) {
      setEditingUserId(user.id);
      setFormData({ nom: user.nom, prenom: user.prenom, email: user.email, password: '', role: user.role });
    } else {
      setEditingUserId(null);
      setFormData({ nom: '', prenom: '', email: '', password: '', role: 'technicien' });
    }
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (modalMode === 'create') {
        await api.post('/admin/users', formData);
      } else {
        // Partial update: don't send password if empty
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        await api.patch(`/admin/users/${editingUserId}`, updateData);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur lors de l'opération");
    } finally {
      setIsSubmitting(false);
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

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-kofert-dark">Gestion des Utilisateurs</h1>
          <p className="text-gray-500 mt-2 text-lg">Créez et gérez les comptes techniciens et superviseurs.</p>
        </div>
        <button
          onClick={() => handleOpenModal('create')}
          className="btn-primary flex items-center gap-2 self-start"
        >
          <UserPlus size={20} />
          <span>Nouvel Utilisateur</span>
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
                  {modalMode === 'create' ? 'Ajouter un utilisateur' : 'Modifier l\'utilisateur'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Prénom</label>
                    <input
                      required
                      className="input-field"
                      value={formData.prenom}
                      onChange={e => setFormData({ ...formData, prenom: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Nom</label>
                    <input
                      required
                      className="input-field"
                      value={formData.nom}
                      onChange={e => setFormData({ ...formData, nom: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                  <input
                    required
                    type="email"
                    disabled={modalMode === 'edit'}
                    className={`input-field ${modalMode === 'edit' ? 'bg-gray-50 text-gray-400' : ''}`}
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                    {modalMode === 'create' ? 'Mot de passe' : 'Nouveau mot de passe (laisser vide pour ne pas changer)'}
                  </label>
                  <input
                    required={modalMode === 'create'}
                    type="password"
                    className="input-field"
                    placeholder={modalMode === 'edit' ? '••••••••' : ''}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Rôle</label>
                  <select
                    className="input-field appearance-none"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="technicien">Technicien</option>
                    <option value="superviseur">Superviseur</option>
                    <option value="admin">Administrateur</option>
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
                    {isSubmitting ? "Traitement..." : modalMode === 'create' ? "Créer" : "Enregistrer"}
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
              placeholder="Rechercher un utilisateur..."
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
                <th className="px-6 py-4">Utilisateur</th>
                <th className="px-6 py-4">Rôle</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.photo_profil ? (
                        <img 
                          src={`${api.defaults.baseURL.replace(/\/api\/?$/, '')}${user.photo_profil}`} 
                          alt={`${user.prenom} ${user.nom}`}
                          className="w-10 h-10 rounded-full object-cover border border-gray-100"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-kofert-green/10 text-kofert-green rounded-full flex items-center justify-center font-bold">
                          {user.prenom[0]}{user.nom[0]}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-bold text-kofert-dark">{user.prenom} {user.nom}</span>
                        <span className="text-sm text-gray-400 flex items-center gap-1"><Mail size={12} /> {user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' :
                      user.role === 'superviseur' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                      }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.actif ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-kofert-green">
                        <Check size={14} className="bg-kofert-green/10 rounded-full p-0.5" /> ACTIF
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                        <X size={14} className="bg-gray-100 rounded-full p-0.5" /> DÉSACTIVÉ
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal('edit', user)}
                        className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user.id, user.actif)}
                        className={`p-2 rounded-lg transition-colors ${user.actif ? 'text-red-400 hover:bg-red-50' : 'text-kofert-green hover:bg-kofert-green/5'
                          }`}
                      >
                        {user.actif ? <UserMinus size={18} /> : <UserPlus size={18} />}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="Supprimer définitivement"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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

export default UserManagement;
