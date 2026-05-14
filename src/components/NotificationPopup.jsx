import { X, Bell } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { timeAgo } from '../utils/dateHelpers';

export default function NotificationPopup({ userId, onClose }) {
  const { getForUser, markRead } = useNotification();
  const notifs = getForUser(userId).slice(0, 5);

  const typeColor = {
    lead_assigned: 'bg-brand-50 text-brand-600',
    follow_up_due: 'bg-orange-50 text-orange-600',
    lead_converted: 'bg-green-50 text-green-600',
    invoice_created: 'bg-purple-50 text-purple-600',
    quotation_created: 'bg-teal-50 text-teal-600',
    new_lead: 'bg-gray-50 text-gray-600',
  };

  return (
    <div className="fixed top-6 right-6 z-[12000] w-80 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 slide-in overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-brand-600 text-white">
        <div className="flex items-center gap-2">
          <Bell size={18} className="fill-white/20" />
          <span className="text-sm font-black uppercase tracking-widest">Alerts</span>
        </div>
        <button 
          onClick={onClose} 
          className="hover:bg-white/20 p-1.5 rounded-xl transition-all active:scale-90"
          title="Close Notifications"
        >
          <X size={18} />
        </button>
      </div>

      {/* Notifs */}
      <div className="divide-y divide-gray-50 max-h-[28rem] overflow-y-auto">
        {notifs.length === 0 && (
          <div className="py-12 text-center">
            <Bell size={32} className="mx-auto mb-3 text-gray-200" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No New Alerts</p>
          </div>
        )}
        {notifs.map((n) => (
          <div
            key={n.id}
            className={`px-5 py-4 cursor-pointer hover:bg-gray-50 transition-all ${!n.isRead ? 'bg-brand-50/30' : ''}`}
            onClick={() => markRead(n.id)}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${typeColor[n.type] || 'bg-gray-100 text-gray-600'}`}>
                {n.type?.replace(/_/g, ' ')}
              </span>
              {!n.isRead && <span className="w-2 h-2 rounded-full bg-brand-600 shadow-[0_0_8px_rgba(30,64,175,0.5)]" />}
            </div>
            <h4 className="text-[13px] font-bold text-gray-700 leading-tight mb-1">{n.title}</h4>
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed mb-2">{n.message}</p>
            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{timeAgo(n.createdAt)}</p>
          </div>
        ))}
      </div>
      
      {/* Footer */}
      <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
        <button onClick={onClose} className="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] hover:underline">
          Dismiss All
        </button>
      </div>
    </div>
  );
}
