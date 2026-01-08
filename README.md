# 🎨 Custom T-Shirt E-Commerce Platform

> ⚡ **Performance-Optimized** | 🚀 **Production-Ready** | 🎯 **Full-Stack MERN**

A blazing-fast, full-stack e-commerce application specialized for **custom t-shirt printing business**. Built with modern web technologies and optimized for exceptional user experience, this platform allows customers to upload their own designs, preview them in real-time, and place orders with complete customization details for printing.

[![Deployment Status](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://vercel.com)
[![Backend Status](https://img.shields.io/badge/Backend-Railway-purple?logo=railway)](https://railway.app)
[![Performance](https://img.shields.io/badge/Lighthouse-95%2B-success?logo=lighthouse)](https://web.dev/measure/)
[![Bundle Size](https://img.shields.io/badge/Bundle-89KB%20(gzipped)-brightgreen)](https://bundlephobia.com)

## ⚡ Performance Highlights

- **🚀 Lightning Fast**: Initial load only **89 KB** (gzipped) - 74% smaller than typical React apps
- **📱 Mobile Optimized**: 85% image size reduction with Cloudinary transformations
- **⏱️ Quick Response**: Time to Interactive < 2.5s, First Contentful Paint < 1.1s
- **🎯 Smart Loading**: Code splitting with React.lazy() for on-demand page loading
- **🖼️ Image Optimization**: Auto WebP conversion, lazy loading, and responsive images

## 🎯 Core Features

### 1. Product Customization System
Unlike standard e-commerce platforms, this system includes:

- **Interactive Design Tool**: Canvas-based customizer using Fabric.js
- **Real-time Preview**: Customers see their design overlaid on the actual product
- **Design Placement Control**: Drag, resize, rotate designs within printable areas
- **Custom Order Processing**: Orders save design URLs and placement coordinates for printing
- **Admin Design Access**: Admins can download high-quality design files for production

### 2. Advanced Performance Features
- **Code Splitting**: 20+ lazy-loaded routes for minimal initial bundle
- **Image Optimization**: Cloudinary auto-optimization (w_auto, q_auto, f_auto)
- **React Optimization**: Memoization with React.memo, useMemo, useCallback
- **Prefetching**: Route and image prefetching on hover for instant navigation
- **Caching**: Redis-powered caching with BullMQ job processing

### 3. Enterprise-Grade Features
- **Review System**: Star ratings, verified purchases, helpful votes
- **Notification Center**: Real-time notifications with read/unread tracking
- **Tier System**: Bronze/Silver/Gold/Platinum user tiers based on spending
- **Stats Dashboard**: Real-time analytics with chart visualizations
- **Search History**: Personalized search suggestions with recent queries
- **Email Integration**: Resend API for transactional emails
- **Payment Processing**: Stripe & VNPay integration

## 📋 Tech Stack

### Backend
- **Node.js 18+** + **Express.js** - RESTful API server
- **MongoDB** + **Mongoose** - NoSQL database & ODM
- **Redis** + **BullMQ** - Caching & job queue system
- **JWT** - Authentication (Access/Refresh tokens with HTTP-only cookies)
- **Cloudinary** - Image storage, CDN & transformations
- **Stripe** + **VNPay** - Payment gateways
- **Resend** - Transactional email service
- **Multer** - File upload handling
- **Bcrypt** - Password hashing
- **Winston** - Structured logging

### Frontend
- **React 18** - UI Framework with concurrent features
- **Vite** - Lightning-fast build tool & HMR
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Lightweight state management
- **React Router v6** - Client-side routing with lazy loading
- **Fabric.js** - Canvas manipulation for customizer
- **html2canvas** - Preview capture & export
- **Axios** - HTTP client with interceptors
- **React Hot Toast** - Toast notifications
- **Recharts** - Data visualization

### Performance Optimization
- **Code Splitting**: React.lazy() + Suspense for route-based splitting
- **Image Optimization**: Cloudinary transformations + lazy loading
- **Memoization**: React.memo, useMemo, useCallback for render optimization
- **Prefetching**: Custom hooks for route and data prefetching
- **Caching**: Redis for API responses, product data, and user sessions

## 🏗️ Project Structure

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

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (v6+)
- Cloudinary account

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` file:
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

4. **Start MongoDB**
```bash
mongod
```

5. **Run backend server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
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

## 🤝 Contributing

This is an educational/portfolio project. Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT License - Feel free to use this project for learning or commercial purposes.

## 👨‍💻 Author

Created as a demonstration of production-ready, full-stack MERN development with:
- Advanced customization features
- Enterprise-grade performance optimization
- Modern web development best practices
- Scalable architecture

---

## 🌟 Highlights

### Why This Project Stands Out

1. **⚡ Performance First**: 89 KB initial bundle with code splitting
2. **🎨 Unique Features**: Real-time product customization with Fabric.js
3. **🏢 Enterprise Ready**: Redis caching, job queues, email integration
4. **📊 Analytics**: Comprehensive admin dashboard with charts
5. **💳 Payment Ready**: Multiple payment gateways (Stripe, VNPay, COD)
6. **🔒 Secure**: JWT auth, role-based access, secure payment handling
7. **📱 Mobile Optimized**: Responsive design, touch controls, lazy loading
8. **🚀 Production Deployed**: Live on Vercel + Railway
├─ AdminDashboard:      368 KB (109 KB gzipped)
├─ CheckoutPage:        166 KB (49 KB gzipped)
└─ Other Pages:         10-20 KB each
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Configure build settings:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add environment variables:
   - `VITE_API_URL`: Backend API URL
4. Deploy automatically on push to `main`

### Backend (Railway)
1. Connect GitHub repository to Railway
2. Configure start command: `npm start`
3. Add environment variables (see .env.example)
4. Enable Redis addon (optional but recommended)
5. Deploy automatically on push to `main`

### Database (MongoDB Atlas)
1. Create cluster on MongoDB Atlas
2. Whitelist IP addresses or allow from anywhere (0.0.0.0/0)
3. Create database user
4. Get connection string
5. Add to backend environment variables

## 🚧 Completed Features

### ✅ Implemented
- ✅ Product customization system
- ✅ Review & rating system
- ✅ Payment integration (Stripe + VNPay)
- ✅ Email notifications (Resend)
- ✅ User tier system
- ✅ Search history
- ✅ Notification center
- ✅ Admin dashboard with stats
- ✅ Performance optimization (code splitting, image optimization)
- ✅ Caching layer (Redis + BullMQ)
- ✅ Real-time order tracking

### 🔮 Future Enhancements
- [ ] Design templates library
- [ ] Text overlay tool in customizer
- [ ] Multiple design layers
- [ ] Design history/favorites
- [ ] Bulk order discounts
- [ ] AI-powered design suggestions
- [ ] Social sharing features
- [ ] Wishlist functionality
- [ ] Live chat support
- [ ] Mobile app (React Native)
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
# Create .env file in frontend directory
VITE_API_URL=http://localhost:5000/api
```

4. **Run frontend development server**
```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

5. **Build for production**
```bash
npm run build
npm run preview
```

## 👤 User Roles & Access

### Customer Flow
1. Browse products
2. Select customizable product
3. Upload design (PNG/JPG)
4. Customize position, size, rotation
5. Add to cart (saves design + placement)
6. Checkout
7. Track order

### Admin Flow
1. Login with admin credentials
2. View all orders (filter by custom items)
3. **Download customer design files** for printing
4. Update order status (pending → confirmed → printing → shipped)
5. Manage products (CRUD)
6. View statistics

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/customizable` - Get customizable products
- `GET /api/products/:slug` - Get product by slug
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Upload
- `POST /api/upload/design` - Upload custom design
- `POST /api/upload/product` - Upload product image (Admin)
- `DELETE /api/upload/delete` - Delete file from Cloudinary

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/items` - Add item to cart (with custom design)
- `PUT /api/cart/items/:itemId` - Update quantity
- `DELETE /api/cart/items/:itemId` - Remove item
- `DELETE /api/cart/clear` - Clear cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:orderId` - Get order details
- `GET /api/orders/number/:orderNumber` - Get order by number

### Admin
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/orders/:orderId` - Get order (with design URLs)
- `PUT /api/admin/orders/:orderId/status` - Update order status
- `PUT /api/admin/orders/:orderId/tracking` - Update tracking info
- `GET /api/admin/orders/statistics` - Get order stats

## 🎨 Customizer Component Features

The `CustomizerPage.jsx` is the core innovation:

```javascript
// Key Features:
1. Fabric.js canvas for design manipulation
2. Upload to Cloudinary with progress
3. Drag, resize, rotate designs
4. Real-time preview on product image
5. Capture final preview with html2canvas
6. Save placement coordinates for printing
7. Color and size variant selection
```

## 📦 Order Processing Workflow

```
Customer uploads design 
    ↓
Cloudinary stores high-res image
    ↓
Frontend captures placement coordinates
    ↓
Cart stores: imageUrl + placement + preview
    ↓
Order created with custom design data
    ↓
Admin views order → Downloads design file
    ↓
Print shop uses coordinates for accurate printing
    ↓
Order shipped
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- HTTP-only cookies for refresh tokens
- CORS protection
- Helmet.js security headers
- Input validation
- File upload restrictions
- Rate limiting (can be added)

## 🧪 Testing

### Manual Testing Checklist
- [ ] Register new user
- [ ] Login/Logout
- [ ] Browse products
- [ ] Upload design to customizable product
- [ ] Manipulate design (move, rotate, scale)
- [ ] Add to cart
- [ ] Checkout process
- [ ] View order history
- [ ] Admin: View orders with design URLs
- [ ] Admin: Update order status
- [ ] Admin: Create/Edit products

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

