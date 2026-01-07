import { useState } from 'react';
import { FiThumbsUp, FiMessageCircle } from 'react-icons/fi';
import { FaCheckCircle } from 'react-icons/fa';
import StarRating from './StarRating';
import toast from 'react-hot-toast';
import api from '../utils/api';
import useAuthStore from '../stores/useAuthStore';

const ReviewCard = ({ review, onReplyAdded, isAdmin }) => {
  const { user } = useAuthStore();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const handleVoteHelpful = async () => {
    try {
      await api.post(`/reviews/${review._id}/helpful`);
      toast.success('Thank you for your feedback!');
    } catch (error) {
      toast.error('Failed to vote');
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    
    if (!replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    try {
      setSubmittingReply(true);
      const { data } = await api.post(`/reviews/${review._id}/reply`, {
        comment: replyText.trim()
      });

      toast.success('Reply added successfully');
      setReplyText('');
      setShowReplyForm(false);
      
      if (onReplyAdded) {
        onReplyAdded(data.data);
      }
    } catch (error) {
      toast.error('Failed to add reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* User Info */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
          {review.user?.firstName?.charAt(0)}{review.user?.lastName?.charAt(0)}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                {review.user?.firstName} {review.user?.lastName}
                {review.isVerifiedPurchase && (
                  <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <FaCheckCircle className="text-xs" />
                    Verified Purchase
                  </span>
                )}
              </h4>
              <p className="text-xs text-gray-500">
                {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <StarRating rating={review.rating} size="md" />
          </div>
        </div>
      </div>

      {/* Review Comment */}
      <p className="text-gray-700 mb-4 leading-relaxed whitespace-pre-wrap">
        {review.comment}
      </p>

      {/* Review Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Review ${index + 1}`}
              className="w-24 h-24 object-cover rounded-lg border border-gray-200"
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
        <button
          onClick={handleVoteHelpful}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
        >
          <FiThumbsUp />
          <span>Helpful {review.helpfulVotes > 0 && `(${review.helpfulVotes})`}</span>
        </button>

        {isAdmin && !review.reply && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
          >
            <FiMessageCircle />
            <span>Reply</span>
          </button>
        )}
      </div>

      {/* Reply Form (Admin only) */}
      {showReplyForm && isAdmin && (
        <form onSubmit={handleSubmitReply} className="mt-4 pl-16">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
          />
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => {
                setShowReplyForm(false);
                setReplyText('');
              }}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingReply || !replyText.trim()}
              className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {submittingReply ? 'Posting...' : 'Post Reply'}
            </button>
          </div>
        </form>
      )}

      {/* Existing Reply */}
      {review.reply && (
        <div className="mt-4 pl-16 bg-gray-50 rounded-lg p-4 border-l-4 border-primary-500">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-primary-600 uppercase">
              Store Response
            </span>
            <span className="text-xs text-gray-500">
              {new Date(review.reply.repliedAt).toLocaleDateString('vi-VN')}
            </span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {review.reply.comment}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
