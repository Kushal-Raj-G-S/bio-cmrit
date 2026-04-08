# GrainTrust Community Hub Setup Script
# This script sets up the complete backend infrastructure

Write-Host "🌱 GrainTrust Community Hub Setup" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

function Write-Step {
    param($Message)
    Write-Host "📌 $Message" -ForegroundColor Blue
}

function Write-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error-Custom {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Success "Node.js $nodeVersion detected"
} catch {
    Write-Error-Custom "Node.js is not installed. Please install Node.js 18+ first."
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Cyan
    exit 1
}

# Navigate to backend directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $scriptPath "backend"

if (-not (Test-Path $backendPath)) {
    Write-Error-Custom "Backend directory not found: $backendPath"
    exit 1
}

Set-Location $backendPath

Write-Step "Installing backend dependencies..."
try {
    npm install
    Write-Success "Dependencies installed successfully"
} catch {
    Write-Error-Custom "Failed to install dependencies"
    exit 1
}

# Check environment file
if (-not (Test-Path ".env")) {
    Write-Error-Custom ".env file not found"
    Write-Host "Please ensure your .env file exists with database configuration" -ForegroundColor Yellow
    exit 1
}

Write-Step "Generating Prisma client..."
try {
    npx prisma generate
    Write-Success "Prisma client generated"
} catch {
    Write-Error-Custom "Failed to generate Prisma client"
    exit 1
}

Write-Step "Setting up database schema..."
try {
    npx prisma db push
    Write-Success "Database schema created"
} catch {
    Write-Error-Custom "Failed to setup database schema"
    Write-Warning "Make sure PostgreSQL is running and credentials are correct"
    exit 1
}

Write-Step "Seeding database with sample data..."
try {
    npm run seed
    Write-Success "Database seeded with test data"
} catch {
    Write-Error-Custom "Failed to seed database"
    exit 1
}

Write-Success "Backend setup completed successfully!"
Write-Host ""
Write-Host "🎉 Community Hub is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Test Accounts:" -ForegroundColor Cyan
Write-Host "  Expert: expert@farmer.com / expert123" -ForegroundColor Yellow
Write-Host "  Moderator: moderator@farmer.com / moderator123" -ForegroundColor Yellow
Write-Host "  Tech User: tech@farmer.com / tech123" -ForegroundColor Yellow
Write-Host "  Beginner: beginner@farmer.com / beginner123" -ForegroundColor Yellow
Write-Host ""

Write-Warning "Starting backend server on port 3001..."
Write-Warning "Press Ctrl+C to stop the server"
Write-Host ""

# Start server in development mode
try {
    npm run dev
} catch {
    Write-Error-Custom "Failed to start server"
    Write-Host "Check the error messages above for troubleshooting" -ForegroundColor Yellow
    exit 1
}
