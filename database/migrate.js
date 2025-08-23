const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password123@localhost:5432/family_health_tracker'
});

async function migrate() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database migration...');
    
    // Check if blood_group column exists
    const bloodGroupCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'family_members' AND column_name = 'blood_group'
    `);
    
    if (bloodGroupCheck.rows.length === 0) {
      console.log('Adding blood_group column...');
      await client.query(`
        ALTER TABLE family_members 
        ADD COLUMN blood_group VARCHAR(10) CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'))
      `);
      console.log('✓ blood_group column added successfully');
    } else {
      console.log('✓ blood_group column already exists');
    }
    
    // Check if mobile_number column exists
    const mobileNumberCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'family_members' AND column_name = 'mobile_number'
    `);
    
    if (mobileNumberCheck.rows.length === 0) {
      console.log('Adding mobile_number column...');
      await client.query(`
        ALTER TABLE family_members 
        ADD COLUMN mobile_number VARCHAR(20)
      `);
      console.log('✓ mobile_number column added successfully');
    } else {
      console.log('✓ mobile_number column already exists');
    }
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrate()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrate };
