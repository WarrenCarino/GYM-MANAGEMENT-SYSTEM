import React, { useState, useRef, useEffect } from "react";

export default function Attendance() {
  const rfidRef = useRef(null);

  const [searchToday, setSearchToday] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [loadingToday, setLoadingToday] = useState(false);

  const [searchLogs, setSearchLogs] = useState("");
  const [logsData, setLogsData] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState("all");

  const [rankingData, setRankingData] = useState([]);
  const [loadingRanking, setLoadingRanking] = useState(false);
  const [rankingStartDate, setRankingStartDate] = useState("");
  const [rankingEndDate, setRankingEndDate] = useState("");

  const [statusMessage, setStatusMessage] = useState(null);
  const [capacity, setCapacity] = useState({ current: 0, max: 50 });
  const [statusFilterToday, setStatusFilterToday] = useState("all");
  const [statusFilterLogs, setStatusFilterLogs] = useState("all");

  const fetchAttendance = async () => {
    setLoadingToday(true);
    try {
      const res = await fetch("http://localhost:8000/api/attendance/today");
      const data = await res.json();
      const records = data.data || [];
      const presentCount = records.filter((r) => r.status === "Present").length;
      setCapacity((prev) => ({ ...prev, current: presentCount }));
      setAttendanceData(records);
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
      setStatusMessage({ type: "danger", text: "Failed to load today's attendance" });
    } finally {
      setLoadingToday(false);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch("http://localhost:8000/api/attendance");
      const data = await res.json();
      const records = data.data || [];
      setLogsData(records);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      setStatusMessage({ type: "danger", text: "Failed to load attendance logs" });
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchRanking = async () => {
    setLoadingRanking(true);
    try {
      const attendanceRes = await fetch("http://localhost:8000/api/attendance");
      const attendanceData = await attendanceRes.json();
      const attendanceRecords = attendanceData.data || [];

      const membersRes = await fetch("http://localhost:8000/api/members");
      const members = await membersRes.json();

      let filteredAttendance = attendanceRecords;

      if (rankingStartDate || rankingEndDate) {
        filteredAttendance = attendanceRecords.filter((record) => {
          if (!record.date) return false;
          const recordDate = new Date(record.date);
          if (rankingStartDate && recordDate < new Date(rankingStartDate)) return false;
          if (rankingEndDate && recordDate > new Date(rankingEndDate)) return false;
          return true;
        });
      }

      const memberAttendance = {};
      filteredAttendance.forEach((record) => {
        const name = record.fullName;
        if (name && name !== "Unknown" && !name.includes("Walk-in")) {
          if (!memberAttendance[name]) {
            memberAttendance[name] = { count: 0, plan: "N/A" };
          }
          memberAttendance[name].count += 1;
        }
      });

      members.forEach((member) => {
        if (memberAttendance[member.member_name]) {
          memberAttendance[member.member_name].plan = member.membership_type || "N/A";
        }
      });

      const sorted = Object.entries(memberAttendance)
        .map(([name, data]) => ({ name, count: data.count, plan: data.plan }))
        .filter(item => item.name.toLowerCase() !== "ken" && item.name.toLowerCase() !== "warren")
        .sort((a, b) => b.count - a.count);

      setRankingData(sorted);
    } catch (error) {
      console.error("Failed to fetch ranking:", error);
      setStatusMessage({ type: "danger", text: "Failed to load ranking data" });
    } finally {
      setLoadingRanking(false);
    }
  };

  const fetchMaxCapacity = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/attendance/capacity");
      const data = await res.json();
      if (res.ok && data.success && data.maxCapacity) {
        setCapacity((prev) => ({ ...prev, max: data.maxCapacity }));
      }
    } catch (err) {
      console.error("Failed to fetch capacity:", err);
    }
  };

  const updateMaxCapacity = async (newMax) => {
    try {
      const res = await fetch("http://localhost:8000/api/attendance/capacity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxCapacity: newMax }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        setStatusMessage({ type: "danger", text: result.error || "Failed to update capacity" });
      }
    } catch (err) {
      setStatusMessage({ type: "danger", text: "Server error updating capacity" });
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetchLogs();
    fetchMaxCapacity();
    fetchRanking();
  }, []);

  useEffect(() => {
    fetchRanking();
  }, [rankingStartDate, rankingEndDate]);

  const handleRFIDSubmit = async () => {
    const uid = rfidRef.current?.value.trim();
    if (!uid) return;

    try {
      const res = await fetch("http://localhost:8000/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setStatusMessage({ type: "success", text: result.message || "Attendance updated" });
        fetchAttendance();
        fetchLogs();
        fetchRanking();
      } else {
        setStatusMessage({ type: "danger", text: result.error || "Attendance failed" });
      }
    } catch (err) {
      setStatusMessage({ type: "danger", text: "Server error" });
    }

    if (rfidRef.current) rfidRef.current.value = "";
    rfidRef.current?.focus();
  };

  useEffect(() => {
    rfidRef.current?.focus();
  }, []);

  const getFilteredLogsByPeriod = () => {
    const now = new Date();
    const filtered = logsData.filter((record) => {
      if (!record.date) return false;
      const recordDate = new Date(record.date);

      if (filterPeriod === "week") {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return recordDate >= weekAgo && recordDate <= now;
      } else if (filterPeriod === "month") {
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return recordDate >= monthAgo && recordDate <= now;
      }
      return true;
    });
    return filtered;
  };

  const filterData = (data, search, statusFilter) => {
    return data.filter((record) => {
      const matchesSearch =
        record.rfid?.toLowerCase().includes(search.toLowerCase()) ||
        record.fullName?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" ? true : record.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const filteredToday = filterData(attendanceData, searchToday, statusFilterToday);
  const filteredLogsByPeriod = getFilteredLogsByPeriod();
  const filteredLogs = filterData(filteredLogsByPeriod, searchLogs, statusFilterLogs);

  const renderTable = (data, loading) => (
    <div style={{ backgroundColor: "white", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#1a1a1a" }}>
            <th style={{ padding: "16px", textAlign: "center", color: "white", fontWeight: "600", fontSize: "14px" }}>#</th>
            <th style={{ padding: "16px", textAlign: "center", color: "white", fontWeight: "600", fontSize: "14px" }}>Full Name</th>
            <th style={{ padding: "16px", textAlign: "center", color: "white", fontWeight: "600", fontSize: "14px" }}>RFID</th>
            <th style={{ padding: "16px", textAlign: "center", color: "white", fontWeight: "600", fontSize: "14px" }}>Date</th>
            <th style={{ padding: "16px", textAlign: "center", color: "white", fontWeight: "600", fontSize: "14px" }}>Time In</th>
            <th style={{ padding: "16px", textAlign: "center", color: "white", fontWeight: "600", fontSize: "14px" }}>Time Out</th>
            <th style={{ padding: "16px", textAlign: "center", color: "white", fontWeight: "600", fontSize: "14px" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="7" style={{ padding: "32px", textAlign: "center", fontSize: "14px", color: "#999" }}>Loading...</td>
            </tr>
          ) : data.length > 0 ? (
            data.map((record, index) => (
              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#fafafa" : "white", borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "14px", textAlign: "center", fontSize: "13px", color: "#666" }}>{index + 1}</td>
                <td style={{ padding: "14px", textAlign: "center", fontSize: "13px", color: "#333", fontWeight: "500" }}>{record.fullName}</td>
                <td style={{ padding: "14px", textAlign: "center", fontSize: "13px", color: "#666" }}>{record.rfid || "—"}</td>
                <td style={{ padding: "14px", textAlign: "center", fontSize: "13px", color: "#666" }}>{record.date}</td>
                <td style={{ padding: "14px", textAlign: "center", fontSize: "13px", color: "#666" }}>{record.timeIn || "—"}</td>
                <td style={{ padding: "14px", textAlign: "center", fontSize: "13px", color: "#666" }}>{record.timeOut || "—"}</td>
                <td style={{ padding: "14px", textAlign: "center" }}>
                  <span style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "600",
                    backgroundColor:
                      record.status === "Completed" ? "#e3f2fd" :
                      record.status === "Present" ? "#e8f5e9" : "#f5f5f5",
                    color:
                      record.status === "Completed" ? "#1976d2" :
                      record.status === "Present" ? "#388e3c" : "#666",
                    display: "inline-block"
                  }}>
                    {record.status}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ padding: "32px", textAlign: "center", fontSize: "14px", color: "#999" }}>No records found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderRankingTable = () => (
    <div style={{ backgroundColor: "white", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#1a1a1a" }}>
            <th style={{ padding: "16px", textAlign: "center", color: "white", fontWeight: "600", fontSize: "14px" }}>Rank</th>
            <th style={{ padding: "16px", textAlign: "left", color: "white", fontWeight: "600", fontSize: "14px" }}>Member Name</th>
            <th style={{ padding: "16px", textAlign: "center", color: "white", fontWeight: "600", fontSize: "14px" }}>Membership Plan</th>
            <th style={{ padding: "16px", textAlign: "center", color: "white", fontWeight: "600", fontSize: "14px" }}>Total Attendance</th>
          </tr>
        </thead>
        <tbody>
          {loadingRanking ? (
            <tr>
              <td colSpan="4" style={{ padding: "32px", textAlign: "center", fontSize: "14px", color: "#999" }}>Loading...</td>
            </tr>
          ) : rankingData.length > 0 ? (
            rankingData.map((record, index) => {
              let medalIcon = "";
              if (index === 0) {
                medalIcon = "🥇";
              } else if (index === 1) {
                medalIcon = "🥈";
              } else if (index === 2) {
                medalIcon = "🥉";
              }

              return (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#fafafa" : "white", borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "14px", textAlign: "center", fontSize: "20px" }}>
                    {medalIcon || `#${index + 1}`}
                  </td>
                  <td style={{ padding: "14px", textAlign: "left", fontWeight: "500", color: "#333", fontSize: "13px" }}>{record.name}</td>
                  <td style={{ padding: "14px", textAlign: "center", fontSize: "12px", color: "#666" }}>
                    <span style={{
                      padding: "4px 12px",
                      borderRadius: "6px",
                      backgroundColor: "#f0f0f0",
                      fontWeight: "500"
                    }}>
                      {record.plan}
                    </span>
                  </td>
                  <td style={{ padding: "14px", textAlign: "center", fontSize: "16px", fontWeight: "700", color: "#1976d2" }}>{record.count}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="4" style={{ padding: "32px", textAlign: "center", fontSize: "14px", color: "#999" }}>No ranking data available.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{ padding: "40px 24px", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <input 
        type="text" 
        ref={rfidRef} 
        onKeyDown={(e) => e.key === "Enter" && handleRFIDSubmit()}
        style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }} 
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: "700", margin: "0 0 4px 0", color: "#1a1a1a" }}>🏋️ Gym Attendance</h1>
          <p style={{ margin: 0, color: "#999", fontSize: "14px" }}>Track member check-ins and attendance records</p>
        </div>

        <div style={{
          padding: "16px 24px",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          border: "1px solid #eee"
        }}>
          <div>
            <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#999", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" }}>Members Present</p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                fontSize: "24px",
                fontWeight: "700",
                color: capacity.current >= capacity.max * 0.9 ? "#dc3545" :
                       capacity.current >= capacity.max * 0.7 ? "#ffc107" : "#28a745"
              }}>{capacity.current}</span>
              <span style={{ fontSize: "18px", fontWeight: "600", color: "#ccc" }}>/</span>
              <input
                type="number"
                value={capacity.max}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (!isNaN(value) && value > 0) {
                    setCapacity(prev => ({ ...prev, max: value }));
                    updateMaxCapacity(value);
                  }
                }}
                style={{
                  width: "50px",
                  fontSize: "18px",
                  fontWeight: "600",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  outline: "none",
                  color: "#28a745",
                  textAlign: "center"
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div style={{ 
          padding: "14px 16px", 
          backgroundColor: statusMessage.type === "success" ? "#d4edda" : "#f8d7da", 
          color: statusMessage.type === "success" ? "#155724" : "#721c24", 
          borderRadius: "8px", 
          marginBottom: "24px", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          border: `1px solid ${statusMessage.type === "success" ? "#c3e6cb" : "#f5c6cb"}`
        }}>
          <span style={{ fontSize: "14px", fontWeight: "500" }}>{statusMessage.text}</span>
          <button 
            onClick={() => setStatusMessage(null)} 
            style={{ 
              background: "none", 
              border: "none", 
              fontSize: "20px", 
              cursor: "pointer", 
              color: "inherit", 
              padding: "0 8px",
              opacity: "0.7"
            }}>
            ×
          </button>
        </div>
      )}

      <div style={{ marginBottom: "48px" }}>
        <h2 style={{ margin: "0 0 20px 0", fontSize: "20px", fontWeight: "700", color: "#1a1a1a" }}>📅 Today's Attendance</h2>
        
        <div style={{ marginBottom: "16px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <input 
            type="text" 
            placeholder="Search by name or RFID..." 
            value={searchToday} 
            onChange={(e) => setSearchToday(e.target.value)} 
            style={{ 
              flex: 1, 
              minWidth: "250px",
              padding: "10px 14px", 
              border: "1px solid #ddd", 
              borderRadius: "8px", 
              fontSize: "14px", 
              outline: "none",
              backgroundColor: "white"
            }} 
          />
          <select 
            value={statusFilterToday} 
            onChange={(e) => setStatusFilterToday(e.target.value)}
            style={{ 
              padding: "10px 14px", 
              borderRadius: "8px", 
              fontSize: "14px", 
              border: "1px solid #ddd", 
              backgroundColor: "white",
              cursor: "pointer",
              outline: "none"
            }}>
            <option value="all">All Status</option>
            <option value="Present">Present</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {renderTable(filteredToday, loadingToday)}
      </div>

      <div style={{ marginBottom: "48px" }}>
        <h2 style={{ margin: "0 0 20px 0", fontSize: "20px", fontWeight: "700", color: "#1a1a1a" }}>📜 Attendance Logs</h2>
        
        <div style={{ marginBottom: "16px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <input 
            type="text" 
            placeholder="Search by name or RFID..." 
            value={searchLogs} 
            onChange={(e) => setSearchLogs(e.target.value)} 
            style={{ 
              flex: 1, 
              minWidth: "250px",
              padding: "10px 14px", 
              border: "1px solid #ddd", 
              borderRadius: "8px", 
              fontSize: "14px", 
              outline: "none",
              backgroundColor: "white"
            }} 
          />
          
          <div style={{ display: "flex", gap: "8px" }}>
            {["all", "week", "month"].map(period => (
              <button
                key={period}
                onClick={() => setFilterPeriod(period)}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  border: "1px solid",
                  cursor: "pointer",
                  backgroundColor: filterPeriod === period ? "#1976d2" : "white",
                  color: filterPeriod === period ? "white" : "#1976d2",
                  borderColor: filterPeriod === period ? "#1976d2" : "#ddd",
                  transition: "all 0.2s"
                }}
              >
                {period === "all" ? "All Time" : period === "week" ? "This Week" : "This Month"}
              </button>
            ))}
          </div>

          <select 
            value={statusFilterLogs} 
            onChange={(e) => setStatusFilterLogs(e.target.value)}
            style={{ 
              padding: "10px 14px", 
              borderRadius: "8px", 
              fontSize: "14px", 
              border: "1px solid #ddd", 
              backgroundColor: "white",
              cursor: "pointer",
              outline: "none"
            }}>
            <option value="all">All Status</option>
            <option value="Present">Present</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {renderTable(filteredLogs, loadingLogs)}
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#1a1a1a" }}>🏆 Attendance Ranking</h2>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <label style={{ fontSize: "13px", fontWeight: "500", color: "#666" }}>From:</label>
              <input 
                type="date"
                value={rankingStartDate}
                onChange={(e) => setRankingStartDate(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  border: "1px solid #ddd",
                  outline: "none"
                }}
              />
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <label style={{ fontSize: "13px", fontWeight: "500", color: "#666" }}>To:</label>
              <input 
                type="date"
                value={rankingEndDate}
                onChange={(e) => setRankingEndDate(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  border: "1px solid #ddd",
                  outline: "none"
                }}
              />
            </div>
            {(rankingStartDate || rankingEndDate) && (
              <button
                onClick={() => {
                  setRankingStartDate("");
                  setRankingEndDate("");
                }}
                style={{
                  padding: "8px 14px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: "500",
                  border: "1px solid #ddd",
                  backgroundColor: "white",
                  cursor: "pointer",
                  color: "#666"
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
        {renderRankingTable()}
      </div>
    </div>
  );
}