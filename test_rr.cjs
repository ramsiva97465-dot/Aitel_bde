require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function testRR() {
  try {
    const bdeRes = await pool.query(`
      SELECT id, name, role, status, last_assigned_at 
      FROM users 
      WHERE role = 'bde' AND status = 'active'
      ORDER BY last_assigned_at ASC NULLS FIRST 
      LIMIT 1
    `);
    console.log('Result:', JSON.stringify(bdeRes.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
testRR();
