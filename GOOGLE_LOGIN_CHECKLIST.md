# ✅ Checklist kiểm tra chức năng đăng nhập Google

## 🔧 Bước 1: Cấu hình Environment Variables

### Frontend (.env.local)
- [ ] File `.env.local` đã được tạo trong thư mục `Frontend/`
- [ ] Có dòng: `NEXT_PUBLIC_GOOGLE_CLIENT_ID=574740843214-aehdk241ftefav4rghvaee4u4i8pfk1u.apps.googleusercontent.com`
- [ ] Có dòng: `NEXT_PUBLIC_API_URL=http://localhost:5000`

**Cách tạo nhanh:**
```powershell
cd Frontend
@"
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=574740843214-aehdk241ftefav4rghvaee4u4i8pfk1u.apps.googleusercontent.com
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
```

### Backend (appsettings.json)
- [ ] File `Backend/src/HiHSK.Api/appsettings.json` có section `GoogleAuth`
- [ ] `ClientId` có format: `xxxxx-xxxxx.apps.googleusercontent.com`
- [ ] `ClientSecret` đã được cấu hình (nếu cần)

**Ví dụ:**
```json
"GoogleAuth": {
  "ClientId": "574740843214-aehdk241ftefav4rghvaee4u4i8pfk1u.apps.googleusercontent.com",
  "ClientSecret": "GOCSPX-xxxxxxxxxxxx"
}
```

---

## 🚀 Bước 2: Khởi động ứng dụng

### Backend
- [ ] Chạy: `cd Backend/src/HiHSK.Api && dotnet run`
- [ ] Backend chạy thành công trên port 5000
- [ ] Không có lỗi compile
- [ ] Swagger có thể truy cập: http://localhost:5000/swagger

### Frontend
- [ ] **Đã restart server** sau khi tạo `.env.local`
- [ ] Chạy: `cd Frontend && npm run dev`
- [ ] Frontend chạy thành công trên port 3000
- [ ] Không có lỗi trong console

---

## 🧪 Bước 3: Kiểm tra UI

### Trang đăng nhập (/login)
- [ ] Trang load thành công
- [ ] Có nút "Đăng nhập với Google" hiển thị
- [ ] Nút Google có icon Google đầy đủ
- [ ] Không có lỗi trong browser console (F12)
- [ ] Không có warning về `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

### Trang đăng ký (/register)
- [ ] Trang load thành công
- [ ] Có nút "Đăng ký với Google" hiển thị
- [ ] Nút Google hoạt động bình thường

---

## 🔐 Bước 4: Kiểm tra chức năng đăng nhập

### Test Case 1: Đăng nhập Google lần đầu (tạo tài khoản mới)
1. [ ] Click nút "Đăng nhập với Google"
2. [ ] Popup Google OAuth hiển thị
3. [ ] Chọn tài khoản Google
4. [ ] Cho phép quyền truy cập
5. [ ] Popup đóng tự động
6. [ ] Redirect về trang chủ (/)
7. [ ] User Profile Bar hiển thị ở header
8. [ ] Avatar hiển thị initial từ email
9. [ ] Kiểm tra trong database: User mới đã được tạo với email từ Google

### Test Case 2: Đăng nhập Google lần sau (user đã tồn tại)
1. [ ] Đăng xuất (nếu đang đăng nhập)
2. [ ] Click nút "Đăng nhập với Google"
3. [ ] Chọn cùng tài khoản Google
4. [ ] Đăng nhập thành công
5. [ ] Redirect về trang chủ
6. [ ] User Profile Bar hiển thị đúng

### Test Case 3: Xử lý lỗi
1. [ ] Test với Google Client ID sai → Hiển thị lỗi phù hợp
2. [ ] Test với token hết hạn → Hiển thị lỗi phù hợp
3. [ ] Test cancel popup → Không có lỗi crash

---

## 🔍 Bước 5: Kiểm tra Backend API

### Test endpoint `/api/auth/google-login`
1. [ ] Mở Swagger: http://localhost:5000/swagger
2. [ ] Tìm endpoint `POST /api/auth/google-login`
3. [ ] Test với ID token hợp lệ từ Google
4. [ ] Response trả về:
   - `token`: JWT token
   - `expiration`: Thời gian hết hạn
   - `user`: Thông tin user (id, email, userName)

### Kiểm tra logs
- [ ] Backend console hiển thị log khi tạo user mới
- [ ] Không có exception trong backend logs

---

## 🐛 Troubleshooting

### Lỗi: "Google OAuth components must be used within GoogleOAuthProvider"
**Giải pháp:**
- [ ] Đảm bảo file `.env.local` đã được tạo
- [ ] Restart frontend server
- [ ] Kiểm tra `ClientProviders` đã được wrap trong `layout.tsx`

### Lỗi: "Token Google không hợp lệ"
**Giải pháp:**
- [ ] Kiểm tra `GoogleAuth:ClientId` trong `appsettings.json` đúng format
- [ ] Đảm bảo Client ID trong backend khớp với frontend
- [ ] Kiểm tra Google Console: Client ID đã được cấu hình đúng

### Lỗi: CORS
**Giải pháp:**
- [ ] Kiểm tra `CorsSettings:AllowedOrigins` trong `appsettings.json`
- [ ] Đảm bảo `http://localhost:3000` có trong danh sách

### Nút Google không hiển thị
**Giải pháp:**
- [ ] Kiểm tra browser console có lỗi gì không
- [ ] Kiểm tra `NEXT_PUBLIC_GOOGLE_CLIENT_ID` trong `.env.local`
- [ ] Đảm bảo đã restart server sau khi tạo `.env.local`

---

## ✅ Kết quả mong đợi

Sau khi hoàn thành tất cả các bước trên:
- ✅ Có thể đăng nhập bằng Google
- ✅ Tự động tạo user mới nếu chưa có
- ✅ Lưu JWT token vào cookie
- ✅ User Profile Bar hiển thị đúng
- ✅ Có thể đăng xuất
- ✅ Không có lỗi trong console

---

## 📝 Notes

- **Client ID** có thể public (dùng trong frontend)
- **Client Secret** phải giữ bí mật (chỉ dùng trong backend nếu cần)
- File `.env.local` không được commit lên Git
- Luôn restart server sau khi thay đổi environment variables

