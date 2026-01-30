import React, { useState, useRef, useEffect } from "react";

export default function Attendance() {
  const inputRef = useRef(null);
  const [search, setSearch] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [capacity, setCapacity] = useState({ current: 0, max: 50 });

  // Fetch maximum capacity from backend
  const fetchMaxCapacity = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/attendance/capacity");
      const data = await res.json();
      if (data.success && data.maxCapacity !== undefined) {
        setCapacity(prev => ({ ...prev, max: data.maxCapacity }));
      }
    } catch (err) {
      console.error("Failed to fetch max capacity:", err);
    }
  };

  // Fetch today's attendance records only
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      // ✅ Use the /today endpoint to get only today's records
      const res = await fetch("http://localhost:8000/api/attendance/today");
      const data = await res.json();
      
      const records = data.data || [];
      const currentPresent = data.currentPresent || 0;
      
      setCapacity(prev => ({ ...prev, current: currentPresent }));
      setAttendanceData(records);
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
      setStatusMessage({ type: "danger", text: "Failed to load attendance records" });
    } finally {
      setLoading(false);
    }
  };

  // Handle RFID scan
  const handleRFIDInput = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const uid = e.target.value.trim();
      if (!uid) return;

      processAttendance(uid);
      e.target.value = "";
    }
  };

  const processAttendance = async (uid) => {
    // Check if user is already present
    const existingRecord = attendanceData.find(r => r.rfid === uid);

    // Block new Time In if capacity reached
    if (!existingRecord || !existingRecord.timeIn) {
      if (capacity.current >= capacity.max) {
        setStatusMessage({ type: "danger", text: "❌ Maximum capacity reached! Cannot Time In." });
        return;
      }
    }

    try {
      const res = await fetch("http://localhost:8000/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      const result = await res.json();

      if (result.success) {
        setStatusMessage({ type: "success", text: result.message || "Attendance updated" });
        fetchAttendance(); // refresh data & capacity
      } else {
        setStatusMessage({ type: "danger", text: result.error || "Attendance failed" });
      }
    } catch (err) {
      setStatusMessage({ type: "danger", text: "Server error" });
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchMaxCapacity();
      await fetchAttendance();
    };
    init();

    inputRef.current?.focus();
    const keepFocus = () => inputRef.current?.focus();
    window.addEventListener("click", keepFocus);
    return () => window.removeEventListener("click", keepFocus);
  }, []);

  const filteredData = attendanceData.filter(
    record =>
      record.rfid?.toLowerCase().includes(search.toLowerCase()) ||
      record.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "32px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "600", margin: 0 }}>🏋️ Gym Attendance Records (Today)</h2>

        <div style={{ padding: "12px 24px", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "14px", color: "#666", fontWeight: "500" }}>Members Present Today:</span>
          <span style={{ fontSize: "20px", fontWeight: "700", color: capacity.current >= capacity.max ? "#dc3545" : capacity.current >= capacity.max * 0.7 ? "#ffc107" : "#28a745" }}>
            {capacity.current} / {capacity.max}
          </span>
        </div>
      </div>

      <input 
        type="text" 
        ref={inputRef} 
        onKeyDown={handleRFIDInput}
        autoFocus 
        style={{ position: "absolute", opacity: 0, pointerEvents: "none" }} 
      />

      {statusMessage && (
        <div style={{ padding: "12px 16px", backgroundColor: statusMessage.type === "success" ? "#d4edda" : "#f8d7da", color: statusMessage.type === "success" ? "#155724" : "#721c24", borderRadius: "4px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "inherit", padding: "0 8px" }}>×</button>
        </div>
      )}

      <div style={{ marginBottom: "16px", display: "flex", gap: "0", maxWidth: "400px" }}>
        <input type="text" placeholder="Search by RFID or Name..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, padding: "8px 12px", border: "1px solid #ccc", borderRadius: "4px 0 0 4px", fontSize: "14px", outline: "none" }} />
        <button onClick={() => setSearch("")} disabled={!search} style={{ padding: "8px 16px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "0 4px 4px 0", cursor: search ? "pointer" : "not-allowed", opacity: search ? 1 : 0.6, fontSize: "14px", fontWeight: "500" }}>Clear</button>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "40px", color: "#6c757d" }}>
          <div style={{ border: "4px solid #f3f3f3", borderTop: "4px solid #333", borderRadius: "50%", width: "40px", height: "40px", animation: "spin 1s linear infinite", margin: "0 auto" }} />
          <style>{`@keyframes spin {0% {transform: rotate(0deg);} 100% {transform: rotate(360deg);}}`}</style>
        </div>
      )}

      {!loading && (
        <div style={{ backgroundColor: "white", borderRadius: "4px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div style={{ padding: "12px 16px", backgroundColor: "#f8f9fa", borderBottom: "1px solid #dee2e6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#495057" }}>
              Showing {filteredData.length} of {attendanceData.length} records
            </span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#2c2c2c" }}>
                <th style={{ padding: "12px", textAlign: "left", color: "white" }}>#</th>
                <th style={{ padding: "12px", textAlign: "left", color: "white" }}>Full Name</th>
                <th style={{ padding: "12px", textAlign: "left", color: "white" }}>RFID</th>
                <th style={{ padding: "12px", textAlign: "left", color: "white" }}>Date</th>
                <th style={{ padding: "12px", textAlign: "left", color: "white" }}>Time In</th>
                <th style={{ padding: "12px", textAlign: "left", color: "white" }}>Time Out</th>
                <th style={{ padding: "12px", textAlign: "left", color: "white" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((record, index) => (
                  <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white", borderBottom: "1px solid #dee2e6" }}>
                    <td style={{ padding: "12px" }}>{index + 1}</td>
                    <td style={{ padding: "12px" }}>{record.fullName}</td>
                    <td style={{ padding: "12px" }}>{record.rfid || "—"}</td>
                    <td style={{ padding: "12px" }}>{record.date}</td>
                    <td style={{ padding: "12px" }}>{record.timeIn || "—"}</td>
                    <td style={{ padding: "12px" }}>{record.timeOut || "—"}</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ padding: "4px 12px", borderRadius: "4px", fontSize: "12px", fontWeight: "500", backgroundColor: record.status === "Completed" ? "#0d6efd" : record.status === "Present" ? "#28a745" : "#6c757d", color: "white", display: "inline-block" }}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ padding: "24px", textAlign: "center", fontSize: "14px", color: "#6c757d" }}>No records found for today.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}