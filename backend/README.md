# Email Extraction Backend

A robust Node.js backend API for the Email Extraction application with advanced text processing, user management, and admin dashboard functionality.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Email Text Processing**: Advanced NLP-based job information extraction
- **User Management**: Complete user profile and account management
- **Admin Dashboard**: Comprehensive analytics and user management
- **Database Integration**: MySQL with connection pooling and transactions
- **Security**: Helmet, CORS, rate limiting, input validation
- **Logging**: Winston-based logging with file rotation
- **Error Handling**: Comprehensive error handling and validation

## 🏗️ Architecture

```
backend/
├── src/
│   ├── app.js              # Express application setup
│   ├── server.js           # Server entry point
│   ├── routes/             # API route definitions
│   │   ├── auth.js         # Authentication routes
│   │   ├── emailExtraction.js # Email processing routes
│   │   ├── admin.js        # Admin dashboard routes
│   │   └── users.js        # User management routes
│   ├── middleware/         # Custom middleware
│   │   ├── auth.js         # Authentication middleware
│   │   └── errorHandler.js # Error handling middleware
│   ├── utils/              # Utility functions
│   │   ├── database.js     # Database connection utilities
│   │   ├── logger.js       # Logging configuration
│   │   └── textProcessor.js # Text processing utilities
│   └── models/             # Data models (future use)
├── logs/                   # Application logs
├── config.js               # Configuration file
├── db-setup.sql           # Database schema
└── package.json           # Dependencies and scripts
```

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up MySQL database:**
   - Create a MySQL database named `email_extraction`
   - Run the `db-setup.sql` script to create tables
   - Update database credentials in `config.js`

4. **Configure environment variables** (optional):
   ```bash
   # Create .env file
   NODE_ENV=development
   PORT=5000
   JWT_SECRET=your-secret-key-here
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=email_extraction
   FRONTEND_URL=http://localhost:8080
   ```

## 🚀 Running the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will run on port 5000 by default.

## 📚 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /verify` - Verify JWT token
- `POST /refresh` - Refresh JWT token

### Email Extraction (`/api/email-extraction`)
- `POST /extract-text` - Extract job information from text
- `POST /extract-file` - Extract from file upload (future)
- `GET /history/:userId` - Get user's extraction history
- `GET /stats/:userId` - Get extraction statistics
- `DELETE /:extractionId` - Delete extraction

### Admin (`/api/admin`)
- `GET /dashboard-stats` - Dashboard statistics
- `GET /users` - User management
- `PUT /users/:userId/role` - Update user role
- `GET /analytics` - System analytics
- `GET /health` - System health check

### Users (`/api/users`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password
- `GET /extractions` - Get user's extractions
- `DELETE /account` - Delete user account

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🗄️ Database Schema

### Users Table
- `id` - Primary key
- `email` - User email (unique)
- `password` - Hashed password
- `name` - User's full name
- `role` - User role (user, admin, moderator)
- `created_at` - Account creation timestamp
- `last_login` - Last login timestamp

### Extracted Emails Table
- `id` - Primary key
- `user_id` - Foreign key to users table
- `email` - Source email address
- `domain` - Email domain
- `extracted_data` - JSON data with extracted information
- `created_at` - Extraction timestamp

## 🔧 Configuration

Update `config.js` with your database credentials:

```javascript
const dbConfig = {
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'email_extraction'
};
```

## 📊 Logging

Logs are stored in the `logs/` directory:
- `combined.log` - All application logs
- `error.log` - Error logs only

## 🚨 Error Handling

The backend includes comprehensive error handling:
- Input validation errors
- Database errors
- Authentication errors
- Rate limiting errors
- File upload errors

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API rate limiting
- **Input Validation**: Request validation
- **Password Hashing**: bcrypt with salt rounds
- **JWT**: Secure token-based authentication

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Health check
curl http://localhost:5000/health
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key-here` |
| `DB_HOST` | Database host | `localhost` |
| `DB_USER` | Database username | `root` |
| `DB_PASSWORD` | Database password | `` |
| `DB_NAME` | Database name | `email_extraction` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:8080` |

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation
4. Add logging for important operations
5. Test your changes thoroughly

## 📄 License

ISC License
