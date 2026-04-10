# FoodBridge Installation & Setup Script

Write-Host "========================================" -ForegroundColor Green
Write-Host "  FoodBridge - No Food Should Go to Waste" -ForegroundColor Green
Write-Host "  Installation Script" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js $nodeVersion is installed" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if MongoDB is installed
Write-Host "Checking MongoDB installation..." -ForegroundColor Yellow
try {
    $mongoVersion = mongod --version 2>$null | Select-String "db version"
    if ($mongoVersion) {
        Write-Host "✓ MongoDB is installed" -ForegroundColor Green
    } else {
        throw "MongoDB not found"
    }
} catch {
    Write-Host "✗ MongoDB is not installed!" -ForegroundColor Red
    Write-Host "Please install MongoDB from https://www.mongodb.com/try/download/community" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Installing Dependencies" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Backend installation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
Write-Host ""

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location client
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Frontend installation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
Set-Location ..
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Make sure MongoDB is running: net start MongoDB" -ForegroundColor White
Write-Host "2. Configure .env file with your settings" -ForegroundColor White
Write-Host "3. Start the application: npm run dev:full" -ForegroundColor White
Write-Host ""
Write-Host "Access the application:" -ForegroundColor Cyan
Write-Host "  User Portal:  http://localhost:3000" -ForegroundColor White
Write-Host "  Admin Portal: http://localhost:3000/admin/login" -ForegroundColor White
Write-Host "  API Server:   http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "Default Admin Credentials:" -ForegroundColor Yellow
Write-Host "  ID:       admin@foodbridge.com" -ForegroundColor White
Write-Host "  Password: Admin@FoodBridge2026" -ForegroundColor White
Write-Host "  ⚠️  CHANGE THESE IMMEDIATELY IN PRODUCTION!" -ForegroundColor Red
Write-Host ""
