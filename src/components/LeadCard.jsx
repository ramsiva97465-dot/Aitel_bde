import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { Phone, Building2, Layers, Eye } from 'lucide-react';

// Mini pipeline — the core ordered stages for the dot tracker
const MINI_PIPELINE = [
  { key: 'New',         label: 'Created',    dot: 'bg-blue-400' },
  { key: 'Contacted',  label: 'Contacted',   dot: 'bg-yellow-400' },
  { key: 'Interested', label: 'Interested',  dot: 'bg-teal-400' },
  { key: 'Converted',  label: 'Converted',   dot: 'bg-green-500' },
];

export default function LeadCard({ lead, basePath = '/bde' }) {
  const navigate = useNavigate();

  // Build set of occurred statuses
  const historyArray = Array.isArray(lead.statusHistory) ? lead.statusHistory : [];
  const occurred = new Set(historyArray.map((h) => h && h.status));
  const isCurrent = (key) => lead.status === key;
  const isDone = (key) => occurred.has(key) && !isCurrent(key);

  return (
    <div className="card hover:shadow-md transition-shadow duration-200 fade-in">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-800 text-sm">{lead.customerName}</h3>
          <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
            <Phone size={11} />
            {lead.phone}
          </div>
        </div>
        <StatusBadge status={lead.status} />
      </div>

      {/* Mini status pipeline dots */}
      <div className="flex items-center gap-1 mb-3 flex-wrap">
        {MINI_PIPELINE.map((stage, idx) => {
          const done = isDone(stage.key);
          const current = isCurrent(stage.key);
          return (
            <div key={stage.key} className="flex items-center gap-1">
              {idx > 0 && (
                <div className={`h-px w-4 ${done || current ? stage.dot : 'bg-gray-200'}`} />
              )}
              <div
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all ${
                  current
                    ? `${stage.dot} ring-2 ring-offset-1 ring-current opacity-100 animate-pulse`
                    : done
                    ? `${stage.dot} opacity-80`
                    : 'bg-gray-200'
                }`}
                title={stage.label}
              />
            </div>
          );
        })}
        <span className="ml-1 text-[10px] text-gray-400 font-medium">{lead.status}</span>
      </div>

      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Building2 size={12} className="text-gray-400" />
          {lead.companyName}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Layers size={12} className="text-gray-400" />
          {lead.requirement}
        </div>
        <span className={`badge text-xs ${
          lead.source === 'Meta Ads'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-purple-100 text-purple-700'
        }`}>
          {lead.source}
        </span>
      </div>

      <button
        onClick={() => navigate(`${basePath}/lead/${lead.id}`)}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        <Eye size={14} />
        View Details
      </button>
    </div>
  );
}
