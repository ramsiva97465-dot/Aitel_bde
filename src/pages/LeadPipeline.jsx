import { useState } from 'react';
import { useLead } from '../context/LeadContext';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, ChevronRight, Phone, Building2, 
  Search, Filter, ArrowRightCircle 
} from 'lucide-react';

const PIPELINE_STAGES = [
  'In Queue',
  'New',
  'Contacted',
  'Interested',
  'Shared',
  'Quotation Raised',
  'Invoice Raised',
  'Follow Up',
  'Not Interested',
  'Converted'
];

export default function LeadPipeline() {
  const { leads, getLeadsForBDE, getBDEName } = useLead();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const displayLeads = currentUser?.role === 'admin' 
    ? leads 
    : getLeadsForBDE(currentUser?.id);

  const filteredLeads = displayLeads.filter(l => 
    l.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.phone.includes(searchQuery)
  );

  const getLeadsByStatus = (status) => filteredLeads.filter(l => l.status === status);

  return (
    <div className="p-6 space-y-6 h-[calc(100vh-2rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white">
              <Layers size={16} />
            </div>
            <h1 className="text-xl font-black text-gray-700 tracking-tight uppercase italic">Lead Status Pipeline</h1>
          </div>
          <p className="text-sm text-gray-500 font-medium">Visualize your lead flow across all stages</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search pipeline..." 
            className="input-field pl-10 w-full md:w-64 bg-white shadow-sm border-gray-100"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-4 h-full min-w-max">
          {PIPELINE_STAGES.map((stage) => {
            const stageLeads = getLeadsByStatus(stage);
            return (
              <div key={stage} className="w-72 flex flex-col bg-gray-50/50 rounded-[2rem] border border-gray-100/50 p-4">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-500" />
                    <h3 className="text-xs font-black text-gray-600 uppercase tracking-widest">{stage}</h3>
                  </div>
                  <span className="bg-white px-2 py-0.5 rounded-md border border-gray-100 text-[10px] font-bold text-gray-400">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Column Content */}
                <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                  {stageLeads.length === 0 ? (
                    <div className="h-32 rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300">
                      <Layers size={20} className="mb-2 opacity-50" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Empty</p>
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div 
                        key={lead.id}
                        onClick={() => navigate(`${currentUser?.role === 'admin' ? '/admin' : '/bde'}/lead/${lead.id}`)}
                        className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group animate-in fade-in"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-bold text-gray-700 leading-tight group-hover:text-brand-600 transition-colors">
                            {lead.customerName}
                          </h4>
                        </div>
                        
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                            <Phone size={11} className="shrink-0" />
                            {lead.phone}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                            <Building2 size={11} className="shrink-0" />
                            <span className="truncate">{lead.companyName}</span>
                          </div>
                        </div>

                        {currentUser?.role === 'admin' && (
                          <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                              {getBDEName(lead.assignedTo) || 'Unassigned'}
                            </span>
                            <ArrowRightCircle size={14} className="text-gray-200 group-hover:text-brand-400 transition-colors" />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
