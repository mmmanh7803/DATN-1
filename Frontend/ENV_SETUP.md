# ⚙️ Cấu hình Environment Variables

## Bước 1: Tạo file .env.local

Trong thư mục `Frontend/`, tạo file `.env.local` với nội dung sau:

```env
# Backend API URL (mặc định cho development)
NEXT_PUBLIC_API_URL=http://localhost:5000

# Google OAuth Client ID
# Lấy từ https://console.cloud.google.com/
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

## Bước 2: Lấy Google Client ID

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo hoặc chọn một project
3. Vào **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Chọn Application type: **Web application**
6. Cấu hình:
   - **Name**: HiHSK Web Client
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000`
   - **Authorized redirect URIs**:
     - `http://localhost:3000`
7. Click **Create**
8. Copy **Client ID** (dạng: `xxxxx.apps.googleusercontent.com`)
9. Paste vào file `.env.local` ở dòng `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

## Bước 3: Khởi động lại server

```bash
# Stop server nếu đang chạy (Ctrl+C)
# Chạy lại
npm run dev
```

## Ví dụ file .env.local

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abcdefg123456.apps.googleusercontent.com
```

## Lưu ý ⚠️

- File `.env.local` đã được thêm vào `.gitignore` - **KHÔNG** commit file này
- Mỗi môi trường (dev, staging, production) cần file riêng
- Client ID có thể public nhưng Client Secret phải giữ bí mật

## Kiểm tra cấu hình

Mở console trong browser (F12), bạn sẽ thấy:
- ✅ Nếu cấu hình đúng: Nút Google hiển thị bình thường
- ❌ Nếu chưa cấu hình: Cảnh báo trong console về NEXT_PUBLIC_GOOGLE_CLIENT_ID

