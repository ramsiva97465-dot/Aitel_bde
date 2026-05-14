import { useState } from 'react';
import { useLead } from '../context/LeadContext';
import { useNotification } from '../context/NotificationContext';
import LeadTable from '../components/LeadTable';
import { Search } from 'lucide-react';
import { LEAD_SOURCES, LEAD_STATUSES } from '../data/seedData';
import { todayISO } from '../utils/dateHelpers';
import toast from 'react-hot-toast';

export default function AllLeads() {
  const { leads, getBDEName, getBDEs, assignLead } = useLead();
  const { addNotification } = useNotification();
  const bdes = getBDEs();

  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [bdeFilter, setBdeFilter] = useState('');

  // Direct BDE assignment from table dropdown
  const handleDirectAssign = (leadId, bdeId) => {
    assignLead(leadId, bdeId);
    const lead = leads.find((l) => l.id === leadId);
    if (bdeId) {
      const bde = bdes.find((b) => b.id === bdeId);
      addNotification({
        id: `n_direct_${Date.now()}`,
        userId: bdeId,
        title: 'New Lead Assigned',
        message: `Lead "${lead?.customerName}" has been directly assigned to you.`,
        type: 'lead_assigned',
        isRead: false,
        createdAt: todayISO(),
      });
      toast.success(`Assigned to ${bde?.name}`);
    } else {
      toast(`Lead "${lead?.customerName}" unassigned.`, { icon: '↩️' });
    }
  };

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      l.customerName.toLowerCase().includes(q) ||
      l.phone.includes(q) ||
      l.companyName.toLowerCase().includes(q);
    const matchSource = !sourceFilter || l.source === sourceFilter;
    const matchStatus = !statusFilter || l.status === statusFilter;
    const matchBde = !bdeFilter || l.assignedTo === bdeFilter;
    return matchSearch && matchSource && matchStatus && matchBde;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    customerName: '', phone: '', email: '', companyName: '', requirement: '', source: 'Manual'
  });

  const handleAddLead = async (e) => {
    e.preventDefault();
    await addLead(newLead);
    setIsModalOpen(false);
    setNewLead({ customerName: '', phone: '', email: '', companyName: '', requirement: '', source: 'Manual' });
    toast.success('Lead Added Successfully!');
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">All Leads</h1>
          <p className="text-sm text-gray-500">
            Showing {filtered.length} of {leads.length} leads
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Search size={14} className="rotate-45" />
          Add New Lead
        </button>
      </div>

      {/* Add Lead Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl scale-in">
            <h2 className="text-xl font-black text-gray-800 mb-6">Add New Lead</h2>
            <form onSubmit={handleAddLead} className="space-y-4">
              <input required className="input-field" placeholder="Customer Name" value={newLead.customerName} onChange={e => setNewLead({...newLead, customerName: e.target.value})} />
              <input required className="input-field" placeholder="Phone" value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} />
              <input className="input-field" placeholder="Email" value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})} />
              <input className="input-field" placeholder="Company Name" value={newLead.companyName} onChange={e => setNewLead({...newLead, companyName: e.target.value})} />
              <textarea className="input-field" placeholder="Requirement" value={newLead.requirement} onChange={e => setNewLead({...newLead, requirement: e.target.value})} />
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">Save Lead</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="leads-search"
              className="input-field pl-9"
              placeholder="Search name, phone, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Source */}
          <select
            id="leads-source-filter"
            className="input-field w-40"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="">All Sources</option>
            {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Status */}
          <select
            id="leads-status-filter"
            className="input-field w-44"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* BDE */}
          <select
            id="leads-bde-filter"
            className="input-field w-44"
            value={bdeFilter}
            onChange={(e) => setBdeFilter(e.target.value)}
          >
            <option value="">All BDEs</option>
            {bdes.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>

          {/* Clear */}
          {(search || sourceFilter || statusFilter || bdeFilter) && (
            <button
              className="btn-secondary whitespace-nowrap"
              onClick={() => { setSearch(''); setSourceFilter(''); setStatusFilter(''); setBdeFilter(''); }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-500">
            💡 <strong>Tip:</strong> Click the <span className="text-green-700 font-semibold">Assign BDE</span> dropdown on any row to directly assign a lead.
          </p>
        </div>
        <LeadTable
          leads={filtered}
          getBDEName={getBDEName}
          bdes={bdes}
          basePath="/admin"
          isAdmin
          onDirectAssign={handleDirectAssign}
        />
      </div>
    </div>
  );
}
