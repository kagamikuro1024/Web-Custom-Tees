import express from 'express';
import reviewController from '../controllers/review.controller.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/products/:productId/reviews', reviewController.getProductReviews);
router.get('/products/:productId/reviews/stats', reviewController.getReviewStats);

// Protected routes (require authentication)
router.use(protect);

router.post('/reviews', reviewController.createReview);
router.get('/reviews/me', reviewController.getUserReviews);
router.put('/reviews/:reviewId', reviewController.updateReview);
router.delete('/reviews/:reviewId', reviewController.deleteReview);
router.post('/reviews/:reviewId/helpful', reviewController.voteHelpful);

// Admin only routes
router.post('/reviews/:reviewId/reply', adminOnly, reviewController.addReply);
router.put('/reviews/:reviewId/status', adminOnly, reviewController.updateReviewStatus);

export default router;
