import React, { useState, useEffect } from "react";

const ManageSchedule = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [editingTrainer, setEditingTrainer] = useState(null);

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/trainers/all");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      console.log("✅ Fetched trainers:", data);

      if (Array.isArray(data)) {
        setTrainers(data);
      } else {
        console.error("❌ Trainers data is not an array:", data);
        setTrainers([]);
        showMessage("error", "Invalid trainers data received");
      }
    } catch (err) {
      console.error("❌ Error fetching trainers:", err);
      setTrainers([]);
      showMessage("error", "Failed to load trainers");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const handleUpdateSpecialization = async (trainerId, specialization) => {
    try {
      const res = await fetch(`http://localhost:8000/api/trainers/${trainerId}/specialization`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialization }),
      });

      const result = await res.json();

      if (result.success) {
        showMessage("success", "✅ Specialization updated successfully");
        fetchTrainers();
        setEditingTrainer(null);
      } else {
        showMessage("error", result.error || "Failed to update specialization");
      }
    } catch (err) {
      console.error("❌ Error updating specialization:", err);
      showMessage("error", "Failed to update specialization");
    }
  };

  const getSpecializationColor = (type) => {
    switch (type?.toLowerCase()) {
      case "strength training":
        return "#D4A574";
      case "cardio":
        return "#6CB86E";
      case "yoga":
        return "#9B7EBD";
      case "crossfit training":
        return "#E8956F";
      case "hiit":
        return "#E57373";
      case "boxing":
        return "#7A6349";
      case "pilates":
        return "#81C784";
      default:
        return "#999";
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerSection}>
        <div>
          <h1 style={styles.title}>Trainer Management</h1>
          <p style={styles.subtitle}>Manage trainer specializations and view trainer information</p>
        </div>
      </div>

      {/* Message Banner */}
      {message.text && (
        <div
          style={{
            ...styles.messageBox,
            backgroundColor: message.type === "success" ? "#d4f4dd" : "#ffe0e0",
            color: message.type === "success" ? "#2d6a3f" : "#c62828",
            border: `1px solid ${message.type === "success" ? "#a8e6b8" : "#ffb3b3"}`,
          }}
        >
          <span style={{ fontSize: "1.2rem", marginRight: "12px" }}>
            {message.type === "success" ? "✓" : "⚠"}
          </span>
          {message.text}
          <button
            onClick={() => setMessage({ type: "", text: "" })}
            style={styles.closeButton}
          >
            ×
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, background: "linear-gradient(135deg, #D4A574 0%, #B8935F 100%)" }}>
          <div style={styles.statIcon}>👨‍🏫</div>
          <div style={styles.statValue}>{trainers.length}</div>
          <div style={styles.statLabel}>Total Trainers</div>
        </div>
        <div style={{ ...styles.statCard, background: "linear-gradient(135deg, #6CB86E 0%, #5CA65E 100%)" }}>
          <div style={styles.statIcon}>✓</div>
          <div style={styles.statValue}>{trainers.filter(t => t.status === "Active").length}</div>
          <div style={styles.statLabel}>Active Trainers</div>
        </div>
        <div style={{ ...styles.statCard, background: "linear-gradient(135deg, #8B7355 0%, #7A6349 100%)" }}>
          <div style={styles.statIcon}>⏸</div>
          <div style={styles.statValue}>{trainers.filter(t => t.status !== "Active").length}</div>
          <div style={styles.statLabel}>Inactive Trainers</div>
        </div>
        <div style={{ ...styles.statCard, background: "linear-gradient(135deg, #9B7EBD 0%, #8A6DAD 100%)" }}>
          <div style={styles.statIcon}>🎯</div>
          <div style={styles.statValue}>{trainers.filter(t => t.specialization).length}</div>
          <div style={styles.statLabel}>With Specialization</div>
        </div>
      </div>

      {/* Trainers List */}
      <div style={styles.trainersSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>All Trainers</h2>
        </div>

        {loading && (
          <div style={styles.loadingState}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading trainers...</p>
          </div>
        )}

        {!loading && trainers.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>👨‍🏫</div>
            <p style={styles.emptyText}>No trainers found</p>
            <p style={styles.emptySubtext}>Trainers will appear here once added to the system</p>
          </div>
        )}

        {!loading && trainers.length > 0 && (
          <div style={styles.trainersGrid}>
            {trainers.map((trainer) => (
              <div key={trainer.trainer_id} style={styles.trainerCard}>
                {/* Status Badge */}
                <div
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: trainer.status === "Active" ? "#6CB86E" : "#999",
                  }}
                >
                  {trainer.status}
                </div>

                {/* Trainer Info */}
                <div style={styles.trainerHeader}>
                  <div style={styles.trainerAvatar}>
                    {trainer.trainer_name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.trainerInfo}>
                    <h3 style={styles.trainerName}>{trainer.trainer_name}</h3>
                    <p style={styles.trainerId}>ID: {trainer.trainer_id}</p>
                  </div>
                </div>

                {/* Contact Details */}
                <div style={styles.detailsSection}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>📧 Email</span>
                    <span style={styles.detailValue}>{trainer.email || "Not provided"}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>📱 Contact</span>
                    <span style={styles.detailValue}>{trainer.contact_number || "Not provided"}</span>
                  </div>
                </div>

                {/* Specialization Section */}
                <div style={styles.specializationSection}>
                  <div style={styles.detailLabel}>🎯 Specialization</div>
                  
                  {editingTrainer === trainer.trainer_id ? (
                    <div style={styles.editMode}>
                      <select
                        value={trainer.specialization || ""}
                        onChange={(e) => {
                          const newSpec = e.target.value;
                          setTrainers(
                            trainers.map((t) =>
                              t.trainer_id === trainer.trainer_id
                                ? { ...t, specialization: newSpec }
                                : t
                            )
                          );
                        }}
                        style={styles.select}
                      >
                        <option value="">Select specialization</option>
                        <option value="Strength Training">Strength Training</option>
                        <option value="Cardio">Cardio</option>
                        <option value="Yoga">Yoga</option>
                        <option value="CrossFit Training">CrossFit Training</option>
                        <option value="HIIT">HIIT</option>
                        <option value="Boxing">Boxing</option>
                        <option value="Pilates">Pilates</option>
                      </select>
                      <div style={styles.editButtons}>
                        <button
                          onClick={() =>
                            handleUpdateSpecialization(
                              trainer.trainer_id,
                              trainer.specialization
                            )
                          }
                          style={styles.saveBtn}
                        >
                          ✓ Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingTrainer(null);
                            fetchTrainers();
                          }}
                          style={styles.cancelBtn}
                        >
                          × Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={styles.viewMode}>
                      <span
                        style={{
                          ...styles.specializationBadge,
                          backgroundColor: getSpecializationColor(trainer.specialization),
                        }}
                      >
                        {trainer.specialization || "Not Set"}
                      </span>
                      <button
                        onClick={() => setEditingTrainer(trainer.trainer_id)}
                        style={styles.editBtn}
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "2rem",
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
  },
  headerSection: {
    marginBottom: "2rem",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "600",
    color: "#333",
    margin: "0 0 0.5rem 0",
  },
  subtitle: {
    fontSize: "0.95rem",
    color: "#666",
    margin: 0,
  },
  messageBox: {
    padding: "1rem 1.5rem",
    borderRadius: "8px",
    marginBottom: "1.5rem",
    display: "flex",
    alignItems: "center",
    fontSize: "0.95rem",
    fontWeight: "500",
    position: "relative",
  },
  closeButton: {
    marginLeft: "auto",
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    opacity: 0.7,
    padding: "0 0.5rem",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
    marginBottom: "2rem",
  },
  statCard: {
    padding: "1.5rem",
    borderRadius: "12px",
    color: "white",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  statIcon: {
    fontSize: "2rem",
    marginBottom: "0.5rem",
  },
  statValue: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    marginBottom: "0.25rem",
  },
  statLabel: {
    fontSize: "0.9rem",
    opacity: 0.95,
  },
  trainersSection: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  sectionHeader: {
    marginBottom: "1.5rem",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#333",
    margin: 0,
  },
  loadingState: {
    textAlign: "center",
    padding: "3rem",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #D4A574",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 1rem",
  },
  loadingText: {
    color: "#666",
    fontSize: "1rem",
  },
  emptyState: {
    textAlign: "center",
    padding: "3rem",
  },
  emptyIcon: {
    fontSize: "4rem",
    marginBottom: "1rem",
  },
  emptyText: {
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#666",
    margin: "0 0 0.5rem 0",
  },
  emptySubtext: {
    fontSize: "0.9rem",
    color: "#999",
    margin: 0,
  },
  trainersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "1.5rem",
  },
  trainerCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "1.5rem",
    backgroundColor: "white",
    position: "relative",
    transition: "all 0.2s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  statusBadge: {
    position: "absolute",
    top: "1rem",
    right: "1rem",
    padding: "0.3rem 0.8rem",
    borderRadius: "20px",
    color: "white",
    fontSize: "0.7rem",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  trainerHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1.5rem",
    paddingRight: "80px",
  },
  trainerAvatar: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #D4A574 0%, #B8935F 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "white",
  },
  trainerInfo: {
    flex: 1,
  },
  trainerName: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#333",
    margin: "0 0 0.25rem 0",
  },
  trainerId: {
    fontSize: "0.85rem",
    color: "#999",
    margin: 0,
  },
  detailsSection: {
    marginBottom: "1.5rem",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem 0",
    borderBottom: "1px solid #f5f5f5",
  },
  detailLabel: {
    fontSize: "0.85rem",
    color: "#666",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: "0.9rem",
    color: "#333",
    textAlign: "right",
  },
  specializationSection: {
    paddingTop: "1rem",
    borderTop: "2px solid #f5f5f5",
  },
  editMode: {
    marginTop: "0.75rem",
  },
  select: {
    width: "100%",
    padding: "0.75rem",
    fontSize: "0.9rem",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    outline: "none",
    backgroundColor: "white",
    cursor: "pointer",
    marginBottom: "0.75rem",
  },
  editButtons: {
    display: "flex",
    gap: "0.5rem",
  },
  saveBtn: {
    flex: 1,
    padding: "0.75rem",
    backgroundColor: "#6CB86E",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.9rem",
    transition: "all 0.2s",
  },
  cancelBtn: {
    flex: 1,
    padding: "0.75rem",
    backgroundColor: "#999",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.9rem",
    transition: "all 0.2s",
  },
  viewMode: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "0.75rem",
  },
  specializationBadge: {
    padding: "0.5rem 1rem",
    borderRadius: "20px",
    color: "white",
    fontSize: "0.85rem",
    fontWeight: "600",
  },
  editBtn: {
    padding: "0.5rem 1rem",
    backgroundColor: "#f5f5f5",
    color: "#666",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "500",
    transition: "all 0.2s",
  },
};

// Add keyframe animation for spinner
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);

export default ManageSchedule;