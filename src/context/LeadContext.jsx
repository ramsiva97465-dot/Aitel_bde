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

    // 1. Initial Fetch from Render via Local Bridge
    const fetchLeads = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/leads');
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
          const mappedLeads = data.map(l => ({
            ...l,
            customerName: l.name,
            companyName: l.company,
            statusHistory: l.statusHistory || [{ status: l.status, date: l.created_at, updatedBy: 'System' }]
          }));
          setLeads(mappedLeads);
        }
      } catch (err) {
        console.warn('Bridge fetch failed (ensure node server.cjs is running)');
      }
    };

    fetchLeads();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchLeads, 30000);
    return () => clearInterval(interval);

    // 2. Real-time Listener (Supabase)
    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'demo_requests' },
        (payload) => {
          console.log('🆕 Supabase Lead:', payload.new);
          addLead({
            ...payload.new,
            customerName: payload.new.name,
            companyName: payload.new.company,
            statusHistory: [{ status: 'New', date: payload.new.created_at, updatedBy: 'System' }]
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ---- LEADS ----
  const updateLeadStatus = async (leadId, status, notes, updatedByName) => {
    // 1. Update Supabase
    if (supabase) {
      const { error } = await supabase
        .from('demo_requests')
        .update({ 
          status, 
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId);

      if (error) {
        console.error('Error updating lead in Supabase:', error);
      }
    }

    // 2. Update local state
    setLeads((prev) => {
      const updatedLeads = prev.map((l) => {
        if (l.id !== leadId) return l;
        const historyEntry = {
          status,
          date: todayISO(),
          updatedBy: updatedByName,
          notes: notes || '',
        };
        return { ...l, status, statusHistory: [...l.statusHistory, historyEntry] };
      });

      // AUTO-FILL PIPELINE LOGIC
      // If the new status is a "Final" state (Converted or Not Interested),
      // find the BDE for this lead and see if we should pull from their queue.
      const finalStates = ['Converted', 'Not Interested'];
      if (finalStates.includes(status)) {
        const lead = prev.find(l => l.id === leadId);
        const bdeId = lead.assignedTo;
        if (bdeId) {
          const bdeLeads = updatedLeads.filter(l => l.assignedTo === bdeId);
          const activeStatuses = ['New', 'Contacted', 'Interested', 'Callback', 'Follow Up', 'Call Not Answered'];
          const activeCount = bdeLeads.filter(l => activeStatuses.includes(l.status)).length;
          
          if (activeCount < 5) {
            // Pull the next one from 'In Queue'
            const nextInQueue = bdeLeads.find(l => l.status === 'In Queue');
            if (nextInQueue) {
              return updatedLeads.map(l => 
                l.id === nextInQueue.id 
                  ? { ...l, status: 'New', statusHistory: [...l.statusHistory, { status: 'New', date: todayISO(), updatedBy: 'System', notes: 'Auto-filled from Queue' }] } 
                  : l
              );
            }
          }
        }
      }

      return updatedLeads;
    });
  };

  const assignLead = (leadId, bdeId) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, assignedTo: bdeId, isSeen: false } : l))
    );
  };

  const autoDistribute = () => {
    const bdes = users.filter((u) => u.role === 'bde');
    const { updatedLeads, assignmentSummary } = distributeLeads(leads, bdes);
    setLeads(updatedLeads);
    return assignmentSummary;
  };

  const addNoteToLead = (leadId, noteText, authorName) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== leadId) return l;
        const note = { text: noteText, createdAt: todayISO(), by: authorName };
        return { ...l, notes: [...l.notes, note] };
      })
    );
  };

  const addLead = (lead) => {
    const bdes = users.filter(u => u.role === 'bde');
    let assignedTo = lead.assignedTo;

    // AUTO-ASSIGN: If it's a new lead (e.g. from Meta/Portal) with no BDE, use Round-Robin
    if (!assignedTo && bdes.length > 0) {
      assignedTo = bdes[nextBDEIndex % bdes.length].id;
      setNextBDEIndex(prev => (prev + 1) % bdes.length);
    }

    const newLead = {
      ...lead,
      id: lead.id || `l-${Date.now()}`,
      assignedTo,
      status: lead.status || 'In Queue',
      statusHistory: lead.statusHistory || [{ status: 'In Queue', date: todayISO(), updatedBy: 'System', notes: 'Lead Created in Queue' }],
      notes: lead.notes || [],
      isSeen: false
    };

    setLeads((prev) => [...prev, newLead]);
    return newLead;
  };

  // ---- FOLLOWUPS ----
  const addFollowUp = (followup) => {
    setFollowUps((prev) => [...prev, followup]);
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
