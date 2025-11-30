# Script tu dong tao file .env.local

$envFile = ".env.local"
# Backend mặc định chạy trên port 5075 (kiểm tra launchSettings.json)
# Nếu bạn đã thay đổi port, cập nhật giá trị này
$apiUrl = "http://localhost:5075"
$googleClientId = "574740843214-aehdk241ftefav4rghvaee4u4i8pfk1u.apps.googleusercontent.com"

Write-Host "[INFO] Dang tao file .env.local..." -ForegroundColor Cyan
Write-Host ""

$content = @"
# Backend API URL
NEXT_PUBLIC_API_URL=$apiUrl

# Google OAuth Client ID
NEXT_PUBLIC_GOOGLE_CLIENT_ID=$googleClientId
"@

# Tao file
$content | Out-File -FilePath $envFile -Encoding UTF8

if (Test-Path $envFile) {
    Write-Host "[SUCCESS] File .env.local da duoc tao thanh cong!" -ForegroundColor Green
    Write-Host ""
    Write-Host "[CONTENT] Noi dung file:" -ForegroundColor Yellow
    Write-Host $content
    Write-Host ""
    Write-Host "[NEXT] Bay gio ban co the chay:" -ForegroundColor Cyan
    Write-Host "   npm run dev" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "[ERROR] Khong the tao file .env.local" -ForegroundColor Red
}

