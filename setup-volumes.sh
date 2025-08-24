#!/bin/bash

# Life Vault Volume Setup Script
echo "🔧 Setting up Life Vault volumes..."

# Create volumes if they don't exist
echo "📦 Creating postgres data volume..."
docker volume create life-vault_postgres_data

echo "📦 Creating uploads data volume..."
docker volume create life-vault_uploads_data

echo "✅ Volumes created successfully!"
echo ""
echo "📊 Volume status:"
docker volume ls | grep life-vault

echo ""
echo "🚀 You can now deploy in Portainer using docker-compose.prod.yml"
