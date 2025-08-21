# Family Health Tracker - Deployment Guide

This guide covers deploying the Family Health Tracker application on Ubuntu servers using Docker and Portainer.

## 🚀 Quick Start

### Option 1: Automated Deployment (Recommended)

1. **Clone the repository on your Ubuntu server:**
   ```bash
   git clone https://github.com/dvary/family-health-tracker.git
   cd family-health-tracker
   ```

2. **Make the deployment script executable and run it:**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **Follow the prompts to configure your environment variables.**

### Option 2: Manual Deployment

#### Prerequisites

- Ubuntu 20.04+ server
- Docker and Docker Compose installed
- Git installed
- Sudo privileges

#### Step-by-Step Manual Setup

1. **Install Docker and Docker Compose:**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Docker
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   sudo apt update
   sudo apt install -y docker-ce docker-ce-cli containerd.io
   sudo usermod -aG docker $USER
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Clone and setup the application:**
   ```bash
   git clone https://github.com/dvary/family-health-tracker.git
   cd family-health-tracker
   ```

3. **Configure environment variables:**
   ```bash
   cp env.production.example .env
   nano .env
   ```

4. **Generate SSL certificates:**
   ```bash
   mkdir -p nginx/ssl
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
       -keyout nginx/ssl/key.pem \
       -out nginx/ssl/cert.pem \
       -subj "/C=US/ST=State/L=City/O=Organization/CN=your-domain.com"
   ```

5. **Deploy the application:**
   ```bash
   docker-compose up -d --build
   ```

## 🐳 Portainer Deployment

### Using Portainer Stacks

1. **Access your Portainer instance**

2. **Create a new Stack:**
   - Name: `family-health-tracker`
   - Build method: `Repository`
   - Repository URL: `https://github.com/dvary/family-health-tracker.git`
   - Repository reference: `main`
   - Compose path: `docker-compose.yml`

3. **Add environment variables:**
   ```yaml
   POSTGRES_USER: postgres
   POSTGRES_PASSWORD: your_secure_password
   JWT_SECRET: your_super_secure_jwt_secret
   CORS_ORIGIN: https://your-domain.com
   REACT_APP_API_URL: https://your-domain.com/api
   ```

4. **Deploy the stack**

### Using Git Repository with Portainer

1. **In Portainer, go to Stacks → Add Stack**

2. **Configure the stack:**
   ```
   Name: family-health-tracker
   Build method: Repository
   Repository URL: https://github.com/dvary/family-health-tracker.git
   Repository reference: main
   Compose path: docker-compose.yml
   ```

3. **Add environment variables in the web interface**

4. **Deploy**

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=10485760

# CORS Configuration
CORS_ORIGIN=https://your-domain.com

# Frontend API URL
REACT_APP_API_URL=https://your-domain.com/api
```

### SSL Certificates

For production, replace the self-signed certificates with real ones:

1. **Using Let's Encrypt (recommended):**
   ```bash
   sudo apt install certbot
   sudo certbot certonly --standalone -d your-domain.com
   ```

2. **Copy certificates to nginx/ssl:**
   ```bash
   sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
   sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem
   sudo chown $USER:$USER nginx/ssl/*
   ```

3. **Restart the stack:**
   ```bash
   docker-compose restart nginx
   ```

## 🔒 Security Considerations

### Firewall Configuration

```bash
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Fail2ban Setup

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Regular Backups

Create a backup script:

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/family-health-tracker"

mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T postgres pg_dump -U postgres family_health_tracker > $BACKUP_DIR/db_backup_$DATE.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz uploads/

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

Add to crontab:
```bash
0 2 * * * /path/to/backup.sh
```

## 📊 Monitoring and Maintenance

### Health Checks

The application includes health checks for all services. Monitor them with:

```bash
docker-compose ps
```

### Logs

View logs for all services:
```bash
docker-compose logs -f
```

View logs for specific service:
```bash
docker-compose logs -f backend
```

### Updates

To update the application:

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

## 🆘 Troubleshooting

### Common Issues

1. **Database connection errors:**
   - Check if PostgreSQL container is running
   - Verify environment variables
   - Check database logs: `docker-compose logs postgres`

2. **Frontend not loading:**
   - Check if frontend container is running
   - Verify REACT_APP_API_URL environment variable
   - Check nginx logs: `docker-compose logs nginx`

3. **File upload issues:**
   - Check upload directory permissions
   - Verify MAX_FILE_SIZE setting
   - Check backend logs for errors

### Useful Commands

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Restart specific service
docker-compose restart backend

# Access database
docker-compose exec postgres psql -U postgres -d family_health_tracker

# Backup database
docker-compose exec postgres pg_dump -U postgres family_health_tracker > backup.sql
```

## 📞 Support

For issues and questions:
- Check the logs first
- Review this deployment guide
- Create an issue on GitHub: https://github.com/dvary/family-health-tracker/issues
