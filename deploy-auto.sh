#!/bin/bash

echo "🚀 Starting Family Health Tracker deployment..."

# Stop existing containers
echo "📦 Stopping existing containers..."
docker-compose down

# Remove database volume to ensure clean initialization
echo "🗄️ Removing database volume for clean initialization..."
docker volume rm family-health-tracker_postgres_data 2>/dev/null || echo "Volume not found, continuing..."

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose up -d --build

# Wait for database initialization
echo "⏳ Waiting for database initialization..."
sleep 30

# Check if database tables were created
echo "🔍 Checking database tables..."
docker exec family-health-db psql -U postgres -d family_health_tracker -c "\dt" 2>/dev/null || echo "Tables not ready yet, waiting..."

# Wait a bit more and check again
sleep 10
docker exec family-health-db psql -U postgres -d family_health_tracker -c "\dt" 2>/dev/null || echo "Database initialization may still be in progress..."

echo "✅ Deployment completed!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000/api"
echo "📊 Check logs: docker-compose logs -f"
