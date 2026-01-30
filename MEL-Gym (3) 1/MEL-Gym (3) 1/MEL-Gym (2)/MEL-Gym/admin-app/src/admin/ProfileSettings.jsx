import React, { useState } from "react";

function ProfileSettings() {
  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "john@example.com",
    contact: "+63 912 345 6789",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [editing, setEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    
    // Simulate API call
    setTimeout(() => {
      setSuccess("Profile updated successfully!");
      setEditing(false);
      setSaving(false);
      setTimeout(() => setSuccess(""), 3000);
    }, 500);
  };

  const handleChangePassword = () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError("All password fields are required");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setPasswordSuccess("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
      setTimeout(() => setPasswordSuccess(""), 3000);
    }, 500);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleCancelPassword = () => {
    setShowPasswordForm(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordError("");
  };

  const inputStyle = {
    width: "100%",
    padding: "0.75rem",
    border: "1px solid #D1D5DB",
    borderRadius: "0.5rem",
    fontSize: "1rem",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "0.5rem",
    fontWeight: "600",
    color: "#374151",
    fontSize: "0.95rem",
  };

  const sectionStyle = {
    background: "white",
    padding: "2rem",
    borderRadius: "0.75rem",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  };

  const sectionTitleStyle = {
    fontSize: "1.5rem",
    fontWeight: "700",
    marginBottom: "1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  };

  return (
    <div style={{ padding: "2rem", background: "#F9FAFB", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "0.5rem" }}>👤 Profile Settings</h1>
        <p style={{ color: "#6B7280" }}>Manage your account information</p>
      </div>

      {/* Alert Messages - Global */}
      {error && (
        <div style={{ padding: "1rem", background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: "0.5rem", marginBottom: "1.5rem", color: "#991B1B" }}>
          ⚠️ Error: {error}
        </div>
      )}
      {success && (
        <div style={{ padding: "1rem", background: "#DCFCE7", border: "1px solid #BBF7D0", borderRadius: "0.5rem", marginBottom: "1.5rem", color: "#166534" }}>
          ✅ Success: {success}
        </div>
      )}

      {/* Two Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
        {/* Profile Section */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>👤 Profile Information</h2>

          {/* Profile Card */}
          <div style={{ background: "#F3F4F6", padding: "1.5rem", borderRadius: "0.5rem", marginBottom: "2rem", textAlign: "center" }}>
            <div style={{ width: "4rem", height: "4rem", background: "#3B82F6", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: "700", margin: "0 auto 1rem" }}>
              {formData.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", margin: "0.5rem 0" }}>{formData.name || "Admin User"}</h3>
            <p style={{ color: "#6B7280", margin: "0.25rem 0" }}>Contact: {formData.contact}</p>
          </div>

          {/* Form Fields */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={!editing}
              style={{ ...inputStyle, background: editing ? "white" : "#F3F4F6", cursor: editing ? "text" : "not-allowed" }}
              onFocus={(e) => { if (editing) e.target.style.borderColor = "#3B82F6"; }}
              onBlur={(e) => { if (editing) e.target.style.borderColor = "#D1D5DB"; }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!editing}
              style={{ ...inputStyle, background: editing ? "white" : "#F3F4F6", cursor: editing ? "text" : "not-allowed" }}
              onFocus={(e) => { if (editing) e.target.style.borderColor = "#3B82F6"; }}
              onBlur={(e) => { if (editing) e.target.style.borderColor = "#D1D5DB"; }}
            />
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <label style={labelStyle}>Contact Number</label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              disabled={true}
              style={{ ...inputStyle, background: "#F3F4F6", cursor: "not-allowed" }}
            />
            <p style={{ fontSize: "0.85rem", color: "#6B7280", marginTop: "0.5rem" }}>Contact number cannot be changed</p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "1rem" }}>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                style={{ padding: "0.75rem 1.5rem", background: "#3B82F6", color: "white", border: "none", borderRadius: "0.5rem", fontWeight: "600", cursor: "pointer", transition: "all 0.2s", width: "100%" }}
                onMouseEnter={(e) => { e.target.style.background = "#2563EB"; e.target.style.transform = "scale(1.05)"; }}
                onMouseLeave={(e) => { e.target.style.background = "#3B82F6"; e.target.style.transform = "scale(1)"; }}
              >
                ✏️ Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  style={{ flex: 1, padding: "0.75rem 1.5rem", background: "#E5E7EB", color: "#374151", border: "none", borderRadius: "0.5rem", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.target.style.background = "#D1D5DB"; }}
                  onMouseLeave={(e) => { e.target.style.background = "#E5E7EB"; }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  style={{ flex: 1, padding: "0.75rem 1.5rem", background: "#10B981", color: "white", border: "none", borderRadius: "0.5rem", fontWeight: "600", cursor: saving ? "not-allowed" : "pointer", transition: "all 0.2s", opacity: saving ? 0.7 : 1 }}
                  onMouseEnter={(e) => { if (!saving) { e.target.style.background = "#059669"; e.target.style.transform = "scale(1.05)"; } }}
                  onMouseLeave={(e) => { if (!saving) { e.target.style.background = "#10B981"; e.target.style.transform = "scale(1)"; } }}
                >
                  {saving ? "Saving..." : "💾 Save Changes"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Password Change Section */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>🔐 Change Password</h2>

          {passwordError && (
            <div style={{ padding: "1rem", background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: "0.5rem", marginBottom: "1.5rem", color: "#991B1B", fontSize: "0.95rem" }}>
              ⚠️ Error: {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div style={{ padding: "1rem", background: "#DCFCE7", border: "1px solid #BBF7D0", borderRadius: "0.5rem", marginBottom: "1.5rem", color: "#166534", fontSize: "0.95rem" }}>
              ✅ Success: {passwordSuccess}
            </div>
          )}

          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              style={{ width: "100%", padding: "0.75rem 1.5rem", background: "#EF4444", color: "white", border: "none", borderRadius: "0.5rem", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.target.style.background = "#DC2626"; e.target.style.transform = "scale(1.05)"; }}
              onMouseLeave={(e) => { e.target.style.background = "#EF4444"; e.target.style.transform = "scale(1)"; }}
            >
              🔑 Change Password
            </button>
          ) : (
            <>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={labelStyle}>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "#3B82F6"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#D1D5DB"; }}
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={labelStyle}>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "#3B82F6"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#D1D5DB"; }}
                />
                <p style={{ fontSize: "0.85rem", color: "#6B7280", marginTop: "0.5rem" }}>Must be at least 6 characters</p>
              </div>

              <div style={{ marginBottom: "2rem" }}>
                <label style={labelStyle}>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "#3B82F6"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#D1D5DB"; }}
                />
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  onClick={handleCancelPassword}
                  style={{ flex: 1, padding: "0.75rem 1.5rem", background: "#E5E7EB", color: "#374151", border: "none", borderRadius: "0.5rem", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.target.style.background = "#D1D5DB"; }}
                  onMouseLeave={(e) => { e.target.style.background = "#E5E7EB"; }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  style={{ flex: 1, padding: "0.75rem 1.5rem", background: "#10B981", color: "white", border: "none", borderRadius: "0.5rem", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.target.style.background = "#059669"; e.target.style.transform = "scale(1.05)"; }}
                  onMouseLeave={(e) => { e.target.style.background = "#10B981"; e.target.style.transform = "scale(1)"; }}
                >
                  ✅ Change Password
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileSettings;