import React, { useState, useEffect } from "react";

function Membership() {
  const [formData, setFormData] = useState({
    rfid: "",
    member_name: "",
    contact_number: "",
    email: "",
    address: "",
    membership_type: "",
    membership_start: "",
    membership_end: "",
    membership_time: getCurrentTime(),
    status: "inactive",
    payment_status: "not paid",
    password: "",
    confirm_password: "",
  });

  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [passwordError, setPasswordError] = useState("");

  function getCurrentTime() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }

  function getTodayDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function calculateEndDate(type) {
    const startDate = new Date();
    let endDate = new Date(startDate);

    if (type === "Weekly") {
      endDate.setDate(startDate.getDate() + 7);
    } else if (type === "Monthly") {
      endDate.setDate(startDate.getDate() + 30);
    }

    const yyyy = endDate.getFullYear();
    const mm = String(endDate.getMonth() + 1).padStart(2, "0");
    const dd = String(endDate.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/cashier/members");
      if (!response.ok) throw new Error("Failed to fetch members");
      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error("❌ Failed to fetch members:", error);
    }
  };

  // Log audit trail
  const logAuditTrail = async (action, status) => {
    try {
      // Get cashier ID and name from localStorage (stored during login)
      const cashierId = localStorage.getItem("cashierId");
      const cashierName = localStorage.getItem("cashierName");

      if (!cashierId) {
        console.error("❌ Cashier ID not found in localStorage");
        return;
      }

      const auditData = {
        id: parseInt(cashierId) || cashierId,
        role: "cashier",
        action: action,
        status: status
      };

      const response = await fetch("http://localhost:8000/api/audit-trail", {
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

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "password" || name === "confirm_password") {
      setPasswordError("");
    }

    if (name === "membership_type") {
      const startDate = getTodayDate();
      const endDate = calculateEndDate(value);
      const currentTime = getCurrentTime();
      
      setFormData({
        ...formData,
        [name]: value,
        membership_start: startDate,
        membership_end: endDate,
        membership_time: currentTime,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      setPasswordError("Passwords do not match!");
      alert("❌ Passwords do not match!");
      return;
    }

    if (formData.password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      alert("❌ Password must be at least 6 characters");
      return;
    }

    try {
      const { confirm_password, ...dataToSend } = formData;
      
      // Make sure dates and time are included (not null)
      if (!dataToSend.membership_start) {
        dataToSend.membership_start = getTodayDate();
      }
      if (!dataToSend.membership_end && dataToSend.membership_type) {
        dataToSend.membership_end = calculateEndDate(dataToSend.membership_type);
      }
      if (!dataToSend.membership_time) {
        dataToSend.membership_time = getCurrentTime();
      }

      console.log("📤 Adding member:", dataToSend);

      const response = await fetch(
        "http://localhost:8000/api/cashier/members",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        alert(`❌ Failed to add member: ${responseData.error || "Unknown error"}`);
        
        await logAuditTrail(
          `ADD A MEMBER`,
          "FAILED"
        );
        return;
      }

      alert("✅ Member added successfully!");
      
      await logAuditTrail(
        `ADD A MEMBER`,
        "SUCCESS"
      );

      setFormData({
        rfid: "",
        member_name: "",
        contact_number: "",
        email: "",
        address: "",
        membership_type: "",
        membership_start: "",
        membership_end: "",
        membership_time: getCurrentTime(),
        status: "inactive",
        payment_status: "not paid",
        password: "",
        confirm_password: "",
      });
      setPasswordError("");
      fetchMembers();
    } catch (error) {
      console.error("❌ Network error:", error);
      
      await logAuditTrail(
        `ADD A MEMBER`,
        "ERROR"
      );
    }
  };

  const filteredMembers = members.filter((m) =>
    [m.member_name, m.rfid, m.contact_number]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🏋️ Membership Management</h2>
        <p style={styles.subtitle}>Add and manage gym members</p>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Add New Member</h3>
        <div style={styles.formGrid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name *</label>
            <input
              type="text"
              name="member_name"
              placeholder="Enter full name"
              value={formData.member_name}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Contact Number *</label>
            <input
              type="text"
              name="contact_number"
              placeholder="Enter contact number"
              value={formData.contact_number}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Address</label>
            <input
              type="text"
              name="address"
              placeholder="Enter address"
              value={formData.address}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Membership Type *</label>
            <select
              name="membership_type"
              value={formData.membership_type}
              onChange={handleChange}
              style={styles.select}
              required
            >
              <option value="">Select Membership Type</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Start Date</label>
            <input
              type="date"
              name="membership_start"
              value={formData.membership_start}
              readOnly
              style={styles.inputReadonly}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>End Date</label>
            <input
              type="date"
              name="membership_end"
              value={formData.membership_end}
              readOnly
              style={styles.inputReadonly}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Registration Time</label>
            <input
              type="text"
              name="membership_time"
              value={formData.membership_time}
              readOnly
              style={styles.inputReadonly}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password *</label>
            <input
              type="password"
              name="password"
              placeholder="Enter password (min. 6 characters)"
              value={formData.password}
              onChange={handleChange}
              style={{
                ...styles.input,
                borderColor: passwordError ? "#dc3545" : "#e1e8ed",
              }}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password *</label>
            <input
              type="password"
              name="confirm_password"
              placeholder="Re-enter password"
              value={formData.confirm_password}
              onChange={handleChange}
              style={{
                ...styles.input,
                borderColor: passwordError ? "#dc3545" : "#e1e8ed",
              }}
              required
            />
            {passwordError && (
              <span style={styles.errorText}>⚠️ {passwordError}</span>
            )}
          </div>

          <div style={styles.buttonContainer}>
            <button onClick={handleSubmit} style={styles.submitButton}>
              ➕ Add Member
            </button>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="🔍 Search member by name, RFID, or contact number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.tableHeader}>
          <h3 style={styles.cardTitle}>📋 Members List</h3>
          <div style={styles.memberCount}>
            Total Members:{" "}
            <span style={styles.countNumber}>
              {filteredMembers.length}
            </span>
          </div>
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>RFID</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Contact</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Start</th>
                <th style={styles.th}>End</th>
                <th style={styles.th}>Time</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((m, index) => (
                  <tr
                    key={m.id}
                    style={{
                      ...styles.tableRow,
                      background:
                        index % 2 === 0 ? "#ffffff" : "#f8f9fa",
                    }}
                  >
                    <td style={styles.td}>
                      <span style={styles.rfidBadge}>
                        {m.rfid || "N/A"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <strong>{m.member_name}</strong>
                    </td>
                    <td style={styles.td}>{m.contact_number}</td>
                    <td style={styles.td}>{m.email || "—"}</td>
                    <td style={styles.td}>
                      <span style={styles.typeBadge}>
                        {m.membership_type}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {m.membership_start ? formatDate(m.membership_start) : "-"}
                    </td>
                    <td style={styles.td}>
                      {m.membership_end ? formatDate(m.membership_end) : "-"}
                    </td>
                    <td style={styles.td}>
                      {m.membership_time ? (
                        <span style={styles.timeBadge}>{m.membership_time}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          background:
                            m.status === "active"
                              ? "#d4edda"
                              : m.status === "inactive"
                              ? "#fff3cd"
                              : "#f8d7da",
                          color:
                            m.status === "active"
                              ? "#155724"
                              : m.status === "inactive"
                              ? "#856404"
                              : "#721c24",
                        }}
                      >
                        {m.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📭</div>
                    <div style={styles.emptyText}>No members found</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    background: "#f4f6f8",
    minHeight: "100vh",
  },
  header: {
    marginBottom: "30px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#2c3e50",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: "16px",
    color: "#7f8c8d",
    margin: 0,
  },
  card: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "25px",
    marginBottom: "25px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    border: "1px solid #e1e8ed",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#2c3e50",
    margin: "0 0 20px 0",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#495057",
    marginBottom: "8px",
  },
  input: {
    padding: "12px 16px",
    fontSize: "14px",
    border: "2px solid #e1e8ed",
    borderRadius: "8px",
    outline: "none",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  inputReadonly: {
    padding: "12px 16px",
    fontSize: "14px",
    border: "2px solid #e1e8ed",
    borderRadius: "8px",
    background: "#f8f9fa",
    color: "#6c757d",
    fontFamily: "inherit",
    cursor: "not-allowed",
  },
  select: {
    padding: "12px 16px",
    fontSize: "14px",
    border: "2px solid #e1e8ed",
    borderRadius: "8px",
    outline: "none",
    background: "#ffffff",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  buttonContainer: {
    gridColumn: "1 / -1",
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "10px",
  },
  submitButton: {
    padding: "14px 32px",
    fontSize: "16px",
    fontWeight: "600",
    background: "#28a745",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(40, 167, 69, 0.2)",
  },
  searchInput: {
    width: "100%",
    padding: "14px 20px",
    fontSize: "15px",
    border: "2px solid #e1e8ed",
    borderRadius: "8px",
    outline: "none",
    transition: "all 0.2s ease",
  },
  tableContainer: {
    overflowX: "auto",
    borderRadius: "8px",
    border: "1px solid #e1e8ed",
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  memberCount: {
    fontSize: "14px",
    color: "#6c757d",
  },
  countNumber: {
    fontWeight: "600",
    color: "#28a745",
    fontSize: "16px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeaderRow: {
    background: "#f8f9fa",
    borderBottom: "2px solid #e1e8ed",
  },
  th: {
    padding: "16px",
    textAlign: "left",
    fontSize: "13px",
    fontWeight: "600",
    color: "#495057",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tableRow: {
    borderBottom: "1px solid #e1e8ed",
    transition: "background 0.2s ease",
  },
  td: {
    padding: "16px",
    fontSize: "14px",
    color: "#495057",
  },
  rfidBadge: {
    display: "inline-block",
    padding: "4px 10px",
    background: "#e7f3ff",
    color: "#0066cc",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    fontFamily: "monospace",
  },
  typeBadge: {
    display: "inline-block",
    padding: "4px 12px",
    background: "#f0f0f0",
    color: "#495057",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "500",
  },
  timeBadge: {
    display: "inline-block",
    padding: "4px 10px",
    background: "#fff3cd",
    color: "#856404",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    fontFamily: "monospace",
  },
  statusBadge: {
    display: "inline-block",
    padding: "6px 14px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.5px",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "12px",
  },
  emptyText: {
    fontSize: "16px",
    color: "#6c757d",
  },
  errorText: {
    fontSize: "12px",
    color: "#dc3545",
    marginTop: "6px",
    fontWeight: "500",
  },
};

export default Membership;