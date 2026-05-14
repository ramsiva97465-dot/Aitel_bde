import { useState } from 'react';
import { useLead } from '../context/LeadContext';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import { todayISO } from '../utils/dateHelpers';
import toast from 'react-hot-toast';
import {
  UserCheck, PhoneCall, Building2, Shuffle,
  ChevronDown, ChevronUp, Layers,
} from 'lucide-react';

export default function DirectAssign() {
  const { leads, getBDEs, assignLead, getBDEName } = useLead();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const bdes = getBDEs().filter((b) => b.status === 'active');
  const unassigned = leads.filter((l) => !l.assignedTo);

  // Which BDE panel is expanded
  const [expanded, setExpanded] = useState({});
  // Selected leads per BDE (checkbox)
  const [selected, setSelected] = useState({}); // { bdeId: Set<leadId> }
  // For unassigned section: which BDE to send selected leads to
  const [bulkBde, setBulkBde] = useState('');
  const [selectedUnassigned, setSelectedUnassigned] = useState(new Set());

  const toggleExpand = (bdeId) =>
    setExpanded((p) => ({ ...p, [bdeId]: !p[bdeId] }));

  // ---- Assign single lead directly ----
  const handleAssignOne = (leadId, bdeId, leadName) => {
    if (!bdeId) return;
    assignLead(leadId, bdeId);
    const bde = bdes.find((b) => b.id === bdeId);
    addNotification({
      id: `n_dir_${Date.now()}`,
      userId: bdeId,
      title: 'New Lead Assigned',
      message: `Lead "${leadName}" has been directly assigned to you.`,
      type: 'lead_assigned',
      isRead: false,
      createdAt: todayISO(),
    });
    toast.success(`"${leadName}" → ${bde?.name}`);
    setSelectedUnassigned((p) => { const s = new Set(p); s.delete(leadId); return s; });
  };

  // ---- Bulk assign selected unassigned leads ----
  const handleBulkAssign = () => {
    if (!bulkBde) { toast.error('Select a BDE first.'); return; }
    if (selectedUnassigned.size === 0) { toast.error('Select at least one lead.'); return; }
    const bde = bdes.find((b) => b.id === bulkBde);
    selectedUnassigned.forEach((leadId) => {
      const lead = leads.find((l) => l.id === leadId);
      assignLead(leadId, bulkBde);
      addNotification({
        id: `n_bulk_${Date.now()}_${leadId}`,
        userId: bulkBde,
        title: 'New Lead Assigned',
        message: `Lead "${lead?.customerName}" has been assigned to you.`,
        type: 'lead_assigned',
        isRead: false,
        createdAt: todayISO(),
      });
    });
    toast.success(`${selectedUnassigned.size} lead(s) assigned to ${bde?.name}`);
    setSelectedUnassigned(new Set());
    setBulkBde('');
  };

  const toggleUnassigned = (leadId) => {
    setSelectedUnassigned((p) => {
      const s = new Set(p);
      s.has(leadId) ? s.delete(leadId) : s.add(leadId);
      return s;
    });
  };

  const selectAllUnassigned = () => {
    if (selectedUnassigned.size === unassigned.length) {
      setSelectedUnassigned(new Set());
    } else {
      setSelectedUnassigned(new Set(unassigned.map((l) => l.id)));
    }
  };

  // Reassign from one BDE to another
  const handleReassign = (leadId, newBdeId, leadName) => {
    if (!newBdeId) {
      assignLead(leadId, null);
      toast(`"${leadName}" unassigned.`, { icon: '↩️' });
      return;
    }
    assignLead(leadId, newBdeId);
    const bde = bdes.find((b) => b.id === newBdeId);
    addNotification({
      id: `n_reassign_${Date.now()}`,
      userId: newBdeId,
      title: 'Lead Reassigned to You',
      message: `Lead "${leadName}" has been reassigned to you.`,
      type: 'lead_assigned',
      isRead: false,
      createdAt: todayISO(),
    });
    toast.success(`Reassigned to ${bde?.name}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Direct BDE Assignment</h1>
        <p className="text-sm text-gray-500">
          Directly assign or reassign any lead to any BDE — one at a time or in bulk.
        </p>
      </div>

      {/* ============ UNASSIGNED LEADS PANEL ============ */}
      <div className="card border-l-4 border-orange-400">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              Unassigned Leads
              <span className="badge bg-orange-100 text-orange-700">{unassigned.length}</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Select leads below and pick a BDE to assign them in bulk.
            </p>
          </div>

          {/* Bulk assign controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={bulkBde}
              onChange={(e) => setBulkBde(e.target.value)}
              className="input-field w-44 text-xs"
            >
              <option value="">Select BDE...</option>
              {bdes.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <button
              onClick={handleBulkAssign}
              disabled={selectedUnassigned.size === 0 || !bulkBde}
              className="btn-primary flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserCheck size={14} />
              Assign {selectedUnassigned.size > 0 ? `(${selectedUnassigned.size})` : ''}
            </button>
          </div>
        </div>

        {unassigned.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            ✅ All leads are assigned!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedUnassigned.size === unassigned.length && unassigned.length > 0}
                      onChange={selectAllUnassigned}
                      className="rounded border-gray-300 text-primary-600"
                    />
                  </th>
                  <th className="px-3 py-3 text-left">Customer</th>
                  <th className="px-3 py-3 text-left hidden sm:table-cell">Company</th>
                  <th className="px-3 py-3 text-left hidden md:table-cell">Source</th>
                  <th className="px-3 py-3 text-left">Assign Directly To</th>
                </tr>
              </thead>
              <tbody>
                {unassigned.map((lead) => (
                  <tr key={lead.id} className={`table-row ${selectedUnassigned.has(lead.id) ? 'bg-orange-50' : ''}`}>
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUnassigned.has(lead.id)}
                        onChange={() => toggleUnassigned(lead.id)}
                        className="rounded border-gray-300 text-primary-600"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-gray-800 text-sm">{lead.customerName}</p>
                      <p className="text-xs text-gray-400">{lead.phone}</p>
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-xs hidden sm:table-cell">{lead.companyName}</td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <span className={`badge text-xs ${lead.source === 'Meta Ads' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {lead.source}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <select
                          defaultValue=""
                          onChange={(e) => { if (e.target.value) handleAssignOne(lead.id, e.target.value, lead.customerName); }}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-400 cursor-pointer"
                        >
                          <option value="">Pick BDE →</option>
                          {bdes.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============ PER-BDE ASSIGNED LEADS ============ */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Assigned Leads — Per BDE</h2>
        <div className="space-y-4">
          {bdes.map((bde) => {
            const bdeLeads = leads.filter((l) => l.assignedTo === bde.id);
            const isOpen = expanded[bde.id] !== false; // default open

            return (
              <div key={bde.id} className="card border border-gray-100">
                {/* BDE Header */}
                <button
                  className="flex items-center justify-between w-full"
                  onClick={() => toggleExpand(bde.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
                      {bde.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-800 text-sm">{bde.name}</p>
                      <p className="text-xs text-gray-400">{bde.email}</p>
                    </div>
                    <span className="badge bg-primary-100 text-primary-700 ml-2">
                      {bdeLeads.length} leads
                    </span>
                  </div>
                  {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>

                {isOpen && (
                  <div className="mt-4">
                    {bdeLeads.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">No leads assigned yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="table-header">
                              <th className="px-3 py-2 text-left">Customer</th>
                              <th className="px-3 py-2 text-left hidden sm:table-cell">Company</th>
                              <th className="px-3 py-2 text-left">Status</th>
                              <th className="px-3 py-2 text-left">Reassign To</th>
                              <th className="px-3 py-2 text-left">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bdeLeads.map((lead) => (
                              <tr key={lead.id} className="table-row">
                                <td className="px-3 py-2.5">
                                  <p className="font-medium text-gray-800">{lead.customerName}</p>
                                  <p className="text-xs text-gray-400">{lead.phone}</p>
                                </td>
                                <td className="px-3 py-2.5 text-gray-600 text-xs hidden sm:table-cell">{lead.companyName}</td>
                                <td className="px-3 py-2.5">
                                  <StatusBadge status={lead.status} />
                                </td>
                                <td className="px-3 py-2.5">
                                  <select
                                    value={lead.assignedTo || ''}
                                    onChange={(e) => handleReassign(lead.id, e.target.value, lead.customerName)}
                                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-400 cursor-pointer bg-white"
                                  >
                                    <option value="">— Unassign —</option>
                                    {bdes.map((b) => (
                                      <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                  </select>
                                </td>
                                <td className="px-3 py-2.5">
                                  <button
                                    onClick={() => navigate(`/admin/lead/${lead.id}`)}
                                    className="text-xs px-2 py-1 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition"
                                  >
                                    View
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
