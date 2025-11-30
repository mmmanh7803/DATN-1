# Hướng dẫn cấu hình Google Authentication

## Backend Setup

1. Mở file `Backend/src/HiHSK.Api/appsettings.json`
2. Cập nhật giá trị `GoogleAuth:ClientId` và `GoogleAuth:ClientSecret`:

```json
"GoogleAuth": {
  "ClientId": "YOUR_GOOGLE_CLIENT_ID",
  "ClientSecret": "YOUR_GOOGLE_CLIENT_SECRET"
}
```

## Frontend Setup

1. Tạo file `.env.local` trong thư mục `Frontend/`
2. Thêm dòng sau vào file:

```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
```

## Lấy Google OAuth Credentials

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo hoặc chọn một project
3. Vào **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Chọn Application type: **Web application**
6. Cấu hình:
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (Frontend URL)
     - `http://localhost:5000` (Backend URL nếu cần)
   - **Authorized redirect URIs**:
     - `http://localhost:3000`
7. Click **Create**
8. Copy **Client ID** và **Client Secret**
9. Paste vào các file cấu hình như hướng dẫn ở trên

## Production Setup

Khi deploy lên production:
- Thêm domain production vào **Authorized JavaScript origins** và **Authorized redirect URIs**
- Cập nhật environment variables trên server
- Đảm bảo sử dụng HTTPS

## Lưu ý

- **KHÔNG** commit file `.env.local` hoặc `appsettings.json` có chứa credentials thật vào Git
- Credentials này cần được bảo mật cẩn thận

