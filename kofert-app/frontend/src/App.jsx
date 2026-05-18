import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import InspectionFiche from './pages/InspectionFiche';
import CalendarPage from './pages/CalendarPage';
import Layout from './components/Layout';
import UserManagement from './pages/admin/UserManagement';
import EquipmentManagement from './pages/admin/EquipmentManagement';
import AuditLogPage from './pages/admin/AuditLogPage';
import FicheManagement from './pages/admin/FicheManagement';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-kofert-gray">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-kofert-green"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;
  
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="inspection/:id" element={
            <ProtectedRoute roles={['technicien']}>
              <InspectionFiche />
            </ProtectedRoute>
          } />
          <Route path="calendar" element={<CalendarPage />} />
          
          {/* Admin Routes */}
          <Route path="admin/users" element={
            <ProtectedRoute roles={['admin']}>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="admin/equipements" element={
            <ProtectedRoute roles={['admin']}>
              <EquipmentManagement />
            </ProtectedRoute>
          } />
          <Route path="admin/audit" element={
            <ProtectedRoute roles={['admin']}>
              <AuditLogPage />
            </ProtectedRoute>
          } />
          <Route path="admin/fiches" element={
            <ProtectedRoute roles={['admin']}>
              <FicheManagement />
            </ProtectedRoute>
          } />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
