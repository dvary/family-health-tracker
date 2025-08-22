#!/bin/bash

echo "Stopping containers..."
docker-compose down

echo "Removing database volume to force clean initialization..."
docker volume rm family-health-tracker_postgres_data

echo "Starting containers..."
docker-compose up -d

echo "Waiting for database to initialize..."
sleep 30

echo "Checking database tables..."
docker exec family-health-db psql -U postgres -d family_health_tracker -c "\dt"

echo "Done! Check the logs with: docker-compose logs -f"
