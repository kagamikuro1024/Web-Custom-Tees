# 🎨 Frontend - Custom T-Shirt E-commerce

## 📦 Tech Stack
- **React 18** - UI Framework
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first CSS
- **React Router v6** - Client-side routing
- **Zustand** - State management
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **React Icons** - Icon library

---

## 🚀 Quick Start

### Installation
```bash
cd frontend
npm install
```

### Development
```bash
npm run dev
```
Frontend runs at: `http://localhost:5173`

### Build for Production
```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.jsx           # Main layout wrapper
│   │   │   ├── Header.jsx           # Navigation header
│   │   │   └── Footer.jsx           # Footer
│   │   └── auth/
│   │       ├── ProtectedRoute.jsx   # Auth guard
│   │       └── AdminRoute.jsx       # Admin guard
│   │
│   ├── pages/
│   │   ├── HomePage.jsx             # Landing page
│   │   ├── ProductsPage.jsx         # ✅ Product listing with filters
│   │   ├── ProductDetailPage.jsx   # ⭐ Custom design feature
│   │   ├── CustomizerPage.jsx       # Advanced customizer
│   │   ├── CartPage.jsx             # Shopping cart
│   │   ├── CheckoutPage.jsx         # Checkout process
│   │   ├── LoginPage.jsx            # Login form
│   │   ├── RegisterPage.jsx         # Registration form
│   │   ├── user/
│   │   │   ├── DashboardPage.jsx    # User dashboard
│   │   │   ├── OrdersPage.jsx       # Order history
│   │   │   └── ProfilePage.jsx      # User profile
│   │   └── admin/
│   │       ├── AdminDashboard.jsx   # Admin overview
│   │       ├── AdminOrders.jsx      # Order management
│   │       └── AdminProducts.jsx    # Product CRUD
│   │
│   ├── stores/
│   │   ├── useAuthStore.js          # Auth state (Zustand)
│   │   └── useCartStore.js          # Cart state (Zustand)
│   │
│   ├── utils/
│   │   └── api.js                   # Axios instance
│   │
│   ├── App.jsx                      # Route configuration
│   ├── main.jsx                     # Entry point
│   └── index.css                    # Global styles
│
├── public/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 🎯 Key Features Implemented

### ✅ Product Detail Page (ProductDetailPage.jsx)
**CRITICAL FEATURE - Custom Design Upload & Preview**

Features:
- ✅ Product information display
- ✅ Image gallery with thumbnails
- ✅ Color & size selection
- ✅ **Upload custom design** (PNG/JPG, max 10MB)
- ✅ **Real-time design preview** on product
- ✅ **Drag & drop positioning**
- ✅ Size adjustment slider
- ✅ Add to cart with custom design data

**How it works:**
```javascript
// 1. User uploads design
<input type="file" onChange={handleFileSelect} />

// 2. Preview with FileReader
const reader = new FileReader();
reader.onloadend = () => setDesignPreview(reader.result);
reader.readAsDataURL(file);

// 3. Upload to Cloudinary
const formData = new FormData();
formData.append('design', designFile);
const { data } = await api.post('/upload/design', formData);

// 4. Position design on product
<div style={{
  position: 'absolute',
  left: `${designPosition.x}%`,
  top: `${designPosition.y}%`,
  width: `${designSize}px`
}}>
  <img src={designPreview} />
</div>

// 5. Add to cart with placement data
cartItem.customDesign = {
  imageUrl: uploadedDesignUrl,
  publicId: uploadedPublicId,
  placement: {
    location: 'front',
    x: designPosition.x,
    y: designPosition.y,
    width: designSize,
    height: designSize
  },
  previewUrl: designPreview
};
```

### ✅ Products Page (ProductsPage.jsx)
Features:
- ✅ Product grid with cards
- ✅ Filter by customizable
- ✅ Search functionality
- ✅ Price range filter
- ✅ Sort options (newest, price, rating, best selling)
- ✅ Pagination
- ✅ Product badges (customizable, featured, sale)
- ✅ Responsive design

### ✅ Home Page (HomePage.jsx)
Features:
- ✅ Hero section
- ✅ Featured products
- ✅ Customizable products showcase
- ✅ CTA buttons

---

## 🔐 Authentication Flow

### Login
```javascript
// useAuthStore.js
const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  
  set({ 
    user: data.user,
    isAuthenticated: true 
  });
  
  localStorage.setItem('accessToken', data.accessToken);
};
```

### Protected Routes
```javascript
// ProtectedRoute.jsx
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};
```

---

## 🛒 Cart Management

### Add to Cart (with Custom Design)
```javascript
// useCartStore.js
const addToCart = async (cartItem) => {
  const { data } = await api.post('/cart/add', cartItem);
  
  set({ cart: data.cart });
  toast.success('Added to cart!');
};

// CartItem structure
{
  productId: "64abc...",
  quantity: 1,
  selectedSize: "M",
  selectedColor: { name: "White", hexCode: "#FFFFFF" },
  customDesign: {                    // Only for customizable products
    imageUrl: "https://...",
    publicId: "custom-tshirt/designs/...",
    placement: {
      location: "front",
      x: 50,
      y: 50,
      width: 150,
      height: 150
    },
    previewUrl: "data:image/png;base64,..."
  }
}
```

---

## 🎨 Custom Design Workflow

### Complete Flow
```
1. User browses products
   ↓
2. Clicks customizable product
   ↓
3. Sees ProductDetailPage with "🎨 Customize Your Design"
   ↓
4. Uploads design file
   ↓
5. FileReader creates instant preview
   ↓
6. Clicks "Upload Design"
   ↓
7. POST /api/upload/design → Cloudinary
   ↓
8. Design overlaid on product image
   ↓
9. Drags design to desired position
   ↓
10. Adjusts size with slider
   ↓
11. Selects size & color
   ↓
12. Clicks "Add to Cart"
   ↓
13. POST /api/cart/add with customDesign object
   ↓
14. Cart updated with custom item ✅
```

---

## 🔌 API Integration

### Axios Setup (utils/api.js)
```javascript
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true
});

// Auto-attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try refresh token
      const { data } = await axios.post('/auth/refresh-token');
      localStorage.setItem('accessToken', data.data.accessToken);
      
      // Retry original request
      return api(error.config);
    }
    return Promise.reject(error);
  }
);
```

### Key API Calls

#### Get Products
```javascript
// Get all products with filters
const { data } = await api.get('/products', {
  params: {
    isCustomizable: true,
    page: 1,
    limit: 12,
    minPrice: 100000,
    maxPrice: 500000,
    search: 'shirt'
  }
});

// Get customizable products
const { data } = await api.get('/products/customizable?limit=12');

// Get single product
const { data } = await api.get(`/products/${slug}`);
```

#### Upload Design
```javascript
const formData = new FormData();
formData.append('design', file);

const { data } = await api.post('/upload/design', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// Response: { url, publicId, width, height }
```

#### Cart Operations
```javascript
// Get cart
const { data } = await api.get('/cart');

// Add to cart
const { data } = await api.post('/cart/add', cartItem);

// Update quantity
const { data } = await api.put(`/cart/item/${itemId}`, { quantity: 2 });

// Remove item
await api.delete(`/cart/item/${itemId}`);
```

---

## 🎨 Styling with Tailwind CSS

### Custom Utilities (index.css)
```css
.container-custom {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

.btn-primary {
  @apply bg-primary text-white px-6 py-3 rounded-lg font-semibold
         hover:bg-primary-dark transition duration-200
         disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold
         hover:bg-gray-300 transition duration-200;
}

.input-field {
  @apply w-full px-4 py-2 border border-gray-300 rounded-lg
         focus:outline-none focus:ring-2 focus:ring-primary;
}

.card {
  @apply bg-white rounded-lg shadow-md overflow-hidden
         hover:shadow-xl transition duration-300;
}
```

### Tailwind Config
```javascript
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6',
          dark: '#2563EB',
          light: '#60A5FA'
        }
      }
    }
  }
};
```

---

## 📊 State Management (Zustand)

### Auth Store
```javascript
// stores/useAuthStore.js
const useAuthStore = create(persist(
  (set) => ({
    user: null,
    isAuthenticated: false,
    
    login: async (email, password) => {
      const { data } = await api.post('/auth/login', { email, password });
      set({ user: data.user, isAuthenticated: true });
      localStorage.setItem('accessToken', data.accessToken);
    },
    
    logout: async () => {
      await api.post('/auth/logout');
      set({ user: null, isAuthenticated: false });
      localStorage.removeItem('accessToken');
    },
    
    getCurrentUser: async () => {
      const { data } = await api.get('/auth/me');
      set({ user: data.user, isAuthenticated: true });
    }
  }),
  { name: 'auth-storage' }
));
```

### Cart Store
```javascript
// stores/useCartStore.js
const useCartStore = create((set) => ({
  cart: null,
  
  fetchCart: async () => {
    const { data } = await api.get('/cart');
    set({ cart: data.cart });
  },
  
  addToCart: async (cartItem) => {
    const { data } = await api.post('/cart/add', cartItem);
    set({ cart: data.cart });
    toast.success('Added to cart!');
  },
  
  removeCartItem: async (itemId) => {
    const { data } = await api.delete(`/cart/item/${itemId}`);
    set({ cart: data.cart });
  }
}));
```

---

## 🧪 Testing Workflow

### Manual Testing

1. **Product Browse**
   ```
   → Go to /products
   → Apply filters (customizable only)
   → Search for "shirt"
   → Sort by price
   → Click pagination
   ```

2. **Custom Design Upload**
   ```
   → Click customizable product
   → Click "Choose Design File"
   → Select PNG/JPG image
   → Click "Upload Design"
   → Wait for success message
   → See design on product
   ```

3. **Design Positioning**
   ```
   → Drag design to center of shirt
   → Adjust size slider
   → Verify position updates in real-time
   ```

4. **Add to Cart**
   ```
   → Select size: M
   → Select color: White
   → Click "Add to Cart"
   → Verify success toast
   → Check cart badge count
   ```

---

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

Output: `dist/` folder

### Preview Production Build
```bash
npm run preview
```

### Deploy to Vercel/Netlify
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or with Netlify
netlify deploy --prod --dir=dist
```

### Environment Variables
Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

Production:
```env
VITE_API_URL=https://your-backend-api.com/api
```

---

## 📝 Important Notes

### Custom Design Feature
- ✅ Only works for products with `isCustomizable: true`
- ✅ Design upload requires authentication
- ✅ Max file size: 10MB
- ✅ Supported formats: PNG, JPG, JPEG, WEBP
- ✅ Design URL stored in Cloudinary
- ✅ Placement coordinates saved to cart/order

### Performance
- Images lazy-loaded
- API calls optimized
- Route-based code splitting
- Tailwind CSS purged in production

### Security
- JWT tokens in localStorage
- Auto-refresh on 401
- CSRF protection with cookies
- Input validation on all forms

---

## 🐛 Common Issues

### "Cannot read property 'url' of undefined"
**Fix:** Check if product.images exists before accessing
```javascript
const image = product.images?.[0]?.url || '/placeholder.jpg';
```

### Design not uploading
**Fix:** 
1. Check file size < 10MB
2. Verify file type is image
3. Check if user is authenticated
4. Verify backend Cloudinary config

### Drag not working
**Fix:**
1. Ensure `canvasRef.current` exists
2. Check if `designPreview` is set
3. Verify mouse event listeners attached

---

## 📚 Documentation

- [Product Detail Guide](../PRODUCT_DETAIL_GUIDE.md)
- [API Documentation](../API_DOCUMENTATION.md)
- [Testing Guide](../TESTING_GUIDE.md)

---

**Status:** ✅ Core Features Complete  
**Next:** Cart Page, Checkout Flow, Admin Dashboard
