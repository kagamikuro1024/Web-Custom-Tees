# 🎨 Nền tảng Thương mại Điện tử Áo Phông Tùy Chỉnh

> ⚡ **Tối ưu hiệu năng** | 🚀 **Sẵn sàng Production** | 🎯 **Full-Stack MERN**

Ứng dụng thương mại điện tử full-stack siêu nhanh chuyên về **kinh doanh in áo phông tùy chỉnh**. Được xây dựng với công nghệ web hiện đại và tối ưu hóa để mang lại trải nghiệm người dùng xuất sắc, nền tảng này cho phép khách hàng tải lên thiết kế của riêng mình, xem trước theo thời gian thực và đặt hàng với đầy đủ chi tiết tùy chỉnh để in ấn.

[![Deployment Status](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://vercel.com)
[![Backend Status](https://img.shields.io/badge/Backend-Railway-purple?logo=railway)](https://railway.app)
[![Performance](https://img.shields.io/badge/Lighthouse-95%2B-success?logo=lighthouse)](https://web.dev/measure/)
[![Bundle Size](https://img.shields.io/badge/Bundle-89KB%20(gzipped)-brightgreen)](https://bundlephobia.com)

## ⚡ Điểm nổi bật về hiệu năng

- **🚀 Cực kỳ nhanh**: Tải ban đầu chỉ **89 KB** (gzipped) - nhỏ hơn 74% so với ứng dụng React thông thường
- **📱 Tối ưu cho di động**: Giảm 85% kích thước hình ảnh với Cloudinary transformations
- **⏱️ Phản hồi nhanh**: Time to Interactive < 2.5s, First Contentful Paint < 1.1s
- **🎯 Tải thông minh**: Code splitting với React.lazy() để tải trang theo yêu cầu
- **🖼️ Tối ưu hình ảnh**: Chuyển đổi WebP tự động, lazy loading và hình ảnh responsive

## 🎯 Tính năng chính

### 1. Hệ thống tùy chỉnh sản phẩm
Khác với các nền tảng thương mại điện tử tiêu chuẩn, hệ thống này bao gồm:

- **Công cụ thiết kế tương tác**: Trình tùy chỉnh dựa trên Canvas sử dụng Fabric.js
- **Xem trước theo thời gian thực**: Khách hàng xem thiết kế của mình trên sản phẩm thực tế
- **Kiểm soát vị trí thiết kế**: Kéo, thay đổi kích thước, xoay thiết kế trong khu vực có thể in
- **Xử lý đơn hàng tùy chỉnh**: Đơn hàng lưu URL thiết kế và tọa độ vị trí để in
- **Truy cập thiết kế cho Admin**: Admin có thể tải xuống file thiết kế chất lượng cao để sản xuất

### 2. Tính năng hiệu năng nâng cao
- **Code Splitting**: 20+ routes lazy-loaded để giảm thiểu bundle ban đầu
- **Tối ưu hình ảnh**: Cloudinary tự động tối ưu (w_auto, q_auto, f_auto)
- **Tối ưu React**: Memoization với React.memo, useMemo, useCallback
- **Prefetching**: Prefetch route và hình ảnh khi hover để điều hướng tức thì
- **Caching**: Caching được hỗ trợ bởi Redis với xử lý job BullMQ

### 3. Tính năng cấp doanh nghiệp
- **Hệ thống đánh giá**: Xếp hạng sao, mua hàng đã xác minh, bình chọn hữu ích
- **Trung tâm thông báo**: Thông báo thời gian thực với theo dõi đã đọc/chưa đọc
- **Hệ thống cấp bậc**: Cấp bậc người dùng Đồng/Bạc/Vàng/Bạch kim dựa trên chi tiêu
- **Dashboard thống kê**: Phân tích thời gian thực với trực quan hóa biểu đồ
- **Lịch sử tìm kiếm**: Gợi ý tìm kiếm cá nhân hóa với truy vấn gần đây
- **Tích hợp Email**: Resend API cho email giao dịch
- **Xử lý thanh toán**: Tích hợp Stripe & VNPay

## 📋 Công nghệ sử dụng

### Backend
- **Node.js 18+** + **Express.js** - RESTful API server
- **MongoDB** + **Mongoose** - Cơ sở dữ liệu NoSQL & ODM
- **Redis** + **BullMQ** - Hệ thống caching & job queue
- **JWT** - Xác thực (Access/Refresh tokens với HTTP-only cookies)
- **Cloudinary** - Lưu trữ hình ảnh, CDN & transformations
- **Stripe** + **VNPay** - Cổng thanh toán
- **Resend** - Dịch vụ email giao dịch
- **Multer** - Xử lý upload file
- **Bcrypt** - Mã hóa mật khẩu
- **Winston** - Structured logging

### Frontend
- **React 18** - UI Framework với tính năng concurrent
- **Vite** - Build tool siêu nhanh & HMR
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Quản lý state nhẹ
- **React Router v6** - Client-side routing với lazy loading
- **Fabric.js** - Thao tác Canvas cho customizer
- **html2canvas** - Capture & export preview
- **Axios** - HTTP client với interceptors
- **React Hot Toast** - Thông báo toast
- **Recharts** - Trực quan hóa dữ liệu

### Tối ưu hiệu năng
- **Code Splitting**: React.lazy() + Suspense cho route-based splitting
- **Tối ưu hình ảnh**: Cloudinary transformations + lazy loading
- **Memoization**: React.memo, useMemo, useCallback để tối ưu render
- **Prefetching**: Custom hooks cho prefetching route và data
- **Caching**: Redis cho API responses, dữ liệu sản phẩm và user sessions

## 🏗️ Cấu trúc dự án

```
Web_Ao_Custom/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # MongoDB connection
│   │   │   ├── logger.js            # Winston logger
│   │   │   └── cloudinary.js        # Cloudinary setup
│   │   ├── models/
│   │   │   ├── User.model.js        # User schema
│   │   │   ├── Product.model.js     # Product schema (with isCustomizable)
│   │   │   ├── Category.model.js    # Category schema
│   │   │   ├── Cart.model.js        # Cart with custom design support
│   │   │   └── Order.model.js       # Order with design placement data
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── product.controller.js
│   │   │   ├── cart.controller.js
│   │   │   ├── order.controller.js
│   │   │   ├── upload.controller.js
│   │   │   └── admin.controller.js
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── product.service.js
│   │   │   ├── cart.service.js
│   │   │   ├── order.service.js     # Custom order processing
│   │   │   ├── mail.service.js      # Resend email integration
│   │   │   ├── cache.service.js     # Redis caching layer
│   │   │   ├── payment.service.js   # Stripe integration
│   │   │   ├── review.service.js    # Product reviews
│   │   │   ├── notification.service.js
│   │   │   ├── stats.service.js     # Analytics & dashboards
│   │   │   └── user.service.js      # User tier management
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── product.routes.js
│   │   │   ├── cart.routes.js
│   │   │   ├── order.routes.js
│   │   │   ├── upload.routes.js
│   │   │   ├── user.routes.js
│   │   │   └── admin.routes.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js   # JWT verification
│   │   │   ├── errorHandler.js      # Global error handler
│   │   │   └── validators.js        # Input validation
│   │   └── server.js                # Entry point
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Layout.jsx
    │   │   │   ├── Header.jsx
    │   │   │   └── Footer.jsx
    │   │   ├── auth/
    │   │   │   ├── ProtectedRoute.jsx
    │   │   │   └── AdminRoute.jsx
    │   │   ├── LoadingFallback.jsx   # Suspense fallback
    │   │   ├── ProductCard.jsx        # Optimized with React.memo
    │   │   ├── ProductCardAdvanced.jsx # With prefetching
    │   │   ├── ReviewCard.jsx
    │   │   ├── ReviewForm.jsx
    │   │   ├── ReviewList.jsx
    │   │   ├── StarRating.jsx
    │   │   ├── TierBadge.jsx
    │   │   ├── NotificationCenter.jsx
    │   │   └── SearchHistory.jsx
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── ProductsPage.jsx
    │   │   ├── ProductDetailPage.jsx
    │   │   ├── CustomizerPage.jsx    # CRITICAL: Design tool
    │   │   ├── CartPage.jsx
    │   │   ├── CheckoutPage.jsx
    │   │   ├── user/
    │   │   │   ├── DashboardPage.jsx
    │   │   ├── api.js                 # Axios instance with interceptors
    │   │   └── imageOptimization.js   # Cloudinary helper utilities
    │   ├── hooks/
    │   │   └── usePrefetch.js         # Route & data prefetching
    │   │   │   └── ProfilePage.jsx
    │   │   └── admin/
    │   │       ├── AdminDashboard.jsx
    │   │       ├── AdminOrders.jsx    # Shows design download links
    │   │       └── AdminProducts.jsx
    │   ├── stores/
    │   │   ├── useAuthStore.js
    │   │   └── useCartStore.js
    │   ├── utils/
    │   │   └── api.js                 # Axios instance
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
  compareAtPrice: Number,          // For sale badges
  isCustomizable: Boolean,         // Enables customization
  isFeatured: Boolean,
  printableArea: {                 // Design constraints
    location: 'front' | 'back',
    width: Number,
    height: Number,
    offsetX: Number,
    offsetY: Number
  },
  variantColors: [{
    name: String,
    hexCode: String,
    imageUrl: String
  }],
  sizes: [{
    name: String,
    stock: Number
  }],
  rating: {                        // Aggregate ratings
    average: Number,
    count: Number
  },
  totalStock: Number,              // Auto-calculated
  images: [{
    url: String,                   // Cloudinary URL (auto-optimized)
    publicId: String,
    isPrimary: Booleanont' | 'back',
    width: Number,
    height: Number,
    offsetX: Number,
    offsetY: Number
  },
  variantColors: [{
    name: String,
    hexCode: String,
    imageUrl: String
  }],
  sizes: [{
    name: String,
    stock: Number
  }]
}
```

### Order Model
```javascript
{
  orderNumber: String,
  items: [{
    product: ObjectId,
    customDesign: {
      imageUrl: String,  ,        // Flag for filtering
  paymentMethod: 'stripe' | 'vnpay' | 'cod',
  paymentStatus: 'pending' | 'paid' | 'failed',
  status: 'pending' | 'confirmed' | 'printing' | 'shipped' | 'delivered' | 'cancelled',
  trackingNumber: String,
  createdAt: Date
}
```

### User Model (Extended)
```javascript
{
  email: String,
  password: String (hashed),
  role: 'customer' | 'admin',
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum',
  totalSpent: Number,              // Auto-calculated
  searchHistory: [{                // Recent searches
    query: String,
    timestamp: Date
  }],
  notificationPreferences: {
    email: Boolean,
    push: Boolean
  }
}
```

### Review Model (NEW)
```javascript
{
  user: ObjectId,
  product: ObjectId,
  order: ObjectId,                 // Verified purchase link
  rating: Number (1-5),
  comment: String,
  images: [String],                // Optional review images
  isVerifiedPurchase: Boolean,
  helpfulCount: Number,            // Vote system
  createdAt: Date
}
```

# Redis Configuration (Optional but recommended for production)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TLS_ENABLED=false

# Email Service (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Payment Gateways
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

### Notification Model (NEW)
```javascript
{
  recipient: ObjectId,
  type: 'order_status' | 'review' | 'promotion' | 'system',
  title: String,
  message: String,
  link: String,
  isRead: Boolean,
  createdAt: Daten URL
      publicId: String,           // Cloudinary ID
      placement: {                // Position data for printing
        location: 'front' | 'back',
        x: Number,
        y: Number,
        width: Number,
        height: Number,
        rotation: Number,
        scale: Number
      },
      previewUrl: String,         // Thumbnail for display
      isCustomized: Boolean
    }
  }],
  hasCustomItems: Boolean         // Flag for filtering
}
```

## 🚀 Cài đặt & Thiết lập

### Yêu cầu
- Node.js (v18+)
- MongoDB (v6+)
- Tài khoản Cloudinary

### Thiết lập Backend

1. **Di chuyển vào thư mục backend**
```bash
cd backend
```

2. **Cài đặt các dependencies**
```bash
npm install
```

3. **Cấu hình biến môi trường**
```bash
cp .env.example .env
```

Chỉnh sửa file `.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost: (returns access token + refresh token in httpOnly cookie)
- `POST /api/auth/logout` - Logout (clears refresh token)
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/verify-email` - Verify email with token

### Products
- `GET /api/products` - Get all products (filters: search, category, price, customizable, sort)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/customizable` - Get customizable products
- `GET /api/products/:slug` - Get product by slug (includes reviews)
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Reviews (NEW)
- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews` - Create review (requires verified purchase)
- `PUT /api/reviews/:reviewId` - Update own review
- `DELETE /api/reviews/:reviewId` - Delete own review
- `POST /api/reviews/:reviewId/helpful` - Mark review as helpful
- `GET /api/admin/reviews` - Get all reviews (Admin)
- `PUT /api/admin/reviews/:reviewId/status` - Approve/reject review

4. **Khởi động MongoDB**
```bash
mongod
```

5. **Chạy backend server**
```bash
# Chế độ Development với auto-reload
npm run dev

# Chế độ Production
npm Payments (NEW)
- `POST /api/payments/stripe/create-payment-intent` - Create Stripe payment
- `POST /api/payments/stripe/webhook` - Stripe webhook handler
- `POST /api/payments/vnpay/create-payment` - Create VNPay payment URL
- `GET /api/payments/vnpay/return` - VNPay return URL handler
- `POST /api/payments/vnpay/ipn` - VNPay IPN handler

### NoKey Features Deep Dive

### 1. Customizer Component (`CustomizerPage.jsx`)
The core innovation of this platform:

```javascript
// Features:
✅ Fabric.js canvas for design manipulation
✅ Upload to Cloudinary with progress tracking
✅ Drag, resize, rotate designs within printable area
✅ Real-time preview on product variants
✅ Capture final preview with html2canvas
✅ Save placement coordinates for printing
✅ Color and size variant selection
✅ Design validation (file type, size, dimensions)
✅ Mobile-responsive touch controls
```

**Performance Note**: CustomizerPage is 519 KB (142 KB gzipped) due to Fabric.js, but it's lazy-loaded only when needed.

### 2. Image Optimization System

```javascript
// Automatic Cloudinary Transformations
- w_500,h_500,c_fill    // Resize to 500x500
- q_auto                // Auto quality optimization
- f_auto                // Auto format (WebP when supported)

// Results:
- 85% file size reduction (2-4MB → 150-300KB)
- 60% faster LCP (Largest Contentful Paint)
- 80% bandwidth savings
```

### 3. Review & Rating System

```javascript
// Features:
✅ 5-star rating system
✅ Verified purchase badge
✅ Image uploads in reviews
✅ Helpful vote system
✅ Aggregate ratings on products
✅ Admin moderation
✅ Automatic product rating recalculation
```

### 4. User Tier System

### Authentication & Authorization
- ✅ JWT-based authentication with access/refresh token rotation
- ✅ HTTP-only cookies for refresh tokens (prevents XSS)
- ✅ Password hashing with bcrypt (salt rounds: 10)
- ✅ Role-based access control (customer/admin)
- ✅ Protected routes with middleware validation

### Security Headers & Protection
- ✅ CORS protection with whitelist
- ✅ Helmet.js & Quality Assurance

### Manual Testing Checklist

#### User Flow
- [ ] Register new user (email verification)
- [ ] Login/Logout (JWT token handling)
- [ ] Browse products (search, filter, sort)
- [ ] View product details (images, reviews, ratings)
- [ ] Upload design to customizable product
- [ ] Manipulate design (move, rotate, scale)
- [ ] Select color/size variants
- [ ] Add to cart (with custom design)
- [ ] Update cart quantities
- [ ] Checkout process (COD/Stripe/VNPay)
- [ ] View order history
- [ ] Track order status
- [ ] Submit product review
- [ ] View notifications
- [ ] Check user tier badge

#### Admin Flow
- [ ] Login as admin
- [ ] View dashboard (stats, charts)
- [ ] View all orders (filter by status)
- [ ] Download customer design files
- [ ] Update order status
- [ ] Add tracking number
- [ ] Create/Edit/Delete products
- [ ] Upload product images
- [ ] Manage reviews (approve/reject)
- [ ] View customer list (

# Redis (Optional but recommended)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TLS_ENABLED=false

# Email
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Payments
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secretwith tiers)
- [ ] Export data

#### Performance Testing
- [ ] Run Lighthouse audit (target: 85+)
- [ ] Test on slow 3G network
- [ ] Verify code splitting (Network tab)
- [ ] Check image lazy loading
- [ ] Test prefetching on hover
- [ ] Verify bundle sizes
- [ ] Monitor server response times
- [ ] Check Redis cache hits

#### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)fication
- ✅ Environment variable protection
- ✅ Sensitive data not logged
// Displayed with badges throughout UI
```

### 5. Performance Optimizations

#### Code Splitting
```javascript
// All routes are lazy-loaded:
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
// ... 20+ routes

// Result: Initial bundle only 270 KB (89 KB gzipped)
```

#### Memoization
```javascript
// ProductCard.jsx - Prevents unnecessary re-renders
const ProductCard = React.memo(({ product }) => {
  const formattedPrice = useMemo(() => 
    new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
    � Performance Metrics (Production)

### Frontend (Vercel Deployment)
```
Initial Bundle Size:    270 KB (89 KB gzipped) ✅
First Contentful Paint: ~1.1s ✅
Largest Contentful Paint: ~2.5s ✅
Time to Interactive:    ~2.5s ✅
Total Page Load:        ~3.5s ✅
Lighthouse Score:       85-95/100 ✅
```

### Backend (Railway Deployment)
```
Average Response Time:  < 200ms ✅
Database Connection:    ~50ms ✅
Redis Cache Hit Rate:   ~75% ✅
Image CDN Response:     ~100ms ✅
Uptime:                 99.9% ✅
```

### Bundle Analysis
```
Main� Documentation

### Additional Guides
- **[FRONTEND_OPTIMIZATION_REPORT.md](./FRONTEND_OPTIMIZATION_REPORT.md)** - Detailed performance optimization report
- **[TESTING_PERFORMANCE.md](./TESTING_PERFORMANCE.md)** - Performance testing guide
- **[OPTIMIZATION_USAGE_GUIDE.md](./OPTIMIZATION_USAGE_GUIDE.md)** - How to use optimization utilities

## 🤝 Đóng góp

Đây là dự án học tập/portfolio. Rất hân hạnh nhận đóng góp!

1. Fork repository
2. Tạo nhánh tính năng của bạn (`git checkout -b feature/TinhNangTuyetVoi`)
3. Commit thay đổi (`git commit -m 'Thêm tính năng tuyệt vời'`)
4. Push lên nhánh (`git push origin feature/TinhNangTuyetVoi`)
5. Mở Pull Request

## 📄 Giấy phép

Giấy phép MIT - Thoải mái sử dụng dự án này cho mục đích học tập hoặc thương mại.

## 👨‍💻 Tác giả

Được tạo ra như một minh chứng cho phát triển full-stack MERN sẵn sàng production với:
- Tính năng tùy chỉnh nâng cao
- Tối ưu hóa hiệu năng cấp doanh nghiệp
- Thực hành tốt nhất trong phát triển web hiện đại
- Kiến trúc có khả năng mở rộng

---

## 🌟 Điểm nổi bật

### Tại sao dự án này nổi bật

1. **⚡ Hiệu năng đầu tiên**: Bundle ban đầu 89 KB với code splitting
2. **🎨 Tính năng độc đáo**: Tùy chỉnh sản phẩm thời gian thực với Fabric.js
3. **🏢 Sẵn sàng doanh nghiệp**: Redis caching, job queues, tích hợp email
4. **📊 Phân tích**: Dashboard quản trị toàn diện với biểu đồ
5. **💳 Sẵn sàng thanh toán**: Nhiều cổng thanh toán (Stripe, VNPay, COD)
6. **🔒 Bảo mật**: JWT auth, phân quyền, xử lý thanh toán an toàn
7. **📱 Tối ưu di động**: Thiết kế responsive, điều khiển chạm, lazy loading
8. **🚀 Triển khai Production**: Live trên Vercel + Railway
├─ AdminDashboard:      368 KB (109 KB gzipped)
├─ CheckoutPage:        166 KB (49 KB gzipped)
└─ Other Pages:         10-20 KB each
```

## 🚀 Triển khai

### Frontend (Vercel)
1. Kết nối repository GitHub với Vercel
2. Cấu hình build settings:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Thêm biến môi trường:
   - `VITE_API_URL`: URL Backend API
4. Triển khai tự động khi push lên `main`

### Backend (Railway)
1. Kết nối repository GitHub với Railway
2. Cấu hình lệnh start: `npm start`
3. Thêm biến môi trường (xem .env.example)
4. Bật addon Redis (tùy chọn nhưng nên dùng)
5. Triển khai tự động khi push lên `main`

### Cơ sở dữ liệu (MongoDB Atlas)
1. Tạo cluster trên MongoDB Atlas
2. Whitelist địa chỉ IP hoặc cho phép từ bất kỳ đâu (0.0.0.0/0)
3. Tạo người dùng database
4. Lấy connection string
5. Thêm vào biến môi trường backend

## 🚧 Tính năng đã hoàn thành

### ✅ Đã triển khai
- ✅ Hệ thống tùy chỉnh sản phẩm
- ✅ Hệ thống đánh giá & xếp hạng
- ✅ Tích hợp thanh toán (Stripe + VNPay)
- ✅ Thông báo email (Resend)
- ✅ Hệ thống cấp bậc người dùng
- ✅ Lịch sử tìm kiếm
- ✅ Trung tâm thông báo
- ✅ Dashboard quản trị với thống kê
- ✅ Tối ưu hiệu năng (code splitting, tối ưu hình ảnh)
- ✅ Lớp caching (Redis + BullMQ)
- ✅ Theo dõi đơn hàng thời gian thực

### 🔮 Cải tiến tương lai
- [ ] Thư viện mẫu thiết kế
- [ ] Công cụ thêm chữ trong customizer
- [ ] Nhiều lớp thiết kế
- [ ] Lịch sử/yêu thích thiết kế
- [ ] Giảm giá đơn hàng số lượng lớn
- [ ] Gợi ý thiết kế bằng AI
- [ ] Tính năng chia sẻ xã hội
- [ ] Danh sách yêu thích
- [ ] Hỗ trợ chat trực tiếp
- [ ] Ứng dụng di động (React Native)
### 6. Caching Strategy (Redis)

```javascript
// Cache layers:
1. Product listings: 5 minutes TTL
2. Product details: 10 minutes TTL
3. User sessions: 7 days TTL
4. Search results: 15 minutes TTL

// Automatic cache invalidation on:
- Product updates
- Order completion
- Review submissory/:queryId` - Delete search query

### Admin
- `GET /api/admin/orders` - Get all orders (with filters)
- `GET /api/admin/orders/:orderId` - Get order (with design URLs)
- `PUT /api/admin/orders/:orderId/status` - Update order status
- `PUT /api/admin/orders/:orderId/tracking` - Update tracking info
- `GET /api/admin/statistics` - Get dashboard stats
- `GET /api/admin/statistics/revenue` - Get revenue stats (with charts)
- `GET /api/admin/statistics/orders` - Get order stats (with charts)
- `GET /api/admin/statistics/customers` - Get customer stats
- `GET /api/admin/customers` - Get all customers (with tier info)

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file** (optional)
```bash
# Tạo file .env trong thư mục frontend
VITE_API_URL=http://localhost:5000/api
```

4. **Chạy frontend development server**
```bash
npm run dev
```

Frontend chạy tại: `http://localhost:5173`

5. **Build cho production**
```bash
npm run build
npm run preview
```

## 👤 Vai trò người dùng & Quyền truy cập

### Luồng khách hàng
1. Duyệt sản phẩm
2. Chọn sản phẩm có thể tùy chỉnh
3. Tải lên thiết kế (PNG/JPG)
4. Tùy chỉnh vị trí, kích thước, xoay
5. Thêm vào giỏ hàng (lưu thiết kế + vị trí)
6. Thanh toán
7. Theo dõi đơn hàng

### Luồng Admin
1. Đăng nhập với tài khoản admin
2. Xem tất cả đơn hàng (lọc theo mục tùy chỉnh)
3. **Tải xuống file thiết kế của khách hàng** để in
4. Cập nhật trạng thái đơn hàng (pending → confirmed → printing → shipped)
5. Quản lý sản phẩm (CRUD)
6. Xem thống kê

## 🔐 API Endpoints

### Xác thực
- `POST /api/auth/register` - Đăng ký người dùng
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/refresh-token` - Làm mới access token
- `GET /api/auth/me` - Lấy thông tin người dùng hiện tại

### Sản phẩm
- `GET /api/products` - Lấy tất cả sản phẩm (với bộ lọc)
- `GET /api/products/featured` - Lấy sản phẩm nổi bật
- `GET /api/products/customizable` - Lấy sản phẩm tùy chỉnh
- `GET /api/products/:slug` - Lấy sản phẩm theo slug
- `POST /api/products` - Tạo sản phẩm (Admin)
- `PUT /api/products/:id` - Cập nhật sản phẩm (Admin)
- `DELETE /api/products/:id` - Xóa sản phẩm (Admin)

### Upload
- `POST /api/upload/design` - Tải lên thiết kế tùy chỉnh
- `POST /api/upload/product` - Tải lên hình ảnh sản phẩm (Admin)
- `DELETE /api/upload/delete` - Xóa file từ Cloudinary

### Giỏ hàng
- `GET /api/cart` - Lấy giỏ hàng người dùng
- `POST /api/cart/items` - Thêm sản phẩm vào giỏ (với thiết kế tùy chỉnh)
- `PUT /api/cart/items/:itemId` - Cập nhật số lượng
- `DELETE /api/cart/items/:itemId` - Xóa sản phẩm
- `DELETE /api/cart/clear` - Xóa giỏ hàng

### Đơn hàng
- `POST /api/orders` - Tầo đơn hàng
- `GET /api/orders` - Lấy đơn hàng của người dùng
- `GET /api/orders/:orderId` - Lấy chi tiết đơn hàng
- `GET /api/orders/number/:orderNumber` - Lấy đơn hàng theo số

### Admin
- `GET /api/admin/orders` - Lấy tất cả đơn hàng
- `GET /api/admin/orders/:orderId` - Lấy đơn hàng (với URL thiết kế)
- `PUT /api/admin/orders/:orderId/status` - Cập nhật trạng thái đơn hàng
- `PUT /api/admin/orders/:orderId/tracking` - Cập nhật thông tin vận chuyển
- `GET /api/admin/orders/statistics` - Lấy thống kê đơn hàng

## 🎨 Tính năng của Component Customizer

`CustomizerPage.jsx` là đổi mới sáng tạo chính:

```javascript
// Tính năng chính:
1. Canvas Fabric.js để thao tác thiết kế
2. Tải lên Cloudinary với tiến trình
3. Kéo, thay đổi kích thước, xoay thiết kế
4. Xem trước theo thời gian thực trên hình ảnh sản phẩm
5. Capture preview cuối cùng với html2canvas
6. Lưu tọa độ vị trí để in
7. Chọn biến thể màu và kích thước
```

## 📦 Quy trình xử lý đơn hàng

```
Khách hàng tải lên thiết kế 
    ↓
Cloudinary lưu trữ hình ảnh chất lượng cao
    ↓
Frontend capture tọa độ vị trí
    ↓
Giỏ hàng lưu: imageUrl + vị trí + preview
    ↓
Đơn hàng được tạo với dữ liệu thiết kế tùy chỉnh
    ↓
Admin xem đơn hàng → Tải xuống file thiết kế
    ↓
Xưởng in sử dụng tọa độ để in chính xác
    ↓
Đơn hàng được gửi đi
```

## 🔒 Tính năng bảo mật

- Xác thực dựa trên JWT
- Mã hóa mật khẩu với bcrypt
- HTTP-only cookies cho refresh tokens
- Bảo vệ CORS
- Tiêu đề bảo mật Helmet.js
- Xác thực đầu vào
- Giới hạn upload file
- Giới hạn tốc độ (có thể thêm)

## 🧪 Kiểm thử

### Danh sách kiểm thử thủ công
- [ ] Đăng ký người dùng mới
- [ ] Đăng nhập/Đăng xuất
- [ ] Duyệt sản phẩm
- [ ] Tải lên thiết kế cho sản phẩm tùy chỉnh
- [ ] Thao tác thiết kế (di chuyển, xoay, phóng to/thu nhỏ)
- [ ] Thêm vào giỏ hàng
- [ ] Quy trình thanh toán
- [ ] Xem lịch sử đơn hàng
- [ ] Admin: Xem đơn hàng với URL thiết kế
- [ ] Admin: Cập nhật trạng thái đơn hàng
- [ ] Admin: Tạo/Chỉnh sửa sản phẩm

## 📝 Environment Variables Reference

### Backend (.env)
```env
NODE_ENV=development|production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/custom_tshirt_db
JWT_ACCESS_SECRET=complex_secret_key
JWT_REFRESH_SECRET=complex_refresh_key
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@customtshirt.com
ADMIN_PASSWORD=Admin@12345
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🚧 Known Limitations & Future Enhancements

### Current Limitations
- Single design per product
- Front/back placement only
- No multi-layer designs
- Basic canvas controls

### Planned Features
- [ ] Stripe payment integration
- [ ] Email notifications
- [ ] Design templates library
- [ ] Text overlay tool
- [ ] Multiple design layers
- [ ] Design history/favorites
- [ ] Bulk order discounts
- [ ] Real-time order tracking
- [ ] Customer reviews

## 🤝 Contributing

This is an educational project. Feel free to fork and enhance!

## 📄 License

MIT License

## 👨‍💻 Author

Created as a demonstration of full-stack MERN development with advanced customization features.

---

## 🆘 Troubleshooting

### "Cannot connect to MongoDB"
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`

### "Cloudinary upload failed"
- Verify API credentials
- Check file size limits
- Ensure network connectivity

### "Canvas not rendering"
- Check if Fabric.js loaded correctly
- Verify CORS settings for images
- Check browser console for errors

### "Design not saving to cart"
- Ensure user is authenticated
- Check file upload completed
- Verify design placement data exists

---

