# Backend Setup Guide

## 1. Database Setup

### Step 1: Update Database Credentials
Edit `config.js` and update the password field with your actual MySQL password:

```javascript
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'your_actual_mysql_password_here', // ← Update this!
  database: 'email_extraction'
};
```

### Step 2: Create Database
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Run this SQL command:
```sql
CREATE DATABASE IF NOT EXISTS email_extraction;
```

### Step 3: Run Database Schema
1. In MySQL Workbench, select the `email_extraction` database
2. Run the contents of `db-setup.sql` to create tables

## 2. Environment Variables (Optional)
Create a `.env` file in the backend folder:

```bash
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_mysql_password_here
DB_NAME=email_extraction

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Frontend URL for CORS
FRONTEND_URL=http://localhost:8080
```

## 3. Start the Backend
```bash
npm run dev
```

## 4. Test the Backend
Once running, test these endpoints:

- Health check: `http://localhost:5000/health`
- API base: `http://localhost:5000/api/`

## Common Issues

### "Access denied for user 'root'@'localhost'"
- Check your MySQL password in `config.js`
- Make sure MySQL is running
- Verify the user has access to the database

### "Database doesn't exist"
- Create the database first: `CREATE DATABASE email_extraction;`
- Run the schema from `db-setup.sql`

### "Table doesn't exist"
- Run the complete `db-setup.sql` script in MySQL Workbench
