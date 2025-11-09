const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const toursRoutes = require('./routes/tours');
const bookingsRoutes = require('./routes/bookings');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Tourism API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
const apiPrefix = process.env.API_PREFIX || '/api';
app.use(`${apiPrefix}/tours`, toursRoutes);
app.use(`${apiPrefix}/bookings`, bookingsRoutes);

// Destinations endpoint (alias for tours destinations)
app.get(`${apiPrefix}/destinations`, async (req, res, next) => {
  try {
    const fs = require('fs').promises;
    const toursDataPath = path.join(__dirname, 'data/tours.json');
    const data = await fs.readFile(toursDataPath, 'utf8');
    const tours = JSON.parse(data);
    
    const destinations = [...new Set(tours.map(tour => tour.location))];

    res.json({
      success: true,
      count: destinations.length,
      data: destinations
    });
  } catch (error) {
    next(error);
  }
});

// Contact endpoint
app.post(`${apiPrefix}/contact`, bookingsRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Tourism API',
    version: '1.0.0',
    endpoints: {
      tours: `${apiPrefix}/tours`,
      tour: `${apiPrefix}/tours/:id`,
      destinations: `${apiPrefix}/destinations`,
      bookings: `${apiPrefix}/bookings`,
      contact: `${apiPrefix}/contact`,
      health: '/health'
    }
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Tourism API Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || '*'}`);
  console.log(`📡 API Prefix: ${apiPrefix}`);
});

module.exports = app;
