# 🧹 Hướng Dẫn Clear LocalStorage để Fix Lỗi QuotaExceededError

## ❌ Lỗi Hiện Tại
```
QuotaExceededError: Failed to execute 'setItem' on 'Storage': Setting the value of 'cart-storage' exceeded the quota.
```

## ✅ Giải Pháp Đã Thực Hiện
- Đã loại bỏ `persist` từ Zustand cart store
- Cart giờ chỉ lưu trên backend (MongoDB), không còn lưu localStorage nữa
- Tránh lỗi quota khi custom design có ảnh lớn

## 🔧 Clear LocalStorage (Chọn 1 trong 3 cách)

### **Cách 1: Clear Toàn Bộ localStorage (Khuyến nghị)**
1. Mở trang web: `http://localhost:5173`
2. Nhấn `F12` để mở DevTools
3. Vào tab **Console**
4. Chạy lệnh:
```javascript
localStorage.clear();
location.reload();
```

### **Cách 2: Clear Chỉ cart-storage**
1. Mở DevTools (`F12`)
2. Vào tab **Console**
3. Chạy lệnh:
```javascript
localStorage.removeItem('cart-storage');
location.reload();
```

### **Cách 3: Clear Qua Application Tab**
1. Mở DevTools (`F12`)
2. Vào tab **Application**
3. Trong menu bên trái, chọn **Local Storage** → `http://localhost:5173`
4. Click phải → **Clear**
5. Reload trang (`Ctrl + R`)

## 📝 Test Sau Khi Clear

1. ✅ Reload trang, không có lỗi console
2. ✅ Add sản phẩm vào giỏ → Thành công
3. ✅ Customize sản phẩm với ảnh → Thành công
4. ✅ Proceed to Checkout → Button hoạt động bình thường

## 💡 Tại Sao Lỗi Này Xảy Ra?

- Custom design có **ảnh base64 rất lớn** (6-7MB)
- localStorage limit: **5-10MB**
- Cart cũ persist toàn bộ data → Vượt quota
- **Giải pháp**: Cart giờ chỉ lưu trên backend MongoDB, localStorage cũ cần clear

## 🚀 Cải Thiện Đã Thực Hiện

- ✅ Loại bỏ Zustand `persist` middleware
- ✅ Cart auto-fetch từ backend mỗi lần load
- ✅ Không còn quota error với custom design lớn
- ✅ Performance tốt hơn (không serialize/deserialize localStorage mỗi lần update)
