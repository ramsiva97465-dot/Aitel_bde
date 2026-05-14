import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LeadProvider } from './context/LeadContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';

import AppLayout from './components/AppLayout';
import FollowUpAlarm from './components/FollowUpAlarm';
import NewLeadOverlay from './components/NewLeadOverlay';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AllLeads from './pages/AllLeads';
import LeadAssignment from './pages/LeadAssignment';
import BDEManagement from './pages/BDEManagement';
import LeadPipeline from './pages/LeadPipeline';
import BDEDashboard from './pages/BDEDashboard';
import MyLeads from './pages/MyLeads';
import LeadDetails from './pages/LeadDetails';
import FollowUpCalendar from './pages/FollowUpCalendar';
import Invoice from './pages/Invoice';
import Quotation from './pages/Quotation';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

// ---- Route Guards ----
function RequireAuth({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/" replace />;
  if (currentUser.role !== 'admin') return <Navigate to="/bde" replace />;
  return children;
}

function RequireBDE({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/" replace />;
  if (currentUser.role !== 'bde') return <Navigate to="/admin" replace />;
  return children;
}

function AppRoutes() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/"
        element={
          currentUser
            ? <Navigate to={currentUser.role === 'admin' ? '/admin' : '/bde'} replace />
            : <Login />
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AppLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="leads" element={<AllLeads />} />
        <Route path="pipeline" element={<LeadPipeline />} />
        <Route path="bde" element={<BDEManagement />} />
        <Route path="lead/:id" element={<LeadDetails />} />
        <Route path="followup" element={<FollowUpCalendar />} />
        <Route path="invoice" element={<Invoice />} />
        <Route path="quotation" element={<Quotation />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* BDE Routes */}
      <Route
        path="/bde"
        element={
          <RequireBDE>
            <AppLayout />
          </RequireBDE>
        }
      >
        <Route index element={<BDEDashboard />} />
        <Route path="leads" element={<MyLeads />} />
        <Route path="pipeline" element={<LeadPipeline />} />
        <Route path="lead/:id" element={<LeadDetails />} />
        <Route path="followup" element={<FollowUpCalendar />} />
        <Route path="invoice" element={<Invoice />} />
        <Route path="quotation" element={<Quotation />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <LeadProvider>
            <NotificationProvider>
              <FollowUpAlarm />
              <NewLeadOverlay />
              <AppRoutes />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '13px',
                    borderRadius: '10px',
                    background: '#fff',
                    color: '#111827',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #f3f4f6',
                  },
                  success: {
                    iconTheme: { primary: 'var(--color-primary-600)', secondary: '#fff' },
                  },
                  error: {
                    iconTheme: { primary: '#ef4444', secondary: '#fff' },
                  },
                }}
              />
            </NotificationProvider>
          </LeadProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
