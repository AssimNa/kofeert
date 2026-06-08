import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { LogIn, Loader2, AlertCircle, Mail, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/kofert.jpg';
import loginBg from '../assets/login_bg.png';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError('Identifiants incorrects. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-kofert-gray overflow-hidden font-sans">
      {/* Left Panel - Image & Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-kofert-dark items-center justify-center p-12">
        <div className="absolute inset-0 z-0">
          <img 
            src={loginBg} 
            alt="Industrial Background" 
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-kofert-dark via-kofert-dark/60 to-transparent"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl inline-block mb-8 border border-white/20">
              <img src={logo} alt="Kofert Logo" className="w-16 h-16 object-contain rounded-2xl" />
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
              L'excellence dans <br/> <span className="text-kofert-green">l'inspection industrielle.</span>
            </h1>
            <p className="text-gray-300 text-lg mb-10 max-w-md leading-relaxed">
              La plateforme Kofert vous offre des outils avancés pour numériser, suivre et optimiser vos processus d'inspection.
            </p>
            
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + (i * 0.1), type: 'spring' }}
                  className="w-2 h-2 rounded-full bg-kofert-green"
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Decorative background blur element */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-kofert-green/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="bg-white p-4 rounded-3xl shadow-xl shadow-kofert-green/10"
            >
              <img src={logo} alt="Kofert Logo" className="w-20 h-20 object-contain" />
            </motion.div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-kofert-green to-kofert-orange"></div>
            
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-kofert-dark tracking-tight mb-2">Bienvenue</h2>
              <p className="text-gray-500">Connectez-vous à votre compte</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium border border-red-100 overflow-hidden"
                  >
                    <AlertCircle size={20} className="shrink-0 text-red-500" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2 relative">
                <label htmlFor="email" className="text-sm font-semibold text-gray-700 ml-1 block">
                  Adresse Email
                </label>
                <div className="relative group">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${focusedField === 'email' ? 'text-kofert-green' : 'text-gray-400 group-hover:text-gray-500'}`}>
                    <Mail size={18} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 hover:bg-gray-100 focus:bg-white rounded-2xl border border-gray-200 focus:border-kofert-green focus:ring-4 focus:ring-kofert-green/10 outline-none transition-all duration-200 text-gray-800"
                    placeholder="tech@kofert.com"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2 relative">
                <label htmlFor="password" className="text-sm font-semibold text-gray-700 ml-1 block">
                  Mot de passe
                </label>
                <div className="relative group">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${focusedField === 'password' ? 'text-kofert-green' : 'text-gray-400 group-hover:text-gray-500'}`}>
                    <Lock size={18} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 hover:bg-gray-100 focus:bg-white rounded-2xl border border-gray-200 focus:border-kofert-green focus:ring-4 focus:ring-kofert-green/10 outline-none transition-all duration-200 text-gray-800"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01, boxShadow: "0 10px 25px -5px rgba(29, 158, 117, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-kofert-green text-white py-3.5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 mt-8 shadow-lg shadow-kofert-green/20 hover:bg-[#188a65] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={22} />
                ) : (
                  <>
                    <span>Se connecter</span>
                    <LogIn size={20} />
                  </>
                )}
              </motion.button>
            </form>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 font-medium">
              © {new Date().getFullYear()} Kofert Industrial Inspection.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
