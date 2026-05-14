// =============================================================
// API Service Layer — AI Telecalling Lead Management System
// =============================================================
// Currently using mock data from seedData.js
// Future: Replace each function with actual fetch() calls to
// your PostgreSQL backend REST API.
// =============================================================

// POST /api/login
export const apiLogin = async (email, password) => {
  // Future: return fetch('/api/login', { method:'POST', body: JSON.stringify({email,password}) })
  return null; // handled via context mock
};

// GET /api/leads
export const apiGetLeads = async () => {
  // Future: return fetch('/api/leads').then(r => r.json())
  return [];
};

// POST /api/leads
export const apiCreateLead = async (lead) => {
  // Future: return fetch('/api/leads', { method:'POST', body: JSON.stringify(lead) })
  return lead;
};

// PATCH /api/leads/:id/status
export const apiUpdateLeadStatus = async (leadId, status, notes) => {
  // Future: return fetch(`/api/leads/${leadId}/status`, { method:'PATCH', body: JSON.stringify({status,notes}) })
  return { leadId, status };
};

// PATCH /api/leads/:id/assign
export const apiAssignLead = async (leadId, bdeId) => {
  // Future: return fetch(`/api/leads/${leadId}/assign`, { method:'PATCH', body: JSON.stringify({bdeId}) })
  return { leadId, bdeId };
};

// POST /api/leads/auto-distribute
export const apiAutoDistribute = async () => {
  // Future: return fetch('/api/leads/auto-distribute', { method:'POST' })
  return {};
};

// GET /api/bdes
export const apiGetBDEs = async () => {
  // Future: return fetch('/api/bdes').then(r => r.json())
  return [];
};

// POST /api/bdes
export const apiCreateBDE = async (bde) => {
  // Future: return fetch('/api/bdes', { method:'POST', body: JSON.stringify(bde) })
  return bde;
};

// POST /api/followups
export const apiCreateFollowUp = async (followup) => {
  // Future: return fetch('/api/followups', { method:'POST', body: JSON.stringify(followup) })
  return followup;
};

// POST /api/invoices
export const apiCreateInvoice = async (invoice) => {
  // Future: return fetch('/api/invoices', { method:'POST', body: JSON.stringify(invoice) })
  return invoice;
};

// POST /api/quotations
export const apiCreateQuotation = async (quotation) => {
  // Future: return fetch('/api/quotations', { method:'POST', body: JSON.stringify(quotation) })
  return quotation;
};

// GET /api/notifications
export const apiGetNotifications = async (userId) => {
  // Future: return fetch(`/api/notifications?userId=${userId}`).then(r => r.json())
  return [];
};

// PATCH /api/notifications/:id/read
export const apiMarkNotificationRead = async (notifId) => {
  // Future: return fetch(`/api/notifications/${notifId}/read`, { method:'PATCH' })
  return { notifId };
};
