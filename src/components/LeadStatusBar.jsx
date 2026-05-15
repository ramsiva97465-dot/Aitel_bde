import { formatDateTime } from '../utils/dateHelpers';

// The ordered pipeline stages
const PIPELINE = [
  { key: 'New',              label: 'Created',          color: 'bg-blue-500',   light: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-300' },
  { key: 'Contacted',        label: 'Contacted',        color: 'bg-yellow-500', light: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  { key: 'Call Not Answered',label: 'Not Answered',     color: 'bg-slate-500',  light: 'bg-slate-100',  text: 'text-slate-600',  border: 'border-slate-300' },
  { key: 'Callback',         label: 'Callback',         color: 'bg-orange-500', light: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  { key: 'Follow Up',        label: 'Follow Up',        color: 'bg-purple-500', light: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  { key: 'Interested',       label: 'Interested',       color: 'bg-teal-500',   light: 'bg-teal-100',   text: 'text-teal-700',   border: 'border-teal-300' },
  { key: 'Shared',           label: 'Materials Shared', color: 'bg-blue-500',   light: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-300' },
  { key: 'Quotation Raised', label: 'Quotation',        color: 'bg-indigo-500', light: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300' },
  { key: 'Invoice Raised',   label: 'Invoice',          color: 'bg-emerald-500',light: 'bg-emerald-100',text: 'text-emerald-700',border: 'border-emerald-300' },
  { key: 'Not Interested',   label: 'Not Interested',   color: 'bg-red-500',    light: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-300' },
  { key: 'Converted',        label: 'Converted',        color: 'bg-green-600',  light: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-300' },
];

// Which statuses count as "terminal dead-end"
const TERMINAL_NEGATIVE = ['Not Interested'];
const TERMINAL_POSITIVE = ['Converted'];

/**
 * LeadStatusBar
 * Shows a visual progress pipeline of a lead's journey.
 * Completed steps are highlighted; current step pulses.
 */
export default function LeadStatusBar({ statusHistory = [], currentStatus }) {
  // Build a map of which statuses occurred and when
  const occurredMap = {};
  statusHistory.forEach((h) => {
    if (!occurredMap[h.status]) {
      occurredMap[h.status] = h; // keep first occurrence
    }
  });

  // Determine which stages to show in the bar
  const stagesToShow = PIPELINE.filter((stage) => {
    // Check if this stage OR any of its related statuses occurred
    const hasOccurred = (key) => {
      if (occurredMap[key]) return true;
      // Aliases
      if (key === 'Quotation Raised' && (occurredMap['Quotation Shared'] || occurredMap['Quotation'])) return true;
      if (key === 'Invoice Raised' && (occurredMap['Pro-forma Raised'] || occurredMap['Tax Invoice Raised'] || occurredMap['Invoice'])) return true;
      if (key === 'Shared' && (occurredMap['Materials Shared'])) return true;
      return false;
    };

    // Always show the core happy path
    if (
      stage.key === 'New' || 
      stage.key === 'Contacted' || 
      stage.key === 'Interested' || 
      stage.key === 'Quotation Raised' ||
      stage.key === 'Invoice Raised' ||
      stage.key === 'Converted'
    ) return true;
    
    // Show these only if they occurred in history
    if (
      stage.key === 'Call Not Answered' ||
      stage.key === 'Callback' ||
      stage.key === 'Follow Up' ||
      stage.key === 'Shared' ||
      stage.key === 'Not Interested'
    ) return hasOccurred(stage.key);

    return false;
  });

  // Updated occurred check for the actual rendering
  const checkOccurred = (stageKey) => {
    if (occurredMap[stageKey]) return true;
    if (stageKey === 'Quotation Raised' && (currentStatus.includes('Quotation') || occurredMap['Quotation Raised'] || occurredMap['Quotation Shared'])) return true;
    if (stageKey === 'Invoice Raised' && (currentStatus.includes('Invoice') || currentStatus === 'Converted' || occurredMap['Invoice Raised'] || occurredMap['Pro-forma Raised'] || occurredMap['Tax Invoice Raised'])) return true;
    if (stageKey === 'Shared' && (currentStatus === 'Shared' || occurredMap['Materials Shared'])) return true;
    return false;
  };

  const isNegative = TERMINAL_NEGATIVE.includes(currentStatus);
  const isConverted = currentStatus === 'Converted';

  return (
    <div className="w-full">
      {/* Progress Steps */}
      <div className="flex items-start gap-0 overflow-x-auto pb-2">
        {stagesToShow.map((stage, idx) => {
          const occurred = checkOccurred(stage.key);
          const isCurrent = currentStatus === stage.key || 
                           (stage.key === 'Invoice Raised' && (currentStatus === 'Invoice Raised' || currentStatus === 'Pro-forma Raised' || currentStatus === 'Tax Invoice Raised'));
          const isFirst = idx === 0;
          const isLast = idx === stagesToShow.length - 1;

          // A stage is "done" if it occurred AND it's not the current one,
          // OR if current is a later stage (for the linear happy path)
          const stageIndex = PIPELINE.findIndex((p) => p.key === stage.key);
          const currentIndex = PIPELINE.findIndex((p) => p.key === currentStatus);
          const isDone = occurred && !isCurrent;

          return (
            <div key={stage.key} className="flex items-center flex-shrink-0">
              {/* Connector line */}
              {!isFirst && (
                <div className={`h-0.5 w-6 sm:w-10 flex-shrink-0 ${isDone || isCurrent ? stage.color : 'bg-gray-200'}`} />
              )}

              {/* Step node */}
              <div className="flex flex-col items-center gap-1.5">
                {/* Circle */}
                <div className={`relative w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
                  ${isCurrent
                    ? `${stage.color} border-transparent shadow-lg ring-4 ${stage.color}/20`
                    : isDone
                    ? `${stage.color} border-transparent opacity-90`
                    : 'bg-gray-100 border-gray-200'
                  }`}
                >
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: 'currentColor' }} />
                  )}
                  {isDone ? (
                    // Checkmark for done
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isCurrent ? (
                    // Dot for current
                    <span className="w-2.5 h-2.5 rounded-full bg-white" />
                  ) : (
                    // Empty circle for future
                    <span className="w-2 h-2 rounded-full bg-gray-300" />
                  )}
                </div>

                {/* Label */}
                <span className={`text-[10px] font-semibold text-center leading-tight max-w-[60px] ${
                  isCurrent ? stage.text : isDone ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {stage.label}
                </span>

                {/* Timestamp if it occurred */}
                {occurred && occurredMap[stage.key]?.date && (
                  <span className="text-[9px] text-gray-400 text-center leading-tight max-w-[64px]">
                    {new Date(occurredMap[stage.key].date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Status Detail Card */}
      <div className={`mt-4 flex items-start gap-3 px-4 py-3 rounded-xl border ${
        isNegative
          ? 'bg-red-50 border-red-200'
          : isConverted
          ? 'bg-green-50 border-green-200'
          : 'bg-primary-50 border-primary-200'
      }`}>
        <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 animate-pulse ${
          isNegative ? 'bg-red-500' : 
          isConverted ? 'bg-green-600' : 
          currentStatus === 'Shared' ? 'bg-blue-500' :
          currentStatus === 'Quotation Raised' ? 'bg-indigo-500' :
          currentStatus === 'Invoice Raised' ? 'bg-emerald-500' :
          'bg-primary-500'
        }`} />
        <div>
          <p className={`text-xs font-bold ${isNegative ? 'text-red-700' : isConverted ? 'text-green-700' : 'text-primary-700'}`}>
            Current Status: {currentStatus}
          </p>
          {occurredMap[currentStatus] && (
            <p className="text-[11px] text-gray-500 mt-0.5">
              Updated by <strong>{occurredMap[currentStatus].updatedBy}</strong> on {formatDateTime(occurredMap[currentStatus].date)}
            </p>
          )}
          {occurredMap[currentStatus]?.notes && (
            <p className="text-[11px] text-gray-600 mt-1 italic">"{occurredMap[currentStatus].notes}"</p>
          )}
        </div>
      </div>
    </div>
  );
}
