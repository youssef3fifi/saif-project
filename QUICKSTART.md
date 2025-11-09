# Quick Start Guide

Get the Tourism System running locally in under 5 minutes!

## Prerequisites

- Node.js 14+ installed
- npm package manager
- A code editor (VS Code recommended)

## Step 1: Clone the Repository

```bash
git clone https://github.com/youssef3fifi/saif-project.git
cd saif-project
```

## Step 2: Start the Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the server
npm start
```

The backend API will start on `http://localhost:3000`

**Test it:**
```bash
curl http://localhost:3000/health
# Should return: {"success":true,"message":"Tourism API is running",...}
```

## Step 3: Start the Frontend

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Serve the frontend (choose one option):

# Option 1: Using Python (if installed)
python3 -m http.server 8000

# Option 2: Using Node.js http-server
npx http-server -p 8000

# Option 3: Using VS Code Live Server extension
# Right-click on index.html and select "Open with Live Server"
```

The frontend will be accessible at `http://localhost:8000`

## Step 4: Explore the Application

Open your browser and visit:

- **Home Page**: http://localhost:8000/index.html
- **Tours Page**: http://localhost:8000/tours.html
- **Booking Page**: http://localhost:8000/booking.html?tourId=1
- **About/Contact**: http://localhost:8000/about.html

## API Endpoints

Test the API endpoints:

```bash
# Get all tours
curl http://localhost:3000/api/tours

# Get single tour
curl http://localhost:3000/api/tours/1

# Get destinations
curl http://localhost:3000/api/destinations

# Create a booking
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "tourId": 1,
    "date": "2025-12-25",
    "travelers": 2
  }'
```

## Features to Try

### On Home Page:
- ✅ Search for destinations in the hero section
- ✅ Browse featured tours
- ✅ Read customer testimonials
- ✅ Navigate using the header menu

### On Tours Page:
- ✅ Search tours by name or location
- ✅ Filter by price range
- ✅ Sort by price, rating, or name
- ✅ Click "Book Now" on any tour

### On Booking Page:
- ✅ Fill out the booking form
- ✅ Change number of travelers to see price update
- ✅ Submit a booking
- ✅ View booking confirmation

### On About/Contact Page:
- ✅ Read about the company
- ✅ Submit a contact form
- ✅ View contact information

## Troubleshooting

### Backend won't start
- Make sure port 3000 is not in use: `lsof -i :3000`
- Check Node.js version: `node --version` (should be 14+)
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Frontend not loading tours
- Check if backend is running: `curl http://localhost:3000/health`
- Open browser console (F12) to see any errors
- Verify API URL in `frontend/js/config.js` is set to `http://localhost:3000`

### CORS errors
- Backend has CORS enabled by default
- Check console for specific error
- Restart backend server

## Next Steps

Ready to deploy? Check out:
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete AWS EC2 deployment guide
- **[README.md](./README.md)** - Full documentation

## Quick Commands Reference

```bash
# Backend
cd backend
npm install          # Install dependencies
npm start           # Start server
npm run dev         # Start with nodemon (auto-reload)

# Test API
curl http://localhost:3000/health
curl http://localhost:3000/api/tours

# Frontend
cd frontend
python3 -m http.server 8000    # Serve with Python
npx http-server -p 8000        # Serve with Node.js
```

## Environment Configuration

For production deployment, create `backend/.env`:

```env
PORT=3000
NODE_ENV=production
CORS_ORIGIN=*
API_PREFIX=/api
```

For frontend, update `frontend/js/config.js`:

```javascript
const API_CONFIG = {
  BASE_URL: 'http://YOUR_EC2_IP:3000',  // Update for production
  API_PREFIX: '/api',
  // ...
};
```

## Development Tips

1. **Hot Reload Backend**: Use `npm run dev` in backend directory
2. **Live Reload Frontend**: Use VS Code Live Server extension
3. **Debug API**: Check logs in terminal where backend is running
4. **Debug Frontend**: Use browser DevTools (F12) Console tab

## Support

- Check [README.md](./README.md) for detailed documentation
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
- Check GitHub Issues for known problems

---

**Happy Coding! 🚀**
