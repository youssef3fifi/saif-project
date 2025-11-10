# Library Management System - Frontend

Modern, responsive frontend for the Library Management System built with HTML, CSS (Bootstrap), and vanilla JavaScript.

## Features

- User authentication (Login/Register)
- Book catalog with search and filter functionality
- Book management (Admin only)
- Borrowing and returning books
- User profile with transaction history
- Responsive design for mobile and desktop
- Real-time notifications and feedback

## Pages

1. **index.html** - Login and registration page
2. **dashboard.html** - Main book catalog
3. **books.html** - Book management (Admin only)
4. **borrow.html** - Borrow and return books
5. **profile.html** - User profile and transaction history

## Setup

### Local Development

1. Open `js/config.js` and ensure the API_URL points to your backend:
```javascript
const API_URL = 'http://localhost:5000';
```

2. Open `index.html` in a web browser or use a local server:

Using Python:
```bash
python -m http.server 8000
```

Using Node.js (http-server):
```bash
npx http-server -p 8000
```

3. Access the application at `http://localhost:8000`

### AWS EC2 Deployment

#### Option 1: Direct File Serving

1. **Upload files to EC2:**
```bash
scp -r frontend/* ec2-user@YOUR_EC2_IP:/var/www/html/
```

2. **Install and configure Nginx:**
```bash
sudo yum install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

3. **Configure Nginx** (`/etc/nginx/nginx.conf`):
```nginx
server {
    listen 80;
    server_name YOUR_EC2_PUBLIC_IP;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

4. **Update API URL:**
   - Edit `js/config.js` to use your EC2 backend IP
   - OR add meta tag to HTML files:
   ```html
   <meta name="api-url" content="http://YOUR_EC2_PUBLIC_IP:5000">
   ```

5. **Restart Nginx:**
```bash
sudo systemctl restart nginx
```

#### Option 2: S3 + CloudFront (Static Hosting)

1. **Create S3 bucket:**
```bash
aws s3 mb s3://your-library-frontend
aws s3 website s3://your-library-frontend --index-document index.html
```

2. **Upload files:**
```bash
aws s3 sync frontend/ s3://your-library-frontend/
```

3. **Configure bucket policy for public access**

4. **Update API URL** in `js/config.js` to point to your EC2 backend

5. **Optional:** Set up CloudFront for HTTPS

## Configuration

### API URL Configuration

The frontend automatically detects the environment:

- **Local:** Uses `http://localhost:5000`
- **Production:** Uses the current hostname with port 5000

To override, add this meta tag to each HTML file:
```html
<head>
  <meta name="api-url" content="http://YOUR_EC2_PUBLIC_IP:5000">
  <!-- other tags -->
</head>
```

Or edit `js/config.js`:
```javascript
const API_URL = 'http://YOUR_EC2_PUBLIC_IP:5000';
```

## User Roles

### Regular User
- View book catalog
- Search and filter books
- Borrow and return books
- View profile and transaction history

### Admin User
- All user permissions
- Add, edit, and delete books
- View all users
- View all transactions

### Default Admin Account
To create an admin account, register normally and then update the role in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

Or use the backend API with role parameter during registration.

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Custom styles with CSS variables
- **Bootstrap 5.3** - UI framework
- **Bootstrap Icons** - Icon library
- **Vanilla JavaScript** - No framework dependencies
- **Fetch API** - HTTP requests
- **LocalStorage** - Client-side authentication state

## Security Features

- JWT token authentication
- Token stored in localStorage
- Protected routes (redirect to login if not authenticated)
- Role-based access control
- XSS prevention through proper encoding
- CORS configured on backend

## Development Tips

### Adding New Features

1. **Add new page:**
   - Create HTML file in root
   - Create corresponding JS file in `js/`
   - Update navigation in all pages

2. **Add new API endpoint:**
   - Update `js/config.js` if needed
   - Use fetch with token:
   ```javascript
   const token = localStorage.getItem('token');
   fetch(`${API_URL}/api/endpoint`, {
     headers: {
       'Authorization': `Bearer ${token}`
     }
   })
   ```

3. **Add new styles:**
   - Edit `css/styles.css`
   - Use Bootstrap utilities where possible

### Debugging

1. **Check browser console** for JavaScript errors
2. **Check Network tab** for API request/response
3. **Verify token** in localStorage
4. **Check CORS** if requests fail

## Common Issues

### 1. CORS Errors
- Ensure backend CORS is configured correctly
- Verify backend is running
- Check API_URL in config.js

### 2. Authentication Issues
- Clear localStorage: `localStorage.clear()`
- Check token expiration
- Verify backend JWT_SECRET matches

### 3. API Connection Failed
- Verify backend is running on correct port
- Check firewall/security group settings
- Verify API_URL configuration

## Performance Optimization

- Minify CSS and JavaScript for production
- Use CDN for libraries (Bootstrap, Icons)
- Implement caching headers on server
- Compress images if added
- Consider lazy loading for large lists

## Future Enhancements

- [ ] Implement pagination for book lists
- [ ] Add advanced search filters
- [ ] Add book reviews and ratings
- [ ] Implement notifications system
- [ ] Add dark mode
- [ ] PWA support for offline access
- [ ] Multi-language support

## License

MIT
