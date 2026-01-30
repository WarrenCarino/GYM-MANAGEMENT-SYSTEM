import React, { useState, useEffect } from "react";

function ReportsGeneration() {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("transactions");

  // Attendance state
  const [attendanceStats, setAttendanceStats] = useState({
    weeklyTopAttendee: null,
    monthlyTopAttendee: null,
    weeklyStats: { totalMembers: 0, totalVisits: 0, avgVisits: 0 },
    monthlyStats: { totalMembers: 0, totalVisits: 0, avgVisits: 0 },
    weeklyList: [],
    monthlyList: []
  });

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  // ✅ Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // ✅ Fetch Transactions from backend API
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/transactions`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("📥 Fetched transactions:", data);

      const transactionsArray = Array.isArray(data) ? data : data.data || [];

      if (transactionsArray.length === 0) {
        setTransactions([]);
        return;
      }

      const todayDate = getTodayDate();

      // ✅ Filter ONLY today's transactions - hide yesterday and older
      const todayTransactions = transactionsArray.filter((tx) => {
        const dateField = tx.transaction_datetime || tx.transaction_date;
        if (!dateField) return false;
        const txDate = new Date(dateField).toISOString().split('T')[0];
        // Strict comparison - only TODAY's date
        return txDate === todayDate;
      });

      // If no transactions today, return empty
      if (todayTransactions.length === 0) {
        setTransactions([]);
        return;
      }

      const formatted = todayTransactions.map((tx) => {
        const dateField = tx.transaction_datetime || tx.transaction_date;
        const dt = new Date(dateField);

        return {
          orNumber: tx.or_number || "N/A",
          customerName: tx.member_name || "Unknown",
          product: tx.product || "N/A",
          quantity: tx.quantity || 0,
          datetime: dt.toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }),
          total: parseFloat(tx.total_amount) || 0,
          rawDate: dt,
        };
      });

      setTransactions(formatted);
      console.log("✅ Today's transactions:", formatted.length);
    } catch (error) {
      console.error("❌ Error fetching transactions:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch Attendance Data
  const fetchAttendanceStats = async () => {
    try {
      const membersRes = await fetch(`${API_URL}/api/members`);
      const attendanceRes = await fetch(`${API_URL}/api/attendance`);

      if (!membersRes.ok || !attendanceRes.ok) {
        throw new Error("Failed to fetch attendance data");
      }

      const members = await membersRes.json();
      const attendanceData = await attendanceRes.json();

      // Handle both array and object responses
      const attendanceArray = Array.isArray(attendanceData) ? attendanceData : (attendanceData.data || []);

      console.log("📊 Members:", members);
      console.log("📊 Attendance Data:", attendanceArray);

      // Separate members by membership type
      const weeklyMembers = members.filter(m => m.membership_type === "Weekly");
      const monthlyMembers = members.filter(m => m.membership_type === "Monthly");

      // Count attendance for each member
      const weeklyAttendees = {};
      const monthlyAttendees = {};

      attendanceArray.forEach(record => {
        const memberName = record.fullName || record.member_name;
        const member = members.find(m => m.member_name === memberName);

        if (member) {
          if (member.membership_type === "Weekly") {
            weeklyAttendees[memberName] = (weeklyAttendees[memberName] || 0) + 1;
          } else if (member.membership_type === "Monthly") {
            monthlyAttendees[memberName] = (monthlyAttendees[memberName] || 0) + 1;
          }
        }
      });

      // Get top attendees
      const weeklyTop = Object.entries(weeklyAttendees).sort((a, b) => b[1] - a[1]);
      const monthlyTop = Object.entries(monthlyAttendees).sort((a, b) => b[1] - a[1]);

      const weeklyTopAttendee = weeklyTop.length > 0 ? { name: weeklyTop[0][0], visits: weeklyTop[0][1] } : null;
      const monthlyTopAttendee = monthlyTop.length > 0 ? { name: monthlyTop[0][0], visits: monthlyTop[0][1] } : null;

      const weeklyVisits = Object.values(weeklyAttendees);
      const monthlyVisits = Object.values(monthlyAttendees);

      setAttendanceStats({
        weeklyTopAttendee,
        monthlyTopAttendee,
        weeklyStats: {
          totalMembers: weeklyMembers.length,
          totalVisits: weeklyVisits.reduce((a, b) => a + b, 0),
          avgVisits: weeklyMembers.length > 0 ? Math.round(weeklyVisits.reduce((a, b) => a + b, 0) / weeklyMembers.length) : 0
        },
        monthlyStats: {
          totalMembers: monthlyMembers.length,
          totalVisits: monthlyVisits.reduce((a, b) => a + b, 0),
          avgVisits: monthlyMembers.length > 0 ? Math.round(monthlyVisits.reduce((a, b) => a + b, 0) / monthlyMembers.length) : 0
        },
        weeklyList: weeklyTop.slice(0, 5).map(([name, visits]) => ({ name, visits })),
        monthlyList: monthlyTop.slice(0, 5).map(([name, visits]) => ({ name, visits }))
      });
    } catch (error) {
      console.error("❌ Error fetching attendance:", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchAttendanceStats();
  }, []);

  // ✅ Filter Transactions by name only
  const filteredTransactions = transactions.filter((tx) => {
    const matchesCustomer = tx.customerName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesCustomer;
  });

  const totalAmount = filteredTransactions.reduce(
    (sum, tx) => sum + Number(tx.total),
    0
  );

  // ✅ Export CSV with quantity column
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      alert("No transactions to export");
      return;
    }

    const headers = [
      "OR Number",
      "Customer Name",
      "Product/Service",
      "Quantity",
      "Date & Time",
      "Total",
    ];
    const rows = filteredTransactions.map((tx) => [
      tx.orNumber,
      tx.customerName,
      tx.product,
      tx.quantity,
      tx.datetime,
      tx.total,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transactions_report_${getTodayDate()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => window.print();

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📊 Reports</h2>
      <p style={styles.dateDisplay}>📅 {new Date().toLocaleDateString("en-US", { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}</p>

      {/* Tab Navigation */}
      <div style={styles.tabContainer}>
        <button
          onClick={() => setActiveTab("transactions")}
          style={{
            ...styles.tabButton,
            ...(activeTab === "transactions" ? styles.tabButtonActive : {})
          }}
        >
          💳 Transactions
        </button>
        <button
          onClick={() => setActiveTab("attendance")}
          style={{
            ...styles.tabButton,
            ...(activeTab === "attendance" ? styles.tabButtonActive : {})
          }}
        >
          📈 Attendance Analytics
        </button>
      </div>

      {/* Transactions Tab */}
      {activeTab === "transactions" && (
        <>
          {/* Filters */}
          <div style={{ ...styles.card, marginBottom: "15px" }}>
            <div style={styles.filtersRow}>
              <div style={styles.filterItem}>
                <label style={styles.label}>Search by Member/Customer Name</label>
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>
          </div>

          {/* Transactions Summary */}
          <div style={styles.card}>
            <div style={styles.summaryHeader}>
              <div>
                <h3 style={styles.summaryTitle}>🧾 Transactions Summary</h3>
                <h4 style={styles.totalAmount}>
                  Total Amount:{" "}
                  <span style={{ color: "#28a745" }}>
                    ₱{totalAmount.toLocaleString()}
                  </span>
                </h4>
                <p style={styles.recordCount}>
                  Showing {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} today
                </p>
              </div>
              <div style={styles.buttonGroup}>
                <button
                  onClick={handleExportCSV}
                  style={{
                    ...styles.button,
                    ...(filteredTransactions.length === 0 ? styles.buttonDisabled : {}),
                  }}
                  disabled={filteredTransactions.length === 0}
                >
                  📥 Export CSV
                </button>
                <button onClick={handlePrint} style={styles.button}>
                  🖨️ Print
                </button>
                <button onClick={fetchTransactions} style={styles.button}>
                  🔄 Refresh
                </button>
              </div>
            </div>

            {loading && (
              <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>Loading transactions...</p>
              </div>
            )}

            {error && (
              <div style={styles.errorContainer}>
                ❌ Error: {error}
                <button onClick={fetchTransactions} style={styles.retryButton}>
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeader}>
                      <th style={styles.th}>OR Number</th>
                      <th style={styles.th}>Customer Name</th>
                      <th style={styles.th}>Product/Service</th>
                      <th style={styles.th}>Quantity</th>
                      <th style={styles.th}>Date & Time</th>
                      <th style={styles.th}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((tx, index) => (
                        <tr key={index} style={styles.tableRow}>
                          <td style={styles.td}>{tx.orNumber}</td>
                          <td style={styles.td}>{tx.customerName}</td>
                          <td style={styles.td}>{tx.product}</td>
                          <td style={styles.td}>{tx.quantity}</td>
                          <td style={styles.td}>{tx.datetime}</td>
                          <td style={{ ...styles.td, fontWeight: "bold", color: "#28a745" }}>
                            ₱{tx.total.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={styles.noData}>
                          {searchTerm 
                            ? `No transactions found for "${searchTerm}" today.` 
                            : "No transactions recorded today yet."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Attendance Analytics Tab */}
      {activeTab === "attendance" && (
        <div>
          <div style={styles.statsGrid}>
            {/* Weekly Stats */}
            <div style={{ ...styles.card, borderLeft: "4px solid #3b82f6" }}>
              <h3 style={styles.cardTitle}>📅 Weekly Members</h3>
              <div style={styles.statBox}>
                <div style={styles.statValue}>{attendanceStats.weeklyStats.totalMembers}</div>
                <div style={styles.statLabel}>Total Members</div>
              </div>
              <div style={styles.statRow}>
                <span>Total Visits:</span>
                <strong>{attendanceStats.weeklyStats.totalVisits}</strong>
              </div>
              <div style={styles.statRow}>
                <span>Avg Visits/Member:</span>
                <strong>{attendanceStats.weeklyStats.avgVisits}</strong>
              </div>
              {attendanceStats.weeklyTopAttendee && (
                <div style={{ ...styles.statRow, marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #e0e0e0" }}>
                  <span>🏆 Top Attendee:</span>
                </div>
              )}
              {attendanceStats.weeklyTopAttendee && (
                <div style={styles.topAttendee}>
                  <strong>{attendanceStats.weeklyTopAttendee.name}</strong>
                  <div style={styles.visitCount}>{attendanceStats.weeklyTopAttendee.visits} visits</div>
                </div>
              )}
            </div>

            {/* Monthly Stats */}
            <div style={{ ...styles.card, borderLeft: "4px solid #8b5cf6" }}>
              <h3 style={styles.cardTitle}>🗓️ Monthly Members</h3>
              <div style={styles.statBox}>
                <div style={styles.statValue}>{attendanceStats.monthlyStats.totalMembers}</div>
                <div style={styles.statLabel}>Total Members</div>
              </div>
              <div style={styles.statRow}>
                <span>Total Visits:</span>
                <strong>{attendanceStats.monthlyStats.totalVisits}</strong>
              </div>
              <div style={styles.statRow}>
                <span>Avg Visits/Member:</span>
                <strong>{attendanceStats.monthlyStats.avgVisits}</strong>
              </div>
              {attendanceStats.monthlyTopAttendee && (
                <div style={{ ...styles.statRow, marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #e0e0e0" }}>
                  <span>🏆 Top Attendee:</span>
                </div>
              )}
              {attendanceStats.monthlyTopAttendee && (
                <div style={styles.topAttendee}>
                  <strong>{attendanceStats.monthlyTopAttendee.name}</strong>
                  <div style={styles.visitCount}>{attendanceStats.monthlyTopAttendee.visits} visits</div>
                </div>
              )}
            </div>
          </div>

          {/* Weekly Top 5 */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📅 Top 5 Weekly Attendees</h3>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>Rank</th>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Visits</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceStats.weeklyList.length > 0 ? (
                    attendanceStats.weeklyList.map((item, idx) => (
                      <tr key={idx} style={styles.tableRow}>
                        <td style={styles.td}>
                          {idx === 0 && "🥇"} {idx === 1 && "🥈"} {idx === 2 && "🥉"} #{idx + 1}
                        </td>
                        <td style={styles.td}>{item.name}</td>
                        <td style={{ ...styles.td, fontWeight: "bold", color: "#3b82f6" }}>{item.visits}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={styles.noData}>No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Top 5 */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🗓️ Top 5 Monthly Attendees</h3>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>Rank</th>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Visits</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceStats.monthlyList.length > 0 ? (
                    attendanceStats.monthlyList.map((item, idx) => (
                      <tr key={idx} style={styles.tableRow}>
                        <td style={styles.td}>
                          {idx === 0 && "🥇"} {idx === 1 && "🥈"} {idx === 2 && "🥉"} #{idx + 1}
                        </td>
                        <td style={styles.td}>{item.name}</td>
                        <td style={{ ...styles.td, fontWeight: "bold", color: "#8b5cf6" }}>{item.visits}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={styles.noData}>No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Styles
const styles = {
  container: {
    padding: "20px",
    maxWidth: "100%",
    margin: "0 auto",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#333",
  },
  dateDisplay: {
    fontSize: "16px",
    color: "#666",
    marginBottom: "20px",
    fontWeight: "500",
  },
  tabContainer: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    borderBottom: "2px solid #e0e0e0"
  },
  tabButton: {
    padding: "12px 24px",
    background: "transparent",
    border: "none",
    borderBottom: "3px solid transparent",
    fontSize: "15px",
    fontWeight: "600",
    color: "#666",
    cursor: "pointer",
    transition: "all 0.3s"
  },
  tabButtonActive: {
    color: "#0d6efd",
    borderBottomColor: "#0d6efd"
  },
  card: {
    border: "1px solid #e0e0e0",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    background: "#fff",
    marginBottom: "20px"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "20px"
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "20px",
    color: "#1f2937"
  },
  statBox: {
    textAlign: "center",
    padding: "20px 0",
    marginBottom: "15px"
  },
  statValue: {
    fontSize: "42px",
    fontWeight: "bold",
    color: "#1f2937"
  },
  statLabel: {
    fontSize: "14px",
    color: "#6b7280",
    marginTop: "5px"
  },
  statRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    fontSize: "14px",
    color: "#4b5563"
  },
  topAttendee: {
    background: "#f3f4f6",
    padding: "12px",
    borderRadius: "8px",
    marginTop: "8px"
  },
  visitCount: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "4px"
  },
  filtersRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "15px",
  },
  filterItem: {
    flex: "1",
    minWidth: "250px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#555",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.2s",
  },
  summaryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "15px",
  },
  summaryTitle: {
    margin: "0 0 10px 0",
    fontSize: "20px",
    color: "#333",
  },
  totalAmount: {
    margin: "0 0 5px 0",
    fontSize: "18px",
    color: "#555",
  },
  recordCount: {
    margin: "0",
    fontSize: "14px",
    color: "#777",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  button: {
    padding: "10px 20px",
    background: "#0d6efd",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "background 0.2s",
  },
  buttonDisabled: {
    background: "#ccc",
    cursor: "not-allowed",
  },
  loadingContainer: {
    textAlign: "center",
    padding: "40px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    margin: "0 auto 15px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #0d6efd",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  errorContainer: {
    color: "#dc3545",
    padding: "20px",
    background: "#f8d7da",
    borderRadius: "6px",
    textAlign: "center",
  },
  retryButton: {
    marginLeft: "10px",
    padding: "5px 15px",
    background: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  tableContainer: {
    maxHeight: "500px",
    overflowY: "auto",
    overflowX: "auto",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    background: "#f8f9fa",
    position: "sticky",
    top: 0,
    zIndex: 1,
  },
  th: {
    padding: "12px",
    textAlign: "left",
    fontWeight: "700",
    color: "#333",
    borderBottom: "2px solid #dee2e6",
    fontSize: "14px",
  },
  tableRow: {
    borderBottom: "1px solid #e0e0e0",
    transition: "background 0.2s",
  },
  td: {
    padding: "12px",
    fontSize: "14px",
    color: "#555",
  },
  noData: {
    textAlign: "center",
    padding: "40px",
    color: "#999",
    fontSize: "14px",
  },
};

export default ReportsGeneration;