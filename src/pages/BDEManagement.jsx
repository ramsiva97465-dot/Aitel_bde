import { useState, useEffect } from 'react';
import { useLead } from '../context/LeadContext';
import Modal from '../components/Modal';
import { Users, UserPlus, Mail, Phone, Shield, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BDEManagement() {
  const { getBDEs, addUser, updateUser, deleteUser, leads } = useLead();
  const bdes = getBDEs();

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', status: 'active' });
  const [editingId, setEditingId] = useState(null);

  const handleSave = async () => {
    if (!form.name || !form.email) {
      toast.error('Name and Email are required.');
      return;
    }
    if (!editingId && !form.password) {
      toast.error('Please set a login password for this executive.');
      return;
    }
    if (!editingId && form.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    try {
      if (editingId) {
        await updateUser(editingId, form);
        toast.success('Executive updated successfully.');
      } else {
        await addUser({ ...form, role: 'bde' });
        toast.success('New Executive added.');
      }
      setShowAdd(false);
      setEditingId(null);
      setForm({ name: '', email: '', phone: '', status: 'active' });
    } catch (err) {
      const msg = err.message || 'Failed to save executive.';
      if (msg.toLowerCase().includes('email')) {
        toast.error('This email is already registered. Please use a different email.');
      } else {
        toast.error(msg);
      }
    }
  };

  const handleEdit = (b) => {
    setForm({ name: b.name, email: b.email, phone: b.phone || '', status: b.status });
    setEditingId(b.id);
    setShowAdd(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this Executive?')) {
      deleteUser(id);
      toast.success('Executive deleted.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Business Development Executive Management</h1>
          <p className="text-sm text-gray-500">Manage your telecalling team and monitor their account status</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <UserPlus size={16} />
          Add Executive
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {bdes.map((b) => {
          const assignedCount = leads.filter(l => l.assignedTo === b.id).length;
          return (
            <div key={b.id} className="card group hover:border-primary-200 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                    {b.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{b.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {b.status === 'active' ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase tracking-wider">
                          <CheckCircle2 size={10} /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">
                          <XCircle size={10} /> Inactive
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(b)} className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(b.id)} className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 mb-5">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={14} className="text-gray-400" />
                  {b.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={14} className="text-gray-400" />
                  {b.phone || 'No phone'}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield size={14} className="text-gray-400" />
                  Business Development Executive
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-xs">
                <span className="text-gray-400 font-medium tracking-tight">Total Assigned Leads</span>
                <span className="badge bg-primary-50 text-primary-700 font-bold">{assignedCount}</span>
              </div>
            </div>
          );
        })}
      </div>

      {showAdd && (
        <Modal title={editingId ? 'Edit Executive' : 'Add New Executive'} onClose={() => { setShowAdd(false); setEditingId(null); setForm({ name: '', email: '', phone: '', password: '', status: 'active' }); }}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Full Name</label>
              <input
                className="input-field py-3"
                placeholder="Enter full name..."
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Email Address</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="email@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Phone Number</label>
                <input
                  className="input-field"
                  placeholder="98765 43210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
            {!editingId && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Login Password</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Set a login password (min 6 chars)"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <p className="text-xs text-gray-400 mt-1 ml-1">BDE will use this password to login to their portal.</p>
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Account Status</label>
              <select
                className="input-field"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="active">Active (Full Access)</option>
                <option value="inactive">Inactive (Disabled)</option>
              </select>
            </div>
            <div className="pt-2 flex gap-3">
              <button onClick={handleSave} className="flex-1 btn-primary py-3">
                {editingId ? 'Update Executive' : 'Create Executive Account'}
              </button>
              <button onClick={() => setShowAdd(false)} className="btn-secondary px-6">Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
