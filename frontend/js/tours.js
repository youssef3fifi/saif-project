/**
 * Tours page JavaScript
 */

let allTours = [];
let filteredTours = [];

// Load tours on page load
document.addEventListener('DOMContentLoaded', async () => {
  await loadTours();
  setupFilters();
  setupSearch();
});

// Load tours from API
async function loadTours() {
  showLoading('tours-container');
  
  try {
    const response = await fetchAPI(API_CONFIG.TOURS_URL);
    allTours = response.data;
    filteredTours = [...allTours];
    displayTours(filteredTours);
  } catch (error) {
    showError('tours-container', 'Failed to load tours. Please try again later.');
    console.error('Error loading tours:', error);
  }
}

// Display tours
function displayTours(tours) {
  const container = document.getElementById('tours-container');
  
  if (tours.length === 0) {
    container.innerHTML = '<div class="no-results"><p>No tours found matching your criteria.</p></div>';
    return;
  }

  container.innerHTML = tours.map(tour => `
    <div class="tour-card">
      <div class="tour-image">
        <img src="${tour.image}" alt="${tour.name}" loading="lazy">
        <div class="tour-badge">${tour.duration}</div>
      </div>
      <div class="tour-content">
        <div class="tour-header">
          <h3>${tour.name}</h3>
          <div class="tour-rating">
            <i class="fas fa-star"></i>
            <span>${tour.rating}</span>
            <span class="reviews">(${tour.reviews} reviews)</span>
          </div>
        </div>
        <div class="tour-location">
          <i class="fas fa-map-marker-alt"></i>
          <span>${tour.location}</span>
        </div>
        <p class="tour-description">${tour.description.substring(0, 120)}...</p>
        <div class="tour-highlights">
          ${tour.highlights.slice(0, 3).map(h => `<span class="highlight-tag">${h}</span>`).join('')}
        </div>
        <div class="tour-footer">
          <div class="tour-price">
            <span class="price-label">From</span>
            <span class="price-value">${formatPrice(tour.price)}</span>
            <span class="price-per">per person</span>
          </div>
          <a href="booking.html?tourId=${tour.id}" class="btn btn-primary">Book Now</a>
        </div>
      </div>
    </div>
  `).join('');
}

// Setup filters
function setupFilters() {
  const priceFilter = document.getElementById('price-filter');
  const sortFilter = document.getElementById('sort-filter');

  if (priceFilter) {
    priceFilter.addEventListener('change', applyFilters);
  }

  if (sortFilter) {
    sortFilter.addEventListener('change', applyFilters);
  }
}

// Setup search
function setupSearch() {
  const searchInput = document.getElementById('search-tours');
  const searchBtn = document.getElementById('search-btn');

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', applyFilters);
  }
}

// Apply all filters
function applyFilters() {
  let tours = [...allTours];
  
  // Search filter
  const searchTerm = document.getElementById('search-tours')?.value.toLowerCase() || '';
  if (searchTerm) {
    tours = tours.filter(tour => 
      tour.name.toLowerCase().includes(searchTerm) ||
      tour.location.toLowerCase().includes(searchTerm) ||
      tour.description.toLowerCase().includes(searchTerm)
    );
  }

  // Price filter
  const priceRange = document.getElementById('price-filter')?.value;
  if (priceRange && priceRange !== 'all') {
    const [min, max] = priceRange.split('-').map(Number);
    tours = tours.filter(tour => {
      if (max) {
        return tour.price >= min && tour.price <= max;
      } else {
        return tour.price >= min;
      }
    });
  }

  // Sort
  const sortBy = document.getElementById('sort-filter')?.value;
  if (sortBy === 'price-asc') {
    tours.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    tours.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    tours.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'name') {
    tours.sort((a, b) => a.name.localeCompare(b.name));
  }

  filteredTours = tours;
  displayTours(filteredTours);
  
  // Update results count
  const resultsCount = document.getElementById('results-count');
  if (resultsCount) {
    resultsCount.textContent = `${tours.length} tour${tours.length !== 1 ? 's' : ''} found`;
  }
}

// Reset filters
function resetFilters() {
  document.getElementById('search-tours').value = '';
  document.getElementById('price-filter').value = 'all';
  document.getElementById('sort-filter').value = 'default';
  filteredTours = [...allTours];
  displayTours(filteredTours);
}

window.resetFilters = resetFilters;
