require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function fixNullRoles() {
  try {
    const res = await pool.query("UPDATE users SET role = 'bde' WHERE role IS NULL RETURNING email");
    console.log('Fixed users:', res.rows.map(r => r.email));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
fixNullRoles();
