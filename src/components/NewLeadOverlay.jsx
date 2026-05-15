import React, { useState, useEffect } from 'react';
import { useLead } from '../context/LeadContext';
import { useAuth } from '../context/AuthContext';
import { Zap, Phone, X, ExternalLink, Sparkles, User, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * NewLeadOverlay
 * An interruptive, full-screen overlay that pops up when an Executive receives a new lead.
 */
export default function NewLeadOverlay() {
  const { leads, markLeadSeen } = useLead();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeLead, setActiveLead] = useState(null);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'bde') return;
    const pendingLead = leads
      .filter(l => l.assignedTo == currentUser.id && l.status === 'In Queue')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    if (pendingLead) {
      const lastAlertKey = `last_alert_${pendingLead.id}`;
      const lastAlertTime = localStorage.getItem(lastAlertKey);
      const thirtyMinutes = 30 * 60 * 1000;
      
      // TRIGGER IF: 
      // a) It's a brand new lead we haven't seen in this session yet
      // b) OR it's been 30 minutes since the last alert for this specific lead
      const shouldAlert = !activeLead || 
                         activeLead.id !== pendingLead.id || 
                         !lastAlertTime || 
                         Date.now() - Number(lastAlertTime) > thirtyMinutes;

      if (shouldAlert) {
        setActiveLead(pendingLead);
        localStorage.setItem(lastAlertKey, Date.now().toString());
        
        // 🎵 Play Loud Double Beep
        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const playBeep = (delay = 0) => {
            setTimeout(() => {
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(880, audioCtx.currentTime);
              gain.gain.setValueAtTime(0.8, audioCtx.currentTime);
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.start();
              setTimeout(() => osc.stop(), 300);
            }, delay);
          };
          playBeep(0);
          playBeep(400);
        } catch (e) { console.warn(e); }

        // 🌐 Chrome Desktop Notification
        if (Notification.permission === 'granted') {
          new Notification('Lead Reminder!', {
            body: `Inquiry from ${pendingLead.customerName} is waiting in your queue.`,
            icon: '/favicon.ico',
            requireInteraction: true // Keeps it visible
          });
        }
      }
    } else {
      // No pending leads, clear active overlay
      setActiveLead(null);
    }
  }, [leads, currentUser, activeLead]);

  if (!activeLead) return null;

  const handleAcknowledge = () => {
    markLeadSeen(activeLead.id);
    setActiveLead(null);
  };

  const handleGoToLead = () => {
    navigate(`/bde/lead/${activeLead.id}`);
    markLeadSeen(activeLead.id);
    setActiveLead(null);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-brand-900/95 backdrop-blur-xl animate-in fade-in duration-500">
      
      {/* Background Animated Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-500/20 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden border border-white/20 relative slide-in">
        
        {/* Top Header - Glass Effect */}
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 p-10 text-center text-white relative">
          <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-6 mx-auto backdrop-blur-md border border-white/20 animate-bounce">
            <Zap size={40} className="text-white fill-white" />
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-2 uppercase italic">New Lead Received!</h2>
          <p className="text-brand-100/80 text-sm font-medium">A new business opportunity has been assigned to you</p>
          
          <button 
            onClick={handleAcknowledge}
            className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Lead Details */}
        <div className="p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="space-y-4">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-accent-50 group-hover:text-accent-600 transition-colors">
                  <User size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Customer</p>
                  <h3 className="text-xl font-bold text-gray-700 leading-tight">{activeLead.customerName}</h3>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-accent-50 group-hover:text-accent-600 transition-colors">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Contact</p>
                  <h3 className="text-xl font-bold text-gray-700 leading-tight">{activeLead.phone}</h3>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-accent-50 group-hover:text-accent-600 transition-colors">
                  <Globe size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Source</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                      activeLead.source === 'Meta Ads' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {activeLead.source}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-accent-50 group-hover:text-accent-600 transition-colors">
                  <Sparkles size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Requirement</p>
                  <h3 className="text-sm font-bold text-gray-700 line-clamp-1">{activeLead.requirement}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={handleGoToLead}
              className="flex-1 bg-brand-600 hover:bg-brand-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-brand-600/30 active:scale-95 group"
            >
              <ExternalLink size={20} className="group-hover:translate-x-1 transition-transform" />
              VIEW LEAD DETAILS
            </button>
            <button 
              onClick={handleAcknowledge}
              className="px-8 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-5 rounded-2xl transition-all active:scale-95"
            >
              LATER
            </button>
          </div>
          
          <p className="text-center mt-6 text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
            Highly Confidential Business Lead
          </p>
        </div>
      </div>
    </div>
  );
}
