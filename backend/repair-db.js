const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function repair() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log('--- Database Repair Script ---');
  
  try {
    // 1. Disable Foreign Key Checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('[1] Disabled foreign key checks.');

    // 2. Modify employer_id to allow NULL (This is the critical part for SET NULL)
    // We also use this opportunity to add mentor_id if it's missing.
    
    // Check if mentor_id already exists to avoid errors on multiple runs
    const [columns] = await connection.query('SHOW COLUMNS FROM employer_student_interactions');
    const hasMentorId = columns.some(col => col.Field === 'mentor_id');

    if (!hasMentorId) {
      console.log('[2] Adding mentor_id column...');
      await connection.query('ALTER TABLE employer_student_interactions ADD COLUMN mentor_id INT NULL AFTER employer_id');
    } else {
      console.log('[2] mentor_id column already exists.');
    }

    console.log('[3] Relaxing employer_id nullability...');
    await connection.query('ALTER TABLE employer_student_interactions MODIFY COLUMN employer_id INT NULL');

    // 3. Drop existing problematic foreign keys if they exist (they will be recreated by Sequelize sync)
    // MySQL 8.0+ often names these by relationship. We'll let sync handle it, but we make sure the structure is ready.
    
    console.log('[4] Re-enabling foreign key checks.');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('--- REPAIR COMPLETE ---');
    console.log('You can now restart your backend server.');

  } catch (err) {
    console.error('Repair Failed:', err.message);
  } finally {
    await connection.end();
  }
}

repair();
