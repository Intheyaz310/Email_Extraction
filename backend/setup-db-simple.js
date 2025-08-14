const mysql = require('mysql2/promise');
const { dbConfig } = require('./config');

async function setupDatabase() {
  try {
    console.log('Setting up database tables...');
    
    // Connect to the database
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role ENUM('user', 'admin', 'moderator') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL
      )
    `);
    console.log('✅ Users table created/verified');
    
    // Create extracted_emails table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS extracted_emails (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        email VARCHAR(255) NOT NULL,
        domain VARCHAR(255),
        extracted_data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Extracted emails table created/verified');
    
    // Create verification_codes table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS verification_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(5) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Verification codes table created/verified');
    
    // No default users - users will register through the application
    console.log('✅ Database ready for user registration');
    
    // Verify tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('✅ Tables in database:', tables.map(t => Object.values(t)[0]));
    
    await connection.end();
    console.log('✅ Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
