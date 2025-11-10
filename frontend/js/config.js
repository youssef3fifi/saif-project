// API Configuration
// For local development, use localhost
// For AWS EC2 deployment, replace with your EC2 public IP
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : `http://${window.location.hostname}:5000`;

// Alternative: You can also read from a custom meta tag in HTML
// Example: <meta name="api-url" content="http://YOUR_EC2_IP:5000">
const apiMetaTag = document.querySelector('meta[name="api-url"]');
if (apiMetaTag) {
  API_URL = apiMetaTag.content;
}

console.log('API URL:', API_URL);
