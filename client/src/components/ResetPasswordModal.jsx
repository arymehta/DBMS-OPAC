import { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { BACKEND_URL } from '../config';

const ResetPasswordModal = ({ isOpen, onClose, email, otp }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${BACKEND_URL}/auth/reset-password/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message);
        setTimeout(() => onClose(), 2000);
      } else {
        setError(data.message || 'Error resetting password');
      }
    } catch (err) {
      setError('Error resetting password');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Set New Password</h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-slate-400 hover:text-white transition disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-4 relative">
          <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={submitting}
              placeholder="Enter new password"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition disabled:opacity-50 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="mb-6 relative">
          <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={submitting}
            placeholder="Confirm password"
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition disabled:opacity-50"
          />
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}

        <button
          onClick={handleReset}
          disabled={submitting}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Resetting...' : 'Reset Password'}
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordModal;