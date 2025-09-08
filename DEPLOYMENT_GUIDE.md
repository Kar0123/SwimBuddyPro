# 🏊‍♀️ SwimBuddy Pro - Deployment Guide

## Production Deployment Documentation

This guide covers all deployment options for SwimBuddy Pro, from desktop applications to cloud deployments.

---

## 🖥️ Desktop Application Deployment

### Electron Desktop App (Recommended for End Users)

#### Prerequisites
- Node.js 18+ installed
- Python 3.9+ with virtual environment
- Git for version control

#### Build Process
```bash
# 1. Clone and setup project
git clone <repository-url>
cd SwimBuddyPro

# 2. Setup backend
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# macOS/Linux  
source venv/bin/activate
pip install -r requirements.txt

# 3. Setup frontend
cd ../frontend
npm install

# 4. Build for production
npm run build

# 5. Package desktop app
npm run build-electron
```

#### Distribution
- **Windows**: Creates `.exe` installer in `dist/` folder
- **macOS**: Creates `.dmg` installer for Mac distribution
- **Linux**: Creates `.AppImage` for cross-distro compatibility

#### Desktop App Features
- ✅ Self-contained: No external dependencies required
- ✅ Auto-updater ready: Built-in update mechanism
- ✅ Native OS integration: File associations and system tray
- ✅ Offline capable: Full functionality without internet (cached data)

---

## ☁️ Cloud Deployment Options

### 1. Docker Containerization

#### Dockerfile (Backend)
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Dockerfile (Frontend)
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./data:/app/data
    environment:
      - DATABASE_PATH=/app/data/swimbuddy.db
```

### 2. AWS Deployment

#### EC2 Instance Setup
```bash
# Launch Ubuntu 22.04 LTS instance
# Security Group: Allow ports 80, 443, 22

# Instance setup
sudo apt update && sudo apt upgrade -y
sudo apt install docker.io docker-compose -y
sudo usermod -aG docker ubuntu

# Deploy application
git clone <repository-url>
cd SwimBuddyPro
docker-compose up -d
```

#### ECS with Fargate (Scalable Option)
- **Container Registry**: Push Docker images to ECR
- **Task Definition**: Configure CPU/memory requirements  
- **Service**: Auto-scaling and load balancing
- **ALB**: Application Load Balancer for high availability

### 3. Azure Deployment

#### Azure Container Instances
```bash
# Resource group
az group create --name swimbuddy-rg --location eastus

# Container deployment
az container create \
  --resource-group swimbuddy-rg \
  --name swimbuddy-app \
  --image <your-registry>/swimbuddy:latest \
  --ports 80 8000 \
  --dns-name-label swimbuddy-pro
```

#### Azure App Service
- **Web App**: Deploy frontend as static web app
- **API**: Backend as containerized web app
- **Database**: Azure SQL or managed PostgreSQL

### 4. Google Cloud Platform

#### Cloud Run (Serverless)
```bash
# Build and deploy backend
gcloud builds submit --tag gcr.io/[PROJECT]/swimbuddy-backend
gcloud run deploy --image gcr.io/[PROJECT]/swimbuddy-backend --platform managed

# Deploy frontend to Firebase Hosting  
firebase init hosting
firebase deploy
```

---

## 🏠 Self-Hosted Deployment

### Local Network Setup

#### Requirements
- Linux server (Ubuntu 22.04+ recommended)
- 2GB RAM minimum, 4GB recommended
- 10GB storage minimum
- Static IP address on local network

#### Installation Script
```bash
#!/bin/bash
# SwimBuddy Pro Self-Host Setup

# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3 python3-pip python3-venv nodejs npm nginx

# Clone repository
git clone <repository-url> /opt/swimbuddy-pro
cd /opt/swimbuddy-pro

# Setup backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Setup frontend
cd ../frontend
npm install
npm run build

# Configure nginx
sudo cp deployment/nginx.conf /etc/nginx/sites-available/swimbuddy
sudo ln -s /etc/nginx/sites-available/swimbuddy /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Setup systemd service
sudo cp deployment/swimbuddy.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable swimbuddy
sudo systemctl start swimbuddy

# Start nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "SwimBuddy Pro deployed at http://$(hostname -I | cut -d' ' -f1)"
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name _;
    
    # Frontend
    location / {
        root /opt/swimbuddy-pro/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Health check
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
    }
}
```

#### Systemd Service
```ini
[Unit]
Description=SwimBuddy Pro Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/swimbuddy-pro/backend
Environment=PATH=/opt/swimbuddy-pro/backend/venv/bin
ExecStart=/opt/swimbuddy-pro/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

---

## 🔧 Environment Configuration

### Environment Variables

#### Backend (.env)
```bash
# Database
DATABASE_PATH=./swimbuddy.db
DATABASE_URL=sqlite:///./swimbuddy.db

# API Configuration  
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=false

# Scraping Configuration
SCRAPE_DELAY_MIN=1
SCRAPE_DELAY_MAX=3
USER_AGENT_ROTATION=true

# Cache Configuration
CACHE_TTL_HOURS=24
MAX_CACHE_SIZE_MB=100
```

#### Frontend (.env)
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_TITLE=SwimBuddy Pro
VITE_APP_VERSION=1.2.0

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_EXPORT=true
VITE_ENABLE_OFFLINE=true
```

### Production Configuration

#### Security Hardening
```bash
# SSL Certificate (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com

# Firewall setup
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'  
sudo ufw enable

# Backup configuration
# Setup automated daily backups of database
0 2 * * * cp /opt/swimbuddy-pro/backend/swimbuddy.db /backup/swimbuddy-$(date +\%Y\%m\%d).db
```

---

## 📊 Monitoring & Maintenance

### Health Monitoring

#### Basic Health Checks
```bash
#!/bin/bash
# health-check.sh

# Check backend API
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend API healthy"
else
    echo "❌ Backend API down"
    sudo systemctl restart swimbuddy
fi

# Check frontend
if curl -f http://localhost/ > /dev/null 2>&1; then
    echo "✅ Frontend healthy"  
else
    echo "❌ Frontend down"
    sudo systemctl restart nginx
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "⚠️  Disk usage high: ${DISK_USAGE}%"
fi
```

#### Log Management
```bash
# Backend logs
sudo journalctl -u swimbuddy -f

# Nginx logs  
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Log rotation
sudo logrotate -f /etc/logrotate.d/swimbuddy
```

### Database Maintenance
```bash
#!/bin/bash
# database-maintenance.sh

cd /opt/swimbuddy-pro/backend

# Activate virtual environment
source venv/bin/activate

# Database vacuum and analyze
python3 -c "
import sqlite3
conn = sqlite3.connect('swimbuddy.db')
conn.execute('VACUUM')
conn.execute('ANALYZE') 
conn.close()
print('Database optimized')
"

# Backup database
cp swimbuddy.db "backups/swimbuddy-$(date +%Y%m%d-%H%M%S).db"

# Clean old backups (keep last 30 days)
find backups/ -name "swimbuddy-*.db" -mtime +30 -delete
```

---

## 🚀 Performance Optimization

### Frontend Optimization
```bash
# Build optimization
npm run build -- --mode production

# Gzip compression in nginx
gzip on;
gzip_types text/css application/json application/javascript text/xml application/xml text/plain;

# Browser caching
location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Backend Optimization
```python
# Database connection pooling
DATABASE_POOL_SIZE = 10
DATABASE_MAX_OVERFLOW = 20

# Async request handling
@app.middleware("http")
async def add_process_time_header(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Database schema created and tested
- [ ] SSL certificates obtained (for web deployment)
- [ ] Backup strategy implemented
- [ ] Monitoring setup complete
- [ ] Security hardening applied

### Post-Deployment
- [ ] Health checks passing
- [ ] Performance benchmarks met
- [ ] User acceptance testing complete
- [ ] Documentation updated
- [ ] Support procedures documented
- [ ] Rollback plan tested

### Ongoing Maintenance
- [ ] Regular security updates
- [ ] Database backup verification  
- [ ] Performance monitoring
- [ ] User feedback collection
- [ ] Feature usage analytics
- [ ] Capacity planning reviews

---

## 🆘 Troubleshooting Guide

### Common Issues

#### Backend Won't Start
```bash
# Check logs
sudo journalctl -u swimbuddy --no-pager -l

# Common fixes
sudo systemctl restart swimbuddy
source venv/bin/activate && pip install -r requirements.txt
```

#### Frontend Not Loading  
```bash
# Check nginx status
sudo systemctl status nginx

# Rebuild frontend
cd /opt/swimbuddy-pro/frontend
npm run build
sudo systemctl reload nginx
```

#### Database Issues
```bash  
# Check database permissions
ls -la /opt/swimbuddy-pro/backend/swimbuddy.db
sudo chown www-data:www-data swimbuddy.db

# Database integrity check
sqlite3 swimbuddy.db "PRAGMA integrity_check;"
```

### Support Resources
- **Documentation**: `/docs` folder in repository  
- **Issue Tracking**: GitHub Issues for bug reports
- **Community**: Swimming community forums for user support
- **Professional Support**: Available for enterprise deployments

---

**SwimBuddy Pro is ready for professional deployment across all major platforms and deployment scenarios.** 🏊‍♀️
