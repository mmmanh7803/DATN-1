# PowerShell script để chạy SQL query và xuất kết quả ra file markdown
# Cần có sqlcmd được cài đặt

$connectionString = "Server=localhost\SQLEXPRESS;Database=HIHSK;Trusted_Connection=True;TrustServerCertificate=True;"
$sqlFile = Join-Path $PSScriptRoot "check_table_data.sql"
$outputFile = Join-Path $PSScriptRoot ".." ".." "BANG_CO_DU_LIEU.md"

Write-Host "Đang kiểm tra dữ liệu trong các bảng..." -ForegroundColor Green

# Tách connection string thành các phần
$server = "localhost\SQLEXPRESS"
$database = "HIHSK"

# Chạy SQL và lưu kết quả vào biến
$query = Get-Content $sqlFile -Raw

# Chạy SQL query và lấy kết quả
$results = sqlcmd -S $server -d $database -E -W -h -1 -Q $query

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Đã kiểm tra thành công!" -ForegroundColor Green
    
    # Tạo file markdown
    $markdown = @"
# 📊 Bảng Có Dữ Liệu Trong Database

*Cập nhật: $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")*

## Tổng Quan

Tài liệu này liệt kê các bảng trong database **HIHSK** đã có dữ liệu, được kiểm tra tự động từ database.

---

## Kết Quả Kiểm Tra

### Bảng Có Dữ Liệu ✅

"@

    # Parse kết quả và thêm vào markdown
    $lines = $results | Where-Object { $_ -match '\|' -and $_ -notmatch '^-' -and $_ -notmatch 'Tên Bảng' }
    
    $hasDataTables = @()
    $noDataTables = @()
    
    foreach ($line in $lines) {
        if ($line -match '\|') {
            $parts = $line -split '\|' | ForEach-Object { $_.Trim() }
            if ($parts.Count -ge 3) {
                $tableName = $parts[0]
                $rowCount = $parts[1]
                $status = $parts[2]
                
                if ($status -match '✅') {
                    $hasDataTables += [PSCustomObject]@{
                        Name = $tableName
                        Count = [int]$rowCount
                    }
                } else {
                    $noDataTables += [PSCustomObject]@{
                        Name = $tableName
                        Count = 0
                    }
                }
            }
        }
    }
    
    # Sắp xếp theo số lượng giảm dần
    $hasDataTables = $hasDataTables | Sort-Object Count -Descending
    
    # Thêm bảng có dữ liệu
    $markdown += "`n`n| Tên Bảng | Số Lượng Dòng |`n|-----------|----------------|`n"
    foreach ($table in $hasDataTables) {
        $markdown += "| $($table.Name) | $($table.Count) |`n"
    }
    
    $markdown += @"

### Bảng Không Có Dữ Liệu ❌

| Tên Bảng |
|----------|
"@
    
    foreach ($table in $noDataTables) {
        $markdown += "| $($table.Name) |`n"
    }
    
    $markdown += @"

---

## Thống Kê

- **Tổng số bảng**: $($hasDataTables.Count + $noDataTables.Count)
- **Bảng có dữ liệu**: $($hasDataTables.Count)
- **Bảng không có dữ liệu**: $($noDataTables.Count)
- **Tổng số dòng**: $($hasDataTables | Measure-Object -Property Count -Sum | Select-Object -ExpandProperty Sum)

---

## Lưu ý

- Dữ liệu được kiểm tra trực tiếp từ database
- Bảng không có dữ liệu có thể chưa được seed hoặc chưa được sử dụng
- Một số bảng như Identity tables (AspNet*) có thể có dữ liệu mặc định
"@
    
    # Ghi vào file
    $markdown | Out-File -FilePath $outputFile -Encoding UTF8
    
    Write-Host "✓ Đã tạo file: $outputFile" -ForegroundColor Green
    Write-Host "  - Bảng có dữ liệu: $($hasDataTables.Count)" -ForegroundColor Cyan
    Write-Host "  - Bảng không có dữ liệu: $($noDataTables.Count)" -ForegroundColor Yellow
} else {
    Write-Host "✗ Có lỗi xảy ra khi kiểm tra dữ liệu" -ForegroundColor Red
}
