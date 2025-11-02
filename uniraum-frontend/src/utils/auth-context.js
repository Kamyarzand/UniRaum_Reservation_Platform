import React, { createContext, useState, useEffect } from 'react';
import AuthService from '../services/auth.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setUser(user);
    }
    setLoading(false);
  }, []);
  
  const login = async (username, password) => {
    try {
      const userData = await AuthService.login(username, password);
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    }
  };
  
  const logout = () => {
    AuthService.logout();
    setUser(null);
  };
  
  const value = {
    user,
    isLoggedIn: !!user,
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher' || user?.role === 'admin',
    login,
    logout,
    loading,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};