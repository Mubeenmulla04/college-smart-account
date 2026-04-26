import express from 'express';
import rateLimit from 'express-rate-limit';
const router = express.Router();
import * as authController from '../Controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { loginSchema } from '../validators/studentValidator.js';

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message: { success: false, message: 'Too many attempts, please try again later' }
});

router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/verify-otp', authRateLimiter, authController.verifyOTP);
router.post('/register', authRateLimiter, authController.register);
router.post('/forgot-password', authRateLimiter, authController.forgotPassword);
router.post('/social-login', authRateLimiter, authController.socialLogin);

export default router;
