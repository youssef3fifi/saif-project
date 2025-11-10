/**
 * API Configuration
 * For local development: use http://localhost:3000
 * For EC2 deployment: update this to http://YOUR_EC2_IP:3000
 */

const API_CONFIG = {
  // Default to localhost, but can be overridden via environment variable or direct edit
  BASE_URL: window.API_URL || 'http://localhost:3000',
  API_PREFIX: '/api',
  
  get TOURS_URL() {
    return `${this.BASE_URL}${this.API_PREFIX}/tours`;
  },
  
  get DESTINATIONS_URL() {
    return `${this.BASE_URL}${this.API_PREFIX}/destinations`;
  },
  
  get BOOKINGS_URL() {
    return `${this.BASE_URL}${this.API_PREFIX}/bookings`;
  },
  
  get CONTACT_URL() {
    return `${this.BASE_URL}${this.API_PREFIX}/contact`;
  }
};

// Export for use in other files
window.API_CONFIG = API_CONFIG;
