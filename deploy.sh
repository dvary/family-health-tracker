#!/bin/bash

# Family Health Tracker - Ubuntu Server Deployment Script
# This script sets up the application on a fresh Ubuntu server

set -e  # Exit on any error

echo "🚀 Starting Family Health Tracker deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
print_status "Installing required packages..."
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    software-properties-common \
    git \
    ufw \
    fail2ban

# Install Docker
print_status "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io
    sudo usermod -aG docker $USER
    print_warning "Docker installed. You may need to log out and back in for group changes to take effect."
fi

# Install Docker Compose
print_status "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Create application directory
APP_DIR="/opt/family-health-tracker"
print_status "Creating application directory at $APP_DIR..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Clone or update repository
if [ -d "$APP_DIR/.git" ]; then
    print_status "Updating existing repository..."
    cd $APP_DIR
    git pull origin main
else
    print_status "Cloning repository..."
    git clone https://github.com/dvary/family-health-tracker.git $APP_DIR
    cd $APP_DIR
fi

# Create environment file
if [ ! -f ".env" ]; then
    print_status "Creating environment file..."
    cp env.production.example .env
    print_warning "Please edit .env file with your production values before continuing."
    print_warning "Run: nano .env"
    read -p "Press Enter after editing the .env file..."
else
    print_status "Environment file already exists."
fi

# Generate SSL certificates (self-signed for development)
print_status "Generating SSL certificates..."
sudo mkdir -p nginx/ssl
if [ ! -f "nginx/ssl/cert.pem" ]; then
    sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/key.pem \
        -out nginx/ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
    sudo chown $USER:$USER nginx/ssl/*
fi

# Configure firewall
print_status "Configuring firewall..."
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status

# Configure fail2ban
print_status "Configuring fail2ban..."
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Create systemd service for auto-restart
print_status "Creating systemd service..."
sudo tee /etc/systemd/system/family-health-tracker.service > /dev/null <<EOF
[Unit]
Description=Family Health Tracker
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable family-health-tracker.service

# Build and start containers
print_status "Building and starting containers..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Check service status
print_status "Checking service status..."
docker-compose -f docker-compose.prod.yml ps

# Show access information
print_status "Deployment completed successfully!"
echo ""
echo "🌐 Access your application:"
echo "   - HTTP:  http://$(hostname -I | awk '{print $1}')"
echo "   - HTTPS: https://$(hostname -I | awk '{print $1}')"
echo ""
echo "📁 Application directory: $APP_DIR"
echo "📝 Logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "🔄 Restart: sudo systemctl restart family-health-tracker"
echo "⏹️  Stop: sudo systemctl stop family-health-tracker"
echo ""
print_warning "Remember to:"
echo "   - Update your domain DNS to point to this server"
echo "   - Replace self-signed SSL certificates with real ones"
echo "   - Configure your domain in the .env file"
echo "   - Set up regular backups of the postgres_data volume"
