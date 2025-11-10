/**
 * Booking page JavaScript
 */

let selectedTour = null;

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const tourId = urlParams.get('tourId');

  if (tourId) {
    await loadTourDetails(tourId);
    setupBookingForm();
  } else {
    document.getElementById('booking-container').innerHTML = `
      <div class="error-message">
        <p>No tour selected. Please <a href="tours.html">browse tours</a> and select one to book.</p>
      </div>
    `;
  }
});

// Load tour details
async function loadTourDetails(tourId) {
  try {
    const response = await fetchAPI(`${API_CONFIG.TOURS_URL}/${tourId}`);
    selectedTour = response.data;
    displayTourSummary(selectedTour);
  } catch (error) {
    showError('tour-summary', 'Failed to load tour details. Please try again.');
    console.error('Error loading tour:', error);
  }
}

// Display tour summary
function displayTourSummary(tour) {
  const summaryContainer = document.getElementById('tour-summary');
  summaryContainer.innerHTML = `
    <div class="tour-summary-card">
      <img src="${tour.image}" alt="${tour.name}" class="tour-summary-image">
      <div class="tour-summary-content">
        <h2>${tour.name}</h2>
        <div class="tour-info-item">
          <i class="fas fa-map-marker-alt"></i>
          <span>${tour.location}</span>
        </div>
        <div class="tour-info-item">
          <i class="fas fa-clock"></i>
          <span>${tour.duration}</span>
        </div>
        <div class="tour-info-item">
          <i class="fas fa-users"></i>
          <span>Max ${tour.maxGroupSize} people</span>
        </div>
        <div class="tour-info-item">
          <i class="fas fa-star"></i>
          <span>${tour.rating} (${tour.reviews} reviews)</span>
        </div>
        <div class="price-per-person">
          <span class="label">Price per person:</span>
          <span class="price">${formatPrice(tour.price)}</span>
        </div>
      </div>
    </div>
  `;
}

// Setup booking form
function setupBookingForm() {
  const form = document.getElementById('booking-form');
  const travelersInput = document.getElementById('travelers');
  const dateInput = document.getElementById('date');

  // Set minimum date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateInput.min = tomorrow.toISOString().split('T')[0];

  // Update price calculation when travelers change
  if (travelersInput) {
    travelersInput.addEventListener('input', updateTotalPrice);
  }

  // Form submission
  if (form) {
    form.addEventListener('submit', handleBookingSubmit);
  }
}

// Update total price
function updateTotalPrice() {
  const travelers = parseInt(document.getElementById('travelers').value) || 1;
  const totalPriceElement = document.getElementById('total-price');
  
  if (selectedTour && totalPriceElement) {
    const totalPrice = selectedTour.price * travelers;
    totalPriceElement.textContent = formatPrice(totalPrice);
  }
}

// Handle booking form submission
async function handleBookingSubmit(e) {
  e.preventDefault();

  const submitBtn = document.getElementById('submit-booking');
  const originalBtnText = submitBtn.innerHTML;
  
  // Disable button and show loading
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    tourId: selectedTour.id,
    date: document.getElementById('date').value,
    travelers: parseInt(document.getElementById('travelers').value),
    specialRequests: document.getElementById('special-requests').value
  };

  try {
    const response = await fetchAPI(API_CONFIG.BOOKINGS_URL, {
      method: 'POST',
      body: JSON.stringify(formData)
    });

    // Show success message
    showBookingSuccess(response.data);
  } catch (error) {
    showToast(error.message || 'Failed to create booking. Please try again.', 'error');
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  }
}

// Show booking success
function showBookingSuccess(booking) {
  const container = document.getElementById('booking-container');
  container.innerHTML = `
    <div class="booking-success">
      <div class="success-icon">
        <i class="fas fa-check-circle"></i>
      </div>
      <h2>Booking Confirmed!</h2>
      <p>Thank you for your booking. We've sent a confirmation email to <strong>${booking.email}</strong></p>
      
      <div class="booking-details">
        <h3>Booking Details</h3>
        <div class="detail-row">
          <span class="label">Booking ID:</span>
          <span class="value">#${booking.id}</span>
        </div>
        <div class="detail-row">
          <span class="label">Tour:</span>
          <span class="value">${booking.tourName}</span>
        </div>
        <div class="detail-row">
          <span class="label">Date:</span>
          <span class="value">${formatDate(booking.date)}</span>
        </div>
        <div class="detail-row">
          <span class="label">Travelers:</span>
          <span class="value">${booking.travelers}</span>
        </div>
        <div class="detail-row">
          <span class="label">Total Price:</span>
          <span class="value total">${formatPrice(booking.totalPrice)}</span>
        </div>
      </div>

      <div class="success-actions">
        <a href="index.html" class="btn btn-primary">Back to Home</a>
        <a href="tours.html" class="btn btn-secondary">Browse More Tours</a>
      </div>
    </div>
  `;
}
