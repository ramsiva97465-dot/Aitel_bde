const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Render PostgreSQL Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.on('connect', () => {
  console.log('🐘 Connected to Render PostgreSQL');
});

// Initialize Tables
const initDB = async () => {
  try {
    // 1. Leads Table (Ensure it matches our queries)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS demo_requests (
        id SERIAL PRIMARY KEY,
        customer_name TEXT,
        email TEXT,
        phone TEXT,
        company_name TEXT,
        requirement TEXT,
        source TEXT,
        status TEXT DEFAULT 'New',
        assigned_to TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT,
        role TEXT DEFAULT 'bde',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create default admin if not exists
    await pool.query(`
      INSERT INTO users (name, email, password, role) 
      VALUES ('Admin User', 'admin@aitel.com', 'admin123', 'admin')
      ON CONFLICT (email) DO NOTHING
    `);

    console.log('✅ DATABASE SYNC: Render PostgreSQL is ALIVE!');
  } catch (err) {
    console.error('❌ DATABASE SYNC FAILED:', err.message);
  }
};
initDB();

app.use(cors());
app.use(bodyParser.json());

// --- AUTH ENDPOINTS ---

// Register
app.post('/api/register', async (req, res) => {
  const { name, email, password, phone, role } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
      [name, email, password, phone, role || 'admin']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Registration Error:', err.message);
    res.status(500).json({ error: 'Email already exists or database error' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT id, name, email, password, role FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (err) {
    console.error('❌ Login Error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

let pendingLeads = [];

// Meta Webhook Verification (Handshake)
app.get('/api/webhooks/portal', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('🔍 Meta Handshake Request:');
  console.log('Mode:', mode);
  console.log('Token:', token);
  console.log('Challenge:', challenge);

  if (mode === 'subscribe' && token === 'aitel_meta_verify_2026') {
    console.log('✅ Handshake SUCCESS!');
    return res.status(200).send(challenge);
  }
  
  console.error('❌ Handshake FAILED: Token mismatch or invalid mode.');
  res.status(403).send('Verification failed');
});

// Webhook Endpoint (POST)
app.post('/api/webhooks/portal', async (req, res) => {
  const data = req.body;
  console.log('📬 Webhook Received:', JSON.stringify(data, null, 2));

  // Determine if it's Meta or Portal
  const isMeta = data.object === 'page';
  const source = isMeta ? 'Meta Ads' : 'Company Portal';
  
  const processedLead = {
    customerName: isMeta ? 'New Meta Lead' : data.customerName,
    phone: isMeta ? 'Check Meta Suite' : data.phone,
    email: data.email || '',
    companyName: data.companyName || '—',
    source: source,
    id: `web-${Date.now()}`,
    createdAt: new Date().toISOString()
  };

  // Save to Render PostgreSQL
  try {
    const { customerName, email, phone, companyName } = processedLead;
    await pool.query(
      'INSERT INTO demo_requests (name, email, phone, company, source, status) VALUES ($1, $2, $3, $4, $5, $6)',
      [customerName, email, phone, companyName, source, 'New']
    );
    console.log('✅ Lead saved to Render PostgreSQL');
  } catch (err) {
    console.error('❌ Failed to save lead to Render:', err.message);
  }

  pendingLeads.push(processedLead);
  res.json({ success: true, message: 'Lead received and synced to Render.' });
});

// Polling Endpoint
app.get('/api/leads/pending', (req, res) => {
  const currentBatch = [...pendingLeads];
  pendingLeads = []; 
  res.json(currentBatch);
});

// Manual Lead Creation
app.post('/api/leads', async (req, res) => {
  const { customer_name, email, phone, company_name, requirement, source, status, assigned_to } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO demo_requests (customer_name, email, phone, company_name, requirement, source, status, assigned_to) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [customer_name, email, phone, company_name, requirement, source || 'Manual', status || 'New', assigned_to]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Lead Creation Error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update Lead (Status, Assignment, etc.)
app.patch('/api/leads/:id', async (req, res) => {
  const { id } = req.params;
  const { status, assigned_to } = req.body;
  try {
    let query = 'UPDATE demo_requests SET ';
    const params = [];
    if (status) {
      params.push(status);
      query += `status = $${params.length}, `;
    }
    if (assigned_to) {
      params.push(assigned_to);
      query += `assigned_to = $${params.length}, `;
    }
    query = query.slice(0, -2); // Remove trailing comma
    params.push(id);
    query += ` WHERE id = $${params.length} RETURNING *`;

    const result = await pool.query(query, params);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Lead not found' });
    }
  } catch (err) {
    console.error('❌ Lead Update Error:', err.message);
    res.status(500).json({ error: 'Database update failed' });
  }
});

// Fetch Users
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, phone, role FROM users ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Failed to fetch users:', err.message);
    res.status(500).json({ error: 'Database fetch failed' });
  }
});

// Fetching Endpoint for Dashboard
app.get('/api/leads', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM demo_requests ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Failed to fetch leads from Render:', err.message);
    res.status(500).json({ error: 'Database fetch failed' });
  }
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Local Webhook Bridge active on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ PORT ${PORT} IS ALREADY IN USE!`);
    console.error(`Please close any other terminal running on port ${PORT} and try again.`);
  } else {
    console.error('❌ Server Error:', err.message);
  }
});

process.on('uncaughtException', (err) => {
  console.error('🔥 UNCAUGHT CRASH:', err.message);
});
