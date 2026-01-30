import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Profile from "./Profile";
import Membership from "./Membership";
import Classes from "./Classes";
import Workout from "./Workout";
import UserLogs from "./userlogs";
import Payment from "./Payment";
import Sessions from "./Sessions";
import axios from "axios";

function Dashboard() {
  const [profilePic, setProfilePic] = useState(null);
  const [notifications, setNotifications] = useState([
    "Your membership is ending soon.",
    "New class available: HIIT Training.",
    "Don't forget to pay before Oct 10.",
    "Coach Anna added new Yoga sessions."
  ]);
  const [showAll, setShowAll] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [memberData, setMemberData] = useState(null);
  const [daysUntilRenewal, setDaysUntilRenewal] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = "http://127.0.0.1:8000";

  // Fetch member data from backend
  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        const memberId = localStorage.getItem("memberId") || 1;
        const response = await axios.get(`${API_URL}/api/members/${memberId}`);
        
        if (response.data) {
          setMemberData(response.data);
          
          // Calculate days until renewal
          const endDate = new Date(response.data.membership_end);
          const today = new Date();
          
          // Set both to start of day for accurate day counting
          endDate.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);
          
          const diffTime = endDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setDaysUntilRenewal(diffDays);

          // Update notifications if expiring soon
          if (diffDays <= 7 && diffDays > 0) {
            setNotifications((prev) => [
              `⚠️ Your membership expires in ${diffDays} day${diffDays !== 1 ? 's' : ''}!`,
              ...prev.slice(1)
            ]);
          } else if (diffDays <= 0) {
            setNotifications((prev) => [
              "🔴 Your membership has expired. Please renew now!",
              ...prev.slice(1)
            ]);
          }
        }
      } catch (error) {
        console.error("Error fetching member data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) setProfilePic(URL.createObjectURL(file));
  };

  // Determine membership status
  const getMembershipStatus = () => {
    if (!memberData) return null;
    
    if (daysUntilRenewal === null) return null;
    if (daysUntilRenewal <= 0) return "expired";
    if (daysUntilRenewal <= 7) return "expiring";
    return "active";
  };

  const membershipStatus = getMembershipStatus();
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <>
            {/* Header */}
            <header style={{
              marginBottom: '40px'
            }}>
              <h1 style={{
                fontSize: '36px',
                fontWeight: '800',
                color: '#111827',
                margin: '0 0 8px 0',
                background: 'linear-gradient(135deg, #CA972D 0%, #B8860B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Welcome, {memberData?.member_name || 'Member'}! 👋
              </h1>
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                margin: '0'
              }}>
                Manage your fitness journey and membership
              </p>
            </header>

            {/* Main Content Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '32px',
              marginBottom: '32px'
            }}>
              {/* Left Column - Membership Card */}
              <section style={{
                gridColumn: '1 / -1'
              }}>
                {/* Premium Membership Card */}
                <div style={{
                  background: membershipStatus === 'expired' 
                    ? 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)'
                    : membershipStatus === 'expiring'
                    ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                    : 'linear-gradient(135deg, #CA972D 0%, #B8860B 100%)',
                  borderRadius: '24px',
                  padding: '40px',
                  color: 'white',
                  boxShadow: membershipStatus === 'expired' 
                    ? '0 20px 60px rgba(220, 38, 38, 0.3)'
                    : membershipStatus === 'expiring'
                    ? '0 20px 60px rgba(245, 158, 11, 0.3)'
                    : '0 20px 60px rgba(202, 151, 45, 0.3)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Decorative Background */}
                  <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-10%',
                    width: '300px',
                    height: '300px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    pointerEvents: 'none'
                  }} />
                  <div style={{
                    position: 'absolute',
                    bottom: '-30%',
                    left: '-5%',
                    width: '200px',
                    height: '200px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '50%',
                    pointerEvents: 'none'
                  }} />

                  {/* Content */}
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Top Section */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '32px'
                    }}>
                      <div>
                        <p style={{
                          fontSize: '14px',
                          opacity: 0.8,
                          margin: '0 0 8px 0',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '1px'
                        }}>Your Membership</p>
                        <h2 style={{
                          fontSize: '32px',
                          fontWeight: '800',
                          margin: '0',
                          color: 'white'
                        }}>
                          {memberData?.membership_type || 'Standard'}
                        </h2>
                      </div>
                      
                      {/* Status Badge */}
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.25)',
                        backdropFilter: 'blur(10px)',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '700',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {membershipStatus === 'expired' && <span>🔴 EXPIRED</span>}
                        {membershipStatus === 'expiring' && <span>⚠️ EXPIRING</span>}
                        {membershipStatus === 'active' && <span>✅ ACTIVE</span>}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '32px',
                      marginBottom: '32px'
                    }}>
                      <div>
                        <p style={{
                          fontSize: '12px',
                          opacity: 0.7,
                          margin: '0 0 8px 0',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          fontWeight: '600'
                        }}>Membership Started</p>
                        <p style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          margin: '0',
                          color: 'white'
                        }}>
                          {formatDate(memberData?.membership_start)}
                        </p>
                      </div>
                      <div>
                        <p style={{
                          fontSize: '12px',
                          opacity: 0.7,
                          margin: '0 0 8px 0',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          fontWeight: '600'
                        }}>Renewal Date</p>
                        <p style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          margin: '0',
                          color: 'white'
                        }}>
                          {formatDate(memberData?.membership_end)}
                        </p>
                      </div>
                    </div>

                    {/* Days Counter */}
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '16px',
                      padding: '24px',
                      marginBottom: '32px',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                      <p style={{
                        fontSize: '12px',
                        opacity: 0.8,
                        margin: '0 0 12px 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontWeight: '600'
                      }}>Time Remaining</p>
                      <div style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '12px'
                      }}>
                        <span style={{
                          fontSize: '48px',
                          fontWeight: '800',
                          color: 'white'
                        }}>
                          {daysUntilRenewal !== null ? daysUntilRenewal : '—'}
                        </span>
                        <span style={{
                          fontSize: '18px',
                          opacity: 0.8,
                          fontWeight: '600'
                        }}>
                          {daysUntilRenewal !== null && daysUntilRenewal >= 0 ? 'Days' : 'Expired'}
                        </span>
                      </div>
                    </div>


                  </div>
                </div>
              </section>

              {/* Quick Stats */}
              <div style={{
                gridColumn: '1 / -1',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px'
              }}>
                <div style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #f0f0f0',
                  transition: 'all 0.3s ease'
                }}>
                  <p style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    margin: '0 0 12px 0',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Status</p>
                  <p style={{
                    fontSize: '24px',
                    fontWeight: '800',
                    color: membershipStatus === 'expired' 
                      ? '#DC2626'
                      : membershipStatus === 'expiring'
                      ? '#F59E0B'
                      : '#10B981',
                    margin: '0'
                  }}>
                    {membershipStatus === 'expired' && 'Inactive'}
                    {membershipStatus === 'expiring' && 'Expiring'}
                    {membershipStatus === 'active' && 'Active'}
                  </p>
                </div>

                <div style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #f0f0f0',
                  transition: 'all 0.3s ease'
                }}>
                  <p style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    margin: '0 0 12px 0',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Member Since</p>
                  <p style={{
                    fontSize: '20px',
                    fontWeight: '800',
                    color: '#111827',
                    margin: '0'
                  }}>
                    {memberData?.membership_start ? new Date(memberData.membership_start).getFullYear() : 'N/A'}
                  </p>
                </div>

                <div style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #f0f0f0',
                  transition: 'all 0.3s ease'
                }}>
                  <p style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    margin: '0 0 12px 0',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Contact</p>
                  <p style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#111827',
                    margin: '0'
                  }}>
                    {memberData?.contact_number || 'N/A'}
                  </p>
                </div>
              </div>
            </div>


          </>
        );

      case "profile":
        return <Profile />;

      case "membership":
        return <Membership setActivePage={setActivePage} />;

      case "session":
        return <Sessions />;

      case "classes":
        return <Classes />;

      case "workouts":
        return <Workout />;

      case "userlogs":
        return <UserLogs />;

      case "payment":
        return <Payment />;

      default:
        return null;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: '#F8F9FA' }}>
      <Sidebar setActivePage={setActivePage} activePage={activePage} />
      
      <div style={{ 
        marginLeft: "260px", 
        padding: "40px", 
        width: "calc(100% - 260px)",
        minHeight: '100vh'
      }}>
        {renderPage()}
      </div>
    </div>
  );
}

export default Dashboard;