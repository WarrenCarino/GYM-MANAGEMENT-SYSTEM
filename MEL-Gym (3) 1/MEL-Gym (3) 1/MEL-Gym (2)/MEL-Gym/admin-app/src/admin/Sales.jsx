import React from "react";
import { StatCard, LineChart, ChartContainer } from "./ChartsComponents";

export default function Sales() {
  const salesData = [
    { month: "Jan", sales: 45000 },
    { month: "Feb", sales: 52000 },
    { month: "Mar", sales: 48000 },
    { month: "Apr", sales: 61000 },
    { month: "May", sales: 55000 },
    { month: "Jun", sales: 67000 },
    { month: "Jul", sales: 72000 },
    { month: "Aug", sales: 69000 },
  ];

  return (
    <>
      {/* Header */}
      <div
        style={{
          marginBottom: "2.5rem",
          background: "linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)",
          border: "1px solid #E5E7EB",
          borderRadius: "1.5rem",
          padding: "2rem 2.5rem",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h1 style={{ fontSize: "2.25rem", fontWeight: "800", color: "#111827" }}>
          Sales Overview
        </h1>
        <p style={{ color: "#6B7280", fontSize: "1rem" }}>
          Analyze gym membership and product sales over time.
        </p>
      </div>

      {/* Chart Section */}
      <ChartContainer title="Sales Performance" icon="💰" iconBg="linear-gradient(135deg,#B8860B,#D4AF37)">
        <LineChart data={salesData} />
      </ChartContainer>

      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1.75rem",
          marginTop: "2.5rem",
        }}
      >
        <StatCard
          stat={{
            title: "Total Sales",
            value: "₱449,000",
            change: "+12.5%",
            icon: "📈",
            gradient: "from-amber-500 to-yellow-600",
          }}
        />
        <StatCard
          stat={{
            title: "Average Monthly",
            value: "₱64,000",
            change: "+4.8%",
            icon: "💹",
            gradient: "from-emerald-700 to-teal-800",
          }}
        />
      </div>
    </>
  );
}
