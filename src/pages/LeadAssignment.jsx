import { useState } from 'react';
import { useLead } from '../context/LeadContext';
import { useNotification } from '../context/NotificationContext';
import LeadTable from '../components/LeadTable';
import Modal from '../components/Modal';
import { Shuffle, UserCheck, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { todayISO } from '../utils/dateHelpers';

export default function LeadAssignment() {
  const { leads, getBDEs, getBDEName, assignLead, autoDistribute } = useLead();
  const { addNotification } = useNotification();
  
  const [showManual, setShowManual] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedBde, setSelectedBde] = useState('');
  const [selectedBdeFilter, setSelectedBdeFilter] = useState(null);

  const bdes = getBDEs().filter((b) => b.status === 'active');
  const unassigned = leads.filter((l) => !l.assignedTo);
  
  const filteredLeads = selectedBdeFilter 
    ? leads.filter(l => l.assignedTo === selectedBdeFilter.id)
    : unassigned;

  const handleAutoDistribute = () => {
    if (unassigned.length === 0) {
      toast.error('No unassigned leads to distribute.');
      return;
    }
    if (bdes.length === 0) {
      toast.error('No active Executives available.');
      return;
    }
    const summary = autoDistribute();
    summary.forEach((s) => {
      if (s.count > 0) {
        addNotification({
          id: `n_auto_${Date.now()}_${s.bdeId}`,
          userId: s.bdeId,
          title: 'Leads Auto-Assigned',
          message: `${s.count} leads have been assigned to you automatically.`,
          type: 'lead_assigned',
          isRead: false,
          createdAt: todayISO(),
        });
      }
    });
    toast.success(`Distributed ${unassigned.length} leads across ${bdes.length} Executives.`);
  };

  const handleManualAssign = () => {
    if (!selectedLead || !selectedBde) {
      toast.error('Select both lead and Executive.');
      return;
    }
    assignLead(selectedLead.id, selectedBde);
    const bde = bdes.find((b) => b.id === selectedBde);
    addNotification({
      id: `n_manual_${Date.now()}`,
      userId: selectedBde,
      title: 'New Lead Assigned',
      message: `Lead "${selectedLead.customerName}" has been assigned to you.`,
      type: 'lead_assigned',
      isRead: false,
      createdAt: todayISO(),
    });
    toast.success(`Lead assigned to ${bde?.name}`);
    setShowManual(false);
    setSelectedLead(null);
    setSelectedBde('');
  };

  return (
    <div className="p-6 space-y-5 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Lead Assignment</h1>
          <p className="text-sm text-gray-500">
            {unassigned.length} unassigned leads · {bdes.length} active Executives
          </p>
        </div>
        <button
          onClick={handleAutoDistribute}
          className="btn-primary flex items-center gap-2"
        >
          <Shuffle size={16} />
          Auto Distribute Leads
        </button>
      </div>

      {/* BDE Summary Cards (Clickable) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {bdes.map((b) => {
          const assignedCount = leads.filter((l) => l.assignedTo === b.id).length;
          const isActive = selectedBdeFilter?.id === b.id;
          return (
            <button 
              key={b.id} 
              onClick={() => setSelectedBdeFilter(isActive ? null : b)}
              className={`card flex items-center gap-3 text-left transition-all border-2 ${
                isActive ? 'border-primary-500 bg-primary-50 ring-4 ring-primary-500/10' : 'border-transparent hover:border-gray-200'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                {b.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-sm">{b.name}</p>
                <p className="text-[11px] text-gray-500 font-medium">Click to view leads</p>
              </div>
              <span className={`badge ${isActive ? 'bg-primary-600 text-white' : 'bg-primary-50 text-primary-700'}`}>
                {assignedCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Lead Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              {selectedBdeFilter ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                  Leads assigned to {selectedBdeFilter.name}
                </>
              ) : (
                'Unassigned Leads'
              )}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {selectedBdeFilter ? `Showing ${filteredLeads.length} leads assigned to this Executive` : `Showing ${unassigned.length} leads waiting for assignment`}
            </p>
          </div>
          {selectedBdeFilter && (
            <button 
              onClick={() => setSelectedBdeFilter(null)}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={14} />
              Clear Filter
            </button>
          )}
        </div>
        
        <LeadTable
          leads={filteredLeads}
          getBDEName={getBDEName}
          basePath="/admin"
          showAssign={!selectedBdeFilter}
          isAdmin={true}
          bdes={bdes}
          onAssign={(lead) => { setSelectedLead(lead); setShowManual(true); }}
          onDirectAssign={assignLead}
        />
        
        {filteredLeads.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Check size={32} className="text-primary-500" />
            </div>
            <p className="text-sm font-bold text-gray-600">
              {selectedBdeFilter ? 'No leads assigned yet' : 'Zero unassigned leads'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {selectedBdeFilter ? 'This Executive has a clean slate!' : 'Great job! All leads have been distributed.'}
            </p>
          </div>
        )}
      </div>

      {/* Manual Assign Modal */}
      {showManual && (
        <Modal title="Manual Lead Assignment" onClose={() => { setShowManual(false); setSelectedLead(null); setSelectedBde(''); }}>
          {selectedLead && (
            <div className="mb-4 p-3 bg-primary-50 rounded-xl border border-primary-100">
              <p className="text-sm font-bold text-primary-800">{selectedLead.customerName}</p>
              <p className="text-xs text-primary-600">{selectedLead.companyName} · {selectedLead.phone}</p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Select Executive Agent</label>
              <select
                className="input-field py-3"
                value={selectedBde}
                onChange={(e) => setSelectedBde(e.target.value)}
              >
                <option value="">-- Choose an Agent --</option>
                {bdes.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleManualAssign} className="flex-1 btn-primary py-3 flex items-center justify-center gap-2">
                <UserCheck size={16} />
                Confirm Assignment
              </button>
              <button onClick={() => setShowManual(false)} className="btn-secondary px-6">
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
