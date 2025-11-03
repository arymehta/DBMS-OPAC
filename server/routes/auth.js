import express from 'express';
import {
  signup,
  verifyOtp,
  login,
  requestResetPassword,
  confirmResetPassword,
  resendOtp,
  checkAuth,
  adminSignup
} from '../controllers/auth.js';

const router = express.Router();

router.post('/admin/register', adminSignup);

router.post('/signup', signup);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', login);
router.post('/reset-password', requestResetPassword);
router.get('/check-auth', checkAuth);
router.post('/reset-password/confirm', confirmResetPassword);

export default router;
