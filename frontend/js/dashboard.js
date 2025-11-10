// Check authentication
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user) {
  window.location.href = 'index.html';
}

// Update user info in navbar
document.getElementById('userName').textContent = user.name;
document.getElementById('userRole').textContent = user.role;

// Show/hide admin menu items
if (user.role === 'admin') {
  document.getElementById('booksNavItem').style.display = 'block';
} else {
  document.getElementById('booksNavItem').style.display = 'none';
}

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
});

// Load books on page load
let allBooks = [];

async function loadBooks(search = '', category = '') {
  const loadingSpinner = document.getElementById('loadingSpinner');
  const booksGrid = document.getElementById('booksGrid');
  const noBooksMessage = document.getElementById('noBooksMessage');
  
  loadingSpinner.style.display = 'block';
  booksGrid.innerHTML = '';
  noBooksMessage.classList.add('d-none');
  
  try {
    let url = `${API_URL}/api/books?`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (category) url += `category=${encodeURIComponent(category)}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok && data.success) {
      allBooks = data.data;
      displayBooks(allBooks);
    } else {
      showAlert(data.message || 'Failed to load books', 'danger');
    }
  } catch (error) {
    console.error('Error loading books:', error);
    showAlert('An error occurred while loading books', 'danger');
  } finally {
    loadingSpinner.style.display = 'none';
  }
}

function displayBooks(books) {
  const booksGrid = document.getElementById('booksGrid');
  const noBooksMessage = document.getElementById('noBooksMessage');
  
  if (books.length === 0) {
    noBooksMessage.classList.remove('d-none');
    return;
  }
  
  booksGrid.innerHTML = books.map(book => `
    <div class="col">
      <div class="card book-card h-100" onclick="showBookDetails('${book._id}')">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h5 class="card-title">${book.title}</h5>
            <span class="badge bg-primary">${book.category}</span>
          </div>
          <p class="card-text">
            <i class="bi bi-person"></i> <strong>Author:</strong> ${book.author}
          </p>
          <p class="card-text">
            <i class="bi bi-upc"></i> <strong>ISBN:</strong> ${book.isbn}
          </p>
          <p class="book-description">${book.description}</p>
          <div class="book-footer">
            <div>
              <span class="badge ${book.available > 0 ? 'bg-success' : 'bg-danger'}">
                ${book.available > 0 ? 'Available' : 'Not Available'}
              </span>
            </div>
            <div>
              <small class="text-muted">
                ${book.available}/${book.quantity} available
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function showBookDetails(bookId) {
  const book = allBooks.find(b => b._id === bookId);
  if (!book) return;
  
  const modal = new bootstrap.Modal(document.getElementById('bookDetailModal'));
  document.getElementById('bookDetailTitle').textContent = book.title;
  document.getElementById('bookDetailBody').innerHTML = `
    <div class="row">
      <div class="col-md-6">
        <p><strong>Author:</strong> ${book.author}</p>
        <p><strong>ISBN:</strong> ${book.isbn}</p>
        <p><strong>Category:</strong> <span class="badge bg-primary">${book.category}</span></p>
      </div>
      <div class="col-md-6">
        <p><strong>Total Quantity:</strong> ${book.quantity}</p>
        <p><strong>Available:</strong> ${book.available}</p>
        <p><strong>Status:</strong> 
          <span class="badge ${book.available > 0 ? 'bg-success' : 'bg-danger'}">
            ${book.available > 0 ? 'Available' : 'Not Available'}
          </span>
        </p>
      </div>
    </div>
    <hr>
    <h6>Description</h6>
    <p>${book.description}</p>
  `;
  modal.show();
}

// Search functionality
document.getElementById('searchBtn').addEventListener('click', () => {
  const search = document.getElementById('searchInput').value;
  const category = document.getElementById('categoryFilter').value;
  loadBooks(search, category);
});

// Enter key on search input
document.getElementById('searchInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('searchBtn').click();
  }
});

// Category filter change
document.getElementById('categoryFilter').addEventListener('change', () => {
  const search = document.getElementById('searchInput').value;
  const category = document.getElementById('categoryFilter').value;
  loadBooks(search, category);
});

// Show alert message
function showAlert(message, type) {
  const alertContainer = document.getElementById('alertContainer');
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} alert-dismissible fade show`;
  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  alertContainer.innerHTML = '';
  alertContainer.appendChild(alert);
  
  setTimeout(() => {
    alert.classList.remove('show');
    setTimeout(() => alert.remove(), 150);
  }, 5000);
}

// Load books on page load
loadBooks();
