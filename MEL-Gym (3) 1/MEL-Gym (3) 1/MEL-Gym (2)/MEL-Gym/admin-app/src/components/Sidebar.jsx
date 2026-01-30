// src/components/Sidebar.jsx (Admin)
import { 
  FaHome, 
  FaUserTie, 
  FaFileAlt, 
  FaUsersCog, 
  FaSignOutAlt, 
  FaCalendarAlt,
  FaCalendarCheck,
  FaClipboardList,
  FaHistory,
  FaUser,
  FaCog
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import logo from "../admin/1.png";


function Sidebar({ setActivePage, activePage }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const menuItems = [
    { name: "dashboard", label: "Dashboard", icon: <FaHome />, path: "/dashboard" },
    { name: "trainers", label: "Staff Accounts", icon: <FaUserTie />, path: "/trainers" },
    { name: "reports", label: "Report Generation", icon: <FaFileAlt />, path: "/reports" },
    { name: "users", label: "Member Accounts", icon: <FaUsersCog />, path: "/users" },
    { name: "schedule", label: "Trainers", icon: <FaCalendarAlt />, path: "/schedule" },
    { name: "bookings", label: "Client Bookings", icon: <FaCalendarCheck />, path: "/bookings" },
    { name: "attendance", label: "Attendance Logs", icon: <FaClipboardList />, path: "/attendance" },
    { name: "audit", label: "Audit Trail", icon: <FaHistory />, path: "/audit" },
  ];

  const handleItemClick = (item) => {
    setActivePage(item.name);
    navigate(item.path);
  };

  const handleProfileClick = () => {
    setActivePage("profile");
    navigate("/profile");
  };

  const handleLogout = () => {
    console.log("🔓 Logging out...");
    logout(); // ✅ Use logout from useAuth hook
    console.log("🔄 Navigating to login page...");
    navigate("/", { replace: true }); // ✅ Changed from /admin/login to /
  };

  // ✅ Get user initials for avatar
  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }
    return "A";
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <img src={logo} alt="Logo" />
      </div>

      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li
            key={item.name}
            className={activePage === item.name ? "active" : ""}
            onClick={() => handleItemClick(item)}
            style={{ cursor: "pointer" }}
          >
            {item.icon} {item.label}
          </li>
        ))}
      </ul>

      {/* ✅ Settings Section */}
      <ul className="sidebar-menu settings-menu">
        <li
          className={activePage === "profile" ? "active" : ""}
          onClick={handleProfileClick}
          style={{ cursor: "pointer" }}
        >
          <FaUser /> Profile Settings
        </li>
      </ul>

      <ul className="sidebar-menu logout-menu">
        <li onClick={handleLogout} style={{ cursor: "pointer" }}>
          <FaSignOutAlt /> Logout
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;