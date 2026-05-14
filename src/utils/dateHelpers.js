// =============================================================
// Utility: Date Helpers
// =============================================================
import { format, formatDistanceToNow, parseISO, isToday, isTomorrow } from 'date-fns';

const safeParse = (dateStr) => {
  if (!dateStr) return null;
  try {
    const parsed = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
    if (isNaN(parsed.getTime())) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const formatDate = (dateStr) => {
  const d = safeParse(dateStr);
  return d ? format(d, 'dd MMM yyyy') : '—';
};

export const formatDateTime = (dateStr) => {
  const d = safeParse(dateStr);
  return d ? format(d, 'dd MMM yyyy, hh:mm a') : '—';
};

export const formatTime = (dateStr) => {
  const d = safeParse(dateStr);
  return d ? format(d, 'hh:mm a') : '—';
};

export const timeAgo = (dateStr) => {
  const d = safeParse(dateStr);
  return d ? formatDistanceToNow(d, { addSuffix: true }) : '—';
};

export const isFollowUpToday = (dateStr) => {
  if (!dateStr) return false;
  try {
    return isToday(parseISO(dateStr + 'T00:00:00'));
  } catch { return false; }
};

export const isFollowUpTomorrow = (dateStr) => {
  if (!dateStr) return false;
  try {
    return isTomorrow(parseISO(dateStr + 'T00:00:00'));
  } catch { return false; }
};

export const todayISO = () => new Date().toISOString();

export const formatDisplayDate = (dateStr) => {
  const d = safeParse(dateStr);
  return d ? format(d, 'dd MMM yyyy') : '—';
};
