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

// Load user profile
async function loadUserProfile() {
  try {
    const response = await fetch(`${API_URL}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      const profile = data.data;
      document.getElementById('profileName').textContent = profile.name;
      document.getElementById('profileEmail').textContent = profile.email;
      document.getElementById('profileRole').textContent = profile.role.charAt(0).toUpperCase() + profile.role.slice(1);
      document.getElementById('profileJoinDate').textContent = new Date(profile.createdAt).toLocaleDateString();
      document.getElementById('borrowedCount').textContent = profile.borrowedBooks.length;
      
      displayBorrowedBooks(profile.borrowedBooks);
    } else {
      showAlert(data.message || 'Failed to load profile', 'danger');
    }
  } catch (error) {
    console.error('Error loading profile:', error);
    showAlert('An error occurred while loading profile', 'danger');
  }
}

function displayBorrowedBooks(borrowedBooks) {
  const loadingSpinner = document.getElementById('loadingSpinner');
  const borrowedBooksList = document.getElementById('borrowedBooksList');
  const noBorrowedBooks = document.getElementById('noBorrowedBooks');
  
  loadingSpinner.style.display = 'none';
  
  if (borrowedBooks.length === 0) {
    noBorrowedBooks.classList.remove('d-none');
    return;
  }
  
  borrowedBooksList.innerHTML = borrowedBooks.map(item => {
    const dueDate = new Date(item.dueDate);
    const isOverdue = dueDate < new Date();
    const statusClass = isOverdue ? 'danger' : 'success';
    const statusText = isOverdue ? 'Overdue' : 'Active';
    
    return `
      <div class="borrowed-book-item">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h6>${item.book.title}</h6>
            <p class="mb-1 text-muted">
              <i class="bi bi-person"></i> ${item.book.author}
            </p>
            <p class="mb-1 text-muted">
              <small><i class="bi bi-calendar"></i> Borrowed: ${new Date(item.borrowDate).toLocaleDateString()}</small>
            </p>
            <p class="mb-0 text-muted">
              <small><i class="bi bi-calendar-check"></i> Due: ${dueDate.toLocaleDateString()}</small>
            </p>
          </div>
          <span class="badge bg-${statusClass}">${statusText}</span>
        </div>
      </div>
    `;
  }).join('');
}

// Load transaction history
async function loadTransactionHistory() {
  const transactionLoadingSpinner = document.getElementById('transactionLoadingSpinner');
  const transactionsTable = document.getElementById('transactionsTable');
  const transactionsBody = document.getElementById('transactionsBody');
  const noTransactions = document.getElementById('noTransactions');
  
  try {
    const response = await fetch(`${API_URL}/api/transactions/user/${user._id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      transactionLoadingSpinner.style.display = 'none';
      
      if (data.data.length === 0) {
        noTransactions.classList.remove('d-none');
        return;
      }
      
      transactionsTable.style.display = 'block';
      transactionsBody.innerHTML = data.data.map(transaction => {
        let statusBadge = '';
        if (transaction.status === 'active') {
          statusBadge = '<span class="badge bg-success">Active</span>';
        } else if (transaction.status === 'returned') {
          statusBadge = '<span class="badge bg-secondary">Returned</span>';
        } else if (transaction.status === 'overdue') {
          statusBadge = '<span class="badge bg-danger">Overdue</span>';
        }
        
        let typeBadge = '';
        if (transaction.type === 'borrow') {
          typeBadge = '<span class="badge bg-primary">Borrow</span>';
        } else {
          typeBadge = '<span class="badge bg-info">Return</span>';
        }
        
        return `
          <tr>
            <td>${transaction.book.title}</td>
            <td>${typeBadge}</td>
            <td>${new Date(transaction.createdAt).toLocaleDateString()}</td>
            <td>${statusBadge}</td>
          </tr>
        `;
      }).join('');
    } else {
      showAlert(data.message || 'Failed to load transaction history', 'danger');
    }
  } catch (error) {
    console.error('Error loading transactions:', error);
    showAlert('An error occurred while loading transactions', 'danger');
  } finally {
    transactionLoadingSpinner.style.display = 'none';
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

// Load data on page load
loadUserProfile();
loadTransactionHistory();
