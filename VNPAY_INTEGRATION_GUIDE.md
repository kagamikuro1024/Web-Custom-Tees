# 🏦 VNPAY Payment Integration - Complete Guide

## ✅ Hoàn thành

Đã tích hợp thành công cổng thanh toán VNPAY và hệ thống gửi email xác nhận vào dự án Express + MongoDB + React.

---

## 📦 Các File Đã Tạo/Sửa

### Backend

**Services:**
- ✅ `backend/src/services/mail.service.js` - Gửi email với Nodemailer
- ✅ `backend/src/services/payment.service.js` - VNPAY integration (tạo URL, verify signature, handle IPN)

**Controllers & Routes:**
- ✅ `backend/src/controllers/payment.controller.js` - Payment endpoints
- ✅ `backend/src/routes/payment.routes.js` - Payment routes

**Models:**
- ✅ `backend/src/models/Order.model.js` - Thêm field `vnpayTransaction` và `paidAt`

**Server:**
- ✅ `backend/src/server.js` - Thêm payment routes

### Frontend

- ✅ `frontend/src/pages/CheckoutPage.jsx` - Thêm option thanh toán VNPAY
- ✅ `frontend/src/pages/OrderSuccessPage.jsx` - Xử lý callback từ VNPAY

---

## 🔧 Cấu Hình VNPAY (Hardcoded - Sandbox)

```javascript
vnp_TmnCode: 'G8SCEXQ8'
vnp_HashSecret: 'XEFDEUWOM10SYUWK8YDC1DMPYJKW9Y8G'
vnp_Url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'
vnp_ReturnUrl: 'http://localhost:5173/order-success'
```

---

## 🚀 Cách Test

### 1. Start Backend & Frontend

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 2. Quy Trình Thanh Toán

1. **Thêm sản phẩm vào giỏ hàng**
   - Truy cập Shop/Products
   - Thêm sản phẩm vào cart

2. **Proceed to Checkout**
   - Click "Proceed to Checkout" từ Cart
   - Điền thông tin giao hàng
   - **Click vào bản đồ để chọn địa chỉ giao hàng** (bắt buộc)

3. **Chọn phương thức thanh toán**
   - Option 1: 💵 COD (Cash on Delivery)
   - Option 2: 🏦 VNPAY (Online payment)

4. **Nếu chọn VNPAY:**
   - Click "Pay with VNPAY"
   - Hệ thống sẽ redirect sang VNPAY Sandbox

5. **Tại VNPAY Sandbox - Nhập thông tin test:**
   ```
   Ngân hàng: NCB
   Số thẻ: 9704198526191432198
   Tên chủ thẻ: NGUYEN VAN A
   Ngày phát hành: 07/15
   Mật khẩu OTP: 123456
   ```

6. **Sau khi thanh toán thành công:**
   - VNPAY redirect về `/order-success?orderId=xxx&responseCode=00`
   - OrderSuccessPage hiển thị thông tin đơn hàng
   - Backend nhận IPN từ VNPAY và xử lý:
     - ✅ Cập nhật trạng thái order: `paymentStatus = 'paid'`, `orderStatus = 'confirmed'`
     - ✅ Trừ tồn kho sản phẩm
     - ✅ Gửi email xác nhận

---

## 📧 Email Configuration

**Mặc định:** Sử dụng **Ethereal Email** (test email - không gửi thật)

Khi backend start, console sẽ hiển thị:
```
📧 Mail service initialized with Ethereal (Test mode)
📧 Test account: [email]
```

Sau khi thanh toán thành công, console sẽ hiển thị:
```
📧 Email sent successfully
📧 Preview URL: https://ethereal.email/message/xxxxx
```

**Mở link preview để xem email!**

### Để Gửi Email Thật (Gmail)

1. Uncomment code trong `mail.service.js` (line 30-38)
2. Tạo App Password cho Gmail: https://myaccount.google.com/apppasswords
3. Thêm vào `.env`:
   ```
   GMAIL_USER=your-email@gmail.com
   GMAIL_PASSWORD=your-app-password
   ```

---

## 🔄 Flow Hoàn Chỉnh

### 1. User chọn VNPAY tại Checkout
```
CheckoutPage → POST /api/orders (tạo order với paymentMethod='vnpay')
            → POST /api/payment/create-payment-url
            → Redirect to VNPAY
```

### 2. User thanh toán tại VNPAY
```
VNPAY → User nhập thông tin thẻ → Xác nhận OTP
```

### 3. VNPAY gọi về Backend (IPN)
```
VNPAY → GET /api/payment/vnpay-ipn?vnp_*
     → payment.controller.js::vnpayIPN()
     → Verify signature ✅
     → Update order status ✅
     → Update product stock ✅
     → Send email ✅
     → Return { RspCode: '00', Message: 'Success' }
```

### 4. VNPAY redirect User về Frontend
```
VNPAY → Redirect to http://localhost:5173/order-success?orderId=xxx&responseCode=00
     → OrderSuccessPage parse params
     → Hiển thị success message
```

---

## 🎯 API Endpoints

### POST `/api/payment/create-payment-url`
**Auth:** Required  
**Body:**
```json
{
  "orderId": "ORD-1234567890",
  "amount": 500000,
  "orderInfo": "Thanh toan don hang ORD-1234567890",
  "bankCode": "" // Optional: "NCB", "VIETCOMBANK", etc.
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_..."
  }
}
```

### GET `/api/payment/vnpay-return`
**Auth:** Public (VNPAY callback)  
**Query:** `vnp_*` params từ VNPAY  
**Action:** Redirect user về frontend

### GET `/api/payment/vnpay-ipn`
**Auth:** Public (VNPAY server-to-server)  
**Query:** `vnp_*` params từ VNPAY  
**Response:**
```json
{
  "RspCode": "00",
  "Message": "Success"
}
```

### POST `/api/payment/query-transaction`
**Auth:** Required  
**Body:**
```json
{
  "orderId": "ORD-1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "ORD-1234567890",
    "paymentStatus": "paid",
    "orderStatus": "confirmed",
    "paidAt": "2026-01-08T...",
    "vnpayTransaction": {
      "transactionNo": "14374017",
      "bankCode": "NCB",
      "cardType": "ATM",
      "payDate": "20260108112530"
    }
  }
}
```

---

## 🧪 Test Cases

### ✅ Test Case 1: Thanh toán thành công
1. Chọn VNPAY tại checkout
2. Nhập thông tin thẻ test (xem phần 2)
3. Verify:
   - Redirect về `/order-success?responseCode=00`
   - Order status = `confirmed`, payment = `paid`
   - Stock đã giảm
   - Email đã gửi (check console log)

### ✅ Test Case 2: Thanh toán thất bại
1. Chọn VNPAY
2. Tại VNPAY, click "Cancel" hoặc nhập sai OTP 3 lần
3. Verify:
   - Redirect về `/order-success?responseCode=24` (hoặc khác)
   - Order status = `cancelled`, payment = `failed`
   - Stock không thay đổi

### ✅ Test Case 3: COD (không dùng VNPAY)
1. Chọn COD tại checkout
2. Click "Place Order"
3. Verify:
   - Redirect về `/order-success/ORD-xxx`
   - Order status = `pending`, payment = `pending`
   - Không gửi email thanh toán

---

## 📝 Notes

### Security
- ✅ Signature verification với HMAC SHA512
- ✅ IPN endpoint validate checksum trước khi xử lý
- ✅ Protected endpoints require authentication

### Error Handling
- ✅ Try-catch cho email sending (không block flow nếu email fail)
- ✅ Try-catch cho stock update (log error nhưng không rollback payment)
- ✅ Duplicate IPN handling (check if order already processed)

### Response Codes
```
00: Giao dịch thành công
24: Khách hàng hủy giao dịch
51: Tài khoản không đủ số dư
65: Vượt quá hạn mức giao dịch
79: Nhập sai OTP quá số lần
99: Lỗi khác
```

---

## 🐛 Troubleshooting

### Email không gửi được?
- Check console log: có `📧 Email sent successfully` không?
- Nếu dùng Ethereal, copy preview URL từ console
- Nếu dùng Gmail, verify App Password

### VNPAY không redirect về?
- Check `vnp_ReturnUrl` trong payment.service.js
- Verify frontend đang chạy tại `http://localhost:5173`
- Check browser console có error không

### Order không update sau thanh toán?
- Check backend console: có log IPN không?
- Verify signature: `🔐 VNPAY signature verification`
- Check order status trong database

### Stock không giảm?
- Check console: `📦 Updated stock for product...`
- Verify product có size tương ứng không
- Check product.sizes array trong database

---

## 🎉 Kết Luận

Đã tích hợp thành công:
✅ VNPAY payment gateway (Sandbox)
✅ Email notification với Nodemailer
✅ Automatic stock management
✅ Secure signature verification
✅ Complete payment flow (COD + VNPAY)

**Ready to test!** 🚀
