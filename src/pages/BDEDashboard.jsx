import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLead } from '../context/LeadContext';
import { useNotification } from '../context/NotificationContext';
import LeadCard from '../components/LeadCard';
import StatCard from '../components/StatCard';
import NotificationPopup from '../components/NotificationPopup';
import { 
  PhoneCall, CheckCircle, TrendingUp, Clock, Bell, 
  Target, Zap, Award, BarChart3, Inbox, Layers, Activity 
} from 'lucide-react';
import { formatDateTime } from '../utils/dateHelpers';

export default function BDEDashboard() {
  const { currentUser } = useAuth();
  const { getLeadsForBDE, monthlyGoal } = useLead();
  const { getUnreadCount } = useNotification();
  const [showPopup, setShowPopup] = useState(false);

  const allMyLeads = getLeadsForBDE(currentUser?.id);
  const unread = getUnreadCount(currentUser?.id);

  // Split leads into Pipeline vs Queue
  const finalStatuses = ['Converted', 'Not Interested'];
  const activePipelineLeads = allMyLeads.filter(l => l.status !== 'In Queue' && !finalStatuses.includes(l.status));
  const queuedLeads = allMyLeads.filter(l => l.status === 'In Queue');

  const statusCount = (s) => allMyLeads.filter((l) => l.status === s).length;
  
  // Performance Calculations
  const convertedCount = statusCount('Converted');
  const totalLeads = allMyLeads.length;
  const conversionRate = totalLeads > 0 ? Math.round((convertedCount / totalLeads) * 100) : 0;
  
  const targetProgress = Math.min(Math.round((convertedCount / monthlyGoal) * 100), 100);

  // Recent Activity Feed
  const recentActivity = allMyLeads
    .flatMap(l => l.statusHistory.map(h => ({ ...h, customerName: l.customerName })))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  useEffect(() => {
    if (unread > 0) {
      setShowPopup(true);
      const t = setTimeout(() => setShowPopup(false), 6000);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <div className="p-6 space-y-8 relative">
      {showPopup && <NotificationPopup userId={currentUser?.id} onClose={() => setShowPopup(false)} />}

      {/* Header & Greetings */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest rounded">Executive</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Performance Dashboard</span>
          </div>
          <h1 className="text-3xl font-black text-gray-700 tracking-tight">Hello, {currentUser?.name} 👋</h1>
          <p className="text-gray-500 font-medium">Your active pipeline has <span className="text-brand-600 font-bold">{activePipelineLeads.length} leads</span>.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {unread > 0 && (
            <button onClick={() => setShowPopup(!showPopup)} className="relative flex items-center gap-2 bg-white border border-gray-100 shadow-sm px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
              <Bell size={16} className="text-brand-600" />
              <span>{unread} Alerts</span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full" />
            </button>
          )}
        </div>
      </div>

      {/* Primary Performance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Conversion Score */}
        <div className="card bg-gradient-to-br from-brand-600 to-brand-700 p-6 text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <BarChart3 size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Zap size={20} />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-100">Performance Score</span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <h2 className="text-5xl font-black">{conversionRate}%</h2>
              <span className="text-sm font-bold text-brand-200">Conversion Rate</span>
            </div>
            <p className="text-xs text-brand-100/70 font-medium">Top 10% among LeadPilot Executives this week</p>
          </div>
        </div>

        {/* Card 2: Monthly Goal */}
        <div className="card p-6 bg-white border border-gray-100 relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-accent-50 text-accent-600 rounded-xl flex items-center justify-center">
                  <Target size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-700">Monthly Goal</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{convertedCount} / {monthlyGoal} Conversions</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-gray-700">{targetProgress}%</span>
              </div>
            </div>
            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-accent-500 rounded-full transition-all duration-1000" style={{ width: `${targetProgress}%` }} />
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <span>Started</span>
            <span className="text-accent-600 font-black">Almost There!</span>
            <span>Target</span>
          </div>
        </div>

        {/* Card 3: Recent Activity (Replacing the blank/grid gap) */}
        <div className="card p-6 bg-white border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gray-50 text-gray-400 rounded-lg flex items-center justify-center">
              <Activity size={16} />
            </div>
            <h3 className="text-sm font-bold text-gray-700">Recent Activity</h3>
          </div>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No recent activity found.</p>
            ) : (
              recentActivity.map((act, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-700 font-medium truncate">
                      <span className="font-bold text-gray-800">{act.customerName}</span> moved to <span className="text-brand-600">{act.status}</span>
                    </p>
                    <p className="text-[9px] text-gray-400 uppercase font-bold tracking-tight">{formatDateTime(act.date)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Statistics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard label="Follow Ups" value={statusCount('Follow Up')} icon={Clock} color="orange" sub="Due today" />
        <StatCard label="In Queue" value={queuedLeads.length} icon={Inbox} color="blue" sub="Waiting" />
        <StatCard label="Interested" value={statusCount('Interested')} icon={TrendingUp} color="teal" sub="Hot Leads" />
        <StatCard label="Converted" value={convertedCount} icon={Award} color="purple" sub="Success" />
      </div>

      {/* ACTIVE PIPELINE */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center">
              <Layers size={20} />
            </div>
            <h2 className="text-lg font-black text-gray-700 tracking-tight uppercase italic">Active Pipeline</h2>
          </div>
          <div className="h-px flex-1 mx-6 bg-gray-100 hidden md:block" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{activePipelineLeads.length} / 5 Slots Full</span>
        </div>

        {activePipelineLeads.length === 0 ? (
          <div className="card text-center py-20 bg-gray-50/50 border-dashed border-2 border-gray-200 rounded-[2rem]">
            <p className="text-gray-500 font-bold">No active leads in your pipeline.</p>
            <p className="text-xs text-gray-400 mt-1">Status updates from your queue will appear here automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activePipelineLeads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} basePath="/bde" />
            ))}
          </div>
        )}
      </div>

      {/* MY LEADS (QUEUE) */}
      {queuedLeads.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 text-gray-500 rounded-xl flex items-center justify-center">
                <Inbox size={20} />
              </div>
              <h2 className="text-lg font-black text-gray-400 tracking-tight uppercase italic">My Leads (In Queue)</h2>
            </div>
            <div className="h-px flex-1 mx-6 bg-gray-100 hidden md:block" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{queuedLeads.length} Pending</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 opacity-60 hover:opacity-100 transition-opacity">
            {queuedLeads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} basePath="/bde" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
