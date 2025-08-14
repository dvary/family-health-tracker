const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password123@localhost:5432/family_health_tracker',
  ssl: false,
});

async function checkUser() {
  try {
    console.log('🔍 Checking user details...');
    
    const userResult = await pool.query('SELECT id, email, first_name, last_name, password FROM users');
    console.log('👥 User details:');
    userResult.rows.forEach(user => {
      console.log(`  - Email: "${user.email}"`);
      console.log(`    Name: ${user.first_name} ${user.last_name}`);
      console.log(`    Password hash: ${user.password.substring(0, 20)}...`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    await pool.end();
  }
}

checkUser();
