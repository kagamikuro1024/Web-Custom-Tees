import mongoose from 'mongoose';
import Review from '../models/Review.model.js';
import Product from '../models/Product.model.js';
import Order from '../models/Order.model.js';

class ReviewService {
  // Create a new review
  async createReview(userId, reviewData) {
    const { productId, orderId, rating, comment, images } = reviewData;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ product: productId, user: userId });
    if (existingReview) {
      throw new Error('You have already reviewed this product');
    }

    // Verify if this is a verified purchase
    let isVerifiedPurchase = false;
    if (orderId) {
      const order = await Order.findOne({
        _id: orderId,
        user: userId,
        orderStatus: 'delivered',
        'items.product': productId
      });
      isVerifiedPurchase = !!order;
    }

    // Create review
    const review = await Review.create({
      product: productId,
      user: userId,
      order: orderId || null,
      rating,
      comment,
      images: images || [],
      isVerifiedPurchase
    });

    await review.populate('user', 'firstName lastName avatar');
    
    return review;
  }

  // Get reviews for a product
  async getProductReviews(productId, options = {}) {
    const { page = 1, limit = 10, sortBy = '-createdAt', status = 'approved' } = options;

    const query = { product: productId };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('user', 'firstName lastName avatar')
        .populate('reply.repliedBy', 'firstName lastName')
        .sort(sortBy)
        .skip(skip)
        .limit(limit),
      Review.countDocuments(query)
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get user's reviews
  async getUserReviews(userId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ user: userId })
        .populate('product', 'name images price')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ user: userId })
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Update a review
  async updateReview(reviewId, userId, updateData) {
    const review = await Review.findOne({ _id: reviewId, user: userId });
    
    if (!review) {
      throw new Error('Review not found or unauthorized');
    }

    const { rating, comment, images } = updateData;
    
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    if (images !== undefined) review.images = images;

    await review.save();
    await review.populate('user', 'firstName lastName avatar');

    return review;
  }

  // Delete a review
  async deleteReview(reviewId, userId, isAdmin = false) {
    const query = isAdmin ? { _id: reviewId } : { _id: reviewId, user: userId };
    const review = await Review.findOne(query);
    
    if (!review) {
      throw new Error('Review not found or unauthorized');
    }

    const productId = review.product;
    await review.remove();

    // Update product rating
    await Review.updateProductRating(productId);

    return { message: 'Review deleted successfully' };
  }

  // Add admin reply to review
  async addReply(reviewId, adminId, replyComment) {
    const review = await Review.findById(reviewId);
    
    if (!review) {
      throw new Error('Review not found');
    }

    review.reply = {
      comment: replyComment,
      repliedBy: adminId,
      repliedAt: new Date()
    };

    await review.save();
    await review.populate([
      { path: 'user', select: 'firstName lastName avatar' },
      { path: 'reply.repliedBy', select: 'firstName lastName' }
    ]);

    return review;
  }

  // Vote review as helpful
  async voteHelpful(reviewId, userId) {
    const review = await Review.findById(reviewId);
    
    if (!review) {
      throw new Error('Review not found');
    }

    review.helpfulVotes += 1;
    await review.save();

    return review;
  }

  // Update review status (admin only)
  async updateReviewStatus(reviewId, status) {
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status },
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName avatar');

    if (!review) {
      throw new Error('Review not found');
    }

    // Update product rating if status changed
    await Review.updateProductRating(review.product);

    return review;
  }

  // Check if user can review a product (must have delivered order with product)
  async canUserReview(userId, productId) {
    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ product: productId, user: userId });
    if (existingReview) {
      return { canReview: false, reason: 'already_reviewed' };
    }

    // Check if user has a delivered order with this product
    const deliveredOrder = await Order.findOne({
      user: userId,
      orderStatus: 'delivered',
      'items.product': productId
    });

    if (!deliveredOrder) {
      return { canReview: false, reason: 'no_purchase' };
    }

    return { canReview: true, orderId: deliveredOrder._id };
  }

  // Get review statistics for a product
  async getReviewStats(productId) {
    const stats = await Review.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId),
          status: 'approved'
        }
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: -1 }
      }
    ]);

    const total = await Review.countDocuments({
      product: productId,
      status: 'approved'
    });

    // Format stats
    const ratingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    };

    stats.forEach(stat => {
      ratingDistribution[stat._id] = stat.count;
    });

    return {
      total,
      distribution: ratingDistribution
    };
  }

  // Admin: Get all reviews with filters
  async getAllReviews(options) {
    const { page = 1, limit = 10, status, rating, search } = options;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (rating) {
      query.rating = rating;
    }
    
    if (search) {
      // Search in product name or user name
      const searchRegex = new RegExp(search, 'i');
      // We'll need to do this with aggregation
    }

    let reviews;
    let total;

    if (search) {
      // Use aggregation for search
      const pipeline = [
        {
          $lookup: {
            from: 'products',
            localField: 'product',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $match: {
            ...query,
            $or: [
              { 'product.name': { $regex: search, $options: 'i' } },
              { 'user.name': { $regex: search, $options: 'i' } }
            ]
          }
        },
        { $sort: { createdAt: -1 } },
        {
          $facet: {
            reviews: [
              { $skip: skip },
              { $limit: limit }
            ],
            total: [
              { $count: 'count' }
            ]
          }
        }
      ];

      const result = await Review.aggregate(pipeline);
      reviews = result[0].reviews;
      total = result[0].total[0]?.count || 0;
    } else {
      // Regular query
      reviews = await Review.find(query)
        .populate('product', 'name images slug')
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      total = await Review.countDocuments(query);
    }

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}

export default new ReviewService();
