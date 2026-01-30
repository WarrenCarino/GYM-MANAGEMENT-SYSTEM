import React, { useState, useEffect } from "react";

export default function ClientsBooking() {
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("sessions");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedTrainer, setSelectedTrainer] = useState("");

  const API_URL = "http://localhost:8000";

  useEffect(() => {
    fetchSessions();
    fetchClasses();
    fetchMembers();
    fetchTrainers();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/sessions`);
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await fetch(`${API_URL}/api/classes`);
      const data = await res.json();
      setClasses(data);
    } catch (err) {
      console.error("Error fetching classes:", err);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/members`);
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      console.error("Error fetching members:", err);
    }
  };

  const fetchTrainers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/trainers`);
      const data = await res.json();
      console.log("Trainers fetched:", data);
      setTrainers(data);
    } catch (err) {
      console.error("Error fetching trainers:", err);
    }
  };

  const getMemberInfo = (memberId) => {
    const member = members.find(m => m.member_id === memberId);
    if (!member) {
      return {
        member_name: "N/A",
        member_email: "N/A",
        member_contact: "N/A"
      };
    }
    
    return {
      member_name: member.member_name || member.name || "N/A",
      member_email: member.member_email || member.email || "N/A",
      member_contact: member.member_contact || member.contact || member.contact_number || "N/A"
    };
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    const timeParts = timeStr.split(':');
    const hours = parseInt(timeParts[0]);
    const minutes = timeParts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${String(displayHour).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const openAssignModal = (session) => {
    setSelectedSession(session);
    setSelectedTrainer(session.trainer_name || "");
    setShowAssignModal(true);
  };

  const handleAssignTrainer = async () => {
    if (!selectedTrainer) {
      alert("Please select a trainer");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/sessions/${selectedSession.session_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainer_name: selectedTrainer,
          status: "pending"
        })
      });
      
      if (!res.ok) throw new Error('Failed to assign trainer');
      
      fetchSessions();
      setShowAssignModal(false);
      setSelectedSession(null);
      setSelectedTrainer("");
      alert("Trainer reassigned successfully! Status set to pending.");
    } catch (err) {
      console.error("Error assigning trainer:", err);
      alert("Failed to assign trainer");
    }
  };

  const handleDeactivateSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to deactivate this session?")) return;
    
    try {
      const res = await fetch(`${API_URL}/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: "deactivated" })
      });
      
      if (!res.ok) throw new Error('Failed to deactivate session');
      
      fetchSessions();
      alert("Session deactivated successfully!");
    } catch (err) {
      console.error("Error deactivating session:", err);
      alert("Failed to deactivate session");
    }
  };

  const handleReject = async (sessionId) => {
    if (!window.confirm("Are you sure you want to reject this session?")) return;
    
    try {
      const res = await fetch(`${API_URL}/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: "rejected" })
      });
      
      if (!res.ok) throw new Error('Failed to reject session');
      
      fetchSessions();
      alert("Session rejected successfully!");
    } catch (err) {
      console.error("Error rejecting session:", err);
      alert("Failed to reject session");
    }
  };

  const handleAcceptClass = async (classId) => {
    if (!window.confirm("Are you sure you want to accept this class booking?")) return;
    
    try {
      const res = await fetch(`${API_URL}/api/classes/${classId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: "approved" })
      });
      
      if (!res.ok) throw new Error('Failed to accept class');
      
      fetchClasses();
      alert("Class booking accepted successfully!");
    } catch (err) {
      console.error("Error accepting class:", err);
      alert("Failed to accept class booking");
    }
  };

  const handleRejectClass = async (classId) => {
    if (!window.confirm("Are you sure you want to reject this class booking?")) return;
    
    try {
      const res = await fetch(`${API_URL}/api/classes/${classId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: "rejected" })
      });
      
      if (!res.ok) throw new Error('Failed to reject class');
      
      fetchClasses();
      alert("Class booking rejected successfully!");
    } catch (err) {
      console.error("Error rejecting class:", err);
      alert("Failed to reject class booking");
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (filter === "all") return true;
    const sessionStatus = session.status || "pending";
    return sessionStatus === filter;
  });

  const filteredClasses = classes.filter(classBooking => {
    if (filter === "all") return true;
    const classStatus = classBooking.status || "pending";
    return classStatus === filter;
  });

  const sessionStats = {
    total: sessions.length,
    pending: sessions.filter(s => !s.status || s.status === "pending").length,
    approved: sessions.filter(s => s.status === "approved").length,
    rejected: sessions.filter(s => s.status === "rejected").length,
    deactivated: sessions.filter(s => s.status === "deactivated").length
  };

  const classStats = {
    total: classes.length,
    pending: classes.filter(c => !c.status || c.status === "pending").length,
    approved: classes.filter(c => c.status === "approved").length,
    rejected: classes.filter(c => c.status === "rejected").length
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading sessions...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', width: '100%' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Client Session Requests</h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Manage client session and class requests
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab("sessions")}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            background: activeTab === "sessions" ? '#f59e0b' : '#e5e7eb',
            color: activeTab === "sessions" ? 'white' : '#374151',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Sessions
        </button>
        <button 
          onClick={() => setActiveTab("classes")}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            background: activeTab === "classes" ? '#f59e0b' : '#e5e7eb',
            color: activeTab === "classes" ? 'white' : '#374151',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Classes
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        {activeTab === "sessions" ? (
          <>
            <StatCard title="Total Sessions" value={sessionStats.total} icon="📅" color="#10b981" />
            <StatCard title="Pending" value={sessionStats.pending} icon="⏳" color="#f59e0b" />
            <StatCard title="Approved" value={sessionStats.approved} icon="✅" color="#10b981" />
            <StatCard title="Disapproved" value={sessionStats.rejected} icon="❌" color="#ef4444" />
          </>
        ) : (
          <>
            <StatCard title="Total Classes" value={classStats.total} icon="🏋️" color="#10b981" />
            <StatCard title="Pending" value={classStats.pending} icon="⏳" color="#f59e0b" />
            <StatCard title="Approved" value={classStats.approved} icon="✅" color="#10b981" />
            <StatCard title="Rejected" value={classStats.rejected} icon="❌" color="#ef4444" />
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['all', 'pending', 'approved', 'rejected', 'disapproved', 'deactivated'].map(status => (
          <button 
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: filter === status ? '#f59e0b' : 'white',
              color: filter === status ? 'white' : '#374151',
              fontWeight: '500',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {activeTab === "sessions" && (
        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={thStyle}>Client Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>Session Type</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Time In</th>
                <th style={thStyle}>Time Out</th>
                <th style={thStyle}>Trainer</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                    No sessions found
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => {
                  const sessionStatus = session.status || "pending";
                  const isPending = sessionStatus === "pending";
                  const isApproved = sessionStatus === "approved";
                  const isRejected = sessionStatus === "rejected" || sessionStatus === "disapproved";
                  const isDeactivated = sessionStatus === "deactivated";

                  return (
                    <tr key={session.session_id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={tdStyle}>{session.client_name}</td>
                      <td style={tdStyle}>{session.client_email}</td>
                      <td style={tdStyle}>{session.client_contact}</td>
                      <td style={tdStyle}>{session.session_type || "Personal"}</td>
                      <td style={tdStyle}>{new Date(session.session_date).toLocaleDateString()}</td>
                      <td style={tdStyle}>{formatTime(session.session_timein)}</td>
                      <td style={tdStyle}>{formatTime(session.session_timeout)}</td>
                      <td style={tdStyle}>
                        {session.trainer_name ? (
                          <span style={{ 
                            padding: '4px 8px', 
                            background: '#dbeafe', 
                            color: '#1e40af', 
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            {session.trainer_name}
                          </span>
                        ) : (
                          <span style={{ color: '#9ca3af', fontSize: '12px' }}>Not assigned</span>
                        )}
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: isPending ? '#fef3c7' : isApproved ? '#d1fae5' : isDeactivated ? '#fee2e2' : '#fee2e2',
                          color: isPending ? '#92400e' : isApproved ? '#065f46' : isDeactivated ? '#991b1b' : '#991b1b'
                        }}>
                          {sessionStatus.toUpperCase()}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {isPending && (
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button 
                              onClick={() => openAssignModal(session)}
                              style={{
                                padding: '6px 12px',
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {session.trainer_name ? 'Reassign' : 'Assign'}
                            </button>
                            <button 
                              onClick={() => handleReject(session.session_id)}
                              style={{
                                padding: '6px 12px',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {isApproved && (
                          <span style={{ color: '#059669', fontSize: '12px', fontWeight: '600' }}>✓ Approved</span>
                        )}
                        {isRejected && (
                          <button 
                            onClick={() => openAssignModal(session)}
                            style={{
                              padding: '8px 14px',
                              background: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            ✓ Reassign
                          </button>
                        )}
                        {isDeactivated && (
                          <span style={{ color: '#f97316', fontSize: '12px', fontWeight: '600' }}>🛑 Deactivated</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "classes" && (
        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={thStyle}>Client Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>Class Name</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Time</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                    No class bookings found
                  </td>
                </tr>
              ) : (
                filteredClasses.map((classBooking) => {
                  const classStatus = classBooking.status || "pending";
                  const isPending = classStatus === "pending";
                  const isApproved = classStatus === "approved";
                  const isRejected = classStatus === "rejected";
                  
                  const memberInfo = getMemberInfo(classBooking.member_id);

                  return (
                    <tr key={classBooking.classes_id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={tdStyle}>{memberInfo.member_name}</td>
                      <td style={tdStyle}>{memberInfo.member_email}</td>
                      <td style={tdStyle}>{memberInfo.member_contact}</td>
                      <td style={tdStyle}>{classBooking.classes_type || "N/A"}</td>
                      <td style={tdStyle}>{new Date(classBooking.classes_date).toLocaleDateString()}</td>
                      <td style={tdStyle}>{formatTime(classBooking.classes_timein)}</td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: isPending ? '#fef3c7' : isApproved ? '#d1fae5' : '#fee2e2',
                          color: isPending ? '#92400e' : isApproved ? '#065f46' : '#991b1b'
                        }}>
                          {classStatus.toUpperCase()}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {isPending && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={() => handleAcceptClass(classBooking.classes_id)}
                              style={{
                                padding: '6px 12px',
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => handleRejectClass(classBooking.classes_id)}
                              style={{
                                padding: '6px 12px',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {isApproved && (
                          <span style={{ color: '#059669', fontSize: '12px', fontWeight: '600' }}>✓ Approved</span>
                        )}
                        {isRejected && (
                          <span style={{ color: '#dc2626', fontSize: '12px', fontWeight: '600' }}>✗ Rejected</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {showAssignModal && (
        <div style={{
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
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            width: '500px',
            maxWidth: '90%',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
              {selectedSession?.trainer_name ? 'Reassign Trainer' : 'Assign Trainer'}
            </h2>
            
            <div style={{ marginBottom: '20px' }}>
              <p style={{ color: '#666', marginBottom: '5px' }}>
                <strong>Client:</strong> {selectedSession?.client_name}
              </p>
              <p style={{ color: '#666', marginBottom: '5px' }}>
                <strong>Session:</strong> {selectedSession?.session_type}
              </p>
              <p style={{ color: '#666', marginBottom: '5px' }}>
                <strong>Date:</strong> {selectedSession && new Date(selectedSession.session_date).toLocaleDateString()}
              </p>
              <p style={{ color: '#666' }}>
                <strong>Time:</strong> {selectedSession && formatTime(selectedSession.session_timein)}
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
                Select Trainer *
              </label>
              <select
                value={selectedTrainer}
                onChange={(e) => setSelectedTrainer(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="">-- Select a trainer --</option>
                {trainers.map((trainer) => (
                  <option key={trainer.trainer_id} value={trainer.trainer_name}>
                    {trainer.trainer_name}
                    {trainer.specialization && ` - ${trainer.specialization}`}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleAssignTrainer}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {selectedSession?.trainer_name ? 'Update Trainer' : 'Assign Trainer'}
              </button>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedSession(null);
                  setSelectedTrainer("");
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: color,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px'
        }}>
          {icon}
        </div>
      </div>
      <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>
        {title}
      </p>
      <h3 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827' }}>
        {value}
      </h3>
    </div>
  );
}

const thStyle = {
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: '600',
  color: '#6b7280',
  textTransform: 'uppercase'
};

const tdStyle = {
  padding: '16px',
  fontSize: '14px',
  color: '#374151'
};