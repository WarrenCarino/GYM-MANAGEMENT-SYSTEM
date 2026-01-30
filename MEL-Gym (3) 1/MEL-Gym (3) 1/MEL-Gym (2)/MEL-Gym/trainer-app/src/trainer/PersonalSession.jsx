// src/trainer/PersonalSession.jsx
import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ProfileContext } from "./ProfileContext";
import { useAuth } from "../AuthContext";
import { useResponsive } from "../App";
import logo from "../assets/1.png";
import "./PersonalSession.css";

const API_URL = "http://localhost:8000";

const logAuditTrail = async (action, status) => {
  try {
    const trainerId = localStorage.getItem("trainerId");
    const trainerName = localStorage.getItem("trainerName");

    if (!trainerId) {
      console.error("❌ Trainer ID not found in localStorage");
      return;
    }

    const auditData = {
      id: parseInt(trainerId) || trainerId,
      role: "trainer",
      action: action,
      status: status
    };

    const response = await fetch(`${API_URL}/api/audit-trail`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify(auditData)
    });

    const responseData = await response.json();

    if (response.ok && responseData.success) {
      console.log("✅ Audit trail logged successfully!");
    } else {
      console.error("❌ Failed to log audit trail");
    }
  } catch (error) {
    console.error("❌ Error logging audit trail:", error);
  }
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (timeStr) => {
  if (!timeStr) return "—";
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const PersonalSession = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profilePic } = useContext(ProfileContext);
  const { user, logout } = useAuth();
  const { isMobile } = useResponsive();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    logAuditTrail(`PERSONAL SESSION PAGE - Accessed`, "SUCCESS");
    if (user) {
      fetchCurrentTrainerAndSessions();
    } else {
      setLoading(false);
      setError("Please log in to view your sessions");
      logAuditTrail(`PERSONAL SESSION PAGE - No user logged in`, "FAILED");
    }
  }, [user]);

  const fetchCurrentTrainerAndSessions = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error("No trainer logged in");
      }

      console.log("👤 Current Trainer:", user);

      const sessionsRes = await fetch(`${API_URL}/api/sessions/all`);
      if (!sessionsRes.ok) throw new Error(`HTTP ${sessionsRes.status}`);
      
      const allSessions = await sessionsRes.json();
      console.log("📋 All Sessions:", allSessions);

      const trainersRes = await fetch(`${API_URL}/api/trainers/all`);
      if (!trainersRes.ok) throw new Error(`HTTP ${trainersRes.status}`);
      
      const trainers = await trainersRes.json();
      console.log("👥 All Trainers:", trainers);

      const trainerContactNumber = user.contact_number || user.phone;
      
      const matchedTrainer = trainers.find(t => 
        t.contact_number === trainerContactNumber || 
        t.trainer_name === user.name
      );

      console.log("🎯 Matched Trainer:", matchedTrainer);

      const trainerSessions = allSessions.filter(s => 
        s.trainer_name === user.name || 
        (matchedTrainer && s.trainer_name === matchedTrainer.trainer_name)
      );

      console.log("✅ Filtered Sessions:", trainerSessions);

      const mappedSessions = trainerSessions.map(s => ({
        id: s.session_id,
        trainer: s.trainer_name,
        type: s.session_type,
        date: s.session_date,
        timeIn: s.session_timein,
        timeOut: s.session_timeout,
        client: {
          name: s.client_name,
          contact: s.client_contact,
          email: s.client_email,
        },
        status: s.status || "pending",
        notes: s.notes,
        createdAt: s.created_at
      }));
      
      setSessions(mappedSessions);
      logAuditTrail(`FETCH SESSIONS - Found ${mappedSessions.length} sessions`, "SUCCESS");
    } catch (err) {
      console.error("❌ Error fetching sessions:", err);
      setError(err.message);
      logAuditTrail(`FETCH SESSIONS - Error: ${err.message}`, "FAILED");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (sessionId) => {
    try {
      const session = sessions.find(s => s.id === sessionId);
      const res = await fetch(`${API_URL}/api/sessions/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.error || "Failed to approve session");

      console.log("✅ Session approved");
      logAuditTrail(`APPROVE SESSION - ${session?.client?.name} (ID: ${sessionId})`, "SUCCESS");
      fetchCurrentTrainerAndSessions();
    } catch (err) {
      console.error("❌ Error approving session:", err);
      alert(`Failed to approve session: ${err.message}`);
      logAuditTrail(`APPROVE SESSION - Error: ${err.message}`, "FAILED");
    }
  };

  const handleDisapprove = async (sessionId) => {
    if (!window.confirm("Are you sure you want to disapprove this session?")) {
      logAuditTrail(`DISAPPROVE SESSION - Cancelled by user`, "CANCELLED");
      return;
    }

    try {
      const session = sessions.find(s => s.id === sessionId);
      const res = await fetch(`${API_URL}/api/sessions/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "disapproved" }),
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.error || "Failed to disapprove session");

      console.log("✅ Session disapproved");
      logAuditTrail(`DISAPPROVE SESSION - ${session?.client?.name} (ID: ${sessionId})`, "SUCCESS");
      fetchCurrentTrainerAndSessions();
    } catch (err) {
      console.error("❌ Error disapproving session:", err);
      alert(`Failed to disapprove session: ${err.message}`);
      logAuditTrail(`DISAPPROVE SESSION - Error: ${err.message}`, "FAILED");
    }
  };

  const handleDelete = async (sessionId) => {
    if (!window.confirm("Are you sure you want to delete this session? This cannot be undone.")) {
      logAuditTrail(`DELETE SESSION - Cancelled by user`, "CANCELLED");
      return;
    }

    try {
      const session = sessions.find(s => s.id === sessionId);
      const res = await fetch(`${API_URL}/api/sessions/${sessionId}`, {
        method: "DELETE",
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.error || "Failed to delete session");

      console.log("✅ Session deleted");
      logAuditTrail(`DELETE SESSION - ${session?.client?.name} (ID: ${sessionId})`, "SUCCESS");
      fetchCurrentTrainerAndSessions();
    } catch (err) {
      console.error("❌ Error deleting session:", err);
      alert(`Failed to delete session: ${err.message}`);
      logAuditTrail(`DELETE SESSION - Error: ${err.message}`, "FAILED");
    }
  };

  const handleLogout = async () => {
    try {
      await logAuditTrail(`LOGOUT - ${user?.name}`, "SUCCESS");
    } catch (auditErr) {
      console.error("Audit trail logging error:", auditErr);
    }
    logout();
    localStorage.removeItem("trainerToken");
    localStorage.removeItem("trainerId");
    localStorage.clear();
    navigate("/", { replace: true });
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    logAuditTrail(`FILTER SESSIONS - Status: ${status}`, "SUCCESS");
  };

  const openClientModal = (client) => {
    setSelectedClient(client);
    logAuditTrail(`VIEW CLIENT INFO - ${client.name}`, "SUCCESS");
  };
  
  const closeClientModal = () => setSelectedClient(null);
  const closeSidebar = () => setSidebarOpen(false);

  const filteredSessions = sessions.filter(s => {
    if (filterStatus === "all") return true;
    return s.status === filterStatus;
  });

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return '#D4A574';
      case 'approved': return '#6CB86E';
      case 'confirmed': return '#6CB86E';
      case 'disapproved': return '#E57373';
      case 'cancelled': return '#E57373';
      default: return '#999';
    }
  };

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
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "none", fontSize: "28px", cursor: "pointer", color: "#D4AF37" }}>☰</button>
        </div>
      )}

      {/* Sidebar - Desktop Always Visible */}
      {!isMobile && (
        <aside className="sidebar" style={{ width: "260px", flexShrink: 0, overflow: "auto", height: "100vh" }}>
          <div className="profile">
            <div className="profile-pic"><img src={logo} alt="MEL Gym Logo" style={{ objectFit: "contain", width: "95%", height: "95%" }} /></div>
            <div className="profile-info">
              <div className="profile-name">MEL GYM</div>
              <div className="profile-role">FITNESS CENTER</div>
            </div>
          </div>
          <nav className="menu">
            <ul>
              <li className={`menu-btn ${location.pathname === "/dashboard" ? "active" : ""}`}><Link to="/dashboard" className="yellow-btn">DASHBOARD</Link></li>
              <li className={`menu-btn ${location.pathname === "/personal-session" ? "active" : ""}`}><Link to="/personal-session" className="yellow-btn">PERSONAL SESSION</Link></li>
              <li className={`menu-btn ${location.pathname === "/changepass" ? "active" : ""}`}><Link to="/changepass" className="yellow-btn">CHANGE PASSWORD</Link></li>
            </ul>
          </nav>
          <div className="logout"><button className="yellow-btn" onClick={handleLogout}>LOGOUT</button></div>
        </aside>
      )}

      {/* Mobile Sidebar (Toggle) */}
      {isMobile && sidebarOpen && (
        <>
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 40 }} onClick={closeSidebar} />
          <aside className="sidebar" style={{ position: "fixed", top: 60, left: 0, width: "260px", height: "calc(100vh - 60px)", overflow: "auto", zIndex: 50 }}>
            <div className="profile">
              <div className="profile-pic"><img src={logo} alt="MEL Gym Logo" style={{ objectFit: "contain", width: "95%", height: "95%" }} /></div>
              <div className="profile-info">
                <div className="profile-name">MEL GYM</div>
                <div className="profile-role">FITNESS CENTER</div>
              </div>
            </div>
            <nav className="menu">
              <ul>
                <li className={`menu-btn ${location.pathname === "/dashboard" ? "active" : ""}`}><Link to="/dashboard" className="yellow-btn" onClick={closeSidebar}>DASHBOARD</Link></li>
                <li className={`menu-btn ${location.pathname === "/personal-session" ? "active" : ""}`}><Link to="/personal-session" className="yellow-btn" onClick={closeSidebar}>PERSONAL SESSION</Link></li>
                <li className={`menu-btn ${location.pathname === "/changepass" ? "active" : ""}`}><Link to="/changepass" className="yellow-btn" onClick={closeSidebar}>CHANGE PASSWORD</Link></li>
              </ul>
            </nav>
            <div className="logout"><button className="yellow-btn" onClick={handleLogout}>LOGOUT</button></div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <main style={{ flex: 1, backgroundColor: "#f5f5f5", overflow: "auto", paddingTop: isMobile ? "70px" : "0", padding: isMobile ? "70px 20px 20px 20px" : "30px" }}>
        <div style={{ marginBottom: isMobile ? "1.5rem" : "2rem" }}>
          <h1 style={{ fontSize: isMobile ? "24px" : "2rem", fontWeight: "600", color: "#333", margin: 0, marginBottom: "0.5rem" }}>MY SESSION BOOKINGS</h1>
          <p style={{ color: "#666", fontSize: isMobile ? "0.85rem" : "0.95rem", margin: 0 }}>{user ? `Welcome, ${user.name}` : "Manage your training session requests"}</p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fit, minmax(200px, 1fr))", gap: isMobile ? "0.75rem" : "1rem", marginBottom: isMobile ? "1.5rem" : "2rem" }}>
          <div style={{ background: "linear-gradient(135deg, #D4A574 0%, #B8935F 100%)", borderRadius: "12px", padding: isMobile ? "1rem" : "1.5rem", color: "white", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: isMobile ? "0.7rem" : "0.85rem", opacity: 0.9, marginBottom: "0.5rem" }}>TOTAL SESSIONS</div>
            <div style={{ fontSize: isMobile ? "1.5rem" : "2rem", fontWeight: "bold" }}>{sessions.length}</div>
          </div>
          <div style={{ background: "linear-gradient(135deg, #D4A574 0%, #C9A565 100%)", borderRadius: "12px", padding: isMobile ? "1rem" : "1.5rem", color: "white", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: isMobile ? "0.7rem" : "0.85rem", opacity: 0.9, marginBottom: "0.5rem" }}>PENDING</div>
            <div style={{ fontSize: isMobile ? "1.5rem" : "2rem", fontWeight: "bold" }}>{sessions.filter(s => s.status === "pending").length}</div>
          </div>
          <div style={{ background: "linear-gradient(135deg, #6CB86E 0%, #5CA65E 100%)", borderRadius: "12px", padding: isMobile ? "1rem" : "1.5rem", color: "white", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: isMobile ? "0.7rem" : "0.85rem", opacity: 0.9, marginBottom: "0.5rem" }}>APPROVED</div>
            <div style={{ fontSize: isMobile ? "1.5rem" : "2rem", fontWeight: "bold" }}>{sessions.filter(s => s.status === "approved" || s.status === "confirmed").length}</div>
          </div>
          <div style={{ background: "linear-gradient(135deg, #8B7355 0%, #7A6349 100%)", borderRadius: "12px", padding: isMobile ? "1rem" : "1.5rem", color: "white", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: isMobile ? "0.7rem" : "0.85rem", opacity: 0.9, marginBottom: "0.5rem" }}>DISAPPROVED</div>
            <div style={{ fontSize: isMobile ? "1.5rem" : "2rem", fontWeight: "bold" }}>{sessions.filter(s => s.status === "disapproved" || s.status === "cancelled").length}</div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div style={{ background: "white", borderRadius: "12px", padding: isMobile ? "1rem" : "1.5rem", marginBottom: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", gap: isMobile ? "0.5rem" : "0.75rem", flexWrap: "wrap" }}>
            {[{ key: 'all', label: 'All Sessions', count: sessions.length }, { key: 'pending', label: 'Pending', count: sessions.filter(s => s.status === "pending").length }, { key: 'approved', label: 'Approved', count: sessions.filter(s => s.status === "approved" || s.status === "confirmed").length }, { key: 'disapproved', label: 'Disapproved', count: sessions.filter(s => s.status === "disapproved" || s.status === "cancelled").length }].map(filter => (
              <button key={filter.key} onClick={() => handleFilterChange(filter.key)} style={{ padding: isMobile ? "0.5rem 0.75rem" : "0.75rem 1.5rem", border: filterStatus === filter.key ? "2px solid #D4A574" : "2px solid transparent", background: filterStatus === filter.key ? "#FFF8F0" : "#f8f9fa", color: filterStatus === filter.key ? "#D4A574" : "#666", borderRadius: "8px", cursor: "pointer", fontWeight: filterStatus === filter.key ? "600" : "500", fontSize: isMobile ? "0.75rem" : "0.9rem", transition: "all 0.2s", outline: "none", whiteSpace: "nowrap" }}>
                {isMobile ? filter.label.split(" ")[0] : filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {/* Sessions List */}
        <div style={{ background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          {loading && <div style={{ padding: "3rem", textAlign: "center", color: "#999" }}><div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>⏳</div><div>Loading sessions...</div></div>}
          {error && <div style={{ padding: "3rem", textAlign: "center", color: "#E57373" }}><div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>⚠️</div><div>Error: {error}</div></div>}
          {!loading && !error && filteredSessions.length === 0 && <div style={{ padding: "3rem", textAlign: "center", color: "#999" }}><div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>📋</div><div>No sessions found.</div></div>}
          {!loading && !error && filteredSessions.length > 0 && (
            <div style={{ padding: isMobile ? "1rem" : "1.5rem" }}>
              {filteredSessions.map((session, idx) => (
                <div key={session.id} style={{ background: (session.status === "disapproved" || session.status === "cancelled") ? "#fafafa" : "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: isMobile ? "1rem" : "1.5rem", marginBottom: idx < filteredSessions.length - 1 ? "1rem" : "0", opacity: (session.status === "disapproved" || session.status === "cancelled") ? 0.7 : 1, transition: "all 0.2s", position: "relative" }}>
                  <div style={{ position: "absolute", top: isMobile ? "0.75rem" : "1rem", right: isMobile ? "0.75rem" : "1rem", padding: isMobile ? "0.3rem 0.75rem" : "0.4rem 1rem", borderRadius: "20px", background: getStatusColor(session.status), color: "white", fontSize: isMobile ? "0.65rem" : "0.75rem", fontWeight: "600", textTransform: "uppercase" }}>{session.status}</div>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))", gap: isMobile ? "1rem" : "1.5rem", marginBottom: "1.5rem", marginRight: isMobile ? "0" : "100px" }}>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "#999", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Client</div>
                      <div style={{ fontSize: isMobile ? "0.95rem" : "1rem", fontWeight: "600", color: "#333", cursor: "pointer", textDecoration: "underline" }} onClick={() => openClientModal(session.client)}>{session.client?.name || "—"}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "#999", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Type</div>
                      <div style={{ fontSize: isMobile ? "0.95rem" : "1rem", fontWeight: "600", color: "#D4A574" }}>{session.type}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "#999", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Date</div>
                      <div style={{ fontSize: isMobile ? "0.95rem" : "1rem", fontWeight: "500", color: "#333" }}>{formatDate(session.date)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "#999", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Time</div>
                      <div style={{ fontSize: isMobile ? "0.95rem" : "1rem", fontWeight: "500", color: "#333" }}>{formatTime(session.timeIn)} - {formatTime(session.timeOut)}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: isMobile ? "0.5rem" : "0.75rem", paddingTop: "1rem", borderTop: "1px solid #f0f0f0", flexWrap: isMobile ? "wrap" : "nowrap" }}>
                    {session.status === "pending" && (
                      <>
                        <button onClick={() => handleApprove(session.id)} style={{ padding: isMobile ? "0.5rem 1rem" : "0.6rem 1.5rem", background: "#6CB86E", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: isMobile ? "0.75rem" : "0.85rem", transition: "all 0.2s", outline: "none", flex: isMobile ? "1" : "auto" }}>✓ Approve</button>
                        <button onClick={() => handleDisapprove(session.id)} style={{ padding: isMobile ? "0.5rem 1rem" : "0.6rem 1.5rem", background: "#E57373", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: isMobile ? "0.75rem" : "0.85rem", transition: "all 0.2s", outline: "none", flex: isMobile ? "1" : "auto" }}>✗ Disapprove</button>
                      </>
                    )}
                    <button onClick={() => handleDelete(session.id)} style={{ padding: isMobile ? "0.5rem 0.8rem" : "0.6rem 1.2rem", background: "#f5f5f5", color: "#999", border: "1px solid #e0e0e0", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: isMobile ? "0.75rem" : "0.85rem", transition: "all 0.2s", marginLeft: session.status === "pending" ? "0" : isMobile ? "0" : "auto", outline: "none", flex: isMobile && session.status === "pending" ? "1" : "auto" }}>🗑️ Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Client Modal */}
        {selectedClient && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={closeClientModal}>
            <div style={{ background: "white", borderRadius: "12px", padding: isMobile ? "1.5rem" : "2rem", maxWidth: "500px", width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ fontSize: isMobile ? "1.25rem" : "1.5rem", marginBottom: "1.5rem", color: "#333", borderBottom: "2px solid #D4A574", paddingBottom: "0.75rem" }}>Client Information</h3>
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.75rem", color: "#999", marginBottom: "0.25rem", textTransform: "uppercase", fontWeight: "600" }}>Name</div>
                <div style={{ fontSize: isMobile ? "1rem" : "1.1rem", fontWeight: "600", color: "#333" }}>{selectedClient.name}</div>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.75rem", color: "#999", marginBottom: "0.25rem", textTransform: "uppercase", fontWeight: "600" }}>Contact</div>
                <div style={{ fontSize: isMobile ? "1rem" : "1.1rem", color: "#666" }}>{selectedClient.contact || "—"}</div>
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ fontSize: "0.75rem", color: "#999", marginBottom: "0.25rem", textTransform: "uppercase", fontWeight: "600" }}>Email</div>
                <div style={{ fontSize: isMobile ? "1rem" : "1.1rem", color: "#666" }}>{selectedClient.email || "—"}</div>
              </div>
              <button onClick={closeClientModal} style={{ width: "100%", padding: isMobile ? "0.65rem" : "0.75rem", background: "#D4A574", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: isMobile ? "0.9rem" : "1rem", transition: "all 0.2s" }}>Close</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PersonalSession;