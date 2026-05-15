const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Render PostgreSQL Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.on('connect', () => {
  console.log('🐘 Connected to Render PostgreSQL');
});

// Initialize Tables — Complete Schema
const initDB = async () => {
  try {
    // ══════════════════════════════════════════
    // TABLE 1: LEADS (demo_requests)
    // Fields: all lead data + notes + status history
    // ══════════════════════════════════════════
    await pool.query(`
      CREATE TABLE IF NOT EXISTS demo_requests (
        id SERIAL PRIMARY KEY,
        customer_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        company_name TEXT,
        requirement TEXT,
        source TEXT DEFAULT 'Manual',
        status TEXT DEFAULT 'New',
        assigned_to TEXT,
        notes JSONB DEFAULT '[]',
        status_history JSONB DEFAULT '[]',
        is_seen BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ══════════════════════════════════════════
    // TABLE 2: USERS (admins + BDEs)
    // Fields: auth + role + status
    // ══════════════════════════════════════════
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT,
        role TEXT DEFAULT 'bde',
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ══════════════════════════════════════════
    // TABLE 3: FOLLOW-UPS
    // Fields: linked to lead + BDE + schedule
    // ══════════════════════════════════════════
    await pool.query(`
      CREATE TABLE IF NOT EXISTS follow_ups (
        id SERIAL PRIMARY KEY,
        lead_id INTEGER,
        bde_id TEXT,
        date TEXT,
        time TEXT,
        notes TEXT,
        status TEXT DEFAULT 'Pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ══════════════════════════════════════════
    // TABLE 4: INVOICES
    // Fields: full billing details per lead
    // ══════════════════════════════════════════
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        lead_id INTEGER,
        invoice_number TEXT UNIQUE,
        service_name TEXT,
        quantity INTEGER DEFAULT 1,
        price DECIMAL DEFAULT 0,
        tax DECIMAL DEFAULT 18,
        total DECIMAL DEFAULT 0,
        amount DECIMAL DEFAULT 0,
        status TEXT DEFAULT 'Sent',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ══════════════════════════════════════════
    // TABLE 5: QUOTATIONS
    // Fields: full billing details per lead
    // ══════════════════════════════════════════
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quotations (
        id SERIAL PRIMARY KEY,
        lead_id INTEGER,
        quotation_number TEXT UNIQUE,
        service_name TEXT,
        quantity INTEGER DEFAULT 1,
        price DECIMAL DEFAULT 0,
        tax DECIMAL DEFAULT 18,
        total DECIMAL DEFAULT 0,
        amount DECIMAL DEFAULT 0,
        status TEXT DEFAULT 'Sent',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ══════════════════════════════════════════
    // TABLE 6: NOTIFICATIONS
    // Fields: per-user alerts with read status
    // ══════════════════════════════════════════
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        title TEXT,
        message TEXT,
        type TEXT,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ══════════════════════════════════════════
    // SAFE MIGRATIONS — Add missing columns to
    // existing tables without data loss
    // ══════════════════════════════════════════
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'`);
    await pool.query(`ALTER TABLE demo_requests ADD COLUMN IF NOT EXISTS notes JSONB DEFAULT '[]'`);
    await pool.query(`ALTER TABLE demo_requests ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]'`);
    await pool.query(`ALTER TABLE demo_requests ADD COLUMN IF NOT EXISTS assigned_to TEXT`);
    await pool.query(`ALTER TABLE demo_requests ADD COLUMN IF NOT EXISTS is_seen BOOLEAN DEFAULT false`);
    await pool.query(`ALTER TABLE demo_requests ADD COLUMN IF NOT EXISTS requirement TEXT`);
    await pool.query(`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS service_name TEXT`);
    await pool.query(`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1`);
    await pool.query(`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS price DECIMAL DEFAULT 0`);
    await pool.query(`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax DECIMAL DEFAULT 18`);
    await pool.query(`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS total DECIMAL DEFAULT 0`);
    await pool.query(`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS service_name TEXT`);
    await pool.query(`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1`);
    await pool.query(`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS price DECIMAL DEFAULT 0`);
    await pool.query(`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS tax DECIMAL DEFAULT 18`);
    await pool.query(`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS total DECIMAL DEFAULT 0`);

    // Default Admin Account
    await pool.query(`
      INSERT INTO users (name, email, password, role, status)
      VALUES ('Admin User', 'admin@aitel.com', 'admin123', 'admin', 'active')
      ON CONFLICT (email) DO NOTHING
    `);

    console.log('✅ DATABASE SYNC: All 6 tables ready. Zero data loss guaranteed!');
  } catch (err) {
    console.error('❌ DATABASE SYNC FAILED:', err.message);
  }
};
initDB();

app.use(cors());
app.use(bodyParser.json());

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', server: 'live', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: err.message });
  }
});

// --- AUTH ENDPOINTS ---

// Register
app.post('/api/register', async (req, res) => {
  const { name, email, password, phone, role } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (name, email, password, phone, role, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, status',
      [name, email, password, phone, role || 'admin', 'active']
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
      'SELECT id, name, email, password, role, status FROM users WHERE email = $1 AND password = $2',
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

// Round Robin Helper
async function getNextBDE() {
  const bdeRes = await pool.query(`
    SELECT id FROM users 
    WHERE role = 'bde' AND status = 'active'
    ORDER BY last_assigned_at ASC NULLS FIRST LIMIT 1
  `);
  if (bdeRes.rows.length > 0) {
    const bdeId = bdeRes.rows[0].id;
    await pool.query('UPDATE users SET last_assigned_at = CURRENT_TIMESTAMP WHERE id = $1', [bdeId]);
    return bdeId;
  }
  return null;
}

// Webhook Endpoint (POST)
app.post('/api/webhooks/portal', async (req, res) => {
  const data = req.body;
  console.log('📬 Webhook Received:', JSON.stringify(data, null, 2));

  const isMeta = data.object === 'page' || data.leadgen_id;
  const source = isMeta ? 'Meta Ads' : 'Company Portal';
  
  // Ultra-flexible mapping to catch fields from any form (like the one in the screenshot)
  const customerName = data.fullName || data.full_name || data['Full Name'] || data.customerName || data.name || (isMeta ? 'New Meta Lead' : 'Unknown Client');
  const phone = data.phoneNumber || data.phone_number || data['Phone Number'] || data.phone || (isMeta ? 'Check Meta Suite' : '');
  const email = data.email || data.email_address || data.Email || '';
  const companyName = data.companyName || data.company_name || data['Company Name'] || data.Company || data.company || '—';
  const requirement = data.requirement || data.message || data.notes || data.Requirement || '—';
  let status = data.status || 'In Queue';

  // ══════════════════════════════════════════
  // INVOICE / QUOTATION WEBHOOK HANDLER
  // ══════════════════════════════════════════

  // ══════════════════════════════════════════
  // INVOICE / QUOTATION WEBHOOK HANDLER
  // ══════════════════════════════════════════
  const isInvoice = data.type === 'invoice' || data.invoice_number || data.invoiceNumber;
  const isQuotation = data.type === 'quotation' || data.quotation_number || data.quotationNumber;

  if (isInvoice || isQuotation) {
    try {
      // 1. Find the lead by email or phone to link the document
      const leadRes = await pool.query('SELECT id FROM demo_requests WHERE email = $1 OR phone = $2 LIMIT 1', [email, phone]);
      let leadId = leadRes.rows.length > 0 ? leadRes.rows[0].id : null;

      // If lead doesn't exist, create a shell lead for this invoice
      if (!leadId) {
        const autoAssignedTo = await getNextBDE();
        const newLead = await pool.query(
          'INSERT INTO demo_requests (customer_name, email, phone, company_name, source, status, assigned_to) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
          [customerName, email, phone, companyName, 'External Billing', isInvoice ? 'Invoice Raised' : 'Quotation Raised', autoAssignedTo]
        );
        leadId = newLead.rows[0].id;
      }

      // 2. Insert Invoice or Quotation
      const amount = data.total || data.amount || data.price || 0;
      const docNumber = data.invoice_number || data.invoiceNumber || data.quotation_number || data.quotationNumber || `${isInvoice ? 'INV' : 'QT'}-${Date.now()}`;
      const serviceName = data.service_name || data.serviceName || data.item || 'External Service';

      if (isInvoice) {
        await pool.query(
          'INSERT INTO invoices (lead_id, invoice_number, service_name, total, status) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
          [leadId, docNumber, serviceName, amount, 'Sent']
        );
        status = 'Invoice Raised';
      } else {
        await pool.query(
          'INSERT INTO quotations (lead_id, quotation_number, service_name, total, status) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
          [leadId, docNumber, serviceName, amount, 'Sent']
        );
        status = 'Quotation Raised';
      }

      // 3. Update the Lead Status so it shows on the Dashboard Counters!
      await pool.query('UPDATE demo_requests SET status = $1 WHERE id = $2', [status, leadId]);
      
      console.log(`✅ Webhook: Processed External ${isInvoice ? 'Invoice' : 'Quotation'} for Lead #${leadId}`);
      return res.status(200).json({ success: true, message: 'Document processed successfully' });
    } catch (err) {
      console.error('❌ Billing Webhook Error:', err.message);
      return res.status(500).json({ error: 'Failed to process billing webhook' });
    }
  }

  // Smart Sync: Update existing lead OR Create new
  try {
    const check = await pool.query(
      'SELECT id FROM demo_requests WHERE email = $1 OR phone = $2 LIMIT 1',
      [email, phone]
    );

    if (check.rows.length > 0) {
      // UPDATE EXISTING
      const leadId = check.rows[0].id;
      await pool.query(
        'UPDATE demo_requests SET status = $1, customer_name = $2, company_name = $3 WHERE id = $4',
        [status, customerName, companyName, leadId]
      );
    } else {
      // INSERT NEW (Auto-Assigned to Queue via Round Robin)
      const autoAssignedTo = await getNextBDE();
      await pool.query(
        'INSERT INTO demo_requests (customer_name, email, phone, company_name, requirement, source, status, assigned_to) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [customerName, email, phone, companyName, requirement, source, 'In Queue', autoAssignedTo]
      );
      console.log('✅ New Webhook Lead Round-Robin Assigned to BDE:', autoAssignedTo);
    }
  } catch (err) {
    console.error('❌ Failed to sync webhook to Render:', err.message);
  }

  res.json({ success: true, message: 'Sync complete.' });
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
    let finalAssignedTo = assigned_to;
    let finalStatus = status || 'New';

    // If no BDE assigned manually, use Round Robin and put in Queue
    if (!finalAssignedTo) {
      finalAssignedTo = await getNextBDE();
      finalStatus = 'In Queue';
    }

    const result = await pool.query(
      'INSERT INTO demo_requests (customer_name, email, phone, company_name, requirement, source, status, assigned_to) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [customer_name, email, phone, company_name, requirement, source || 'Manual', finalStatus, finalAssignedTo]
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
  const { status, assigned_to, status_history } = req.body;
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
    if (status_history) {
      params.push(JSON.stringify(status_history));
      query += `status_history = $${params.length}::jsonb, `;
    }
    
    if (params.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
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
    const result = await pool.query('SELECT id, name, email, phone, role, status FROM users ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Failed to fetch users:', err.message);
    res.status(500).json({ error: 'Database fetch failed' });
  }
});

// Update User
app.patch('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, role, phone } = req.body;
  try {
    await pool.query(
      'UPDATE users SET name = $1, role = $2, phone = $3 WHERE id = $4',
      [name, role, phone, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete User
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

// Add Note to Lead
app.patch('/api/leads/:id/notes', async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;
  try {
    const result = await pool.query(
      'UPDATE demo_requests SET notes = notes || $1::jsonb WHERE id = $2 RETURNING notes',
      [JSON.stringify(note), id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Follow-ups
app.post('/api/followups', async (req, res) => {
  const { leadId, bdeId, date, time, notes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO follow_ups (lead_id, bde_id, date, time, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [leadId, bdeId, date, time, notes]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Follow-up Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/followups', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM follow_ups');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Invoices
app.post('/api/invoices', async (req, res) => {
  const { leadId, invoiceNumber, serviceName, quantity, price, tax, total, status } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO invoices (lead_id, invoice_number, service_name, quantity, price, tax, total, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [leadId, invoiceNumber, serviceName, quantity, price, tax, total, status]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/invoices', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM invoices ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Quotations
app.post('/api/quotations', async (req, res) => {
  const { leadId, quotationNumber, serviceName, quantity, price, tax, total, status } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO quotations (lead_id, quotation_number, service_name, quantity, price, tax, total, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [leadId, quotationNumber, serviceName, quantity, price, tax, total, status]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/quotations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM quotations ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Notifications
app.post('/api/notifications', async (req, res) => {
  const { userId, title, message, type } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, title, message, type]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/notifications/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/notifications/:id/read', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE notifications SET is_read = true WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/leads/:id/seen', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE demo_requests SET is_seen = true WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
