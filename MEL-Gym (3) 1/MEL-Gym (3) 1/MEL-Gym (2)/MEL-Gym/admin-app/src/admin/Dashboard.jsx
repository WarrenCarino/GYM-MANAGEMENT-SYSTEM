import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalMembers: 0,
    activeMembers: 0,
    expiredMembers: 0,
    inactiveMembers: 0,
    totalTrainers: 0,
    activeTrainers: 0,
    totalStaff: 0,
    pendingSessions: 0,
    pendingClasses: 0,
    approvedSessions: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    recentTransactions: [],
    recentSessions: [],
    topProducts: [],
    currentPresent: 0,
    walkinCount: 0
  });
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:8000";

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [
        membersRes,
        trainersRes,
        staffRes,
        sessionsRes,
        classesRes,
        productsRes,
        transactionsRes,
        attendanceTodayRes
      ] = await Promise.allSettled([
        fetch(`${API_URL}/api/members`),
        fetch(`${API_URL}/api/trainers/all`),
        fetch(`${API_URL}/api/staff/all`),
        fetch(`${API_URL}/api/sessions`),
        fetch(`${API_URL}/api/classes`),
        fetch(`${API_URL}/api/products`),
        fetch(`${API_URL}/api/transactions`),
        fetch(`${API_URL}/api/attendance/today`)
      ]);

      let members = [];
      let trainers = [];
      let staff = [];
      let sessions = [];
      let classes = [];
      let products = [];
      let transactions = [];
      let attendanceToday = 0;

      if (membersRes.status === "fulfilled" && membersRes.value.ok) {
        members = await membersRes.value.json();
      }
      if (trainersRes.status === "fulfilled" && trainersRes.value.ok) {
        const trainerData = await trainersRes.value.json();
        trainers = trainerData.trainers || trainerData;
      }
      if (staffRes.status === "fulfilled" && staffRes.value.ok) {
        staff = await staffRes.value.json();
      }
      if (sessionsRes.status === "fulfilled" && sessionsRes.value.ok) {
        sessions = await sessionsRes.value.json();
      }
      if (classesRes.status === "fulfilled" && classesRes.value.ok) {
        classes = await classesRes.value.json();
      }
      if (productsRes.status === "fulfilled" && productsRes.value.ok) {
        products = await productsRes.value.json();
      }
      if (transactionsRes.status === "fulfilled" && transactionsRes.value.ok) {
        transactions = await transactionsRes.value.json();
      }
      if (attendanceTodayRes.status === "fulfilled" && attendanceTodayRes.value.ok) {
        const data = await attendanceTodayRes.value.json();
        attendanceToday = data.currentPresent || 0;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const expiredCount = members?.filter((m) => {
        if (!m?.membership_end) return false;
        const endDateStr = String(m.membership_end).split('T')[0];
        const [year, month, day] = endDateStr.split('-').map(Number);
        const endDate = new Date(year, month - 1, day);
        endDate.setHours(0, 0, 0, 0);
        return endDate < today;
      })?.length || 0;

      const lowStockProducts = products?.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5)?.length || 0;
      const topProducts = products || [];

      setDashboardData({
        totalMembers: members?.length || 0,
        activeMembers: members?.filter((m) => m?.status?.toLowerCase() === "active")?.length || 0,
        expiredMembers: expiredCount,
        inactiveMembers: members?.filter((m) => m?.status?.toLowerCase() === "inactive")?.length || 0,
        totalTrainers: trainers?.length || 0,
        activeTrainers: trainers?.filter((t) => t?.status === "Active")?.length || 0,
        totalStaff: staff?.length || 0,
        pendingSessions: sessions?.filter((s) => !s.status || s.status === "pending")?.length || 0,
        pendingClasses: classes?.filter((c) => !c.status || c.status === "pending")?.length || 0,
        approvedSessions: sessions?.filter((s) => s.status === "approved")?.length || 0,
        totalProducts: products?.length || 0,
        lowStockProducts: lowStockProducts,
        recentTransactions: transactions?.slice(-5)?.reverse() || [],
        recentSessions: sessions?.slice(-5)?.reverse() || [],
        topProducts: topProducts,
        currentPresent: attendanceToday,
        walkinCount: 0
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <div style={{ fontSize: "18px", color: "#666" }}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ marginLeft: "0" }}>
      {/* HEADER */}
      <div
        style={{
          marginBottom: "2.5rem",
          background: "linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)",
          border: "1px solid #E5E7EB",
          borderRadius: "1.5rem",
          padding: "2rem 2.5rem",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: "300px",
            height: "300px",
            background: "radial-gradient(circle, rgba(212, 175, 55, 0.08), transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1
            style={{
              fontSize: "2.25rem",
              fontWeight: "800",
              background: "linear-gradient(135deg, #111827 0%, #374151 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: "0 0 0.5rem 0",
              letterSpacing: "-0.02em",
            }}
          >
            🏋️ Dashboard Overview
          </h1>
          <p
            style={{
              color: "#6B7280",
              fontSize: "1rem",
              margin: 0,
              fontWeight: "500",
            }}
          >
            Track your gym's performance in real-time • Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
      </div>

      {/* KEY METRICS GRID */}
      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#6B7280", margin: "0 0 1rem 0", textTransform: "uppercase" }}>
          📊 Member Metrics
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
          <div style={{ background: "#fff", borderRadius: "0.75rem", padding: "1.5rem", border: "1px solid #e5e7eb", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280", fontWeight: "600" }}>Total Members</h3>
            <p style={{ margin: "0.5rem 0 0 0", fontSize: "2.5rem", fontWeight: 800, color: "#111827" }}>{dashboardData.totalMembers}</p>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#9CA3AF" }}>All registered</p>
          </div>

          <div style={{ background: "#fff", borderRadius: "0.75rem", padding: "1.5rem", border: "1px solid #e5e7eb", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280", fontWeight: "600" }}>Active Members</h3>
            <p style={{ margin: "0.5rem 0 0 0", fontSize: "2.5rem", fontWeight: 800, color: "#10B981" }}>{dashboardData.activeMembers}</p>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#9CA3AF" }}>Currently active</p>
          </div>

          <div style={{ background: "#fff", borderRadius: "0.75rem", padding: "1.5rem", border: "1px solid #e5e7eb", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280", fontWeight: "600" }}>Expired Plans</h3>
            <p style={{ margin: "0.5rem 0 0 0", fontSize: "2.5rem", fontWeight: 800, color: "#EF4444" }}>{dashboardData.expiredMembers}</p>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#9CA3AF" }}>Need renewal</p>
          </div>

          <div style={{ background: "#fff", borderRadius: "0.75rem", padding: "1.5rem", border: "1px solid #e5e7eb", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280", fontWeight: "600" }}>Inactive Members</h3>
            <p style={{ margin: "0.5rem 0 0 0", fontSize: "2.5rem", fontWeight: 800, color: "#8B5CF6" }}>{dashboardData.inactiveMembers}</p>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#9CA3AF" }}>Deactivated</p>
          </div>
        </div>
      </div>

      {/* STAFF & SESSIONS */}
      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#6B7280", margin: "0 0 1rem 0", textTransform: "uppercase" }}>
          👥 Staff & Sessions
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
          <div style={{ background: "#fff", borderRadius: "0.75rem", padding: "1.5rem", border: "1px solid #e5e7eb", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280", fontWeight: "600" }}>Total Trainers</h3>
            <p style={{ margin: "0.5rem 0 0 0", fontSize: "2.5rem", fontWeight: 800, color: "#3B82F6" }}>{dashboardData.totalTrainers}</p>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#9CA3AF" }}>All trainers</p>
          </div>

          <div style={{ background: "#fff", borderRadius: "0.75rem", padding: "1.5rem", border: "1px solid #e5e7eb", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280", fontWeight: "600" }}>Active Trainers</h3>
            <p style={{ margin: "0.5rem 0 0 0", fontSize: "2.5rem", fontWeight: 800, color: "#10B981" }}>{dashboardData.activeTrainers}</p>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#9CA3AF" }}>Available</p>
          </div>

          <div style={{ background: "#fff", borderRadius: "0.75rem", padding: "1.5rem", border: "1px solid #e5e7eb", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280", fontWeight: "600" }}>Staff Members</h3>
            <p style={{ margin: "0.5rem 0 0 0", fontSize: "2.5rem", fontWeight: 800, color: "#F59E0B" }}>{dashboardData.totalStaff}</p>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#9CA3AF" }}>All roles</p>
          </div>

          <div style={{ background: "#fff", borderRadius: "0.75rem", padding: "1.5rem", border: "1px solid #e5e7eb", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280", fontWeight: "600" }}>Pending Sessions</h3>
            <p style={{ margin: "0.5rem 0 0 0", fontSize: "2.5rem", fontWeight: 800, color: "#F59E0B" }}>{dashboardData.pendingSessions}</p>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#9CA3AF" }}>Awaiting approval</p>
          </div>
        </div>
      </div>

      {/* OPERATIONS */}
      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#6B7280", margin: "0 0 1rem 0", textTransform: "uppercase" }}>
          🏢 Operations & Inventory
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
          <div style={{ background: "#fff", borderRadius: "0.75rem", padding: "1.5rem", border: "1px solid #e5e7eb", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280", fontWeight: "600" }}>Currently Present</h3>
            <p style={{ margin: "0.5rem 0 0 0", fontSize: "2.5rem", fontWeight: 800, color: "#8B5CF6" }}>{dashboardData.currentPresent}</p>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#9CA3AF" }}>In gym today</p>
          </div>

          <div style={{ background: "#fff", borderRadius: "0.75rem", padding: "1.5rem", border: "1px solid #e5e7eb", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280", fontWeight: "600" }}>Total Products</h3>
            <p style={{ margin: "0.5rem 0 0 0", fontSize: "2.5rem", fontWeight: 800, color: "#3B82F6" }}>{dashboardData.totalProducts}</p>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#9CA3AF" }}>Inventory items</p>
          </div>

          <div style={{ background: "#fff", borderRadius: "0.75rem", padding: "1.5rem", border: "1px solid #e5e7eb", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280", fontWeight: "600" }}>Low Stock</h3>
            <p style={{ margin: "0.5rem 0 0 0", fontSize: "2.5rem", fontWeight: 800, color: "#EF4444" }}>{dashboardData.lowStockProducts}</p>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#9CA3AF" }}>Items 5 units or below</p>
          </div>

          <div style={{ background: "#fff", borderRadius: "0.75rem", padding: "1.5rem", border: "1px solid #e5e7eb", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280", fontWeight: "600" }}>Pending Classes</h3>
            <p style={{ margin: "0.5rem 0 0 0", fontSize: "2.5rem", fontWeight: 800, color: "#F59E0B" }}>{dashboardData.pendingClasses}</p>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#9CA3AF" }}>Awaiting approval</p>
          </div>
        </div>
      </div>

      {/* RECENT TRANSACTIONS TABLE */}
      <div style={{ marginBottom: "2.5rem", background: "#fff", borderRadius: "0.75rem", border: "1px solid #e5e7eb", padding: "1.5rem", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem", color: "#374151" }}>💳 Recent Transactions</h2>
        {dashboardData.recentTransactions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#9CA3AF" }}>No recent transactions found</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#1f2937", color: "#fff" }}>
                <th style={{ padding: "10px", textAlign: "left" }}>#</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Member Name</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Product</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Quantity</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Amount</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.recentTransactions.slice(0, 5).map((transaction, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "10px" }}>{transaction.or_number || idx + 1}</td>
                  <td style={{ padding: "10px" }}>{transaction.member_name || "N/A"}</td>
                  <td style={{ padding: "10px" }}>{transaction.product || "N/A"}</td>
                  <td style={{ padding: "10px" }}>{transaction.quantity || 0}</td>
                  <td style={{ padding: "10px", fontWeight: "700", color: "#10B981" }}>₱{parseFloat(transaction.total_amount || 0).toFixed(2)}</td>
                  <td style={{ padding: "10px" }}>{transaction.transaction_datetime ? new Date(transaction.transaction_datetime).toLocaleDateString() : "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ALL PRODUCTS TABLE */}
      <div style={{ marginBottom: "2.5rem", background: "#fff", borderRadius: "0.75rem", border: "1px solid #e5e7eb", padding: "1.5rem", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem", color: "#374151" }}>📦 All Products</h2>
        {dashboardData.topProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#9CA3AF" }}>No products found</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#1f2937", color: "#fff" }}>
                <th style={{ padding: "10px", textAlign: "left" }}>Product Name</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Price</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Stock Quantity</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.topProducts.map((product, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "10px" }}>{product.product_name || "N/A"}</td>
                  <td style={{ padding: "10px" }}>₱{parseFloat(product.price || 0).toFixed(2)}</td>
                  <td style={{ padding: "10px" }}>{product.stock_quantity || 0}</td>
                  <td style={{ padding: "10px" }}>
                    <span
                      style={{
                        background: product.stock_quantity === 0 ? "#FEE2E2" : product.stock_quantity <= 5 ? "#FEF3C7" : "#D1FAE5",
                        color: product.stock_quantity === 0 ? "#991B1B" : product.stock_quantity <= 5 ? "#92400E" : "#065F46",
                        padding: "3px 10px",
                        borderRadius: "5px",
                        fontSize: "0.8rem",
                        fontWeight: "600",
                        textTransform: "capitalize"
                      }}
                    >
                      {product.stock_quantity === 0 ? "Out of Stock" : product.stock_quantity <= 5 ? "Low Stock" : "In Stock"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* REFRESH BUTTON */}
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <button
          onClick={fetchDashboardData}
          style={{ padding: "0.75rem 2rem", background: "#3B82F6", color: "white", border: "none", borderRadius: "0.5rem", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={(e) => {
            e.target.style.background = "#2563EB";
            e.target.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#3B82F6";
            e.target.style.transform = "scale(1)";
          }}
        >
          🔄 Refresh Dashboard
        </button>
      </div>
    </div>
  );
}