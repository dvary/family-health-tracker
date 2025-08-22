#!/bin/bash

echo "🔍 Checking Cloudflare Tunnel connectivity..."

echo "📡 Testing frontend tunnel (family.labratindia.org)..."
curl -I https://family.labratindia.org 2>/dev/null | head -1 || echo "❌ Frontend tunnel not accessible"

echo "📡 Testing API tunnel (api.family.labratindia.org)..."
curl -I https://api.family.labratindia.org 2>/dev/null | head -1 || echo "❌ API tunnel not accessible"

echo "🌐 Testing local backend..."
curl -I http://192.168.0.170:5000/api/health-check 2>/dev/null | head -1 || echo "❌ Local backend not accessible"

echo "✅ Tunnel check completed!"
