const mysql = require('mysql2/promise');
const { dbConfig } = require('../../config');
const logger = require('./logger');

let connection;

async function connectDB() {
  try {
    // Create connection pool
    connection = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connection
    const testConnection = await connection.getConnection();
    await testConnection.ping();
    testConnection.release();

    logger.info('Database connection pool created successfully');
    return connection;
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
}

async function getConnection() {
  if (!connection) {
    await connectDB();
  }
  return connection;
}

async function query(sql, params = []) {
  try {
    const conn = await getConnection();
    const [rows] = await conn.execute(sql, params);
    return rows;
  } catch (error) {
    logger.error('Database query error:', error);
    throw error;
  }
}

async function transaction(callback) {
  const conn = await getConnection();
  const connection = await conn.getConnection();
  
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function closeConnection() {
  if (connection) {
    await connection.end();
    logger.info('Database connection closed');
  }
}

module.exports = {
  connectDB,
  getConnection,
  query,
  transaction,
  closeConnection
};
