import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import { 
  FiArrowLeft,
  FiDownload,
  FiImage,
  FiPackage,
  FiMapPin,
  FiUser,
  FiPhone,
  FiMail,
  FiClock,
  FiDollarSign,
  FiExternalLink
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminOrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/admin/orders/${orderId}`);
      setOrder(data.data || data.order);
    } catch (error) {
      console.error('Error fetching order detail:', error);
      toast.error('Failed to load order details');
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated');
      fetchOrderDetail();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const downloadDesign = (imageUrl, itemIndex) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `order-${orderId}-item-${itemIndex + 1}-design.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Design downloaded');
  };

  const downloadAllDesigns = () => {
    const itemsWithDesign = order.items.filter(item => item.customDesign);
    
    if (itemsWithDesign.length === 0) {
      toast.error('No custom designs in this order');
      return;
    }

    toast.loading(`Downloading ${itemsWithDesign.length} design(s)...`);
    
    itemsWithDesign.forEach((item, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = item.customDesign.imageUrl;
        link.download = `order-${orderId}-design-${index + 1}.png`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 500); // Delay to avoid browser blocking
    });

    setTimeout(() => {
      toast.dismiss();
      toast.success(`Downloaded ${itemsWithDesign.length} design(s)`);
    }, itemsWithDesign.length * 500 + 500);
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
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      processing: 'bg-purple-100 text-purple-800 border-purple-200',
      shipping: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
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

  const hasCustomDesigns = order.items?.some(item => item.customDesign?.imageUrl);
  const designCount = order.items?.filter(item => item.customDesign?.imageUrl).length || 0;

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/orders')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <FiArrowLeft /> Back to Orders
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-gray-600 mt-2">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          
          {hasCustomDesigns && (
            <button
              onClick={downloadAllDesigns}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <FiDownload />
              Download All Designs ({designCount})
            </button>
          )}
        </div>
      </div>

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
                    {/* Product Image */}
                    <div className="w-24 h-24 flex-shrink-0">
                      <img
                        src={item.productImage || '/placeholder.png'}
                        alt={item.productName}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {item.productName || 'Product Deleted'}
                      </h3>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p>Size: <span className="font-medium">{item.selectedSize}</span></p>
                        <p>Color: <span className="font-medium">{item.selectedColor?.name}</span></p>
                        <p>Quantity: <span className="font-medium">{item.quantity}</span></p>
                        <p className="text-gray-900 font-semibold">
                          {formatCurrency(item.price)} × {item.quantity} = {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Custom Design Section - Only show for products with custom designs */}
                  {item.customDesign?.imageUrl && (
                    <div className="mt-4 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-purple-900 flex items-center gap-2">
                          <FiImage className="text-lg" />
                          Custom Design - READY FOR PRINTING
                        </h4>
                        <button
                          onClick={() => downloadDesign(item.customDesign.imageUrl, index)}
                          className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                        >
                          <FiDownload /> Download Original
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Design Preview */}
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Design Preview:</p>
                          <div className="bg-white rounded-lg p-4 border-2 border-purple-300">
                            <img
                              src={item.customDesign.imageUrl}
                              alt="Custom Design"
                              className="w-full h-48 object-contain"
                            />
                          </div>
                        </div>
                        
                        {/* Design Info & Download Links */}
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Design Information:</p>
                          <div className="space-y-2 text-sm">
                            <div className="bg-white rounded-lg p-3 border border-purple-200">
                              <p className="text-gray-600 mb-1">Placement:</p>
                              <p className="font-medium">
                                {item.customDesign.placement?.location || 'Front'} - 
                                Position: ({item.customDesign.placement?.x}%, {item.customDesign.placement?.y}%)
                              </p>
                              <p className="text-gray-600 mt-2">Size: {item.customDesign.placement?.width}px × {item.customDesign.placement?.height}px</p>
                            </div>
                            
                            {/* Download Links for Printing */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <p className="font-semibold text-yellow-900 mb-2 flex items-center gap-1">
                                🖨️ For Printing Team:
                              </p>
                              <div className="space-y-2">
                                <a
                                  href={item.customDesign.imageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                  <FiExternalLink />
                                  View Original Image (Cloudinary)
                                </a>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(item.customDesign.imageUrl);
                                    toast.success('Image URL copied!');
                                  }}
                                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 transition"
                                >
                                  📋 Copy Image URL
                                </button>
                                <p className="text-xs text-gray-600 mt-2">
                                  Public ID: <code className="bg-white px-1 py-0.5 rounded text-purple-700">{item.customDesign.publicId}</code>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiDollarSign /> Order Summary
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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Status</h2>
            <select
              value={order.orderStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`w-full px-4 py-2 text-sm font-semibold rounded-lg border-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(order.orderStatus)}`}
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiUser /> Customer Information
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Name:</p>
                <p className="font-medium">{order.shippingAddress?.fullName}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1 flex items-center gap-1">
                  <FiPhone className="text-xs" /> Phone:
                </p>
                <p className="font-medium">{order.shippingAddress?.phone}</p>
              </div>
              {order.userId?.email && (
                <div>
                  <p className="text-gray-600 mb-1 flex items-center gap-1">
                    <FiMail className="text-xs" /> Email:
                  </p>
                  <p className="font-medium break-all">{order.userId.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiMapPin /> Shipping Address
            </h2>
            <div className="space-y-2 text-sm">
              <p className="font-medium">{order.shippingAddress?.fullName}</p>
              <p className="text-gray-600">{order.shippingAddress?.addressLine1}</p>
              {order.shippingAddress?.addressLine2 && (
                <p className="text-gray-600">{order.shippingAddress.addressLine2}</p>
              )}
              <p className="text-gray-600">
                {order.shippingAddress?.city}, {order.shippingAddress?.state}
              </p>
              <p className="text-gray-600">
                {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
              </p>
            </div>
          </div>

          {/* Order Notes */}
          {order.notes && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Notes</h2>
              <p className="text-sm text-gray-600 italic">"{order.notes}"</p>
            </div>
          )}

          {/* Payment Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Information</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Method:</span>
                <span className="font-medium capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  order.paymentStatus === 'paid' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
