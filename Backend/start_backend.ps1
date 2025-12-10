# Script khởi động Backend với PATH fix tự động

# Thêm dotnet vào PATH nếu chưa có
if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
    $dotnetPath = "C:\Program Files\dotnet"
    if (Test-Path "$dotnetPath\dotnet.exe") {
        $env:Path += ";$dotnetPath"
        Write-Host "✅ Đã thêm dotnet vào PATH" -ForegroundColor Green
    } else {
        Write-Host "❌ Không tìm thấy dotnet. Vui lòng cài đặt .NET SDK 8.0" -ForegroundColor Red
        exit 1
    }
}

# Kiểm tra version
Write-Host "🔍 .NET Version: $(dotnet --version)" -ForegroundColor Cyan

# Di chuyển vào thư mục Backend
$backendPath = Join-Path $PSScriptRoot "src\HiHSK.Api"
if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Không tìm thấy thư mục Backend: $backendPath" -ForegroundColor Red
    exit 1
}

Set-Location $backendPath
Write-Host "📂 Đã chuyển vào: $backendPath" -ForegroundColor Cyan

# Restore packages
Write-Host "`n📦 Đang restore packages..." -ForegroundColor Yellow
dotnet restore
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Restore packages thất bại" -ForegroundColor Red
    exit 1
}

# Build project
Write-Host "`n🔨 Đang build project..." -ForegroundColor Yellow
dotnet build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build thất bại" -ForegroundColor Red
    exit 1
}

# Run Backend
Write-Host "`n🚀 Đang khởi động Backend..." -ForegroundColor Green
Write-Host "📍 URL: http://localhost:5075" -ForegroundColor Cyan
Write-Host "`n⚠️  Nhấn Ctrl+C để dừng Backend`n" -ForegroundColor Yellow

dotnet run

