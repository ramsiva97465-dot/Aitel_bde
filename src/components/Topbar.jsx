import { useState } from 'react';
import { Bell, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ onMenuToggle }) {
  const { currentUser } = useAuth();
  const { getUnreadCount } = useNotification();
  const navigate = useNavigate();
  const unread = getUnreadCount(currentUser?.id);
  const [menuOpen, setMenuOpen] = useState(false);

  const notifPath = currentUser?.role === 'admin' ? '/admin/notifications' : '/bde/notifications';

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 gap-3 sticky top-0 z-30 shadow-sm">
      {/* Mobile hamburger */}
      <button
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition"
        onClick={onMenuToggle}
      >
        <Menu size={20} />
      </button>

      {/* Page title area - placeholder for breadcrumb */}
      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button
          onClick={() => navigate(notifPath)}
          className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition"
        >
          <Bell size={19} />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {/* User info */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
            {currentUser?.name?.charAt(0)}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-800 leading-tight">{currentUser?.name}</p>
            <p className="text-[11px] text-gray-400 capitalize">{currentUser?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
