import { useState, useEffect } from 'react';
import { FaSpinner, FaStar } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../utils/api';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import StarRating from './StarRating';
import useAuthStore from '../stores/useAuthStore';

const ReviewList = ({ productId }) => {
  const { isAuthenticated, user } = useAuthStore();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [canReview, setCanReview] = useState(null);

  useEffect(() => {
    fetchReviews();
    fetchStats();
    if (isAuthenticated) {
      checkEligibility();
    }
  }, [productId, currentPage, isAuthenticated]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/products/${productId}/reviews`, {
        params: { page: currentPage, limit: 5 }
      });
      setReviews(data.data.reviews);
      setPagination(data.data.pagination);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get(`/products/${productId}/reviews/stats`);
      setStats(data.data);
    } catch (error) {
      console.error('Failed to fetch review stats:', error);
    }
  };

  const checkEligibility = async () => {
    try {
      const { data } = await api.get(`/products/${productId}/reviews/can-review`);
      setCanReview(data.data);
    } catch (error) {
      console.error('Failed to check eligibility:', error);
      setCanReview({ canReview: false, reason: 'error' });
    }
  };

  const handleReviewSuccess = (newReview) => {
    setShowReviewForm(false);
    fetchReviews();
    fetchStats();
  };

  const handleReplyAdded = (updatedReview) => {
    setReviews(reviews.map(r => r._id === updatedReview._id ? updatedReview : r));
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

      {/* Stats Summary */}
      {stats && stats.total > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {stats.distribution ? (
                  ((Object.keys(stats.distribution).reduce((sum, rating) => 
                    sum + (parseInt(rating) * stats.distribution[rating]), 0
                  )) / stats.total).toFixed(1)
                ) : '0.0'}
              </div>
              <StarRating 
                rating={stats.distribution ? (
                  (Object.keys(stats.distribution).reduce((sum, rating) => 
                    sum + (parseInt(rating) * stats.distribution[rating]), 0
                  )) / stats.total
                ) : 0} 
                size="lg" 
              />
              <p className="text-sm text-gray-600 mt-2">{stats.total} reviews</p>
            </div>

            {stats.distribution && (
              <div className="flex-1">
                {[5, 4, 3, 2, 1].map(rating => (
                  <div key={rating} className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium w-8">{rating}★</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{
                          width: `${stats.total > 0 ? (stats.distribution[rating] / stats.total) * 100 : 0}%`
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {stats.distribution[rating] || 0}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Write Review Button */}
      {isAuthenticated && !showReviewForm && canReview && (
        <>
          {canReview.canReview ? (
            <button
              onClick={() => setShowReviewForm(true)}
              className="mb-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <FaStar className="text-lg" />
              Write a Review
            </button>
          ) : (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-gray-600 text-sm">
                {canReview.reason === 'already_reviewed' && '✓ You have already reviewed this product'}
                {canReview.reason === 'no_purchase' && 'Purchase and receive this product to write a review'}
                {canReview.reason === 'error' && 'Unable to check review eligibility'}
              </p>
            </div>
          )}
        </>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <div className="mb-6">
          <ReviewForm
            productId={productId}
            onSuccess={handleReviewSuccess}
            onCancel={() => setShowReviewForm(false)}
          />
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-12">
          <FaSpinner className="animate-spin text-4xl text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg mb-4">No reviews yet</p>
          <p className="text-gray-500">Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <ReviewCard
              key={review._id}
              review={review}
              onReplyAdded={handleReplyAdded}
              isAdmin={user?.role === 'admin'}
            />
          ))}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {currentPage} of {pagination.pages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                disabled={currentPage === pagination.pages}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewList;
