// In your AuthContext.jsx file

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ⭐ Load user data from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      setIsAuthenticated(true);
      
      // Also save individual fields for the Classes component
      const userData = JSON.parse(storedUser);
      localStorage.setItem('memberContactNumber', userData.contact_number || userData.contact);
      localStorage.setItem('memberId', userData.id);
      localStorage.setItem('memberName', userData.member_name || userData.name);
    }
  }, []);

  const login = (userData, authToken) => {
    // Save to state
    setUser(userData);
    setToken(authToken);
    setIsAuthenticated(true);
    
    // ⭐ Save to localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);
    localStorage.setItem('memberContactNumber', userData.contact_number || userData.contact);
    localStorage.setItem('memberId', userData.id);
    localStorage.setItem('memberName', userData.member_name || userData.name);
    
    console.log('✅ User logged in and saved to localStorage:', {
      id: userData.id,
      contact: userData.contact_number || userData.contact,
      name: userData.member_name || userData.name
    });
  };

  const logout = () => {
    // Clear state
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    
    // ⭐ Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('memberContactNumber');
    localStorage.removeItem('memberId');
    localStorage.removeItem('memberName');
    
    console.log('✅ User logged out and localStorage cleared');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};