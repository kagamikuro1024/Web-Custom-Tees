import express from 'express';
import productController from '../controllers/product.controller.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';
import { productValidation, validate } from '../middlewares/validators.js';

const router = express.Router();

// Public routes
router.get('/', productController.getAllProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/customizable', productController.getCustomizableProducts);
router.get('/:slug', productController.getProductBySlug);

// Admin routes
router.get('/admin/products', protect, adminOnly, productController.getAllProductsAdmin);
router.post('/', protect, adminOnly, productValidation, validate, productController.createProduct);
router.put('/:id', protect, adminOnly, productController.updateProduct);
router.delete('/:id', protect, adminOnly, productController.deleteProduct);

export default router;
