import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiUser, FiPackage, FiEdit, FiTrash2, FiCheck, FiX, FiMessageSquare } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import StarRating from '../../components/StarRating';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    rating: '',
    search: '',
    hasReply: '' // 'true', 'false', or ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [filters, pagination.page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status,
        rating: filters.rating,
        search: filters.search
        // hasReply will be filtered client-side
      };
      
      const { data } = await api.get('/admin/reviews', { params });
      setReviews(data.data.reviews);
      setPagination(prev => ({
        ...prev,
        total: data.data.pagination.total,
        totalPages: data.data.pagination.totalPages
      }));
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  // Filter reviews client-side for hasReply
  const getFilteredReviews = () => {
    if (!filters.hasReply) return reviews;
    
    const hasReply = filters.hasReply === 'true';
    return reviews.filter(review => hasReply ? !!review.reply : !review.reply);
  };

  const filteredReviews = getFilteredReviews();

  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      await api.put(`/admin/reviews/${reviewId}/status`, { status: newStatus });
      toast.success(`Review ${newStatus === 'approved' ? 'approved' : 'rejected'}`);
      fetchReviews();
    } catch (error) {
      console.error('Error updating review status:', error);
      toast.error('Failed to update review status');
    }
  };

  const handleAddReply = async (reviewId) => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/reviews/${reviewId}/reply`, { comment: replyText });
      toast.success('Reply added successfully');
      setReplyingTo(null);
      setReplyText('');
      fetchReviews();
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await api.delete(`/admin/reviews/${reviewId}`);
      toast.success('Review deleted successfully');
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải đánh giá...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý đánh giá</h1>
        <p className="text-gray-600">Xem và trả lời đánh giá từ khách hàng</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên sản phẩm..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={filters.rating}
            onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả đánh giá</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>

          <select
            value={filters.hasReply}
            onChange={(e) => setFilters({ ...filters, hasReply: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả</option>
            <option value="false">Chưa trả lời</option>
            <option value="true">Đã trả lời</option>
          </select>

          <button
            onClick={() => setFilters({ status: '', rating: '', search: '', hasReply: '' })}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Reset
          </button>
        </div>

        {/* Stats */}
        <div className="mt-4 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <span className="text-gray-600">Chưa trả lời: <span className="font-semibold">{reviews.filter(r => !r.reply).length}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-gray-600">Đã trả lời: <span className="font-semibold">{reviews.filter(r => r.reply).length}</span></span>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredReviews.length === 0 ? (
          <div className="p-12 text-center">
            <FiStar className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Chưa có đánh giá nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredReviews.map((review) => (
              <div 
                key={review._id} 
                className={`p-6 hover:bg-gray-50 transition ${!review.reply ? 'border-l-4 border-blue-500 bg-blue-50/30' : 'border-l-4 border-green-500'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Status Badge */}
                    <div className="flex flex-col gap-2">
                      {!review.reply && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          🆕 Mới
                        </span>
                      )}
                      {review.reply && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          ✅ Đã trả lời
                        </span>
                      )}
                    </div>

                    {/* Product Image */}
                    <Link to={`/products/${review.product?.slug || review.product?._id}`}>
                      <img
                        src={review.product?.images?.[0]?.url || '/placeholder.jpg'}
                        alt={review.product?.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    </Link>

                    <div className="flex-1">
                      {/* Product & User Info */}
                      <div className="mb-2">
                        <Link 
                          to={`/products/${review.product?.slug || review.product?._id}`}
                          className="font-semibold text-gray-900 hover:text-blue-600"
                        >
                          {review.product?.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                          <FiUser className="text-gray-400" />
                          <span>{review.user?.name || 'Anonymous'}</span>
                          <span>•</span>
                          <span>{formatDate(review.createdAt)}</span>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="mb-2">
                        <StarRating rating={review.rating} size="sm" readonly />
                      </div>

                      {/* Comment */}
                      <p className="text-gray-700 mb-3">{review.comment}</p>

                      {/* Admin Reply */}
                      {review.adminReply && (
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                          <div className="flex items-center gap-2 mb-2">
                            <FiMessageSquare className="text-blue-600" />
                            <span className="font-semibold text-blue-900">Admin đã trả lời:</span>
                          </div>
                          <p className="text-gray-700">{review.adminReply.comment}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatDate(review.adminReply.createdAt)}
                          </p>
                        </div>
                      )}

                      {/* Reply Form */}
                      {replyingTo === review._id && (
                        <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Nhập phản hồi của bạn..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAddReply(review._id)}
                              disabled={submitting}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                            >
                              {submitting ? 'Đang gửi...' : 'Gửi phản hồi'}
                            </button>
                            <button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText('');
                              }}
                              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(review.status)}`}>
                      {review.status}
                    </span>

                    <div className="flex gap-2">
                      {review.status !== 'approved' && (
                        <button
                          onClick={() => handleStatusChange(review._id, 'approved')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded transition"
                          title="Approve"
                        >
                          <FiCheck />
                        </button>
                      )}
                      
                      {review.status !== 'rejected' && (
                        <button
                          onClick={() => handleStatusChange(review._id, 'rejected')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                          title="Reject"
                        >
                          <FiX />
                        </button>
                      )}

                      {!review.adminReply && (
                        <button
                          onClick={() => setReplyingTo(review._id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Reply"
                        >
                          <FiMessageSquare />
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            disabled={pagination.page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="px-4 py-2 text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          
          <button
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            disabled={pagination.page === pagination.totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
