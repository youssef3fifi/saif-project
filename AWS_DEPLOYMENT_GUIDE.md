# AWS EC2 Deployment Guide

Complete step-by-step guide to deploy the Library Management System on Amazon Web Services EC2.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [EC2 Setup](#ec2-setup)
3. [MongoDB Setup](#mongodb-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Security Configuration](#security-configuration)
7. [Domain & SSL Setup](#domain--ssl-setup)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

- AWS Account
- Basic Linux command line knowledge
- Git installed locally
- SSH client

## EC2 Setup

### 1. Launch EC2 Instance

1. **Login to AWS Console:**
   - Go to https://console.aws.amazon.com/
   - Navigate to EC2 Dashboard

2. **Launch Instance:**
   - Click "Launch Instance"
   - **Name:** `library-management-server`
   - **AMI:** Amazon Linux 2023 or Ubuntu 22.04 LTS
   - **Instance Type:** t2.micro (free tier) or t2.small
   - **Key Pair:** Create new or use existing (.pem file)
   - **Network Settings:** Allow SSH, HTTP, and custom TCP

3. **Configure Security Group:**
   - Create new security group: `library-management-sg`
   - Add inbound rules:
     ```
     Type            Protocol    Port Range    Source
     SSH             TCP         22            Your IP (or 0.0.0.0/0)
     HTTP            TCP         80            0.0.0.0/0
     HTTPS           TCP         443           0.0.0.0/0
     Custom TCP      TCP         5000          0.0.0.0/0 (Backend API)
     ```

4. **Storage:** 8-20 GB (depending on needs)

5. **Launch** the instance

### 2. Connect to EC2

```bash
# Change permission of your key file
chmod 400 your-key-pair.pem

# Connect via SSH
# For Amazon Linux:
ssh -i "your-key-pair.pem" ec2-user@YOUR_EC2_PUBLIC_IP

# For Ubuntu:
ssh -i "your-key-pair.pem" ubuntu@YOUR_EC2_PUBLIC_IP
```

### 3. Update System

```bash
# For Amazon Linux:
sudo yum update -y

# For Ubuntu:
sudo apt update && sudo apt upgrade -y
```

## MongoDB Setup

### Option 1: MongoDB Atlas (Recommended)

1. **Create MongoDB Atlas Account:**
   - Go to https://www.mongodb.com/cloud/atlas
   - Create a free M0 cluster

2. **Configure Database:**
   - Create a database user
   - Whitelist IP: `0.0.0.0/0` (or your EC2 IP)
   - Get connection string

3. **Connection String Format:**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/library-management?retryWrites=true&w=majority
   ```

### Option 2: Local MongoDB on EC2

```bash
# For Amazon Linux:
sudo yum install -y mongodb-org

# For Ubuntu:
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify
sudo systemctl status mongod
```

## Backend Deployment

### 1. Install Node.js

```bash
# For Amazon Linux:
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# For Ubuntu:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### 3. Clone Repository

```bash
cd ~
git clone https://github.com/youssef3fifi/saif-project.git
cd saif-project/backend
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Configure Environment Variables

```bash
# Create .env file
nano .env
```

Add the following content:
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/library-management?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_random_jwt_secret_key_here_change_this
FRONTEND_URL=http://YOUR_EC2_PUBLIC_IP
```

**Important:** 
- Replace MongoDB credentials
- Generate a strong JWT_SECRET: `openssl rand -base64 32`
- Replace YOUR_EC2_PUBLIC_IP with your actual EC2 public IP

Save and exit (Ctrl+X, Y, Enter)

### 6. Test Backend

```bash
# Test run
npm start

# If successful, you should see:
# Server running on port 5000
# MongoDB connected successfully
```

Press Ctrl+C to stop

### 7. Start with PM2

```bash
# Start the application
pm2 start server.js --name library-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command output instructions

# Check status
pm2 status
pm2 logs library-api
```

### 8. Verify Backend

```bash
# Test API endpoint
curl http://localhost:5000/
# Should return JSON with success: true
```

## Frontend Deployment

### 1. Install Nginx

```bash
# For Amazon Linux:
sudo yum install nginx -y

# For Ubuntu:
sudo apt install nginx -y
```

### 2. Copy Frontend Files

```bash
# Create web directory
sudo mkdir -p /var/www/library-management

# Copy frontend files
sudo cp -r ~/saif-project/frontend/* /var/www/library-management/

# Set permissions
sudo chown -R nginx:nginx /var/www/library-management  # Amazon Linux
# OR
sudo chown -R www-data:www-data /var/www/library-management  # Ubuntu
```

### 3. Configure API URL

```bash
# Edit config.js to use your EC2 IP
sudo nano /var/www/library-management/js/config.js
```

Update the API_URL:
```javascript
const API_URL = 'http://YOUR_EC2_PUBLIC_IP:5000';
```

Save and exit

### 4. Configure Nginx

```bash
# Edit Nginx configuration
sudo nano /etc/nginx/conf.d/library-management.conf
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name YOUR_EC2_PUBLIC_IP;

    root /var/www/library-management;
    index index.html;

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy (optional, if you want to proxy through Nginx)
    location /api {
        proxy_pass http://localhost:5000/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

Save and exit

### 5. Start Nginx

```bash
# Test configuration
sudo nginx -t

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### 6. Verify Frontend

Open a web browser and navigate to:
```
http://YOUR_EC2_PUBLIC_IP
```

You should see the login page.

## Security Configuration

### 1. Firewall Configuration (UFW - Ubuntu)

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5000/tcp
sudo ufw enable
sudo ufw status
```

### 2. Create Admin User

Once deployed, register a user through the frontend, then connect to MongoDB to make them an admin:

**MongoDB Atlas:**
- Use the web interface to update the user's role

**Local MongoDB:**
```bash
mongosh
use library-management
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
exit
```

### 3. Environment Variables Security

```bash
# Ensure .env is not readable by others
chmod 600 ~/saif-project/backend/.env
```

## Domain & SSL Setup

### 1. Point Domain to EC2

1. Get an Elastic IP (to avoid IP changes on restart):
   - AWS Console → EC2 → Elastic IPs
   - Allocate new address
   - Associate with your instance

2. Configure DNS (e.g., Route 53, Cloudflare):
   - A record: `yourdomain.com` → Your Elastic IP
   - A record: `www.yourdomain.com` → Your Elastic IP

### 2. Install SSL with Let's Encrypt

```bash
# Install Certbot
# For Amazon Linux:
sudo yum install -y certbot python3-certbot-nginx

# For Ubuntu:
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts
# Certbot will automatically configure Nginx for HTTPS

# Test auto-renewal
sudo certbot renew --dry-run
```

### 3. Update Frontend Configuration

Update API URL to use HTTPS:
```bash
sudo nano /var/www/library-management/js/config.js
```

```javascript
const API_URL = 'https://yourdomain.com:5000';
// OR if using Nginx proxy:
const API_URL = 'https://yourdomain.com/api';
```

### 4. Update Backend CORS

```bash
nano ~/saif-project/backend/.env
```

Update FRONTEND_URL:
```env
FRONTEND_URL=https://yourdomain.com
```

Restart backend:
```bash
pm2 restart library-api
```

## Monitoring & Maintenance

### PM2 Monitoring

```bash
# View logs
pm2 logs library-api

# Monitor resources
pm2 monit

# View process info
pm2 info library-api

# Restart application
pm2 restart library-api

# Stop application
pm2 stop library-api
```

### System Monitoring

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top

# View system logs
sudo journalctl -u nginx -f
```

### Database Backup (MongoDB Atlas)

MongoDB Atlas provides automatic backups. For local MongoDB:

```bash
# Create backup
mongodump --db library-management --out /backup/$(date +%Y%m%d)

# Restore backup
mongorestore --db library-management /backup/20231201/library-management
```

### Update Application

```bash
cd ~/saif-project
git pull origin main

# Update backend
cd backend
npm install
pm2 restart library-api

# Update frontend
sudo cp -r frontend/* /var/www/library-management/
```

## Troubleshooting

### Backend Issues

**Check if backend is running:**
```bash
pm2 status
curl http://localhost:5000/
```

**View backend logs:**
```bash
pm2 logs library-api
```

**Restart backend:**
```bash
pm2 restart library-api
```

**Check MongoDB connection:**
```bash
# If using local MongoDB
sudo systemctl status mongod

# Test connection
mongosh
```

### Frontend Issues

**Check Nginx status:**
```bash
sudo systemctl status nginx
```

**View Nginx error logs:**
```bash
sudo tail -f /var/log/nginx/error.log
```

**Test Nginx configuration:**
```bash
sudo nginx -t
```

**Restart Nginx:**
```bash
sudo systemctl restart nginx
```

### CORS Issues

**Update backend CORS in server.js if needed:**
```javascript
app.use(cors({
  origin: '*', // Or specific domain
  credentials: true
}));
```

Then restart:
```bash
pm2 restart library-api
```

### Port Issues

**Check if port 5000 is in use:**
```bash
sudo lsof -i :5000
```

**Kill process if needed:**
```bash
sudo kill -9 <PID>
```

### Performance Issues

**Increase EC2 instance size:**
- AWS Console → EC2 → Instance State → Stop
- Actions → Instance Settings → Change Instance Type
- Select larger instance (e.g., t2.small → t2.medium)
- Start instance

**Optimize MongoDB:**
- Use MongoDB Atlas for managed performance
- Add indexes to frequently queried fields
- Monitor slow queries

### Security Group Issues

**Verify security group rules in AWS Console:**
- EC2 → Security Groups
- Check inbound rules for ports 22, 80, 443, 5000
- Ensure source is 0.0.0.0/0 or specific IPs

## Production Checklist

- [ ] EC2 instance launched with appropriate size
- [ ] Security group configured with required ports
- [ ] MongoDB Atlas cluster created or local MongoDB installed
- [ ] Node.js and PM2 installed
- [ ] Backend deployed and running with PM2
- [ ] Environment variables configured securely
- [ ] Nginx installed and configured
- [ ] Frontend deployed to Nginx
- [ ] API URL configured in frontend
- [ ] Admin user created
- [ ] SSL certificate installed (if using domain)
- [ ] Domain configured (if using)
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] Tested all functionality

## Additional Resources

- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

## Support

For issues specific to this application, please create an issue on GitHub.

For AWS support, visit the AWS Support Center.

---

**Last Updated:** December 2024
**Tested On:** Amazon Linux 2023, Ubuntu 22.04 LTS
