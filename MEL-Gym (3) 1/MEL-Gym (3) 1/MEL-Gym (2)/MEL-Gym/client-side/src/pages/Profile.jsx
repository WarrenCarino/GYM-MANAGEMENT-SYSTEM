import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Award, Calendar, Lock, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import axios from "axios";

function ProfileEdit() {
  const API_URL = "http://127.0.0.1:8000";
  
  const [formData, setFormData] = useState({
    member_name: "",
    email: "",
    contact_number: "",
    membership_type: "",
    membership_end: ""
  });

  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  // Fetch member data on mount
  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        const memberId = localStorage.getItem("memberId") || 1;
        const response = await axios.get(`${API_URL}/api/members/${memberId}`);
        
        if (response.data) {
          const data = {
            member_name: response.data.member_name || "",
            email: response.data.email || "",
            contact_number: response.data.contact_number || "",
            membership_type: response.data.membership_type || "",
            membership_end: response.data.membership_end || ""
          };
          
          setFormData(data);
          setOriginalData(data);
        }
      } catch (error) {
        console.error("Error fetching member data:", error);
        setMessage({ 
          type: "error", 
          text: "Failed to load profile information" 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, []);

  // Track changes
  useEffect(() => {
    const isChanged = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasChanges(isChanged);
  }, [formData, originalData]);

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    if (!formData.member_name?.trim()) {
      newErrors.member_name = "Full name is required";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.contact_number?.trim()) {
      newErrors.contact_number = "Phone number is required";
    } else if (!/^\d{10,}$/.test(formData.contact_number.replace(/\D/g, ''))) {
      newErrors.contact_number = "Invalid phone number (min 10 digits)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setMessage({ type: "error", text: "Please fix the errors above" });
      return;
    }

    if (!hasChanges) {
      setMessage({ type: "info", text: "No changes to save" });
      return;
    }

    setSaving(true);
    try {
      const memberId = localStorage.getItem("memberId") || 1;
      
      const updateData = {
        member_name: formData.member_name,
        email: formData.email,
        contact_number: formData.contact_number
      };

      // Update member info
      const response = await axios.put(`${API_URL}/api/members/${memberId}`, updateData);

      // Update original data after successful save
      setOriginalData(formData);
      setHasChanges(false);
      setMessage({ 
        type: "success", 
        text: "Profile updated successfully!" 
      });

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || "Failed to update profile" 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setHasChanges(false);
    setErrors({});
    setMessage({ type: "", text: "" });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleUpdatePassword = async () => {
    if (!validatePasswordForm()) {
      setMessage({ type: "error", text: "Please fix the errors above" });
      return;
    }

    setSaving(true);
    try {
      const memberId = localStorage.getItem("memberId") || 1;
      
      // Call password update endpoint
      await axios.put(`${API_URL}/api/members/${memberId}/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setMessage({ 
        type: "success", 
        text: "Password updated successfully!" 
      });
      
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setShowPasswordForm(false);

      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);
    } catch (error) {
      console.error("Error updating password:", error);
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || "Failed to update password" 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelPassword = () => {
    setShowPasswordForm(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setPasswordErrors({});
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        fontSize: '18px',
        color: '#6b7280'
      }}>
        Loading profile...
      </div>
    );
  }

  return (
    <div style={{ padding: '0' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        {/* Status Message */}
        {message.text && (
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: message.type === 'success' ? '#ECFDF5' :
                            message.type === 'error' ? '#FEF2F2' : '#FEF3C7',
            border: `1px solid ${
              message.type === 'success' ? '#BBFF99' :
              message.type === 'error' ? '#FECACA' : '#FCD34D'
            }`
          }}>
            {message.type === 'success' ? (
              <CheckCircle size={20} style={{ color: '#10B981' }} />
            ) : (
              <AlertCircle size={20} style={{ color: message.type === 'error' ? '#DC2626' : '#F59E0B' }} />
            )}
            <span style={{ 
              color: message.type === 'success' ? '#065F46' :
                    message.type === 'error' ? '#7F1D1D' : '#92400E',
              fontWeight: '600'
            }}>
              {message.text}
            </span>
          </div>
        )}

        {/* Profile Header */}
        <div style={{
          background: 'linear-gradient(135deg, #CA972D 0%, #B8860B 100%)',
          borderRadius: '20px',
          padding: '40px',
          color: 'white',
          marginBottom: '32px',
          boxShadow: '0 10px 30px rgba(202, 151, 45, 0.2)'
        }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0' }}>
              {formData.member_name}
            </h1>
            <p style={{ margin: '0 0 12px 0', opacity: 0.9 }}>
              Membership: <strong>{formData.membership_type}</strong>
            </p>
            <span style={{
              display: 'inline-block',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '700',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              ✅ Active Member
            </span>
          </div>
        </div>

        {/* Edit Form */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid #f0f0f0'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '800',
            color: '#111827',
            marginBottom: '28px',
            margin: '0 0 28px 0'
          }}>Edit Profile Information</h2>
          
          <form style={{ display: 'grid', gap: '20px' }}>
            
            {/* Full Name */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '8px'
              }}>
                <User size={18} />
                Full Name
              </label>
              <input
                type="text"
                name="member_name"
                value={formData.member_name}
                onChange={handleChange}
                placeholder="Enter your full name"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: errors.member_name ? '2px solid #DC2626' : '1px solid #E5E7EB',
                  borderRadius: '10px',
                  fontSize: '15px',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
              />
              {errors.member_name && (
                <p style={{ color: '#DC2626', fontSize: '13px', margin: '4px 0 0 0' }}>
                  {errors.member_name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '8px'
              }}>
                <Mail size={18} />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: errors.email ? '2px solid #DC2626' : '1px solid #E5E7EB',
                  borderRadius: '10px',
                  fontSize: '15px',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
              />
              {errors.email && (
                <p style={{ color: '#DC2626', fontSize: '13px', margin: '4px 0 0 0' }}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '8px'
              }}>
                <Phone size={18} />
                Phone Number
              </label>
              <input
                type="tel"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                placeholder="Enter your phone number"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: errors.contact_number ? '2px solid #DC2626' : '1px solid #E5E7EB',
                  borderRadius: '10px',
                  fontSize: '15px',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
              />
              {errors.contact_number && (
                <p style={{ color: '#DC2626', fontSize: '13px', margin: '4px 0 0 0' }}>
                  {errors.contact_number}
                </p>
              )}
            </div>

            {/* Membership Type & Expiration */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '8px'
                }}>
                  <Award size={18} />
                  Membership Plan
                </label>
                <input
                  type="text"
                  value={formData.membership_type}
                  disabled
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '10px',
                    fontSize: '15px',
                    backgroundColor: '#F9FAFB',
                    color: '#6b7280',
                    cursor: 'not-allowed'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '8px'
                }}>
                  <Calendar size={18} />
                  Expiration Date
                </label>
                <input
                  type="text"
                  value={formatDate(formData.membership_end)}
                  disabled
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '10px',
                    fontSize: '15px',
                    backgroundColor: '#F9FAFB',
                    color: '#6b7280',
                    cursor: 'not-allowed'
                  }}
                />
              </div>
            </div>

            {/* Change Indicator */}
            {hasChanges && (
              <div style={{
                padding: '12px 16px',
                background: '#FEF3C7',
                border: '1px solid #FCD34D',
                borderRadius: '10px',
                fontSize: '13px',
                color: '#92400E',
                fontWeight: '600'
              }}>
                💾 You have unsaved changes
              </div>
            )}

            {/* Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              marginTop: '12px'
            }}>
              <button 
                type="button" 
                onClick={handleCancel}
                disabled={!hasChanges || saving}
                style={{
                  padding: '12px 28px',
                  background: '#F3F4F6',
                  color: '#374151',
                  border: '1px solid #E5E7EB',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: !hasChanges || saving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: !hasChanges || saving ? 0.5 : 1
                }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleSave}
                disabled={!hasChanges || saving}
                style={{
                  padding: '12px 28px',
                  background: '#CA972D',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: !hasChanges || saving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: !hasChanges || saving ? 0.6 : 1,
                  boxShadow: '0 4px 12px rgba(202, 151, 45, 0.3)'
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Section */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid #f0f0f0',
          marginTop: '24px'
        }}>
          {!showPasswordForm ? (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '800',
                  color: '#111827',
                  margin: '0 0 4px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Lock size={20} />
                  Change Password
                </h2>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '0'
                }}>
                  Update your account password regularly to keep it secure
                </p>
              </div>
              <button
                onClick={() => setShowPasswordForm(true)}
                style={{
                  padding: '10px 24px',
                  background: '#CA972D',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                Change Password
              </button>
            </div>
          ) : (
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '800',
                color: '#111827',
                marginBottom: '24px',
                margin: '0 0 24px 0'
              }}>Change Password</h2>

              <form style={{ display: 'grid', gap: '20px' }}>
                
                {/* Current Password */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '8px'
                  }}>
                    <Lock size={18} />
                    Current Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter your current password"
                      style={{
                        width: '100%',
                        padding: '12px 40px 12px 16px',
                        border: passwordErrors.currentPassword ? '2px solid #DC2626' : '1px solid #E5E7EB',
                        borderRadius: '10px',
                        fontSize: '15px',
                        transition: 'all 0.3s ease',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6b7280'
                      }}
                    >
                      {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p style={{ color: '#DC2626', fontSize: '13px', margin: '4px 0 0 0' }}>
                      {passwordErrors.currentPassword}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '8px'
                  }}>
                    <Lock size={18} />
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter your new password"
                      style={{
                        width: '100%',
                        padding: '12px 40px 12px 16px',
                        border: passwordErrors.newPassword ? '2px solid #DC2626' : '1px solid #E5E7EB',
                        borderRadius: '10px',
                        fontSize: '15px',
                        transition: 'all 0.3s ease',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6b7280'
                      }}
                    >
                      {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p style={{ color: '#DC2626', fontSize: '13px', margin: '4px 0 0 0' }}>
                      {passwordErrors.newPassword}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '8px'
                  }}>
                    <Lock size={18} />
                    Confirm New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm your new password"
                      style={{
                        width: '100%',
                        padding: '12px 40px 12px 16px',
                        border: passwordErrors.confirmPassword ? '2px solid #DC2626' : '1px solid #E5E7EB',
                        borderRadius: '10px',
                        fontSize: '15px',
                        transition: 'all 0.3s ease',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6b7280'
                      }}
                    >
                      {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p style={{ color: '#DC2626', fontSize: '13px', margin: '4px 0 0 0' }}>
                      {passwordErrors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'flex-end',
                  marginTop: '12px'
                }}>
                  <button 
                    type="button" 
                    onClick={handleCancelPassword}
                    disabled={saving}
                    style={{
                      padding: '12px 28px',
                      background: '#F3F4F6',
                      color: '#374151',
                      border: '1px solid #E5E7EB',
                      borderRadius: '10px',
                      fontSize: '15px',
                      fontWeight: '700',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      opacity: saving ? 0.5 : 1
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    onClick={handleUpdatePassword}
                    disabled={saving}
                    style={{
                      padding: '12px 28px',
                      background: '#CA972D',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '15px',
                      fontWeight: '700',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      opacity: saving ? 0.6 : 1,
                      boxShadow: '0 4px 12px rgba(202, 151, 45, 0.3)'
                    }}
                  >
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileEdit;