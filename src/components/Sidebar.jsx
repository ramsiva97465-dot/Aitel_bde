import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, UserPlus, PhoneCall, Calendar,
  Bell, Settings, FileText, FileSpreadsheet, LogOut, ChevronRight, Zap, Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/leads', label: 'All Leads', icon: PhoneCall },
  { to: '/admin/pipeline', label: 'Lead Pipeline', icon: Layers },
  { to: '/admin/bde', label: 'Executive Management', icon: Users },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  { to: '/admin/invoice', label: 'Invoice', icon: FileText },
  { to: '/admin/quotation', label: 'Quotation', icon: FileSpreadsheet },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

const bdeLinks = [
  { to: '/bde', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/bde/leads', label: 'My Leads', icon: PhoneCall },
  { to: '/bde/pipeline', label: 'Lead Pipeline', icon: Layers },
  { to: '/bde/followup', label: 'Follow-up Calendar', icon: Calendar },
  { to: '/bde/notifications', label: 'Notifications', icon: Bell },
  { to: '/bde/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ onClose }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const links = currentUser?.role === 'admin' ? adminLinks : bdeLinks;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100 w-64 shadow-sm">
      {/* Brand */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-100">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
          <Zap size={18} className="text-white" />
        </div>
        <div>
          <p className="text-base font-bold text-gray-800 leading-tight">LeadPilot</p>
          <p className="text-[10px] text-brand-600 font-bold uppercase tracking-wider">AI Telecalling</p>
        </div>
      </div>

      {/* Role Badge */}
      <div className="px-5 py-3">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-widest ${
          currentUser?.role === 'admin'
            ? 'bg-primary-100 text-primary-700'
            : 'bg-blue-100 text-blue-700'
        }`}>
          {currentUser?.role === 'admin' ? 'Admin Panel' : 'Executive Panel'}
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 pb-4 space-y-0.5 overflow-y-auto">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin' || to === '/bde'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : 'text-gray-600'}`
            }
            onClick={onClose}
          >
            <Icon size={17} />
            <span className="flex-1">{label}</span>
            <ChevronRight size={13} className="opacity-30" />
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
            {currentUser?.name?.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 leading-tight">{currentUser?.name}</p>
            <p className="text-[11px] text-gray-400">{currentUser?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </div>
  );
}
