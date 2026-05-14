const STATUS_COLORS = {
  'New':                'bg-blue-100 text-blue-700',
  'Contacted':          'bg-yellow-100 text-yellow-700',
  'Call Not Answered':  'bg-slate-100 text-slate-600',
  'Interested':         'bg-green-100 text-green-700',
  'Not Interested':     'bg-red-100 text-red-700',
  'Callback':           'bg-orange-100 text-orange-700',
  'Follow Up':          'bg-purple-100 text-purple-700',
  'In Queue':          'bg-gray-100 text-gray-500 italic',
  'Shared':             'bg-blue-100 text-blue-700',
  'Quotation Raised':   'bg-indigo-100 text-indigo-700',
  'Pro-forma Raised':   'bg-amber-100 text-amber-700',
  'Tax Invoice Raised': 'bg-emerald-100 text-emerald-700 font-bold',
  'Invoice Raised':     'bg-emerald-100 text-emerald-700',
  'Converted':          'bg-primary-100 text-primary-700',
};

export default function StatusBadge({ status }) {
  const cls = STATUS_COLORS[status] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`badge font-medium ${cls}`}>
      {status}
    </span>
  );
}
