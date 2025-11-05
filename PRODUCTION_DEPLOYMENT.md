# Production Deployment Guide

## 🚀 Quick Deploy

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Docker & Docker Compose (optional)
- Domain with SSL certificate

---

## Option 1: Docker Deployment (Recommended)

### 1. Build Docker Image
```bash
docker build -t ai-cv-system:latest .
```

### 2. Run with Docker Compose
```bash
# Configure environment
cp .env.example .env
# Edit .env with production values

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 3. Configure Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Dashboard
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Builder
    location /builder {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Option 2: Manual Deployment

### 1. Setup Database
```bash
# Create database
psql -U postgres -c "CREATE DATABASE bettercv;"

# Run migrations
cd database
psql -U postgres -d bettercv -f schema.sql
psql -U postgres -d bettercv -f builder-schema.sql
```

### 2. Configure Environment
```bash
# Backend
cd backend
cp .env.example .env

# Edit .env:
# - DATABASE_URL
# - ANTHROPIC_API_KEY
# - JWT_SECRET
# - NODE_ENV=production
```

### 3. Install Dependencies
```bash
# Backend
cd backend
npm ci --only=production

# Dashboard
cd ../frontend/dashboard
npm ci
npm run build

# Builder
cd ../builder
npm ci
npm run build
```

### 4. Start Services with PM2
```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start server.js --name "bettercv-api"

# Serve dashboard (static)
pm2 serve frontend/dashboard/dist 3002 --name "bettercv-dashboard" --spa

# Serve builder (static)
pm2 serve frontend/builder/dist 3001 --name "bettercv-builder" --spa

# Save PM2 configuration
pm2 save
pm2 startup
```

---

## Option 3: Platform-as-a-Service (Vercel/Railway/Render)

### Vercel Deployment

1. **Deploy Dashboard & Builder:**
```bash
# Dashboard
cd frontend/dashboard
vercel --prod

# Builder
cd ../builder
vercel --prod
```

2. **Deploy Backend:**
   - Use Railway, Render, or DigitalOcean App Platform
   - Configure environment variables
   - Connect PostgreSQL database

### Railway Deployment

1. **Install Railway CLI:**
```bash
npm install -g @railway/cli
railway login
```

2. **Deploy:**
```bash
railway init
railway add
railway up
```

3. **Configure:**
   - Add PostgreSQL plugin
   - Set environment variables
   - Configure custom domain

---

## Environment Variables

### Required
```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=bettercv
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

# API Keys
ANTHROPIC_API_KEY=your_anthropic_key_here

# Authentication
JWT_SECRET=your_very_long_random_secret_key_here
JWT_EXPIRES_IN=7d

# Server
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://yourdomain.com

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

### Optional
```env
# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# CORS
CORS_ORIGIN=https://yourdomain.com

# Email (if using email features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

---

## Database Setup

### PostgreSQL Configuration
```sql
-- Create user
CREATE USER bettercv WITH PASSWORD 'secure_password';

-- Create database
CREATE DATABASE bettercv OWNER bettercv;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE bettercv TO bettercv;

-- Connect and run migrations
\c bettercv
\i schema.sql
\i builder-schema.sql
```

### Connection Pooling
Update `backend/config/database.js`:
```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});
```

---

## SSL/TLS Setup

### Let's Encrypt (Free SSL)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## Monitoring & Logging

### PM2 Monitoring
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# Check status
pm2 status
```

### Application Logs
```javascript
// Backend logging with Winston
const logger = require('./middleware/logger');

logger.info('Application started');
logger.error('Error occurred', { error });
```

---

## Performance Optimization

### 1. Enable Gzip Compression
```javascript
// backend/server.js
const compression = require('compression');
app.use(compression());
```

### 2. Redis Caching (Optional)
```bash
# Install Redis
npm install redis

# Configure caching
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});
```

### 3. CDN for Static Assets
- Upload built frontend files to CDN
- Update references in HTML
- Configure cache headers

---

## Security Checklist

- [x] Environment variables properly configured
- [x] Database credentials secured
- [x] JWT secret is strong and random
- [x] HTTPS/SSL enabled
- [x] CORS properly configured
- [x] Rate limiting enabled
- [x] Input validation on all endpoints
- [x] SQL injection prevention (parameterized queries)
- [x] XSS protection (helmet.js)
- [x] CSRF protection enabled
- [x] File upload validation
- [ ] Regular security audits (`npm audit`)
- [ ] Dependency updates
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting setup

---

## Backup Strategy

### Database Backup
```bash
# Manual backup
pg_dump -U bettercv -d bettercv > backup_$(date +%Y%m%d).sql

# Automated daily backups
0 2 * * * pg_dump -U bettercv -d bettercv > /backups/backup_$(date +\%Y\%m\%d).sql
```

### File Upload Backup
```bash
# Backup uploads directory
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/

# Sync to S3 (if using AWS)
aws s3 sync uploads/ s3://your-bucket/uploads/
```

---

## Scaling

### Horizontal Scaling
1. **Load Balancer:** Nginx, HAProxy, or cloud load balancer
2. **Multiple Backend Instances:** PM2 cluster mode or Docker replicas
3. **Database:** Read replicas for queries
4. **File Storage:** S3 or CDN for uploads

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Optimize database queries
- Enable query caching
- Use connection pooling

---

## Troubleshooting

### Application Won't Start
```bash
# Check logs
pm2 logs bettercv-api

# Check port availability
lsof -i :3000

# Check database connection
psql -U bettercv -d bettercv -c "SELECT 1;"
```

### High Memory Usage
```bash
# Check PM2 memory
pm2 monit

# Restart application
pm2 restart bettercv-api

# Clear logs
pm2 flush
```

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check PostgreSQL is running
- Verify firewall rules
- Check connection pool settings

---

## CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend/dashboard && npm ci
          cd ../builder && npm ci

      - name: Run tests
        run: cd backend && npm test

      - name: Build frontend
        run: |
          cd frontend/dashboard && npm run build
          cd ../builder && npm run build

      - name: Deploy to server
        run: |
          # Your deployment script here
          ssh user@server 'cd /app && git pull && pm2 restart all'
```

---

## Support & Maintenance

### Regular Maintenance Tasks
- **Weekly:** Check logs for errors
- **Monthly:** Run `npm audit` and update dependencies
- **Quarterly:** Review and optimize database
- **Annually:** SSL certificate renewal (if not auto-renewed)

### Monitoring Endpoints
- Health Check: `GET /health`
- API Status: `GET /api/status`
- Database Check: Included in `/health`

---

## Production URLs

After deployment:
- **Dashboard:** https://yourdomain.com
- **Builder:** https://yourdomain.com/builder
- **API:** https://yourdomain.com/api
- **Health Check:** https://yourdomain.com/health

---

## 🎉 You're Live!

Your AI CV System is now running in production. Monitor logs, set up alerts, and enjoy your deployed application!

For issues or questions, refer to other documentation files:
- `QUICK_START.md` - Getting started guide
- `API_DOCUMENTATION.md` - API reference
- `SECURITY_FIXES.md` - Security guidelines
- `TEST_PLAN.md` - Testing strategy
