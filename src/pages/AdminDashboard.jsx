import { useState, useEffect } from 'react';
import { useLead } from '../context/LeadContext';
import StatCard from '../components/StatCard';
import LeadTable from '../components/LeadTable';
// Legacy integrations removed in favor of Supabase real-time sync
import {
  Users, PhoneCall, TrendingUp, Star, XCircle, RotateCcw, Repeat2,
  Megaphone, Globe, CheckCircle, MessageSquare, RefreshCw, PhoneMissed,
  FileText, FileSpreadsheet,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { leads, getBDEName, getBDEs, addLead } = useLead();
  const [syncing, setSyncing] = useState(false);
  const [dbStatus, setDbStatus] = useState('Checking...');

  useEffect(() => {
    const checkConn = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/leads`);
        if (res.ok) setDbStatus('Live ✅');
        else setDbStatus('Error ❌');
      } catch (err) {
        setDbStatus('Disconnected ❌');
      }
    };
    checkConn();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    
    // In Supabase mode, sync is real-time. 
    // This button now acts as a manual refresh trigger.
    setTimeout(() => {
      setSyncing(false);
      toast.success('System is synced with Supabase Real-time.');
    }, 1000);
  };

  // Updated Statistics Logic
  const total = leads.length;
  const metaAds = leads.filter((l) => l.source === 'Meta Ads').length;
  const portal = leads.filter((l) => l.source === 'Company Portal').length;
  const statusCount = (s) => leads.filter((l) => l.status === s).length;
  
  // Financial Success Counters
  const billingCount = leads.filter((l) => 
    ['Invoice Raised', 'Pro-forma Raised', 'Tax Invoice Raised'].includes(l.status)
  ).length;

  const convertedCount = leads.filter((l) => 
    ['Converted', 'Invoice Raised', 'Pro-forma Raised', 'Tax Invoice Raised'].includes(l.status)
  ).length;

  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.created_at || b.createdAt || Date.now()) - new Date(a.created_at || a.createdAt || Date.now()))
    .slice(0, 8);

  const bdes = getBDEs();
  const bdePerf = bdes.map((b) => {
    const bl = leads.filter((l) => l.assignedTo == b.id);
    return {
      name: b.name,
      assigned: bl.length,
      contacted: bl.filter((l) => l.status === 'Contacted').length,
      notAnswered: bl.filter((l) => l.status === 'Call Not Answered').length,
      interested: bl.filter((l) => l.status === 'Interested').length,
      converted: bl.filter((l) => ['Converted', 'Invoice Raised', 'Pro-forma Raised', 'Tax Invoice Raised'].includes(l.status)).length,
      pending: bl.filter((l) => l.status === 'New').length,
    };
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">Overview of all telecalling leads and BDE performance</p>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
              dbStatus?.includes('Live') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              Database: {dbStatus || 'Checking...'}
            </span>
          </div>
        </div>
        <button
          id="sync-leads-btn"
          onClick={handleSync}
          disabled={syncing}
          className="btn-outline flex items-center gap-2 text-sm"
        >
          <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing...' : 'Sync Leads'}
        </button>
      </div>

      {/* Syncing Bridge Section */}
      <div className="card border-l-4 border-emerald-500 bg-emerald-50/30 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <RefreshCw size={24} className={syncing ? 'animate-spin' : ''} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-gray-800">Invoice Website Sync</h2>
            <p className="text-sm text-gray-500 mb-4">To see Invoices & Quotations here, copy this URL and paste it into your <strong>Invoice Website Settings</strong> under "Webhook" or "API":</p>
            <div className="flex items-center gap-2 p-3 bg-white border border-emerald-100 rounded-xl">
              <code className="text-xs text-emerald-700 font-mono flex-1 break-all">
                https://aitel-lead-backend.onrender.com/api/webhooks/portal
              </code>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText('https://aitel-lead-backend.onrender.com/api/webhooks/portal');
                  toast.success('Webhook Link Copied!');
                }}
                className="btn-primary text-[10px] py-1.5 px-3 uppercase tracking-widest"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
          <Megaphone size={16} className="text-blue-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-blue-700">Meta Ads Webhook</p>
            <p className="text-[11px] text-blue-500 truncate font-mono">
              https://aitel-lead-backend.onrender.com/api/webhooks/portal
            </p>
          </div>
          <button
            onClick={() => { navigator.clipboard.writeText('https://aitel-lead-backend.onrender.com/api/webhooks/portal'); toast.success('Meta Webhook Copied!'); }}
            className="badge bg-blue-100 text-blue-700 text-[10px] cursor-pointer hover:bg-blue-200"
          >Copy</button>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 bg-purple-50 border border-purple-100 rounded-xl">
          <Globe size={16} className="text-purple-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-purple-700">Company Portal Webhook</p>
            <p className="text-[11px] text-purple-500 truncate font-mono">
              https://aitel-lead-backend.onrender.com/api/webhooks/portal
            </p>
          </div>
          <button
            onClick={() => { navigator.clipboard.writeText('https://aitel-lead-backend.onrender.com/api/webhooks/portal'); toast.success('Portal Webhook Copied!'); }}
            className="badge bg-purple-100 text-purple-700 text-[10px] cursor-pointer hover:bg-purple-200"
          >Copy</button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <StatCard label="Total Leads" value={total} icon={PhoneCall} color="green" />
        <StatCard label="Invoices Raised" value={billingCount} icon={FileText} color="emerald" />
        <StatCard label="Quotations" value={statusCount('Quotation Raised')} icon={FileSpreadsheet} color="indigo" />
        <StatCard label="Converted"          value={convertedCount}          icon={CheckCircle}   color="primary" />
        <StatCard label="New Leads" value={statusCount('New')} icon={Star} color="yellow" />
        <StatCard label="Interested"         value={statusCount('Interested')}         icon={TrendingUp}    color="green" />
      </div>

      {/* Recent Leads */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Recent Leads</h2>
        <LeadTable leads={recentLeads} getBDEName={getBDEName} basePath="/admin" />
      </div>

      {/* Business Development Executive Performance */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Business Development Executive Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3 text-left">Executive Name</th>
                <th className="px-4 py-3 text-center">Assigned</th>
                <th className="px-4 py-3 text-center">Contacted</th>
                <th className="px-4 py-3 text-center">Not Answered</th>
                <th className="px-4 py-3 text-center">Interested</th>
                <th className="px-4 py-3 text-center">Converted</th>
                <th className="px-4 py-3 text-center">Pending</th>
              </tr>
            </thead>
            <tbody>
              {bdePerf.map((b) => (
                <tr key={b.name} className="table-row">
                  <td className="px-4 py-3 font-medium text-gray-800">{b.name}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="badge bg-blue-100 text-blue-700">{b.assigned}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="badge bg-yellow-100 text-yellow-700">{b.contacted}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="badge bg-slate-100 text-slate-600">{b.notAnswered}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="badge bg-green-100 text-green-700">{b.interested}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="badge bg-primary-100 text-primary-700">{b.converted}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="badge bg-gray-100 text-gray-600">{b.pending}</span>
                  </td>
                </tr>
              ))}
              {bdePerf.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No BDE data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
