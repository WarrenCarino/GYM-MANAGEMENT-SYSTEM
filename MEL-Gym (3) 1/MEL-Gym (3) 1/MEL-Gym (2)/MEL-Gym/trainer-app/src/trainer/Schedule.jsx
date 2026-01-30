import React, { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ScheduleContext } from "./ScheduleContext"; // relative path
import { ProfileContext } from "./ProfileContext";
import "./Schedule.css";

const Schedule = () => {
  const location = useLocation();
  const { scheduleData } = useContext(ScheduleContext);

  // Use shared profile context
  const { coachName, setCoachName, profilePic, setProfilePic } = useContext(ProfileContext);
  const [editingName, setEditingName] = useState(false);

  const handlePicChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => setProfilePic(ev.target.result);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="profile">
          <div
            className="profile-pic"
            onClick={() => document.getElementById("profilePicInput").click()}
            style={{ cursor: "pointer" }}
          >
            <img src={profilePic} alt="Profile" />
            <input
              type="file"
              id="profilePicInput"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePicChange}
            />
          </div>
          <div className="profile-info">
            {editingName ? (
              <div className="edit-name-container">
                <input
                  className="edit-name-input"
                  type="text"
                  value={coachName}
                  onChange={(e) => setCoachName(e.target.value)}
                  autoFocus
                />
                <button
                  className="save-name-btn"
                  onClick={() => setEditingName(false)}
                >
                  Save
                </button>
              </div>
            ) : (
              <div
                className="profile-name"
                onClick={() => setEditingName(true)}
                style={{ cursor: "pointer" }}
              >
                {coachName.toUpperCase()}
              </div>
            )}
            <div className="profile-role">TRAINER</div>
          </div>
        </div>

        {/* Sidebar Menu */}
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
            <li className={`menu-btn ${location.pathname === "/schedule" ? "active" : ""}`}>
              <Link to="/schedule" className="yellow-btn">SCHEDULE</Link>
            </li>
            <li className={`menu-btn ${location.pathname === "/changepass" ? "active" : ""}`}>
              <Link to="/changepass" className="yellow-btn">CHANGE PASSWORD</Link>
            </li>
          </ul>
        </nav>

        <div className="logout">
          <Link to="/">LOGOUT</Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <h1 className="title">SCHEDULE</h1>

        <div className="schedule-container">
          <h2 className="schedule-title">Weekly Schedule</h2>
          <div className="schedule-grid">
            {scheduleData.map((dayData, index) => (
              <div key={index} className="day-column">
                <h3 className="day-header">{dayData.day}</h3>
                <div className="time-slots">
                  {dayData.slots.length > 0 ? (
                    dayData.slots.map((slot, slotIndex) => (
                      <div key={slotIndex} className="time-slot">
                        <span className="time">{slot.time}</span>
                        <span className="event">{slot.event}</span>
                      </div>
                    ))
                  ) : (
                    <p className="no-events">No events</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="edit-schedule-container">
            <Link to="/edit-sched" className="yellow-btn">EDIT SCHEDULE</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Schedule;
