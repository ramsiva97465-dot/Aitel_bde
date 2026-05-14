import { createContext, useContext, useState } from 'react';
import { USERS } from '../data/seedData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');

  const login = (email, password) => {
    const user = USERS.find(
      (u) => u.email === email && u.password === password
    );
    if (user) {
      setCurrentUser(user);
      setError('');
      return user;
    } else {
      setError('Invalid email or password.');
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
