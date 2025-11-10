# Library Management System

A complete full-stack library management system with Node.js backend and vanilla JavaScript frontend, designed for AWS EC2 deployment.

## Features

### Backend (Node.js + Express + JSON File Storage)
- RESTful API architecture
- JWT-based authentication
- Role-based access control (Admin/User)
- JSON file-based storage (no database required!)
- Complete CRUD operations for books, users, and transactions
- Borrowing and returning system
- CORS configuration for AWS EC2 deployment
- Input validation and error handling
- Security best practices (bcrypt password hashing, JWT tokens)
- Automatic data initialization with sample data

### Frontend (HTML + CSS + JavaScript)
- **5 Professional Pages:**
  1. Login/Register page
  2. Dashboard with book catalog
  3. Book management (Admin only)
  4. Borrowing system
  5. User profile
- Responsive design with Bootstrap 5
- Real-time search and filtering
- Modern UI/UX with animations
- Mobile-friendly interface
- Local and EC2 deployment support

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Git

**No database installation required!** Data is stored in JSON files.

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/youssef3fifi/saif-project.git
cd saif-project
```

2. **Install backend dependencies:**
```bash
npm run install-backend
```

3. **Configure environment variables:**
```bash
cd backend
cp .env.example .env
# Edit .env with your JWT_SECRET and FRONTEND_URL
```

4. **Start the backend server:**
```bash
npm run dev
```

5. **Open the frontend:**
   - Open `frontend/index.html` in a browser
   - Or use a local server:
   ```bash
   cd frontend
   python -m http.server 8000
   # Or use: npx http-server -p 8000
   ```

6. **Access the application:**
   - Frontend: http://localhost:8000
   - Backend API: http://localhost:5000

## Project Structure

```
saif-project/
├── backend/
│   ├── data/
│   │   ├── users.json            # User data (auto-created)
│   │   ├── books.json            # Book data (auto-created)
│   │   ├── transactions.json     # Transaction data (auto-created)
│   │   ├── users.example.json    # Example user data
│   │   ├── books.example.json    # Example book data
│   │   └── transactions.example.json  # Example transaction data
│   ├── utils/
│   │   └── fileDB.js             # JSON file database operations
│   ├── routes/
│   │   ├── auth.js               # Authentication routes
│   │   ├── books.js              # Book routes
│   │   ├── users.js              # User routes
│   │   └── transactions.js       # Transaction routes
│   ├── middleware/
│   │   └── auth.js               # JWT authentication middleware
│   ├── server.js                 # Main server file
│   ├── package.json              # Backend dependencies
│   ├── .env.example              # Environment variables template
│   └── README.md                 # Backend documentation
├── frontend/
│   ├── css/
│   │   └── styles.css            # Custom styles
│   ├── js/
│   │   ├── config.js             # API configuration
│   │   ├── auth.js               # Authentication logic
│   │   ├── dashboard.js          # Dashboard page logic
│   │   ├── books.js              # Book management logic
│   │   ├── borrow.js             # Borrowing system logic
│   │   └── profile.js            # Profile page logic
│   ├── index.html                # Login page
│   ├── dashboard.html            # Dashboard page
│   ├── books.html                # Book management page
│   ├── borrow.html               # Borrowing page
│   ├── profile.html              # Profile page
│   ├── .env.example              # Frontend config template
│   └── README.md                 # Frontend documentation
├── AWS_DEPLOYMENT_GUIDE.md       # AWS deployment guide
├── package.json                  # Root package file
├── .gitignore                    # Git ignore rules
└── README.md                     # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (Protected)

### Books
- `GET /api/books` - Get all books (with search/filter)
- `GET /api/books/:id` - Get single book
- `POST /api/books` - Create book (Admin only)
- `PUT /api/books/:id` - Update book (Admin only)
- `DELETE /api/books/:id` - Delete book (Admin only)

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get single user (Admin only)

### Transactions
- `POST /api/transactions/borrow` - Borrow a book (Protected)
- `POST /api/transactions/return` - Return a book (Protected)
- `GET /api/transactions/user/:userId` - Get user transactions (Protected)
- `GET /api/transactions` - Get all transactions (Admin only)

## Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:8000
```

### Frontend
The frontend automatically detects the environment. For custom configuration, add a meta tag to HTML files:
```html
<meta name="api-url" content="http://YOUR_EC2_PUBLIC_IP:5000">
```

## Default Credentials

The system comes with pre-configured accounts for immediate use:

**Admin Account:**
- Email: admin@library.com
- Password: admin123
- Can manage books, view all users, and access all transactions

**Regular User Account:**
- Email: user@library.com
- Password: user123
- Can browse books, borrow/return books, and view personal profile

## User Roles

### Regular User
- Browse book catalog
- Search and filter books
- Borrow and return books
- View personal profile and transaction history

### Admin User
- All user permissions
- Add, edit, and delete books
- View all users
- View all transactions

## AWS EC2 Deployment

For detailed AWS deployment instructions, see [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)

### Quick AWS Setup

1. **Launch EC2 Instance** (Ubuntu/Amazon Linux)
2. **Configure Security Group:**
   - Port 22 (SSH)
   - Port 5000 (Backend API)
   - Port 80 (Frontend HTTP)
   - Port 443 (Frontend HTTPS - optional)

3. **Install Node.js**
4. **Deploy Backend:**
   ```bash
   git clone <repo-url>
   cd saif-project/backend
   npm install
   # Configure .env with JWT_SECRET and FRONTEND_URL
   pm2 start server.js --name library-api
   ```

5. **Deploy Frontend:**
   ```bash
   # Install Nginx
   sudo yum install nginx -y
   # Copy frontend files to /var/www/html
   # Configure API URL in js/config.js
   sudo systemctl start nginx
   ```

## Technologies Used

### Backend
- Node.js
- Express.js
- JSON File Storage (fs.promises)
- JWT (jsonwebtoken)
- bcryptjs
- express-validator
- dotenv
- cors

### Frontend
- HTML5
- CSS3 (Bootstrap 5)
- Vanilla JavaScript
- Bootstrap Icons
- Fetch API

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected routes (backend and frontend)
- Role-based access control
- Input validation
- CORS configuration
- Environment variable management
- Input sanitization and validation

## Development

### Running in Development Mode

Backend with auto-reload:
```bash
npm run dev
```

### Testing the API

Use Postman or curl:
```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Troubleshooting

### Backend Issues

**Data Persistence:**
- Data is stored in `backend/data/*.json` files
- Files are automatically created on first run with sample data
- Backup these files regularly to preserve your data
- To reset data, delete the JSON files and restart the server

**Port Already in Use:**
```bash
lsof -i :5000
kill -9 <PID>
```

### Frontend Issues

**CORS Errors:**
- Verify backend CORS configuration
- Check FRONTEND_URL in backend .env
- Ensure API_URL in frontend/js/config.js is correct

**Authentication Not Working:**
- Clear localStorage: `localStorage.clear()`
- Check token in Network tab
- Verify JWT_SECRET matches between requests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Check the AWS_DEPLOYMENT_GUIDE.md for deployment help
- Review backend/README.md and frontend/README.md for component-specific documentation

## Acknowledgments

- Bootstrap for UI framework
- MongoDB for database
- Express.js for backend framework
- The open-source community