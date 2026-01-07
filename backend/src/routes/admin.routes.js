import express from 'express';
import adminController from '../controllers/admin.controller.js';
import productController from '../controllers/product.controller.js';
import statsController from '../controllers/stats.controller.js';
import reviewController from '../controllers/review.controller.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';
import { updateOrderStatusValidation, validate } from '../middlewares/validators.js';

const router = express.Router();

// All routes are admin only
router.use(protect, adminOnly);

// Dashboard statistics
router.get('/stats', adminController.getOrderStatistics);
router.get('/stats/dashboard', statsController.getDashboardStats);
router.get('/stats/revenue-trend', statsController.getRevenueTrend);
router.get('/stats/monthly-revenue', statsController.getMonthlyRevenue);
router.get('/stats/top-products', statsController.getTopProducts);
router.get('/stats/order-status', statsController.getOrderStatusDistribution);
router.get('/stats/recent-activities', statsController.getRecentActivities);
router.get('/stats/low-stock', statsController.getLowStockProducts);

// Order management
router.get('/orders', adminController.getAllOrders);
router.get('/orders/statistics', adminController.getOrderStatistics);
router.get('/orders/:orderId', adminController.getOrderById);
router.get('/orders/:orderId/designs', adminController.getOrderDesigns);
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

// Review management
router.get('/reviews', reviewController.getAllReviews);
router.put('/reviews/:reviewId/status', reviewController.updateReviewStatus);
router.delete('/reviews/:reviewId', reviewController.deleteReview);

export default router;
