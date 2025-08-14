const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password123@localhost:5432/family_health_tracker',
  ssl: false,
});

async function migrate() {
  try {
    console.log('🔄 Starting database migration...');

    // Update health_vitals table to support new vital types
    await pool.query(`
      ALTER TABLE health_vitals 
      DROP CONSTRAINT IF EXISTS health_vitals_vital_type_check;
    `);

    await pool.query(`
      ALTER TABLE health_vitals 
      ADD CONSTRAINT health_vitals_vital_type_check 
      CHECK (vital_type IN (
        'blood_pressure', 'blood_sugar', 'oxygen', 'weight', 'height', 'temperature', 
        'heart_rate', 'bmi', 'cholesterol', 'hemoglobin', 'platelet_count', 'white_blood_cells',
        'red_blood_cells', 'creatinine', 'urea', 'bilirubin', 'sodium', 'potassium', 'calcium',
        'vitamin_d', 'vitamin_b12', 'thyroid_tsh', 'thyroid_t3', 'thyroid_t4', 'other'
      ));
    `);

    // Update medical_reports table to support new report types and add sub_type column
    await pool.query(`
      ALTER TABLE medical_reports 
      DROP CONSTRAINT IF EXISTS medical_reports_report_type_check;
    `);

    await pool.query(`
      ALTER TABLE medical_reports 
      ADD CONSTRAINT medical_reports_report_type_check 
      CHECK (report_type IN ('lab_report', 'prescription_consultation', 'vaccination', 'hospital_records'));
    `);

    // Add report_sub_type column if it doesn't exist
    const subTypeExists = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'medical_reports' AND column_name = 'report_sub_type';
    `);

    if (subTypeExists.rows.length === 0) {
      await pool.query(`
        ALTER TABLE medical_reports 
        ADD COLUMN report_sub_type VARCHAR(100);
      `);
    }

    console.log('✅ Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrate();
