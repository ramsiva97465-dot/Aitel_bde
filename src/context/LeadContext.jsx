import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  LEADS as INITIAL_LEADS,
  USERS,
  FOLLOWUPS as INITIAL_FOLLOWUPS,
  INVOICES as INITIAL_INVOICES,
  QUOTATIONS as INITIAL_QUOTATIONS,
} from '../data/seedData';
import { distributeLeads } from '../utils/leadDistributor';
import { todayISO } from '../utils/dateHelpers';
import { generateInvoiceNumber, generateQuotationNumber } from '../utils/calculations';

const LeadContext = createContext(null);

export const LeadProvider = ({ children }) => {
  const [leads, setLeads] = useState([]); // Real leads only - no mock data
  const [users, setUsers] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [quotations, setQuotations] = useState([]);
  
  // Track round-robin index for auto-assignment
  const [nextBDEIndex, setNextBDEIndex] = useState(0);

  // Performance Goals (Admin Set)
  const [monthlyGoal, setMonthlyGoal] = useState(Number(localStorage.getItem('bde_monthly_goal')) || 20);

  // ---- CORE DATA FETCH (runs on mount + every 30s) ----
  const fetchAllData = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

      // 1. Leads
      const lRes = await fetch(`${backendUrl}/api/leads`);
      if (lRes.ok) {
        const lData = await lRes.json();
        if (Array.isArray(lData)) {
          setLeads(lData.map(l => ({
            ...l,
            customerName: l.customer_name,
            companyName: l.company_name,
            assignedTo: l.assigned_to,
            createdAt: l.created_at,
            isSeen: l.is_seen,
            notes: l.notes || [],
            statusHistory: l.status_history || [{ status: l.status, date: l.created_at, updatedBy: 'System' }]
          })));
        }
      }

      // 2. Users / Executives
      const uRes = await fetch(`${backendUrl}/api/users`);
      if (uRes.ok) {
        const uData = await uRes.json();
        if (Array.isArray(uData)) setUsers(uData);
      }

      // 3. Follow-ups
      const fRes = await fetch(`${backendUrl}/api/followups`);
      if (fRes.ok) {
        const fData = await fRes.json();
        if (Array.isArray(fData)) {
          setFollowUps(fData.map(f => ({
            ...f,
            bdeId: f.bde_id,
            leadId: f.lead_id
          })));
        }
      }

      // 4. Invoices
      const invRes = await fetch(`${backendUrl}/api/invoices`);
      if (invRes.ok) {
        const invData = await invRes.json();
        if (Array.isArray(invData)) setInvoices(invData);
      }

      // 5. Quotations
      const qRes = await fetch(`${backendUrl}/api/quotations`);
      if (qRes.ok) {
        const qData = await qRes.json();
        if (Array.isArray(qData)) setQuotations(qData);
      }
    } catch (err) {
      console.warn('⚠️ Data fetch failed:', err.message);
    }
  };

  useEffect(() => {
    fetchAllData(); // Load everything on start
    const interval = setInterval(fetchAllData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // ---- LEADS ----
  const updateLeadStatus = async (leadId, status, notes, updatedByName) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const historyEntry = {
        status,
        date: todayISO(),
        updatedBy: updatedByName,
        notes: notes || '',
      };

      const response = await fetch(`${backendUrl}/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, status_history: [...(getLeadById(leadId)?.statusHistory || []), historyEntry] })
      });

      if (!response.ok) throw new Error('Failed to update lead in database');

      // Update local state
      setLeads((prev) => {
        return prev.map((l) => {
          if (l.id !== leadId) return l;
          return { ...l, status, statusHistory: [...(l.statusHistory || []), historyEntry] };
        });
      });

      // Auto-Promotion Logic: If a lead is finished, promote one from queue
      const finalStatuses = ['Converted', 'Not Interested', 'Invoice Raised', 'Pro-forma Raised', 'Tax Invoice Raised'];
      if (finalStatuses.includes(status)) {
        const myLeads = leads.filter(l => l.assignedTo === currentUser?.id);
        const activeCount = myLeads.filter(l => l.status !== 'In Queue' && !finalStatuses.includes(l.status)).length;
        
        // If we have space in pipeline (limit 10), and there are leads in queue
        if (activeCount < 10) {
          const nextInQueue = myLeads.find(l => l.status === 'In Queue');
          if (nextInQueue) {
            // Promote nextInQueue to 'New'
            await updateLeadStatus(nextInQueue.id, 'New', 'System Auto', 'Auto-promoted from Queue');
          }
        }
      }
    } catch (err) {
      console.error('❌ Status Update Failed:', err.message);
    }
  };

  const assignLead = async (leadId, bdeId) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_to: bdeId })
      });

      if (!response.ok) throw new Error('Failed to assign lead in database');

      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, assignedTo: bdeId, isSeen: false } : l))
      );
    } catch (err) {
      console.error('❌ Assignment Failed:', err.message);
    }
  };

  const autoDistribute = () => {
    const bdes = users.filter((u) => u.role === 'bde');
    const { updatedLeads, assignmentSummary } = distributeLeads(leads, bdes);
    setLeads(updatedLeads);
    return assignmentSummary;
  };

  const addNoteToLead = async (leadId, noteText, authorName) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const note = { text: noteText, createdAt: todayISO(), by: authorName };
      
      const response = await fetch(`${backendUrl}/api/leads/${leadId}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note })
      });

      if (!response.ok) throw new Error('Failed to save note');

      setLeads((prev) =>
        prev.map((l) => {
          if (l.id !== leadId) return l;
          return { ...l, notes: [...l.notes, note] };
        })
      );
    } catch (err) {
      console.error('❌ Note Save Failed:', err.message);
    }
  };

  const addLead = async (lead) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: lead.customerName,
          email: lead.email,
          phone: lead.phone,
          company_name: lead.companyName,
          requirement: lead.requirement,
          source: lead.source || 'Manual',
          status: lead.status || 'In Queue',
          assigned_to: lead.assignedTo
        })
      });

      if (!response.ok) throw new Error('Failed to save manual lead to database');
      const savedLead = await response.json();

      const newLead = {
        ...savedLead,
        customerName: savedLead.customer_name,
        companyName: savedLead.company_name,
        statusHistory: [{ status: savedLead.status, date: todayISO(), updatedBy: 'System', notes: 'Lead Created' }],
        notes: [],
        isSeen: false
      };

      setLeads((prev) => [...prev, newLead]);
      return newLead;
    } catch (err) {
      console.error('❌ Manual Lead Save Failed:', err.message);
    }
  };

  // ---- FOLLOWUPS ----
  const addFollowUp = async (followup) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/followups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: followup.leadId,
          bdeId: followup.bdeId,
          date: followup.date,
          time: followup.time,
          notes: followup.notes
        })
      });

      if (!response.ok) throw new Error('Failed to save follow-up');
      const savedFollowup = await response.json();
      setFollowUps((prev) => [...prev, savedFollowup]);
    } catch (err) {
      console.error('❌ Follow-up Save Failed:', err.message);
    }
  };

  // ---- USERS / BDE ----
  const addUser = async (user) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          password: user.password || 'welcome123',
          phone: user.phone,
          role: user.role || 'bde'
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to register user');
      }
      // Re-fetch all users from DB so UI updates immediately
      await fetchAllData();
      return true;
    } catch (err) {
      console.error('❌ User Addition Failed:', err.message);
      throw err;
    }
  };

  const updateUser = async (userId, updates) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update user');
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
      );
    } catch (err) {
      console.error('❌ User Update Failed:', err.message);
    }
  };

  const deleteUser = async (userId) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/users/${userId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete user');
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error('❌ User Deletion Failed:', err.message);
    }
  };

  const updateMonthlyGoal = (goal) => {
    setMonthlyGoal(goal);
    localStorage.setItem('bde_monthly_goal', goal.toString());
  };

  // ---- INVOICES ----
  const addInvoice = async (invoiceData) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const invoice = {
        ...invoiceData,
        invoiceNumber: generateInvoiceNumber(invoices),
        status: invoiceData.status || 'Sent'
      };

      const response = await fetch(`${backendUrl}/api/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: invoice.leadId,
          invoiceNumber: invoice.invoiceNumber,
          serviceName: invoice.serviceName,
          quantity: invoice.quantity,
          price: invoice.price,
          tax: invoice.tax,
          total: invoice.total,
          status: invoice.status
        })
      });

      if (!response.ok) throw new Error('Failed to save invoice');
      const saved = await response.json();
      setInvoices((prev) => [...prev, saved]);
      
      // Auto-update lead status to update dashboard counters
      if (invoice.leadId) {
        updateLeadStatus(invoice.leadId, 'Invoice Raised', 'System', 'Invoice Generated');
      }
      
      return saved;
    } catch (err) {
      console.error('❌ Invoice Save Failed:', err.message);
    }
  };

  // ---- QUOTATIONS ----
  const addQuotation = async (quotData) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const quotation = {
        ...quotData,
        quotationNumber: generateQuotationNumber(quotations),
        status: quotData.status || 'Sent'
      };

      const response = await fetch(`${backendUrl}/api/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: quotation.leadId,
          quotationNumber: quotation.quotationNumber,
          serviceName: quotation.serviceName,
          quantity: quotation.quantity,
          price: quotation.price,
          tax: quotation.tax,
          total: quotation.total,
          status: quotation.status
        })
      });

      if (!response.ok) throw new Error('Failed to save quotation');
      const saved = await response.json();
      setQuotations((prev) => [...prev, saved]);
      
      // Auto-update lead status to update dashboard counters
      if (quotation.leadId) {
        updateLeadStatus(quotation.leadId, 'Quotation Raised', 'System', 'Quotation Generated');
      }
      
      return saved;
    } catch (err) {
      console.error('❌ Quotation Save Failed:', err.message);
    }
  };

  // ---- HELPERS ----
  const getBDEName = (bdeId) => {
    if (!bdeId) return '—';
    // Use loose equality to handle string/number mismatch from DB
    const u = users.find((u) => u.id == bdeId);
    return u ? u.name : '—';
  };

  const getLeadById = (leadId) => leads.find((l) => l.id == leadId);

  const getLeadsForBDE = (bdeId) => leads.filter((l) => l.assignedTo == bdeId);

  const getBDEs = () => users.filter((u) => u.role === 'bde');

  const markLeadSeen = async (leadId) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      await fetch(`${backendUrl}/api/leads/${leadId}/seen`, { method: 'PATCH' });
      setLeads((prev) =>
        prev.map((l) => (l.id == leadId ? { ...l, isSeen: true } : l))
      );
    } catch (err) {
      console.error('❌ Mark Seen Failed:', err.message);
    }
  };

  const deleteLead = async (leadId) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/leads/${leadId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      
      // Update local state for all related data
      setLeads((prev) => prev.filter((l) => l.id != leadId));
      setFollowUps((prev) => prev.filter((f) => f.lead_id != leadId && f.leadId != leadId));
      setInvoices((prev) => prev.filter((i) => i.lead_id != leadId && i.leadId != leadId));
      setQuotations((prev) => prev.filter((q) => q.lead_id != leadId && q.leadId != leadId));
      
      return true;
    } catch (err) {
      console.error('❌ Delete Lead Failed:', err.message);
      return false;
    }
  };

  return (
    <LeadContext.Provider
      value={{
        leads,
        users,
        followUps,
        invoices,
        quotations,
        updateLeadStatus,
        assignLead,
        autoDistribute,
        addNoteToLead,
        addLead,
        addFollowUp,
        addUser,
        updateUser,
        deleteUser,
        addInvoice,
        addQuotation,
        getBDEName,
        getLeadById,
        getLeadsForBDE,
        getBDEs,
        markLeadSeen,
        deleteLead,
        monthlyGoal,
        updateMonthlyGoal,
      }}
    >
      {children}
    </LeadContext.Provider>
  );
};

export const useLead = () => useContext(LeadContext);
