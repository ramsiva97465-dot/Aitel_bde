const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    console.log('🔍 CHECKING TABLES...');
    
    const leads = await pool.query('SELECT id, customer_name FROM demo_requests LIMIT 5');
    console.log('Recent Leads:', leads.rows);
    
    const followups = await pool.query('SELECT id, lead_id, notes FROM follow_ups LIMIT 10');
    console.log('Recent Follow-ups:', followups.rows);
    
    // Check if any follow-up has a lead_id that DOES NOT EXIST in demo_requests
    const orphans = await pool.query(`
      SELECT f.id, f.lead_id 
      FROM follow_ups f 
      LEFT JOIN demo_requests d ON f.lead_id = d.id 
      WHERE d.id IS NULL
    `);
    console.log('Found Orphaned Follow-ups (No matching lead):', orphans.rows.length);
    
    if (orphans.rows.length > 0) {
      console.log('🧹 CLEANING ORPHANS...');
      await pool.query(`
        DELETE FROM follow_ups 
        WHERE lead_id NOT IN (SELECT id FROM demo_requests)
      `);
      console.log('✅ Orphaned follow-ups DELETED!');
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

check();
