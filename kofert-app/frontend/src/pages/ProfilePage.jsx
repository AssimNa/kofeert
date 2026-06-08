import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { User as UserIcon, Save, ArrowLeft, Camera, Trash2, Mail, Phone, MapPin, Map, Lock, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError("Erreur lors de l'upload de la photo");
      setTimeout(() => setError(''), 3000);
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
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError("Erreur lors de la suppression de la photo");
      setTimeout(() => setError(''), 3000);
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
      if (!payload.password) delete payload.password;

      const res = await api.put('/auth/me', payload);
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setSuccess('Profil mis à jour avec succès !');
      setTimeout(() => setSuccess(''), 3000);
      setFormData(prev => ({ ...prev, password: '' }));
    } catch (err) {
      setError("Erreur lors de la mise à jour: " + (err.response?.data?.detail || err.message));
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 max-w-5xl mx-auto pb-20"
    >
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-kofert-dark transition-colors font-semibold bg-white px-5 py-2.5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-x-1"
        >
          <ArrowLeft size={18} />
          Retour
        </button>
        <h1 className="text-4xl font-extrabold text-kofert-dark tracking-tight">Mon Profil</h1>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }} className="overflow-hidden">
             <div className="bg-kofert-green/10 border border-kofert-green/20 text-kofert-green p-4 rounded-2xl flex items-center gap-3 font-bold mb-2">
              <CheckCircle size={20} />
              {success}
            </div>
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }} className="overflow-hidden">
             <div className="bg-red-50 border border-red-100 text-red-500 p-4 rounded-2xl flex items-center gap-3 font-bold mb-2">
              <AlertCircle size={20} />
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Card (Left Panel) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center relative overflow-hidden">
            {/* Subtle top gradient instead of heavy banner */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-kofert-green/10 via-kofert-green/5 to-transparent"></div>
            
            <div className="relative group mt-2 mb-6">
              <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-xl shadow-black/5 border-4 border-white overflow-hidden relative z-10">
                {user?.photo_profil ? (
                  <img src={`http://localhost:8000${user.photo_profil}`} alt="Profil" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-kofert-green to-[#157a5a] text-white flex items-center justify-center text-5xl font-black">
                    {user?.prenom?.[0]}{user?.nom?.[0]}
                  </div>
                )}
                
                {/* Overlay for hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                   <Camera size={28} className="text-white" />
                </div>
              </div>
              
              <label className="absolute inset-0 z-20 cursor-pointer rounded-full" title="Changer la photo">
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
              
              {user?.photo_profil && (
                <button
                  type="button"
                  onClick={handlePhotoDelete}
                  disabled={loading}
                  className="absolute bottom-1 right-1 p-3 bg-white text-red-500 rounded-full cursor-pointer hover:bg-red-50 hover:text-red-600 transition-colors shadow-lg border border-gray-100 z-30"
                  title="Supprimer la photo"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            
            <h2 className="text-2xl font-black text-kofert-dark relative z-10">{user?.prenom} {user?.nom}</h2>
            <div className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 bg-kofert-green/10 text-kofert-green rounded-full relative z-10 border border-kofert-green/20">
              <Shield size={14} />
              <span className="text-xs font-bold uppercase tracking-widest">{user?.role}</span>
            </div>
            
            <div className="w-full h-px bg-gray-100 my-6 relative z-10"></div>
            
            <div className="w-full space-y-4 text-left relative z-10">
              <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
                <Mail size={16} className="text-gray-400" />
                <span className="truncate">{user?.email}</span>
              </div>
              {user?.telephone && (
                <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
                  <Phone size={16} className="text-gray-400" />
                  <span>{user?.telephone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Section (Right Panel) */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-10">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-6 gap-4">
              <div>
                <h3 className="text-2xl font-bold text-kofert-dark">Informations Personnelles</h3>
                <p className="text-sm text-gray-500 mt-1">Mettez à jour vos informations de contact.</p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-kofert-dark hover:bg-black text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                <span>{loading ? "Sauvegarde..." : "Sauvegarder"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2 relative">
                <label className="text-sm font-bold text-gray-600 ml-1">Prénom *</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input required name="prenom" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-kofert-green/50 focus:border-kofert-green outline-none transition-all font-medium text-gray-800 focus:bg-white" value={formData.prenom} onChange={handleChange} />
                </div>
              </div>
              
              <div className="space-y-2 relative">
                <label className="text-sm font-bold text-gray-600 ml-1">Nom *</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input required name="nom" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-kofert-green/50 focus:border-kofert-green outline-none transition-all font-medium text-gray-800 focus:bg-white" value={formData.nom} onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-2 relative md:col-span-2">
                <label className="text-sm font-bold text-gray-600 ml-1">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input required type="email" name="email" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-kofert-green/50 focus:border-kofert-green outline-none transition-all font-medium text-gray-800 focus:bg-white" value={formData.email} onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-2 relative">
                <label className="text-sm font-bold text-gray-600 ml-1">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input name="telephone" placeholder="+212 ..." className="w-full pl-11 pr-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-kofert-green/50 focus:border-kofert-green outline-none transition-all font-medium text-gray-800 focus:bg-white" value={formData.telephone} onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-2 relative">
                <label className="text-sm font-bold text-gray-600 ml-1">Ville</label>
                <div className="relative">
                  <Map className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input name="ville" placeholder="Casablanca" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-kofert-green/50 focus:border-kofert-green outline-none transition-all font-medium text-gray-800 focus:bg-white" value={formData.ville} onChange={handleChange} />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2 relative">
                <label className="text-sm font-bold text-gray-600 ml-1">Adresse</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 text-gray-400" size={18} />
                  <textarea name="adresse" rows="2" placeholder="123 Rue de l'Exemple..." className="w-full pl-11 pr-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-kofert-green/50 focus:border-kofert-green outline-none transition-all font-medium text-gray-800 focus:bg-white resize-none" value={formData.adresse} onChange={handleChange} />
                </div>
              </div>
            </div>

          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
