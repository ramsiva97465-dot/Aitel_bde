import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { formatDateTime } from '../utils/dateHelpers';
import { Bell, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const TYPE_COLORS = {
  lead_assigned:    'bg-blue-100 text-blue-700',
  follow_up_due:    'bg-orange-100 text-orange-700',
  lead_converted:   'bg-green-100 text-green-700',
  invoice_created:  'bg-purple-100 text-purple-700',
  quotation_created:'bg-teal-100 text-teal-700',
  new_lead:         'bg-gray-100 text-gray-600',
};

export default function Notifications() {
  const { currentUser } = useAuth();
  const { getForUser, markRead, markAllRead } = useNotification();
  const notifs = getForUser(currentUser?.id);

  const handleMarkAllRead = () => {
    markAllRead(currentUser?.id);
    toast.success('All notifications marked as read.');
  };

  const unread = notifs.filter((n) => !n.isRead).length;

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Notifications</h1>
          <p className="text-sm text-gray-500">{unread} unread · {notifs.length} total</p>
        </div>
        {unread > 0 && (
          <button
            id="mark-all-read-btn"
            onClick={handleMarkAllRead}
            className="btn-secondary flex items-center gap-2 text-xs"
          >
            <CheckCheck size={14} />
            Mark All Read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifs.length === 0 && (
          <div className="card text-center py-12 text-gray-400">
            <Bell size={32} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No notifications yet.</p>
          </div>
        )}
        {notifs.map((n) => (
          <div
            key={n.id}
            onClick={() => markRead(n.id)}
            className={`card cursor-pointer hover:shadow-md transition-shadow ${!n.isRead ? 'border-l-4 border-primary-500 bg-primary-50' : ''}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />}
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                    <span className={`badge text-[10px] ${TYPE_COLORS[n.type] || 'bg-gray-100 text-gray-600'}`}>
                      {n.type?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{n.message}</p>
                  <p className="text-[11px] text-gray-400 mt-1">{formatDateTime(n.createdAt)}</p>
                </div>
              </div>
              {n.isRead && <span className="text-[10px] text-gray-400 flex-shrink-0">Read</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
