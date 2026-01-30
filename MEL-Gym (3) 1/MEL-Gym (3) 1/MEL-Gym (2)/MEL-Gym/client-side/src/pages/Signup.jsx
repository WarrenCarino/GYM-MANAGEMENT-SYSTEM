import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/1.png";
import bgImage from "../assets/4cc5728d-3f35-4cf2-bfec-dad8532d7a9d.jpg";

function MemberSignup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    member_name: "",
    contact_number: "",
    email: "",
    address: "",
    password: "",
    confirmPassword: "",
    membership_type: "Monthly"
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  axios.defaults.baseURL = "http://127.0.0.1:8000";
  axios.defaults.withCredentials = false;

  // ✅ Hide sidebar on signup page
  useEffect(() => {
    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
  };

  const validateStep = () => {
    setError("");
    
    if (step === 1) {
      if (!formData.member_name.trim()) {
        setError("Full name is required");
        return false;
      }
      if (!formData.contact_number.trim()) {
        setError("Contact number is required");
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!formData.email.trim()) {
        setError("Email is required");
        return false;
      }
      if (!formData.email.includes("@")) {
        setError("Please enter a valid email address");
        return false;
      }
      return true;
    }

    if (step === 3) {
      if (!formData.address.trim()) {
        setError("Address is required");
        return false;
      }
      return true;
    }

    if (step === 4) {
      if (!formData.password) {
        setError("Password is required");
        return false;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
    setError("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!validateStep()) return;

    setLoading(true);
    setError("");

    try {
      const payload = {
        member_name: formData.member_name.trim(),
        contact_number: formData.contact_number.trim(),
        email: formData.email.trim(),
        address: formData.address.trim() || "Not provided",
        password: formData.password,
        membership_type: formData.membership_type,
        status: "inactive"
      };

      console.log("📤 Sending signup request:", payload);

      const res = await axios.post("/api/members/signup", payload);

      console.log("✅ Signup response:", res.data);

      if (res.data.success) {
        alert("✅ Account created successfully! Please log in with your credentials.");
        navigate("/login", { replace: true });
      } else {
        setError(res.data.message || "Signup failed");
      }
    } catch (err) {
      console.error("❌ Signup error:", err);
      setError(
        err.response?.data?.message ||
        "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      backgroundImage: `url(${bgImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Dark overlay */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        zIndex: 1,
      }}></div>

      {/* Animated background elements */}
      <div style={{
        position: "absolute",
        width: "300px",
        height: "300px",
        background: "radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%)",
        borderRadius: "50%",
        top: "-100px",
        left: "-100px",
        animation: "float 6s ease-in-out infinite",
      }}></div>
      <div style={{
        position: "absolute",
        width: "200px",
        height: "200px",
        background: "radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)",
        borderRadius: "50%",
        bottom: "-50px",
        right: "-50px",
        animation: "float 8s ease-in-out infinite reverse",
      }}></div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(20px); }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        style={{
          position: "absolute",
          top: "30px",
          left: "30px",
          background: "rgba(255, 255, 255, 0.2)",
          border: "2px solid rgba(212, 175, 55, 0.5)",
          color: "#D4AF37",
          padding: "10px 20px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: "pointer",
          borderRadius: "8px",
          transition: "all 0.3s ease",
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          letterSpacing: "0.5px",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "rgba(212, 175, 55, 0.2)";
          e.currentTarget.style.borderColor = "#D4AF37";
          e.currentTarget.style.boxShadow = "0 0 15px rgba(212, 175, 55, 0.3)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
          e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.5)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        ← BACK
      </button>

      <div style={{
        backgroundColor: "white",
        padding: "40px 20px 20px 20px",
        borderRadius: "20px",
        width: "100%",
        maxWidth: "520px",
        boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
        position: "relative",
        zIndex: 10,
        animation: "slideIn 0.6s ease-out",
        backdropFilter: "blur(10px)",
      }}>
        {/* Decorative top border */}
        <div style={{
          position: "absolute",
          top: "0",
          left: "0",
          right: "0",
          height: "4px",
          background: "linear-gradient(90deg, #D4AF37 0%, #FFD700 50%, #D4AF37 100%)",
          borderRadius: "20px 20px 0 0",
        }}></div>

        {/* Logo Section */}
        <div style={{
          textAlign: "center",
          marginBottom: "10px",
          display: "flex",
          justifyContent: "center",
          position: "relative",
          marginLeft: "-100px",
          marginRight: "-20px",
          width: "calc(100% + 40px)",
          marginTop: "-50px",
        }}>
          <img 
            src={logo} 
            alt="MEL Gym Logo"
            style={{
              width: "200px",
              height: "200px",
              objectFit: "contain",
              position: "relative",
              zIndex: 5,
              filter: "drop-shadow(0 8px 25px rgba(212, 175, 55, 0.3))",
              marginRight: "-80px",
            }}
          />
        </div>

        {/* Title */}
        <h1 style={{
          textAlign: "center",
          marginBottom: "8px",
          color: "#0F1B08",
          fontSize: "32px",
          fontWeight: "800",
          letterSpacing: "-0.5px",
          marginTop: "-30px",
        }}>
          MEL Gym
        </h1>

        {/* Subtitle */}
        <p style={{
          textAlign: "center",
          marginBottom: "8px",
          color: "#D4AF37",
          fontSize: "13px",
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: "2px",
        }}>
          Create Account
        </p>

        {/* Step Indicator */}
        <p style={{
          textAlign: "center",
          marginBottom: "20px",
          color: "#888",
          fontSize: "13px",
          fontWeight: "500",
        }}>
          Step {step} of 5
        </p>

        {/* Progress Bar */}
        <div style={{
          width: "100%",
          height: "6px",
          backgroundColor: "#e0e0e0",
          borderRadius: "3px",
          marginBottom: "20px",
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${(step / 5) * 100}%`,
            backgroundColor: "#D4AF37",
            transition: "width 0.3s ease",
          }}></div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            color: "#721c24",
            backgroundColor: "#f8d7da",
            padding: "12px 15px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "13px",
            fontWeight: "600",
            border: "1.5px solid #f5c6cb",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <span>⚠️</span>
            {error}
          </div>
        )}

        {/* Form Content */}
        <div style={{ marginTop: "20px", minHeight: "200px" }}>
          {/* Step 1: Full Name & Phone */}
          {step === 1 && (
            <>
              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "block",
                  marginBottom: "6px",
                  color: "#1a1a1a",
                  fontWeight: "700",
                  fontSize: "13px",
                }}>
                  👤 Full Name
                </label>
                <input
                  type="text"
                  name="member_name"
                  value={formData.member_name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "11px 12px",
                    borderRadius: "8px",
                    border: "2px solid #e0e0e0",
                    fontSize: "13px",
                    fontFamily: "'Segoe UI', sans-serif",
                    transition: "all 0.3s ease",
                    boxSizing: "border-box",
                    backgroundColor: loading ? "#f9f9f9" : "white",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#D4AF37";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212, 175, 55, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e0e0e0";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "block",
                  marginBottom: "6px",
                  color: "#1a1a1a",
                  fontWeight: "700",
                  fontSize: "13px",
                }}>
                  📱 Phone Number
                </label>
                <input
                  type="tel"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleInputChange}
                  placeholder="09xxxxxxxxx"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "11px 12px",
                    borderRadius: "8px",
                    border: "2px solid #e0e0e0",
                    fontSize: "13px",
                    fontFamily: "'Segoe UI', sans-serif",
                    transition: "all 0.3s ease",
                    boxSizing: "border-box",
                    backgroundColor: loading ? "#f9f9f9" : "white",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#D4AF37";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212, 175, 55, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e0e0e0";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </>
          )}

          {/* Step 2: Email */}
          {step === 2 && (
            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                marginBottom: "6px",
                color: "#1a1a1a",
                fontWeight: "700",
                fontSize: "13px",
              }}>
                ✉️ Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "11px 12px",
                  borderRadius: "8px",
                  border: "2px solid #e0e0e0",
                  fontSize: "13px",
                  fontFamily: "'Segoe UI', sans-serif",
                  transition: "all 0.3s ease",
                  boxSizing: "border-box",
                  backgroundColor: loading ? "#f9f9f9" : "white",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#D4AF37";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212, 175, 55, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e0e0e0";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          )}

          {/* Step 3: Address & Membership */}
          {step === 3 && (
            <>
              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "block",
                  marginBottom: "6px",
                  color: "#1a1a1a",
                  fontWeight: "700",
                  fontSize: "13px",
                }}>
                  📍 Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Your address"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "11px 12px",
                    borderRadius: "8px",
                    border: "2px solid #e0e0e0",
                    fontSize: "13px",
                    fontFamily: "'Segoe UI', sans-serif",
                    transition: "all 0.3s ease",
                    boxSizing: "border-box",
                    backgroundColor: loading ? "#f9f9f9" : "white",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#D4AF37";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212, 175, 55, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e0e0e0";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "block",
                  marginBottom: "6px",
                  color: "#1a1a1a",
                  fontWeight: "700",
                  fontSize: "13px",
                }}>
                  🏋️ Membership Type
                </label>
                <select
                  name="membership_type"
                  value={formData.membership_type}
                  onChange={handleInputChange}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "11px 12px",
                    borderRadius: "8px",
                    border: "2px solid #e0e0e0",
                    fontSize: "13px",
                    fontFamily: "'Segoe UI', sans-serif",
                    transition: "all 0.3s ease",
                    boxSizing: "border-box",
                    backgroundColor: loading ? "#f9f9f9" : "white",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#D4AF37";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212, 175, 55, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e0e0e0";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <option value="Weekly">Weekly</option>
                  <option value="Walk-in">Walk-in</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>
            </>
          )}

          {/* Step 4: Password */}
          {step === 4 && (
            <>
              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "block",
                  marginBottom: "6px",
                  color: "#1a1a1a",
                  fontWeight: "700",
                  fontSize: "13px",
                }}>
                  🔐 Password
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="At least 6 characters"
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "11px 12px",
                      paddingRight: "40px",
                      borderRadius: "8px",
                      border: "2px solid #e0e0e0",
                      fontSize: "13px",
                      fontFamily: "'Segoe UI', sans-serif",
                      transition: "all 0.3s ease",
                      boxSizing: "border-box",
                      backgroundColor: loading ? "#f9f9f9" : "white",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#D4AF37";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212, 175, 55, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#e0e0e0";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    style={{
                      position: "absolute",
                      right: "10px",
                      background: "none",
                      border: "none",
                      fontSize: "16px",
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.5 : 1,
                    }}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "block",
                  marginBottom: "6px",
                  color: "#1a1a1a",
                  fontWeight: "700",
                  fontSize: "13px",
                }}>
                  🔐 Confirm Password
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Re-enter your password"
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "11px 12px",
                      paddingRight: "40px",
                      borderRadius: "8px",
                      border: "2px solid #e0e0e0",
                      fontSize: "13px",
                      fontFamily: "'Segoe UI', sans-serif",
                      transition: "all 0.3s ease",
                      boxSizing: "border-box",
                      backgroundColor: loading ? "#f9f9f9" : "white",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#D4AF37";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212, 175, 55, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#e0e0e0";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                    style={{
                      position: "absolute",
                      right: "10px",
                      background: "none",
                      border: "none",
                      fontSize: "16px",
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.5 : 1,
                    }}
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div style={{
              background: "#f9f9f9",
              padding: "20px",
              borderRadius: "8px",
              border: "2px solid #e0e0e0",
            }}>
              <h3 style={{ color: "#0F1B08", marginTop: 0 }}>Review Your Info</h3>
              <div style={{ textAlign: "left", fontSize: "13px", lineHeight: "1.8" }}>
                <p><strong>Name:</strong> {formData.member_name}</p>
                <p><strong>Phone:</strong> {formData.contact_number}</p>
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Address:</strong> {formData.address || "Not provided"}</p>
                <p><strong>Membership:</strong> {formData.membership_type}</p>
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={{
          display: "flex",
          gap: "12px",
          marginTop: "30px",
          justifyContent: "space-between",
        }}>
          <button
            onClick={handlePrevious}
            disabled={step === 1 || loading}
            style={{
              padding: "12px 24px",
              borderRadius: "8px",
              border: "2px solid #D4AF37",
              background: "transparent",
              color: "#D4AF37",
              fontSize: "14px",
              fontWeight: "700",
              cursor: step === 1 || loading ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              opacity: step === 1 || loading ? 0.5 : 1,
              textTransform: "uppercase",
            }}
            onMouseOver={(e) => {
              if (step > 1 && !loading) {
                e.currentTarget.style.background = "#D4AF37";
                e.currentTarget.style.color = "#0F1B08";
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#D4AF37";
            }}
          >
            ← PREVIOUS
          </button>

          {step < 5 ? (
            <button
              onClick={handleNext}
              disabled={loading}
              style={{
                padding: "12px 24px",
                borderRadius: "8px",
                background: loading ? "#ddd" : "#D4AF37",
                color: loading ? "#999" : "#0F1B08",
                border: "none",
                fontSize: "14px",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                textTransform: "uppercase",
                flex: 1,
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "#B8860B";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "#D4AF37";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              NEXT →
            </button>
          ) : (
            <button
              onClick={handleSignup}
              disabled={loading}
              style={{
                padding: "12px 24px",
                borderRadius: "8px",
                background: loading ? "#ddd" : "#D4AF37",
                color: loading ? "#999" : "#0F1B08",
                border: "none",
                fontSize: "14px",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                textTransform: "uppercase",
                flex: 1,
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "#B8860B";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "#D4AF37";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              {loading ? "⏳ CREATING..." : "✨ SIGN UP"}
            </button>
          )}
        </div>

        {/* Login Link */}
        <p style={{
          textAlign: "center",
          marginTop: "15px",
          color: "#666",
          fontSize: "13px",
        }}>
          Already have an account?{" "}
          <a
            href="/login"
            style={{
              color: "#D4AF37",
              textDecoration: "none",
              fontWeight: "700",
              cursor: "pointer",
            }}
            onMouseOver={(e) => e.target.style.textDecoration = "underline"}
            onMouseOut={(e) => e.target.style.textDecoration = "none"}
          >
            Login here
          </a>
        </p>

        {/* Footer */}
        <div style={{
          textAlign: "center",
          marginTop: "15px",
          paddingTop: "12px",
          borderTop: "1px solid #e8e8e8",
          color: "#999",
          fontSize: "12px",
          fontWeight: "600",
          letterSpacing: "0.5px",
        }}>
          🔒 Your data is secure | HTTPS encrypted
        </div>
      </div>
    </div>
  );
}

export default MemberSignup;