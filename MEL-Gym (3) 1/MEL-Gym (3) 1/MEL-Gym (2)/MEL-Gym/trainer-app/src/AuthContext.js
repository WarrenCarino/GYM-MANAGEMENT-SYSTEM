// src/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('trainerToken');
    const savedUser = localStorage.getItem('trainerData');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Error parsing saved user data:", err);
        localStorage.removeItem('trainerToken');
        localStorage.removeItem('trainerData');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, userToken) => {
    // Save to state
    setUser(userData);
    setToken(userToken);
    
    // Save to localStorage
    localStorage.setItem('trainerToken', userToken);
    localStorage.setItem('trainerData', JSON.stringify(userData));
    
    console.log("✅ User logged in:", userData);
  };

  const logout = () => {
    // Clear state
    setUser(null);
    setToken(null);
    
    // Clear localStorage
    localStorage.removeItem('trainerToken');
    localStorage.removeItem('trainerData');
    localStorage.clear();
    
    console.log("✅ User logged out");
  };

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      isAuthenticated,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};