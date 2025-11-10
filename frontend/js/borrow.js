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

// Load available books
async function loadAvailableBooks(search = '') {
  const loadingSpinner = document.getElementById('loadingSpinner');
  const availableBooksTable = document.getElementById('availableBooksTable');
  const availableBooksBody = document.getElementById('availableBooksBody');
  const noAvailableBooks = document.getElementById('noAvailableBooks');
  
  loadingSpinner.style.display = 'block';
  availableBooksTable.style.display = 'none';
  noAvailableBooks.classList.add('d-none');
  
  try {
    let url = `${API_URL}/api/books`;
    if (search) {
      url += `?search=${encodeURIComponent(search)}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      const availableBooks = data.data.filter(book => book.available > 0);
      displayAvailableBooks(availableBooks);
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

function displayAvailableBooks(books) {
  const availableBooksTable = document.getElementById('availableBooksTable');
  const availableBooksBody = document.getElementById('availableBooksBody');
  const noAvailableBooks = document.getElementById('noAvailableBooks');
  
  if (books.length === 0) {
    noAvailableBooks.classList.remove('d-none');
    return;
  }
  
  availableBooksTable.style.display = 'block';
  availableBooksBody.innerHTML = books.map(book => `
    <tr>
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td><span class="badge bg-primary">${book.category}</span></td>
      <td><span class="badge bg-success">${book.available}</span></td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="borrowBook('${book._id}', '${book.title}')">
          <i class="bi bi-book"></i> Borrow
        </button>
      </td>
    </tr>
  `).join('');
}

// Borrow a book
async function borrowBook(bookId, bookTitle) {
  if (!confirm(`Do you want to borrow "${bookTitle}"?`)) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/api/transactions/borrow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ bookId }),
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      showAlert('Book borrowed successfully! Due date: ' + new Date(data.data.dueDate).toLocaleDateString(), 'success');
      loadAvailableBooks();
      loadBorrowedBooks();
    } else {
      showAlert(data.message || 'Failed to borrow book', 'danger');
    }
  } catch (error) {
    console.error('Error borrowing book:', error);
    showAlert('An error occurred while borrowing book', 'danger');
  }
}

// Load borrowed books
async function loadBorrowedBooks() {
  const borrowedLoadingSpinner = document.getElementById('borrowedLoadingSpinner');
  const borrowedBooksTable = document.getElementById('borrowedBooksTable');
  const borrowedBooksBody = document.getElementById('borrowedBooksBody');
  const noBorrowedBooks = document.getElementById('noBorrowedBooks');
  
  borrowedLoadingSpinner.style.display = 'block';
  borrowedBooksTable.style.display = 'none';
  noBorrowedBooks.classList.add('d-none');
  
  try {
    const response = await fetch(`${API_URL}/api/transactions/user/${user._id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      const activeTransactions = data.data.filter(t => t.status === 'active');
      displayBorrowedBooks(activeTransactions);
    } else {
      showAlert(data.message || 'Failed to load borrowed books', 'danger');
    }
  } catch (error) {
    console.error('Error loading borrowed books:', error);
    showAlert('An error occurred while loading borrowed books', 'danger');
  } finally {
    borrowedLoadingSpinner.style.display = 'none';
  }
}

function displayBorrowedBooks(transactions) {
  const borrowedBooksTable = document.getElementById('borrowedBooksTable');
  const borrowedBooksBody = document.getElementById('borrowedBooksBody');
  const noBorrowedBooks = document.getElementById('noBorrowedBooks');
  
  if (transactions.length === 0) {
    noBorrowedBooks.classList.remove('d-none');
    return;
  }
  
  borrowedBooksTable.style.display = 'block';
  borrowedBooksBody.innerHTML = transactions.map(transaction => {
    const dueDate = new Date(transaction.dueDate);
    const isOverdue = dueDate < new Date();
    const statusClass = isOverdue ? 'danger' : 'success';
    const statusText = isOverdue ? 'Overdue' : 'Active';
    
    return `
      <tr>
        <td>${transaction.book.title}</td>
        <td>${transaction.book.author}</td>
        <td>${new Date(transaction.borrowDate).toLocaleDateString()}</td>
        <td>${dueDate.toLocaleDateString()}</td>
        <td><span class="badge bg-${statusClass}">${statusText}</span></td>
        <td>
          <button class="btn btn-sm btn-success" onclick="returnBook('${transaction.book._id}', '${transaction.book.title}')">
            <i class="bi bi-arrow-return-left"></i> Return
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// Return a book
async function returnBook(bookId, bookTitle) {
  if (!confirm(`Do you want to return "${bookTitle}"?`)) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/api/transactions/return`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ bookId }),
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      showAlert('Book returned successfully!', 'success');
      loadAvailableBooks();
      loadBorrowedBooks();
    } else {
      showAlert(data.message || 'Failed to return book', 'danger');
    }
  } catch (error) {
    console.error('Error returning book:', error);
    showAlert('An error occurred while returning book', 'danger');
  }
}

// Search functionality
document.getElementById('searchBtn').addEventListener('click', () => {
  const search = document.getElementById('searchInput').value;
  loadAvailableBooks(search);
});

document.getElementById('searchInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('searchBtn').click();
  }
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

// Load data on page load
loadAvailableBooks();
loadBorrowedBooks();
