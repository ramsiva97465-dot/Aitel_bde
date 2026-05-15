require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function migrate() {
  try {
    // 1. Add last_assigned_at to users for Round Robin
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`);
    
    // 2. Ensure all existing BDEs have an initial value
    await pool.query(`UPDATE users SET last_assigned_at = CURRENT_TIMESTAMP WHERE role = 'bde' AND last_assigned_at IS NULL`);
    
    console.log('Migration successful: Round Robin ready.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
migrate();
