# 🎨 Custom T-Shirt E-Commerce Platform

> 🚀 **Full-Stack MERN** | ⚡ **Performance Optimized** | 🎨 **Real-time Customization**

Nền tảng thương mại điện tử chuyên về in áo phông tùy chỉnh, cho phép khách hàng thiết kế và đặt hàng áo với hình ảnh riêng của họ. Hệ thống bao gồm công cụ thiết kế canvas, quản lý đơn hàng tùy chỉnh, thanh toán đa cổng và dashboard quản trị toàn diện.

## 📸 Screenshots

![Homepage](https://via.placeholder.com/800x400?text=Homepage)
![Customizer](https://via.placeholder.com/800x400?text=Design+Customizer)
![Admin Dashboard](https://via.placeholder.com/800x400?text=Admin+Dashboard)

## ✨ Tính năng nổi bật

### 🎨 Công cụ thiết kế tùy chỉnh
- **Canvas Editor**: Sử dụng Fabric.js để thao tác thiết kế trực tiếp trên canvas
- **Upload & Transform**: Tải lên hình ảnh, kéo thả, xoay, phóng to/thu nhỏ
- **Real-time Preview**: Xem trước thiết kế trên sản phẩm theo thời gian thực
- **Design Export**: Lưu thiết kế với tọa độ chính xác để in ấn
- **Multiple Variants**: Hỗ trợ nhiều màu sắc và kích thước

### 🛒 Hệ thống mua sắm
- **Product Management**: Quản lý sản phẩm với categories, variants, stock
- **Smart Cart**: Giỏ hàng lưu cả thiết kế và thông tin tùy chỉnh
- **Multi-Payment**: Tích hợp Stripe, VNPay và COD
- **Order Tracking**: Theo dõi đơn hàng theo thời gian thực
- **Email Notifications**: Gửi email xác nhận và cập nhật đơn hàng

### ⭐ Review & Rating System
- **Star Ratings**: Đánh giá 1-5 sao với bình luận
- **Verified Purchase**: Hiển thị badge "đã mua hàng"
- **Image Upload**: Khách hàng có thể đính kèm ảnh trong review
- **Helpful Votes**: Hệ thống bình chọn review hữu ích
- **Admin Moderation**: Quản trị có thể phê duyệt/từ chối review

### 👥 User Tier System
- **Bronze/Silver/Gold/Platinum**: Phân cấp dựa trên tổng chi tiêu
- **Tier Benefits**: Hiển thị badge và có thể áp dụng ưu đãi
- **Auto Upgrade**: Tự động nâng cấp khi đạt mốc chi tiêu
- **Profile Display**: Hiển thị tier trên profile và reviews

### 🔔 Notification Center
- **Real-time Updates**: Thông báo trạng thái đơn hàng, review mới
- **Read/Unread Tracking**: Theo dõi thông báo đã đọc/chưa đọc
- **Quick Actions**: Click để xem chi tiết đơn hàng hoặc review
- **Notification Types**: Order updates, reviews, promotions, system alerts

### 📊 Admin Dashboard
- **Analytics**: Doanh thu, đơn hàng, khách hàng với biểu đồ
- **Order Management**: Xem, lọc, cập nhật trạng thái đơn hàng
- **Product CRUD**: Tạo, sửa, xóa sản phẩm với upload ảnh
- **Review Management**: Phê duyệt, từ chối, trả lời reviews
- **Customer Insights**: Xem danh sách khách hàng với tier và chi tiêu
- **Design Download**: Tải xuống thiết kế khách hàng để in ấn

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│  React 18 + Vite + Tailwind + Zustand + React Router       │
│  - Lazy Loading Routes                                      │
│  - Canvas Customizer (Fabric.js)                            │
│  - Image Optimization (Cloudinary)                          │
│  - State Management (Zustand)                               │
└────────────────────┬────────────────────────────────────────┘
                     │ REST API
┌────────────────────▼────────────────────────────────────────┐
│                         Backend                             │
│         Node.js + Express + MongoDB + Redis                 │
│  - JWT Authentication                                       │
│  - File Upload (Multer + Cloudinary)                        │
│  - Payment Processing (Stripe + VNPay)                      │
│  - Email Service (Resend)                                   │
│  - Job Queue (BullMQ)                                       │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
   ┌─────────┐        ┌──────────┐        ┌──────────┐
   │ MongoDB │        │  Redis   │        │Cloudinary│
   └─────────┘        └──────────┘        └──────────┘
```

## 🗂️ Cấu trúc dự án

```
Web_Ao_Custom/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js       # MongoDB connection
│   │   │   ├── cloudinary.js     # Cloudinary config
│   │   │   ├── redis.js          # Redis client
│   │   │   └── queue.js          # BullMQ setup
│   │   ├── models/
│   │   │   ├── User.model.js     # User schema với tier system
│   │   │   ├── Product.model.js  # Product với customizable flag
│   │   │   ├── Cart.model.js     # Cart với custom design support
│   │   │   ├── Order.model.js    # Order với design placement data
│   │   │   ├── Review.model.js   # Review với verified purchase
│   │   │   └── Notification.model.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── product.controller.js
│   │   │   ├── cart.controller.js
│   │   │   ├── order.controller.js
│   │   │   ├── review.controller.js
│   │   │   ├── payment.controller.js
│   │   │   └── admin.controller.js
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── cache.service.js   # Redis caching
│   │   │   ├── mail.service.js    # Resend integration
│   │   │   ├── payment.service.js # Stripe + VNPay
│   │   │   ├── user.service.js    # Tier calculation
│   │   │   └── notification.service.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   ├── errorHandler.js
│   │   │   └── validators.js
│   │   ├── routes/
│   │   └── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Header.jsx
    │   │   │   └── Footer.jsx
    │   │   ├── auth/
    │   │   │   ├── ProtectedRoute.jsx
    │   │   │   └── AdminRoute.jsx
    │   │   ├── ProductCard.jsx
    │   │   ├── ReviewCard.jsx
    │   │   ├── ReviewForm.jsx
    │   │   ├── StarRating.jsx
    │   │   ├── TierBadge.jsx
    │   │   └── NotificationCenter.jsx
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── ProductsPage.jsx
    │   │   ├── ProductDetailPage.jsx
    │   │   ├── CustomizerPage.jsx    # 🎨 CORE: Canvas editor
    │   │   ├── CartPage.jsx
    │   │   ├── CheckoutPage.jsx
    │   │   ├── user/
    │   │   │   ├── DashboardPage.jsx
    │   │   │   ├── OrdersPage.jsx
    │   │   │   └── ProfilePage.jsx
    │   │   └── admin/
    │   │       ├── AdminDashboard.jsx
    │   │       ├── AdminOrders.jsx
    │   │       ├── AdminProducts.jsx
    │   │       └── AdminReviews.jsx
    │   ├── stores/
    │   │   ├── useAuthStore.js      # Zustand auth store
    │   │   └── useCartStore.js      # Zustand cart store
    │   ├── utils/
    │   │   ├── api.js               # Axios instance
    │   │   └── imageOptimization.js # Cloudinary helpers
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```
## 💻 Tech Stack

### Backend
| Công nghệ | Mục đích |
|-----------|----------|
| **Node.js 18** + **Express.js** | RESTful API server |
| **MongoDB** + **Mongoose** | NoSQL database & ODM |
| **Redis** + **BullMQ** | Caching & Background jobs |
| **JWT** | Authentication (Access/Refresh tokens) |
| **Cloudinary** | Image storage & CDN |
| **Stripe** + **VNPay** | Payment processing |
| **Resend** | Transactional emails |
| **Multer** | File upload handling |
| **Bcrypt** | Password hashing |
| **Winston** | Logging system |

### Frontend
| Công nghệ | Mục đích |
|-----------|----------|
| **React 18** | UI framework |
| **Vite** | Build tool & dev server |
| **Tailwind CSS** | Utility-first CSS |
| **Zustand** | Lightweight state management |
| **React Router v6** | Client-side routing |
| **Fabric.js** | Canvas manipulation |
| **html2canvas** | Canvas screenshot |
| **Axios** | HTTP client |
| **React Hot Toast** | Toast notifications |
| **Recharts** | Data visualization |

### DevOps & Tools
- **Vercel** - Frontend hosting
- **Railway** - Backend hosting
- **MongoDB Atlas** - Cloud database
- **Git** - Version control
- **ESLint** + **Prettier** - Code quality

## 🗄️ Database Schema

### Collections

#### Users
```javascript
{
  email: String (unique),
  password: String (hashed),
  name: String,
  role: 'customer' | 'admin',
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum',
  totalSpent: Number,
  searchHistory: [{ query, timestamp }],
  createdAt: Date
}
```

#### Products
```javascript
{
  name: String,
  slug: String (unique),
  description: String,
  price: Number,
  compareAtPrice: Number,
  isCustomizable: Boolean, // Flag cho sản phẩm có thể tùy chỉnh
  printableArea: {
    location: 'front' | 'back',
    width: Number,
    height: Number,
    offsetX: Number,
    offsetY: Number
  },
  variantColors: [{ name, hexCode, imageUrl }],
  sizes: [{ name, stock }],
  images: [{ url, publicId }],
  rating: { average: Number, count: Number },
  category: ObjectId
}
```

#### Orders
```javascript
{
  orderNumber: String (unique),
  user: ObjectId,
  items: [{
    product: ObjectId,
    customDesign: {
      imageUrl: String,        // Cloudinary URL
      publicId: String,
      placement: {             // Tọa độ cho in ấn
        location: 'front' | 'back',
        x: Number,
        y: Number,
        width: Number,
        height: Number,
        rotation: Number
      },
      previewUrl: String       // Preview thumbnail
    },
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  paymentMethod: 'stripe' | 'vnpay' | 'cod',
  paymentStatus: 'pending' | 'paid' | 'failed',
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered',
  shippingAddress: Object,
  createdAt: Date
}
```

#### Reviews
```javascript
{
  user: ObjectId,
  product: ObjectId,
  order: ObjectId,              // Link đến đơn hàng
  rating: Number (1-5),
  comment: String,
  images: [String],             // URLs của ảnh review
  isVerifiedPurchase: Boolean,
  helpfulCount: Number,
  createdAt: Date
}
```

## 🔄 Core Workflows

### 1. Customization Flow
```
1. Khách hàng chọn sản phẩm customizable
2. Upload hình ảnh (PNG/JPG) → Cloudinary
3. Fabric.js canvas: kéo, xoay, phóng to/thu nhỏ
4. html2canvas capture preview
5. Lưu vào Cart: {imageUrl, placement, previewUrl}
6. Checkout → Order với đầy đủ thông tin thiết kế
7. Admin xem Order → Download design file để in
```

### 2. Payment Flow
```
Customer → Cart → Checkout
                     ↓
        ┌────────────┴────────────┐
        ▼            ▼             ▼
    Stripe        VNPay          COD
        │            │             │
        └────────────┴─────────────┘
                     ↓
            Payment Success
                     ↓
         Create Order + Send Email
```

### 3. Review Flow
```
Order Delivered → Customer writes review
                         ↓
              Upload images (optional)
                         ↓
              Admin moderation (approve/reject)
                         ↓
              Display on product page
                         ↓
        Auto-update product rating average
```

## 🚀 Cài đặt & Chạy

### Yêu cầu
- Node.js 18+
- MongoDB 6+
- Tài khoản Cloudinary

### Cài đặt nhanh

```bash
# Clone repo
git clone <repo-url>

# Backend
cd backend
npm install
cp .env.example .env
# Chỉnh sửa .env với thông tin của bạn
npm run dev

# Frontend (terminal mới)
cd frontend
npm install
npm run dev
```

### Environment Variables

**Backend (.env)**
```env
MONGODB_URI=your_mongodb_uri
JWT_ACCESS_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
STRIPE_SECRET_KEY=sk_test_xxx
VNPAY_TMN_CODE=your_code
RESEND_API_KEY=re_xxx
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api
```

Chi tiết cài đặt đầy đủ xem tại [INSTALLATION.md](./INSTALLATION.md)

## 📱 API Documentation

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Lấy thông tin user

### Products
- `GET /api/products` - Danh sách sản phẩm (hỗ trợ filter, search, sort)
- `GET /api/products/:slug` - Chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm (Admin)

### Orders
- `POST /api/orders` - Tạo đơn hàng
- `GET /api/orders` - Lịch sử đơn hàng
- `GET /api/admin/orders` - Quản lý đơn hàng (Admin)

### Reviews
- `POST /api/reviews` - Viết review
- `GET /api/reviews/product/:id` - Lấy reviews của sản phẩm
- `POST /api/reviews/:id/helpful` - Vote helpful

Chi tiết API đầy đủ xem tại [API.md](./API.md)

## 🎯 Performance Metrics

- ⚡ Initial Bundle: **89 KB** (gzipped)
- 🚀 Time to Interactive: **< 2.5s**
- 📊 Lighthouse Score: **90+**
- 🖼️ Image Optimization: **85% reduction**
- 💾 Redis Cache Hit Rate: **~75%**

## 🛠️ Development

```bash
# Backend development
cd backend
npm run dev          # Nodemon with auto-reload

# Frontend development
cd frontend
npm run dev          # Vite dev server

# Production build
npm run build
npm start
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License

## 👨‍💻 Author

Dự án được phát triển như một demo cho hệ thống e-commerce full-stack với:
- ✅ Tính năng customization độc đáo
- ✅ Performance optimization
- ✅ Modern web practices
- ✅ Scalable architecture

---

⭐ Nếu thấy project hữu ích, đừng quên star nhé!
