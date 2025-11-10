# Wanderlust Travel - Full-Stack Tourism System

A complete, production-ready tourism/travel booking system with a modern frontend and RESTful API backend, designed for AWS EC2 deployment.

![Tourism System](https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=400&fit=crop)

## 🌟 Features

### Frontend
- **4 Professional Pages**:
  - Home page with hero section, featured tours, and testimonials
  - Tours/Destinations page with advanced filtering and search
  - Booking page with dynamic form and price calculation
  - About/Contact page with contact form
- **Responsive Design**: Mobile-first, works on all devices
- **Modern UI**: Clean, professional design with smooth animations
- **Real-time Search**: Filter tours by price, location, and more
- **Interactive Forms**: Client-side validation and loading states

### Backend (Node.js/Express)
- **RESTful API**: Clean, well-documented endpoints
- **CRUD Operations**: Full booking management
- **Data Validation**: Input validation middleware
- **Error Handling**: Comprehensive error handling system
- **CORS Support**: Configured for cross-origin requests
- **JSON Storage**: File-based data storage (easily upgradable to database)

### API Endpoints
```
GET    /health                - Health check
GET    /api/tours             - Get all tours (with filtering)
GET    /api/tours/:id         - Get single tour
GET    /api/destinations      - Get unique destinations
POST   /api/bookings          - Create booking
POST   /api/contact           - Contact form submission
```

## 🚀 Quick Start

### Local Development

#### Prerequisites
- Node.js 14+ installed
- npm or yarn package manager

#### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

The backend will be running on `http://localhost:3000`

#### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Update API configuration if needed
# Edit js/config.js to point to your backend URL

# Serve frontend (using any static server)
# Option 1: Using Python
python -m http.server 8000

# Option 2: Using Node.js http-server
npx http-server -p 8000

# Option 3: Using VS Code Live Server extension
```

The frontend will be accessible at `http://localhost:8000`

### Testing the API

```bash
# Health check
curl http://localhost:3000/health

# Get all tours
curl http://localhost:3000/api/tours

# Get single tour
curl http://localhost:3000/api/tours/1

# Create booking
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "tourId": 1,
    "date": "2024-12-25",
    "travelers": 2
  }'
```

## 📁 Project Structure

```
saif-project/
├── frontend/
│   ├── index.html              # Home page
│   ├── tours.html              # Tours listing page
│   ├── booking.html            # Booking form page
│   ├── about.html              # About & Contact page
│   ├── css/
│   │   └── style.css           # Main stylesheet
│   └── js/
│       ├── config.js           # API configuration
│       ├── main.js             # Common utilities
│       ├── tours.js            # Tours page logic
│       └── booking.js          # Booking page logic
│
├── backend/
│   ├── server.js               # Express server
│   ├── package.json            # Dependencies
│   ├── .env.example            # Environment variables template
│   ├── routes/
│   │   ├── tours.js            # Tours endpoints
│   │   └── bookings.js         # Bookings endpoints
│   ├── middleware/
│   │   ├── errorHandler.js     # Error handling
│   │   └── validate.js         # Input validation
│   └── data/
│       ├── tours.json          # Tours data
│       └── bookings.json       # Bookings storage
│
├── deployment/
│   ├── ecosystem.config.js     # PM2 configuration
│   └── nginx.conf              # Nginx configuration
│
├── DEPLOYMENT.md               # Detailed deployment guide
└── README.md                   # This file
```

## 🌐 AWS Deployment

### Prerequisites
- AWS Account
- EC2 instance (t2.micro or better)
- Security group configured (ports 22, 3000, 80, 443)

### Quick Deployment Steps

1. **Launch EC2 Instance** (Ubuntu 20.04 LTS)

2. **Install Dependencies**:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2
```

3. **Clone and Setup**:
```bash
git clone https://github.com/youssef3fifi/saif-project.git
cd saif-project/backend
npm install
cp .env.example .env
```

4. **Configure Environment**:
```bash
nano .env
# Set: CORS_ORIGIN=*
```

5. **Start with PM2**:
```bash
cd /home/ubuntu/saif-project
pm2 start deployment/ecosystem.config.js
pm2 save
pm2 startup
```

6. **Update Frontend Configuration**:
Edit `frontend/js/config.js`:
```javascript
BASE_URL: 'http://YOUR_EC2_PUBLIC_IP:3000'
```

7. **Deploy Frontend** (Choose one):
   - **Option A**: Upload to S3 bucket
   - **Option B**: Serve with Nginx on same EC2

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🔧 Configuration

### Backend Configuration (.env)

```env
# Server
PORT=3000
NODE_ENV=production

# CORS
CORS_ORIGIN=*  # Change to specific domain in production

# API
API_PREFIX=/api
```

### Frontend Configuration (js/config.js)

```javascript
const API_CONFIG = {
  BASE_URL: 'http://localhost:3000',  // Change for production
  API_PREFIX: '/api',
  // ... endpoints
};
```

## 🎨 Customization

### Adding Tours
Edit `backend/data/tours.json` to add or modify tours:
```json
{
  "id": 11,
  "name": "Your Tour Name",
  "location": "City, Country",
  "duration": "X days",
  "price": 1000,
  "image": "https://...",
  "description": "...",
  ...
}
```

### Styling
Modify `frontend/css/style.css` to customize colors, fonts, and layout:
```css
:root {
  --primary-color: #2563eb;  /* Change primary color */
  --secondary-color: #f59e0b;  /* Change secondary color */
  ...
}
```

## 📱 Responsive Design

The application is fully responsive and tested on:
- Desktop (1920px+)
- Laptop (1024px - 1920px)
- Tablet (768px - 1024px)
- Mobile (320px - 768px)

## 🔒 Security Features

- Input validation on all forms
- CORS configuration
- Environment variable support
- XSS protection
- SQL injection prevention (when using database)

## 🚀 Performance

- Lazy loading images
- Minified CSS (in production)
- Efficient API queries
- Client-side caching
- Optimized assets

## 🧪 Testing

### Manual Testing Checklist

**Backend**:
- [ ] API endpoints respond correctly
- [ ] Validation works for invalid inputs
- [ ] CORS headers present
- [ ] Error handling works

**Frontend**:
- [ ] All pages load correctly
- [ ] Forms submit successfully
- [ ] Filters work on tours page
- [ ] Booking flow completes
- [ ] Responsive on mobile

### API Testing with cURL

See examples in [Quick Start](#quick-start) section.

## 📊 Sample Data

The system comes with 10 pre-configured tour packages:
1. Egyptian Pyramids Adventure
2. Santorini Greek Islands
3. Tokyo Cultural Experience
4. Paris Romantic Getaway
5. Dubai Luxury Tour
6. Bali Tropical Paradise
7. Swiss Alps Adventure
8. Amazon Rainforest Expedition
9. New York City Explorer
10. Morocco Desert Adventure

## 🤝 Contributing

This is a demonstration project. Feel free to fork and customize for your needs.

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🆘 Support

For deployment issues:
1. Check [DEPLOYMENT.md](./DEPLOYMENT.md)
2. Review application logs: `pm2 logs tourism-api`
3. Check browser console for frontend errors
4. Verify API endpoint in frontend config

## 📧 Contact

For questions or support, please refer to the contact form in the application or check the deployment documentation.

---

**Built with ❤️ using Node.js, Express, and vanilla JavaScript**