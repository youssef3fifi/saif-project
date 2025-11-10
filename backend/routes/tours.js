const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const toursDataPath = path.join(__dirname, '../data/tours.json');

/**
 * GET /api/tours
 * Get all tours with optional filtering
 */
router.get('/', async (req, res, next) => {
  try {
    const data = await fs.readFile(toursDataPath, 'utf8');
    let tours = JSON.parse(data);

    // Filter by location
    if (req.query.location) {
      tours = tours.filter(tour => 
        tour.location.toLowerCase().includes(req.query.location.toLowerCase())
      );
    }

    // Filter by max price
    if (req.query.maxPrice) {
      const maxPrice = parseFloat(req.query.maxPrice);
      tours = tours.filter(tour => tour.price <= maxPrice);
    }

    // Filter by min price
    if (req.query.minPrice) {
      const minPrice = parseFloat(req.query.minPrice);
      tours = tours.filter(tour => tour.price >= minPrice);
    }

    // Filter by duration
    if (req.query.duration) {
      tours = tours.filter(tour => 
        tour.duration.toLowerCase().includes(req.query.duration.toLowerCase())
      );
    }

    // Search by name or description
    if (req.query.search) {
      const searchTerm = req.query.search.toLowerCase();
      tours = tours.filter(tour => 
        tour.name.toLowerCase().includes(searchTerm) ||
        tour.description.toLowerCase().includes(searchTerm) ||
        tour.location.toLowerCase().includes(searchTerm)
      );
    }

    // Sort by price
    if (req.query.sort === 'price-asc') {
      tours.sort((a, b) => a.price - b.price);
    } else if (req.query.sort === 'price-desc') {
      tours.sort((a, b) => b.price - a.price);
    } else if (req.query.sort === 'rating') {
      tours.sort((a, b) => b.rating - a.rating);
    }

    res.json({
      success: true,
      count: tours.length,
      data: tours
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tours/:id
 * Get single tour by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const data = await fs.readFile(toursDataPath, 'utf8');
    const tours = JSON.parse(data);
    const tour = tours.find(t => t.id === parseInt(req.params.id));

    if (!tour) {
      const error = new Error('Tour not found');
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      data: tour
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/destinations
 * Get unique destinations
 */
router.get('/destinations/list', async (req, res, next) => {
  try {
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

module.exports = router;
