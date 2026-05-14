require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function fixRoles() {
  try {
    const res = await pool.query("UPDATE users SET role = 'admin' WHERE email = 'hari@gmail.com' RETURNING *");
    console.log('Fixed hari@gmail.com to admin');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
fixRoles();
