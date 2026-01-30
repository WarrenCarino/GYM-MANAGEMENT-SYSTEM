import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Classes() {
  const [bookedClasses, setBookedClasses] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [memberInfo, setMemberInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("available");

  const API_URL = "http://localhost:8000";
  const BOOKING_LIMIT = 3;

  const classList = [
    { 
      id: 1, 
      name: "Zumba", 
      trainer: "Anna Lopez", 
      day: "Friday",
      schedule: "Friday | 6:00 PM - 6:45 PM", 
      timeIn: "18:00",
      timeOut: "18:45",
      duration: "45 minutes",
      maxCapacity: 15,
      description: "High-energy dance fitness with Latin rhythms"
    },
    { 
      id: 2, 
      name: "HIIT", 
      trainer: "John Smith", 
      day: "Thursday",
      schedule: "Thursday | 7:00 AM - 7:30 AM", 
      timeIn: "07:00",
      timeOut: "07:30",
      duration: "30 minutes",
      maxCapacity: 12,
      description: "High-intensity interval training for maximum results"
    },
    { 
      id: 3, 
      name: "Yoga", 
      trainer: "Emma Johnson", 
      day: "Saturday",
      schedule: "Saturday | 6:00 AM - 7:00 AM", 
      timeIn: "06:00",
      timeOut: "07:00",
      duration: "60 minutes",
      maxCapacity: 20,
      description: "Mind-body practice for flexibility and relaxation"
    },
    { 
      id: 4, 
      name: "Boxing", 
      trainer: "James Brown", 
      day: "Tuesday",
      schedule: "Tuesday | 7:00 PM - 7:50 PM", 
      timeIn: "19:00",
      timeOut: "19:50",
      duration: "50 minutes",
      maxCapacity: 10,
      description: "Build muscle and increase power with weights"
    },
  ];

  useEffect(() => {
    fetchMemberInfo();
    fetchBookedClasses();
  }, []);

  const fetchMemberInfo = async () => {
    try {
      const possibleKeys = ['memberContactNumber', 'contact_number', 'userContact', 'contactNumber', 'phone', 'memberPhone', 'loggedInContact', 'user_contact'];
      let contactNumber = null;
      let foundKey = null;

      for (const key of possibleKeys) {
        const value = localStorage.getItem(key);
        if (value) {
          contactNumber = value;
          foundKey = key;
          break;
        }
      }

      const possibleIdKeys = ['memberId', 'id', 'userId', 'member_id', 'user_id'];
      let memberId = null;

      for (const key of possibleIdKeys) {
        const value = localStorage.getItem(key);
        if (value) {
          memberId = value;
          break;
        }
      }
      
      if (!contactNumber && !memberId) {
        setLoading(false);
        return;
      }

      const res = await axios.get(`${API_URL}/api/members`);
      const members = res.data;
      
      let loggedInMember = null;

      if (contactNumber) {
        loggedInMember = members.find(m => 
          String(m.contact_number) === String(contactNumber) ||
          String(m.contact_number).replace(/\D/g, '') === String(contactNumber).replace(/\D/g, '')
        );
      }

      if (!loggedInMember && memberId) {
        loggedInMember = members.find(m => String(m.id) === String(memberId));
      }
      
      if (loggedInMember) {
        setMemberInfo(loggedInMember);
      } else {
        alert("Login session not found. Please log in again.");
      }
    } catch (err) {
      console.error("Error fetching member info:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookedClasses = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/classes`);
      const data = res.data;
      if (Array.isArray(data)) {
        setBookedClasses(data);
      } else {
        setBookedClasses([]);
      }
    } catch (err) {
      console.error("Error fetching booked classes:", err);
      setBookedClasses([]);
    }
  };

  const getNextDate = (dayName) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDay = days.indexOf(dayName);
    const today = new Date();
    const currentDay = today.getDay();
    
    let daysUntilTarget = targetDay - currentDay;
    if (daysUntilTarget <= 0) {
      daysUntilTarget += 7;
    }
    
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntilTarget);
    
    return nextDate.toISOString().split('T')[0];
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${String(displayHour).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    try {
      alert('Booking cancelled successfully!');
      fetchBookedClasses();
    } catch (err) {
      alert('Failed to cancel booking');
    }
  };

  const myBookings = memberInfo 
    ? bookedClasses.filter(booking => String(booking.id) === String(memberInfo.id))
    : [];

  const canBookMore = myBookings.length < BOOKING_LIMIT;

  const handleBookNow = (classItem) => {
    if (!memberInfo) {
      alert("Please log in first to book a class");
      return;
    }
    if (myBookings.length >= BOOKING_LIMIT) {
      alert(`You have reached the maximum booking limit of ${BOOKING_LIMIT} classes. Please cancel a booking to book another class.`);
      return;
    }
    setSelectedClass(classItem);
    setShowBookingModal(true);
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    if (!memberInfo) {
      alert("Please log in to book a class");
      return;
    }

    if (myBookings.length >= BOOKING_LIMIT) {
      alert(`You have reached the maximum booking limit of ${BOOKING_LIMIT} classes.`);
      return;
    }

    const nextClassDate = getNextDate(selectedClass.day);

    const alreadyBooked = bookedClasses.some(
      booking => 
        booking.classes_type === selectedClass.name && 
        booking.classes_date === nextClassDate &&
        String(booking.id) === String(memberInfo.id)
    );

    if (alreadyBooked) {
      alert(`You already have a booking for ${selectedClass.name} on ${selectedClass.day}, ${nextClassDate}. You can book again next week!`);
      return;
    }

    try {
      const bookingData = {
        id: memberInfo.id,
        classes_type: selectedClass.name,
        classes_date: nextClassDate,
        classes_timein: selectedClass.timeIn,
        classes_timout: selectedClass.timeOut
      };

      const response = await axios.post(`${API_URL}/api/classes`, bookingData);
      alert(`Class booked successfully for ${selectedClass.day}, ${nextClassDate}! Waiting for approval.`);
      setShowBookingModal(false);
      fetchBookedClasses();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Unknown error occurred";
      alert(`Failed to book class: ${errorMessage}`);
    }
  };

  const isBooked = (classId, classDay) => {
    if (!memberInfo) return false;
    const nextDate = getNextDate(classDay);
    const classItem = classList.find(c => c.id === classId);
    return bookedClasses.some(
      booking => 
        booking.classes_type === classItem?.name &&
        booking.classes_date === nextDate &&
        String(booking.id) === String(memberInfo.id)
    );
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", padding: "24px", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
          <div style={{ fontSize: "18px", color: "#6b7280" }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", padding: "24px" }}>
      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "24px", marginBottom: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#111827", marginBottom: "4px" }}>Classes Booking</h1>
              <p style={{ fontSize: "14px", color: "#6b7280" }}>Book your favorite fitness classes (Max 3 bookings)</p>
            </div>
            <button onClick={() => setActiveTab("bookings")} style={{ backgroundColor: "#fbbf24", color: "#111827", fontWeight: "600", padding: "8px 24px", borderRadius: "4px", border: "none", cursor: "pointer" }}>
              📅 MY BOOKINGS ({myBookings.length}/{BOOKING_LIMIT})
            </button>
          </div>
        </div>

        <div style={{ backgroundColor: memberInfo ? "#3b82f6" : "#f59e0b", color: "white", borderRadius: "8px", padding: "16px", marginBottom: "24px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <div style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "50%", padding: "8px", flexShrink: 0 }}>
            {memberInfo ? "ℹ️" : "⚠️"}
          </div>
          <div style={{ fontSize: "14px" }}>
            <div style={{ fontWeight: "600", marginBottom: "4px" }}>
              {memberInfo ? `Welcome, ${memberInfo.member_name}!` : 'Not Logged In'}
            </div>
            <div style={{ opacity: 0.9 }}>
              {memberInfo ? `Contact: ${memberInfo.contact_number} | Bookings: ${myBookings.length}/${BOOKING_LIMIT}` : 'Please log in with your contact number to book classes'}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderLeft: "4px solid #10b981" }}>
            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>MY BOOKINGS</div>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "#111827" }}>{myBookings.length}/{BOOKING_LIMIT}</div>
          </div>

          <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderLeft: "4px solid #fbbf24" }}>
            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>PENDING</div>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "#111827" }}>{myBookings.filter(c => c.status === "pending").length}</div>
          </div>

          <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderLeft: "4px solid #10b981" }}>
            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>APPROVED</div>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "#111827" }}>{myBookings.filter(c => c.status === "approved").length}</div>
          </div>

          <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderLeft: "4px solid #3b82f6" }}>
            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>AVAILABLE SLOTS</div>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "#111827" }}>{classList.length}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "24px", borderBottom: "1px solid #e5e7eb", marginBottom: "24px" }}>
          <button onClick={() => setActiveTab("available")} style={{ paddingBottom: "12px", borderBottom: activeTab === "available" ? "2px solid #3b82f6" : "none", color: activeTab === "available" ? "#3b82f6" : "#6b7280", fontWeight: "500", background: "none", border: "none", cursor: "pointer", fontSize: "14px" }}>
            ⚡ Available Classes
          </button>
          <button onClick={() => setActiveTab("bookings")} style={{ paddingBottom: "12px", borderBottom: activeTab === "bookings" ? "2px solid #3b82f6" : "none", color: activeTab === "bookings" ? "#3b82f6" : "#6b7280", fontWeight: "500", background: "none", border: "none", cursor: "pointer", fontSize: "14px" }}>
            📋 My Bookings ({myBookings.length}/{BOOKING_LIMIT})
          </button>
        </div>

        {activeTab === "available" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
            {classList.map((classItem) => (
              <div key={classItem.id} style={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
                <div style={{ padding: "24px" }}>
                  <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                    <div style={{ backgroundColor: "#fbbf24", borderRadius: "8px", padding: "12px", fontSize: "24px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", width: "56px", height: "56px" }}>🏋️</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
                        <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "#111827", margin: 0 }}>{classItem.name}</h3>
                        {isBooked(classItem.id, classItem.day) && (
                          <span style={{ backgroundColor: "#10b981", color: "white", fontSize: "11px", fontWeight: "600", padding: "4px 12px", borderRadius: "12px" }}>Booked</span>
                        )}
                      </div>
                      <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>{classItem.description}</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>
                      <span style={{ marginRight: "8px" }}>📅</span>{classItem.schedule}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>
                      <span style={{ marginRight: "8px" }}>⏱️</span>{classItem.duration}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", fontSize: "13px", color: "#6b7280" }}>
                      <span style={{ marginRight: "8px" }}>👥</span>Max Capacity: {classItem.maxCapacity}
                    </div>
                  </div>

                  <button onClick={() => handleBookNow(classItem)} disabled={!memberInfo || !canBookMore} style={{ width: "100%", padding: "12px", borderRadius: "4px", fontWeight: "600", fontSize: "14px", border: "none", cursor: (memberInfo && canBookMore) ? "pointer" : "not-allowed", backgroundColor: (memberInfo && canBookMore) ? "#fbbf24" : "#d1d5db", color: (memberInfo && canBookMore) ? "#111827" : "#6b7280", opacity: (memberInfo && canBookMore) ? 1 : 0.6 }}>
                    {!memberInfo ? "LOGIN TO BOOK" : !canBookMore ? `LIMIT REACHED (${myBookings.length}/${BOOKING_LIMIT})` : "BOOK NOW"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              <span style={{ fontSize: "20px" }}>📋</span>
              <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#111827", margin: 0 }}>My Booking Requests</h2>
              <span style={{ backgroundColor: "#fbbf24", color: "#111827", fontSize: "12px", fontWeight: "600", padding: "4px 12px", borderRadius: "12px", marginLeft: "auto" }}>{myBookings.length}/{BOOKING_LIMIT}</span>
            </div>

            {!memberInfo ? (
              <div style={{ textAlign: "center", padding: "48px" }}>
                <div style={{ fontSize: "64px", marginBottom: "16px" }}>🔒</div>
                <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "#111827", marginBottom: "8px" }}>Login Required</h3>
                <p style={{ fontSize: "14px", color: "#6b7280" }}>Please log in to view your bookings</p>
              </div>
            ) : myBookings.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px" }}>
                <div style={{ fontSize: "64px", marginBottom: "16px" }}>📭</div>
                <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "#111827", marginBottom: "8px" }}>No Bookings Yet</h3>
                <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "24px" }}>You haven't booked any classes yet. Start booking now!</p>
                <button onClick={() => setActiveTab("available")} style={{ backgroundColor: "#fbbf24", color: "#111827", fontWeight: "600", padding: "12px 24px", borderRadius: "4px", border: "none", cursor: "pointer" }}>
                  Browse Classes
                </button>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>Session</th>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>Date</th>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>Time</th>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>Status</th>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myBookings.map((booking) => (
                    <tr key={booking.classes_id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#111827" }}>{booking.classes_type}</td>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#111827" }}>{booking.classes_date}</td>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#111827" }}>{formatTime(booking.classes_timein)} - {formatTime(booking.classes_timout)}</td>
                      <td style={{ padding: "16px" }}>
                        <span style={{ backgroundColor: booking.status === 'approved' ? '#d1fae5' : booking.status === 'pending' ? '#fef3c7' : '#fee2e2', color: booking.status === 'approved' ? '#065f46' : booking.status === 'pending' ? '#92400e' : '#991b1b', fontSize: "12px", fontWeight: "600", padding: "4px 12px", borderRadius: "12px", display: "inline-block", textTransform: "capitalize" }}>
                          {booking.status || 'Pending'}
                        </span>
                      </td>
                      <td style={{ padding: "16px" }}>
                        {booking.status === 'pending' && (
                          <button onClick={() => handleCancelBooking(booking.classes_id)} style={{ color: "#dc2626", fontSize: "13px", fontWeight: "600", background: "none", border: "none", cursor: "pointer" }}>
                            CANCEL
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {showBookingModal && selectedClass && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setShowBookingModal(false)}>
          <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "32px", maxWidth: "500px", width: "90%", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#111827", marginBottom: "8px" }}>Book {selectedClass.name}</h2>
            <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "16px" }}>{selectedClass.description}</p>
            
            {memberInfo && (
              <div style={{ backgroundColor: "#e0f2fe", borderRadius: "8px", padding: "16px", marginBottom: "16px", border: "1px solid #3b82f6" }}>
                <div style={{ fontSize: "14px", color: "#1e40af", marginBottom: "8px" }}><strong>Booking for:</strong></div>
                <div style={{ fontSize: "13px", color: "#1e3a8a" }}>👤 {memberInfo.member_name}</div>
                <div style={{ fontSize: "13px", color: "#1e3a8a" }}>📞 {memberInfo.contact_number}</div>
              </div>
            )}

            <div style={{ backgroundColor: "#f9fafb", borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
              <div style={{ marginBottom: "8px" }}>📅 <strong>Schedule:</strong> {selectedClass.schedule}</div>
              <div style={{ marginBottom: "8px" }}>⏱️ <strong>Duration:</strong> {selectedClass.duration}</div>
              <div style={{ marginBottom: "8px" }}>👨‍🏫 <strong>Trainer:</strong> {selectedClass.trainer}</div>
              <div>📍 <strong>Next session:</strong> {getNextDate(selectedClass.day)}</div>
            </div>

            <div style={{ backgroundColor: "#fef3c7", borderRadius: "8px", padding: "16px", marginBottom: "24px", border: "1px solid #fbbf24" }}>
              <p style={{ fontSize: "14px", color: "#92400e", margin: 0 }}><strong>✓ Ready to book?</strong><br/>Your booking will be submitted for approval. You'll be notified once confirmed!</p>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button type="button" onClick={() => setShowBookingModal(false)} style={{ flex: 1, padding: "12px", borderRadius: "4px", fontWeight: "600", fontSize: "14px", border: "1px solid #d1d5db", backgroundColor: "white", color: "#374151", cursor: "pointer" }}>
                Cancel
              </button>
              <button type="button" onClick={handleSubmitBooking} style={{ flex: 1, padding: "12px", borderRadius: "4px", fontWeight: "600", fontSize: "14px", border: "none", backgroundColor: "#fbbf24", color: "#111827", cursor: "pointer" }}>
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}