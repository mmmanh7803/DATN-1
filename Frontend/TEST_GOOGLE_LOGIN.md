# 🧪 Hướng dẫn test đăng nhập Google

## ⚡ Quick Test

### 1. Kiểm tra file .env.local
```powershell
# Trong thư mục Frontend
Test-Path .env.local
# Kết quả phải là: True

# Xem nội dung
Get-Content .env.local
```

### 2. Kiểm tra server đang chạy
- Backend: http://localhost:5000/swagger
- Frontend: http://localhost:3000

### 3. Test đăng nhập
1. Mở http://localhost:3000/login
2. Click nút "Đăng nhập với Google"
3. Chọn tài khoản Google
4. Kiểm tra redirect về trang chủ

---

## 🔍 Debug Steps

### Nếu nút Google không hiển thị:

1. **Mở Browser Console (F12)**
   - Kiểm tra có warning về `NEXT_PUBLIC_GOOGLE_CLIENT_ID` không
   - Kiểm tra có lỗi gì không

2. **Kiểm tra Network tab**
   - Xem request đến `/api/auth/google-login` có được gửi không
   - Xem response từ backend

3. **Kiểm tra Backend logs**
   - Xem console output của backend
   - Kiểm tra có exception không

---

## 📋 Test Cases

### ✅ Test Case 1: Đăng nhập thành công
```
Input: Click "Đăng nhập với Google" → Chọn account → Allow
Expected: Redirect về /, User Profile Bar hiển thị
```

### ✅ Test Case 2: User mới
```
Input: Đăng nhập với email chưa có trong database
Expected: Tự động tạo user mới, đăng nhập thành công
```

### ✅ Test Case 3: User đã tồn tại
```
Input: Đăng nhập với email đã có trong database
Expected: Đăng nhập thành công, không tạo user mới
```

### ❌ Test Case 4: Cancel popup
```
Input: Click "Đăng nhập với Google" → Cancel
Expected: Popup đóng, không có lỗi, vẫn ở trang login
```

---

## 🐛 Common Issues

### Issue 1: "Google OAuth components must be used within GoogleOAuthProvider"
**Fix:**
```powershell
# Tạo file .env.local
cd Frontend
@"
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=574740843214-aehdk241ftefav4rghvaee4u4i8pfk1u.apps.googleusercontent.com
"@ | Out-File -FilePath ".env.local" -Encoding UTF8

# Restart server
npm run dev
```

### Issue 2: "Token Google không hợp lệ"
**Fix:**
- Kiểm tra `GoogleAuth:ClientId` trong `appsettings.json`
- Đảm bảo Client ID khớp giữa frontend và backend

### Issue 3: CORS Error
**Fix:**
- Kiểm tra `CorsSettings:AllowedOrigins` trong `appsettings.json`
- Thêm `http://localhost:3000` nếu chưa có

---

## ✅ Success Criteria

Sau khi test, bạn sẽ thấy:
- ✅ Nút Google hiển thị và hoạt động
- ✅ Có thể đăng nhập bằng Google account
- ✅ User Profile Bar hiển thị sau khi đăng nhập
- ✅ Có thể đăng xuất
- ✅ Không có lỗi trong console

