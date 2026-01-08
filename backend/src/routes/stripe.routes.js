import express from 'express';
import * as stripeController from '../controllers/stripe.controller.js';
import * as stripeVerifyController from '../controllers/stripe-verify.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Create Stripe checkout session (authenticated users only)
router.post('/create-checkout-session', protect, stripeController.createCheckoutSession);

// Verify payment status (no auth - called from frontend after redirect)
router.get('/verify-payment', stripeVerifyController.verifyPayment);

// Webhook endpoint (no auth - Stripe will call this)
// Note: This needs raw body, will be handled in server.js
router.post('/webhook', stripeController.handleWebhook);

// Check payment status
router.get('/status/:orderNumber', protect, stripeController.checkPaymentStatus);

export default router;
