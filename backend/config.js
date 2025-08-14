// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root', // Update this with your actual MySQL password
  database: process.env.DB_NAME || 'email_extraction'
};

// Server configuration
const serverConfig = {
  port: process.env.PORT || 5000,
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:8080', // Updated to match your frontend port
    credentials: true
  }
};

module.exports = {
  dbConfig,
  serverConfig
};
