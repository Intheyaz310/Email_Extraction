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

-- Insert some sample data
INSERT INTO users (email, password) VALUES
('test@example.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'); -- password: 123456

-- Sample verification code (expires in 10 minutes from current time)
INSERT INTO verification_codes (email, code, expires_at) VALUES
('test@example.com', '12345', DATE_ADD(NOW(), INTERVAL 10 MINUTE));