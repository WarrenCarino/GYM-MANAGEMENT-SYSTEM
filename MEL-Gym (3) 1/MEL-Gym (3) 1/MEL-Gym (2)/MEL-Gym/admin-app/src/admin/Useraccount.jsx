import React, { useEffect, useState } from "react";
import { ChartContainer, BarChart, StatCard } from "./ChartsComponents";

export default function Useraccounts() {
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({ weekly: [], monthly: [], walkin: 0, inactive: 0, expired: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch members for table
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/members");
        const data = await res.json();
        setMembers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching members:", err);
        setMembers([]);
      }
    };
    fetchMembers();
  }, []);

  // Fetch weekly/monthly stats
  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const res = await fetch("http://localhost:8000/api/members/stats");
        const data = await res.json();
        setStats({
          weekly: data.weekly || [],
          monthly: data.monthly || [],
          walkin: data.walkin || 0,
          inactive: data.inactive || 0,
          expired: data.expired || 0
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
        setStats({ weekly: [], monthly: [], walkin: 0, inactive: 0, expired: 0 });
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const totalMembers = members?.length || 0;
  const activeMembers = members?.filter((m) => m?.status?.toLowerCase() === "active")?.length || 0;
  
  // Calculate expired members (membership_end date has passed)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expiredMembers = members?.filter((m) => {
    if (!m?.membership_end) return false;
    try {
      // Parse date as UTC to avoid timezone issues
      const endDateStr = String(m.membership_end).split('T')[0]; // Get YYYY-MM-DD part only
      const [year, month, day] = endDateStr.split('-').map(Number);
      const endDate = new Date(year, month - 1, day); // Local date
      endDate.setHours(0, 0, 0, 0);
      
      console.log('Checking member:', m.member_name, 'End date:', endDateStr, 'Parsed:', endDate, 'Today:', today, 'Expired:', endDate < today);
      
      return endDate < today;
    } catch (err) {
      console.error('Error parsing date for member:', m.member_name, err);
      return false;
    }
  })?.length || 0;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA");
  };

  // Calculate weekly and monthly totals
  const weeklyTotal = stats.weekly.reduce((sum, item) => sum + (item.users || 0), 0);
  const monthlyTotal = stats.monthly.reduce((sum, item) => sum + (item.users || 0), 0);

  // Get recent weeks/months data
  const recentWeeks = stats.weekly.slice(-4);
  const recentMonths = stats.monthly.slice(-3);

  // Transform stats to chart-friendly format
  const weeklyChartData = stats.weekly.map(item => ({
    category: `Week ${item.week}`,
    users: item.users
  }));

  const monthlyChartData = stats.monthly.map(item => ({
    category: `Month ${item.month}`,
    users: item.users
  }));

  return (
    <div style={{ padding: "2rem", background: "#F9FAFB", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        marginBottom: "2.5rem",
        background: "linear-gradient(135deg, #FFFFFF, #F9FAFB)",
        border: "1px solid #E5E7EB",
        borderRadius: "1.5rem",
        padding: "2rem 2.5rem",
        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
      }}>
        <h1 style={{ fontSize: "2.25rem", fontWeight: "800", color: "#111827", marginBottom: "0.5rem" }}>
          Member Accounts
        </h1>
        <p style={{ color: "#6B7280", fontSize: "1rem" }}>
          Overview of all gym members and account statuses
        </p>
      </div>

      {/* Primary Stats Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "1.75rem",
        marginBottom: "2.5rem",
      }}>
        {/* Total Members Card */}
        <div style={{
          background: "linear-gradient(135deg, #059669, #047857)",
          borderRadius: "1.25rem",
          padding: "2rem",
          color: "#FFFFFF",
          boxShadow: "0 10px 15px -3px rgba(5, 150, 105, 0.3)",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>👤</div>
            <h3 style={{ fontSize: "0.875rem", fontWeight: "600", opacity: 0.9, marginBottom: "0.5rem" }}>
              Total Members
            </h3>
            <p style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "0.5rem" }}>
              {totalMembers}
            </p>
            <p style={{ fontSize: "0.875rem", opacity: 0.8 }}>All registered members</p>
          </div>
          <div style={{
            position: "absolute",
            bottom: "-20px",
            right: "-20px",
            fontSize: "8rem",
            opacity: 0.1
          }}>👤</div>
        </div>

        {/* Active Plans Card */}
        <div style={{
          background: "linear-gradient(135deg, #F59E0B, #D97706)",
          borderRadius: "1.25rem",
          padding: "2rem",
          color: "#FFFFFF",
          boxShadow: "0 10px 15px -3px rgba(245, 158, 11, 0.3)",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🏋️</div>
            <h3 style={{ fontSize: "0.875rem", fontWeight: "600", opacity: 0.9, marginBottom: "0.5rem" }}>
              Active Plans
            </h3>
            <p style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "0.5rem" }}>
              {activeMembers}
            </p>
            <p style={{ fontSize: "0.875rem", opacity: 0.8 }}>Currently active</p>
          </div>
          <div style={{
            position: "absolute",
            bottom: "-20px",
            right: "-20px",
            fontSize: "8rem",
            opacity: 0.1
          }}>🏋️</div>
        </div>

        {/* Expired Plans Card */}
        <div style={{
          background: "linear-gradient(135deg, #DC2626, #B91C1C)",
          borderRadius: "1.25rem",
          padding: "2rem",
          color: "#FFFFFF",
          boxShadow: "0 10px 15px -3px rgba(220, 38, 38, 0.3)",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>⏰</div>
            <h3 style={{ fontSize: "0.875rem", fontWeight: "600", opacity: 0.9, marginBottom: "0.5rem" }}>
              Expired Plans
            </h3>
            <p style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "0.5rem" }}>
              {expiredMembers}
            </p>
            <p style={{ fontSize: "0.875rem", opacity: 0.8 }}>Needs renewal</p>
          </div>
          <div style={{
            position: "absolute",
            bottom: "-20px",
            right: "-20px",
            fontSize: "8rem",
            opacity: 0.1
          }}>⏰</div>
        </div>
      </div>

      {/* Combined Activity Section - Weekly & Monthly */}
      <div style={{
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: "1.25rem",
        padding: "2rem",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        marginBottom: "2.5rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "2rem" }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #B8860B, #D4AF37)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            marginRight: "1rem"
          }}>📊</div>
          <div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#111827" }}>
              Membership Activity
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#6B7280" }}>Weekly and monthly distribution</p>
          </div>
        </div>

        {/* Three Statistics Side by Side */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem"
        }}>
          {/* Weekly Statistics */}
          <div style={{ 
            background: "linear-gradient(135deg, #F9FAFB, #FFFFFF)", 
            borderRadius: "12px", 
            padding: "2rem",
            border: "1px solid #E5E7EB"
          }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem" }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #B8860B, #D4AF37)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.25rem",
                marginRight: "0.75rem"
              }}>📅</div>
              <div>
                <h4 style={{ fontSize: "1.125rem", fontWeight: "700", color: "#111827" }}>
                  Weekly Accounts
                </h4>
                <p style={{ fontSize: "0.75rem", color: "#6B7280" }}>Last 4 weeks</p>
              </div>
            </div>
            <div style={{ 
              textAlign: "center",
              padding: "1.5rem 0"
            }}>
              <p style={{ fontSize: "3.5rem", fontWeight: "800", color: "#111827", lineHeight: 1 }}>
                {weeklyTotal}
              </p>
              <p style={{ fontSize: "0.875rem", color: "#6B7280", marginTop: "0.5rem" }}>
                Total accounts
              </p>
            </div>
          </div>

          {/* Monthly Statistics */}
          <div style={{ 
            background: "linear-gradient(135deg, #F9FAFB, #FFFFFF)", 
            borderRadius: "12px", 
            padding: "2rem",
            border: "1px solid #E5E7EB"
          }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem" }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #4B5563, #9CA3AF)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.25rem",
                marginRight: "0.75rem"
              }}>📆</div>
              <div>
                <h4 style={{ fontSize: "1.125rem", fontWeight: "700", color: "#111827" }}>
                  Monthly Accounts
                </h4>
                <p style={{ fontSize: "0.75rem", color: "#6B7280" }}>Last 3 months</p>
              </div>
            </div>
            <div style={{ 
              textAlign: "center",
              padding: "1.5rem 0"
            }}>
              <p style={{ fontSize: "3.5rem", fontWeight: "800", color: "#111827", lineHeight: 1 }}>
                {monthlyTotal}
              </p>
              <p style={{ fontSize: "0.875rem", color: "#6B7280", marginTop: "0.5rem" }}>
                Total accounts
              </p>
            </div>
          </div>

          {/* Inactive Accounts */}
          <div style={{ 
            background: "linear-gradient(135deg, #F9FAFB, #FFFFFF)", 
            borderRadius: "12px", 
            padding: "2rem",
            border: "1px solid #E5E7EB"
          }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem" }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #6B7280, #9CA3AF)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.25rem",
                marginRight: "0.75rem"
              }}>🔒</div>
              <div>
                <h4 style={{ fontSize: "1.125rem", fontWeight: "700", color: "#111827" }}>
                  Inactive Accounts
                </h4>
                <p style={{ fontSize: "0.75rem", color: "#6B7280" }}>Status: Inactive</p>
              </div>
            </div>
            <div style={{ 
              textAlign: "center",
              padding: "1.5rem 0"
            }}>
              <p style={{ fontSize: "3.5rem", fontWeight: "800", color: "#111827", lineHeight: 1 }}>
                {members?.filter((m) => m?.status === "inactive")?.length || 0}
              </p>
              <p style={{ fontSize: "0.875rem", color: "#6B7280", marginTop: "0.5rem" }}>
                Manually deactivated
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div style={{
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: "1.25rem",
        padding: "2rem",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      }}>
        <h2 style={{ 
          fontSize: "1.5rem", 
          fontWeight: "800", 
          color: "#111827", 
          marginBottom: "1.5rem" 
        }}>
          Members Directory
        </h2>

        <div style={{ overflowX: "auto" }}>
          <table style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: "0",
          }}>
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                {["ID", "RFID", "Name", "Contact", "Email", "Address", "Type", "Start", "End", "Status"].map((h) => (
                  <th key={h} style={{ 
                    padding: "1rem 0.75rem", 
                    fontSize: "0.75rem", 
                    fontWeight: "800", 
                    color: "#6B7280", 
                    textTransform: "uppercase", 
                    letterSpacing: "0.05em",
                    textAlign: "left",
                    borderBottom: "2px solid #E5E7EB"
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((m, idx) => {
                // Check if membership has expired
                const isExpired = (() => {
                  if (!m?.membership_end) return false;
                  // Parse date as UTC to avoid timezone issues
                  const endDateStr = m.membership_end.split('T')[0]; // Get YYYY-MM-DD part only
                  const [year, month, day] = endDateStr.split('-').map(Number);
                  const endDate = new Date(year, month - 1, day);
                  endDate.setHours(0, 0, 0, 0);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return endDate < today;
                })();

                return (
                  <tr key={m.id} style={{ 
                    borderBottom: "1px solid #F3F4F6",
                    transition: "background 0.2s ease",
                    background: isExpired ? "#FEF2F2" : "transparent"
                  }}>
                    <td style={{ padding: "1rem 0.75rem", fontSize: "0.875rem", color: "#111827", fontWeight: "600" }}>{m.id}</td>
                    <td style={{ padding: "1rem 0.75rem", fontSize: "0.875rem", color: "#6B7280" }}>{m.rfid}</td>
                    <td style={{ padding: "1rem 0.75rem", fontSize: "0.875rem", color: "#111827", fontWeight: "600" }}>{m.member_name}</td>
                    <td style={{ padding: "1rem 0.75rem", fontSize: "0.875rem", color: "#6B7280" }}>{m.contact_number}</td>
                    <td style={{ padding: "1rem 0.75rem", fontSize: "0.875rem", color: "#6B7280" }}>{m.email}</td>
                    <td style={{ padding: "1rem 0.75rem", fontSize: "0.875rem", color: "#6B7280" }}>{m.address}</td>
                    <td style={{ padding: "1rem 0.75rem", fontSize: "0.875rem", color: "#6B7280" }}>{m.membership_type}</td>
                    <td style={{ padding: "1rem 0.75rem", fontSize: "0.875rem", color: "#6B7280" }}>{formatDate(m.membership_start)}</td>
                    <td style={{ padding: "1rem 0.75rem", fontSize: "0.875rem", color: isExpired ? "#DC2626" : "#6B7280", fontWeight: isExpired ? "600" : "normal" }}>
                      {formatDate(m.membership_end)}
                      {isExpired && <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem" }}>⏰</span>}
                    </td>
                    <td style={{ padding: "1rem 0.75rem" }}>
                      <span style={{
                        display: "inline-block",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "9999px",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        background: m.status === "active" ? "#D1FAE5" : "#FEE2E2",
                        color: m.status === "active" ? "#059669" : "#DC2626"
                      }}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}