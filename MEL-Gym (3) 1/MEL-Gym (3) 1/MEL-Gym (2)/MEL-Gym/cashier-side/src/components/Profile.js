import React, { useState, useEffect } from "react";

// ============================================
// AUDIT TRAIL LOGGING
// ============================================
const logAuditTrail = async (action, status) => {
  try {
    const cashierId = localStorage.getItem("cashierId");

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

function Profile() {
  const [profile, setProfile] = useState({
    id: null,
    name: "",
    email: "",
    phone: "",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const API_BASE_URL = "http://localhost:8000/api";

  const contactNumber = localStorage.getItem("contactNumber");

  useEffect(() => {
    console.log("📱 Contact number from localStorage:", contactNumber);
    logAuditTrail(`PROFILE PAGE - Accessed`, "SUCCESS");
    if (contactNumber) {
      fetchProfile();
    } else {
      setError("❌ No contact number found. Please log in first.");
      logAuditTrail(`PROFILE PAGE - No contact number`, "FAILED");
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`📥 Fetching profile for contact: ${contactNumber}`);

      const response = await fetch(
        `${API_BASE_URL}/cashier/profile/${contactNumber}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Cashier profile not found");
        }
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      console.log("✅ Profile data received:", data);

      if (data.success) {
        setProfile({
          id: data.data.id,
          name: data.data.name || "",
          email: data.data.email || "",
          phone: data.data.phone || "",
        });
        localStorage.setItem("cashierId", data.data.id);
        console.log("✅ Profile loaded successfully");
        logAuditTrail(`FETCH PROFILE - ${data.data.name}`, "SUCCESS");
      } else {
        setError(data.message || "Failed to load profile");
        logAuditTrail(`FETCH PROFILE - Failed`, "FAILED");
      }
    } catch (err) {
      setError(err.message);
      console.error("❌ Profile fetch error:", err);
      logAuditTrail(`FETCH PROFILE - Error: ${err.message}`, "FAILED");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
    setSuccessMessage("");
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords({ ...passwords, [name]: value });
    setSuccessMessage("");
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!profile.id) {
      setError("Profile ID not found");
      logAuditTrail(`SAVE PROFILE - No ID found`, "FAILED");
      return;
    }

    if (!profile.name || !profile.email || !profile.phone) {
      setError("All fields are required");
      logAuditTrail(`SAVE PROFILE - Missing fields`, "FAILED");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      console.log(`🛠 Updating profile for ID: ${profile.id}`);

      const response = await fetch(
        `${API_BASE_URL}/cashier/profile/${profile.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccessMessage("✅ Profile updated successfully!");
        localStorage.setItem("contactNumber", profile.phone);
        console.log("✅ Profile saved successfully");
        logAuditTrail(`SAVE PROFILE - ${profile.name}`, "SUCCESS");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(data.message || "Failed to update profile");
        logAuditTrail(`SAVE PROFILE - ${profile.name}`, "FAILED");
      }
    } catch (err) {
      setError(err.message);
      console.error("❌ Profile update error:", err);
      logAuditTrail(`SAVE PROFILE - Error: ${err.message}`, "FAILED");
    } finally {
      setIsSubmitting(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (!profile.id) {
      setError("Profile ID not found");
      logAuditTrail(`CHANGE PASSWORD - No ID found`, "FAILED");
      return;
    }

    if (passwords.new !== passwords.confirm) {
      setError("⚠️ New password and confirm password do not match!");
      logAuditTrail(`CHANGE PASSWORD - Passwords do not match`, "FAILED");
      return;
    }

    if (passwords.new.length < 6) {
      setError("⚠️ New password must be at least 6 characters");
      logAuditTrail(`CHANGE PASSWORD - Password too short`, "FAILED");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      console.log(`🔐 Changing password for ID: ${profile.id}`);

      const response = await fetch(
        `${API_BASE_URL}/cashier/profile/${profile.id}/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword: passwords.current,
            newPassword: passwords.new,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccessMessage("✅ Password changed successfully!");
        setPasswords({ current: "", new: "", confirm: "" });
        console.log("✅ Password changed successfully");
        logAuditTrail(`CHANGE PASSWORD - ${profile.name}`, "SUCCESS");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(data.message || "Failed to change password");
        logAuditTrail(`CHANGE PASSWORD - ${profile.name}`, "FAILED");
      }
    } catch (err) {
      setError(err.message);
      console.error("❌ Password change error:", err);
      logAuditTrail(`CHANGE PASSWORD - Error: ${err.message}`, "FAILED");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    const cashierName = localStorage.getItem("cashierName");
    logAuditTrail(`LOGOUT - ${cashierName}`, "SUCCESS");
    localStorage.removeItem("contactNumber");
    localStorage.removeItem("cashierId");
    localStorage.removeItem("cashierName");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingSpinner}>
          <div style={styles.spinner}></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.mainTitle}>Profile Settings</h1>
          <p style={styles.subtitle}>Manage your account information</p>
        </div>
        <button onClick={handleLogout} style={styles.logoutButtonTop}>
          🚪 Logout
        </button>
      </div>

      {/* Messages */}
      {error && <div style={styles.errorBox}>{error}</div>}
      {successMessage && <div style={styles.successBox}>{successMessage}</div>}

      <div style={styles.content}>
        {/* Sidebar Tabs */}
        <div style={styles.sidebar}>
          <button
            onClick={() => setActiveTab("profile")}
            style={{
              ...styles.tabButton,
              ...(activeTab === "profile" ? styles.tabButtonActive : {}),
            }}
          >
            <span style={styles.tabIcon}>📋</span>
            <span>Profile Info</span>
          </button>
          <button
            onClick={() => setActiveTab("password")}
            style={{
              ...styles.tabButton,
              ...(activeTab === "password" ? styles.tabButtonActive : {}),
            }}
          >
            <span style={styles.tabIcon}>🔐</span>
            <span>Security</span>
          </button>
        </div>

        {/* Main Content */}
        <div style={styles.mainContent}>
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>📋 Profile Information</h2>
              <p style={styles.sectionDescription}>
                Update your personal information
              </p>

              <div style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    required
                    disabled={isSubmitting}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    required
                    disabled={isSubmitting}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    disabled={isSubmitting}
                    style={styles.input}
                  />
                </div>

                <button
                  onClick={saveProfile}
                  style={{
                    ...styles.primaryButton,
                    opacity: isSubmitting ? 0.6 : 1,
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "💾 Saving..." : "💾 Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>🔐 Change Password</h2>
              <p style={styles.sectionDescription}>
                Update your password to keep your account secure
              </p>

              <div style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Current Password</label>
                  <input
                    type="password"
                    name="current"
                    placeholder="Enter your current password"
                    value={passwords.current}
                    onChange={handlePasswordChange}
                    required
                    disabled={isSubmitting}
                    style={styles.input}
                  />
                </div>

                <div style={styles.divider}></div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>New Password</label>
                  <input
                    type="password"
                    name="new"
                    placeholder="Enter new password (min 6 characters)"
                    value={passwords.new}
                    onChange={handlePasswordChange}
                    required
                    disabled={isSubmitting}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirm"
                    placeholder="Confirm new password"
                    value={passwords.confirm}
                    onChange={handlePasswordChange}
                    required
                    disabled={isSubmitting}
                    style={styles.input}
                  />
                </div>

                <button
                  onClick={changePassword}
                  style={{
                    ...styles.primaryButton,
                    opacity: isSubmitting ? 0.6 : 1,
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "🔄 Updating..." : "🔐 Update Password"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
    flexWrap: "wrap",
    gap: "20px",
  },
  headerContent: {
    flex: 1,
  },
  mainTitle: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    margin: "0",
  },
  logoutButtonTop: {
    padding: "12px 24px",
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.3s ease",
  },
  content: {
    display: "flex",
    gap: "30px",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    minWidth: "200px",
  },
  tabButton: {
    padding: "14px 16px",
    backgroundColor: "#fff",
    border: "2px solid #e0e0e0",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "500",
    color: "#666",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    transition: "all 0.3s ease",
  },
  tabButtonActive: {
    backgroundColor: "#007bff",
    color: "#fff",
    borderColor: "#007bff",
  },
  tabIcon: {
    fontSize: "18px",
  },
  mainContent: {
    flex: 1,
    minWidth: "0",
  },
  section: {
    backgroundColor: "#fff",
    padding: "32px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    animation: "fadeIn 0.3s ease",
  },
  sectionTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 8px 0",
  },
  sectionDescription: {
    fontSize: "14px",
    color: "#999",
    margin: "0 0 24px 0",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
  },
  input: {
    padding: "12px 14px",
    border: "1.5px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "Arial, sans-serif",
    transition: "all 0.3s ease",
    backgroundColor: "#f9f9f9",
  },
  divider: {
    height: "1px",
    backgroundColor: "#e0e0e0",
    margin: "10px 0",
  },
  primaryButton: {
    padding: "14px 24px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    transition: "all 0.3s ease",
    marginTop: "10px",
  },
  errorBox: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "14px 16px",
    borderRadius: "6px",
    marginBottom: "20px",
    maxWidth: "1000px",
    margin: "0 auto 20px",
    border: "1px solid #f5c6cb",
    fontSize: "14px",
    fontWeight: "500",
  },
  successBox: {
    backgroundColor: "#d4edda",
    color: "#155724",
    padding: "14px 16px",
    borderRadius: "6px",
    marginBottom: "20px",
    maxWidth: "1000px",
    margin: "0 auto 20px",
    border: "1px solid #c3e6cb",
    fontSize: "14px",
    fontWeight: "500",
  },
  loadingSpinner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    gap: "20px",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "4px solid #f0f0f0",
    borderTop: "4px solid #007bff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};

export default Profile;