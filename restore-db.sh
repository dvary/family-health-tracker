#!/bin/bash

# Database restore script for Life Vault
# This script restores the database from a backup file

set -e

# Configuration
DB_CONTAINER="life-vault-db"
DB_NAME="family_health_tracker"
DB_USER="postgres"
BACKUP_DIR="./backups"

echo "🔄 Database restore script for Life Vault"

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Backup directory $BACKUP_DIR does not exist"
    exit 1
fi

# List available backups
echo "📋 Available backups:"
ls -lh "$BACKUP_DIR"/life_vault_backup_*.sql 2>/dev/null || {
    echo "❌ No backup files found in $BACKUP_DIR"
    exit 1
}

# If no specific backup file provided, use the latest
if [ -z "$1" ]; then
    BACKUP_FILE=$(ls -t "$BACKUP_DIR"/life_vault_backup_*.sql | head -n 1)
    echo "🔄 Using latest backup: $BACKUP_FILE"
else
    BACKUP_FILE="$1"
    if [ ! -f "$BACKUP_FILE" ]; then
        echo "❌ Backup file $BACKUP_FILE does not exist"
        exit 1
    fi
fi

# Check if database container is running
if ! docker ps | grep -q "$DB_CONTAINER"; then
    echo "❌ Database container $DB_CONTAINER is not running"
    echo "💡 Please start the database container first:"
    echo "   docker-compose -f docker-compose.prod.yml up -d postgres"
    exit 1
fi

# Confirm restore
echo "⚠️  WARNING: This will overwrite the current database!"
echo "📦 Restoring from: $BACKUP_FILE"
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Restore cancelled"
    exit 1
fi

# Stop the backend to prevent conflicts
echo "🛑 Stopping backend container..."
docker-compose -f docker-compose.prod.yml stop backend

# Restore database
echo "🔄 Restoring database..."
docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" "$DB_NAME" < "$BACKUP_FILE"

# Check if restore was successful
if [ $? -eq 0 ]; then
    echo "✅ Database restored successfully!"
    
    # Start the backend
    echo "🚀 Starting backend container..."
    docker-compose -f docker-compose.prod.yml up -d backend
    
    echo "✅ Restore completed successfully!"
else
    echo "❌ Restore failed!"
    exit 1
fi
