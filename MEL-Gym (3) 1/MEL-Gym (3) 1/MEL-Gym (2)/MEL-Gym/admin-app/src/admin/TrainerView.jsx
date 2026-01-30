// src/admin/TrainerView.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./TrainerView.css";

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const getTimeColor = (hour) => {
  if (hour >= 5 && hour < 12) return "#D1FAE5"; // Morning
  if (hour >= 12 && hour < 17) return "#FEF3C7"; // Afternoon
  if (hour >= 17 && hour < 21) return "#DBEAFE"; // Evening
  return "#F3E8FF"; // Night
};

export default function TrainerView() {
  const { trainerId } = useParams();
  const navigate = useNavigate();

  const [trainer, setTrainer] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("availability");
  const [selectedSession, setSelectedSession] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());
    return start;
  });

  // ✅ Selected day for adding a new schedule
  const [newScheduleDay, setNewScheduleDay] = useState("Monday");

  const API_URL = "http://localhost:8081";

  useEffect(() => {
    const fetchTrainerData = async () => {
      try {
        const resTrainer = await fetch(`${API_URL}/api/trainer/${trainerId}`);
        if (!resTrainer.ok) throw new Error("Trainer not found");
        const dataTrainer = await resTrainer.json();
        setTrainer(dataTrainer);

        const resSessions = await fetch(`${API_URL}/api/trainer/${trainerId}/sessions`);
        const dataSessions = await resSessions.json();
        setSessions(dataSessions);

        const resSchedules = await fetch(`${API_URL}/api/trainer/${trainerId}/schedules`);
        const dataSchedules = await resSchedules.json();
        setSchedules(dataSchedules);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setTrainer(null);
        setLoading(false);
      }
    };
    fetchTrainerData();
  }, [trainerId]);

  const getSessionsForWeek = (sessionType) => {
    return sessions
      .filter(s => s.session_type === sessionType)
      .filter(s => {
        const sessionDate = new Date(s.session_date);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return sessionDate >= weekStart && sessionDate <= weekEnd;
      })
      .map(s => ({
        ...s,
        id: s.session_id,
        status: new Date(`${s.session_date}T${s.session_time}`) < new Date() ? "DONE" : "UPCOMING",
      }));
  };

  const personalSessions = getSessionsForWeek('Personal');
  const classSessions = getSessionsForWeek('Class');

  const nextWeek = () => setWeekStart(new Date(weekStart.setDate(weekStart.getDate() + 7)));
  const prevWeek = () => setWeekStart(new Date(weekStart.setDate(weekStart.getDate() - 7)));
  const nextMonth = () => setWeekStart(new Date(weekStart.setMonth(weekStart.getMonth() + 1)));
  const prevMonth = () => setWeekStart(new Date(weekStart.setMonth(weekStart.getMonth() - 1)));

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  // ---------------- Schedule Handlers ----------------
  const handleEditSchedule = (schedule) => {
    setEditingId(schedule.schedule_id);
    setEditData({ ...schedule });
  };

  const handleSaveSchedule = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/trainer/${trainerId}/schedules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      const updated = await res.json();
      setSchedules(schedules.map(s => s.schedule_id === id ? editData : s));
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      await fetch(`${API_URL}/api/trainer/${trainerId}/schedules/${id}`, { method: "DELETE" });
      setSchedules(schedules.filter(s => s.schedule_id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSchedule = async () => {
    const newSchedule = {
      trainer_id: parseInt(trainerId),
      day: newScheduleDay,
      start_time: "09:00:00",
      end_time: "17:00:00",
      type: "Available",
    };
    try {
      const res = await fetch(`${API_URL}/api/trainer/${trainerId}/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSchedule),
      });
      const created = await res.json();
      setSchedules([...schedules, { schedule_id: created.result.insertId, ...newSchedule }]);
    } catch (err) {
      console.error(err);
    }
  };

  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const groupedSchedules = days.reduce((acc, day) => {
    acc[day] = schedules.filter(s => s.day === day);
    return acc;
  }, {});

  if (loading) return <div className="loading">Loading trainer details...</div>;
  if (!trainer) return <div className="loading">Trainer not found</div>;

  return (
    <div className="trainer-view-wrapper">
      <Sidebar activePage="trainers" setActivePage={() => {}} />
      <div className="trainer-view-container">
        <aside className="trainer-sidebar">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
          <div className="trainer-card">
            <div className="trainer-icon">{trainer.icon || "💪"}</div>
            <h2 className="trainer-name">{trainer.name}</h2>
            <p className="trainer-spec">{trainer.specialization || "Fitness Coach"}</p>
            <div className="trainer-stats">
              <div className="stat-item">
                <span className="stat-label">Rating</span>
                <span className="stat-value">⭐ {trainer.rating || 5}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Experience</span>
                <span className="stat-value">{trainer.experience || "5 years"}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Sessions</span>
                <span className="stat-value">{trainer.sessions || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Members</span>
                <span className="stat-value">{trainer.members || 0}</span>
              </div>
            </div>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-label">Email:</span>
                <span className="contact-value">{trainer.email}</span>
              </div>
              <div className="contact-item">
                <span className="contact-label">Contact:</span>
                <span className="contact-value">{trainer.contact}</span>
              </div>
              <div className="contact-item">
                <span className="contact-label">Status:</span>
                <span className={`status-badge ${trainer.status === 'Active' ? 'active' : 'on-leave'}`}>
                  {trainer.status || "Active"}
                </span>
              </div>
            </div>
          </div>
        </aside>

        <main className="trainer-main-content">
          <h1 className="page-title">{trainer.name} <span className="highlight">Schedule</span></h1>

          <div className="tabs-container">
            <button className={`tab-btn ${activeTab === 'availability' ? 'active' : ''}`} onClick={() => setActiveTab('availability')}>📅 Availability</button>
            <button className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`} onClick={() => setActiveTab('personal')}>👤 Personal Sessions</button>
            <button className={`tab-btn ${activeTab === 'class' ? 'active' : ''}`} onClick={() => setActiveTab('class')}>👥 Class Sessions</button>
          </div>

          {/* Availability Tab */}
          {activeTab === 'availability' && (
            <div className="content-section">
              <div className="schedule-controls">
                <h2 className="section-title">Weekly Availability Schedule</h2>
                <div className="add-schedule-row">
                  <select value={newScheduleDay} onChange={(e) => setNewScheduleDay(e.target.value)}>
                    {days.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  <button className="add-schedule-btn" onClick={handleAddSchedule}>+ Add Schedule</button>
                </div>
              </div>

              <div className="schedule-table">
                <div className="schedule-header">
                  <div className="col-day">Day</div>
                  <div className="col-time">Start Time</div>
                  <div className="col-time">End Time</div>
                  <div className="col-type">Type</div>
                  <div className="col-actions">Actions</div>
                </div>

                {days.map(day => (
                  <div key={day}>
                    {groupedSchedules[day].length === 0 ? (
                      <div className="schedule-row day-empty">
                        <div className="col-day">{day}</div>
                        <div className="col-time">-</div>
                        <div className="col-time">-</div>
                        <div className="col-type">Not Available</div>
                        <div className="col-actions">-</div>
                      </div>
                    ) : (
                      groupedSchedules[day].map(schedule => {
                        const startHour = parseInt(schedule.start_time.split(':')[0]);
                        const bgColor = getTimeColor(startHour);

                        return editingId === schedule.schedule_id ? (
                          <div key={schedule.schedule_id} className="schedule-row editing">
                            <div className="col-day">{editData.day}</div>
                            <div className="col-time">
                              <input 
                                type="time" 
                                value={editData.start_time}
                                onChange={(e) => setEditData({...editData, start_time: e.target.value})}
                              />
                            </div>
                            <div className="col-time">
                              <input 
                                type="time" 
                                value={editData.end_time}
                                onChange={(e) => setEditData({...editData, end_time: e.target.value})}
                              />
                            </div>
                            <div className="col-type">
                              <select 
                                value={editData.type}
                                onChange={(e) => setEditData({...editData, type: e.target.value})}
                              >
                                <option value="Available">Available</option>
                                <option value="Break">Break</option>
                                <option value="Booked">Booked</option>
                              </select>
                            </div>
                            <div className="col-actions">
                              <button className="btn-save" onClick={() => handleSaveSchedule(schedule.schedule_id)}>Save</button>
                              <button className="btn-cancel" onClick={() => setEditingId(null)}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div key={schedule.schedule_id} className="schedule-row" style={{ backgroundColor: bgColor }}>
                            <div className="col-day">{schedule.day}</div>
                            <div className="col-time">{schedule.start_time}</div>
                            <div className="col-time">{schedule.end_time}</div>
                            <div className="col-type">
                              <span className={`badge badge-${schedule.type.toLowerCase()}`}>
                                {schedule.type}
                              </span>
                            </div>
                            <div className="col-actions">
                              <button className="btn-edit" onClick={() => handleEditSchedule(schedule)}>Edit</button>
                              <button className="btn-delete" onClick={() => handleDeleteSchedule(schedule.schedule_id)}>Delete</button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Personal Sessions Tab */}
          {activeTab === 'personal' && (
            <div className="content-section">
              <div className="header-with-buttons">
                <h2 className="section-title">
                  Personal Sessions ({formatDate(weekStart)} - {formatDate(weekEnd)})
                </h2>
                <div className="week-buttons">
                  <button onClick={prevMonth}>Previous Month</button>
                  <button onClick={prevWeek}>Previous Week</button>
                  <button onClick={nextWeek}>Next Week</button>
                  <button onClick={nextMonth}>Next Month</button>
                </div>
              </div>

              <div className="table">
                <div className="table-header">
                  <span className="col class-header">Type</span>
                  <span className="col date-header">Date</span>
                  <span className="col time-header">Time</span>
                  <span className="col clients-header">Client</span>
                  <span className="col status-header">Status</span>
                </div>

                {personalSessions.length === 0 ? (
                  <div className="table-row">
                    <div style={{ padding: "1rem", width: "100%", textAlign: "center", color: "#6B7280" }}>
                      No personal sessions this week.
                    </div>
                  </div>
                ) : (
                  personalSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`table-row ${session.status === "DONE" ? "done-row" : ""}`}
                      onClick={() => setSelectedSession(session)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="col class-cell">{session.session_type}</span>
                      <span className="col date-cell">{formatDate(session.session_date)}</span>
                      <span className="col time-cell">{session.session_time.substring(0, 5)}</span>
                      <span className="col clients-cell">{session.client_name}</span>
                      <span className={`col status-cell ${session.status === "DONE" ? "status-done" : "status-upcoming"}`}>
                        {session.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Class Sessions Tab */}
          {activeTab === 'class' && (
            <div className="content-section">
              <div className="header-with-buttons">
                <h2 className="section-title">
                  Class Sessions ({formatDate(weekStart)} - {formatDate(weekEnd)})
                </h2>
                <div className="week-buttons">
                  <button onClick={prevMonth}>Previous Month</button>
                  <button onClick={prevWeek}>Previous Week</button>
                  <button onClick={nextWeek}>Next Week</button>
                  <button onClick={nextMonth}>Next Month</button>
                </div>
              </div>

              <div className="table">
                <div className="table-header">
                  <span className="col class-header">Type</span>
                  <span className="col date-header">Date</span>
                  <span className="col time-header">Time</span>
                  <span className="col clients-header">Client</span>
                  <span className="col status-header">Status</span>
                </div>

                {classSessions.length === 0 ? (
                  <div className="table-row">
                    <div style={{ padding: "1rem", width: "100%", textAlign: "center", color: "#6B7280" }}>
                      No class sessions this week.
                    </div>
                  </div>
                ) : (
                  classSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`table-row ${session.status === "DONE" ? "done-row" : ""}`}
                      onClick={() => setSelectedSession(session)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="col class-cell">{session.session_type}</span>
                      <span className="col date-cell">{formatDate(session.session_date)}</span>
                      <span className="col time-cell">{session.session_time.substring(0, 5)}</span>
                      <span className="col clients-cell">{session.client_name}</span>
                      <span className={`col status-cell ${session.status === "DONE" ? "status-done" : "status-upcoming"}`}>
                        {session.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
