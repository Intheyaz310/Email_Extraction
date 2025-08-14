const mysql = require('mysql2/promise');
const { dbConfig } = require('./config');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('Config:', { ...dbConfig, password: '***' });
    
    // Test basic connection
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Basic connection successful');
    
    // Test query
    const [rows] = await connection.query('SELECT 1 as test');
    console.log('✅ Query test successful:', rows);
    
    // Test database existence
    const [databases] = await connection.query('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === dbConfig.database);
    console.log(`✅ Database '${dbConfig.database}' exists:`, dbExists);
    
    if (dbExists) {
      // Test table existence
      await connection.query(`USE ${dbConfig.database}`);
      const [tables] = await connection.query('SHOW TABLES');
      console.log('✅ Tables found:', tables.map(t => Object.values(t)[0]));
    }
    
    await connection.end();
    console.log('✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error number:', error.errno);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Solution: Update the password in config.js');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Solution: Make sure MySQL is running');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 Solution: Create the database first');
    }
  }
}

testConnection();
