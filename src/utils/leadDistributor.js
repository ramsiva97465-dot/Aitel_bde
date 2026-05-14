// =============================================================
// Utility: Lead Distributor
// =============================================================

/**
 * Distribute unassigned leads equally among active BDEs.
 * @param {Array} leads - All leads
 * @param {Array} bdes  - All BDE users
 * @returns {{ updatedLeads, assignmentSummary }}
 */
export const distributeLeads = (leads, bdes) => {
  const activeBDEs = bdes.filter((b) => b.status === 'active');
  if (activeBDEs.length === 0) return { updatedLeads: leads, assignmentSummary: [] };

  const unassigned = leads.filter((l) => !l.assignedTo);
  if (unassigned.length === 0) return { updatedLeads: leads, assignmentSummary: [] };

  let bdeIndex = 0;
  const assignmentSummary = activeBDEs.map((b) => ({ bdeId: b.id, bdeName: b.name, count: 0 }));

  const updatedLeads = leads.map((lead) => {
    if (lead.assignedTo) return lead;
    const bde = activeBDEs[bdeIndex % activeBDEs.length];
    bdeIndex++;
    const summaryItem = assignmentSummary.find((s) => s.bdeId === bde.id);
    if (summaryItem) summaryItem.count++;
    return { ...lead, assignedTo: bde.id };
  });

  return { updatedLeads, assignmentSummary };
};
