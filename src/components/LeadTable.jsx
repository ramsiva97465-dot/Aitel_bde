import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/dateHelpers';
import { Eye, UserCheck, Trash2, AlertTriangle } from 'lucide-react';
import Modal from './Modal';

/**
 * LeadTable
 * Props:
 *  - leads        : array of lead objects
 *  - getBDEName   : fn(bdeId) → name string
 *  - bdes         : array of BDE users (for inline assign dropdown)
 *  - basePath     : '/admin' | '/bde'
 *  - showAssign   : show assign button for unassigned rows (legacy)
 *  - onAssign     : called with lead when assign clicked
 *  - onDirectAssign : called with (leadId, bdeId) for inline dropdown change
 *  - isAdmin      : show BDE assign column only for admin
 */
export default function LeadTable({
  leads,
  getBDEName,
  bdes = [],
  basePath = '/admin',
  showAssign,
  onAssign,
  onDirectAssign,
  onDelete,
  isAdmin = false,
}) {
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState(null); // stores leadId being deleted

  const handleDelete = (leadId, e) => {
    e.stopPropagation();
    setDeleteConfirm(leadId);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      onDelete(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  if (!leads.length) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        No leads found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="table-header">
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">Customer</th>
            <th className="px-4 py-3 text-left">Phone</th>
            <th className="px-4 py-3 text-left hidden md:table-cell">Company</th>
            <th className="px-4 py-3 text-left hidden lg:table-cell">Source</th>
            {/* Assigned Executive column */}
            <th className="px-4 py-3 text-left hidden lg:table-cell">Assigned Executive</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left hidden md:table-cell">Date</th>
            <th className="px-4 py-3 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="table-row">
              <td className="px-4 py-3 text-gray-400 text-xs font-mono">{lead.id}</td>
              <td className="px-4 py-3">
                <div className="font-medium text-gray-800">{lead.customerName}</div>
                <div className="text-xs text-gray-400">{lead.email}</div>
              </td>
              <td className="px-4 py-3 text-gray-600">{lead.phone}</td>
              <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{lead.companyName}</td>
              <td className="px-4 py-3 hidden lg:table-cell">
                <span className={`badge text-xs ${
                  lead.source === 'Meta Ads'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {lead.source}
                </span>
              </td>

              {/* ---- READ ONLY EXECUTIVE ---- */}
              <td className="px-4 py-3 hidden lg:table-cell">
                <span className="text-xs text-gray-600 font-medium">
                  {getBDEName ? getBDEName(lead.assignedTo) : '—'}
                </span>
              </td>

              <td className="px-4 py-3">
                <StatusBadge status={lead.status} />
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">
                {formatDate(lead.createdAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`${basePath}/lead/${lead.id}`)}
                      className="p-2 rounded-xl bg-brand-50 text-brand-600 hover:bg-brand-100 transition-all active:scale-95"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    {isAdmin && onDelete && (
                      <button
                        onClick={(e) => handleDelete(lead.id, e)}
                        className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all active:scale-95"
                        title="Delete Lead"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {deleteConfirm && (
        <Modal 
          title="Confirm Deletion" 
          onClose={() => setDeleteConfirm(null)}
          maxWidth="max-w-sm"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h4 className="text-lg font-bold text-gray-800 mb-2">Are you sure?</h4>
            <p className="text-sm text-gray-500 mb-8">
              This action will permanently delete the lead and all its associated data. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
