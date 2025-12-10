# Script to install Node.js and verify installation
Write-Host "Installing Node.js LTS..." -ForegroundColor Green

# Try to install using winget
$installResult = winget install --id OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "Installation completed. Refreshing PATH..." -ForegroundColor Green
    
    # Refresh PATH
    $env:PATH = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    # Wait a moment for PATH to update
    Start-Sleep -Seconds 2
    
    # Check if Node.js is now available
    $nodePath = Get-Command node -ErrorAction SilentlyContinue
    $npmPath = Get-Command npm -ErrorAction SilentlyContinue
    
    if ($nodePath) {
        Write-Host "`nNode.js installed successfully!" -ForegroundColor Green
        Write-Host "Node version: $(node --version)" -ForegroundColor Cyan
        Write-Host "NPM version: $(npm --version)" -ForegroundColor Cyan
        Write-Host "`nYou may need to restart your PowerShell terminal for PATH changes to take full effect." -ForegroundColor Yellow
    } else {
        Write-Host "`nNode.js installation may require a terminal restart." -ForegroundColor Yellow
        Write-Host "Please close and reopen your PowerShell terminal, then run:" -ForegroundColor Yellow
        Write-Host "  node --version" -ForegroundColor Cyan
        Write-Host "  npm --version" -ForegroundColor Cyan
    }
} else {
    Write-Host "Installation failed. Please install Node.js manually:" -ForegroundColor Red
    Write-Host "1. Visit: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "2. Download the LTS version" -ForegroundColor Yellow
    Write-Host "3. Run the installer" -ForegroundColor Yellow
    Write-Host "4. Restart your terminal" -ForegroundColor Yellow
}

