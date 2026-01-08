# 🚀 Stripe Integration - Hướng dẫn siêu nhanh

## ✅ Tại sao chọn Stripe?
- **Đăng ký 30 giây** - chỉ cần email
- **Test keys ngay lập tức** - không cần CCCD, verify, approval
- **UI đẹp, chuyên nghiệp** - tăng uy tín khi demo
- **Không bị chặn HTTPS** - hoạt động 100% trên production
- **Test cards đầy đủ** - test mọi trường hợp
- **Dashboard analytics** - biểu đồ, reports đẹp

---

## Bước 1: Đăng ký Stripe (30 giây)

### 🔗 Link đăng ký
https://dashboard.stripe.com/register

### Điền thông tin:
1. **Email**: Email thật của bạn
2. **Full Name**: Tên của bạn
3. **Password**: Mật khẩu mạnh
4. Click **"Create account"**

**✅ XONG! Không cần verify gì cả!**

---

## Bước 2: Lấy API Keys (10 giây)

1. Sau khi đăng ký, bạn sẽ vào Dashboard
2. Click **"Developers"** (menu bên trái)
3. Click **"API keys"**
4. Bạn sẽ thấy 2 keys:

```
✅ Publishable key (test): pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
✅ Secret key (test): sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

5. Click **"Reveal test key token"** để hiện Secret key
6. **Copy 2 keys này** và paste cho mình!

---

## Bước 3: Test Cards (Dùng khi thanh toán)

### ✅ Card thành công (Luôn pass):
```
Card Number: 4242 4242 4242 4242
Expiry: 12/34 (bất kỳ tháng/năm tương lai)
CVC: 123 (bất kỳ 3 số)
ZIP: 12345 (bất kỳ)
```

### ❌ Card thất bại (Test lỗi):
```
Card Number: 4000 0000 0000 0002 (Card declined)
Card Number: 4000 0000 0000 9995 (Insufficient funds)
```

### 🔐 Card cần 3D Secure (Test authentication):
```
Card Number: 4000 0025 0000 3155
```

---

## Bước 4: Cấu hình trong Project

### 4.1 Thêm vào backend/.env
```env
# Stripe Configuration (Test Mode)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Lưu ý**: 
- STRIPE_WEBHOOK_SECRET để sau, chưa cần ngay
- Chỉ cần STRIPE_SECRET_KEY là chạy được

### 4.2 Thêm vào Railway Environment Variables
1. Vào Railway Dashboard → Your Project → Variables
2. Click **"+ New Variable"**
3. Thêm:
   - `STRIPE_SECRET_KEY` = sk_test_xxxx (paste từ Stripe)

---

## Bước 5: Test Flow

### Test trên Localhost:
1. Chạy backend: `npm run dev`
2. Chạy frontend: `npm run dev`
3. Add sản phẩm vào cart
4. Checkout → Chọn **"Credit/Debit Card"**
5. Click "Pay with Card"
6. Nhập card: `4242 4242 4242 4242`
7. Click "Pay" → Success!

### Test trên Production:
1. Deploy code (git push → Railway + Vercel auto deploy)
2. Vào https://www.kurokami225104.id.vn
3. Làm tương tự như trên
4. **ĐẢM BẢO HOẠT ĐỘNG** vì Stripe không chặn HTTPS!

---

## 📊 Xem giao dịch trong Dashboard

1. Vào Stripe Dashboard
2. Click **"Payments"** (menu bên trái)
3. Bạn sẽ thấy tất cả giao dịch test
4. Click vào từng transaction để xem chi tiết
5. **Rất đẹp để demo!**

---

## 🎯 Webhook (Tùy chọn - Không bắt buộc)

Nếu muốn test webhook (nhận thông báo khi thanh toán thành công):

1. Vào Stripe Dashboard → Developers → Webhooks
2. Click **"Add endpoint"**
3. Endpoint URL: 
   ```
   https://ample-motivation-production.up.railway.app/api/stripe/webhook
   ```
4. Events to send:
   - [x] checkout.session.completed
   - [x] payment_intent.succeeded
   - [x] payment_intent.payment_failed
5. Click "Add endpoint"
6. Copy **Signing secret** (whsec_xxxx)
7. Thêm vào Railway: `STRIPE_WEBHOOK_SECRET=whsec_xxxx`

**Lưu ý**: Webhook không bắt buộc, payment vẫn hoạt động không có webhook!

---

## ✅ Checklist

- [ ] Đã đăng ký Stripe account
- [ ] Đã lấy được Secret Key (sk_test_xxxx)
- [ ] Đã thêm STRIPE_SECRET_KEY vào backend/.env
- [ ] Đã thêm variable vào Railway
- [ ] Sẵn sàng deploy và test!

---

## 💡 Tips khi Demo

1. **UI Stripe rất đẹp** - giáo viên sẽ ấn tượng
2. **Dashboard có biểu đồ** - khoe được analytics
3. **Có email receipt** - Stripe tự động gửi
4. **Logo Visa/Mastercard** - trông professional
5. **Test card 4242...** - remember by heart!

---

## 🚨 Lưu ý quan trọng

✅ **Test mode** - Không charge tiền thật
✅ **Không cần business verify** - Test keys free
✅ **Không giới hạn transactions** - Test thoải mái
✅ **HTTPS production ready** - Không bị chặn như VNPAY
⚠️ **Secret key giữ bí mật** - Không commit lên Git
⚠️ **Sau demo**: Có thể giữ Stripe hoặc chuyển sang Production mode

---

## 🎓 Tài liệu tham khảo

- Dashboard: https://dashboard.stripe.com
- API Docs: https://stripe.com/docs/api
- Test Cards: https://stripe.com/docs/testing
- Support: Có live chat 24/7 (tiếng Anh)

---

## 🎉 Kết luận

**Stripe = Giải pháp hoàn hảo cho demo!**
- Fast setup (< 1 phút)
- Professional UI
- Always works (không bị sandbox issues)
- Impressive for grading

**Paste Secret Key cho mình là deploy ngay!** 🚀
