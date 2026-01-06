import express from 'express';
import adminController from '../controllers/admin.controller.js';
import productController from '../controllers/product.controller.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';
import { updateOrderStatusValidation, validate } from '../middlewares/validators.js';

const router = express.Router();

// All routes are admin only
router.use(protect, adminOnly);

// Dashboard statistics
router.get('/stats', adminController.getOrderStatistics);

// Order management
router.get('/orders', adminController.getAllOrders);
router.get('/orders/statistics', adminController.getOrderStatistics);
router.get('/orders/:orderId', adminController.getOrderById);
router.put('/orders/:orderId/status', updateOrderStatusValidation, validate, adminController.updateOrderStatus);
router.put('/orders/:orderId/tracking', adminController.updateTrackingInfo);

// Product management
router.get('/products', adminController.getAllProducts);
router.post('/products', productController.createProduct);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

// Category management
router.post('/categories', adminController.createCategory);
router.get('/categories', adminController.getAllCategories);

export default router;
