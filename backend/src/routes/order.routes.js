import express from 'express';
import orderController from '../controllers/order.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { createOrderValidation, validate } from '../middlewares/validators.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', createOrderValidation, validate, orderController.createOrder);
router.get('/stats', orderController.getUserOrderStats);
router.get('/', orderController.getUserOrders);
router.get('/:orderId', orderController.getOrderById);
router.get('/number/:orderNumber', orderController.getOrderByNumber);
router.put('/:orderId/cancel', orderController.cancelOrder);
router.put('/:orderId/items/:itemIndex/design', orderController.updateCustomDesign);

export default router;
