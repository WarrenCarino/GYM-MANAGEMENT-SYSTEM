import React, { createContext, useContext, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import CashierSidebar from "./components/CashierSidebar";
import Dashboard from "./components/Dashboard";
import Inventory from "./components/Inventory";
import Attendance from "./components/Attendance";
import Profile from "./components/Profile";
import ReportsGeneration from "./components/ReportsGeneration";
import Payments from "./components/Payments";
import Membership from "./components/Membership";
import Login from './components/login';
import RFID from './components/RFID';

// Authentication Context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const isAuth = localStorage.getItem("isAuthenticated") === "true";

    if (storedToken && storedUser && isAuth) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setIsAuthenticated(true);
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("isAuthenticated", "true");
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Protected Route
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "18px",
        fontWeight: "bold",
        color: "#333"
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* Public Route - Login */}
          <Route path="/login" element={<Login />} />

          {/* Default: Redirect to login for unauthenticated, dashboard if authenticated */}
          <Route
            path="/"
            element={<Navigate to="/login" replace />}
          />

          {/* Protected Routes with Sidebar Layout */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div style={{ display: "flex", height: "100vh" }}>
                  
                  {/* Sidebar */}
                  <div
                    style={{
                      width: "260px",
                      backgroundColor: "#fff",
                      overflowY: "auto",
                      boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                      flexShrink: 0
                    }}
                  >
                    <CashierSidebar />
                  </div>

                  {/* Main Content */}
                  <div
                    style={{
                      flex: 1,
                      padding: "20px",
                      overflowY: "auto",
                      backgroundColor: "#f5f5f5"
                    }}
                  >
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/payments" element={<Payments />} />
                      <Route path="/inventory" element={<Inventory />} />
                      <Route path="/membership" element={<Membership />} />
                      <Route path="/rfid" element={<RFID />} />
                      <Route path="/attendance" element={<Attendance />} />
                      <Route path="/reportsgeneration" element={<ReportsGeneration />} />
                      <Route path="/profile" element={<Profile />} />
                    </Routes>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;