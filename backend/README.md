# Library Management System - Backend

RESTful API backend for the Library Management System built with Node.js, Express, and JSON file storage.

## Features

- JWT-based authentication
- Role-based access control (Admin/User)
- Complete CRUD operations for books
- Borrowing and returning system
- Transaction tracking
- JSON file-based storage (no database required!)
- Input validation
- CORS configuration for AWS EC2 deployment
- Automatic data initialization with sample data

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

**No database installation required!** Data is stored in JSON files.

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
   - Set a secure JWT secret
   - Configure FRONTEND_URL for CORS

## Data Storage

The application uses JSON files for data persistence:
- `data/users.json` - User accounts and authentication
- `data/books.json` - Book catalog
- `data/transactions.json` - Borrowing history

On first run, the server automatically creates these files with sample data including:
- Admin user (admin@library.com / admin123)
- Regular user (user@library.com / user123)
- Sample books (The Great Gatsby, To Kill a Mockingbird, 1984)

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will run on `http://0.0.0.0:5000` by default.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (Protected)

### Books
- `GET /api/books` - Get all books (with optional search and category filters)
- `GET /api/books/:id` - Get single book
- `POST /api/books` - Create a book (Admin only)
- `PUT /api/books/:id` - Update a book (Admin only)
- `DELETE /api/books/:id` - Delete a book (Admin only)

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get single user (Admin only)

### Transactions
- `POST /api/transactions/borrow` - Borrow a book (Protected)
- `POST /api/transactions/return` - Return a book (Protected)
- `GET /api/transactions/user/:userId` - Get user transactions (Protected)
- `GET /api/transactions` - Get all transactions (Admin only)

## AWS EC2 Deployment

### 1. Setup EC2 Instance
- Launch an EC2 instance (Ubuntu recommended)
- Configure Security Group to allow inbound traffic on ports:
  - 22 (SSH)
  - 5000 (Backend API)
  - 80 (HTTP - optional)
  - 443 (HTTPS - optional)

### 2. Install Node.js on EC2
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### 4. Clone and Setup Project
```bash
git clone <your-repo-url>
cd saif-project/backend
npm install
```

### 5. Configure Environment Variables
```bash
nano .env
```
Update with production values, especially:
- JWT_SECRET with a strong secret key
- FRONTEND_URL with your EC2 public IP

### 6. Start with PM2
```bash
pm2 start server.js --name library-api
pm2 save
pm2 startup
```

### 7. Monitor Application
```bash
pm2 status
pm2 logs library-api
pm2 restart library-api
```

## Default Credentials

After installation, you can log in with these default accounts:

**Admin Account:**
- Email: admin@library.com
- Password: admin123

**Regular User Account:**
- Email: user@library.com
- Password: user123

## Security Notes

- Always use strong JWT secrets in production
- Never commit `.env` file to version control
- Never commit actual data files (`data/*.json`) to version control
- Use HTTPS in production
- Regularly update dependencies
- Implement rate limiting for production
- Change default passwords after first login

## Troubleshooting

### Data Persistence
- Data is stored in `backend/data/*.json` files
- Backup these files regularly to preserve data
- Files are automatically created on first run with sample data

### CORS Issues
- Verify FRONTEND_URL in `.env` matches your frontend URL
- Check that the frontend sends requests to the correct backend URL

### Port Already in Use
```bash
lsof -i :5000
kill -9 <PID>
```

## License

MIT
