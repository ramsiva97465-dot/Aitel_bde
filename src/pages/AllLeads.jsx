import { useState } from 'react';
import { useLead } from '../context/LeadContext';
import { useNotification } from '../context/NotificationContext';
import LeadTable from '../components/LeadTable';
import Modal from '../components/Modal';
import { Search, User, Phone, Mail, Building, Plus, X } from 'lucide-react';
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
  
  // New Lead Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLead, setNewLead] = useState({
    customerName: '',
    email: '',
    phone: '',
    companyName: '',
    requirement: ''
  });

  const handleAddLead = async (e) => {
    e.preventDefault();
    if (!newLead.customerName || !newLead.phone) {
      toast.error('Name and Phone are required!');
      return;
    }

    try {
      await addLead({
        ...newLead,
        source: 'Manual',
        status: 'In Queue',
        createdAt: todayISO(),
      });
      toast.success('Lead Added Successfully!');
      setShowAddModal(false);
      setNewLead({ customerName: '', email: '', phone: '', companyName: '', requirement: '' });
    } catch (err) {
      toast.error('Failed to add lead.');
    }
  };

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
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2 px-6 py-3"
        >
          <Plus size={18} />
          Add New Lead
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
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

          <select
            id="leads-source-filter"
            className="input-field w-40"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="">All Sources</option>
            {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            id="leads-status-filter"
            className="input-field w-40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            id="leads-bde-filter"
            className="input-field w-40"
            value={bdeFilter}
            onChange={(e) => setBdeFilter(e.target.value)}
          >
            <option value="">All BDEs</option>
            {bdes.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>

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

      {/* Add New Lead Modal */}
      {showAddModal && (
        <Modal 
          title="Create New Lead" 
          onClose={() => setShowAddModal(false)}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleAddLead} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Customer Details</label>
              <div className="space-y-3">
                <div className="relative group">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-600 transition-colors" />
                  <input
                    type="text"
                    required
                    placeholder="Customer Name *"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-brand-500 transition-all outline-none text-sm font-medium"
                    value={newLead.customerName}
                    onChange={(e) => setNewLead({...newLead, customerName: e.target.value})}
                  />
                </div>
                <div className="relative group">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-600 transition-colors" />
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number *"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-brand-500 transition-all outline-none text-sm font-medium"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                  />
                </div>
                <div className="relative group">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-600 transition-colors" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-brand-500 transition-all outline-none text-sm font-medium"
                    value={newLead.email}
                    onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Business Details</label>
              <div className="space-y-3">
                <div className="relative group">
                  <Building size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-600 transition-colors" />
                  <input
                    type="text"
                    placeholder="Company Name"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-brand-500 transition-all outline-none text-sm font-medium"
                    value={newLead.companyName}
                    onChange={(e) => setNewLead({...newLead, companyName: e.target.value})}
                  />
                </div>
                <textarea
                  placeholder="Requirement / Notes"
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-brand-500 transition-all outline-none text-sm font-medium min-h-[100px] resize-none"
                  value={newLead.requirement}
                  onChange={(e) => setNewLead({...newLead, requirement: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3.5 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-600/20 transition-all active:scale-95"
              >
                Create Lead
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
