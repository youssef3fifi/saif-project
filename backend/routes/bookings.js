const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { validateBooking, validateContact } = require('../middleware/validate');

const bookingsDataPath = path.join(__dirname, '../data/bookings.json');
const toursDataPath = path.join(__dirname, '../data/tours.json');

/**
 * POST /api/bookings
 * Create a new booking
 */
router.post('/', validateBooking, async (req, res, next) => {
  try {
    const { name, email, phone, tourId, date, travelers, specialRequests } = req.body;

    // Verify tour exists
    const toursData = await fs.readFile(toursDataPath, 'utf8');
    const tours = JSON.parse(toursData);
    const tour = tours.find(t => t.id === parseInt(tourId));

    if (!tour) {
      const error = new Error('Tour not found');
      error.statusCode = 404;
      throw error;
    }

    // Calculate total price
    const totalPrice = tour.price * parseInt(travelers);

    // Read existing bookings
    const bookingsData = await fs.readFile(bookingsDataPath, 'utf8');
    const bookings = JSON.parse(bookingsData);

    // Create new booking
    const newBooking = {
      id: bookings.length > 0 ? Math.max(...bookings.map(b => b.id)) + 1 : 1,
      name,
      email,
      phone,
      tourId: parseInt(tourId),
      tourName: tour.name,
      date,
      travelers: parseInt(travelers),
      totalPrice,
      specialRequests: specialRequests || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    bookings.push(newBooking);

    // Save to file
    await fs.writeFile(bookingsDataPath, JSON.stringify(bookings, null, 2));

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: newBooking
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/contact
 * Handle contact form submission
 */
router.post('/contact', validateContact, async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    // In a real application, this would send an email or save to database
    console.log('Contact form submission:', { name, email, subject, message });

    res.json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
