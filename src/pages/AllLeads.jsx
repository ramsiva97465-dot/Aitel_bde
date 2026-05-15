import { useState } from 'react';
import { useLead } from '../context/LeadContext';
import { useNotification } from '../context/NotificationContext';
import LeadTable from '../components/LeadTable';
import { Search } from 'lucide-react';
import { LEAD_SOURCES, LEAD_STATUSES } from '../data/seedData';
import { todayISO } from '../utils/dateHelpers';
import toast from 'react-hot-toast';

export default function AllLeads() {
  const { leads, getBDEName, getBDEs, assignLead, addLead, deleteLead } = useLead();
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
      });
    }
  };

  const handleDeleteLead = async (leadId) => {
    toast.promise(deleteLead(leadId), {
      loading: 'Deleting lead...',
      success: 'Lead deleted successfully!',
      error: 'Failed to delete lead. Please try again.',
    });
  };

  const filtered = leads.filter((l) => {
    const matchesSearch =
      l.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      l.phone?.includes(search) ||
      l.companyName?.toLowerCase().includes(search.toLowerCase());
    const matchesSource = sourceFilter ? l.source === sourceFilter : true;
    const matchesStatus = statusFilter ? l.status === statusFilter : true;
    const matchesBDE = bdeFilter ? String(l.assignedTo) === bdeFilter : true;
    return matchesSearch && matchesSource && matchesStatus && matchesBDE;
  });

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-600 tracking-tight">All Leads</h1>
          <p className="text-sm text-gray-500 font-medium">Showing {filtered.length} of {leads.length} leads</p>
        </div>
        <button
          id="add-lead-btn"
          onClick={() => {
            const name = prompt('Enter customer name:');
            if (name) {
              addLead({
                customerName: name,
                email: '',
                phone: prompt('Enter phone:'),
                companyName: prompt('Enter company:'),
                source: 'Manual',
                status: 'In Queue',
                createdAt: todayISO(),
              });
            }
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Search size={18} />
          Add New Lead
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="leads-search"
              className="input-field"
              style={{ paddingLeft: '42px' }}
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
            className="input-field w-40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* BDE */}
          <select
            id="leads-bde-filter"
            className="input-field w-40"
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
          onDelete={handleDeleteLead}
        />
      </div>
    </div>
  );
}
