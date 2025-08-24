#!/bin/bash

# Life Vault Production Deployment Script
# This script deploys the application using pre-built Docker images

set -e

# Configuration
LIFE_VAULT_VERSION=${1:-latest}
COMPOSE_FILE="docker-compose.prod.yml"

echo "🚀 Deploying Life Vault version: $LIFE_VAULT_VERSION"

# Export version for docker-compose
export LIFE_VAULT_VERSION

# Stop existing containers
echo "📦 Stopping existing containers..."
docker-compose -f $COMPOSE_FILE down

# Pull latest images
echo "⬇️  Pulling latest images..."
docker-compose -f $COMPOSE_FILE pull

# Start services
echo "🔄 Starting services..."
docker-compose -f $COMPOSE_FILE up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service status
echo "📊 Checking service status..."
docker-compose -f $COMPOSE_FILE ps

echo "✅ Deployment completed successfully!"
echo "🌐 Application should be available at: http://localhost:3000"
echo "📝 Logs: docker-compose -f $COMPOSE_FILE logs -f"
