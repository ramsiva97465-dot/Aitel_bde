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
  ssl: {
    rejectUnauthorized: false // Required for Render
  }
});

pool.on('connect', () => {
  console.log('🐘 Connected to Render PostgreSQL');
});

// Test Connection Immediately
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ DATABASE CONNECTION FAILED:', err.message);
    console.error('Check your DATABASE_URL in .env');
  } else {
    console.log('✅ DATABASE SYNC: Render PostgreSQL is ALIVE!');
  }
});

app.use(cors());
app.use(bodyParser.json());

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

// Polling / Fetching Endpoint for Dashboard
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
