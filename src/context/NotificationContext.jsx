import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { NOTIFICATIONS as INITIAL } from '../data/seedData';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [lastCount, setLastCount] = useState(0);

  // Sound Helper
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      setTimeout(() => oscillator.stop(), 200);
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchNotifications(currentUser.id);
      // Setup Polling
      const interval = setInterval(() => fetchNotifications(currentUser.id), 5000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setLastCount(0);
    }
  }, [currentUser]);

  // Alert trigger on new unread notifs
  useEffect(() => {
    const unreadCount = getUnreadCount(currentUser?.id);
    if (unreadCount > lastCount) {
      playBeep();
      // We'll let the UI handle the overlay by checking getUnreadCount
    }
    setLastCount(unreadCount);
  }, [notifications]);

  const addNotification = async (notif) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: notif.userId,
          title: notif.title,
          message: notif.message,
          type: notif.type
        })
      });
      if (response.ok) {
        const saved = await response.json();
        setNotifications((prev) => [saved, ...prev]);
      }
    } catch (err) {
      console.error('❌ Notification Save Failed:', err.message);
    }
  };

  const fetchNotifications = async (userId) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/notifications/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('❌ Notification Fetch Failed:', err.message);
    }
  };

  const markRead = async (id) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      await fetch(`${backendUrl}/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('❌ Mark Read Failed:', err.message);
    }
  };

  const markAllRead = (userId) => {
    // Implement bulk mark read API if needed, for now just local + loop
    notifications.filter(n => n.user_id === userId && !n.is_read).forEach(n => markRead(n.id));
  };

  const getForUser = (userId) =>
    notifications.filter((n) => String(n.user_id) === String(userId));

  const getUnreadCount = (userId) =>
    notifications.filter((n) => String(n.user_id) === String(userId) && !n.is_read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, markRead, markAllRead, getForUser, getUnreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
