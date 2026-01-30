import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Nav, Button } from "react-bootstrap";
import {
  FaHome,
  FaMoneyBillAlt,
  FaBoxes,
  FaUserCog,
  FaClock,
  FaChartBar,
  FaIdCard,
  FaSignOutAlt,
  FaCreditCard,
} from "react-icons/fa";
import { useAuth } from "../App";
import logo from "./1.png"; // Import the logo from the same folder

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

function CashierSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    const cashierName = localStorage.getItem("cashierName");
    logAuditTrail(`LOGOUT FROM SIDEBAR - ${cashierName}`, "SUCCESS");
    logout();
    navigate("/login");
  };

  const handleNavigate = (path, label) => {
    logAuditTrail(`NAVIGATE TO - ${label}`, "SUCCESS");
  };

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: <FaHome /> },
    { path: "/payments", label: "Payments", icon: <FaMoneyBillAlt /> },
    { path: "/inventory", label: "Inventory", icon: <FaBoxes /> },
    { path: "/membership", label: "Membership", icon: <FaIdCard /> },
    { path: "/rfid", label: "RFID Management", icon: <FaCreditCard /> },
    { path: "/attendance", label: "Attendance", icon: <FaClock /> },
    { path: "/reportsgeneration", label: "Reports Generation", icon: <FaChartBar /> },
    { path: "/profile", label: "Profile & Settings", icon: <FaUserCog /> },
  ];

  return (
    <div
      className="text-white p-3 vh-100 d-flex flex-column align-items-center shadow-lg"
      style={{
        width: "260px",
        background: "linear-gradient(180deg, #0F1B08 0%, #081005 100%)",
        borderRight: "3px solid #2D5016",
      }}
    >
      {/* Logo Section */}
      <div 
        className="text-center"
        style={{
          marginBottom: "30px",
          width: "100%",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          paddingLeft: "30px",
        }}
      >
        <div
          style={{
            backgroundColor: "transparent",
            borderRadius: "50%",
            padding: "0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "none",
            border: "none",
            width: "120px",
            height: "120px",
          }}
        >
          <img
            src={logo}
            alt="MEL Gym Logo"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              borderRadius: "50%",
            }}  
          />
        </div>
      </div>

      {/* Sidebar Title */}
      <h4 
        className="text-center fw-semibold mb-5"
        style={{
          color: "#D4AF37",
          fontSize: "16px",
          letterSpacing: "1px",
          textTransform: "uppercase",
        }}
      >
        💼 Cashier - Staff
      </h4>

      {/* Navigation */}
      <Nav className="flex-column w-100 flex-grow-1 gap-2">
        {menuItems.map((item) => (
          <Nav.Link
            as={Link}
            to={item.path}
            key={item.path}
            onClick={() => handleNavigate(item.path, item.label)}
            className={`d-flex align-items-center px-3 py-3 rounded-lg`}
            style={{
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              fontWeight: "500",
              fontSize: "14px",
              backgroundColor: location.pathname === item.path 
                ? "#2D5016" 
                : "transparent",
              color: location.pathname === item.path 
                ? "#D4AF37" 
                : "#E0E0E0",
              borderLeft: location.pathname === item.path 
                ? "4px solid #D4AF37" 
                : "4px solid transparent",
              paddingLeft: "16px",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseOver={(e) => {
              if (location.pathname !== item.path) {
                e.currentTarget.style.backgroundColor = "#1A3B0F";
                e.currentTarget.style.color = "#D4AF37";
                e.currentTarget.style.borderLeftColor = "#D4AF37";
                e.currentTarget.style.paddingLeft = "20px";
              }
            }}
            onMouseOut={(e) => {
              if (location.pathname !== item.path) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#E0E0E0";
                e.currentTarget.style.borderLeftColor = "transparent";
                e.currentTarget.style.paddingLeft = "16px";
              }
            }}
          >
            <span 
              className="me-3 fs-6"
              style={{
                transition: "all 0.3s ease",
              }}
            >
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Nav.Link>
        ))}
      </Nav>

      {/* Logout Button */}
      <Button
        onClick={handleLogout}
        className="mt-auto w-100 d-flex align-items-center justify-content-center py-3 fw-600 rounded-lg"
        style={{
          backgroundColor: "#1A3B0F",
          border: "2px solid #D4AF37",
          color: "#D4AF37",
          fontWeight: "600",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          fontSize: "14px",
          letterSpacing: "0.5px",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = "#D4AF37";
          e.currentTarget.style.color = "#0F1B08";
          e.currentTarget.style.boxShadow = "0 6px 16px rgba(212, 175, 55, 0.3)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = "#1A3B0F";
          e.currentTarget.style.color = "#D4AF37";
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <FaSignOutAlt className="me-2" /> Logout
      </Button>
    </div>
  );
}

export default CashierSidebar;