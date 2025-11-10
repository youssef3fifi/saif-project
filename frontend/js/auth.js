// Check if already logged in
if (localStorage.getItem('token')) {
  window.location.href = 'dashboard.html';
}

// Show/Hide registration form
document.getElementById('showRegister').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('registerCard').classList.remove('d-none');
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
});

document.getElementById('showLogin').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('registerCard').classList.add('d-none');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  const loginBtn = document.getElementById('loginBtn');
  const loginBtnText = document.getElementById('loginBtnText');
  const loginBtnSpinner = document.getElementById('loginBtnSpinner');
  
  // Show loading state
  loginBtn.disabled = true;
  loginBtnText.classList.add('d-none');
  loginBtnSpinner.classList.remove('d-none');
  
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      // Save token and user data
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
      
      // Show success message
      showAlert('Login successful! Redirecting...', 'success');
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    } else {
      showAlert(data.message || 'Login failed', 'danger');
    }
  } catch (error) {
    console.error('Login error:', error);
    showAlert('An error occurred. Please try again.', 'danger');
  } finally {
    // Reset button state
    loginBtn.disabled = false;
    loginBtnText.classList.remove('d-none');
    loginBtnSpinner.classList.add('d-none');
  }
});

// Register form submission
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  
  const registerBtn = document.getElementById('registerBtn');
  const registerBtnText = document.getElementById('registerBtnText');
  const registerBtnSpinner = document.getElementById('registerBtnSpinner');
  
  // Show loading state
  registerBtn.disabled = true;
  registerBtnText.classList.add('d-none');
  registerBtnSpinner.classList.remove('d-none');
  
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      // Save token and user data
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
      
      // Show success message
      showAlert('Registration successful! Redirecting...', 'success', 'registerAlertContainer');
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    } else {
      showAlert(data.message || 'Registration failed', 'danger', 'registerAlertContainer');
    }
  } catch (error) {
    console.error('Registration error:', error);
    showAlert('An error occurred. Please try again.', 'danger', 'registerAlertContainer');
  } finally {
    // Reset button state
    registerBtn.disabled = false;
    registerBtnText.classList.remove('d-none');
    registerBtnSpinner.classList.add('d-none');
  }
});

// Show alert message
function showAlert(message, type, containerId = 'alertContainer') {
  const alertContainer = document.getElementById(containerId);
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} alert-dismissible fade show`;
  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  alertContainer.innerHTML = '';
  alertContainer.appendChild(alert);
  
  // Auto dismiss after 5 seconds
  setTimeout(() => {
    alert.classList.remove('show');
    setTimeout(() => alert.remove(), 150);
  }, 5000);
}
