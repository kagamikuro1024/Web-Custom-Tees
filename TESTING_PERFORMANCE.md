# 🚀 Quick Start - Testing Performance Optimizations

## Kiểm tra nhanh hiệu quả tối ưu

### 1️⃣ Check Bundle Size (Code Splitting)

```bash
cd frontend
npm run build

# Xem kết quả trong terminal:
# - dist/assets/index-[hash].js ~ 150-200KB (main bundle)
# - dist/assets/HomePage-[hash].js ~ 50KB
# - dist/assets/ProductsPage-[hash].js ~ 80KB
# ... (các chunks riêng biệt)
```

**Kỳ vọng:** Thấy nhiều file JS nhỏ thay vì 1 file lớn

---

### 2️⃣ Test Lazy Loading (Visual)

1. Mở Chrome DevTools → Network tab
2. Chạy `npm run dev` và truy cập http://localhost:5173
3. Refresh page (Ctrl+R)
4. **Kiểm tra:** Chỉ thấy load `index.js` + `HomePage.js`, KHÔNG load các page khác
5. Navigate sang `/products`
6. **Kiểm tra:** Bây giờ mới thấy `ProductsPage.js` được load

**Kỳ vọng:** Mỗi page chỉ load khi được truy cập

---

### 3️⃣ Test Image Optimization (Cloudinary)

1. Mở Network tab → Filter: Img
2. Truy cập trang Products
3. Click vào bất kỳ image request nào
4. **Kiểm tra URL:** Phải có `/upload/w_500,h_500,c_fill,q_auto,f_auto/`
5. **Kiểm tra Size:** Ảnh phải < 300KB (thay vì 2-4MB)

**Kỳ vọng:** Mọi ảnh Cloudinary đều có transformation params

---

### 4️⃣ Test Lazy Loading Images

1. Mở Products page
2. Scroll xuống CHẬM
3. Quan sát Network tab
4. **Kiểm tra:** Ảnh chỉ load khi scroll gần đến (200-300px trước)

**Kỳ vọng:** Không load tất cả ảnh ngay từ đầu

---

### 5️⃣ Test React.memo (Re-render)

1. Install React DevTools extension
2. Mở DevTools → Profiler tab
3. Start Recording
4. Scroll danh sách Products
5. Stop Recording
6. **Kiểm tra:** ProductCard không re-render khi scroll (chỉ render lần đầu)

**Kỳ vọng:** Flame graph thấy ít re-render hơn

---

### 6️⃣ Test Prefetching (Hover)

1. Mở Network tab
2. **HOVER** vào một ProductCard (KHÔNG click)
3. Chờ 1-2 giây
4. **Kiểm tra Network:** Có request prefetch chunk của ProductDetailPage
5. **Click** vào ProductCard
6. **Kỳ vọng:** Page hiện tức thì (vì đã prefetch)

**Kỳ vọng:** Navigation cảm giác "instant"

---

### 7️⃣ Lighthouse Performance Test

```bash
# Option 1: Chrome DevTools
# 1. Mở DevTools → Lighthouse tab
# 2. Chọn "Performance" only
# 3. Click "Analyze page load"

# Option 2: CLI
npx lighthouse http://localhost:5173 --view --only-categories=performance
```

**Target Scores:**
- Performance: 85-95
- FCP: < 1.5s
- LCP: < 2.5s
- TTI: < 3.0s
- CLS: < 0.1

---

## 🔥 So Sánh Trước/Sau (Dự kiến)

### Trước Optimization:
- **Initial JS:** ~2.5MB
- **Images:** 2-4MB mỗi ảnh
- **Load time:** 8-10s
- **FPS khi scroll:** 30-40fps (lag)

### Sau Optimization:
- **Initial JS:** ~650KB (↓74%)
- **Images:** 150-300KB (↓85%)
- **Load time:** 3-4s (↓60%)
- **FPS khi scroll:** 60fps (smooth)

---

## 🛠️ Troubleshooting

### Nếu không thấy code splitting:
```bash
# Xóa node_modules và reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Nếu ảnh không optimize:
- Kiểm tra `primaryImage?.url` có phải Cloudinary URL
- Check console có error không
- Verify `imageOptimization.js` đã import đúng

### Nếu prefetch không hoạt động:
- Check browser console có log `[Prefetch]`
- Verify `usePrefetch` hook đã được sử dụng đúng
- Thử touch event trên mobile

---

## 📱 Test Trên Mobile

1. Enable mobile mode trong Chrome DevTools (Ctrl+Shift+M)
2. Throttle network: "Fast 3G"
3. Throttle CPU: "4x slowdown"
4. Test lại tất cả các bước trên

**Kỳ vọng:** Vẫn load < 5s trên mạng yếu

---

## ✅ Checklist Trước Khi Deploy

- [ ] Bundle size < 1MB (total initial)
- [ ] Lighthouse Performance > 85
- [ ] No console errors
- [ ] Images có `loading="lazy"` attribute
- [ ] Cloudinary URLs có transformations
- [ ] Lazy routing hoạt động (kiểm tra Network)
- [ ] Prefetch hoạt động (hover → instant navigation)
- [ ] Test trên mobile device thật
- [ ] Test trên mạng chậm (3G)

---

**Happy Testing! 🎉**

*Nếu có vấn đề, xem chi tiết tại: [FRONTEND_OPTIMIZATION_REPORT.md](./FRONTEND_OPTIMIZATION_REPORT.md)*
