// components/Dashboard.jsx
import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ProfileContext } from "../trainer/ProfileContext";
import { useAuth } from "../AuthContext";
import { useResponsive } from "../App";
import axios from "axios";
import logo from "../assets/1.png";
import "./DashBoard.css";

const formatDate = (date) =>
  date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const formatTime = (timeString) => {
  if (!timeString) return "N/A";
  return timeString.substring(0, 5);
};

const Dashboard = () => {
  const location = useLocation();
  const { profilePic } = useContext(ProfileContext);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { isMobile } = useResponsive();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [dashboardData, setDashboardData] = useState({
    totalClients: 0,
    thisWeekBookings: 0,
    nextSession: null,
    weekSessions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  axios.defaults.baseURL = "http://127.0.0.1:8000";

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const trainerId = user?.id || localStorage.getItem("trainerId");

      if (!trainerId) {
        setError("Trainer ID not found");
        setLoading(false);
        return;
      }

      const response = await axios.get(`/api/trainer/dashboard/${trainerId}`);

      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        setError("Failed to load dashboard data");
      }
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setError("Failed to fetch dashboard data");
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
          }}>DASHBOARD</h1>
          <h2 style={{ 
            margin: 0,
            color: "#D4AF37",
            fontSize: "16px",
            fontWeight: "700",
            letterSpacing: "0.5px"
          }}>WELCOME TO MEL GYM</h2>
        </div>

        {error && (
          <div style={{
            color: "#721c24",
            backgroundColor: "#f8d7da",
            padding: "12px 15px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "13px",
            fontWeight: "600",
            border: "1.5px solid #f5c6cb",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <span>⚠️</span>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{
            textAlign: "center",
            padding: "60px 40px",
            fontSize: "18px",
            color: "#666",
            backgroundColor: "white",
            borderRadius: "8px",
          }}>
            <p>Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Colorful Stats Cards */}
            <section style={{ 
              backgroundColor: "white", 
              padding: "30px", 
              borderRadius: "8px", 
              marginBottom: "30px",
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px"
            }}>
              <div style={{
                backgroundColor: "#C9A85F",
                padding: "20px",
                borderRadius: "8px",
                color: "white"
              }}>
                <div style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", opacity: 0.9 }}>
                  Total Clients
                </div>
                <div style={{ fontSize: "32px", fontWeight: "800" }}>
                  {dashboardData.totalClients}
                </div>
              </div>

              <div style={{
                backgroundColor: "#C9A85F",
                padding: "20px",
                borderRadius: "8px",
                color: "white"
              }}>
                <div style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", opacity: 0.9 }}>
                  Bookings This Week
                </div>
                <div style={{ fontSize: "32px", fontWeight: "800" }}>
                  {dashboardData.thisWeekBookings}
                </div>
              </div>

              <div style={{
                backgroundColor: "#4CAF50",
                padding: "20px",
                borderRadius: "8px",
                color: "white"
              }}>
                <div style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", opacity: 0.9 }}>
                  Total Sessions
                </div>
                <div style={{ fontSize: "32px", fontWeight: "800" }}>
                  {dashboardData.weekSessions.length}
                </div>
              </div>

              <div style={{
                backgroundColor: "#8B6F47",
                padding: "20px",
                borderRadius: "8px",
                color: "white"
              }}>
                <div style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", opacity: 0.9 }}>
                  Cancelled
                </div>
                <div style={{ fontSize: "32px", fontWeight: "800" }}>
                  {dashboardData.weekSessions.filter(s => s.status === 'cancelled').length}
                </div>
              </div>
            </section>

            {/* Current Schedule Section */}
            <section style={{
              backgroundColor: "white",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              padding: "30px",
            }}>
              <h3 style={{ 
                margin: "0 0 30px 0", 
                fontSize: "18px", 
                fontWeight: "800", 
                color: "#0F1B08",
                textTransform: "uppercase",
                letterSpacing: "1px"
              }}>CURRENT <span style={{ color: "#D4AF37" }}>SCHEDULE</span></h3>

              {dashboardData.nextSession ? (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr 1fr 1fr",
                  gap: "20px",
                  padding: "20px",
                  alignItems: isMobile ? "flex-start" : "center",
                  borderBottom: "1px solid #e0e0e0",
                }}>
                  <div>
                    <div style={{ fontSize: "11px", color: "#999", fontWeight: "700", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.5px" }}>
                      SESSION TYPE
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#0F1B08", textTransform: "uppercase" }}>
                      PERSONAL SESSION
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#999", fontWeight: "700", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.5px" }}>
                      TIME
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#D4AF37" }}>
                      {formatTime(dashboardData.nextSession.session_timein)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#999", fontWeight: "700", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.5px" }}>
                      ACTIVITY
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#D4AF37" }}>
                      {dashboardData.nextSession.session_type?.toUpperCase() || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#999", fontWeight: "700", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.5px" }}>
                      CLIENT
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#0F1B08" }}>
                      {dashboardData.nextSession.client_name}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#999", fontWeight: "700", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.5px" }}>
                      DATE
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#0F1B08" }}>
                      {formatDate(new Date(dashboardData.nextSession.session_date))}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>
                  No personal sessions scheduled
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;