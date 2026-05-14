// =============================================================
// Utility: Date Helpers
// =============================================================
import { format, formatDistanceToNow, parseISO, isToday, isTomorrow } from 'date-fns';

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return format(parseISO(dateStr), 'dd MMM yyyy');
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return format(parseISO(dateStr), 'dd MMM yyyy, hh:mm a');
};

export const formatTime = (dateStr) => {
  if (!dateStr) return '—';
  return format(parseISO(dateStr), 'hh:mm a');
};

export const timeAgo = (dateStr) => {
  if (!dateStr) return '—';
  return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
};

export const isFollowUpToday = (dateStr) => isToday(parseISO(dateStr + 'T00:00:00'));
export const isFollowUpTomorrow = (dateStr) => isTomorrow(parseISO(dateStr + 'T00:00:00'));

export const todayISO = () => new Date().toISOString();

export const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '—';
  return format(new Date(dateStr), 'dd MMM yyyy');
};
