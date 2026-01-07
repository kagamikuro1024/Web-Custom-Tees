import reviewService from '../services/review.service.js';

class ReviewController {
  // Create a new review
  async createReview(req, res, next) {
    try {
      // Handle uploaded images
      const images = req.files ? req.files.map(file => file.path) : [];
      
      const review = await reviewService.createReview(req.user.id, {
        ...req.body,
        images
      });
      
      res.status(201).json({
        success: true,
        message: 'Review submitted for approval',
        data: review
      });
    } catch (error) {
      next(error);
    }
  }

  // Get reviews for a product
  async getProductReviews(req, res, next) {
    try {
      const { productId } = req.params;
      const { page, limit, sortBy, status } = req.query;
      
      const result = await reviewService.getProductReviews(productId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        sortBy: sortBy || '-createdAt',
        status: status || 'approved'
      });
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user's reviews
  async getUserReviews(req, res, next) {
    try {
      const { page, limit } = req.query;
      
      const result = await reviewService.getUserReviews(req.user.id, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10
      });
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Update a review
  async updateReview(req, res, next) {
    try {
      const { reviewId } = req.params;
      const review = await reviewService.updateReview(reviewId, req.user.id, req.body);
      
      res.json({
        success: true,
        message: 'Review updated successfully',
        data: review
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete a review
  async deleteReview(req, res, next) {
    try {
      const { reviewId } = req.params;
      const isAdmin = req.user.role === 'admin';
      
      const result = await reviewService.deleteReview(reviewId, req.user.id, isAdmin);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  // Add admin reply
  async addReply(req, res, next) {
    try {
      const { reviewId } = req.params;
      const { comment } = req.body;
      
      const review = await reviewService.addReply(reviewId, req.user.id, comment);
      
      res.json({
        success: true,
        message: 'Reply added successfully',
        data: review
      });
    } catch (error) {
      next(error);
    }
  }

  // Vote review as helpful
  async voteHelpful(req, res, next) {
    try {
      const { reviewId } = req.params;
      const review = await reviewService.voteHelpful(reviewId, req.user.id);
      
      res.json({
        success: true,
        message: 'Thank you for your feedback',
        data: review
      });
    } catch (error) {
      next(error);
    }
  }

  // Update review status (admin only)
  async updateReviewStatus(req, res, next) {
    try {
      const { reviewId } = req.params;
      const { status } = req.body;
      
      const review = await reviewService.updateReviewStatus(reviewId, status);
      
      res.json({
        success: true,
        message: 'Review status updated',
        data: review
      });
    } catch (error) {
      next(error);
    }
  }

  // Get review statistics
  async getReviewStats(req, res, next) {
    try {
      const { productId } = req.params;
      const stats = await reviewService.getReviewStats(productId);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  // Check if user can review a product
  async checkEligibility(req, res, next) {
    try {
      const { productId } = req.params;
      const result = await reviewService.canUserReview(req.user.id, productId);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Get all reviews with filters
  async getAllReviews(req, res, next) {
    try {
      const { page = 1, limit = 10, status, rating, search } = req.query;
      
      const result = await reviewService.getAllReviews({
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        rating: rating ? parseInt(rating) : undefined,
        search
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ReviewController();
