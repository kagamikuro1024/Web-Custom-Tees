# Retry Payment API Documentation

## Overview
API endpoint cho phép user thử lại thanh toán với đơn hàng có trạng thái `awaiting_payment`.

---

## Backend Implementation

### Endpoint
```
POST /api/orders/:orderId/retry-payment
```

### Authentication
- Required: Yes (protect middleware)
- User phải là owner của order

### Request
**Headers:**
```
Authorization: Bearer <token>
```

**URL Params:**
- `orderId` (string, required): MongoDB ObjectId của order

### Response

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Payment information retrieved. Please proceed to payment.",
  "data": {
    "orderId": "675c1234567890abcdef1234",
    "orderNumber": "ORD20240514123456",
    "paymentMethod": "vnpay", // hoặc "stripe"
    "totalAmount": 599000
  }
}
```

**Error Cases:**

1. Order not found (Error thrown):
```json
{
  "success": false,
  "message": "Order not found"
}
```

2. Invalid status (Error thrown):
```json
{
  "success": false,
  "message": "Cannot retry payment. Order status is confirmed"
}
```

3. Order expired (>1 hour, auto-cancelled):
```json
{
  "success": false,
  "message": "Order has expired and been cancelled. Please create a new order."
}
```

---

## Frontend Integration Guide

### 1. Hiển thị nút "Retry Payment" khi order status = awaiting_payment

```jsx
// OrderDetailPage.jsx hoặc UserOrdersPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const OrderCard = ({ order }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleRetryPayment = async () => {
    try {
      setLoading(true);
      
      // Call retry payment API
      const { data } = await api.post(`/orders/${order._id}/retry-payment`);
      
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
        
        if (stripeResponse.data.success) {
          window.location.href = stripeResponse.data.data.url;
        }
      }
    } catch (error) {
      console.error('Retry payment error:', error);
      alert(error.response?.data?.message || 'Cannot retry payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-card">
      <h3>Order #{order.orderNumber}</h3>
      <p>Status: {order.orderStatus}</p>
      <p>Total: {order.totalAmount.toLocaleString('vi-VN')} đ</p>

      {/* Show retry button only for awaiting_payment status */}
      {order.orderStatus === 'awaiting_payment' && (
        <button 
          onClick={handleRetryPayment}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Processing...' : 'Continue Payment'}
        </button>
      )}
    </div>
  );
};
```

### 2. Alternative: Show alert/banner for awaiting_payment orders

```jsx
{order.orderStatus === 'awaiting_payment' && (
  <div className="alert alert-warning">
    <p>⚠️ Your payment is pending. Please complete payment within 1 hour.</p>
    <button onClick={handleRetryPayment} className="btn btn-warning">
      Continue Payment
    </button>
  </div>
)}
```

### 3. User Orders List với trạng thái awaiting_payment

```jsx
// UserOrdersPage.jsx
const UserOrdersPage = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data } = await api.get('/orders');
    setOrders(data.data.orders);
  };

  return (
    <div className="orders-page">
      <h1>My Orders</h1>
      
      {/* Show pending payment orders first */}
      {orders
        .filter(o => o.orderStatus === 'awaiting_payment')
        .map(order => (
          <OrderCard key={order._id} order={order} />
        ))}
      
      {/* Then show other orders */}
      {orders
        .filter(o => o.orderStatus !== 'awaiting_payment')
        .map(order => (
          <OrderCard key={order._id} order={order} />
        ))}
    </div>
  );
};
```

---

## UI/UX Recommendations

### Status Badge Colors
```jsx
const getStatusBadgeColor = (status) => {
  switch(status) {
    case 'awaiting_payment': return 'bg-yellow-500'; // Vàng - cần hành động
    case 'confirmed': return 'bg-blue-500';          // Xanh dương
    case 'processing': return 'bg-indigo-500';       // Tím
    case 'shipped': return 'bg-purple-500';          // Tím đậm
    case 'delivered': return 'bg-green-500';         // Xanh lá - hoàn thành
    case 'cancelled': return 'bg-red-500';           // Đỏ
    default: return 'bg-gray-500';
  }
};
```

### Status Text Display
```jsx
const getStatusText = (status) => {
  switch(status) {
    case 'awaiting_payment': return 'Chờ thanh toán';
    case 'confirmed': return 'Đã xác nhận';
    case 'processing': return 'Đang xử lý';
    case 'shipped': return 'Đang giao hàng';
    case 'delivered': return 'Đã giao hàng';
    case 'cancelled': return 'Đã hủy';
    default: return status;
  }
};
```

### Example Complete Order Card Component
```jsx
const OrderCard = ({ order }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleRetryPayment = async () => {
    // ... (code như ở trên)
  };

  const isAwaitingPayment = order.orderStatus === 'awaiting_payment';
  const statusColor = getStatusBadgeColor(order.orderStatus);
  const statusText = getStatusText(order.orderStatus);

  return (
    <div className={`order-card border rounded-lg p-4 ${isAwaitingPayment ? 'border-yellow-500' : 'border-gray-200'}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold">#{order.orderNumber}</h3>
          <p className="text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-white text-sm ${statusColor}`}>
          {statusText}
        </span>
      </div>

      {/* Items */}
      <div className="mb-3">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <img src={item.image} alt={item.productName} className="w-16 h-16 object-cover rounded" />
            <div>
              <p className="font-medium">{item.productName}</p>
              <p className="text-sm text-gray-600">
                Size: {item.selectedSize} | Color: {item.color} | x{item.quantity}
              </p>
              <p className="text-sm font-semibold">{item.price.toLocaleString('vi-VN')} đ</p>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="border-t pt-3 mb-3">
        <p className="text-right font-bold text-lg">
          Total: {order.totalAmount.toLocaleString('vi-VN')} đ
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button 
          onClick={() => navigate(`/orders/${order._id}`)}
          className="btn btn-outline flex-1"
        >
          View Details
        </button>

        {isAwaitingPayment && (
          <button 
            onClick={handleRetryPayment}
            disabled={loading}
            className="btn btn-primary flex-1"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="spinner"></span> Processing...
              </span>
            ) : (
              '💳 Continue Payment'
            )}
          </button>
        )}
      </div>

      {/* Warning for awaiting_payment */}
      {isAwaitingPayment && (
        <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-2 text-sm text-yellow-800">
          ⚠️ Please complete payment within 1 hour. Order will be auto-cancelled after that.
        </div>
      )}
    </div>
  );
};
```

---

## Testing Checklist

### Backend Testing
- [ ] Call API với order status = awaiting_payment → Success
- [ ] Call API với order status = confirmed → Error
- [ ] Call API với order expired (>1 hour) → Auto-cancelled
- [ ] Call API với order không thuộc về user → Not found
- [ ] Response trả về đúng paymentMethod (vnpay/stripe)

### Frontend Testing
- [ ] Button "Continue Payment" chỉ hiện khi status = awaiting_payment
- [ ] Click button tạo payment URL thành công (VNPAY)
- [ ] Click button tạo checkout session thành công (Stripe)
- [ ] Redirect đến trang thanh toán chính xác
- [ ] Loading state hiển thị khi đang xử lý
- [ ] Error handling khi API fail
- [ ] Order expired message hiển thị đúng

### Integration Testing
- [ ] Complete flow: Create order → Close payment → Retry payment → Success
- [ ] Order status update từ awaiting_payment → confirmed sau thanh toán thành công
- [ ] Email gửi đúng template (sendPaymentSuccessEmail)
- [ ] Multiple retry attempts không tạo duplicate payment

---

## Notes
- Order sẽ tự động cancelled sau 1 giờ bởi cron job (xem `cron.service.js`)
- Backend không tạo payment URL mới, chỉ trả về thông tin để frontend gọi Stripe/VNPAY API
- Frontend cần handle cả 2 payment methods: vnpay và stripe
- Recommend hiển thị countdown timer cho user (1 giờ)
