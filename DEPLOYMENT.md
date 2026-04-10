# 🚀 FoodBridge Deployment Guide

## Production Deployment Checklist

### ⚠️ Pre-Deployment Security

#### 1. Environment Variables
```bash
# CRITICAL: Change these immediately!

# Generate strong secrets (32+ characters)
JWT_SECRET=your_production_jwt_secret_min_32_characters
JWT_ADMIN_SECRET=your_production_admin_jwt_secret_min_32_characters

# Change admin credentials
ADMIN_ID=your_admin_email@company.com
ADMIN_PASSWORD=StrongAdminPassword@2026!

# Set production MongoDB URI
MONGODB_URI=mongodb://username:password@host:port/database

# Update CORS
CLIENT_URL=https://yourdomain.com

# Set to production
NODE_ENV=production
```

#### 2. Generate Strong Secrets
```bash
# Generate random secrets using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 3. Security Headers
Already configured with Helmet.js, but verify:
- ✅ HTTPS enforced
- ✅ HSTS enabled
- ✅ XSS protection
- ✅ Frame guard

---

## Deployment Options

### Option 1: Traditional Server (VPS)

#### Requirements
- Ubuntu 20.04 LTS or higher
- Node.js 16+ installed
- MongoDB 5+ installed
- Nginx installed
- SSL certificate (Let's Encrypt)

#### Step 1: Prepare Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
sudo apt install -y nginx

# Install PM2 (Process Manager)
sudo npm install -g pm2
```

#### Step 2: Deploy Application

```bash
# Clone or upload your project
cd /var/www
sudo mkdir foodbridge
sudo chown $USER:$USER foodbridge
cd foodbridge

# Upload your code (via git, scp, or ftp)
# If using git:
git clone https://github.com/yourusername/foodbridge.git .

# Install dependencies
npm install
cd client && npm install && npm run build && cd ..

# Copy production environment file
cp .env.example .env
nano .env  # Edit with production values
```

#### Step 3: Configure MongoDB

```bash
# Enable MongoDB authentication
sudo mongosh

use admin
db.createUser({
  user: "foodbridge_admin",
  pwd: "strong_password_here",
  roles: [ { role: "readWrite", db: "foodbridge" } ]
})

exit

# Update MongoDB config to enable auth
sudo nano /etc/mongod.conf

# Add these lines:
security:
  authorization: enabled

# Restart MongoDB
sudo systemctl restart mongod
```

#### Step 4: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/foodbridge
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (React build)
    location / {
        root /var/www/foodbridge/client/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/foodbridge /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### Step 5: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
# Test renewal
sudo certbot renew --dry-run
```

#### Step 6: Start Application with PM2

```bash
cd /var/www/foodbridge

# Start with PM2
pm2 start server/index.js --name foodbridge-api

# Configure startup script
pm2 startup
pm2 save

# Monitor logs
pm2 logs foodbridge-api

# Other PM2 commands
pm2 status           # Check status
pm2 restart all      # Restart
pm2 stop all         # Stop
pm2 delete all       # Delete
```

---

### Option 2: Docker Deployment

#### Step 1: Create Dockerfile (Backend)

```dockerfile
# Create: Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production

# Start application
CMD ["node", "server/index.js"]
```

#### Step 2: Create Dockerfile (Frontend)

```dockerfile
# Create: client/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Step 3: Create docker-compose.yml

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    container_name: foodbridge-mongo
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
      MONGO_INITDB_DATABASE: foodbridge
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"
    networks:
      - foodbridge-network

  backend:
    build: .
    container_name: foodbridge-api
    restart: always
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://admin:${MONGO_PASSWORD}@mongodb:27017/foodbridge?authSource=admin
      - JWT_SECRET=${JWT_SECRET}
      - JWT_ADMIN_SECRET=${JWT_ADMIN_SECRET}
      - ADMIN_ID=${ADMIN_ID}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
      - CLIENT_URL=${CLIENT_URL}
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    networks:
      - foodbridge-network

  frontend:
    build: ./client
    container_name: foodbridge-client
    restart: always
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    networks:
      - foodbridge-network

volumes:
  mongodb_data:

networks:
  foodbridge-network:
    driver: bridge
```

#### Step 4: Deploy with Docker

```bash
# Create .env file for docker-compose
nano .env

# Add:
MONGO_PASSWORD=your_mongo_password
JWT_SECRET=your_jwt_secret
JWT_ADMIN_SECRET=your_admin_secret
ADMIN_ID=admin@yourdomain.com
ADMIN_PASSWORD=YourAdminPassword
CLIENT_URL=https://yourdomain.com

# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Restart containers
docker-compose restart
```

---

### Option 3: Cloud Platform (Heroku)

#### Step 1: Prepare for Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create foodbridge-app

# Add MongoDB
heroku addons:create mongolab:sandbox
```

#### Step 2: Create Procfile

```
web: node server/index.js
```

#### Step 3: Configure Environment

```bash
# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret
heroku config:set JWT_ADMIN_SECRET=your_admin_secret
heroku config:set ADMIN_ID=admin@yourdomain.com
heroku config:set ADMIN_PASSWORD=YourPassword
heroku config:set CLIENT_URL=https://foodbridge-app.herokuapp.com
```

#### Step 4: Deploy

```bash
# Add Heroku remote
git remote add heroku https://git.heroku.com/foodbridge-app.git

# Push to Heroku
git push heroku main

# Open application
heroku open

# View logs
heroku logs --tail
```

---

### Option 4: AWS (EC2 + RDS)

#### Step 1: Setup EC2 Instance

1. Launch Ubuntu 20.04 EC2 instance
2. Configure security groups:
   - SSH (22) from your IP
   - HTTP (80) from anywhere
   - HTTPS (443) from anywhere
3. SSH into instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

#### Step 2: Setup MongoDB Atlas

1. Create account at mongodb.com/cloud/atlas
2. Create free cluster
3. Setup database user
4. Whitelist IP addresses (0.0.0.0/0 for all)
5. Get connection string

#### Step 3: Deploy Application

Follow Traditional Server deployment steps but use MongoDB Atlas connection string:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/foodbridge?retryWrites=true&w=majority
```

---

## Post-Deployment

### 1. Monitoring

#### Setup PM2 Monitoring

```bash
# PM2 Monitoring Dashboard
pm2 install pm2-logrotate

# View dashboard
pm2 monit

# Check memory/CPU
pm2 status
```

#### Setup Log Rotation

```bash
# Configure PM2 log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### 2. Database Backup

```bash
# Create backup script
sudo nano /usr/local/bin/backup-mongodb.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y-%m-%d-%H%M)
BACKUP_DIR="/backups/mongodb"
mkdir -p $BACKUP_DIR

mongodump --uri="mongodb://user:pass@localhost:27017/foodbridge" \
  --out=$BACKUP_DIR/backup-$DATE

# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-mongodb.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /usr/local/bin/backup-mongodb.sh
```

### 3. Health Checks

Setup monitoring with:
- **UptimeRobot**: Free website monitoring
- **Datadog**: Application performance monitoring
- **Sentry**: Error tracking
- **LogRocket**: Session replay

### 4. SSL Certificate Renewal

```bash
# Certbot auto-renews, but you can test:
sudo certbot renew --dry-run

# Check renewal cron job:
sudo systemctl status certbot.timer
```

---

## Performance Optimization

### 1. Enable Gzip Compression (Nginx)

```nginx
# Add to nginx config
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
```

### 2. Cache Static Assets

```nginx
# Add to nginx config
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Enable HTTP/2

```nginx
# Update nginx config
listen 443 ssl http2;
```

### 4. Database Indexing

```javascript
// Run in MongoDB shell
use foodbridge

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ phone: 1 }, { unique: true })
db.users.createIndex({ role: 1 })
db.users.createIndex({ createdAt: -1 })
```

---

## Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs foodbridge-api

# Check port availability
sudo netstat -tulpn | grep :5000

# Check MongoDB connection
mongosh --eval "db.adminCommand('ping')"
```

### High Memory Usage

```bash
# Check memory
pm2 status

# Restart application
pm2 restart foodbridge-api

# Increase memory limit
pm2 start server/index.js --name foodbridge-api --max-memory-restart 500M
```

### Database Connection Issues

```bash
# Check MongoDB status
sudo systemctl status mongod

# Check logs
sudo tail -f /var/log/mongodb/mongod.log

# Restart MongoDB
sudo systemctl restart mongod
```

---

## Scaling Strategies

### Horizontal Scaling

1. **Load Balancer**: Use Nginx or AWS ELB
2. **Multiple Instances**: Run PM2 in cluster mode

```bash
pm2 start server/index.js -i max --name foodbridge-cluster
```

3. **Database Replication**: MongoDB replica sets
4. **Caching Layer**: Redis for session management

### Vertical Scaling

1. Increase server resources (CPU, RAM)
2. Optimize database queries
3. Add database indexes
4. Enable CDN for static assets

---

## Security Checklist

- [ ] Changed all default credentials
- [ ] Generated strong JWT secrets
- [ ] Enabled HTTPS/SSL
- [ ] Configured MongoDB authentication
- [ ] Setup firewall rules
- [ ] Enabled rate limiting
- [ ] Setup regular backups
- [ ] Monitoring and alerting enabled
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] Regular security updates
- [ ] DDoS protection enabled

---

## Maintenance

### Regular Tasks

**Daily**:
- Check application logs
- Monitor error rates
- Check disk space

**Weekly**:
- Review security logs
- Check backup integrity
- Update dependencies

**Monthly**:
- Security audit
- Performance review
- Database optimization

---

## Support & Resources

### Useful Commands

```bash
# Check disk space
df -h

# Check memory
free -h

# Check CPU
top

# Check processes
ps aux | grep node

# Check network
netstat -tulpn

# Check logs
tail -f /var/log/nginx/error.log
pm2 logs
```

### Documentation Links

- [Node.js Docs](https://nodejs.org/docs)
- [MongoDB Manual](https://docs.mongodb.com/)
- [PM2 Docs](https://pm2.keymetrics.io/)
- [Nginx Docs](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)

---

**Your application is now production-ready! 🚀**
