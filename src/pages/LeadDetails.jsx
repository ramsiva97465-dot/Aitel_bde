import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLead } from '../context/LeadContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import StatusBadge from '../components/StatusBadge';
import LeadStatusBar from '../components/LeadStatusBar';
import Modal from '../components/Modal';
import { formatDateTime, formatDate, todayISO } from '../utils/dateHelpers';
import {
  ArrowLeft, Phone, PhoneMissed, Mail, Building2, User, Calendar,
  Clock, CheckCircle, XCircle, RotateCcw, CalendarClock,
  TrendingUp, FileText, FileSpreadsheet, MessageSquare, Send,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_BUTTONS = [
  { label: 'First Contacted',    value: 'Contacted',         color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',  icon: Phone },
  { label: 'Call Not Answered',  value: 'Call Not Answered', color: 'bg-slate-100 text-slate-600 hover:bg-slate-200',     icon: PhoneMissed },
  { label: 'Interested',         value: 'Interested',        color: 'bg-green-100 text-green-700 hover:bg-green-200',     icon: TrendingUp },
  { label: 'Not Interested',     value: 'Not Interested',    color: 'bg-red-100 text-red-700 hover:bg-red-200',           icon: XCircle },
  { label: 'Call Back',          value: 'Callback',          color: 'bg-orange-100 text-orange-700 hover:bg-orange-200',  icon: RotateCcw },
  { label: 'Follow Up',          value: 'Follow Up',         color: 'bg-purple-100 text-purple-700 hover:bg-purple-200',  icon: CalendarClock },
  { label: 'Shared via WhatsApp/Mail', value: 'Shared',      color: 'bg-blue-100 text-blue-700 hover:bg-blue-200',       icon: MessageSquare },
  { label: 'Quotation Raised',   value: 'Quotation Raised',  color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200', icon: FileSpreadsheet },
  { label: 'Pro-forma Raised',   value: 'Pro-forma Raised',  color: 'bg-amber-100 text-amber-700 hover:bg-amber-200',     icon: FileText },
  { label: 'Tax Invoice Raised', value: 'Tax Invoice Raised',color: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200', icon: FileText },
  { label: 'Converted',          value: 'Converted',         color: 'bg-primary-100 text-primary-700 hover:bg-primary-200', icon: CheckCircle },
];

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getLeadById, updateLeadStatus, addNoteToLead, addFollowUp, getBDEName, invoices, quotations } = useLead();
  const { currentUser } = useAuth();
  const { addNotification } = useNotification();

  const lead = getLeadById(id);
  const [noteText, setNoteText] = useState('');
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [followUpData, setFollowUpData] = useState({ date: '', time: '', notes: '' });
  const [showInvoice, setShowInvoice] = useState(false);
  const [showQuot, setShowQuot] = useState(false);

  if (!lead) {
    return (
      <div className="p-6">
        <button onClick={() => navigate(-1)} className="btn-secondary mb-4 flex items-center gap-2"><ArrowLeft size={15} />Back</button>
        <div className="card text-center py-12 text-gray-400">Lead not found.</div>
      </div>
    );
  }

  const isAdmin = currentUser?.role === 'admin';
  const backPath = isAdmin ? '/admin/leads' : '/bde/leads';

  const handleStatusUpdate = (status) => {
    const needsFollowUp = ['Callback', 'Follow Up', 'Invoice Raised', 'Quotation Raised', 'Shared'];
    
    if (needsFollowUp.includes(status)) {
      setShowFollowUpForm(true);
      updateLeadStatus(lead.id, status, '', currentUser?.name);
      toast.success(`Status updated to "${status}". Please schedule a follow-up.`);
    } else {
      updateLeadStatus(lead.id, status, '', currentUser?.name);
      toast.success(`Status updated to "${status}"`);
    }
    if (status === 'Converted') {
      addNotification({
        id: `n_conv_${Date.now()}`,
        userId: 'u1',
        title: 'Lead Converted',
        message: `${currentUser?.name} converted lead "${lead.customerName}".`,
        type: 'lead_converted',
        isRead: false,
        createdAt: todayISO(),
      });
    }
  };

  const handleSaveFollowUp = () => {
    if (!followUpData.date || !followUpData.time) { toast.error('Select date and time.'); return; }
    addFollowUp({
      id: `f_${Date.now()}`,
      leadId: lead.id,
      bdeId: currentUser?.id,
      date: followUpData.date,
      time: followUpData.time,
      notes: followUpData.notes,
      status: 'Pending',
    });
    addNotification({
      id: `n_fu_${Date.now()}`,
      userId: currentUser?.id,
      title: 'Follow-up Saved',
      message: `Follow-up with "${lead.customerName}" on ${followUpData.date} at ${followUpData.time}.`,
      type: 'follow_up_due',
      isRead: false,
      createdAt: todayISO(),
    });
    toast.success('Follow-up saved!');
    setShowFollowUpForm(false);
    setFollowUpData({ date: '', time: '', notes: '' });
  };

  const handleSaveNote = () => {
    if (!noteText.trim()) { toast.error('Write a note first.'); return; }
    addNoteToLead(lead.id, noteText, currentUser?.name);
    setNoteText('');
    toast.success('Note saved!');
  };

  const leadInvoice = invoices.find((inv) => inv.leadId === lead.id);
  const leadQuot = quotations.find((q) => q.leadId === lead.id);

  return (
    <div className="p-6 space-y-5 max-w-5xl">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition">
        <ArrowLeft size={16} />
        Back to Leads
      </button>

      {/* Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{lead.customerName}</h1>
            <p className="text-sm text-gray-500">{lead.companyName}</p>
          </div>
          <StatusBadge status={lead.status} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoItem icon={Phone} label="Phone" value={lead.phone} />
          <InfoItem icon={Mail} label="Email" value={lead.email} />
          <InfoItem icon={Building2} label="Company" value={lead.companyName} />
          <InfoItem icon={MessageSquare} label="Requirement" value={lead.requirement} />
          <InfoItem icon={User} label="Assigned Executive" value={getBDEName(lead.assignedTo)} />
          <InfoItem icon={Calendar} label="Created On" value={formatDate(lead.createdAt)} />
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-xs text-gray-400 mb-1">Source</p>
            <span className={`badge ${lead.source === 'Meta Ads' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
              {lead.source}
            </span>
          </div>
        </div>

        {/* EXTERNAL INVOICE INTEGRATION BUTTON */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
          <button 
            onClick={() => {
              const url = `https://invoice-theaitel.vercel.app/?leadId=${lead.id}&customerName=${encodeURIComponent(lead.customerName)}&phone=${lead.phone}&email=${lead.email}`;
              window.open(url, '_blank');
            }}
            className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black text-sm tracking-tighter shadow-xl shadow-emerald-600/20 transition-all active:scale-95 group"
          >
            <FileText size={20} className="group-hover:rotate-12 transition-transform" />
            GENERATE OFFICIAL INVOICE
          </button>
        </div>
      </div>

      {/* ===== LEAD STATUS PROGRESS BAR ===== */}
      <div className="card border-l-4 border-primary-500">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
          Lead Journey — Status Timeline
        </h2>
        <LeadStatusBar
          statusHistory={lead.statusHistory}
          currentStatus={lead.status}
        />
      </div>
      {/* Update Status — Only for BDE */}
      {!isAdmin && (
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Update Status</h2>
          <div className="flex flex-wrap gap-2">
            {STATUS_BUTTONS.map(({ label, value, color, icon: Icon }) => (
              <button
                key={value}
                onClick={() => handleStatusUpdate(value)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${color} ${lead.status === value ? 'ring-2 ring-offset-1 ring-current' : ''}`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {/* Follow up form */}
          {showFollowUpForm && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Schedule Follow-up</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                  <input
                    id="followup-date"
                    type="date"
                    className="input-field"
                    value={followUpData.date}
                    onChange={(e) => setFollowUpData({ ...followUpData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Time</label>
                  <input
                    id="followup-time"
                    type="time"
                    className="input-field"
                    value={followUpData.time}
                    onChange={(e) => setFollowUpData({ ...followUpData, time: e.target.value })}
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea
                  id="followup-notes"
                  className="input-field"
                  rows={2}
                  placeholder="Notes about this follow-up..."
                  value={followUpData.notes}
                  onChange={(e) => setFollowUpData({ ...followUpData, notes: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <button id="save-followup-btn" onClick={handleSaveFollowUp} className="btn-primary flex items-center gap-1.5">
                  <CheckCircle size={14} />
                  Save Follow-up
                </button>
                <button onClick={() => setShowFollowUpForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          )}

          {/* Interested actions */}
          {lead.status === 'Interested' && (
            <div className="mt-4 flex gap-3 flex-wrap">
              <button
                onClick={() => navigate(`/bde/invoice?leadId=${lead.id}`)}
                className="flex items-center gap-2 btn-primary"
              >
                <FileText size={14} />
                Create Invoice
              </button>
              <button
                onClick={() => navigate(`/bde/quotation?leadId=${lead.id}`)}
                className="flex items-center gap-2 btn-outline"
              >
                <FileSpreadsheet size={14} />
                Create Quotation
              </button>
            </div>
          )}
        </div>
      )}

      {/* Notes Section */}
      {/* Notes Section — Add Note only for BDE */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Notes</h2>
        {!isAdmin && (
          <div className="mb-3">
            <textarea
              id="add-note-textarea"
              className="input-field"
              rows={3}
              placeholder="Add a note..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <button id="save-note-btn" onClick={handleSaveNote} className="btn-primary flex items-center gap-2 mt-3">
              <Send size={14} />
              Save Note
            </button>
          </div>
        )}

        {/* Note History */}
        {lead.notes.length > 0 && (
          <div className="mt-4 space-y-3">
            {[...lead.notes].reverse().map((n, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{n.text}</p>
                <p className="text-[11px] text-gray-400 mt-1">by {n.by} · {formatDateTime(n.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status History */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Status History</h2>
        <div className="space-y-0">
          {[...lead.statusHistory].reverse().map((h, i) => (
            <div key={i} className="flex gap-4 pb-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-primary-500 mt-0.5 flex-shrink-0" />
                {i < lead.statusHistory.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={h.status} />
                  <span className="text-xs text-gray-500">{formatDateTime(h.date)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">by {h.updatedBy}</p>
                {h.notes && <p className="text-xs text-gray-600 mt-0.5 italic">"{h.notes}"</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1">
        <Icon size={11} />
        {label}
      </p>
      <p className="text-sm font-medium text-gray-800">{value || '—'}</p>
    </div>
  );
}
