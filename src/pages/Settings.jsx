import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLead } from '../context/LeadContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Settings as SettingsIcon, User, Lock, Save, 
  Palette, Globe, Megaphone, Copy, Check, RefreshCw 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { currentUser } = useAuth();
  const { updateUser, monthlyGoal, updateMonthlyGoal } = useLead();
  const { currentTheme, setTheme, themes, customColor, setCustomColor } = useTheme();
  
  const [form, setForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
  });
  const [pwdForm, setPwdForm] = useState({ current: '', newPwd: '', confirm: '' });

  // Integration Settings (Admin Only)
  const [integrations, setIntegrations] = useState({
    metaAppId: localStorage.getItem('meta_app_id') || import.meta.env.VITE_META_APP_ID || '',
    metaToken: localStorage.getItem('meta_ads_token') || import.meta.env.VITE_META_ACCESS_TOKEN || '',
    portalUrl: localStorage.getItem('portal_webhook_url') || 'https://aitel-lead-backend.onrender.com/api/webhooks/portal',
    verifyToken: localStorage.getItem('meta_verify_token') || import.meta.env.VITE_META_VERIFY_TOKEN || 'aitel_meta_verify_2026',
    autoAssign: localStorage.getItem('auto_assign_enabled') === 'true'
  });
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleProfileSave = () => {
    if (!form.name || !form.email) { toast.error('Fill required fields.'); return; }
    updateUser(currentUser?.id, { name: form.name, email: form.email, phone: form.phone });
    toast.success('Profile updated!');
  };

  const handlePasswordSave = () => {
    if (pwdForm.current !== currentUser?.password) { toast.error('Current password is incorrect.'); return; }
    if (pwdForm.newPwd.length < 4) { toast.error('Password must be at least 4 characters.'); return; }
    if (pwdForm.newPwd !== pwdForm.confirm) { toast.error('Passwords do not match.'); return; }
    updateUser(currentUser?.id, { password: pwdForm.newPwd });
    toast.success('Password updated!');
    setPwdForm({ current: '', newPwd: '', confirm: '' });
  };

  const handleIntegrationSave = async () => {
    setSyncing(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      localStorage.setItem('meta_app_id', integrations.metaAppId);
      localStorage.setItem('meta_ads_token', integrations.metaToken);
      localStorage.setItem('portal_webhook_url', integrations.portalUrl);
      localStorage.setItem('meta_verify_token', integrations.verifyToken);
      localStorage.setItem('auto_assign_enabled', integrations.autoAssign);
      toast.success('Bridge Configured: Manual Settings Applied!');
    } catch (e) {
      toast.error('Failed to apply bridge settings.');
    } finally {
      setSyncing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(integrations.portalUrl);
    setCopied(true);
    toast.success('Webhook URL copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="p-6 space-y-6 max-w-3xl fade-in pb-20">
      <div>
        <h1 className="text-2xl font-black text-gray-700 tracking-tight uppercase italic">Settings</h1>
        <p className="text-sm text-gray-500 font-medium">Manage your account preferences and system integrations</p>
      </div>

      {/* Profile */}
      <div className="card">
        <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-50 text-brand-600 rounded-lg flex items-center justify-center">
            <User size={16} />
          </div>
          Profile Information
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Name</label>
              <input
                id="settings-name"
                className="input-field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email Address</label>
              <input
                id="settings-email"
                type="email"
                className="input-field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Phone</label>
              <input
                id="settings-phone"
                className="input-field"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Account Role</label>
              <div className="input-field bg-gray-50 text-gray-400 font-bold uppercase tracking-widest text-[10px] flex items-center">
                {currentUser?.role} Account
              </div>
            </div>
          </div>
          <button id="save-profile-btn" onClick={handleProfileSave} className="btn-primary flex items-center gap-2">
            <Save size={14} />
            Save Profile
          </button>
        </div>
      </div>

      {/* ADMIN INTEGRATIONS SECTION */}
      {isAdmin && (
        <div className="card border-l-4 border-brand-600">
          <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-600 text-white rounded-lg flex items-center justify-center">
                <Globe size={16} />
              </div>
              System Integrations (Meta Ads & Webhooks)
            </div>
            <span className="px-2 py-0.5 bg-brand-50 text-brand-600 text-[9px] font-black uppercase tracking-widest rounded">Admin Only</span>
          </h2>

          <div className="space-y-6">
            {/* Meta App Config */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <SettingsIcon size={14} className="text-brand-500" />
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Meta App ID</label>
                </div>
                <input
                  type="text"
                  className="input-field font-mono text-xs"
                  value={integrations.metaAppId}
                  onChange={(e) => setIntegrations({ ...integrations, metaAppId: e.target.value })}
                  placeholder="App ID from Meta Developer Portal"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Megaphone size={14} className="text-brand-500" />
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Meta Ads API Access Token</label>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    className="input-field font-mono text-sm tracking-widest pr-12"
                    value={integrations.metaToken}
                    onChange={(e) => setIntegrations({ ...integrations, metaToken: e.target.value })}
                    placeholder="EAA..."
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <RefreshCw size={14} className="text-gray-300 hover:text-brand-500 cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">Used for automatic lead fetching from Meta Business Suite.</p>

            {/* Portal Webhook URL */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Globe size={14} className="text-purple-500" />
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Your Portal Webhook URL</label>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  className="input-field bg-gray-50 font-mono text-xs text-gray-500 flex-1 cursor-default"
                  value={integrations.portalUrl}
                />
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(integrations.portalUrl);
                    setCopied(true);
                    toast.success('Webhook URL copied!');
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-4 py-2 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 text-xs font-bold text-gray-600"
                >
                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  {copied ? 'Copy URL' : 'Copy URL'}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 font-medium">Paste this URL into your Company Website or CRM to receive leads instantly.</p>
            </div>

            {/* Verify Token */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Lock size={14} className="text-orange-500" />
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Webhook Verify Token</label>
              </div>
              <input
                type="text"
                className="input-field font-mono text-xs"
                value={integrations.verifyToken}
                onChange={(e) => setIntegrations({ ...integrations, verifyToken: e.target.value })}
                placeholder="Verify Token for Handshake"
              />
              <p className="text-[10px] text-gray-400 mt-2 font-medium">Use this token to verify the authenticity of incoming Meta requests.</p>
            </div>

            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <button 
                  onClick={handleIntegrationSave}
                  disabled={syncing}
                  className="btn-primary flex items-center gap-2 min-w-[160px] justify-center"
                >
                  {syncing ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                  {syncing ? 'Syncing...' : 'Update Integrations'}
                </button>
                
                <div className="flex items-center gap-4 border-l border-gray-100 pl-6">
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">BDE Monthly Target</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        className="w-16 h-9 border border-gray-100 rounded-lg text-center font-bold text-gray-700 focus:ring-2 focus:ring-brand-500 outline-none"
                        value={monthlyGoal}
                        onChange={(e) => updateMonthlyGoal(Number(e.target.value))}
                      />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Leads</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={integrations.autoAssign}
                      onChange={(e) => setIntegrations({...integrations, autoAssign: e.target.checked})}
                      className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500" 
                    />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Auto Assign</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appearance / Accent Color */}
      <div className="card">
        <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-50 text-brand-600 rounded-lg flex items-center justify-center">
            <Palette size={16} />
          </div>
          Appearance Settings
        </h2>
        
        {/* Preset Themes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {Object.entries(themes).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => {
                setTheme(key);
                toast.success(`Accent color changed to ${theme.name}`);
              }}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                currentTheme === key 
                  ? 'border-brand-600 bg-brand-50' 
                  : 'border-gray-100 hover:border-gray-200 bg-white'
              }`}
            >
              <div 
                className="w-5 h-5 rounded-full shadow-sm" 
                style={{ backgroundColor: `rgb(${theme.colors[600]})` }} 
              />
              <span className={`text-xs font-bold uppercase tracking-wider ${currentTheme === key ? 'text-brand-700' : 'text-gray-500'}`}>
                {theme.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Password */}
      <div className="card">
        <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-50 text-brand-600 rounded-lg flex items-center justify-center">
            <Lock size={16} />
          </div>
          Security & Password
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Password</label>
              <input
                id="settings-current-pwd"
                type="password"
                className="input-field"
                value={pwdForm.current}
                onChange={(e) => setPwdForm({ ...pwdForm, current: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">New Password</label>
              <input
                id="settings-new-pwd"
                type="password"
                className="input-field"
                value={pwdForm.newPwd}
                onChange={(e) => setPwdForm({ ...pwdForm, newPwd: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Confirm New Password</label>
              <input
                id="settings-confirm-pwd"
                type="password"
                className="input-field"
                value={pwdForm.confirm}
                onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
              />
            </div>
          </div>
          <button id="save-pwd-btn" onClick={handlePasswordSave} className="btn-primary flex items-center gap-2">
            <Lock size={14} />
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}
