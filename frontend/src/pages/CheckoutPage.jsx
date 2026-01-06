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
    notes: ''
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
      toast.error('Please select delivery location on map');
      return;
    }

    if (!formData.fullName || !formData.email || !formData.phone || !formData.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare order items from cart
      const orderItems = cart.items.map(item => ({
        product: item.product._id,
        productName: item.product.name,
        productImage: item.product.images?.[0]?.url || '',
        quantity: item.quantity,
        price: item.priceAtAdd,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        customDesign: item.customDesign || undefined,
        subtotal: item.priceAtAdd * item.quantity
      }));

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
          country: 'Vietnam'
        },
        paymentMethod: 'cod',
        notes: formData.notes
      };

      console.log('Submitting order:', orderData);

      const { data } = await api.post('/orders', orderData);
      toast.success('Đặt hàng thành công!');
      navigate(`/order-success/${data.data.orderNumber}`);
    } catch (error) {
      console.error('Order error:', error);
      console.error('Error response:', error.response?.data);
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
              <h2 className="text-xl font-bold mb-4">Customer Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
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
                  <label className="block text-sm font-medium mb-2">Phone *</label>
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
                  <label className="block text-sm font-medium mb-2">Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Street address, city, district"
                    required
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Order Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="input-field"
                  rows="3"
                  placeholder="Special instructions for your order..."
                ></textarea>
              </div>
            </div>

            {/* Delivery Location Map */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaMapMarkerAlt className="text-primary-600 text-xl" />
                <h2 className="text-xl font-bold">Select Delivery Location</h2>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Click on the map to set your delivery location. Distance and shipping cost will be calculated automatically.
              </p>

              {/* Map Legend */}
              <div className="flex gap-6 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <FaStore className="text-blue-600" />
                  <span>Store: Hanoi Center</span>
                </div>
                {deliveryLocation && (
                  <>
                    <div className="flex items-center gap-2">
                      <FaShippingFast className="text-green-600" />
                      <span>Distance: {distance.toFixed(2)} km</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-primary-600">
                        Shipping: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shippingCost)}
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
                <p className="text-red-500 text-sm mt-2">* Please click on the map to select delivery location</p>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              
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
                  <span>Subtotal</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}
                  </span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium">
                    {deliveryLocation 
                      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shippingCost)
                      : 'Select location'
                    }
                  </span>
                </div>
              </div>

              <div className="border-t mt-4 pt-4 flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-primary-600">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                </span>
              </div>

              {/* Payment Method */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium mb-2">Payment Method</p>
                <div className="flex items-center gap-2">
                  <input type="radio" checked readOnly />
                  <span className="text-sm">Cash on Delivery (COD)</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !deliveryLocation}
                className="btn btn-primary w-full py-4 text-lg font-bold mt-6 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Place Order'}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By placing this order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
