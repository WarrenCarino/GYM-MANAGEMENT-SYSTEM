// src/App.js
import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { ProfileProvider } from "./trainer/ProfileContext";
import { ScheduleProvider } from "./trainer/ScheduleContext";
import { AuthProvider } from "./AuthContext";

// Pages
import Dashboard from "./components/Dashboard";
import AdminLogin from "./components/LogIn";
import PersonalSession from "./trainer/PersonalSession";
import Schedule from "./trainer/Schedule";
import ChangePass from "./trainer/ChangePass";
import EditSched from "./trainer/EditSched";

// CSS
import "./App.css";
import "./components/DashBoard.css";
import "./trainer/PersonalSession.css";
import "./trainer/Schedule.css";

// Responsive Context
const ResponsiveContext = createContext();

export const useResponsive = () => {
  const context = useContext(ResponsiveContext);
  if (!context) {
    throw new Error("useResponsive must be used within App");
  }
  return context;
};

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <ResponsiveContext.Provider value={{ isMobile }}>
      <AuthProvider>
        <ProfileProvider>
          <ScheduleProvider>
            <Router>
              <Routes>
                <Route path="/" element={<AdminLogin />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/personal-session" element={<PersonalSession />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/changepass" element={<ChangePass />} />
                <Route path="/edit-sched" element={<EditSched />} />
              </Routes>
            </Router>
          </ScheduleProvider>
        </ProfileProvider>
      </AuthProvider>
    </ResponsiveContext.Provider>
  );
}

export default App;