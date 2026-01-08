# ✅ Testing Checklist - Feature Branch

## 🔧 Setup Testing

### Prerequisites
- [ ] Redis installed và running (`redis-cli ping` → PONG)
- [ ] Backend `.env` đã có `REDIS_URL=redis://localhost:6379`
- [ ] Dependencies installed (`npm install`)
- [ ] Server running (`npm run dev`)

### Server Startup Verification
Khi start server, phải thấy logs:
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

## 🧪 Test Cases

### 1. Redis Caching Test

#### Test Cache HIT/MISS
```bash
# Request 1 - Cache MISS (lần đầu)
curl http://localhost:5000/api/products | jq
# Check logs: "Cache MISS: products:list:1:10:{}"

# Request 2 - Cache HIT (lần 2)
curl http://localhost:5000/api/products | jq
# Check logs: "Cache HIT: products:list:1:10:{}"

# Measure time difference
time curl http://localhost:5000/api/products > /dev/null
```

**Expected**:
- Request 1: 500-800ms
- Request 2: 100-200ms
- Speed improvement: 70-80%

#### Test Cache Invalidation
```bash
# 1. Gọi API để cache
curl http://localhost:5000/api/products

# 2. Admin update product
# (Qua Admin UI hoặc API)

# 3. Cache phải bị clear tự động
# 4. Next request sẽ là Cache MISS
```

---

### 2. Message Queue Test

#### Test COD Order Email (Queue)
```bash
# Tạo đơn COD
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [...],
    "paymentMethod": "cod",
    "shippingAddress": {...}
  }'
```

**Check Logs**:
```
📧 Email job added: <job_id> - Type: send-order-confirmation-email
Processing email job: send-order-confirmation-email
📧 Order confirmation email sent to: user@example.com
Email job completed: <job_id>
```

**Expected**:
- API response time: <500ms
- Email được queue và gửi async
- User nhận email "📦 Đặt hàng thành công"

#### Test Online Payment Email (Queue)
```bash
# 1. Tạo đơn VNPAY
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer <user_token>" \
  -d '{ "paymentMethod": "vnpay", ... }'

# 2. Simulate payment callback
# (Qua VNPAY sandbox hoặc mock IPN)

# 3. Check email được gửi
```

**Check Logs**:
```
✅ Order updated successfully: ORD-...
📧 Payment success email job queued for: user@example.com
Email job completed: <job_id>
```

**Expected**:
- User nhận email "✅ Thanh toán thành công"
- Email hiển thị đúng `selectedSize` (không còn undefined)

---

### 3. Order Status Flow Test

#### Test Status: COD Order
```bash
# 1. Create COD order
POST /api/orders
Status: pending ✅

# 2. Admin confirms
PATCH /api/admin/orders/:id/status { status: "confirmed" }
Status: confirmed ✅

# 3. Admin processing
PATCH /api/admin/orders/:id/status { status: "processing" }
Status: processing ✅

# 4. Admin ships
PATCH /api/admin/orders/:id/status { status: "shipped" }
Status: shipped ✅

# 5. User confirms delivery
PATCH /api/orders/:id/confirm-delivery
Status: delivered ✅
```

#### Test Status: Online Payment Order
```bash
# 1. Create VNPAY order
POST /api/orders
Status: awaiting_payment ✅

# 2. Payment success (callback)
Status: confirmed ✅ (NOT processing!)

# 3. User can still update design
PUT /api/orders/:id/items/0/design
✅ Success (vì status = confirmed)

# 4. Admin moves to processing
PATCH /api/admin/orders/:id/status { status: "processing" }
Status: processing ✅

# 5. User tries to update design
PUT /api/orders/:id/items/0/design
❌ Error: "Cannot update design - order is already being processed"
```

---

### 4. Confirm Delivery API Test

#### Happy Path
```bash
# 1. Create order và ship nó
Order status: shipped

# 2. User confirms delivery
curl -X PATCH http://localhost:5000/api/orders/<orderId>/confirm-delivery \
  -H "Authorization: Bearer <user_token>"
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Order marked as delivered successfully",
  "data": {
    "orderStatus": "delivered",
    "actualDelivery": "2026-01-08T10:00:00.000Z",
    ...
  }
}
```

#### Error Cases
```bash
# Try khi order chưa shipped
# Expected: Error "Order must be in shipped status to confirm delivery"

# Try với order không phải của user
# Expected: Error "Order not found"
```

---

### 5. Cron Job Test

#### Test Auto-Cancel Expired Orders
**Option 1: Adjust Time (Fast Testing)**
```javascript
// In cron.service.js, temporarily change:
const oneHourAgo = new Date(Date.now() - 2 * 60 * 1000); // 2 minutes
```

```bash
# 1. Create VNPAY order (status: awaiting_payment)
POST /api/orders

# 2. Don't pay

# 3. Wait 2 minutes (or 15 minutes if using real schedule)

# 4. Check logs:
"🗑️ Auto-cancelled 1 expired order(s)"

# 5. Check order status:
GET /api/orders/:id
# Status should be "cancelled"
```

**Option 2: Manual Trigger**
```javascript
// In node console or create test endpoint:
import CronJobs from './src/services/cron.service.js';
await CronJobs.cancelExpiredOrders();
```

---

### 6. Email Template Test

#### Test COD Email Template
**Expected Content**:
- ✅ Subject: "📦 Xác nhận đơn hàng #ORD-... - Đặt hàng thành công"
- ✅ Header: "📦 Đặt hàng thành công!"
- ✅ Payment method: "Thanh toán khi nhận hàng (COD)"
- ✅ Size hiển thị: "Size: M" (không còn undefined)
- ✅ Color: Purple/Blue theme

#### Test Online Payment Email Template
**Expected Content**:
- ✅ Subject: "✅ Thanh toán thành công #ORD-..."
- ✅ Header: "✅ Thanh toán thành công!"
- ✅ Badge: "ĐÃ THANH TOÁN"
- ✅ Payment method: "VNPAY" hoặc "Stripe"
- ✅ Note: "Bạn vẫn có thể cập nhật hình ảnh..."
- ✅ Color: Green theme

---

### 7. Fallback & Error Handling Test

#### Test Redis Down
```bash
# 1. Stop Redis
redis-cli shutdown

# 2. Restart server
npm run dev

# 3. Check logs:
"Failed to connect to Redis: ..."
"Redis not ready, queues will not be initialized"

# 4. Test API
curl http://localhost:5000/api/products
# Should still work (direct DB query)

# 5. Test order creation
POST /api/orders
# Should work, email sent directly (not queued)
```

#### Test Queue Failure
```bash
# Simulate queue failure by stopping Redis mid-request
# Expected: Email falls back to direct send
```

---

### 8. Load Test (Optional)

#### Simple Load Test
```bash
# Install hey or ab
brew install hey

# Test without cache
hey -n 100 -c 10 http://localhost:5000/api/products

# Test with cache
hey -n 100 -c 10 http://localhost:5000/api/products

# Compare results
```

**Expected**:
- Without cache: 500-800ms avg
- With cache: 100-200ms avg
- 70-80% improvement

---

## 🐛 Bug Test Cases

### Test Size Display Bug Fix
```bash
# Old bug: Email showed "Size: undefined"
# New: Email shows "Size: M" hoặc size thực tế

# Test:
# 1. Create order với size "XL"
# 2. Check email nhận được
# 3. Verify: "Size: XL" (not undefined)
```

### Test Stock Update Bug Fix
```bash
# Old bug: Stock update dùng item.size (undefined)
# New: Stock update dùng item.selectedSize

# Test:
# 1. Check stock của product size M: 10
# 2. Order với size M, quantity 2
# 3. Pay successfully
# 4. Check stock again: 8 ✅
```

---

## 📊 Performance Benchmarks

### Record These Metrics

#### Before (Cache OFF)
```bash
time curl http://localhost:5000/api/products > /dev/null
# Record: ___ ms
```

#### After (Cache ON - 2nd request)
```bash
time curl http://localhost:5000/api/products > /dev/null
# Record: ___ ms
```

#### Email Blocking
**Before** (Direct send):
```bash
# Start timer
POST /api/orders
# End timer when response received
# Expected: 2-3 seconds
```

**After** (Queue):
```bash
# Start timer
POST /api/orders
# End timer when response received
# Expected: <500ms
```

---

## ✅ Final Checklist

### Code Quality
- [ ] No console.logs (use logger instead)
- [ ] All functions have error handling
- [ ] Graceful degradation implemented
- [ ] No breaking changes

### Testing
- [ ] All test cases passed
- [ ] Email templates display correctly
- [ ] Size bug fixed (no more undefined)
- [ ] Cron job working
- [ ] Redis fallback working
- [ ] Queue retry mechanism working

### Documentation
- [ ] OPTIMIZATION_GUIDE.md complete
- [ ] CHANGES_SUMMARY.md accurate
- [ ] .env.example updated
- [ ] Code comments clear

### Deployment Ready
- [ ] Tested on local
- [ ] Ready for staging
- [ ] Redis setup documented
- [ ] Migration guide ready

---

## 🚀 Sign Off

Tested by: _______________  
Date: _______________  
Environment: Local / Staging / Production  
Status: ✅ Passed / ❌ Failed  

**Issues Found**: (List any issues)

**Ready for Production**: Yes / No

---

**Note**: Nếu có bất kỳ test case nào fail, ghi rõ error message và steps to reproduce.
