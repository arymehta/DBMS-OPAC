import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import useAuthContext from '../hooks/useAuthContext';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { state, dispatch } = useAuthContext();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    setIsOpen(false);
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">OP</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">OPAC</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#announcements" className="text-slate-300 hover:text-blue-400 transition">Announcements</a>
            <a href="#features" className="text-slate-300 hover:text-blue-400 transition">Features</a>
            {!state.isAuthenticated ? (
              <>
                <Link to="/candidate-login" className="text-slate-300 hover:text-blue-400 transition">Candidate Login</Link>
                <Link to="/admin-login" className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-medium">
                  Admin
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-red-400 transition"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            )}
          </div>

          <button onClick={toggleMenu} className="md:hidden text-slate-300">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <a href="#announcements" className="block text-slate-300 hover:text-blue-400 py-2">Announcements</a>
            <a href="#features" className="block text-slate-300 hover:text-blue-400 py-2">Features</a>
            {!state.isAuthenticated ? (
              <>
                <Link to="/candidate-login" className="block text-slate-300 hover:text-blue-400 py-2">Candidate Login</Link>
                <Link to="/admin-login" className="block px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-center font-medium">
                  Admin
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-slate-300 hover:text-red-400 transition"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;