import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader, ArrowRight } from 'lucide-react';
import useAuthContext from '../hooks/useAuthContext';
import { BACKEND_URL } from '../config';

const AdminAuth = () => {
  const navigate = useNavigate();
  const { dispatch } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.user.role !== 'ADMIN') {
          setError('Admin access required');
          return;
        }

        dispatch({
          type: 'LOGIN',
          payload: { token: data.token, user: data.user }
        });
        navigate('/admin-home');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 text-center">
              OPAC
            </h1>
            <p className="text-center text-gray-600 mt-2 font-semibold">
              Admin Portal
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter admin email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading && <Loader size={20} className="animate-spin" />}
              Sign In
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-sm">
              Need candidate access?{' '}
              <a
                href="/candidate-auth?mode=login"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Switch to Candidate Login
              </a>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          Admin access only. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
};

export default AdminAuth;