import { 
  FaHome, 
  FaUser, 
  FaUsers, 
  FaRunning,
  FaChalkboardTeacher,
  FaClipboardList,
  FaSignOutAlt, 
  FaCreditCard,
  FaLock,
  FaDumbbell
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import logo from "../assets/1.png";
import { useState, useEffect } from "react";
import axios from "axios";

function Sidebar({ setActivePage, activePage }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isInactive, setIsInactive] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  // Configure axios
  axios.defaults.baseURL = 'http://127.0.0.1:8000';
  axios.defaults.withCredentials = false;

  // Check member status
  useEffect(() => {
    const checkMemberStatus = async () => {
      if (!user?.id) {
        console.log('❌ No user ID found');
        return;
      }
      
      try {
        const response = await axios.get(`/api/members/${user.id}`);
        const memberStatus = response.data.status;
        
        console.log('👤 Member Status Check:', {
          userId: user.id,
          status: memberStatus,
          isInactive: memberStatus === 'inactive'
        });
        
        setIsInactive(memberStatus === 'inactive');
        
        // Store in localStorage for quick access
        if (memberStatus === 'inactive') {
          localStorage.setItem('membershipInactive', 'true');
          console.log('🔴 Member is INACTIVE - buttons will be blocked');
        } else {
          localStorage.removeItem('membershipInactive');
          console.log('✅ Member is ACTIVE - full access granted');
        }
      } catch (err) {
        console.error('❌ Error checking member status:', err);
      }
    };

    checkMemberStatus();
    
    // Re-check status every time activePage changes
    const interval = setInterval(checkMemberStatus, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, [user, activePage]);

  // All styles embedded in the component
  const styles = `
    .sidebar {
      width: 260px;
      height: 100vh;
      background: linear-gradient(180deg, #0d1508 0%, #16220F 50%, #1a2912 100%);
      color: white;
      padding: 0;
      position: fixed;
      left: 0;
      top: 0;
      box-shadow: 4px 0 20px rgba(0, 0, 0, 0.4);
      display: flex;
      flex-direction: column;
      z-index: 1000;
      overflow: hidden;
    }
    .sidebar-overlay { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at 50% 0%, rgba(202, 151, 45, 0.1) 0%, transparent 70%); pointer-events: none; z-index: 0; }
    .sidebar-logo { text-align: center; padding: 30px 20px; margin-bottom: 20px; border-bottom: 2px solid rgba(202, 151, 45, 0.2); position: relative; background: rgba(0, 0, 0, 0.2); z-index: 1; }
    .sidebar-logo img { width: 160px; height: auto; border-radius: 12px; transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); filter: drop-shadow(0 4px 12px rgba(202, 151, 45, 0.3)); cursor: pointer; }
    .sidebar-logo:hover img { transform: scale(1.05) translateY(-2px); filter: drop-shadow(0 8px 20px rgba(202, 151, 45, 0.5)); }
    .sidebar-menu { list-style: none; padding: 10px 15px; margin: 0; flex: 1; overflow: visible; z-index: 1; }
    .sidebar-menu li { margin: 6px 0; list-style: none; position: relative; }
    .sidebar-menu a { color: #b8b8b8; text-decoration: none; display: flex; align-items: center; font-size: 16px; font-weight: 500; letter-spacing: 0.3px; padding: 14px 18px; border-radius: 12px; position: relative; overflow: hidden; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); font-family: 'Lato', sans-serif; cursor: pointer; border: 1px solid transparent; }
    .sidebar-menu a.blocked { opacity: 0.4; cursor: not-allowed; }
    .sidebar-menu a.blocked::after { content: '🔒'; position: absolute; right: 15px; font-size: 14px; }
    .sidebar-menu li.blocked { pointer-events: none; }
    .sidebar-menu a::before { content: ""; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, #CA972D 0%, #d4a745 100%); z-index: -1; transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 12px; }
    .sidebar-menu a:hover::before, .sidebar-menu a.active::before { left: 0; }
    .sidebar-menu a:hover:not(.blocked), .sidebar-menu a.active:not(.blocked) { color: #0d1508; transform: translateX(8px); font-weight: 600; border-color: rgba(202, 151, 45, 0.3); box-shadow: 0 4px 12px rgba(202, 151, 45, 0.25); }
    .sidebar-menu .icon { margin-right: 14px; font-size: 19px; transition: transform 0.3s ease; filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2)); }
    .sidebar-menu a:hover:not(.blocked) .icon, .sidebar-menu a.active:not(.blocked) .icon { transform: scale(1.2) rotate(5deg); }
    .sidebar-menu a.active:not(.blocked) { background: linear-gradient(90deg, #CA972D 0%, #d4a745 100%); color: #0d1508; font-weight: 700; box-shadow: 0 6px 16px rgba(202, 151, 45, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2); border-color: rgba(202, 151, 45, 0.5); }
    .logout-menu { margin-top: auto; padding: 15px; border-top: 2px solid rgba(202, 151, 45, 0.2); background: rgba(0, 0, 0, 0.2); }
    .logout-menu li { margin: 0; }
    .logout-menu a { background: rgba(220, 53, 69, 0.15); border: 1px solid rgba(220, 53, 69, 0.4); color: #ff6b6b; font-weight: 600; }
    .logout-menu a:hover { background: linear-gradient(90deg, #dc3545 0%, #c82333 100%); color: white; border-color: #dc3545; box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4); }
    .logout-menu a:hover::before { display: none; }
    
    .blocked-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 9999; }
    .blocked-modal { background: white; border-radius: 16px; padding: 2rem; max-width: 500px; width: 90%; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4); text-align: center; }
    .blocked-modal-icon { font-size: 64px; margin-bottom: 1rem; }
    .blocked-modal h3 { color: #DC2626; font-size: 1.5rem; margin-bottom: 1rem; }
    .blocked-modal p { color: #374151; font-size: 1rem; margin-bottom: 1.5rem; line-height: 1.6; }
    .blocked-modal button { background: linear-gradient(90deg, #CA972D 0%, #d4a745 100%); color: #0d1508; border: none; padding: 12px 32px; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
    .blocked-modal button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(202, 151, 45, 0.4); }
    
    @media (max-width: 768px) { .sidebar { width: 100%; height: auto; position: relative; } }
  `;

  const handleLogout = () => {
    console.log("🔓 Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("membershipInactive");
    navigate("/login", { replace: true });
    window.location.reload();
  };

  const handleNavigation = (page) => {
    console.log('🔄 Navigation attempt:', {
      page: page,
      isInactive: isInactive,
      willBlock: isInactive && !['membership', 'profile'].includes(page)
    });
    
    // Allow navigation to membership and profile pages even if inactive
    const allowedPages = ['membership', 'profile'];
    
    if (isInactive && !allowedPages.includes(page)) {
      console.log('🚫 BLOCKED - Member is inactive');
      setShowBlockedModal(true);
      return;
    }
    
    console.log('✅ Navigation allowed');
    setActivePage(page);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="sidebar">
        <div className="sidebar-overlay"></div>
        
        <div className="sidebar-logo">
          <img src={logo} alt="Logo" />
        </div>

        <ul className="sidebar-menu">
          <li className={isInactive ? "blocked" : ""}>
            <a 
              onClick={() => handleNavigation("dashboard")} 
              className={`${activePage === "dashboard" ? "active" : ""} ${isInactive ? "blocked" : ""}`}
            >
              <FaHome className="icon" /> Dashboard
            </a>
          </li>
          <li>
            <a 
              onClick={() => handleNavigation("profile")} 
              className={activePage === "profile" ? "active" : ""}
            >
              <FaUser className="icon" /> Profile
            </a>
          </li>
          <li>
            <a 
              onClick={() => handleNavigation("membership")} 
              className={activePage === "membership" ? "active" : ""}
            >
              <FaUsers className="icon" /> Membership
            </a>
          </li>
          <li className={isInactive ? "blocked" : ""}>
            <a 
              onClick={() => handleNavigation("session")} 
              className={`${activePage === "session" ? "active" : ""} ${isInactive ? "blocked" : ""}`}
            >
              <FaDumbbell className="icon" /> Session
            </a>
          </li>
          <li className={isInactive ? "blocked" : ""}>
            <a 
              onClick={() => handleNavigation("classes")} 
              className={`${activePage === "classes" ? "active" : ""} ${isInactive ? "blocked" : ""}`}
            >
              <FaChalkboardTeacher className="icon" /> Classes
            </a>
          </li>
          
          <li className={isInactive ? "blocked" : ""}>
            <a 
              onClick={() => handleNavigation("userlogs")} 
              className={`${activePage === "userlogs" ? "active" : ""} ${isInactive ? "blocked" : ""}`}
            >
              <FaClipboardList className="icon" /> User Logs
            </a>
          </li>
        </ul>

        <ul className="sidebar-menu logout-menu">
          <li onClick={handleLogout} style={{ cursor: "pointer" }}>
            <a>
              <FaSignOutAlt className="icon" /> Logout
            </a>
          </li>
        </ul>
      </div>

      {/* Blocked Access Modal */}
      {showBlockedModal && (
        <div className="blocked-modal-overlay" onClick={() => setShowBlockedModal(false)}>
          <div className="blocked-modal" onClick={(e) => e.stopPropagation()}>
            <div className="blocked-modal-icon">🔒</div>
            <h3>Access Restricted</h3>
            <p>
              Your account is currently <strong>INACTIVE</strong>. 
              Please purchase a membership to access this feature and all gym facilities.
            </p>
            <button onClick={() => {
              setShowBlockedModal(false);
              setActivePage('membership');
            }}>
              Purchase Membership
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;