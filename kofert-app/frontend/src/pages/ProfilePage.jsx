import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { User as UserIcon, Save, ArrowLeft, Camera, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
    adresse: user?.adresse || '',
    ville: user?.ville || '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);

    try {
      setLoading(true);
      const res = await api.post('/auth/me/photo', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setSuccess('Photo de profil mise à jour !');
    } catch (err) {
      setError("Erreur lors de l'upload de la photo");
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const handlePhotoDelete = async () => {
    try {
      setLoading(true);
      const res = await api.delete('/auth/me/photo');
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setSuccess('Photo de profil supprimée !');
    } catch (err) {
      setError("Erreur lors de la suppression de la photo");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password; // Don't send empty password

      const res = await api.put('/auth/me', payload);
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setSuccess('Profil mis à jour avec succès !');
      setFormData(prev => ({ ...prev, password: '' })); // clear password field
    } catch (err) {
      setError("Erreur lors de la mise à jour: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-kofert-dark transition-colors font-medium"
      >
        <ArrowLeft size={18} />
        Retour
      </button>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="h-48 bg-kofert-dark w-full relative">
          {/* Header background */}
        </div>

        <div className="px-8 pb-10">
          <div className="relative flex justify-between items-end -mt-16 mb-8">
            <div className="flex items-end gap-6">
              <div className="relative group">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white overflow-hidden">
                  {user?.photo_profil ? (
                    <img src={`http://localhost:8000${user.photo_profil}`} alt="Profil" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-kofert-green/10 text-kofert-green flex items-center justify-center text-4xl font-black">
                      {user?.prenom?.[0]}{user?.nom?.[0]}
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-kofert-dark text-white rounded-full cursor-pointer hover:bg-kofert-green transition-colors shadow-lg">
                  <Camera size={16} />
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
                {user?.photo_profil && (
                  <button
                    type="button"
                    onClick={handlePhotoDelete}
                    disabled={loading}
                    className="absolute top-0 right-0 p-2 bg-red-500 text-white rounded-full cursor-pointer hover:bg-red-600 transition-colors shadow-lg"
                    title="Supprimer la photo"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div className="mb-2">
                <h1 className="text-3xl font-black text-kofert-dark">{user?.prenom} {user?.nom}</h1>
                <p className="text-sm font-bold text-kofert-green uppercase tracking-widest mt-1">{user?.role}</p>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary flex items-center gap-2 mb-2"
            >
              <Save size={20} />
              <span>{loading ? "Sauvegarde..." : "save"}</span>
            </button>
          </div>

          {success && <div className="bg-green-50 text-green-600 p-4 rounded-xl mb-6 font-bold">{success}</div>}
          {error && <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 font-bold">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-500 ml-1">Prénom *</label>
                <input
                  required
                  name="prenom"
                  className="input-field bg-gray-50/50"
                  value={formData.prenom}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-500 ml-1">Nom *</label>
                <input
                  required
                  name="nom"
                  className="input-field bg-gray-50/50"
                  value={formData.nom}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-500 ml-1">Email *</label>
                <input
                  required
                  type="email"
                  name="email"
                  className="input-field bg-gray-50/50"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-500 ml-1">Téléphone</label>
                <input
                  name="telephone"
                  placeholder="+212 ..."
                  className="input-field bg-gray-50/50"
                  value={formData.telephone}
                  onChange={handleChange}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-black text-gray-500 ml-1">Adresse</label>
                <input
                  name="adresse"
                  placeholder="123 Rue de l'Exemple..."
                  className="input-field bg-gray-50/50"
                  value={formData.adresse}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-500 ml-1">Ville</label>
                <input
                  name="ville"
                  placeholder="Casablanca"
                  className="input-field bg-gray-50/50"
                  value={formData.ville}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100">
              <h3 className="text-xl font-black text-kofert-dark mb-6">Sécurité</h3>
              <div className="space-y-2 max-w-md">
                <label className="text-sm font-black text-gray-500 ml-1">Nouveau Mot de passe (optionnel)</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Laisser vide pour ne pas changer"
                  className="input-field bg-gray-50/50"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
