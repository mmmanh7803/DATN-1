# Script huong dan cai dat Node.js

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CAI DAT NODE.JS CHO FRONTEND" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Node.js chua duoc cai dat!" -ForegroundColor Yellow
Write-Host ""

Write-Host "CACH 1: Cai dat tu trang chinh thuc (KHUYEN DUNG)" -ForegroundColor Green
Write-Host "  1. Truy cap: https://nodejs.org/" -ForegroundColor White
Write-Host "  2. Download LTS version (Long Term Support)" -ForegroundColor White
Write-Host "  3. Chay installer (.msi)" -ForegroundColor White
Write-Host "  4. Chon 'Add to PATH' khi cai dat" -ForegroundColor White
Write-Host "  5. Mo lai terminal sau khi cai xong" -ForegroundColor White
Write-Host ""

Write-Host "CACH 2: Cai dat bang winget (Windows Package Manager)" -ForegroundColor Green
Write-Host "  Chay lenh sau:" -ForegroundColor White
Write-Host "  winget install OpenJS.NodeJS.LTS" -ForegroundColor Cyan
Write-Host ""

Write-Host "CACH 3: Cai dat bang Chocolatey (neu co)" -ForegroundColor Green
Write-Host "  choco install nodejs-lts" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SAU KHI CAI DAT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "1. MO LAI TERMINAL" -ForegroundColor Yellow
Write-Host "2. Kiem tra:" -ForegroundColor White
Write-Host "   node --version" -ForegroundColor Cyan
Write-Host "   npm --version" -ForegroundColor Cyan
Write-Host "3. Chay Frontend:" -ForegroundColor White
Write-Host "   cd Frontend" -ForegroundColor Cyan
Write-Host "   npm install" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""

# Thu cai dat bang winget neu co
Write-Host "Thu cai dat bang winget..." -ForegroundColor Cyan
$wingetCheck = Get-Command winget -ErrorAction SilentlyContinue
if ($wingetCheck) {
    Write-Host "Tim thay winget! Ban co muon cai dat Node.js ngay bay gio? (Y/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq "Y" -or $response -eq "y") {
        Write-Host "Dang cai dat Node.js LTS..." -ForegroundColor Cyan
        winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
        Write-Host ""
        Write-Host "Da cai dat xong! Vui long MO LAI TERMINAL va chay:" -ForegroundColor Green
        Write-Host "  node --version" -ForegroundColor Cyan
        Write-Host "  npm --version" -ForegroundColor Cyan
    }
} else {
    Write-Host "Khong tim thay winget. Vui long cai dat Node.js theo CACH 1." -ForegroundColor Yellow
}












