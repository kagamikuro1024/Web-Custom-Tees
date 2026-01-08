# 🎨 Hướng Dẫn Áp Dụng Optimization Vào Code Hiện Tại

## ⚡ Cách Sử Dụng ProductCard Đã Optimize

### Option 1: Cập nhật ProductsPage.jsx (Recommended)

Thay thế import cũ trong [ProductsPage.jsx](d:/gitHub/Cong_Nghe_Web/Web_Ao_Custom/frontend/src/pages/ProductsPage.jsx):

```jsx
// ❌ CŨ - Basic version
import ProductCard from '../components/ProductCard';

// ✅ MỚI - Optimized version với prefetching
import ProductCard from '../components/ProductCardAdvanced';
```

**Đó là tất cả!** ProductCardAdvanced là drop-in replacement, không cần thay đổi gì thêm.

---

### Option 2: Sử dụng ProductCard với Image Optimization

Nếu muốn tùy chỉnh thêm, có thể optimize images riêng trong [ProductDetailPage.jsx](d:/gitHub/Cong_Nghe_Web/Web_Ao_Custom/frontend/src/pages/ProductDetailPage.jsx):

```jsx
import { optimizeCloudinaryImage, IMAGE_PRESETS } from '../utils/imageOptimization';

const ProductDetailPage = () => {
  const [product, setProduct] = useState(null);
  
  // Optimize hero image
  const heroImageUrl = useMemo(() => {
    if (!product?.mainImage?.url) return null;
    return optimizeCloudinaryImage(
      product.mainImage.url, 
      IMAGE_PRESETS.DETAIL // 1000x1000
    );
  }, [product?.mainImage?.url]);

  // Optimize thumbnails
  const thumbnails = useMemo(() => {
    if (!product?.images) return [];
    return product.images.map(img => ({
      ...img,
      optimizedUrl: optimizeCloudinaryImage(img.url, IMAGE_PRESETS.THUMBNAIL)
    }));
  }, [product?.images]);

  return (
    <div>
      {/* Hero image với optimization */}
      <img 
        src={heroImageUrl} 
        alt={product.name}
        loading="eager" // Hero image = load ngay
        decoding="async"
      />
      
      {/* Thumbnails với lazy loading */}
      {thumbnails.map(thumb => (
        <img 
          key={thumb._id}
          src={thumb.optimizedUrl}
          loading="lazy" // Thumbnails = load khi cần
          decoding="async"
        />
      ))}
    </div>
  );
};
```

---

## 🚀 Áp Dụng Prefetching Cho Navigation Links

### Example 1: In ShopPage.jsx

```jsx
import { usePrefetch } from '../hooks/usePrefetch';

const ShopPage = () => {
  const prefetchProducts = usePrefetch('/products');
  const prefetchCustomize = usePrefetch('/customize');

  return (
    <div>
      {/* Prefetch khi hover */}
      <Link to="/products" {...prefetchProducts}>
        View All Products
      </Link>
      
      <Link to="/customize" {...prefetchCustomize}>
        Customize Your Shirt
      </Link>
    </div>
  );
};
```

### Example 2: In HomePage.jsx

```jsx
import { usePrefetch } from '../hooks/usePrefetch';

const HomePage = () => {
  return (
    <div>
      {featuredProducts.map(product => {
        const prefetch = usePrefetch(`/products/${product.slug}`);
        
        return (
          <Link 
            key={product._id}
            to={`/products/${product.slug}`} 
            {...prefetch} // Áp dụng prefetch
          >
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
          </Link>
        );
      })}
    </div>
  );
};
```

---

## 🖼️ Image Optimization Best Practices

### ✅ DO - Đúng Cách

```jsx
import { optimizeCloudinaryImage, IMAGE_PRESETS } from '../utils/imageOptimization';

// 1. Hero images (above the fold) - Load ngay
<img 
  src={optimizeCloudinaryImage(url, IMAGE_PRESETS.HERO)}
  loading="eager"
  decoding="async"
/>

// 2. Product cards (below the fold) - Lazy load
<img 
  src={optimizeCloudinaryImage(url, IMAGE_PRESETS.CARD)}
  loading="lazy"
  decoding="async"
/>

// 3. Thumbnails - Lazy load với size nhỏ
<img 
  src={optimizeCloudinaryImage(url, IMAGE_PRESETS.THUMBNAIL)}
  loading="lazy"
  decoding="async"
/>

// 4. Custom size
<img 
  src={optimizeCloudinaryImage(url, { width: 600, height: 400 })}
  loading="lazy"
/>
```

### ❌ DON'T - Sai Cách

```jsx
// ❌ Load ảnh gốc 4MB
<img src={product.image.url} />

// ❌ Load tất cả ảnh ngay (không lazy)
<img src={url} loading="eager" />

// ❌ Không optimize Cloudinary
<img src="https://res.cloudinary.com/.../upload/image.jpg" />
```

---

## 🧠 React.memo & useMemo Best Practices

### ✅ Khi nào dùng React.memo?

**Dùng khi:**
- Component được render nhiều lần (vd: ProductCard trong list)
- Props không thay đổi thường xuyên
- Component nặng (có nhiều calculations hoặc renders phức tạp)

**Example:**
```jsx
// ✅ ProductCard trong list - SHOULD use memo
const ProductCard = React.memo(({ product }) => {
  // ...
});

// ✅ ReviewCard trong list - SHOULD use memo
const ReviewCard = React.memo(({ review }) => {
  // ...
});

// ❌ Page components - NO NEED memo (chỉ render 1 lần)
const HomePage = () => {
  // ...
};
```

### ✅ Khi nào dùng useMemo?

**Dùng khi:**
- Calculation đắt (vd: format currency, filter/sort arrays)
- Object/array được tạo mới (để tránh reference change)
- Dependency hiếm khi thay đổi

**Example:**
```jsx
// ✅ Format currency - expensive
const formattedPrice = useMemo(
  () => new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(price),
  [price]
);

// ✅ Filter/sort large arrays
const filteredProducts = useMemo(
  () => products.filter(p => p.price < maxPrice).sort(...),
  [products, maxPrice]
);

// ❌ Simple calculations - NO NEED
const total = price * quantity; // Don't use useMemo for this!

// ❌ String concatenation - NO NEED
const fullName = `${firstName} ${lastName}`; // Too simple
```

---

## 📦 Lazy Loading Components Example

Nếu có component nặng (như CustomizerPage), đảm bảo đã lazy load:

```jsx
// App.jsx
import { lazy, Suspense } from 'react';
import LoadingFallback from './components/LoadingFallback';

const CustomizerPage = lazy(() => import('./pages/CustomizerPage'));

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/customize/:slug" element={<CustomizerPage />} />
      </Routes>
    </Suspense>
  );
}
```

---

## 🎯 Quick Wins - Áp Dụng Ngay

### 1. ShopPage.jsx
```jsx
// Thay đổi 1 dòng:
- import ProductCard from '../components/ProductCard';
+ import ProductCard from '../components/ProductCardAdvanced';
```

### 2. HomePage.jsx
```jsx
// Thêm prefetch cho featured products
import { usePrefetch } from '../hooks/usePrefetch';

{featuredProducts.map(product => {
  const prefetch = usePrefetch(`/products/${product.slug}`);
  return <ProductCard key={product._id} product={product} {...prefetch} />;
})}
```

### 3. ProductDetailPage.jsx
```jsx
// Optimize all images
import { optimizeCloudinaryImage, IMAGE_PRESETS } from '../utils/imageOptimization';

const heroImage = optimizeCloudinaryImage(product.mainImage.url, IMAGE_PRESETS.DETAIL);
```

---

## 🔥 Performance Checklist

Khi thêm component mới, hãy tự hỏi:

- [ ] Component này render nhiều lần? → Dùng `React.memo`
- [ ] Có calculation đắt không? → Dùng `useMemo`
- [ ] Có callback truyền xuống child? → Dùng `useCallback`
- [ ] Component này nặng không? → Dùng `lazy()`
- [ ] Ảnh có thể optimize? → Dùng `optimizeCloudinaryImage()`
- [ ] Ảnh ở dưới màn hình? → Thêm `loading="lazy"`
- [ ] Link có thể prefetch? → Dùng `usePrefetch()`

---

## 💡 Pro Tips

1. **Lazy loading images:** Dùng `loading="lazy"` cho mọi ảnh TRỪ hero image
2. **Prefetching:** Chỉ prefetch pages quan trọng (detail pages, không prefetch admin)
3. **React.memo:** Không dùng cho mọi component, chỉ dùng khi cần
4. **Image presets:** Dùng preset thay vì tự define width/height mỗi lần
5. **Bundle analysis:** Run `npm run build` thường xuyên để check bundle size

---

## 🧪 Test Your Changes

Sau khi áp dụng:

```bash
# 1. Test locally
npm run dev

# 2. Check Network tab
# - Images should be < 300KB
# - JS chunks should be separate files

# 3. Test prefetch
# - Hover on ProductCard
# - Check Network for prefetch requests

# 4. Build & analyze
npm run build
# Check dist/ folder for chunk sizes
```

---

**Có câu hỏi? Check [FRONTEND_OPTIMIZATION_REPORT.md](./FRONTEND_OPTIMIZATION_REPORT.md) để biết thêm chi tiết!**
