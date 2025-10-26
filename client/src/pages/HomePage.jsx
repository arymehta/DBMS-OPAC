import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import Announcements from '../components/Announcements';
import Features from '../components/Features';
import Footer from '../components/Footer';
import useAuthContext from '../hooks/useAuthContext';

const HomePage = () => {
  const { state } = useAuthContext();
  const navigate = useNavigate();

  // useEffect(() => {
  //   if (state.isAuthenticated && state.user) {
  //     if (state.user.role === 'ISSUER') {
  //       navigate('/issuer-home');
  //     } else if (state.user.role === 'ADMIN') {
  //       navigate('/admin-home');
  //     }
  //   }
  // }, [state.isAuthenticated, state.user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation />
      <Hero />
      <Announcements />
      <Features />
      <Footer />
    </div>
  );
};

export default HomePage;