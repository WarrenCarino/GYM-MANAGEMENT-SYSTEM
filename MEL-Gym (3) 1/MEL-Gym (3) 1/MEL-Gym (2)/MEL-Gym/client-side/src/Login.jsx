import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "./AuthContext.jsx";
import logo from "./assets/1.png"; // Import logo from same folder
import bgImage from "./assets/4cc5728d-3f35-4cf2-bfec-dad8532d7a9d.jpg"; // Import background image

function MemberLogin() {
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  axios.defaults.baseURL = "http://127.0.0.1:8000";
  axios.defaults.withCredentials = false;

  // ✅ Hide sidebar on login page
  useEffect(() => {
    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("/api/members/login", { contact, password });

      if (!res.data.success) {
        setError(res.data.message || "Login failed");
        setLoading(false);
        return;
      }

      const { token, user } = res.data;

      if (!token || !user) {
        setError("Login failed - missing token or user data");
        setLoading(false);
        return;
      }

      // 🚫 BLOCK INACTIVE MEMBERS
      if (user.status === "inactive") {
        setError("Your membership is inactive. Please renew at the front desk.");
        setLoading(false);
        return;
      }

      // ✅ Allow login for active members
      login(user, token);
      navigate("/dashboard", { replace: true });

    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
        "Login failed. Please check your phone number and password."
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
      {/* Dark overlay for better text visibility */}
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
        maxWidth: "480px",
        minHeight: "650px",
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
              width: "300px",
              height: "300px",
              objectFit: "contain",
              position: "relative",
              zIndex: 5,
              filter: "drop-shadow(0 8px 25px rgba(212, 175, 55, 0.3))",
              marginRight: "-100px",
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
          marginTop: "-35px",
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
          Member Portal
        </p>

        <p style={{
          textAlign: "center",
          marginBottom: "28px",
          color: "#888",
          fontSize: "13px",
          fontWeight: "500",
        }}>
          Secure Access to Your Account
        </p>

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
        <div style={{ marginTop: "25px" }}>
          {/* Phone Input */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              color: "#1a1a1a",
              fontWeight: "700",
              fontSize: "14px",
            }}>
              📱 Phone Number
            </label>
            <input
              type="tel"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="09xxxxxxxxx"
              required
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 15px",
                borderRadius: "10px",
                border: "2px solid #e0e0e0",
                fontSize: "14px",
                fontFamily: "'Segoe UI', sans-serif",
                transition: "all 0.3s ease",
                boxSizing: "border-box",
                backgroundColor: loading ? "#f9f9f9" : "white",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#D4AF37";
                e.currentTarget.style.boxShadow = "0 0 0 4px rgba(212, 175, 55, 0.15)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e0e0e0";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              color: "#1a1a1a",
              fontWeight: "700",
              fontSize: "14px",
            }}>
              🔐 Password
            </label>
            <div style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  borderRadius: "10px",
                  border: "2px solid #e0e0e0",
                  fontSize: "14px",
                  fontFamily: "'Segoe UI', sans-serif",
                  transition: "all 0.3s ease",
                  boxSizing: "border-box",
                  backgroundColor: loading ? "#f9f9f9" : "white",
                  paddingRight: "45px",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#D4AF37";
                  e.currentTarget.style.boxShadow = "0 0 0 4px rgba(212, 175, 55, 0.15)";
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
                  right: "12px",
                  background: "none",
                  border: "none",
                  fontSize: "18px",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.5 : 1,
                }}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "10px",
              backgroundColor: loading ? "#ddd" : "#D4AF37",
              color: loading ? "#999" : "#0F1B08",
              border: "none",
              fontSize: "16px",
              fontWeight: "800",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              letterSpacing: "0.5px",
              boxShadow: loading ? "none" : "0 10px 25px rgba(212, 175, 55, 0.25)",
              textTransform: "uppercase",
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = "#B8860B";
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 15px 35px rgba(212, 175, 55, 0.35)";
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = "#D4AF37";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 25px rgba(212, 175, 55, 0.25)";
              }
            }}
          >
            {loading ? "⏳ Logging in..." : "🔓 LOGIN"}
          </button>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: "center",
          marginTop: "24px",
          paddingTop: "18px",
          borderTop: "1px solid #e8e8e8",
          color: "#999",
          fontSize: "12px",
          fontWeight: "600",
          letterSpacing: "0.5px",
        }}>
          🔒 Secure Member Access | Encrypted Connection
        </div>
      </div>
    </div>
  );
}

export default MemberLogin;