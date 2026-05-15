const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkNotifications() {
  try {
    const res = await pool.query('SELECT * FROM notifications LIMIT 1');
    console.log('Notification Schema:', res.rows[0]);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkNotifications();
