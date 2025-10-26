import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CandidateLogin from './components/CandidateLogin';
import CandidateSignup from './components/CandidateSignup';
import AdminLogin from './components/AdminLogin';
import useAuthContext from './hooks/useAuthContext';
import DashboardPage from './pages/DashboardPage';

function App() {
  const { state } = useAuthContext();

  const ProtectedRoute = ({ element, requiredRole }) => {
    if (!state.isAuthenticated) {
      return <Navigate to="/candidate-login" replace />;
    }

    if (requiredRole && state.user.role !== requiredRole) {
      if (state.user.role === 'ISSUER') {
        return <Navigate to="/issuer-home" replace />;
      }
      return <Navigate to="/" replace />;
    }

    return element;
  };

  const AuthRoute = ({ element }) => {
    if (state.isAuthenticated) {
      if (state.user.role === 'ISSUER') {
        return <Navigate to="/issuer-home" replace />;
      } else if (state.user.role === 'ADMIN') {
        return <Navigate to="/admin-home" replace />;
      }
    }
    return element;
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/candidate-login" element={<AuthRoute element={<CandidateLogin />} />} />
        <Route path="/candidate-signup" element={<AuthRoute element={<CandidateSignup />} />} />
        <Route path="/admin-login" element={<AuthRoute element={<AdminLogin />} />} />

        <Route path="/issuer-home" element={<ProtectedRoute element={<DashboardPage />} requiredRole="ISSUER" />} />
        <Route path="/admin-home" element={<ProtectedRoute element={<div>Admin Home</div>} requiredRole="ADMIN" />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<DashboardPage />} requiredRole="ISSUER" />} />
      </Routes>
    </>
  );
}

export default App;