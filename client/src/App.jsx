import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Landing from './pages/Landing';
import CandidateAuth from './pages/CandidateAuth';
import AdminAuth from './pages/AdminAuth';
import useAuthContext from './hooks/useAuthContext';
import DashboardPage from './pages/DashboardPage';
import { Toaster } from 'sonner'; 
import MyFinesPage from './pages/MyFinesPage';
import {AdminDashboard} from "./pages/AdminDashboard";

function App() {
  const { state } = useAuthContext();
  const { isAuthenticated, user, loading } = state;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  const ProtectedRoute = ({ element, requiredRole }) => {
    if (!isAuthenticated) {
      return <Navigate to="/" replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
      if (user.role === 'ISSUER') {
        return <Navigate to="/issuer-home" replace />;
      } else if (user.role === 'ADMIN') {
        return <Navigate to="/admin-home" replace />;
      }
      return <Navigate to="/" replace />;
    }

    return element;
  };

  const AuthRoute = ({ element }) => {
    if (isAuthenticated) {
      if (user.role === 'ISSUER') {
        return <Navigate to="/issuer-home" replace />;
      } else if (user.role === 'ADMIN') {
        return <Navigate to="/admin-home" replace />;
      }
    }
    return element;
  };

  return (
    <>
      <Toaster />
      <Sidebar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/candidate-auth" element={<AuthRoute element={<CandidateAuth />} />} />
        <Route path="/admin-auth" element={<AuthRoute element={<AdminAuth />} />} />
        <Route path="/my-fines" element={<MyFinesPage />} />
        <Route
          path="/issuer-home"
          element={<ProtectedRoute element={<DashboardPage />} requiredRole="ISSUER" />}
        />
        <Route
          path="/admin-home"
          element={<ProtectedRoute element={<AdminDashboard />} requiredRole="ADMIN" />}
        />
      </Routes>
    </>
  );
}

export default App;