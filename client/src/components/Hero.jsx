import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthContext from '../hooks/useAuthContext';

const Hero = () => {
  const { state } = useAuthContext();

  return (
    <section className="relative overflow-hidden pt-20 pb-32">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Welcome to <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">OPAC you</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto">
          A professional platform for credential verification and management
        </p>

        {!state.isAuthenticated && (
          <div className="flex flex-col md:flex-row gap-4 justify-center mb-12">
            <Link
              to="/candidate-login"
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-semibold flex items-center justify-center space-x-2"
            >
              <span>Get Started as Candidate</span>
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/admin-login"
              className="px-8 py-3 border border-slate-500 text-slate-300 rounded-lg hover:border-blue-400 hover:text-blue-400 transition font-semibold"
            >
              Admin Access
            </Link>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <div className="text-3xl mb-4">🔐</div>
            <h3 className="text-lg font-semibold text-white mb-2">Secure</h3>
            <p className="text-slate-400">Industry-leading security for your credentials</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold text-white mb-2">Fast</h3>
            <p className="text-slate-400">Instant verification and credential access</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <div className="text-3xl mb-4">✨</div>
            <h3 className="text-lg font-semibold text-white mb-2">Reliable</h3>
            <p className="text-slate-400">Trusted by thousands of organizations</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;