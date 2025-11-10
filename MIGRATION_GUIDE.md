# Migration Guide: MongoDB to JSON File Storage

## Overview

This project has been migrated from MongoDB to JSON file-based storage, eliminating the need for external database installation while maintaining full functionality.

## What Changed

### Removed
- MongoDB/Mongoose dependency
- Database connection configuration (`config/db.js`)
- Mongoose models (`models/User.js`, `models/Book.js`, `models/Transaction.js`)
- MongoDB URI from environment variables

### Added
- JSON file storage system (`utils/fileDB.js`)
- Automatic data initialization
- Example data files for version control
- Default user accounts with pre-hashed passwords

### Maintained
- All API endpoints (no changes to endpoints or responses)
- JWT authentication
- Role-based access control
- Password hashing with bcrypt
- All business logic and validation
- Frontend compatibility (no frontend changes needed)

## Getting Started

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/youssef3fifi/saif-project.git
cd saif-project/backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env and set:
# - JWT_SECRET (use a strong secret in production)
# - FRONTEND_URL (for CORS configuration)
```

4. **Start the server**
```bash
npm start
# or for development with auto-reload:
npm run dev
```

That's it! No database installation required.

## Data Storage

### File Structure
```
backend/
└── data/
    ├── users.json              # User accounts (auto-created)
    ├── books.json              # Book catalog (auto-created)
    ├── transactions.json       # Transaction history (auto-created)
    ├── users.example.json      # Example user data (in git)
    ├── books.example.json      # Example book data (in git)
    └── transactions.example.json # Example transaction data (in git)
```

### Automatic Initialization

On first run, the server automatically creates:
- `users.json` with 2 default accounts
- `books.json` with 3 sample books
- `transactions.json` as an empty array

### Default Accounts

**Admin Account:**
- Email: `admin@library.com`
- Password: `admin123`
- Can manage books, view all users, access all transactions

**Regular User Account:**
- Email: `user@library.com`
- Password: `user123`
- Can browse/search books, borrow/return books, view own profile

**Important:** Change these passwords after first login in production!

## Data Persistence

### How It Works
- Data is stored in JSON files in the `backend/data/` directory
- All changes are immediately written to disk
- Data persists between server restarts
- Files are human-readable and can be edited manually if needed

### Backup Strategy

**Simple Backup:**
```bash
# Backup all data
cp -r backend/data backend/data.backup

# Or backup to dated folder
cp -r backend/data backend/data.$(date +%Y%m%d)
```

**Restore from Backup:**
```bash
cp -r backend/data.backup/* backend/data/
```

### Resetting Data

To reset to initial state:
```bash
cd backend/data
rm users.json books.json transactions.json
# Restart server to regenerate with sample data
```

## API Compatibility

### No Changes Required

All API endpoints work exactly the same:

**Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile

**Books:**
- `GET /api/books` - Get all books (with search/filter)
- `GET /api/books/:id` - Get single book
- `POST /api/books` - Create book (Admin)
- `PUT /api/books/:id` - Update book (Admin)
- `DELETE /api/books/:id` - Delete book (Admin)

**Users:**
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get single user (Admin)

**Transactions:**
- `POST /api/transactions/borrow` - Borrow a book
- `POST /api/transactions/return` - Return a book
- `GET /api/transactions/user/:userId` - Get user transactions
- `GET /api/transactions` - Get all transactions (Admin)

### Response Format

All responses maintain the same format:
```json
{
  "success": true,
  "data": { ... },
  "count": 10  // for list endpoints
}
```

## Testing

### Quick Test

```bash
# Test root endpoint
curl http://localhost:5000/

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@library.com","password":"admin123"}'

# Get books
curl http://localhost:5000/api/books
```

### Complete Test Suite

Run the comprehensive test suite included in the repository:
```bash
./test-api.sh  # If provided
```

Or test manually:
1. Login as admin
2. Create a book
3. Login as user
4. Borrow the book
5. Return the book
6. Verify data persistence by restarting server

## Deployment

### Production Considerations

1. **Security:**
   - Use strong JWT_SECRET
   - Change default passwords immediately
   - Enable HTTPS
   - Configure proper CORS settings

2. **Data Backup:**
   - Set up automated backups of `backend/data/` directory
   - Consider daily backups with rotation
   - Test restore procedures regularly

3. **File Permissions:**
   - Ensure write permissions for `backend/data/` directory
   - Restrict read access to authorized users only

4. **Monitoring:**
   - Monitor disk space
   - Watch for file corruption
   - Log file operations

### AWS EC2 Deployment

```bash
# On EC2 instance
git clone <repository-url>
cd saif-project/backend
npm install

# Configure .env
nano .env

# Start with PM2
pm2 start server.js --name library-api
pm2 save
pm2 startup
```

## Limitations

### When to Use This Solution

✅ **Good for:**
- Small to medium deployments (< 10,000 records)
- Development and testing environments
- Quick prototypes and MVPs
- Self-hosted solutions
- Environments where database setup is restricted

❌ **Not recommended for:**
- High-traffic production systems (> 100 concurrent users)
- Systems requiring complex queries
- Distributed systems needing replication
- Applications requiring ACID transactions
- Systems with frequent concurrent writes

### Performance Considerations

- Read operations are fast (data loaded into memory)
- Write operations are sequential (file locking prevents corruption)
- Search is performed in-memory (efficient for moderate datasets)
- Consider upgrading to a database if data grows beyond 10,000 records

## Troubleshooting

### Common Issues

**1. Data files not created**
```bash
# Check directory permissions
ls -la backend/data
# Ensure directory is writable
chmod 755 backend/data
```

**2. Cannot write to files**
```bash
# Check file permissions
ls -la backend/data/*.json
# Fix permissions if needed
chmod 644 backend/data/*.json
```

**3. Corrupted JSON files**
```bash
# Validate JSON
cat backend/data/users.json | jq .
# If corrupted, restore from backup or delete to regenerate
```

**4. Authentication failing**
```bash
# Verify JWT_SECRET is set in .env
grep JWT_SECRET backend/.env
# Check token is being sent in Authorization header
```

## Migration from Existing MongoDB Setup

If you're migrating an existing system:

1. **Export MongoDB data:**
```bash
mongoexport --db=library-management --collection=users --out=users.json
mongoexport --db=library-management --collection=books --out=books.json
mongoexport --db=library-management --collection=transactions --out=transactions.json
```

2. **Convert to new format:**
- Change `_id` to `id` (integer)
- Update references to use integer IDs
- Ensure password hashes are preserved
- Format dates as ISO strings

3. **Place files in data directory:**
```bash
cp users.json backend/data/
cp books.json backend/data/
cp transactions.json backend/data/
```

4. **Update and restart:**
```bash
cd backend
npm install
npm start
```

## Support

For issues or questions:
1. Check this migration guide
2. Review backend/README.md
3. Check application logs
4. Create an issue on GitHub

## Version History

- **v2.0.0** - JSON file storage implementation
- **v1.0.0** - Original MongoDB implementation

---

**Note:** This migration maintains 100% API compatibility. Your frontend code requires no changes.
