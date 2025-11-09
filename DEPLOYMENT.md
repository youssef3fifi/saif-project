# Tourism System Deployment Guide

This guide provides step-by-step instructions for deploying the Tourism/Travel System to AWS EC2.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Backend Deployment (EC2)](#backend-deployment-ec2)
- [Frontend Deployment](#frontend-deployment)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- AWS Account with EC2 access
- SSH client for connecting to EC2
- Basic knowledge of Linux commands

### EC2 Instance Requirements
- **Instance Type**: t2.micro or better (t2.small recommended)
- **OS**: Ubuntu 20.04 LTS or Amazon Linux 2
- **Storage**: 8GB minimum
- **Security Group**: Configure to allow:
  - Port 22 (SSH)
  - Port 3000 (Backend API)
  - Port 80 (HTTP) - if using Nginx
  - Port 443 (HTTPS) - if using SSL

## Backend Deployment (EC2)

### Step 1: Launch and Configure EC2 Instance

1. **Launch EC2 Instance**:
   - Go to AWS Console → EC2 → Launch Instance
   - Choose Ubuntu 20.04 LTS AMI
   - Select instance type (t2.micro for free tier, t2.small recommended)
   - Configure security group (allow ports 22, 3000, 80, 443)
   - Download your key pair (.pem file)

2. **Connect to EC2**:
   ```bash
   chmod 400 your-key.pem
   ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
   ```

### Step 2: Install Node.js and Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v18.x)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version

# Install PM2 globally
sudo npm install -g pm2

# Install Git
sudo apt install git -y
```

### Step 3: Clone and Setup Backend

```bash
# Clone repository
git clone https://github.com/youssef3fifi/saif-project.git
cd saif-project

# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
nano .env
```

**Configure .env file**:
```env
PORT=3000
NODE_ENV=production
CORS_ORIGIN=*
API_PREFIX=/api
```

### Step 4: Start Backend with PM2

```bash
# Start application with PM2 (from project root)
cd /home/ubuntu/saif-project
pm2 start deployment/ecosystem.config.js

# Save PM2 process list
pm2 save

# Configure PM2 to start on system boot
pm2 startup systemd
# Follow the command output by PM2

# Check status
pm2 status
pm2 logs tourism-api
```

### Step 5: Configure Firewall (UFW)

```bash
# Enable firewall
sudo ufw allow OpenSSH
sudo ufw allow 3000/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Check status
sudo ufw status
```

### Step 6: Test Backend API

```bash
# Test from EC2
curl http://localhost:3000/health

# Test from your local machine
curl http://YOUR_EC2_PUBLIC_IP:3000/health
```

## Frontend Deployment

You have two options for frontend deployment:

### Option 1: Static Hosting on S3 + CloudFront (Recommended)

1. **Update API Configuration**:
   Edit `frontend/js/config.js`:
   ```javascript
   const API_CONFIG = {
     BASE_URL: 'http://YOUR_EC2_PUBLIC_IP:3000',
     // ... rest of config
   };
   ```

2. **Create S3 Bucket**:
   ```bash
   # From AWS Console or CLI
   aws s3 mb s3://your-tourism-site
   aws s3 website s3://your-tourism-site --index-document index.html
   ```

3. **Upload Frontend**:
   ```bash
   cd frontend
   aws s3 sync . s3://your-tourism-site --acl public-read
   ```

4. **Configure CloudFront** (optional for CDN):
   - Create CloudFront distribution
   - Point origin to S3 bucket
   - Configure custom domain if needed

### Option 2: Host on Same EC2 with Nginx

1. **Install Nginx**:
   ```bash
   sudo apt install nginx -y
   ```

2. **Upload Frontend Files**:
   ```bash
   # Create directory
   sudo mkdir -p /var/www/tourism-app

   # Copy frontend files (from your local machine)
   scp -i your-key.pem -r frontend/* ubuntu@YOUR_EC2_IP:/tmp/frontend/
   
   # Move files (on EC2)
   sudo mv /tmp/frontend/* /var/www/tourism-app/
   sudo chown -R www-data:www-data /var/www/tourism-app
   ```

3. **Update Frontend API URL**:
   Edit `/var/www/tourism-app/js/config.js`:
   ```javascript
   const API_CONFIG = {
     BASE_URL: 'http://YOUR_EC2_PUBLIC_IP:3000',
     // Or use relative URL if using Nginx proxy
     // BASE_URL: '',
   };
   ```

4. **Configure Nginx**:
   ```bash
   # Copy nginx configuration
   sudo cp deployment/nginx.conf /etc/nginx/sites-available/tourism
   
   # Edit configuration
   sudo nano /etc/nginx/sites-available/tourism
   # Replace 'your-domain.com' with your EC2 IP or domain
   
   # Enable site
   sudo ln -s /etc/nginx/sites-available/tourism /etc/nginx/sites-enabled/
   sudo rm /etc/nginx/sites-enabled/default
   
   # Test configuration
   sudo nginx -t
   
   # Restart Nginx
   sudo systemctl restart nginx
   ```

5. **Access Application**:
   - Visit: `http://YOUR_EC2_PUBLIC_IP`

## Testing

### Backend API Tests

```bash
# Health check
curl http://YOUR_EC2_IP:3000/health

# Get all tours
curl http://YOUR_EC2_IP:3000/api/tours

# Get single tour
curl http://YOUR_EC2_IP:3000/api/tours/1

# Get destinations
curl http://YOUR_EC2_IP:3000/api/destinations

# Test booking (POST)
curl -X POST http://YOUR_EC2_IP:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+1234567890",
    "tourId": 1,
    "date": "2024-12-25",
    "travelers": 2
  }'
```

### Frontend Tests

1. Open browser and navigate to your site
2. Test homepage loads
3. Test tours page with filters
4. Test booking form
5. Test contact form
6. Test responsive design on mobile

### Cross-Origin (CORS) Test

```bash
# From your local machine browser console
fetch('http://YOUR_EC2_IP:3000/api/tours')
  .then(res => res.json())
  .then(data => console.log(data));
```

## Environment-Specific Configuration

### Development
```javascript
// frontend/js/config.js
BASE_URL: 'http://localhost:3000'
```

### Production
```javascript
// frontend/js/config.js
BASE_URL: 'http://YOUR_EC2_IP:3000'
// Or with domain:
BASE_URL: 'https://api.yourdomain.com'
```

## Monitoring and Maintenance

### PM2 Commands

```bash
# View logs
pm2 logs tourism-api

# View logs in real-time
pm2 logs tourism-api --lines 100

# Restart application
pm2 restart tourism-api

# Stop application
pm2 stop tourism-api

# View application metrics
pm2 monit
```

### Check Application Status

```bash
# Check if API is running
pm2 status

# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Troubleshooting

### Issue: Cannot connect to backend

**Solution**:
1. Check security group allows port 3000
2. Verify PM2 is running: `pm2 status`
3. Check firewall: `sudo ufw status`
4. View logs: `pm2 logs tourism-api`

### Issue: CORS errors in browser

**Solution**:
1. Verify `.env` has `CORS_ORIGIN=*`
2. Restart backend: `pm2 restart tourism-api`
3. Check browser console for exact error

### Issue: Frontend not updating

**Solution**:
1. Clear browser cache
2. Hard refresh (Ctrl+F5 or Cmd+Shift+R)
3. Verify files uploaded correctly: `ls -la /var/www/tourism-app/`

### Issue: 502 Bad Gateway (Nginx)

**Solution**:
1. Check backend is running: `pm2 status`
2. Test backend directly: `curl http://localhost:3000/health`
3. Check Nginx configuration: `sudo nginx -t`
4. View Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

### Issue: Out of memory

**Solution**:
1. Check memory usage: `free -h`
2. Restart PM2: `pm2 restart tourism-api`
3. Consider upgrading EC2 instance type
4. Configure swap space:
   ```bash
   sudo fallocate -l 1G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

## Security Best Practices

1. **Use HTTPS**: Set up SSL with Let's Encrypt
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

2. **Environment Variables**: Never commit `.env` files
3. **Firewall**: Only open necessary ports
4. **Updates**: Keep system and packages updated
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

5. **SSH**: Use key authentication only, disable password login

## Scaling Considerations

### For High Traffic:

1. **Load Balancer**: Use AWS ELB
2. **Multiple Instances**: Run backend on multiple EC2 instances
3. **Database**: Move to RDS or MongoDB Atlas
4. **CDN**: Use CloudFront for frontend
5. **Caching**: Implement Redis for API caching

## Backup

```bash
# Backup bookings data
cd /home/ubuntu/saif-project/backend/data
cp bookings.json bookings.backup.$(date +%Y%m%d).json

# Setup automated backup (cron job)
crontab -e
# Add: 0 2 * * * cp /home/ubuntu/saif-project/backend/data/bookings.json /home/ubuntu/backups/bookings.$(date +\%Y\%m\%d).json
```

## Support

For issues or questions:
- Check application logs: `pm2 logs tourism-api`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Review this documentation
- Check EC2 system logs in AWS Console

## Additional Resources

- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
