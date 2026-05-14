import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLead } from '../context/LeadContext';
import LeadTable from '../components/LeadTable';
import { Search } from 'lucide-react';
import { LEAD_STATUSES } from '../data/seedData';

export default function MyLeads() {
  const { currentUser } = useAuth();
  const { getLeadsForBDE, getBDEName } = useLead();
  const myLeads = getLeadsForBDE(currentUser?.id);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = myLeads.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.customerName.toLowerCase().includes(q) || l.phone.includes(q) || l.companyName.toLowerCase().includes(q);
    const matchStatus = !statusFilter || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">My Leads</h1>
        <p className="text-sm text-gray-500">Showing {filtered.length} of {myLeads.length} leads</p>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input-field pl-9"
              placeholder="Search name, phone, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input-field w-44"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {(search || statusFilter) && (
            <button className="btn-secondary" onClick={() => { setSearch(''); setStatusFilter(''); }}>
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <LeadTable leads={filtered} getBDEName={getBDEName} basePath="/bde" />
      </div>
    </div>
  );
}
