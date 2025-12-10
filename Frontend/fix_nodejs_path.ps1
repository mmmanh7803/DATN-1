# Script fix PATH cho Node.js (neu da cai nhung chua co trong PATH)

Write-Host "Dang kiem tra Node.js..." -ForegroundColor Cyan

# Cac vi tri thuong gap cua Node.js
$nodePaths = @(
    "C:\Program Files\nodejs",
    "C:\Program Files (x86)\nodejs",
    "$env:LOCALAPPDATA\Programs\nodejs",
    "$env:APPDATA\npm"
)

$foundNodePath = $null
$foundNpmPath = $null

# Tim node.exe
foreach ($path in $nodePaths) {
    $nodeExe = Join-Path $path "node.exe"
    if (Test-Path $nodeExe) {
        $foundNodePath = $path
        Write-Host "Tim thay Node.js tai: $foundNodePath" -ForegroundColor Green
        break
    }
}

# Tim npm (thuong cung thu muc voi node)
if ($foundNodePath) {
    $npmPath = Join-Path $foundNodePath "npm.cmd"
    if (Test-Path $npmPath) {
        $foundNpmPath = $foundNodePath
    }
}

# Tim npm trong AppData
if (-not $foundNpmPath) {
    $npmAppData = "$env:APPDATA\npm"
    if (Test-Path $npmAppData) {
        $foundNpmPath = $npmAppData
    }
}

if ($foundNodePath) {
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    
    if ($currentPath -notlike "*$foundNodePath*") {
        $newPath = "$currentPath;$foundNodePath"
        [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
        Write-Host "Da them Node.js vao User PATH" -ForegroundColor Green
    } else {
        Write-Host "Node.js da co trong PATH roi!" -ForegroundColor Green
    }
    
    if ($foundNpmPath -and $foundNpmPath -ne $foundNodePath) {
        $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
        if ($currentPath -notlike "*$foundNpmPath*") {
            $newPath = "$currentPath;$foundNpmPath"
            [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
            Write-Host "Da them npm vao User PATH" -ForegroundColor Green
        }
    }
    
    Write-Host ""
    Write-Host "Vui long MO LAI TERMINAL de ap dung thay doi!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Hoac chay lenh nay trong terminal hien tai:" -ForegroundColor Cyan
    Write-Host "   `$env:Path += `";$foundNodePath`"" -ForegroundColor White
    
    Write-Host ""
    Write-Host "Kiem tra Node.js:" -ForegroundColor Cyan
    $env:Path += ";$foundNodePath"
    if ($foundNpmPath -and $foundNpmPath -ne $foundNodePath) {
        $env:Path += ";$foundNpmPath"
    }
    
    node --version
    npm --version
} else {
    Write-Host "Khong tim thay Node.js!" -ForegroundColor Red
    Write-Host "Vui long cai dat Node.js truoc:" -ForegroundColor Yellow
    Write-Host "  1. Truy cap: https://nodejs.org/" -ForegroundColor White
    Write-Host "  2. Download va cai dat LTS version" -ForegroundColor White
    Write-Host "  3. Chay lai script nay sau khi cai dat" -ForegroundColor White
    Write-Host ""
    Write-Host "Hoac chay script install_nodejs.ps1 de huong dan chi tiet" -ForegroundColor Cyan
}












