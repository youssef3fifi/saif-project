# Testing Guide

This document provides instructions for testing the Library Management System.

## Prerequisites for Testing

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- A web browser (Chrome, Firefox, Safari, or Edge)
- Postman or curl (for API testing - optional)

## Backend Testing

### 1. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB connection string
```

### 2. Start Backend Server

```bash
npm start
# Or for development with auto-reload:
npm run dev
```

Expected output:
```
Server running on port 5000
Environment: development
MongoDB connected successfully
```

### 3. Test API Endpoints

#### Test Root Endpoint
```bash
curl http://localhost:5000/
```

Expected response:
```json
{
  "success": true,
  "message": "Library Management System API",
  "version": "1.0.0"
}
```

#### Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Test User",
    "email": "test@example.com",
    "role": "user",
    "token": "..."
  }
}
```

#### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Test Protected Route (Profile)
```bash
# Use the token from login/register
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Test Get Books
```bash
curl http://localhost:5000/api/books
```

### 4. Create Admin User

After registering a regular user, connect to MongoDB and promote them to admin:

```bash
# Using MongoDB shell
mongosh

use library-management
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

Or using MongoDB Compass or Atlas web interface.

### 5. Test Admin Endpoints

#### Create a Book (Admin Only)
```bash
curl -X POST http://localhost:5000/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "978-0-7432-7356-5",
    "category": "Fiction",
    "description": "A classic American novel",
    "quantity": 5
  }'
```

## Frontend Testing

### 1. Setup Frontend

```bash
cd frontend
# No installation needed - pure HTML/CSS/JS
```

### 2. Configure API URL

Edit `js/config.js` to ensure it points to your backend:
```javascript
const API_URL = 'http://localhost:5000';
```

### 3. Serve Frontend

Using Python:
```bash
python -m http.server 8000
```

Using Node.js:
```bash
npx http-server -p 8000
```

### 4. Access the Application

Open browser and navigate to: `http://localhost:8000`

### 5. Test User Flows

#### A. Registration Flow
1. Click on "Register here" link
2. Fill in the registration form:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
3. Click "Register"
4. Should redirect to dashboard

#### B. Login Flow
1. Go to `http://localhost:8000`
2. Enter credentials:
   - Email: test@example.com
   - Password: password123
3. Click "Sign In"
4. Should redirect to dashboard

#### C. Dashboard Features
1. View book catalog
2. Use search bar to search for books
3. Filter by category
4. Click on a book card to view details

#### D. Borrowing Flow
1. Navigate to "Borrowing" page
2. View available books
3. Click "Borrow" on a book
4. Confirm the action
5. Book should appear in "My Borrowed Books" section
6. Click "Return" to return the book

#### E. Profile Page
1. Navigate to "Profile" page
2. View user information
3. See currently borrowed books
4. View transaction history

#### F. Admin Flow (After promoting user to admin)
1. Log in as admin user
2. Navigate to "Manage Books"
3. Click "Add New Book"
4. Fill in book details and save
5. Edit an existing book
6. Delete a book

## Integration Testing

### Test Complete User Journey

1. **Register a new user**
   - Open frontend
   - Register with new credentials
   - Verify redirect to dashboard

2. **Browse books**
   - Search for books
   - Filter by category
   - View book details

3. **Borrow a book**
   - Go to Borrowing page
   - Borrow an available book
   - Verify it appears in borrowed books

4. **View profile**
   - Go to Profile page
   - Verify borrowed book is shown
   - Check transaction history

5. **Return a book**
   - Go to Borrowing page
   - Return the borrowed book
   - Verify it's removed from borrowed books

6. **Admin operations** (after promotion to admin)
   - Add a new book
   - Edit the book
   - View all users
   - Delete the book

## Testing Checklist

### Backend Tests
- [ ] Server starts without errors
- [ ] MongoDB connection successful
- [ ] User registration works
- [ ] User login works
- [ ] JWT token is generated
- [ ] Protected routes require authentication
- [ ] Admin routes require admin role
- [ ] Books CRUD operations work
- [ ] Transaction creation works
- [ ] Book availability updates correctly

### Frontend Tests
- [ ] Login page loads correctly
- [ ] Registration form works
- [ ] Dashboard displays books
- [ ] Search functionality works
- [ ] Category filter works
- [ ] Book detail modal opens
- [ ] Borrowing page loads correctly
- [ ] Can borrow available books
- [ ] Can return borrowed books
- [ ] Profile page displays user info
- [ ] Transaction history shows correctly
- [ ] Admin pages are accessible to admins only
- [ ] Admin can add books
- [ ] Admin can edit books
- [ ] Admin can delete books
- [ ] Logout works correctly

### Security Tests
- [ ] Passwords are hashed in database
- [ ] JWT tokens expire appropriately
- [ ] Protected routes redirect to login
- [ ] Admin routes deny non-admin users
- [ ] CORS is configured correctly
- [ ] No sensitive data in frontend
- [ ] SQL injection prevention works (Mongoose)
- [ ] Input validation works

### UI/UX Tests
- [ ] Pages are responsive on mobile
- [ ] Loading states are shown
- [ ] Error messages are displayed
- [ ] Success messages are displayed
- [ ] Forms have validation
- [ ] Buttons have proper states
- [ ] Navigation works correctly
- [ ] Modals open and close properly

## Common Testing Issues

### Backend Not Starting
- Check if port 5000 is available
- Verify .env file exists and is configured
- Check MongoDB connection string
- Ensure all dependencies are installed

### Frontend Can't Connect to Backend
- Verify backend is running on port 5000
- Check API_URL in js/config.js
- Check browser console for CORS errors
- Verify FRONTEND_URL in backend .env

### Authentication Not Working
- Check JWT_SECRET is set in backend .env
- Verify token is being saved in localStorage
- Check token is being sent in Authorization header
- Verify token hasn't expired

### Books Not Appearing
- Check if books exist in database
- Verify API endpoint is returning data
- Check browser console for errors
- Ensure books have required fields

## Performance Testing

### Load Testing (Optional)

Use tools like Apache Bench or Artillery:

```bash
# Install artillery
npm install -g artillery

# Create test script (artillery.yml)
# Run load test
artillery run artillery.yml
```

## Automated Testing (Future Enhancement)

Consider adding:
- Jest for backend unit tests
- Mocha/Chai for integration tests
- Cypress for frontend E2E tests
- Supertest for API testing

## Bug Reporting

If you find bugs during testing:
1. Note the exact steps to reproduce
2. Capture error messages from console
3. Take screenshots if UI-related
4. Check browser network tab for API errors
5. Create a GitHub issue with details

## Test Data

### Sample Books
```json
[
  {
    "title": "1984",
    "author": "George Orwell",
    "isbn": "978-0-452-28423-4",
    "category": "Fiction",
    "description": "A dystopian social science fiction novel",
    "quantity": 3
  },
  {
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "isbn": "978-0-13-235088-4",
    "category": "Technology",
    "description": "A handbook of agile software craftsmanship",
    "quantity": 5
  },
  {
    "title": "A Brief History of Time",
    "author": "Stephen Hawking",
    "isbn": "978-0-553-38016-3",
    "category": "Science",
    "description": "From the Big Bang to Black Holes",
    "quantity": 2
  }
]
```

### Sample Users
- Regular User: user@example.com / password123
- Admin User: admin@example.com / admin123

---

**Note:** This is a testing guide. For deployment instructions, see AWS_DEPLOYMENT_GUIDE.md
