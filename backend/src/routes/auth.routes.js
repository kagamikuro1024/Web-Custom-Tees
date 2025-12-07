import express from 'express';
import authController from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { registerValidation, loginValidation, validate } from '../middlewares/validators.js';

const router = express.Router();

// Public routes
router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

export default router;
