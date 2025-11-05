# BetterCV - Production Deployment Guide

Complete guide for deploying BetterCV to production environments.

---

## 🎯 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Deployment with Docker](#quick-deployment-with-docker)
3. [Manual Deployment](#manual-deployment)
4. [Cloud Deployment](#cloud-deployment)
5. [SSL/HTTPS Setup](#sslhttps-setup)
6. [Environment Configuration](#environment-configuration)
7. [Database Migration](#database-migration)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required
- **Server**: Linux (Ubuntu 20.04+ recommended)
- **Node.js**: 18+ LTS
- **PostgreSQL**: 15+
- **Docker** (recommended): 20.10+
- **Docker Compose**: 2.0+
- **Domain**: example.com (for production)
- **SSL Certificate**: Let's Encrypt or commercial

### Optional
- **Nginx**: For reverse proxy
- **Redis**: For caching and sessions
- **Monitoring**: Sentry, Datadog, or similar

---

## Quick Deployment with Docker

### 1. Clone Repository

```bash
git clone https://github.com/your-org/bettercv-system.git
cd bettercv-system
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit with your values
nano .env
```

**Required environment variables:**
```env
# Database
DB_USER=bettercv_user
DB_PASSWORD=STRONG_PASSWORD_HERE

# JWT
JWT_SECRET=GENERATE_WITH_openssl_rand_base64_32
SESSION_SECRET=GENERATE_WITH_openssl_rand_base64_32

# Anthropic AI
ANTHROPIC_API_KEY=sk-ant-YOUR_API_KEY_HERE

# Email (optional but recommended)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Production settings
NODE_ENV=production
PORT=3000
```

### 3. Generate Secrets

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate session secret
openssl rand -base64 32
```

### 4. Start Services

```bash
# Build and start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
```

### 5. Initialize Database

```bash
# Database is automatically initialized on first run
# Check if schema was created:
docker-compose exec postgres psql -U bettercv_user -d bettercv -c "\dt"
```

### 6. Verify Deployment

```bash
# Health check
curl http://localhost:3000/health

# Expected response:
# {"status":"healthy","timestamp":"...","uptime":1.23}
```

**Your application is now running!**
- Backend API: http://localhost:3000
- Health: http://localhost:3000/health

---

## Manual Deployment

### 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL 15
sudo apt install postgresql postgresql-contrib

# Install PM2 (process manager)
sudo npm install -g pm2
```

### 2. Create Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE bettercv;
CREATE USER bettercv_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE bettercv TO bettercv_user;
\q

# Import schema
cd bettercv-system
psql -U bettercv_user -d bettercv < database/schema.sql
psql -U bettercv_user -d bettercv < database/builder-schema.sql
```

### 3. Configure Application

```bash
# Backend
cd backend
npm install --production
cp ../.env.example .env
nano .env  # Edit with your values

# Frontend (if building)
cd ../frontend/builder
npm install
npm run build
```

### 4. Start with PM2

```bash
cd backend

# Start application
pm2 start server.js --name bettercv-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions to enable startup
```

### 5. Configure Nginx

```bash
# Install Nginx
sudo apt install nginx

# Create configuration
sudo nano /etc/nginx/sites-available/bettercv
```

**Nginx configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Frontend static files
    location / {
        root /var/www/bettercv/frontend;
        try_files $uri $uri/ /index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Health check endpoint (no caching)
    location = /health {
        proxy_pass http://localhost:3000;
        proxy_cache_bypass 1;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    # File uploads (larger body size)
    location /api/upload {
        proxy_pass http://localhost:3000;
        client_max_body_size 10M;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Logs
    access_log /var/log/nginx/bettercv_access.log;
    error_log /var/log/nginx/bettercv_error.log;
}
```

**Enable configuration:**
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/bettercv /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## Cloud Deployment

### AWS (Elastic Beanstalk)

1. **Install EB CLI:**
```bash
pip install awsebcli
```

2. **Initialize:**
```bash
eb init -p node.js bettercv
```

3. **Create environment:**
```bash
eb create bettercv-prod
```

4. **Deploy:**
```bash
eb deploy
```

### Google Cloud (App Engine)

1. **Create app.yaml:**
```yaml
runtime: nodejs18

env_variables:
  NODE_ENV: "production"
  DB_HOST: "/cloudsql/PROJECT:REGION:INSTANCE"

instance_class: F2
automatic_scaling:
  min_instances: 1
  max_instances: 10
```

2. **Deploy:**
```bash
gcloud app deploy
```

### Heroku

1. **Install Heroku CLI**
2. **Deploy:**
```bash
heroku create bettercv-prod
heroku addons:create heroku-postgresql:standard-0
git push heroku main
heroku run npm run migrate
```

### DigitalOcean App Platform

1. **Connect GitHub repository**
2. **Configure build settings:**
   - Build Command: `npm install && npm run build`
   - Run Command: `npm start`
3. **Add environment variables**
4. **Deploy**

---

## SSL/HTTPS Setup

### Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
# Test renewal:
sudo certbot renew --dry-run
```

### Commercial SSL

1. Purchase SSL certificate
2. Place files:
   - `fullchain.pem` → `/etc/nginx/ssl/`
   - `privkey.pem` → `/etc/nginx/ssl/`
3. Update Nginx configuration with paths
4. Restart Nginx

---

## Environment Configuration

### Production .env

```env
# =======================
# PRODUCTION CONFIGURATION
# =======================

# Node Environment
NODE_ENV=production

# Server
PORT=3000

# Database (use connection string or individual vars)
DATABASE_URL=postgresql://user:pass@host:5432/db
# OR
DB_HOST=your-db-host.com
DB_PORT=5432
DB_NAME=bettercv
DB_USER=bettercv_user
DB_PASSWORD=STRONG_PASSWORD

# JWT Authentication
JWT_SECRET=LONG_RANDOM_STRING_HERE
JWT_EXPIRES_IN=7d
SESSION_SECRET=ANOTHER_LONG_RANDOM_STRING

# Anthropic AI
ANTHROPIC_API_KEY=sk-ant-YOUR_REAL_API_KEY

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM="BetterCV <noreply@yourdomain.com>"

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5

# IP Filtering (optional)
ENABLE_IP_WHITELIST=false
IP_WHITELIST=
ENABLE_IP_BLACKLIST=false
IP_BLACKLIST=

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,doc,docx,txt

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Domain
BASE_DOMAIN=yourdomain.com
```

---

## Database Migration

### Running Migrations

```bash
# With Docker
docker-compose exec backend npm run migrate

# Manual
cd backend
npm run migrate
```

### Backup Database

```bash
# Docker
docker-compose exec postgres pg_dump -U bettercv_user bettercv > backup.sql

# Manual
pg_dump -U bettercv_user bettercv > backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
# Docker
docker-compose exec -T postgres psql -U bettercv_user bettercv < backup.sql

# Manual
psql -U bettercv_user bettercv < backup.sql
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Application health
curl https://yourdomain.com/health

# Database connection
curl https://yourdomain.com/health | jq '.database'

# PM2 status
pm2 status
pm2 monit
```

### Log Management

```bash
# View logs
pm2 logs bettercv-backend

# Docker logs
docker-compose logs -f backend

# Nginx logs
tail -f /var/log/nginx/bettercv_access.log
tail -f /var/log/nginx/bettercv_error.log
```

### Performance Monitoring

**Install monitoring tools:**
```bash
# PM2 Plus (monitoring dashboard)
pm2 plus

# Sentry (error tracking)
npm install @sentry/node
```

### Automated Backups

Create cron job for daily backups:
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * pg_dump -U bettercv_user bettercv > /backups/bettercv_$(date +\%Y\%m\%d).sql
```

---

## Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs bettercv-backend --lines 100

# Check environment variables
pm2 show bettercv-backend

# Restart
pm2 restart bettercv-backend
```

### Database Connection Issues

```bash
# Test connection
psql -U bettercv_user -h localhost -d bettercv

# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### High Memory Usage

```bash
# Check memory
free -h

# PM2 memory monitoring
pm2 monit

# Restart application
pm2 restart bettercv-backend
```

### SSL Certificate Issues

```bash
# Check certificate expiry
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal

# Test Nginx config
sudo nginx -t
```

---

## Security Checklist

- [ ] Strong passwords for all services
- [ ] JWT secrets generated securely
- [ ] HTTPS enabled with valid SSL
- [ ] Firewall configured (UFW or cloud firewall)
- [ ] Database not exposed to internet
- [ ] SSH key authentication only (no password)
- [ ] Regular security updates applied
- [ ] Backups configured and tested
- [ ] Monitoring and alerting set up
- [ ] Rate limiting enabled
- [ ] CSRF protection active
- [ ] Security headers configured
- [ ] File upload validation enabled
- [ ] Logs reviewed regularly

---

## Post-Deployment

### 1. Verify Everything Works

```bash
# Health check
curl https://yourdomain.com/health

# Register test user
curl -X POST https://yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","name":"Test"}'
```

### 2. Set Up Monitoring

- Configure uptime monitoring (UptimeRobot, Pingdom)
- Set up error tracking (Sentry)
- Enable performance monitoring (New Relic, Datadog)

### 3. Configure Backups

- Set up automated database backups
- Configure file storage backups
- Test restore procedures

### 4. Documentation

- Document your deployment process
- Create runbook for common operations
- Share credentials securely with team

---

## Quick Commands Reference

```bash
# Docker
docker-compose up -d              # Start services
docker-compose down               # Stop services
docker-compose logs -f backend    # View logs
docker-compose ps                 # Check status
docker-compose restart backend    # Restart service

# PM2
pm2 start server.js --name app   # Start app
pm2 stop app                     # Stop app
pm2 restart app                  # Restart app
pm2 logs app                     # View logs
pm2 monit                        # Monitor resources

# Database
pg_dump -U user db > backup.sql  # Backup
psql -U user db < backup.sql     # Restore
psql -U user db                  # Connect

# Nginx
sudo nginx -t                    # Test config
sudo systemctl reload nginx      # Reload config
sudo systemctl restart nginx     # Restart Nginx
```

---

**🎉 Congratulations! Your BetterCV instance is now deployed and running in production!**

For support, visit: https://github.com/your-org/bettercv-system/issues
