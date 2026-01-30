// src/trainer/ClassSession.jsx
import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ProfileContext } from "./ProfileContext";
import { ScheduleContext } from "./ScheduleContext";
import { useAuth } from "../AuthContext";
import "./ClassSession.css";

const API_URL = "http://localhost:8000";

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

const ClassSession = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profilePic } = useContext(ProfileContext);
  const { sessions, setSessions } = useContext(ScheduleContext);
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());
    return start;
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setError("Please log in to view sessions");
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`${API_URL}/api/sessions/all`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((allSessions) => {
        console.log("✅ Fetched all sessions:", allSessions);
        
        const trainerSessions = allSessions.filter(s => 
          s.trainer_name === user.name && s.session_type === "Class"
        );
        
        console.log("✅ Filtered class sessions:", trainerSessions);
        setSessions(trainerSessions);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error fetching sessions:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [user, setSessions]);

  const handleApprove = async (sessionId) => {
    try {
      const res = await fetch(`${API_URL}/api/sessions/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.error || "Failed to approve session");

      console.log("✅ Session approved");
      // Refresh sessions
      const sessionsRes = await fetch(`${API_URL}/api/sessions/all`);
      const allSessions = await sessionsRes.json();
      const trainerSessions = allSessions.filter(s => 
        s.trainer_name === user.name && s.session_type === "Class"
      );
      setSessions(trainerSessions);
    } catch (err) {
      console.error("❌ Error approving session:", err);
      alert(`Failed to approve session: ${err.message}`);
    }
  };

  const handleDisapprove = async (sessionId) => {
    if (!window.confirm("Are you sure you want to disapprove this session?")) return;

    try {
      const res = await fetch(`${API_URL}/api/sessions/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "disapproved" }),
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.error || "Failed to disapprove session");

      console.log("✅ Session disapproved");
      // Refresh sessions
      const sessionsRes = await fetch(`${API_URL}/api/sessions/all`);
      const allSessions = await sessionsRes.json();
      const trainerSessions = allSessions.filter(s => 
        s.trainer_name === user.name && s.session_type === "Class"
      );
      setSessions(trainerSessions);
    } catch (err) {
      console.error("❌ Error disapproving session:", err);
      alert(`Failed to disapprove session: ${err.message}`);
    }
  };

  const handleDelete = async (sessionId) => {
    if (!window.confirm("Are you sure you want to delete this session? This cannot be undone.")) return;

    try {
      const res = await fetch(`${API_URL}/api/sessions/${sessionId}`, {
        method: "DELETE",
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.error || "Failed to delete session");

      console.log("✅ Session deleted");
      // Refresh sessions
      const sessionsRes = await fetch(`${API_URL}/api/sessions/all`);
      const allSessions = await sessionsRes.json();
      const trainerSessions = allSessions.filter(s => 
        s.trainer_name === user.name && s.session_type === "Class"
      );
      setSessions(trainerSessions);
    } catch (err) {
      console.error("❌ Error deleting session:", err);
      alert(`Failed to delete session: ${err.message}`);
    }
  };

  const sessionsForTrainer = sessions
    .filter((s) => s.session_type === "Class")
    .filter((s) => {
      const sessionDate = new Date(s.session_date);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return sessionDate >= weekStart && sessionDate <= weekEnd;
    })
    .map((s) => ({
      ...s,
      id: s.session_id,
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

  const filteredSessions = sessionsForTrainer.filter(s => {
    if (filterStatus === "all") return true;
    return s.status === filterStatus;
  });

  const nextWeek = () => setWeekStart(new Date(weekStart.setDate(weekStart.getDate() + 7)));
  const prevWeek = () => setWeekStart(new Date(weekStart.setDate(weekStart.getDate() - 7)));
  const nextMonth = () => setWeekStart(new Date(weekStart.setMonth(weekStart.getMonth() + 1)));
  const prevMonth = () => setWeekStart(new Date(weekStart.setMonth(weekStart.getMonth() - 1)));

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const openClientModal = (client) => setSelectedSession(client);
  const closeClientModal = () => setSelectedSession(null);

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
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="profile">
          <div className="profile-pic">
            <img src={profilePic} alt="Profile" />
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
            <li className={`menu-btn ${location.pathname === "/class-session" ? "active" : ""}`}>
              <Link to="/class-session" className="yellow-btn">CLASS SESSION</Link>
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

      <main className="main-content" style={{ background: '#f5f5f5', padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '600', color: '#333', marginBottom: '0.5rem' }}>
            CLASS SESSION BOOKINGS
          </h1>
          <p style={{ color: '#666', fontSize: '0.95rem' }}>
            {user ? `Welcome, ${user.name}` : 'Manage your class session requests'}
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #D4A574 0%, #B8935F 100%)', borderRadius: '12px', padding: '1.5rem', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.5rem' }}>TOTAL SESSIONS</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{sessionsForTrainer.length}</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #D4A574 0%, #C9A565 100%)', borderRadius: '12px', padding: '1.5rem', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.5rem' }}>PENDING</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{sessionsForTrainer.filter(s => s.status === "pending").length}</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #6CB86E 0%, #5CA65E 100%)', borderRadius: '12px', padding: '1.5rem', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.5rem' }}>APPROVED</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{sessionsForTrainer.filter(s => s.status === "approved" || s.status === "confirmed").length}</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #8B7355 0%, #7A6349 100%)', borderRadius: '12px', padding: '1.5rem', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.5rem' }}>DISAPPROVED</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{sessionsForTrainer.filter(s => s.status === "disapproved" || s.status === "cancelled").length}</div>
          </div>
        </div>

        {/* Week Navigation and Filter */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#333', margin: 0 }}>
              {formatDate(weekStart)} - {formatDate(weekEnd)}
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button onClick={prevMonth} style={{ padding: '0.5rem 1rem', background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}>
                ← Prev Month
              </button>
              <button onClick={prevWeek} style={{ padding: '0.5rem 1rem', background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}>
                ← Prev Week
              </button>
              <button onClick={nextWeek} style={{ padding: '0.5rem 1rem', background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}>
                Next Week →
              </button>
              <button onClick={nextMonth} style={{ padding: '0.5rem 1rem', background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}>
                Next Month →
              </button>
            </div>
          </div>

          {/* Filter Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: 'All Sessions', count: sessionsForTrainer.length },
              { key: 'pending', label: 'Pending', count: sessionsForTrainer.filter(s => s.status === "pending").length },
              { key: 'approved', label: 'Approved', count: sessionsForTrainer.filter(s => s.status === "approved" || s.status === "confirmed").length },
              { key: 'disapproved', label: 'Disapproved', count: sessionsForTrainer.filter(s => s.status === "disapproved" || s.status === "cancelled").length }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setFilterStatus(filter.key)}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: filterStatus === filter.key ? '2px solid #D4A574' : '2px solid transparent',
                  background: filterStatus === filter.key ? '#FFF8F0' : '#f8f9fa',
                  color: filterStatus === filter.key ? '#D4A574' : '#666',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: filterStatus === filter.key ? '600' : '500',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {/* Sessions List */}
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          {loading && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
              <div>Loading sessions...</div>
            </div>
          )}

          {error && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#E57373' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚠️</div>
              <div>Error: {error}</div>
            </div>
          )}

          {!loading && !error && filteredSessions.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📋</div>
              <div>No class sessions this week.</div>
            </div>
          )}

          {!loading && !error && filteredSessions.length > 0 && (
            <div style={{ padding: '1.5rem' }}>
              {filteredSessions.map((session, idx) => (
                <div
                  key={session.id}
                  style={{
                    background: (session.status === "disapproved" || session.status === "cancelled") ? '#fafafa' : 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    marginBottom: idx < filteredSessions.length - 1 ? '1rem' : '0',
                    opacity: (session.status === "disapproved" || session.status === "cancelled") ? 0.7 : 1,
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  {/* Status Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    padding: '0.4rem 1rem',
                    borderRadius: '20px',
                    background: getStatusColor(session.status),
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {session.status}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem', marginRight: '100px' }}>
                    {/* Client Info */}
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Client</div>
                      <div 
                        style={{ fontSize: '1rem', fontWeight: '600', color: '#333', cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => openClientModal(session.client)}
                      >
                        {session.client?.name || "—"}
                      </div>
                    </div>

                    {/* Session Type */}
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</div>
                      <div style={{ fontSize: '1rem', fontWeight: '600', color: '#D4A574' }}>{session.type}</div>
                    </div>

                    {/* Date */}
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</div>
                      <div style={{ fontSize: '1rem', fontWeight: '500', color: '#333' }}>{formatDate(session.date)}</div>
                    </div>

                    {/* Time */}
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Time</div>
                      <div style={{ fontSize: '1rem', fontWeight: '500', color: '#333' }}>
                        {formatTime(session.timeIn)} - {formatTime(session.timeOut)}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #f0f0f0' }}>
                    {session.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(session.id)}
                          style={{
                            padding: '0.6rem 1.5rem',
                            background: '#6CB86E',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            transition: 'all 0.2s',
                            outline: 'none'
                          }}
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleDisapprove(session.id)}
                          style={{
                            padding: '0.6rem 1.5rem',
                            background: '#E57373',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            transition: 'all 0.2s',
                            outline: 'none'
                          }}
                        >
                          ✗ Disapprove
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(session.id)}
                      style={{
                        padding: '0.6rem 1.2rem',
                        background: '#f5f5f5',
                        color: '#999',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        transition: 'all 0.2s',
                        marginLeft: session.status === "pending" ? '0' : 'auto',
                        outline: 'none'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Client Modal */}
        {selectedSession && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={closeClientModal}
          >
            <div
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '2rem',
                maxWidth: '500px',
                width: '90%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#333', borderBottom: '2px solid #D4A574', paddingBottom: '0.75rem' }}>
                Client Information
              </h3>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Name</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>{selectedSession.name}</div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Contact</div>
                <div style={{ fontSize: '1.1rem', color: '#666' }}>{selectedSession.contact || "—"}</div>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Email</div>
                <div style={{ fontSize: '1.1rem', color: '#666' }}>{selectedSession.email || "—"}</div>
              </div>
              <button
                onClick={closeClientModal}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#D4A574',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ClassSession;