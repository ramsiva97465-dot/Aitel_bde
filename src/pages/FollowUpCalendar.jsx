import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLead } from '../context/LeadContext';
import { formatDate, isFollowUpToday, isFollowUpTomorrow } from '../utils/dateHelpers';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, FileText } from 'lucide-react';

export default function FollowUpCalendar() {
  const { currentUser } = useAuth();
  const { followUps, getLeadById, getBDEName } = useLead();
  const navigate = useNavigate();
  const isAdmin = currentUser?.role === 'admin';

  const myFollowUps = isAdmin
    ? followUps
    : followUps.filter((f) => f.bdeId === currentUser?.id);

  const [filter, setFilter] = useState('all');

  const filtered = myFollowUps.filter((f) => {
    if (filter === 'today') return isFollowUpToday(f.date);
    if (filter === 'tomorrow') return isFollowUpTomorrow(f.date);
    return true;
  });

  const basePath = isAdmin ? '/admin' : '/bde';

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Follow-up Calendar</h1>
        <p className="text-sm text-gray-500">{myFollowUps.length} follow-ups scheduled</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['all', 'today', 'tomorrow'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition ${filter === f ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <Calendar size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No follow-ups found for this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((f) => {
            const lead = getLeadById(f.leadId);
            const isToday = isFollowUpToday(f.date);
            const isTomorrow = isFollowUpTomorrow(f.date);
            return (
              <div key={f.id} className={`card hover:shadow-md transition-shadow ${isToday ? 'border-l-4 border-primary-500' : isTomorrow ? 'border-l-4 border-orange-400' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{lead?.customerName || '—'}</p>
                    <p className="text-xs text-gray-500">{lead?.companyName}</p>
                  </div>
                  {isToday && <span className="badge bg-primary-100 text-primary-700 text-[10px]">Today</span>}
                  {isTomorrow && <span className="badge bg-orange-100 text-orange-700 text-[10px]">Tomorrow</span>}
                </div>

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar size={12} className="text-gray-400" />
                    {formatDate(f.date + 'T00:00:00')}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Clock size={12} className="text-gray-400" />
                    {f.time}
                  </div>
                  {f.notes && (
                    <div className="flex items-start gap-2 text-xs text-gray-600">
                      <FileText size={12} className="text-gray-400 mt-0.5" />
                      {f.notes}
                    </div>
                  )}
                  {isAdmin && (
                    <p className="text-xs text-gray-400">BDE: {getBDEName(f.bdeId)}</p>
                  )}
                </div>

                <button
                  onClick={() => navigate(`${basePath}/lead/${f.leadId}`)}
                  className="btn-outline w-full text-xs py-1.5"
                >
                  View Lead
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
