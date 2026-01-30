// frontend/src/App.js
import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";

// Layout + Components
import Sidebar from "./components/Sidebar";
import Dashboard from "./admin/Dashboard";
import ManageSchedule from "./admin/ManageSchedule";
import Reports from "./admin/Report";
import Trainers from "./admin/Trainers";
import TrainerView from "./admin/TrainerView";
import Useraccounts from "./admin/Useraccount";
import ClientsBooking from "./admin/ClientsBooking";
import Login from "./admin/Login";
import Attendance from "./admin/Attendance";
import AuditTrail from "./admin/AuditTrail";
import ProfileSettings from "./admin/ProfileSettings";
import { ScheduleProvider } from "./admin/ScheduleContext";

import "./App.css";

// ====================== 🔑 Auth Context ======================
const AuthContext = createContext(null);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    token: null,
    user: null,
    contact: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    const isAuth = localStorage.getItem("isAuthenticated");
    const contact = localStorage.getItem("contact_number");

    if (token && token !== "null" && userStr && isAuth === "true") {
      try {
        setAuthState({
          isAuthenticated: true,
          token,
          user: JSON.parse(userStr),
          contact: contact || null,
        });
      } catch (e) {
        console.error("Failed to parse stored user JSON:", e);
      }
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("contact_number");
    }
    setLoading(false);
  }, []);

  const login = (user, token, contactNumber) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("contact_number", contactNumber);
    localStorage.setItem("memberContact", contactNumber);
    localStorage.setItem("admin_id", user.id);
    localStorage.setItem("admin_name", user.name);
    localStorage.setItem("admin_email", user.email);

    setAuthState({
      isAuthenticated: true,
      token,
      user,
      contact: contactNumber,
    });
  };

  const logout = () => {
    localStorage.clear();
    setAuthState({
      isAuthenticated: false,
      token: null,
      user: null,
      contact: null,
    });
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ====================== 🛡 Protected Route ======================
function ProtectedRoute({ children }) {
  const { isAuthenticated, token } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !token || token === "null") {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

// ====================== ⚙️ Main Layout Router ======================
function AppContent() {
  const [activePage, setActivePage] = useState("dashboard");
  const location = useLocation();

  const isTrainerView = location.pathname.includes("/trainer/");
  const isLoginPage = location.pathname === "/";

  const showSidebar = !isTrainerView && !isLoginPage;

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#F3F4F6",
      }}
    >
      {showSidebar && (
        <div
          style={{
            width: "260px",
            backgroundColor: "#fff",
            overflowY: "auto",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            flexShrink: 0,
          }}
        >
          <Sidebar activePage={activePage} setActivePage={setActivePage} />
        </div>
      )}

      <div
        style={{
          flex: 1,
          padding: "20px",
          overflowY: "auto",
          backgroundColor: "#F3F4F6",
        }}
      >
        <Routes>
          {/* Login Route - Now Main Page */}
          <Route path="/" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainers"
            element={
              <ProtectedRoute>
                <Trainers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer/:trainerId"
            element={
              <ProtectedRoute>
                <TrainerView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Useraccounts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule"
            element={
              <ProtectedRoute>
                <ManageSchedule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <ClientsBooking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <Attendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit"
            element={
              <ProtectedRoute>
                <AuditTrail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileSettings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

// ====================== 🚀 Root App ======================
function App() {
  return (
    <AuthProvider>
      <ScheduleProvider>
        <Router>
          <AppContent />
        </Router>
      </ScheduleProvider>
    </AuthProvider>
  );
}

export default App;