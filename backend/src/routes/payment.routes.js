import express from 'express';
import paymentController from '../controllers/payment.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @route   POST /api/payment/create-payment-url
 * @desc    Tạo URL thanh toán VNPAY
 * @access  Private (User đã đăng nhập)
 * @body    { orderId, amount, orderInfo?, bankCode? }
 */
router.post('/create-payment-url', protect, paymentController.createPaymentUrl);

/**
 * @route   GET /api/payment/vnpay-return
 * @desc    Nhận kết quả thanh toán từ VNPAY (User redirect)
 * @access  Public
 * @query   vnp_* params từ VNPAY
 */
router.get('/vnpay-return', paymentController.vnpayReturn);

/**
 * @route   GET /api/payment/vnpay-ipn
 * @desc    Nhận IPN từ VNPAY (Server-to-server)
 * @access  Public (VNPAY gọi đến)
 * @query   vnp_* params từ VNPAY
 */
router.get('/vnpay-ipn', paymentController.vnpayIPN);

/**
 * @route   POST /api/payment/query-transaction
 * @desc    Truy vấn trạng thái giao dịch
 * @access  Private
 * @body    { orderId }
 */
router.post('/query-transaction', protect, paymentController.queryTransaction);

export default router;
