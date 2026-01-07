# 🚀 Hướng dẫn Deploy Web Custom T-Shirt

## 📦 Chuẩn bị

### 1. MongoDB Atlas (Database)
1. Đăng ký tại: https://www.mongodb.com/cloud/atlas/register
2. Tạo cluster M0 Free (512MB)
3. Region: AWS Singapore
4. Database User: tạo username/password
5. Network Access: Add IP `0.0.0.0/0`
6. Lấy Connection String:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/custom_tshirt_db
   ```

### 2. Push code lên GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

## 🎯 PHƯƠNG ÁN 1: Render + Vercel (Khuyên dùng)

### A. Deploy Backend lên Render.com

1. **Đăng ký**: https://render.com (dùng GitHub)

2. **New Web Service**:
   - Repository: `Web_Ao_Custom`
   - Name: `custom-tshirt-backend`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: **Free**

3. **Environment Variables** (thêm từng cái):
   ```bash
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=<MongoDB_Atlas_Connection_String>
   
   # JWT
   JWT_ACCESS_SECRET=custom_tshirt_access_secret_2025_production_change_this
   JWT_REFRESH_SECRET=custom_tshirt_refresh_secret_2025_production_change_this
   JWT_ACCESS_EXPIRE=15m
   JWT_REFRESH_EXPIRE=7d
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=dihgp8efo
   CLOUDINARY_API_KEY=764881149551729
   CLOUDINARY_API_SECRET=p1OY9wNrYbQY40R2tMqsMs_foNk
   
   # Frontend URL (cập nhật sau khi có Vercel URL)
   FRONTEND_URL=https://your-frontend-url.vercel.app
   
   # Gmail
   GMAIL_USER=trung5kvshthlnqk38b@gmail.com
   GMAIL_PASSWORD=fllv zhlt dexd vsjm
   
   # VNPAY
   VNPAY_TMN_CODE=G8SCEXQ8
   VNPAY_HASH_SECRET=XEFDEUWOM10SYUWK8YDC1DMPYJKW9Y8G
   VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
   VNPAY_RETURN_URL=https://your-frontend-url.vercel.app/order-success
   
   # Admin
   ADMIN_EMAIL=admin@customtshirt.com
   ADMIN_PASSWORD=Admin@12345
   ```

4. **Deploy** → Đợi ~5 phút

5. **Lấy Backend URL**: `https://custom-tshirt-backend.onrender.com`

### B. Deploy Frontend lên Vercel

1. **Đăng ký**: https://vercel.com (dùng GitHub)

2. **New Project**:
   - Import: `Web_Ao_Custom`
   - Root Directory: `frontend`
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Environment Variables**:
   ```bash
   VITE_API_URL=https://custom-tshirt-backend.onrender.com/api
   ```

4. **Deploy** → Đợi ~2 phút

5. **Lấy Frontend URL**: `https://your-project.vercel.app`

### C. Cập nhật lại Backend

Quay lại Render → Environment Variables → Update:
```bash
FRONTEND_URL=https://your-project.vercel.app
VNPAY_RETURN_URL=https://your-project.vercel.app/order-success
```

Save Changes → Manual Deploy (redeploy)

### D. Kết nối tên miền free

**Vercel**:
1. Settings → Domains
2. Add domain: `yourdomain.com`
3. Thêm DNS records theo hướng dẫn:
   - Type: `A` → Value: `76.76.21.21`
   - Type: `CNAME` → Name: `www` → Value: `cname.vercel-dns.com`

---

## 🚂 PHƯƠNG ÁN 2: Railway.app (Đơn giản hơn)

### 1. Đăng ký
https://railway.app → Login với GitHub

### 2. New Project
- Deploy from GitHub repo
- Select `Web_Ao_Custom`

### 3. Add Services

**Backend Service**:
- Root Directory: `backend`
- Start Command: `npm start`
- Add all environment variables (giống Render)

**Frontend Service**:
- Root Directory: `frontend`
- Build Command: `npm run build`
- Start Command: `npm run preview`
- Environment: `VITE_API_URL=<backend_railway_url>/api`

### 4. Generate Domains
Mỗi service sẽ có domain: `*.up.railway.app`

---

## ✅ Kiểm tra sau khi deploy

1. **Backend Health Check**:
   ```
   https://your-backend.onrender.com/
   → Phải trả về: "Custom T-Shirt API is running"
   ```

2. **Frontend**:
   ```
   https://your-frontend.vercel.app
   → Trang chủ hiển thị bình thường
   ```

3. **Test chức năng**:
   - ✅ Đăng ký/Đăng nhập
   - ✅ Xem sản phẩm
   - ✅ Customize design
   - ✅ Thêm giỏ hàng
   - ✅ Checkout COD
   - ✅ Checkout VNPAY
   - ✅ Admin panel

4. **Kiểm tra email**:
   - Đăng ký → Nhận email welcome
   - Đặt hàng → Nhận email xác nhận

---

## 🐛 Troubleshooting

### Lỗi CORS
Kiểm tra `FRONTEND_URL` trong backend env đã đúng chưa

### Lỗi MongoDB Connection
Kiểm tra:
- Connection string đúng format
- Network Access: `0.0.0.0/0`
- Username/password không có ký tự đặc biệt

### Frontend không gọi được API
Kiểm tra `VITE_API_URL` có `/api` ở cuối

### Render Free Tier Sleep
Backend Render free sẽ sleep sau 15 phút không dùng. Lần đầu access sẽ chậm ~30s.

Giải pháp: Dùng UptimeRobot ping mỗi 5 phút để giữ backend wake.

---

## 📊 Giới hạn Free Tier

### Render
- ✅ 750 hours/tháng
- ✅ Sleep sau 15 phút idle
- ✅ SSL miễn phí
- ❌ Build time: 10 phút

### Vercel
- ✅ Unlimited projects
- ✅ 100GB bandwidth/tháng
- ✅ SSL miễn phí
- ✅ Auto deploy khi push GitHub

### MongoDB Atlas
- ✅ 512MB storage
- ✅ Shared cluster
- ✅ Đủ cho demo

---

## 🎓 Tips cho buổi demo

1. **Chuẩn bị tài khoản test**:
   - User: `demo@test.com` / `Demo@123`
   - Admin: `admin@customtshirt.com` / `Admin@12345`

2. **Thêm sản phẩm mẫu** trước khi demo

3. **Test VNPAY trước 1 ngày**

4. **Screenshot kết quả** để backup nếu mạng yếu

5. **Có link dự phòng** (localhost video demo)

---

## 📞 Support

Nếu gặp lỗi khi deploy, check logs:
- **Render**: Dashboard → Logs
- **Vercel**: Deployments → View Function Logs
- **MongoDB Atlas**: Metrics → Charts

Good luck! 🚀
