import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FaMapMarkerAlt, FaStore, FaShippingFast } from 'react-icons/fa';
import useCartStore from '../stores/useCartStore';
import useAuthStore from '../stores/useAuthStore';
import api from '../utils/api';
import toast from 'react-hot-toast';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Store location (Hanoi center as example)
const STORE_LOCATION = { lat: 21.0285, lng: 105.8542 };

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Calculate shipping cost
const calculateShipping = (distance) => {
  const BASE_COST = 20000; // 20,000đ base
  const COST_PER_KM = 5000; // 5,000đ per km
  return BASE_COST + (distance * COST_PER_KM);
};

// Map click handler component
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      });
    },
  });

  return position ? <Marker position={[position.lat, position.lng]} /> : null;
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { cart, fetchCart } = useCartStore();
  
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [distance, setDistance] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    notes: '',
    paymentMethod: 'cod' // Default payment method
  });

  useEffect(() => {
    fetchCart().catch(() => {});
  }, [fetchCart]);

  useEffect(() => {
    if (deliveryLocation) {
      const dist = calculateDistance(
        STORE_LOCATION.lat,
        STORE_LOCATION.lng,
        deliveryLocation.lat,
        deliveryLocation.lng
      );
      setDistance(dist);
      setShippingCost(calculateShipping(dist));
    }
  }, [deliveryLocation]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!deliveryLocation) {
      toast.error('Vui lòng chọn vị trí giao hàng trên bản đồ');
      return;
    }

    if (!formData.fullName || !formData.email || !formData.phone || !formData.address) {
      toast.error('Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare order items from cart
      const orderItems = cart.items.map(item => {
        // Ensure selectedColor is always an object with name and hexCode
        let colorData = item.selectedColor;
        if (typeof colorData === 'string') {
          colorData = { name: colorData, hexCode: '' };
        } else if (!colorData || typeof colorData !== 'object') {
          colorData = { name: 'Mặc định', hexCode: '' };
        }

        return {
          product: item.product._id,
          productName: item.product.name,
          productImage: item.product.images?.[0]?.url || '',
          quantity: item.quantity,
          price: item.priceAtAdd,
          selectedSize: item.selectedSize,
          selectedColor: colorData,
          customDesign: item.customDesign || undefined,
          subtotal: item.priceAtAdd * item.quantity
        };
      });

      const orderData = {
        items: orderItems,
        subtotal: cart.totalPrice,
        shippingFee: Math.round(shippingCost),
        totalAmount: cart.totalPrice + Math.round(shippingCost),
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          addressLine1: formData.address,
          city: 'Hà Nội',
          state: 'Hà Nội',
          postalCode: '100000',
          country: 'Việt Nam'
        },
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      };

      console.log('=== ORDER DATA DEBUG ===');
      console.log('Payment Method:', formData.paymentMethod);
      console.log('Payment Method Type:', typeof formData.paymentMethod);
      console.log('Full orderData:', JSON.stringify(orderData, null, 2));
      console.log('========================');

      // Create order
      const { data } = await api.post('/orders', orderData);
      const order = data.data;
      
      // Handle payment based on method
      if (formData.paymentMethod === 'vnpay') {
        console.log('Creating VNPAY payment URL...');
        
        const paymentData = {
          orderId: order.orderNumber,
          amount: order.totalAmount,
          orderInfo: `Thanh toan don hang ${order.orderNumber}`,
          bankCode: ''
        };

        const paymentResponse = await api.post('/payment/create-payment-url', paymentData);
        
        if (paymentResponse.data.success) {
          window.location.href = paymentResponse.data.data.paymentUrl;
        } else {
          throw new Error('Failed to create payment URL');
        }
      } else if (formData.paymentMethod === 'stripe') {
        console.log('Creating Stripe checkout session...');
        
        const paymentResponse = await api.post('/stripe/create-checkout-session', {
          orderNumber: order.orderNumber
        });
        
        if (paymentResponse.data.success) {
          console.log('✅ Stripe checkout session created');
          // Redirect to Stripe checkout page
          window.location.href = paymentResponse.data.data.checkoutUrl;
        } else {
          throw new Error('Failed to create Stripe checkout session');
        }
      } else {
        // COD payment - go to success page
        toast.success('Đặt hàng thành công!');
        navigate(`/order-success/${order.orderNumber}`);
      }
    } catch (error) {
      console.error('Order error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Full errors array:', error.response?.data?.errors);
      
      // Show detailed validation errors
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        error.response.data.errors.forEach((err, index) => {
          console.error(`Validation Error ${index + 1}:`, err);
        });
      }
      
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.message || 'Không thể tạo đơn hàng';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cart || cart.items?.length === 0) {
    return (
      <div className="container-custom py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <button onClick={() => navigate('/shop')} className="btn btn-primary">
          Continue Shopping
        </button>
      </div>
    );
  }

  const subtotal = cart.totalPrice || 0;
  const total = subtotal + shippingCost;

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Customer Info & Map */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Thông tin khách hàng</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Họ và tên *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Số điện thoại *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Địa chỉ giao hàng *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Địa chỉ, quận, huyện"
                    required
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Ghi chú đơn hàng (Tùy chọn)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="input-field"
                  rows="3"
                  placeholder="Yêu cầu đặc biệt cho đơn hàng của bạn..."
                ></textarea>
              </div>
            </div>

            {/* Delivery Location Map */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaMapMarkerAlt className="text-primary-600 text-xl" />
                <h2 className="text-xl font-bold">Chọn vị trí giao hàng</h2>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Nhấn vào bản đồ để đặt vị trí giao hàng. Khoảng cách và phí vận chuyển sẽ được tính toán tự động.
              </p>

              {/* Map Legend */}
              <div className="flex gap-6 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <FaStore className="text-blue-600" />
                  <span>Cửa hàng: Trung tâm Hà Nội</span>
                </div>
                {deliveryLocation && (
                  <>
                    <div className="flex items-center gap-2">
                      <FaShippingFast className="text-green-600" />
                      <span>Khoảng cách: {distance.toFixed(2)} km</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-primary-600">
                        Phí giao hàng: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shippingCost)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Map */}
              <div className="h-96 rounded-lg overflow-hidden border-2 border-gray-200">
                <MapContainer
                  center={[STORE_LOCATION.lat, STORE_LOCATION.lng]}
                  zoom={12}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  {/* Store marker */}
                  <Marker
                    position={[STORE_LOCATION.lat, STORE_LOCATION.lng]}
                    icon={new L.Icon({
                      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                      iconSize: [25, 41],
                      iconAnchor: [12, 41],
                      popupAnchor: [1, -34],
                      shadowSize: [41, 41]
                    })}
                  />
                  
                  {/* Delivery location marker */}
                  <LocationMarker position={deliveryLocation} setPosition={setDeliveryLocation} />
                </MapContainer>
              </div>

              {!deliveryLocation && (
                <p className="text-red-500 text-sm mt-2">* Vui lòng nhấn vào bản đồ để chọn vị trí giao hàng</p>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Tóm tắt đơn hàng</h2>
              
              {/* Items */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item._id} className="flex gap-3 text-sm">
                    <img
                      src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/150'}
                      alt={item.product?.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-grow">
                      <p className="font-medium line-clamp-1">{item.product?.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.selectedSize} / {item.selectedColor?.name} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.priceAtAdd * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}
                  </span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Phí giao hàng</span>
                  <span className="font-medium">
                    {deliveryLocation 
                      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shippingCost)
                      : 'Chọn vị trí'
                    }
                  </span>
                </div>
              </div>

              <div className="border-t mt-4 pt-4 flex justify-between text-xl font-bold">
                <span>Tổng cộng</span>
                <span className="text-primary-600">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                </span>
              </div>

              {/* Payment Method */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium mb-3">Phương thức thanh toán</p>
                
                <div className="space-y-3">
                  {/* COD Option */}
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-white transition">
                    <input 
                      type="radio" 
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <div className="flex-grow">
                      <span className="text-sm font-medium">💵 Thanh toán khi nhận hàng (COD)</span>
                      <p className="text-xs text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</p>
                    </div>
                  </label>

                  {/* VNPAY Option */}
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-white transition">
                    <input 
                      type="radio" 
                      name="paymentMethod"
                      value="vnpay"
                      checked={formData.paymentMethod === 'vnpay'}
                      onChange={handleInputChange}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <div className="flex-grow">
                      <span className="text-sm font-medium">🏦 VNPAY</span>
                      <p className="text-xs text-gray-500">Thanh toán trực tuyến qua cổng VNPAY</p>
                    </div>
                  </label>

                  {/* Stripe Option - International Payment */}
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-white transition">
                    <input 
                      type="radio" 
                      name="paymentMethod"
                      value="stripe"
                      checked={formData.paymentMethod === 'stripe'}
                      onChange={handleInputChange}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <div className="flex-grow">
                      <span className="text-sm font-medium">💳 Thẻ tín dụng/Ghi nợ</span>
                      <p className="text-xs text-gray-500">Thanh toán quốc tế qua Stripe</p>
                      <div className="flex gap-1 mt-1">
                        <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">Visa</span>
                        <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">Mastercard</span>
                        <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">Secure</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !deliveryLocation}
                className="btn btn-primary w-full py-4 text-lg font-bold mt-6 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Đang xử lý...' : 
                 formData.paymentMethod === 'stripe' ? '💳 Thanh toán bằng thẻ' :
                 formData.paymentMethod === 'vnpay' ? 'Thanh toán bằng VNPAY' : 
                 'Đặt hàng'}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Bằng việc đặt hàng, bạn đồng ý với các điều khoản và điều kiện của chúng tôi
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
