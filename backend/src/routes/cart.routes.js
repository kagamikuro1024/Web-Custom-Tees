import express from 'express';
import cartController from '../controllers/cart.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { addToCartValidation, validate } from '../middlewares/validators.js';

const router = express.Router();

// All routes are protected (require authentication)
router.use(protect);

router.get('/', cartController.getCart);
router.post('/items', addToCartValidation, validate, cartController.addToCart);
router.put('/items/:itemId', cartController.updateCartItem);
router.delete('/items/:itemId', cartController.removeCartItem);
router.delete('/clear', cartController.clearCart);

export default router;
