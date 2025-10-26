import { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';
import { BACKEND_URL } from '../config';

const OtpModal = ({ isOpen, onClose, email, purpose, onSuccess, isLoading }) => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && timer === 0) {
      setTimer(300);
    }
  }, [isOpen]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && isOpen) {
      setCanResend(true);
    }
  }, [timer, isOpen]);

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${BACKEND_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, purpose })
      });

      const data = await res.json();

      if (res.ok) {
        onSuccess(data);
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Error verifying OTP');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setCanResend(false);
    setTimer(300);
    setError('');

    try {
      const res = await fetch(`${BACKEND_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose })
      });

      const data = await res.json();
      if (!res.ok) setError(data.message || 'Error resending OTP');
    } catch (err) {
      setError('Error resending OTP');
    }
  };

  if (!isOpen) return null;

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Verify OTP</h2>
          <button
            onClick={onClose}
            disabled={submitting || isLoading}
            className="text-slate-400 hover:text-white transition disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        <p className="text-slate-400 mb-6">Enter the OTP sent to {email}</p>

        <div className="mb-6">
          <input
            type="text"
            maxLength="6"
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            disabled={submitting || isLoading}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-2xl text-center tracking-widest placeholder-slate-500 focus:outline-none focus:border-blue-500 transition disabled:opacity-50"
          />
        </div>

        <div className="flex items-center justify-between mb-6 text-sm">
          <div className="flex items-center space-x-2 text-slate-400">
            <Clock size={16} />
            <span>
              {minutes}:{seconds.toString().padStart(2, '0')} remaining
            </span>
          </div>
          {canResend ? (
            <button
              onClick={handleResendOtp}
              disabled={submitting || isLoading}
              className="text-blue-400 hover:text-blue-300 font-medium transition disabled:opacity-50"
            >
              Resend OTP
            </button>
          ) : (
            <span className="text-slate-500">Resend in {minutes}:{seconds.toString().padStart(2, '0')}</span>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleVerifyOtp}
          disabled={submitting || isLoading || otp.length !== 6}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting || isLoading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </div>
    </div>
  );
};

export default OtpModal;