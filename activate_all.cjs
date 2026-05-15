require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function fixStatus() {
  try {
    const res = await pool.query("UPDATE users SET status = 'active' WHERE status IS NULL OR status = '' RETURNING email");
    console.log('Activated users:', res.rows.map(r => r.email));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
fixStatus();
