import React, { useState, useEffect } from 'react';
import { useLead } from '../context/LeadContext';
import { useAuth } from '../context/AuthContext';
import { Bell, Phone, X, ExternalLink, Clock, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * FollowUpAlarm
 * A global component that checks for due follow-ups and shows a full-screen interruptive overlay.
 */
export default function FollowUpAlarm() {
  const { followUps, leads, updateFollowUpStatus } = useLead();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeAlarm, setActiveAlarm] = useState(null);

  useEffect(() => {
    if (!currentUser) return;

    const checkInterval = setInterval(() => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${currentHours}:${currentMinutes}`;
      const today = now.toISOString().split('T')[0];

      // Find pending follow-ups for this user that are due EXACTLY now or were missed in the last 5 mins
      const due = followUps.find(f => {
        if (f.status !== 'Pending') return false;
        
        // Only show for the assigned BDE
        // Only show for the assigned BDE
        if (currentUser.role === 'bde' && f.bdeId != currentUser.id) return false;

        return f.date === today && f.time === currentTime;
      });

      if (due && (!activeAlarm || activeAlarm.id !== due.id)) {
        const lead = leads.find(l => l.id == due.leadId);
        setActiveAlarm({ ...due, leadName: lead?.customerName || 'Unknown Lead', leadPhone: lead?.phone });
        
        // Play Notification Sound (Beep)
        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
          gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          oscillator.start();
          setTimeout(() => oscillator.stop(), 200);
        } catch (err) {
          console.warn('Audio play failed:', err);
        }

        // Browser Desktop Notification
        if (Notification.permission === 'granted') {
          new Notification('Follow-up Reminder!', {
            body: `Time to call ${lead?.customerName || 'Lead'}. Click to view.`,
            icon: '/favicon.ico'
          });
        }
      }
    }, 10000);

    return () => clearInterval(checkInterval);
  }, [followUps, leads, currentUser, activeAlarm]);

  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  if (!activeAlarm) return null;

  const handleDone = () => {
    updateFollowUpStatus(activeAlarm.id, 'Completed');
    setActiveAlarm(null);
  };

  const handleSnooze = () => {
    setActiveAlarm(null);
  };

  const handleGoToLead = () => {
    navigate(`${currentUser.role === 'admin' ? '/admin' : '/bde'}/lead/${activeAlarm.leadId}`);
    setActiveAlarm(null);
  };

  return (
    <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-gray-900/95 backdrop-blur-xl animate-in fade-in duration-500">
      
      {/* Background Pulse Effect */}
      <div className="absolute inset-0 z-[-1] pointer-events-none">
        <div className="absolute inset-0 bg-red-500/10 animate-ping opacity-20" />
      </div>

      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden border border-white/20 relative slide-in">
        
        {/* Header - Refined Red Gradient */}
        <div className="bg-gradient-to-br from-red-600 to-red-800 p-8 text-center text-white relative">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 mx-auto backdrop-blur-md border border-white/20 animate-bounce">
            <Bell size={32} className="text-white fill-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-1 uppercase italic">Follow-up Due Now!</h2>
          <p className="text-red-100/80 text-xs font-bold uppercase tracking-widest">Don't miss this potential conversion</p>
          
          <button 
            onClick={handleSnooze}
            className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 mb-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-red-600 border border-gray-100">
              <Phone size={28} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Customer Name</p>
              <h3 className="text-2xl font-black text-gray-700 leading-tight">{activeAlarm.leadName}</h3>
              <p className="text-sm text-gray-400 font-bold tracking-wide mt-1">{activeAlarm.leadPhone}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 mb-8 px-2">
            <div className="flex items-center gap-2 text-gray-500">
              <Clock size={16} className="text-red-500" />
              <span className="text-sm font-bold">Scheduled for <span className="text-gray-700">{activeAlarm.time}</span></span>
            </div>
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-2 text-gray-500">
              <AlertCircle size={16} className="text-orange-500" />
              <span className="text-sm font-bold">High Priority</span>
            </div>
          </div>

          {activeAlarm.notes && (
            <div className="mb-8 p-4 bg-brand-50 rounded-2xl border border-brand-100 flex gap-3 italic">
              <MessageSquare size={16} className="text-brand-400 shrink-0 mt-0.5" />
              <p className="text-sm text-brand-700 font-medium leading-relaxed">"{activeAlarm.notes}"</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={handleGoToLead}
              className="flex-1 bg-brand-600 hover:bg-brand-500 text-white font-black py-4.5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-brand-600/20 active:scale-95 group"
            >
              <ExternalLink size={20} className="group-hover:translate-x-1 transition-transform" />
              OPEN DETAILS
            </button>
            <button 
              onClick={handleDone}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black py-4.5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-green-600/20 active:scale-95"
            >
              <CheckCircle size={20} className="hidden" />
              MARK AS DONE
            </button>
          </div>
          
          <button 
            onClick={handleSnooze}
            className="w-full mt-6 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-gray-600 transition-colors py-2"
          >
            Snooze for 5 mins
          </button>
        </div>
      </div>
    </div>
  );
}
