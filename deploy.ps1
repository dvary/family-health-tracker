# Family Health Tracker Deployment Script for Windows
Write-Host "🚀 Starting Family Health Tracker Deployment..." -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

# Check if Docker Compose is available
try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not available. Please install Docker Compose and try again." -ForegroundColor Red
    exit 1
}

# Function to check if port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue
        if ($connection.TcpTestSucceeded) {
            Write-Host "⚠️  Port $Port is already in use. Please stop the service using port $Port and try again." -ForegroundColor Yellow
            return $false
        }
    } catch {
        # Port is not in use
    }
    return $true
}

# Check if required ports are available
Write-Host "🔍 Checking port availability..." -ForegroundColor Cyan
if (-not (Test-Port 3000)) { exit 1 }
if (-not (Test-Port 5000)) { exit 1 }
if (-not (Test-Port 5432)) { exit 1 }

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Cyan
    @"
# Database Configuration
POSTGRES_PASSWORD=password123

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=10485760

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Frontend API URL
REACT_APP_API_URL=http://localhost:5000/api
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ .env file created. Please review and update the values for production." -ForegroundColor Green
}

# Create uploads directory if it doesn't exist
if (-not (Test-Path "uploads")) {
    New-Item -ItemType Directory -Path "uploads" | Out-Null
    Write-Host "✅ Created uploads directory" -ForegroundColor Green
}

# Stop any existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Cyan
docker-compose down

# Build and start services
Write-Host "🔨 Building and starting services..." -ForegroundColor Cyan
docker-compose up -d --build

# Wait for services to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Cyan
Start-Sleep -Seconds 30

# Check service health
Write-Host "🏥 Checking service health..." -ForegroundColor Cyan

# Check PostgreSQL
try {
    docker-compose exec -T postgres pg_isready -U postgres | Out-Null
    Write-Host "✅ PostgreSQL is ready" -ForegroundColor Green
} catch {
    Write-Host "❌ PostgreSQL is not ready" -ForegroundColor Red
    docker-compose logs postgres
    exit 1
}

# Check Backend
try {
    Invoke-WebRequest -Uri "http://localhost:5000/api/health-check" -UseBasicParsing | Out-Null
    Write-Host "✅ Backend API is ready" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend API is not ready" -ForegroundColor Red
    docker-compose logs backend
    exit 1
}

# Check Frontend
try {
    Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing | Out-Null
    Write-Host "✅ Frontend is ready" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend is not ready" -ForegroundColor Red
    docker-compose logs frontend
    exit 1
}

Write-Host ""
Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Application URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend API: http://localhost:5000" -ForegroundColor White
Write-Host "   Database: localhost:5432" -ForegroundColor White
Write-Host ""
Write-Host "📋 Useful commands:" -ForegroundColor Cyan
Write-Host "   View logs: docker-compose logs -f" -ForegroundColor White
Write-Host "   Stop services: docker-compose down" -ForegroundColor White
Write-Host "   Restart services: docker-compose restart" -ForegroundColor White
Write-Host "   Update services: docker-compose up -d --build" -ForegroundColor White
Write-Host ""
Write-Host "🔒 Security Note: Please update the JWT_SECRET and POSTGRES_PASSWORD in the .env file for production use." -ForegroundColor Yellow
