const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password123@localhost:5432/family_health_tracker',
  ssl: false,
});

async function checkDatabase() {
  try {
    console.log('🔍 Checking database...');
    
    // Check if users table exists and has data
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`📊 Users in database: ${usersResult.rows[0].count}`);
    
    if (usersResult.rows[0].count > 0) {
      const userDetails = await pool.query('SELECT id, email, first_name, last_name FROM users LIMIT 5');
      console.log('👥 User details:');
      userDetails.rows.forEach(user => {
        console.log(`  - ${user.email} (${user.first_name} ${user.last_name})`);
      });
    } else {
      console.log('❌ No users found in database');
      console.log('💡 You need to register a user first');
    }
    
    // Check families table
    const familiesResult = await pool.query('SELECT COUNT(*) as count FROM families');
    console.log(`🏠 Families in database: ${familiesResult.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabase();
