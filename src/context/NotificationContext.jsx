import { createContext, useContext, useState } from 'react';
import { NOTIFICATIONS as INITIAL } from '../data/seedData';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(INITIAL);

  const addNotification = (notif) => {
    setNotifications((prev) => [notif, ...prev]);
  };

  const markRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllRead = (userId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.userId === userId ? { ...n, isRead: true } : n))
    );
  };

  const getForUser = (userId) =>
    notifications.filter((n) => n.userId === userId);

  const getUnreadCount = (userId) =>
    notifications.filter((n) => n.userId === userId && !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, markRead, markAllRead, getForUser, getUnreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
