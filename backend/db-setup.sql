-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS email_extraction;

-- Use the database
USE email_extraction;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create verification_codes table
CREATE TABLE IF NOT EXISTS verification_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(5) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create extracted_emails table
CREATE TABLE IF NOT EXISTS extracted_emails (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  email VARCHAR(255) NOT NULL,
  domain VARCHAR(255),
  extracted_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- No default users - users will register through the application
-- Verification codes will be generated dynamically during registration