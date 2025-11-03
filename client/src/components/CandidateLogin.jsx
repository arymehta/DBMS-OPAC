import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import AuthLayout from './AuthLayout';
import OtpModal from './OtpModal';
import ResetPasswordModal from './ResetPasswordModal';
import { BACKEND_URL } from '../config';
import useAuthContext from '../hooks/useAuthContext';
import { BACKEND_URL } from "../config"; 

const CandidateLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetOtp, setResetOtp] = useState('');
  const navigate = useNavigate();
  const { dispatch } = useAuthContext();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        dispatch({
          type: 'LOGIN',
          payload: { user: data.user, token: data.token }
        });
        navigate('/issuer-home');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Error logging in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      setError('Please enter your email');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${BACKEND_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });

      const data = await res.json();

      if (res.ok) {
        setShowForgotPassword(false);
        setShowOtpModal(true);
      } else {
        setError(data.message || 'Error sending OTP');
      }
    } catch (err) {
      setError('Error sending OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSuccess = (data) => {
    if (showForgotPassword) {
      setResetOtp(data.otp);
      setShowOtpModal(false);
      setShowResetPasswordModal(true);
    }
  };

  return (
    <AuthLayout title="Candidate Login" subtitle="Welcome back to OPAC">
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              placeholder="your@email.com"
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition disabled:opacity-50"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition disabled:opacity-50"
              required
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        <button
          type="button"
          onClick={() => {
            setShowForgotPassword(true);
            setForgotEmail(email);
          }}
          className="w-full text-blue-400 hover:text-blue-300 text-sm font-medium transition"
        >
          Forgot Password?
        </button>

        <p className="text-center text-slate-400">
          Don't have an account? <Link to="/candidate-signup" className="text-blue-400 hover:text-blue-300 font-medium">Sign up</Link>
        </p>
      </form>

      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">Reset Password</h2>
            <p className="text-slate-400 mb-6">Enter your email to receive a password reset OTP</p>
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowForgotPassword(false)}
                className="flex-1 py-3 border border-slate-600 text-slate-300 rounded-lg hover:border-slate-500 font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleForgotPassword}
                disabled={isLoading}
                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-semibold transition disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          </div>
        </div>
      )}

      <OtpModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        email={forgotEmail}
        purpose="RESET_PASSWORD"
        onSuccess={handleOtpSuccess}
        isLoading={isLoading}
      />

      <ResetPasswordModal
        isOpen={showResetPasswordModal}
        onClose={() => {
          setShowResetPasswordModal(false);
          setShowForgotPassword(false);
          setForgotEmail('');
        }}
        email={forgotEmail}
        otp={resetOtp}
      />
    </AuthLayout>
  );
};

export default CandidateLogin;