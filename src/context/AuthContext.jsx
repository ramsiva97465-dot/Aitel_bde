import { createContext, useContext, useState } from 'react';
import { USERS } from '../data/seedData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');

  const login = async (email, password) => {
    setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Invalid email or password');
      }

      const user = await response.json();
      setCurrentUser(user);
      return user;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setError('');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
