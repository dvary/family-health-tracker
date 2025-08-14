const fs = require('fs');
const path = require('path');
const { query } = require('../config/database');

async function runMigrations() {
  try {
    console.log('🔄 Starting database migration...');
    
    // Read the init.sql file
    const initSqlPath = path.join(__dirname, '../../database/init.sql');
    const initSql = fs.readFileSync(initSqlPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = initSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await query(statement);
          console.log(`✅ Executed statement ${i + 1}/${statements.length}`);
        } catch (error) {
          // Skip if table already exists or extension already enabled
          if (error.code === '42P07' || error.code === '42710' || error.code === '42701') {
            console.log(`⏭️  Skipped statement ${i + 1}/${statements.length} (already exists)`);
          } else {
            console.error(`❌ Error executing statement ${i + 1}/${statements.length}:`, error.message);
            throw error;
          }
        }
      }
    }
    
    console.log('🎉 Database migration completed successfully!');
    console.log('📊 Database schema is ready for use');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  runMigrations().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}

module.exports = { runMigrations };
