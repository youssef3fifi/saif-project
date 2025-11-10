# Quick Start Guide

Get the Library Management System up and running in 5 minutes!

## Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas account)
- Git

## 🚀 Quick Setup

### 1. Clone & Install

```bash
# Clone repository
git clone https://github.com/youssef3fifi/saif-project.git
cd saif-project

# Install backend dependencies
cd backend
npm install
```

### 2. Configure Environment

```bash
# Create .env file
cp .env.example .env

# Edit .env (use your preferred editor)
nano .env
```

**Minimum required configuration:**
```env
MONGODB_URI=mongodb://localhost:27017/library-management
JWT_SECRET=your_secret_key_here
```

### 3. Start Backend

```bash
npm start
```

✅ You should see:
```
Server running on port 5000
MongoDB connected successfully
```

### 4. Open Frontend

Open a new terminal:

```bash
cd ../frontend
python -m http.server 8000
# Or use: npx http-server -p 8000
```

### 5. Access Application

Open your browser: **http://localhost:8000**

## 🎯 First Steps

### Create Your First Account

1. Click "Register here"
2. Fill in your details:
   - Name: Admin User
   - Email: admin@example.com
   - Password: admin123
3. Click Register

### Make Yourself Admin

In MongoDB:
```javascript
mongosh
use library-management
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

**Refresh the page** - you now have admin access!

### Add Your First Book

1. Click "Manage Books" in navigation
2. Click "Add New Book"
3. Fill in book details:
   - Title: The Great Gatsby
   - Author: F. Scott Fitzgerald
   - ISBN: 978-0-7432-7356-5
   - Category: Fiction
   - Description: A classic American novel
   - Quantity: 5
4. Click "Save Book"

### Borrow a Book

1. Create a second user account (regular user)
2. Go to "Borrowing" page
3. Click "Borrow" on any available book
4. View it in "My Borrowed Books"

### Return a Book

1. In "Borrowing" page
2. Click "Return" on borrowed book
3. Book is returned and available again

## 📱 Using the Application

### Dashboard
- **Search**: Type in search bar and press Enter
- **Filter**: Select category from dropdown
- **View Details**: Click on any book card

### Book Management (Admin Only)
- **Add Book**: Click "Add New Book" button
- **Edit Book**: Click "Edit" button on any book
- **Delete Book**: Click "Delete" button on any book

### Borrowing System
- **Borrow**: Click "Borrow" on available books
- **Return**: Click "Return" on borrowed books
- **Due Date**: 14 days from borrow date

### Profile
- View your information
- See currently borrowed books
- Check transaction history

## 🔑 API Quick Reference

Base URL: `http://localhost:5000/api`

### Authentication
```bash
# Register
POST /auth/register
Body: { name, email, password }

# Login
POST /auth/login
Body: { email, password }

# Get Profile (requires token)
GET /auth/profile
Header: Authorization: Bearer <token>
```

### Books
```bash
# Get all books
GET /books

# Search books
GET /books?search=gatsby

# Filter by category
GET /books?category=Fiction

# Get single book
GET /books/:id

# Create book (admin only)
POST /books
Header: Authorization: Bearer <token>
Body: { title, author, isbn, category, description, quantity }

# Update book (admin only)
PUT /books/:id
Header: Authorization: Bearer <token>

# Delete book (admin only)
DELETE /books/:id
Header: Authorization: Bearer <token>
```

### Transactions
```bash
# Borrow book
POST /transactions/borrow
Header: Authorization: Bearer <token>
Body: { bookId }

# Return book
POST /transactions/return
Header: Authorization: Bearer <token>
Body: { bookId }

# Get user transactions
GET /transactions/user/:userId
Header: Authorization: Bearer <token>
```

## 🐛 Common Issues

### Backend won't start
```bash
# Check if port 5000 is in use
lsof -i :5000

# Kill process if needed
kill -9 <PID>
```

### MongoDB connection failed
```bash
# Check MongoDB is running
sudo systemctl status mongod

# Start MongoDB if needed
sudo systemctl start mongod
```

### Frontend can't connect
1. Verify backend is running on port 5000
2. Check `frontend/js/config.js` has correct API URL
3. Open browser console for errors

### Authentication issues
1. Clear browser localStorage: `localStorage.clear()`
2. Check JWT_SECRET is set in backend .env
3. Re-login to get new token

## 📚 Next Steps

- 📖 Read [README.md](README.md) for detailed documentation
- 🚀 See [AWS_DEPLOYMENT_GUIDE.md](AWS_DEPLOYMENT_GUIDE.md) for production deployment
- 🧪 Check [TESTING.md](TESTING.md) for testing procedures
- 🔒 Review [SECURITY.md](SECURITY.md) for security best practices

## 💡 Tips

### Development
```bash
# Backend with auto-reload
cd backend
npm run dev

# Backend logs
pm2 logs (if using PM2)
```

### MongoDB GUI
- Download [MongoDB Compass](https://www.mongodb.com/products/compass)
- Connect to: `mongodb://localhost:27017`
- Database: `library-management`

### Testing API
- Use [Postman](https://www.postman.com/)
- Or use curl commands from terminal
- Import example requests from TESTING.md

### Frontend Development
- Use browser DevTools (F12)
- Check Console for JavaScript errors
- Check Network tab for API calls
- Use localStorage inspector for token

## 🎨 Customization

### Change Colors
Edit `frontend/css/styles.css`:
```css
:root {
  --primary-color: #0d6efd;  /* Change this */
}
```

### Change Port
Edit `backend/.env`:
```env
PORT=3000  /* Change from 5000 */
```

### Change Token Expiration
Edit `backend/routes/auth.js`:
```javascript
expiresIn: '7d'  /* Change from '30d' */
```

### Rate Limiting
Edit `backend/server.js`:
```javascript
max: 200  /* Change from 100 */
```

## 📞 Support

- 🐛 Report bugs: [GitHub Issues](https://github.com/youssef3fifi/saif-project/issues)
- 📧 Questions: Create a discussion on GitHub
- 📖 Documentation: Check README.md and other .md files

## ✅ Checklist

Before deploying to production:
- [ ] Change default JWT_SECRET
- [ ] Set up MongoDB Atlas
- [ ] Configure FRONTEND_URL in backend .env
- [ ] Test all functionality
- [ ] Review SECURITY.md
- [ ] Follow AWS_DEPLOYMENT_GUIDE.md
- [ ] Set up backups
- [ ] Configure monitoring

---

**🎉 Congratulations!** You now have a working library management system!

For production deployment, please follow the [AWS Deployment Guide](AWS_DEPLOYMENT_GUIDE.md).
