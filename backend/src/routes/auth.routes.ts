import { Router } from 'express';
import {
  AuthController,
  registerValidation,
  loginValidation
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/authenticate';
import rateLimit from 'express-rate-limit';

// Max 10 login attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.post('/register', authLimiter, registerValidation, AuthController.register);
router.post('/login', authLimiter, loginValidation, AuthController.login);
router.post('/logout', authenticate, AuthController.logout);
router.post('/forgot-password', authLimiter, AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

export default router;