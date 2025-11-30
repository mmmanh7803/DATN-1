# Script PowerShell để chạy seed WordExamples
# Cần cấu hình connection string trong appsettings.json

$connectionString = "Server=localhost;Database=HiHSK;Trusted_Connection=True;TrustServerCertificate=True;"
$sqlFile = Join-Path $PSScriptRoot "seed_word_examples_hsk1_topic1.sql"

Write-Host "Đang chạy script SQL để seed WordExamples..." -ForegroundColor Green

# Đọc file SQL
$sqlContent = Get-Content $sqlFile -Raw

# Chạy SQL bằng sqlcmd
sqlcmd -S localhost -d HiHSK -E -Q $sqlContent

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Đã seed thành công các ví dụ vào bảng WordExamples!" -ForegroundColor Green
} else {
    Write-Host "✗ Có lỗi xảy ra khi seed dữ liệu" -ForegroundColor Red
}

