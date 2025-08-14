const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',      // Change to your MySQL username
  password: '',      // Change to your MySQL password
  database: 'email_extraction'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');
  
  // Create tables if they don't exist
  const createTablesQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS verification_codes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      code VARCHAR(5) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS extracted_emails (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      email VARCHAR(255) NOT NULL,
      domain VARCHAR(255),
      extracted_data JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `;
  
  db.query(createTablesQuery, (err, result) => {
    if (err) {
      console.error('Error creating tables:', err);
      return;
    }
    console.log('Database tables created or already exist');
  });
});

// Generate a random 5-digit code
function generateVerificationCode() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

// Routes

// Register a new user
app.post('/api/register', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  // Hash the password
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  
  // Check if user already exists
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (results.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    // Insert new user
    db.query(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashedPassword],
      (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
        
        res.status(201).json({ message: 'User registered successfully' });
      }
    );
  });
});

// Login user
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  // Hash the password
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  
  // Check user credentials
  db.query(
    'SELECT * FROM users WHERE email = ? AND password = ?',
    [email, hashedPassword],
    (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Generate verification code
      const code = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
      
      // Store verification code in database
      db.query(
        'INSERT INTO verification_codes (email, code, expires_at) VALUES (?, ?, ?)',
        [email, code, expiresAt],
        (err, result) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal server error' });
          }
          
          // In a real application, send the code via email
          console.log(`Verification code for ${email}: ${code}`);
          
          res.status(200).json({ 
            message: 'Verification code sent',
            userId: results[0].id
          });
        }
      );
    }
  );
});

// Verify code
app.post('/api/verify', (req, res) => {
  const { email, code } = req.body;
  
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required' });
  }
  
  // Check verification code
  db.query(
    'SELECT * FROM verification_codes WHERE email = ? AND code = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
    [email, code],
    (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid or expired verification code' });
      }
      
      // Get user information
      db.query('SELECT * FROM users WHERE email = ?', [email], (err, userResults) => {
        if (err || userResults.length === 0) {
          return res.status(500).json({ error: 'Internal server error' });
        }
        
        // Delete used verification code
        db.query('DELETE FROM verification_codes WHERE id = ?', [results[0].id]);
        
        res.status(200).json({ 
          message: 'Verification successful',
          userId: userResults[0].id
        });
      });
    }
  );
});

// Extract email information
app.post('/api/extract', (req, res) => {
  const { userId, email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  // Extract domain from email
  const domain = email.split('@')[1];
  
  // Mock extraction data - in a real app, you would do actual extraction
  const extractedData = {
    domain,
    provider: domain.split('.')[0],
    isValid: true,
    firstSeen: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    confidence: 0.95,
    metadata: {
      hasBeenLeaked: false,
      associatedServices: ['example1.com', 'example2.com'],
      riskScore: 'low'
    }
  };
  
  // Store extraction in database
  db.query(
    'INSERT INTO extracted_emails (user_id, email, domain, extracted_data) VALUES (?, ?, ?, ?)',
    [userId || null, email, domain, JSON.stringify(extractedData)],
    (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      res.status(200).json({ 
        message: 'Email extracted successfully',
        data: extractedData
      });
    }
  );
});

// Get user's extracted emails
app.get('/api/extractions/:userId', (req, res) => {
  const userId = req.params.userId;
  
  db.query(
    'SELECT * FROM extracted_emails WHERE user_id = ? ORDER BY created_at DESC',
    [userId],
    (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      // Parse JSON data
      const extractions = results.map(row => ({
        ...row,
        extracted_data: JSON.parse(row.extracted_data)
      }));
      
      res.status(200).json({ extractions });
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});