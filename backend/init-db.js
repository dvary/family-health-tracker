const { query } = require('./config/database');
const fs = require('fs');
const path = require('path');

const initDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');
    
    // Read the init.sql file
    const initSqlPath = path.join(__dirname, '../database/init.sql');
    const initSql = fs.readFileSync(initSqlPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = initSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await query(statement);
          console.log('✅ Executed SQL statement');
        } catch (error) {
          // Ignore errors for statements that might already exist
          if (!error.message.includes('already exists') && !error.message.includes('does not exist')) {
            console.error('❌ SQL execution error:', error.message);
          }
        }
      }
    }
    
    console.log('✅ Database initialization completed!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
};

module.exports = { initDatabase };
