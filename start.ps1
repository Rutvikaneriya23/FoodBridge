# FoodBridge Quick Start Script

Write-Host "========================================" -ForegroundColor Green
Write-Host "  FoodBridge - Starting Application" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if MongoDB is running
Write-Host "Checking MongoDB status..." -ForegroundColor Yellow
$mongoService = Get-Service -Name MongoDB -ErrorAction SilentlyContinue

if ($mongoService -and $mongoService.Status -eq 'Running') {
    Write-Host "✓ MongoDB is running" -ForegroundColor Green
} else {
    Write-Host "⚠ MongoDB is not running. Attempting to start..." -ForegroundColor Yellow
    try {
        Start-Service -Name MongoDB -ErrorAction Stop
        Write-Host "✓ MongoDB started successfully" -ForegroundColor Green
    } catch {
        Write-Host "✗ Could not start MongoDB automatically" -ForegroundColor Red
        Write-Host "Please start MongoDB manually: net start MongoDB" -ForegroundColor Yellow
        $response = Read-Host "Continue anyway? (y/n)"
        if ($response -ne 'y') {
            exit 1
        }
    }
}

Write-Host ""
Write-Host "Starting FoodBridge application..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Access the application at:" -ForegroundColor Green
Write-Host "  User Portal:  http://localhost:3000" -ForegroundColor White
Write-Host "  Admin Portal: http://localhost:3000/admin/login" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the application" -ForegroundColor Yellow
Write-Host ""

# Start the application
npm run dev:full
