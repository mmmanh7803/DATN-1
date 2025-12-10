# Script fix PATH vinh vien cho dotnet

Write-Host "Dang fix PATH cho .NET SDK..." -ForegroundColor Cyan

$dotnetPath = "C:\Program Files\dotnet"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")

if ($currentPath -notlike "*$dotnetPath*") {
    # Them vao User PATH
    $newPath = "$currentPath;$dotnetPath"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    
    Write-Host "Da them dotnet vao User PATH" -ForegroundColor Green
    Write-Host "Vui long MO LAI TERMINAL de ap dung thay doi!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Hoac chay lenh nay trong terminal hien tai:" -ForegroundColor Cyan
    Write-Host '   $env:Path += ";C:\Program Files\dotnet"' -ForegroundColor White
} else {
    Write-Host "dotnet da co trong PATH roi!" -ForegroundColor Green
    Write-Host "Neu van loi, hay MO LAI TERMINAL" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Kiem tra dotnet:" -ForegroundColor Cyan
$env:Path += ";$dotnetPath"
dotnet --version
