# Custom T-Shirt E-Commerce Platform

A full-stack MERN (MongoDB, Express, React, Node.js) e-commerce application specialized for **custom t-shirt printing business**. This platform allows customers to upload their own designs, preview them on products in real-time, and place orders with complete customization details for printing.

## 🎯 Unique Features

### Product Customization System
Unlike standard e-commerce platforms, this system includes:

1. **Interactive Design Tool**: Canvas-based customizer using Fabric.js
2. **Real-time Preview**: Customers see their design overlaid on the actual product
3. **Design Placement Control**: Drag, resize, rotate designs within printable areas
4. **Custom Order Processing**: Orders save design URLs and placement coordinates for printing
5. **Admin Design Access**: Admins can download high-quality design files for production

## 📋 Core Technologies

### Backend
- **Node.js** + **Express.js** - RESTful API
- **MongoDB** + **Mongoose** - Database & ODM
- **JWT** - Authentication (Access/Refresh tokens)
- **Cloudinary** - Image storage & CDN
- **Multer** - File upload handling
- **Bcrypt** - Password hashing
- **Winston** - Logging

### Frontend
- **React 18** - UI Framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Router v6** - Routing
- **Fabric.js** - Canvas manipulation
- **html2canvas** - Preview capture
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

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
│   │   │   └── order.service.js     # Critical: Handles custom orders
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
    │   │   └── auth/
    │   │       ├── ProtectedRoute.jsx
    │   │       └── AdminRoute.jsx
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── ProductsPage.jsx
    │   │   ├── ProductDetailPage.jsx
    │   │   ├── CustomizerPage.jsx    # CRITICAL: Design tool
    │   │   ├── CartPage.jsx
    │   │   ├── CheckoutPage.jsx
    │   │   ├── user/
    │   │   │   ├── DashboardPage.jsx
    │   │   │   ├── OrdersPage.jsx
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
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

## 🗄️ Database Schema Highlights

### Product Model
```javascript
{
  name: String,
  slug: String,
  price: Number,
  isCustomizable: Boolean,        // KEY: Enables customization
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
      imageUrl: String,           // High-quality design URL
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
MONGODB_URI=mongodb://localhost:27017/custom_tshirt_db

JWT_ACCESS_SECRET=your_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

FRONTEND_URL=http://localhost:5173
```

4. **Start MongoDB**
```bash
mongod
```

5. **Run backend server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server runs at: `http://localhost:5000`

### Frontend Setup

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

