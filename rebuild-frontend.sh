#!/bin/bash

echo "🔨 Force rebuilding frontend container..."

# Stop frontend container
echo "📦 Stopping frontend container..."
docker-compose stop frontend

# Remove frontend container and image
echo "🗑️ Removing frontend container and image..."
docker-compose rm -f frontend
docker rmi family-health-tracker_frontend 2>/dev/null || echo "Image not found, continuing..."

# Rebuild frontend with new environment variables
echo "🔨 Rebuilding frontend container..."
docker-compose build --no-cache frontend

# Start frontend
echo "🚀 Starting frontend container..."
docker-compose up -d frontend

echo "✅ Frontend rebuild completed!"
echo "🌐 Check the console for the new API URL"
