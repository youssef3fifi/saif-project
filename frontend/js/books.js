// Check authentication and authorization
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user) {
  window.location.href = 'index.html';
}

if (user.role !== 'admin') {
  alert('Access denied. Admin only.');
  window.location.href = 'dashboard.html';
}

// Update user info in navbar
document.getElementById('userName').textContent = user.name;
document.getElementById('userRole').textContent = user.role;

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
});

// Load books
async function loadBooks() {
  const loadingSpinner = document.getElementById('loadingSpinner');
  const tableBody = document.getElementById('booksTableBody');
  
  loadingSpinner.style.display = 'block';
  tableBody.innerHTML = '';
  
  try {
    const response = await fetch(`${API_URL}/api/books`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      displayBooks(data.data);
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
  const tableBody = document.getElementById('booksTableBody');
  
  if (books.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No books found</td></tr>';
    return;
  }
  
  tableBody.innerHTML = books.map(book => `
    <tr>
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>${book.isbn}</td>
      <td><span class="badge bg-primary">${book.category}</span></td>
      <td>${book.quantity}</td>
      <td>
        <span class="badge ${book.available > 0 ? 'bg-success' : 'bg-danger'}">
          ${book.available}
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-info" onclick="editBook('${book._id}')">
          <i class="bi bi-pencil"></i> Edit
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteBook('${book._id}', '${book.title}')">
          <i class="bi bi-trash"></i> Delete
        </button>
      </td>
    </tr>
  `).join('');
}

// Add book
document.getElementById('saveBookBtn').addEventListener('click', async () => {
  const title = document.getElementById('title').value;
  const author = document.getElementById('author').value;
  const isbn = document.getElementById('isbn').value;
  const category = document.getElementById('category').value;
  const description = document.getElementById('description').value;
  const quantity = parseInt(document.getElementById('quantity').value);
  
  if (!title || !author || !isbn || !category || !description || !quantity) {
    showAlert('Please fill in all fields', 'warning');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/api/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        author,
        isbn,
        category,
        description,
        quantity,
      }),
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      showAlert('Book added successfully', 'success');
      document.getElementById('addBookForm').reset();
      bootstrap.Modal.getInstance(document.getElementById('addBookModal')).hide();
      loadBooks();
    } else {
      showAlert(data.message || 'Failed to add book', 'danger');
    }
  } catch (error) {
    console.error('Error adding book:', error);
    showAlert('An error occurred while adding book', 'danger');
  }
});

// Edit book
let currentBooks = [];

async function editBook(bookId) {
  try {
    const response = await fetch(`${API_URL}/api/books/${bookId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      const book = data.data;
      document.getElementById('editBookId').value = book._id;
      document.getElementById('editTitle').value = book.title;
      document.getElementById('editAuthor').value = book.author;
      document.getElementById('editIsbn').value = book.isbn;
      document.getElementById('editCategory').value = book.category;
      document.getElementById('editDescription').value = book.description;
      document.getElementById('editQuantity').value = book.quantity;
      document.getElementById('editAvailable').value = book.available;
      
      new bootstrap.Modal(document.getElementById('editBookModal')).show();
    }
  } catch (error) {
    console.error('Error loading book:', error);
    showAlert('An error occurred while loading book details', 'danger');
  }
}

// Update book
document.getElementById('updateBookBtn').addEventListener('click', async () => {
  const bookId = document.getElementById('editBookId').value;
  const title = document.getElementById('editTitle').value;
  const author = document.getElementById('editAuthor').value;
  const isbn = document.getElementById('editIsbn').value;
  const category = document.getElementById('editCategory').value;
  const description = document.getElementById('editDescription').value;
  const quantity = parseInt(document.getElementById('editQuantity').value);
  const available = parseInt(document.getElementById('editAvailable').value);
  
  try {
    const response = await fetch(`${API_URL}/api/books/${bookId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        author,
        isbn,
        category,
        description,
        quantity,
        available,
      }),
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      showAlert('Book updated successfully', 'success');
      bootstrap.Modal.getInstance(document.getElementById('editBookModal')).hide();
      loadBooks();
    } else {
      showAlert(data.message || 'Failed to update book', 'danger');
    }
  } catch (error) {
    console.error('Error updating book:', error);
    showAlert('An error occurred while updating book', 'danger');
  }
});

// Delete book
async function deleteBook(bookId, bookTitle) {
  if (!confirm(`Are you sure you want to delete "${bookTitle}"?`)) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/api/books/${bookId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      showAlert('Book deleted successfully', 'success');
      loadBooks();
    } else {
      showAlert(data.message || 'Failed to delete book', 'danger');
    }
  } catch (error) {
    console.error('Error deleting book:', error);
    showAlert('An error occurred while deleting book', 'danger');
  }
}

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
