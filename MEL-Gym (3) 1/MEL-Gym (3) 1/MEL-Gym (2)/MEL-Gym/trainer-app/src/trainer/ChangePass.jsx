import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ProfileContext } from "./ProfileContext";
import { useAuth } from "../AuthContext";
import { useResponsive } from "../App";
import axios from "axios";
import logo from "../assets/1.png";
import './ChangePass.css';

export default function ChangePass() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { isMobile } = useResponsive();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formContactNumber, setFormContactNumber] = useState("");
  const [formCurrentPassword, setFormCurrentPassword] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formConfirmPassword, setFormConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  axios.defaults.baseURL = "http://127.0.0.1:8000";

  useEffect(() => {
    if (user) {
      setFormName(user.name || "");
      setFormEmail(user.email || "");
      setFormContactNumber(user.contact_number || user.phone || "");
    }
  }, [user]);

  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formCurrentPassword || !formEmail || !formPassword || !formConfirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formEmail)) {
      setError("Invalid email format.");
      return;
    }

    if (formPassword !== formConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const trainerId = user?.id;

      console.log("🔍 Trainer ID being sent:", trainerId);

      if (!trainerId) {
        setError("Trainer ID not found");
        setLoading(false);
        return;
      }

      await axios.put(`/api/trainers/${trainerId}/password`, {
        currentPassword: formCurrentPassword,
        newPassword: formPassword,
      });

      await axios.put(`/api/trainers/${trainerId}`, {
        name: formName,
        email: formEmail,
      });

      try {
        await axios.post("/api/audit-trail", {
          id: trainerId,
          role: "trainer",
          action: "PROFILE_UPDATE",
          status: "success"
        });
      } catch (auditErr) {
        console.error("Audit trail logging error:", auditErr);
      }

      try {
        await axios.post("/api/audit-trail", {
          id: trainerId,
          role: "trainer",
          action: "PASSWORD_CHANGE",
          status: "success"
        });
      } catch (auditErr) {
        console.error("Audit trail logging error:", auditErr);
      }

      setSuccess("Profile and password updated successfully!");
      
      setTimeout(() => {
        setFormCurrentPassword("");
        setFormPassword("");
        setFormConfirmPassword("");
        setSuccess("");
      }, 2000);

    } catch (err) {
      console.error("Update error:", err);
      
      try {
        await axios.post("/api/audit-trail", {
          id: user?.id,
          role: "trainer",
          action: "PROFILE_UPDATE",
          status: "failed"
        });
      } catch (auditErr) {
        console.error("Audit trail logging error:", auditErr);
      }

      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("/api/audit-trail", {
        id: user?.id,
        role: "trainer",
        action: "LOGOUT",
        status: "success"
      });
    } catch (auditErr) {
      console.error("Audit trail logging error:", auditErr);
    }

    logout();
    localStorage.removeItem("trainerToken");
    localStorage.removeItem("trainerId");
    localStorage.clear();
    navigate("/", { replace: true });
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Mobile Header with Hamburger */}
      {isMobile && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
          padding: "15px 20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          zIndex: 100,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <h2 style={{ margin: 0, color: "#D4AF37", fontSize: "18px", fontWeight: "800" }}>MEL GYM</h2>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "none",
              border: "none",
              fontSize: "28px",
              cursor: "pointer",
              color: "#D4AF37",
            }}
          >
            ☰
          </button>
        </div>
      )}

      {/* Sidebar - Desktop Always Visible */}
      {!isMobile && (
        <aside className="sidebar" style={{
          width: "260px",
          flexShrink: 0,
          overflow: "auto",
          height: "100vh",
        }}>
          <div className="profile">
            <div className="profile-pic">
              <img src={logo} alt="MEL Gym Logo" style={{ objectFit: "contain", width: "95%", height: "95%" }} />
            </div>
            <div className="profile-info">
              <div className="profile-name">MEL GYM</div>
              <div className="profile-role">FITNESS CENTER</div>
            </div>
          </div>

          <nav className="menu">
            <ul>
              <li className={`menu-btn ${location.pathname === "/dashboard" ? "active" : ""}`}>
                <Link to="/dashboard" className="yellow-btn">DASHBOARD</Link>
              </li>
              <li className={`menu-btn ${location.pathname === "/personal-session" ? "active" : ""}`}>
                <Link to="/personal-session" className="yellow-btn">PERSONAL SESSION</Link>
              </li>
              <li className={`menu-btn ${location.pathname === "/changepass" ? "active" : ""}`}>
                <Link to="/changepass" className="yellow-btn">CHANGE PASSWORD</Link>
              </li>
            </ul>
          </nav>

          <div className="logout">
            <button className="yellow-btn" onClick={handleLogout}>LOGOUT</button>
          </div>
        </aside>
      )}

      {/* Mobile Sidebar (Toggle) */}
      {isMobile && sidebarOpen && (
        <>
          {/* Overlay */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 40,
            }}
            onClick={closeSidebar}
          />
          {/* Mobile Sidebar */}
          <aside className="sidebar" style={{
            position: "fixed",
            top: 60,
            left: 0,
            width: "260px",
            height: "calc(100vh - 60px)",
            overflow: "auto",
            zIndex: 50,
          }}>
            <div className="profile">
              <div className="profile-pic">
                <img src={logo} alt="MEL Gym Logo" style={{ objectFit: "contain", width: "95%", height: "95%" }} />
              </div>
              <div className="profile-info">
                <div className="profile-name">MEL GYM</div>
                <div className="profile-role">FITNESS CENTER</div>
              </div>
            </div>

            <nav className="menu">
              <ul>
                <li className={`menu-btn ${location.pathname === "/dashboard" ? "active" : ""}`}>
                  <Link to="/dashboard" className="yellow-btn" onClick={closeSidebar}>DASHBOARD</Link>
                </li>
                <li className={`menu-btn ${location.pathname === "/personal-session" ? "active" : ""}`}>
                  <Link to="/personal-session" className="yellow-btn" onClick={closeSidebar}>PERSONAL SESSION</Link>
                </li>
                <li className={`menu-btn ${location.pathname === "/changepass" ? "active" : ""}`}>
                  <Link to="/changepass" className="yellow-btn" onClick={closeSidebar}>CHANGE PASSWORD</Link>
                </li>
              </ul>
            </nav>

            <div className="logout">
              <button className="yellow-btn" onClick={handleLogout}>LOGOUT</button>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="main-content" style={{
        flex: 1,
        backgroundColor: "#f5f5f5",
        overflow: "auto",
        paddingTop: isMobile ? "70px" : "0",
        padding: isMobile ? "70px 20px 20px 20px" : "30px",
      }}>
        <div style={{ backgroundColor: "white", padding: "30px", marginBottom: "30px", borderRadius: "8px" }}>
          <h1 style={{ 
            margin: "0 0 8px 0", 
            color: "#D4AF37",
            fontSize: "32px",
            fontWeight: "800",
            letterSpacing: "-0.5px"
          }}>CHANGE <span style={{ color: "#D4AF37" }}>PASSWORD</span></h1>
          <h2 style={{ 
            margin: 0,
            color: "#D4AF37",
            fontSize: "16px",
            fontWeight: "700",
            letterSpacing: "0.5px"
          }}>UPDATE YOUR ACCOUNT DETAILS</h2>
        </div>

        {error && (
          <div style={{
            color: "#721c24",
            backgroundColor: "#f8d7da",
            padding: "15px 20px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "13px",
            fontWeight: "600",
            border: "2px solid #f5c6cb",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}>
            <span>⚠️</span>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            color: "#155724",
            backgroundColor: "#d4edda",
            padding: "15px 20px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "13px",
            fontWeight: "600",
            border: "2px solid #c3e6cb",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}>
            <span>✅</span>
            {success}
          </div>
        )}

        <div style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: isMobile ? "25px" : "40px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}>
          <form onSubmit={handleSubmit} autoComplete="off" style={{ maxWidth: "600px" }}>
            {/* Name Field */}
            <div style={{ marginBottom: "25px" }}>
              <label style={{
                display: "block",
                marginBottom: "10px",
                color: "#0F1B08",
                fontWeight: "700",
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                👤 Full Name
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Enter your full name"
                required
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  borderRadius: "8px",
                  border: "2px solid #e0e0e0",
                  fontSize: "14px",
                  fontFamily: "'Segoe UI', sans-serif",
                  transition: "all 0.3s ease",
                  boxSizing: "border-box",
                  backgroundColor: loading ? "#f9f9f9" : "white",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#D4AF37";
                  e.currentTarget.style.boxShadow = "0 0 0 4px rgba(212, 175, 55, 0.15)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e0e0e0";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Contact Number Field */}
            <div style={{ marginBottom: "25px" }}>
              <label style={{
                display: "block",
                marginBottom: "10px",
                color: "#0F1B08",
                fontWeight: "700",
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                📱 Contact Number
              </label>
              <input
                type="tel"
                value={formContactNumber}
                disabled
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  borderRadius: "8px",
                  border: "2px solid #e0e0e0",
                  fontSize: "14px",
                  fontFamily: "'Segoe UI', sans-serif",
                  boxSizing: "border-box",
                  backgroundColor: "#f9f9f9",
                  color: "#666",
                }}
              />
            </div>

            {/* Email Field */}
            <div style={{ marginBottom: "25px" }}>
              <label style={{
                display: "block",
                marginBottom: "10px",
                color: "#0F1B08",
                fontWeight: "700",
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                📧 Email Address
              </label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  borderRadius: "8px",
                  border: "2px solid #e0e0e0",
                  fontSize: "14px",
                  fontFamily: "'Segoe UI', sans-serif",
                  transition: "all 0.3s ease",
                  boxSizing: "border-box",
                  backgroundColor: loading ? "#f9f9f9" : "white",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#D4AF37";
                  e.currentTarget.style.boxShadow = "0 0 0 4px rgba(212, 175, 55, 0.15)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e0e0e0";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Current Password Field */}
            <div style={{ marginBottom: "25px" }}>
              <label style={{
                display: "block",
                marginBottom: "10px",
                color: "#0F1B08",
                fontWeight: "700",
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                🔐 Current Password
              </label>
              <input
                type="password"
                value={formCurrentPassword}
                onChange={(e) => setFormCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                required
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  borderRadius: "8px",
                  border: "2px solid #e0e0e0",
                  fontSize: "14px",
                  fontFamily: "'Segoe UI', sans-serif",
                  transition: "all 0.3s ease",
                  boxSizing: "border-box",
                  backgroundColor: loading ? "#f9f9f9" : "white",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#D4AF37";
                  e.currentTarget.style.boxShadow = "0 0 0 4px rgba(212, 175, 55, 0.15)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e0e0e0";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* New Password Field */}
            <div style={{ marginBottom: "25px" }}>
              <label style={{
                display: "block",
                marginBottom: "10px",
                color: "#0F1B08",
                fontWeight: "700",
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                🔐 New Password
              </label>
              <input
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder="Enter new password (min. 6 characters)"
                required
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  borderRadius: "8px",
                  border: "2px solid #e0e0e0",
                  fontSize: "14px",
                  fontFamily: "'Segoe UI', sans-serif",
                  transition: "all 0.3s ease",
                  boxSizing: "border-box",
                  backgroundColor: loading ? "#f9f9f9" : "white",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#D4AF37";
                  e.currentTarget.style.boxShadow = "0 0 0 4px rgba(212, 175, 55, 0.15)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e0e0e0";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Confirm Password Field */}
            <div style={{ marginBottom: "30px" }}>
              <label style={{
                display: "block",
                marginBottom: "10px",
                color: "#0F1B08",
                fontWeight: "700",
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                🔐 Confirm Password
              </label>
              <input
                type="password"
                value={formConfirmPassword}
                onChange={(e) => setFormConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                required
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  borderRadius: "8px",
                  border: "2px solid #e0e0e0",
                  fontSize: "14px",
                  fontFamily: "'Segoe UI', sans-serif",
                  transition: "all 0.3s ease",
                  boxSizing: "border-box",
                  backgroundColor: loading ? "#f9f9f9" : "white",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#D4AF37";
                  e.currentTarget.style.boxShadow = "0 0 0 4px rgba(212, 175, 55, 0.15)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e0e0e0";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "8px",
                backgroundColor: loading ? "#ddd" : "#D4AF37",
                color: loading ? "#999" : "#0F1B08",
                border: "none",
                fontSize: "16px",
                fontWeight: "800",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                letterSpacing: "0.5px",
                boxShadow: loading ? "none" : "0 10px 25px rgba(212, 175, 55, 0.25)",
                textTransform: "uppercase",
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = "#B8860B";
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 15px 35px rgba(212, 175, 55, 0.35)";
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = "#D4AF37";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 10px 25px rgba(212, 175, 55, 0.25)";
                }
              }}
            >
              {loading ? "⏳ UPDATING..." : "✅ UPDATE PROFILE"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}