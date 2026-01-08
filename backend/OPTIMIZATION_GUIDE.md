# 🚀 Backend Optimization & Fixes - Feature Branch

## 📋 Tổng quan các thay đổi

Branch này bao gồm các cải tiến về **Performance**, **Business Logic**, và **Bug Fixes** cho hệ thống E-commerce bán áo custom.

---

## ✨ Các thay đổi chính

### 1. 🔥 Performance & Infrastructure

#### Redis Caching
- **Mục đích**: Giảm tải database, tăng tốc độ phản hồi API
- **Implementation**: 
  - File: `src/config/redis.js` - Redis client connection
  - File: `src/services/cache.service.js` - Cache service với TTL
  - **Cache keys**: Products, Categories (TTL: 5-60 phút)
  - **Auto-invalidation**: Khi có thay đổi dữ liệu

#### BullMQ Message Queue
- **Mục đích**: Xử lý async tasks (email, image processing) để API response ngay lập tức
- **Implementation**:
  - File: `src/config/queue.js` - Queue manager
  - File: `src/workers/email.worker.js` - Email processing worker
  - File: `src/workers/image.worker.js` - Image processing worker
- **Benefits**: 
  - API không bị block khi gửi email
  - Retry mechanism (3 lần với exponential backoff)
  - Improved user experience

---

### 2. 📦 Business Logic - Trạng thái Đơn hàng

#### Các trạng thái mới
```javascript
enum OrderStatus {
  'pending',           // Đơn hàng COD mới tạo
  'awaiting_payment',  // Đơn online chưa thanh toán (MỚI)
  'confirmed',         // Đã thanh toán, vẫn cho phép sửa ảnh custom (UPDATED)
  'processing',        // Admin đang xử lý, khóa chỉnh sửa
  'shipped',           // Đã gửi hàng
  'delivered',         // Đã giao (User xác nhận)
  'cancelled'          // Đã hủy
}
```

#### API mới: Xác nhận đã nhận hàng
```http
PATCH /api/orders/:orderId/confirm-delivery
Authorization: Bearer <token>
```
- **Điều kiện**: Chỉ khả dụng khi đơn đang ở trạng thái `shipped`
- **Kết quả**: Chuyển sang `delivered`, cập nhật tier user

#### Logic thanh toán Online
**TRƯỚC:**
- Thanh toán xong → `processing` → User không sửa được ảnh

**SAU:**
- Thanh toán xong → `confirmed` → User vẫn sửa được ảnh
- Admin chuyển sang `processing` → Khóa chỉnh sửa

#### Xử lý Abandoned Checkout
**Vấn đề**: Đơn chưa thanh toán (VNPAY/Stripe) chiếm dụng danh sách

**Giải pháp**:
- Đơn mới tạo online payment → Status: `awaiting_payment`
- **Cron job** chạy mỗi 15 phút:
  - Tự động hủy đơn `awaiting_payment` quá 1 giờ
  - Giải phóng database, giảm rác

---

### 3. 📧 Email & Bug Fixes

#### Tách luồng Email
**2 template riêng biệt:**

1. **Order Confirmation Email** (COD)
   ```javascript
   mailService.sendOrderConfirmationEmail(email, orderData);
   ```
   - Subject: "📦 Đặt hàng thành công"
   - Gửi ngay sau khi tạo đơn COD

2. **Payment Success Email** (Online Payment)
   ```javascript
   mailService.sendPaymentSuccessEmail(email, orderData);
   ```
   - Subject: "✅ Thanh toán thành công"
   - Gửi sau khi VNPAY/Stripe callback thành công
   - Có thông tin thanh toán chi tiết

#### Fix Bug: "Size: undefined"
**Nguyên nhân**: 
- Code cũ dùng `item.size` trong khi Order model lưu `item.selectedSize`
- Dữ liệu không được populate đầy đủ

**Giải pháp**:
- ✅ Thay đổi tất cả reference từ `item.size` → `item.selectedSize`
- ✅ Đảm bảo email template hiển thị đúng thông tin size
- ✅ Fix trong cả payment controller và mail service

---

## 🛠️ Setup Instructions

### Prerequisites
```bash
# Redis phải được cài đặt và chạy
# Windows: Download từ https://github.com/microsoftarchive/redis/releases
# macOS: brew install redis
# Linux: sudo apt-get install redis-server

# Kiểm tra Redis đang chạy
redis-cli ping
# Output: PONG
```

### Installation

1. **Cài đặt dependencies mới**
```bash
cd backend
npm install
```

Packages mới:
- `ioredis` - Redis client
- `bullmq` - Message queue
- `node-cron` - Scheduled tasks

2. **Cập nhật .env**
```bash
cp .env.example .env
```

Thêm các biến mới:
```env
# Redis Configuration
REDIS_URL=redis://localhost:6379

# Email Service
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=onboarding@resend.dev
```

3. **Start Redis** (nếu chưa chạy)
```bash
# Windows
redis-server

# macOS/Linux
redis-server
```

4. **Start Backend**
```bash
npm run dev
```

Logs khởi động thành công:
```
✅ MongoDB Connected: localhost
✅ Redis connected successfully
✅ Queue system initialized
✅ Email worker registered
✅ Image worker registered
✅ Cron jobs initialized
✅ All infrastructure initialized successfully
🚀 Server running on http://localhost:5000
```

---

## 📚 API Changes

### New Endpoints

#### 1. Confirm Delivery (User)
```http
PATCH /api/orders/:orderId/confirm-delivery
Authorization: Bearer <user_token>

Response:
{
  "success": true,
  "message": "Order marked as delivered successfully",
  "data": { ...order }
}
```

### Modified Endpoints

#### Update Custom Design
```http
PUT /api/orders/:orderId/items/:itemIndex/design
Authorization: Bearer <user_token>
Content-Type: multipart/form-data

Body: image file

# Allowed for orders with status:
# - pending
# - awaiting_payment
# - confirmed
# 
# Blocked for:
# - processing (Admin is working)
# - shipped, delivered, cancelled
```

---

## 🧪 Testing

### Test Cases

#### 1. Test Redis Caching
```bash
# Gọi API lần 1 (Cache MISS)
curl http://localhost:5000/api/products

# Gọi API lần 2 (Cache HIT - nhanh hơn)
curl http://localhost:5000/api/products
```

#### 2. Test Queue System
```javascript
// Tạo đơn COD → Email được queue
// Check logs:
// "Email job added: <job_id> - Type: send-order-confirmation-email"
// "Email job completed: <job_id>"
```

#### 3. Test Cron Job
```javascript
// Tạo đơn awaiting_payment
// Đợi > 1 giờ (hoặc chỉnh thời gian trong cron.service.js để test)
// Kiểm tra đơn tự động bị hủy
```

#### 4. Test Email Templates
```javascript
// COD Order
POST /api/orders
{
  "paymentMethod": "cod",
  ...
}
// → Nhận email "📦 Đặt hàng thành công"

// Online Payment
POST /api/orders
{
  "paymentMethod": "vnpay",
  ...
}
// → Thanh toán → Nhận email "✅ Thanh toán thành công"
```

---

## 🔧 Configuration

### Redis Configuration
```javascript
// Default: redis://localhost:6379
// Production with password:
REDIS_URL=redis://:password@your-redis-host:6379
```

### Queue Configuration
- **Email Queue**: Retry 3 lần, exponential backoff (2s, 4s, 8s)
- **Image Queue**: Retry 2 lần, fixed delay (5s)

### Cron Jobs
- **Cancel Expired Orders**: Chạy mỗi 15 phút
- **Auto Confirm Delivery**: (Optional) Có thể thêm schedule cho tự động xác nhận sau 7 ngày

---

## 📝 Notes

### App vẫn hoạt động nếu Redis down
- Cache service sẽ fallback về database query trực tiếp
- Queue sẽ skip, email gửi trực tiếp (blocking)
- Logs sẽ warning nhưng app không crash

### Monitoring
Check logs để theo dõi:
- Cache HIT/MISS rates
- Queue job success/failure
- Cron job execution
- Email delivery status

---

## 🚀 Deployment Notes

### Production Checklist
- [ ] Setup Redis instance (Railway Redis, Upstash, AWS ElastiCache)
- [ ] Update `REDIS_URL` in production env
- [ ] Monitor Redis memory usage
- [ ] Setup Queue dashboard (optional: Bull Board)
- [ ] Configure email service (Resend API key)
- [ ] Test cron jobs in staging first

### Redis Hosting Options
1. **Railway** (Recommended for MVP)
   - Built-in Redis plugin
   - Easy setup

2. **Upstash** (Serverless Redis)
   - Pay-as-you-go
   - Good for low traffic

3. **AWS ElastiCache** (Enterprise)
   - High availability
   - Expensive

---

## 🐛 Known Issues & Future Improvements

### Future Enhancements
- [ ] Add Bull Board UI for queue monitoring
- [ ] Implement rate limiting with Redis
- [ ] Cache Product search results
- [ ] Add Redis clustering for high availability
- [ ] Implement real-time order tracking with Socket.io + Redis pub/sub

---

## 📞 Support

Nếu gặp vấn đề, check:
1. Redis có đang chạy không: `redis-cli ping`
2. Logs của server: Xem error messages
3. Environment variables: Đảm bảo `.env` đầy đủ

---

**Branch**: `feature/optimization-and-fixes`  
**Date**: January 2026  
**Author**: Senior Backend Engineer
