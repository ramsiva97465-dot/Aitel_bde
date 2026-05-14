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
  const [users, setUsers] = useState(USERS);
  const [followUps, setFollowUps] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [quotations, setQuotations] = useState([]);
  
  // Track round-robin index for auto-assignment
  const [nextBDEIndex, setNextBDEIndex] = useState(0);

  // Performance Goals (Admin Set)
  const [monthlyGoal, setMonthlyGoal] = useState(Number(localStorage.getItem('bde_monthly_goal')) || 20);

  // ---- SUPABASE INTEGRATION ----
  useEffect(() => {
    if (!supabase) return;

    // 1. Initial Fetch from Render via Local or Production Bridge
    const fetchLeads = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        
        // 1. Fetch Leads
        const lRes = await fetch(`${backendUrl}/api/leads`);
        const lData = await lRes.json();
        if (lData && Array.isArray(lData)) {
          const mappedLeads = lData.map(l => ({
            ...l,
            customerName: l.customer_name,
            companyName: l.company_name,
            statusHistory: l.statusHistory || [{ status: l.status, date: l.created_at, updatedBy: 'System' }]
          }));
          setLeads(mappedLeads);
        }

        // 2. Fetch Users
        const uRes = await fetch(`${backendUrl}/api/users`);
        const uData = await uRes.json();
        if (uData && Array.isArray(uData)) {
          setUsers(uData);
        }
        // 3. Fetch Followups
        const fRes = await fetch(`${backendUrl}/api/followups`);
        const fData = await fRes.json();
        if (fData && Array.isArray(fData)) {
          setFollowUps(fData);
        }
      } catch (err) {
        console.warn('Bridge fetch failed:', err.message);
      }
    };

    fetchLeads();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchLeads, 30000);
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
  const addUser = (user) => {
    setUsers((prev) => [...prev, user]);
  };

  const updateUser = (userId, updates) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
    );
  };

  const deleteUser = (userId) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const updateMonthlyGoal = (goal) => {
    setMonthlyGoal(goal);
    localStorage.setItem('bde_monthly_goal', goal.toString());
  };

  // ---- INVOICES ----
  const addInvoice = (invoiceData) => {
    const invoice = {
      ...invoiceData,
      id: `inv${invoices.length + 1}`,
      invoiceNumber: generateInvoiceNumber(invoices),
      createdAt: todayISO(),
    };
    setInvoices((prev) => [...prev, invoice]);
    return invoice;
  };

  // ---- QUOTATIONS ----
  const addQuotation = (quotData) => {
    const quotation = {
      ...quotData,
      id: `q${quotations.length + 1}`,
      quotationNumber: generateQuotationNumber(quotations),
      createdAt: todayISO(),
    };
    setQuotations((prev) => [...prev, quotation]);
    return quotation;
  };

  // ---- HELPERS ----
  const getBDEName = (bdeId) => {
    const u = users.find((u) => u.id === bdeId);
    return u ? u.name : '—';
  };

  const getLeadById = (leadId) => leads.find((l) => l.id === leadId);

  const getLeadsForBDE = (bdeId) => leads.filter((l) => l.assignedTo === bdeId);

  const getBDEs = () => users.filter((u) => u.role === 'bde');

  const markLeadSeen = (leadId) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, isSeen: true } : l))
    );
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
        monthlyGoal,
        updateMonthlyGoal,
      }}
    >
      {children}
    </LeadContext.Provider>
  );
};

export const useLead = () => useContext(LeadContext);
