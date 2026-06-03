import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, Calendar, ClipboardList, User as UserIcon, Menu, X, FileText, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/kofert.jpg';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Tableau de bord', path: '/', icon: Home },
    { name: 'Calendrier', path: '/calendar', icon: Calendar },
  ];

  if (user?.role === 'technicien') {
    navItems.push({ name: 'Mes Inspections', path: '/', icon: ClipboardList });
  }

  if (user?.role === 'superviseur' || user?.role === 'admin') {
    navItems.push({ name: 'Anomalies', path: '/anomalies', icon: AlertTriangle });
  }

  // Everyone can manage fiches now
  if (user?.role) {
    navItems.push({ name: 'Configuration Fiches', path: '/admin/fiches', icon: ClipboardList });
  }

  if (user?.role === 'admin') {
    navItems.push(
      { name: 'Utilisateurs', path: '/admin/users', icon: UserIcon },
      { name: 'Équipements', path: '/admin/equipements', icon: FileText },
      { name: 'Journal d\'Audit', path: '/admin/audit', icon: ClipboardList }
    );
  }

  return (
    <div className="min-h-screen bg-kofert-gray flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 bg-white border-r border-black/5 flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 px-2 mb-10">
          <img src={logo} alt="Kofert Logo" className="h-10 w-auto rounded-xl object-contain" />
          <span className="font-bold text-2xl tracking-tight text-kofert-dark">Kofert</span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                location.pathname === item.path
                  ? 'bg-kofert-green text-white shadow-lg shadow-kofert-green/20'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-100">
          <div 
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigate('/profile');
            }}
            className="flex items-center gap-3 px-2 mb-6 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 overflow-hidden">
              {user?.photo_profil ? (
                <img src={`http://localhost:8000${user.photo_profil}`} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={20} />
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm truncate w-32">{user?.prenom} {user?.nom}</span>
              <span className="text-xs text-gray-400 capitalize">{user?.role}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <header className="md:hidden bg-white border-b border-black/5 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Kofert Logo" className="h-8 w-auto rounded-lg object-contain" />
          <span className="font-bold text-xl tracking-tight">Kofert</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-500">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-x-0 top-[65px] bg-white border-b border-black/5 z-40 p-4 shadow-xl"
          >
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl ${
                    location.pathname === item.path ? 'bg-kofert-green text-white' : 'text-gray-500'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 w-full px-4 py-3 text-red-500"
              >
                <LogOut size={20} />
                <span className="font-medium">Déconnexion</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full relative">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
