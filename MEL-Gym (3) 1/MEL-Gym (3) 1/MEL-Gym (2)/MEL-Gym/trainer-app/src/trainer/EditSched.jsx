import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ScheduleContext } from "./ScheduleContext";

const EditSched = () => {
  const { updateSchedule } = useContext(ScheduleContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    day: "Monday",
    time: "",
    event: "",
  });

  const [showToast, setShowToast] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSchedule(formData.day, { time: formData.time, event: formData.event });
    
    setShowToast(true);
    setFormData({ day: "Monday", time: "", event: "" });
  };

  // redirect after 2 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        navigate("/schedule");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast, navigate]);

  return (
    <div style={{
      maxWidth: '400px', margin: '50px auto', padding: '30px',
      backgroundColor: '#1f1f1f', borderRadius: '12px',
      boxShadow: '0 8px 20px rgba(0,0,0,0.3)', fontFamily: 'Arial, sans-serif',
      position: 'relative', color: '#fff'
    }}>
      <h2 style={{ textAlign: 'center', color: '#FFD700', marginBottom: '25px', fontSize: '28px' }}>Edit Schedule</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Day</label>
          <select name="day" value={formData.day} onChange={handleChange}
            style={{
              width: '100%', padding: '12px', borderRadius: '6px',
              fontSize: '16px', border: '2px solid #FFD700', backgroundColor: '#333', color: '#fff'
            }}>
            <option>Monday</option>
            <option>Tuesday</option>
            <option>Wednesday</option>
            <option>Thursday</option>
            <option>Friday</option>
            <option>Saturday</option>
            <option>Sunday</option>
          </select>
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Time</label>
          <input type="time" name="time" value={formData.time} onChange={handleChange} required
            style={{
              width: '100%', padding: '12px', borderRadius: '6px',
              fontSize: '16px', border: '2px solid #FFD700', backgroundColor: '#333', color: '#fff'
            }}
          />
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Event</label>
          <input type="text" name="event" value={formData.event} onChange={handleChange} required
            style={{
              width: '100%', padding: '12px', borderRadius: '6px',
              fontSize: '16px', border: '2px solid #FFD700', backgroundColor: '#333', color: '#fff'
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#FFD700',  // bright yellow
            color: '#1f1f1f',            // dark text
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            fontSize: '18px',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s, background-color 0.3s'
          }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        >
          Add / Update
        </button>
      </form>

      {/* Toast */}
      {showToast && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#FFD700', // match button color
          color: '#1f1f1f',
          padding: '16px 30px',
          borderRadius: '12px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
          fontWeight: 'bold',
          fontSize: '18px',
          opacity: 0,
          animation: 'fadeInOut 2s forwards'
        }}>
          Schedule updated successfully!
        </div>
      )}

      {/* Keyframes */}
      <style>
        {`
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, 20px); }
            10% { opacity: 1; transform: translate(-50%, 0); }
            90% { opacity: 1; transform: translate(-50%, 0); }
            100% { opacity: 0; transform: translate(-50%, 20px); }
          }
        `}
      </style>
    </div>
  );
};

export default EditSched;
