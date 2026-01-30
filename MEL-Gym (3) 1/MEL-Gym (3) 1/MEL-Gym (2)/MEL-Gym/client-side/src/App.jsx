import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Mainpage from './Mainpage.jsx';
import MemberLogin from './Login.jsx';
import MemberSignup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { AuthProvider, useAuth } from './AuthContext.jsx';
import './App.css';

// ====================== 🛡 Protected Route ======================
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// ====================== 🎯 Smart Home Route ======================
function HomeRoute() {
  const { isAuthenticated } = useAuth();

  // ✔ If logged in → go to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // ✔ If not logged in → stay on Mainpage
  return <Mainpage />;
}

// ====================== 🚀 Root App ======================
function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_relativeSplatPath: true }}>
        <Routes>

          {/* ⭐ Home route with smart redirect logic */}
          <Route path="/" element={<HomeRoute />} />

          {/* Public Routes */}
          <Route path="/login" element={<MemberLogin />} />
          <Route path="/signup" element={<MemberSignup />} />

          {/* ⭐ Protected Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;