#!/bin/bash

echo "Stopping containers..."
docker-compose down

echo "Removing old images..."
docker-compose rm -f

echo "Building containers with new environment variables..."
docker-compose build --no-cache

echo "Starting containers..."
docker-compose up -d

echo "Checking container status..."
docker-compose ps

echo "Done! Check the logs with: docker-compose logs -f"
