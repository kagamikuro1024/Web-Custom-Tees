import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import { 
  FiArrowLeft,
  FiPackage,
  FiMapPin,
  FiUser,
  FiPhone,
  FiDollarSign,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiUpload,
  FiStar
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import ReviewForm from '../../components/ReviewForm';

const OrderDetailPage = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingProduct, setReviewingProduct] = useState(null);
  const [retryLoading, setRetryLoading] = useState(false);
  const hasShownError = useRef(false);

  useEffect(() => {
    if (!orderNumber || orderNumber === 'undefined' || orderNumber === 'null') {
      if (!hasShownError.current) {
        hasShownError.current = true;
        toast.error('Invalid order number');
        navigate('/orders', { replace: true });
      }
      return;
    }
    hasShownError.current = false;
    fetchOrderDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/orders/number/${orderNumber}`);
      setOrder(data.data);
    } catch (error) {
      console.error('Error fetching order detail:', error);
      toast.error('Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      setCancelling(true);
      await api.put(`/orders/${order._id}/cancel`, { reason: cancelReason });
      toast.success('Order cancelled successfully');
      setShowCancelModal(false);
      fetchOrderDetail();
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      awaiting_payment: 'bg-orange-100 text-orange-800 border-orange-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      processing: 'bg-purple-100 text-purple-800 border-purple-200',
      shipped: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const canCancelOrder = () => {
    return order && ['pending', 'awaiting_payment', 'confirmed'].includes(order.orderStatus);
  };

  const canUpdateDesign = () => {
    return order && ['pending', 'awaiting_payment', 'confirmed'].includes(order.orderStatus);
  };

  const handleRetryPayment = async () => {
    if (!order || !order._id) {
      console.error('Order not available:', order);
      toast.error('Order information not available. Please refresh the page.');
      return;
    }
    
    console.log('Retry payment for order:', order._id, 'orderNumber:', order.orderNumber);
    
    try {
      setRetryLoading(true);
      
      // Call retry payment API
      const { data } = await api.post(`/orders/${order._id}/retry-payment`);
      console.log('Retry payment response:', data);
      
      const { orderNumber, paymentMethod, totalAmount } = data.data;

      // Redirect based on payment method
      if (paymentMethod === 'vnpay') {
        // Create new VNPAY payment URL
        const vnpayResponse = await api.post('/payment/create-payment-url', {
          orderId: orderNumber,
          amount: totalAmount,
          orderInfo: `Thanh toan don hang ${orderNumber}`
        });
        
        if (vnpayResponse.data.success) {
          window.location.href = vnpayResponse.data.data.paymentUrl;
        }
      } 
      else if (paymentMethod === 'stripe') {
        // Create new Stripe checkout session
        const stripeResponse = await api.post('/stripe/create-checkout-session', {
          orderNumber: orderNumber
        });
        
        console.log('Stripe response:', stripeResponse.data);
        
        if (stripeResponse.data.success) {
          const redirectUrl = stripeResponse.data.data.url || stripeResponse.data.data.checkoutUrl;
          if (redirectUrl) {
            console.log('Redirecting to:', redirectUrl);
            window.location.href = redirectUrl;
          } else {
            console.error('No redirect URL found in response:', stripeResponse.data);
            toast.error('Failed to get payment URL');
          }
        }
      }
    } catch (error) {
      console.error('Retry payment error:', error);
      toast.error(error.response?.data?.message || 'Cannot retry payment. Please try again.');
    } finally {
      setRetryLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadDesign = async () => {
    if (!uploadFile) {
      toast.error('Please select a file');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', uploadFile);

      const { data } = await api.put(
        `/orders/${order._id}/items/${selectedItemIndex}/design`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.success('Design updated successfully!');
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadPreview(null);
      setSelectedItemIndex(null);
      fetchOrderDetail();
    } catch (error) {
      console.error('Error updating design:', error);
      toast.error(error.response?.data?.message || 'Failed to update design');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <FiArrowLeft /> Back to Orders
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Order #{order.orderNumber}
            </h1>
            <p className="text-gray-600 mt-2">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 ${getStatusColor(order.orderStatus)}`}>
              {order.orderStatus}
            </span>
            {order.orderStatus === 'awaiting_payment' && (
              <button
                onClick={handleRetryPayment}
                disabled={retryLoading || !order._id}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiDollarSign />
                {retryLoading ? 'Processing...' : 'Continue Payment'}
              </button>
            )}
            {canCancelOrder() && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                <FiXCircle />
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Warning Banner for awaiting_payment */}
      {order.orderStatus === 'awaiting_payment' && (
        <div className="mb-6 bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FiAlertTriangle className="text-orange-600 text-xl flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 mb-1">
                Payment Pending
              </h3>
              <p className="text-sm text-orange-800 mb-3">
                Your order is waiting for payment. Please complete payment within 1 hour or the order will be automatically cancelled.
              </p>
              <button
                onClick={handleRetryPayment}
                disabled={retryLoading || !order._id}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {retryLoading ? 'Processing...' : '💳 Continue Payment Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FiPackage /> Order Items
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {order.items.map((item, index) => (
                <div key={index} className="p-6">
                  <div className="flex gap-4">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {item.productName}
                      </h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Size: {item.selectedSize}</p>
                        {item.selectedColor && (
                          <p className="flex items-center gap-2">
                            Color: {item.selectedColor.name}
                            <span 
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: item.selectedColor.hexCode }}
                            />
                          </p>
                        )}
                        <p>Quantity: {item.quantity}</p>
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(item.price)} × {item.quantity} = {formatCurrency(item.subtotal)}
                        </p>
                      </div>
                      
                      {/* Custom Design */}
                      {item.customDesign?.imageUrl && (
                        <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                          <p className="text-sm font-semibold text-purple-900 mb-2">
                            ✨ Custom Design
                          </p>
                          <img
                            src={item.customDesign.imageUrl}
                            alt="Custom Design"
                            className="w-32 h-32 object-contain rounded border-2 border-purple-200 mb-2"
                          />
                          {canUpdateDesign() && (
                            <button
                              onClick={() => {
                                setSelectedItemIndex(index);
                                setShowUploadModal(true);
                              }}
                              className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded hover:bg-purple-700 transition flex items-center gap-1"
                            >
                              <FiUpload /> Change Design
                            </button>
                          )}
                        </div>
                      )}

                      {/* Review Button - Show only for delivered orders */}
                      {order.orderStatus === 'delivered' && (
                        <div className="mt-4">
                          <button
                            onClick={() => {
                              setReviewingProduct({
                                productId: item.product,
                                productName: item.productName,
                                productImage: item.productImage
                              });
                              setShowReviewModal(true);
                            }}
                            className="text-sm bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition flex items-center gap-2"
                          >
                            <FiStar /> Đánh giá sản phẩm
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Timeline</h2>
            <div className="space-y-4">
              {order.statusHistory
                ?.filter((history, index, self) => 
                  index === self.findIndex((h) => h.status === history.status)
                )
                .map((history, index, filteredArray) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      history.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                      history.status === 'delivered' ? 'bg-green-100 text-green-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {history.status === 'cancelled' ? <FiXCircle /> :
                       history.status === 'delivered' ? <FiCheckCircle /> :
                       <FiClock />}
                    </div>
                    {index < filteredArray.length - 1 && (
                      <div className="w-0.5 h-12 bg-gray-200"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-semibold text-gray-900 capitalize">
                      {history.status}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(history.timestamp)}
                    </p>
                    {history.note && (
                      <p className="text-sm text-gray-500 mt-1">{history.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              <FiDollarSign className="inline mr-2" />
              Order Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-medium">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping Fee:</span>
                <span className="font-medium">{formatCurrency(order.shippingFee)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span className="font-medium">-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
                <span>Total:</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiMapPin /> Shipping Address
            </h2>
            <div className="text-sm space-y-2">
              <p className="font-semibold flex items-center gap-2">
                <FiUser className="text-gray-400" />
                {order.shippingAddress?.fullName}
              </p>
              <p className="flex items-center gap-2">
                <FiPhone className="text-gray-400" />
                {order.shippingAddress?.phone}
              </p>
              <p className="text-gray-600">
                {order.shippingAddress?.addressLine1}
              </p>
              {order.shippingAddress?.addressLine2 && (
                <p className="text-gray-600">{order.shippingAddress.addressLine2}</p>
              )}
              <p className="text-gray-600">
                {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
              </p>
              <p className="text-gray-600">
                {order.shippingAddress?.country}
              </p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Payment Information
            </h2>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Method:</span>
                <span className="font-medium uppercase">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${
                  order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">Order Notes</h3>
              <p className="text-sm text-yellow-800">{order.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Design Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 rounded-full p-3">
                <FiUpload className="text-2xl text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Update Custom Design</h3>
                <p className="text-sm text-gray-600">Upload a new design image</p>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Image *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {uploadPreview && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <img
                  src={uploadPreview}
                  alt="Preview"
                  className="w-full h-48 object-contain border border-gray-300 rounded-lg"
                />
              </div>
            )}

            {order.orderStatus === 'confirmed' && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <FiAlertTriangle className="inline mr-1" />
                  <strong>Note:</strong> Updating design will reset order status to Pending for re-confirmation.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                  setUploadPreview(null);
                  setSelectedItemIndex(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleUploadDesign}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                disabled={uploading || !uploadFile}
              >
                {uploading ? 'Uploading...' : 'Upload Design'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && reviewingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-fadeIn">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <FiStar className="text-blue-200" /> Đánh giá sản phẩm
                </h3>
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setReviewingProduct(null);
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition"
                >
                  <FiXCircle className="text-2xl" />
                </button>
              </div>
              
              {/* Product Info */}
              <div className="flex items-center gap-4 bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
                <img 
                  src={reviewingProduct.productImage} 
                  alt={reviewingProduct.productName}
                  className="w-20 h-20 rounded-lg object-cover border-2 border-white shadow-lg"
                />
                <div className="flex-1">
                  <p className="font-semibold text-lg">{reviewingProduct.productName}</p>
                  <p className="text-blue-100 text-sm">Chia sẻ trải nghiệm của bạn với sản phẩm này</p>
                </div>
              </div>
            </div>
            
            {/* Review Form */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              <ReviewForm
                productId={reviewingProduct.productId}
                orderId={order._id}
                onSuccess={() => {
                  setShowReviewModal(false);
                  setReviewingProduct(null);
                  toast.success('Cảm ơn bạn đã đánh giá! 🌟');
                  // Reload order data to refresh product ratings
                  fetchOrderDetails();
                }}
                onCancel={() => {
                  setShowReviewModal(false);
                  setReviewingProduct(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <FiAlertTriangle className="text-2xl text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Cancel Order</h3>
                <p className="text-sm text-gray-600">Order #{order.orderNumber}</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation *
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={4}
                placeholder="Please tell us why you're cancelling this order..."
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                disabled={cancelling}
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
