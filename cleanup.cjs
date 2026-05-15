require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function cleanup() {
  try {
    // Delete the one with null role
    await pool.query("DELETE FROM users WHERE email = 'Gopi@gmail.com' AND role IS NULL");
    
    // Ensure the lowercase one has the correct role
    await pool.query("UPDATE users SET role = 'bde', status = 'active' WHERE email = 'gopi@gmail.com'");
    
    console.log('Cleanup successful.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
cleanup();
