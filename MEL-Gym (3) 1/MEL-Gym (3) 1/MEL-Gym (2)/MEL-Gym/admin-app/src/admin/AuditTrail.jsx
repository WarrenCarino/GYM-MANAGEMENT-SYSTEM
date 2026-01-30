import React, { useState, useEffect } from "react";
import { FaSearch, FaDownload, FaSyncAlt, FaTrash, FaCalendar, FaUser, FaClipboard } from "react-icons/fa";

const auditTrailStyles = `
  .audit-trail-container {
    width: 100%;
    padding: 20px;
  }

  .audit-header {
    margin-bottom: 30px;
  }

  .audit-header h1 {
    font-size: 2.5rem;
    font-weight: bold;
    color: #1f2937;
    margin: 0 0 10px 0;
  }

  .audit-header p {
    color: #6b7280;
    font-size: 1rem;
    margin: 0;
  }

  .audit-filters {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 24px;
    margin-bottom: 24px;
    border: 1px solid #e5e7eb;
  }

  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid #f3f4f6;
  }

  .filter-header h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .filter-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
  }

  .filter-group label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .filter-input,
  .filter-select {
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.95rem;
    transition: all 0.3s ease;
  }

  .filter-input:focus,
  .filter-select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .filter-footer {
    display: flex;
    justify-content: flex-end;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border: none;
    border-radius: 6px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-refresh {
    background: #3b82f6;
    color: white;
  }

  .btn-refresh:hover {
    background: #2563eb;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  .btn-export {
    background: #10b981;
    color: white;
  }

  .btn-export:hover {
    background: #059669;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  .btn-delete {
    background: #ef4444;
    color: white;
    padding: 8px 12px;
  }

  .btn-delete:hover {
    background: #dc2626;
  }

  .error-message {
    background: #fee2e2;
    border: 1px solid #fecaca;
    color: #991b1b;
    padding: 12px 16px;
    border-radius: 6px;
    margin-bottom: 20px;
  }

  .results-count {
    color: #6b7280;
    font-size: 0.95rem;
    margin-bottom: 16px;
  }

  .results-count span {
    font-weight: 600;
    color: #1f2937;
  }

  .audit-table-wrapper {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    overflow: hidden;
  }

  .loading,
  .no-data {
    padding: 40px 20px;
    text-align: center;
    color: #9ca3af;
    font-size: 1rem;
  }

  .audit-table {
    width: 100%;
    border-collapse: collapse;
  }

  .audit-table thead {
    background: #f9fafb;
    border-bottom: 2px solid #e5e7eb;
  }

  .audit-table th {
    padding: 16px;
    text-align: left;
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .audit-table tbody tr {
    border-bottom: 1px solid #e5e7eb;
    transition: background 0.2s ease;
  }

  .audit-table tbody tr:hover {
    background: #f9fafb;
  }

  .audit-table td {
    padding: 14px 16px;
    font-size: 0.95rem;
    color: #1f2937;
  }

  .audit-id {
    font-family: monospace;
    color: #6b7280;
  }

  .user-name {
    font-weight: 500;
    color: #1f2937;
  }

  .timestamp {
    color: #6b7280;
    font-size: 0.875rem;
  }

  .actions-cell {
    text-align: center;
  }

  .badge {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 9999px;
    font-size: 0.8rem;
    font-weight: 600;
    text-align: center;
  }

  .role-admin {
    background: #ede9fe;
    color: #6d28d9;
  }

  .role-cashier {
    background: #dbeafe;
    color: #1e40af;
  }

  .role-trainer {
    background: #fed7aa;
    color: #92400e;
  }

  .role-member {
    background: #dcfce7;
    color: #15803d;
  }

  .role-default {
    background: #f3f4f6;
    color: #374151;
  }

  .status-success {
    background: #dcfce7;
    color: #15803d;
  }

  .status-failed {
    background: #fee2e2;
    color: #991b1b;
  }

  .status-pending {
    background: #fef3c7;
    color: #92400e;
  }

  .status-default {
    background: #f3f4f6;
    color: #374151;
  }

  @media (max-width: 768px) {
    .filter-grid {
      grid-template-columns: 1fr;
    }

    .filter-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .audit-table {
      font-size: 0.85rem;
    }

    .audit-table th,
    .audit-table td {
      padding: 10px 8px;
    }

    .audit-header h1 {
      font-size: 1.75rem;
    }
  }
`;

const AuditTrail = () => {
  const [auditData, setAuditData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchUser, setSearchUser] = useState("");
  const [selectedAction, setSelectedAction] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [actions, setActions] = useState([]);

  const API_URL = "http://localhost:8000/api/audit-trail";

  // Fetch all audit records
  const fetchAuditTrail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/`);
      const result = await response.json();
      if (result.success) {
        setAuditData(result.data);
        setFilteredData(result.data);
        
        // Extract unique actions
        const uniqueActions = [...new Set(result.data.map(r => r.action))];
        setActions(uniqueActions);
      } else {
        setError(result.error || "Failed to fetch audit trail");
      }
    } catch (err) {
      setError("Error connecting to server: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Apply all filters
  useEffect(() => {
    let filtered = auditData;

    // Filter by user name
    if (searchUser.trim()) {
      filtered = filtered.filter(record =>
        record.user_name.toLowerCase().includes(searchUser.toLowerCase())
      );
    }

    // Filter by action
    if (selectedAction !== "all") {
      filtered = filtered.filter(record => record.action === selectedAction);
    }

    // Filter by date range
    if (startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime() + 86400000;
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.timestamp).getTime();
        return recordDate >= start && recordDate <= end;
      });
    }

    setFilteredData(filtered);
  }, [searchUser, selectedAction, startDate, endDate, auditData]);

  // Delete audit record
  const handleDelete = async (auditId) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        const response = await fetch(`${API_URL}/${auditId}`, {
          method: "DELETE"
        });
        const result = await response.json();
        if (result.success) {
          fetchAuditTrail();
          alert("Record deleted successfully!");
        } else {
          setError(result.error || "Failed to delete record");
        }
      } catch (err) {
        setError("Error deleting record: " + err.message);
      }
    }
  };

  // Export to CSV
  const handleExport = () => {
    if (filteredData.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = ["Audit ID", "User Name", "Role", "Action", "Status", "Timestamp"];
    const rows = filteredData.map(record => [
      record.audit_id,
      record.user_name,
      record.role,
      record.action,
      record.status,
      new Date(record.timestamp).toLocaleString()
    ]);

    let csv = headers.join(",") + "\n";
    rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase().trim();
    switch (statusLower) {
      case "success":
        return "status-success";
      case "failed":
        return "status-failed";
      case "error":
        return "status-failed";
      case "pending":
        return "status-pending";
      default:
        return "status-default";
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: "role-admin",
      cashier: "role-cashier",
      trainer: "role-trainer",
      member: "role-member"
    };
    return colors[role] || "role-default";
  };

  useEffect(() => {
    fetchAuditTrail();
  }, []);

  return (
    <>
      <style>{auditTrailStyles}</style>
      <div className="audit-trail-container">
        <div className="audit-header">
          <h1>📋 Audit Trail</h1>
          <p>Monitor all user activities and system changes</p>
        </div>

        {/* Filter Controls */}
        <div className="audit-filters">
          <div className="filter-header">
            <h2><FaClipboard /> Filters</h2>
            <button onClick={fetchAuditTrail} className="btn btn-refresh">
              <FaSyncAlt /> Refresh
            </button>
          </div>

          <div className="filter-grid">
            {/* Search User Name */}
            <div className="filter-group">
              <label><FaUser /> User Name</label>
              <input
                type="text"
                placeholder="Enter user name..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="filter-input"
              />
            </div>

            {/* Action Filter */}
            <div className="filter-group">
              <label><FaClipboard /> Action</label>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Actions</option>
                {actions.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div className="filter-group">
              <label><FaCalendar /> Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="filter-input"
              />
            </div>

            {/* End Date */}
            <div className="filter-group">
              <label><FaCalendar /> End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="filter-input"
              />
            </div>
          </div>

          {/* Export Button */}
          <div className="filter-footer">
            <button onClick={handleExport} className="btn btn-export">
              <FaDownload /> Export CSV
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Results Count */}
        <div className="results-count">
          Showing <span>{filteredData.length}</span> of <span>{auditData.length}</span> records
        </div>

        {/* Data Table */}
        <div className="audit-table-wrapper">
          {loading ? (
            <div className="loading">Loading audit trail...</div>
          ) : filteredData.length === 0 ? (
            <div className="no-data">No audit records found</div>
          ) : (
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Audit ID</th>
                  <th>User Name</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((record) => (
                  <tr key={record.audit_id}>
                    <td className="audit-id">{record.audit_id}</td>
                    <td className="user-name">
                      {record.user_name}
                    </td>
                    <td>
                      <span className={`badge role-badge ${getRoleColor(record.role)}`}>
                        {record.role}
                      </span>
                    </td>
                    <td>{record.action}</td>
                    <td>
                      <span className={`badge status-badge ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="timestamp">
                      {new Date(record.timestamp).toLocaleString()}
                    </td>
                    <td className="actions-cell">
                      <button
                        onClick={() => handleDelete(record.audit_id)}
                        className="btn btn-delete"
                        title="Delete record"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default AuditTrail;