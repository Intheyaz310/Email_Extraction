const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const { dbConfig } = require('./config');

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Connect to MySQL (without specifying database first)
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });
    
    console.log('✅ Connected to MySQL server');
    
    // Read and execute the SQL setup file
    const sqlFile = path.join(__dirname, 'db-setup.sql');
    const sqlContent = await fs.readFile(sqlFile, 'utf8');
    
    // Split SQL commands by semicolon and execute each one
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`Found ${commands.length} SQL commands to execute`);
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        try {
          await connection.query(command);
          console.log(`✅ Command ${i + 1} executed successfully`);
        } catch (error) {
          if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.code === 'ER_DUP_ENTRY') {
            console.log(`⚠️  Command ${i + 1} skipped (already exists): ${error.message}`);
          } else {
            console.error(`❌ Command ${i + 1} failed:`, error.message);
          }
        }
      }
    }
    
    // Verify tables were created
    await connection.query(`USE ${dbConfig.database}`);
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
