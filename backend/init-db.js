const { query } = require('./config/database');
const fs = require('fs');
const path = require('path');

const initDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');
    
    // SQL statements for database initialization
    const sqlStatements = [
      // Enable UUID extension
      "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"",
      
      // Drop existing tables if they exist (for clean initialization)
      "DROP TABLE IF EXISTS documents CASCADE",
      "DROP TABLE IF EXISTS medical_reports CASCADE", 
      "DROP TABLE IF EXISTS health_vitals CASCADE",
      "DROP TABLE IF EXISTS family_members CASCADE",
      "DROP TABLE IF EXISTS users CASCADE",
      "DROP TABLE IF EXISTS families CASCADE",
      
      // Create families table
      `CREATE TABLE families (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      // Create users table
      `CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
        role VARCHAR(20) DEFAULT 'non_admin' CHECK (role IN ('admin', 'non_admin')),
        original_email VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      // Create family_members table
      `CREATE TABLE family_members (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        date_of_birth DATE,
        gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
        blood_group VARCHAR(10) CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
        mobile_number VARCHAR(20),
        profile_picture VARCHAR(500),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      // Create health_vitals table
      `CREATE TABLE health_vitals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
        vital_type VARCHAR(50) NOT NULL CHECK (vital_type IN ('height', 'weight', 'cholesterol', 'hemoglobin', 'sgpt', 'sgot', 'vitamin_d', 'thyroid_tsh', 'thyroid_t3', 'thyroid_t4', 'vitamin_b12', 'calcium', 'hba1c', 'urea', 'fasting_blood_glucose', 'creatinine')),
        value DECIMAL(10,2) NOT NULL,
        unit VARCHAR(20) NOT NULL,
        notes TEXT,
        recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      // Create medical_reports table
      `CREATE TABLE medical_reports (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
        report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('lab_report', 'prescription_consultation', 'vaccination', 'hospital_records')),
        report_sub_type VARCHAR(100),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        file_path VARCHAR(500) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_size BIGINT NOT NULL,
        report_date DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      // Create documents table
      `CREATE TABLE documents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        file_path VARCHAR(500) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_size BIGINT NOT NULL,
        upload_date DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      // Create indexes
      "CREATE INDEX idx_users_email ON users(email)",
      "CREATE INDEX idx_users_family_id ON users(family_id)",
      "CREATE INDEX idx_family_members_family_id ON family_members(family_id)",
      "CREATE INDEX idx_family_members_user_id ON family_members(user_id)",
      "CREATE INDEX idx_health_vitals_member_id ON health_vitals(member_id)",
      "CREATE INDEX idx_health_vitals_vital_type ON health_vitals(vital_type)",
      "CREATE INDEX idx_health_vitals_recorded_at ON health_vitals(recorded_at)",
      "CREATE INDEX idx_medical_reports_member_id ON medical_reports(member_id)",
      "CREATE INDEX idx_medical_reports_report_type ON medical_reports(report_type)",
      "CREATE INDEX idx_medical_reports_report_date ON medical_reports(report_date)",
      "CREATE INDEX idx_documents_member_id ON documents(member_id)",
      "CREATE INDEX idx_documents_upload_date ON documents(upload_date)",
      
      // Create triggers function
      `CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'`,
      
      // Create triggers
      "CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON families FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()",
      "CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()",
      "CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON family_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()",
      "CREATE TRIGGER update_health_vitals_updated_at BEFORE UPDATE ON health_vitals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()",
      "CREATE TRIGGER update_medical_reports_updated_at BEFORE UPDATE ON medical_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()",
      "CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()"
    ];
    
    // Execute each statement
    for (const statement of sqlStatements) {
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
