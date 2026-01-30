import React, { useState, useEffect, useRef } from "react";

// -------------------- 📊 Stat Card --------------------
export const StatCard = ({ stat }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)',
        border: '1px solid #E5E7EB',
        borderRadius: '0.875rem',
        padding: '1rem',
        boxShadow: isHovered
          ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '80px',
        height: '80px',
        background: `radial-gradient(circle at top right, ${stat.gradient.includes('amber') ? 'rgba(212, 175, 55, 0.08)' : 'rgba(4, 120, 87, 0.08)'}, transparent 70%)`,
        pointerEvents: 'none'
      }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', position: 'relative' }}>
        <div style={{
          background: `linear-gradient(135deg, ${stat.gradient.includes('amber') ? '#B8860B, #D4AF37' : '#047857, #059669'})`,
          padding: '0.5rem',
          borderRadius: '0.75rem',
          fontSize: '1.25rem',
          width: '2.5rem',
          height: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease',
          transform: isHovered ? 'rotate(-8deg) scale(1.1)' : 'rotate(0deg) scale(1)'
        }}>
          {stat.icon}
        </div>
        <span style={{
          fontSize: '0.7rem',
          fontWeight: '700',
          color: '#059669',
          background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)',
          padding: '0.25rem 0.6rem',
          borderRadius: '9999px',
          boxShadow: '0 2px 4px rgba(5, 150, 105, 0.1)'
        }}>
          {stat.change}
        </span>
      </div>
      <h3 style={{
        color: '#9CA3AF',
        fontSize: '0.6rem',
        fontWeight: '700',
        marginBottom: '0.4rem',
        textTransform: 'uppercase',
        letterSpacing: '0.1em'
      }}>
        {stat.title}
      </h3>
      <p style={{
        fontSize: '1.5rem',
        fontWeight: '800',
        color: '#111827',
        margin: 0,
        letterSpacing: '-0.02em'
      }}>
        {stat.value}
      </p>
    </div>
  );
};

// -------------------- 📈 Line Chart --------------------
export const LineChart = ({ data }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    ctx.clearRect(0, 0, width, height);
    const maxSales = Math.max(...data.map(d => d.sales));
    const minSales = Math.min(...data.map(d => d.sales));
    const range = maxSales - minSales;

    // Grid lines
    ctx.strokeStyle = "rgba(229,231,235,0.6)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (height - 2 * padding) * (i / 5);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, "rgba(212,175,55,0.3)");
    gradient.addColorStop(1, "rgba(212,175,55,0)");
    ctx.beginPath();
    data.forEach((point, i) => {
      const x = padding + (width - 2 * padding) * (i / (data.length - 1));
      const y = height - padding - ((point.sales - minSales) / range) * (height - 2 * padding);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#D4AF37";
    ctx.lineWidth = 2;
    ctx.stroke();

    data.forEach((point, i) => {
      const x = padding + (width - 2 * padding) * (i / (data.length - 1));
      const y = height - padding - ((point.sales - minSales) / range) * (height - 2 * padding);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#B8860B";
      ctx.fill();
    });
  }, [data]);

  return <canvas ref={canvasRef} width={500} height={220} style={{ width: "100%", height: "auto" }} />;
};

// -------------------- 📊 Bar Chart --------------------
export const BarChart = ({ data, vertical = false }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    const padding = 50;

    if (vertical) {
      const maxValue = Math.max(...data.map(d => d.users || d.count));
      const barHeight = 35;
      data.forEach((item, i) => {
        const value = item.users || item.count;
        const barWidth = ((width - 180) * value) / maxValue;
        const y = 40 + i * (barHeight + 20);
        const gradient = ctx.createLinearGradient(padding, 0, padding + barWidth, 0);
        gradient.addColorStop(0, "#9A7D0A");
        gradient.addColorStop(1, "#FFD700");
        ctx.fillStyle = gradient;
        ctx.fillRect(padding, y, barWidth, barHeight);
        ctx.fillStyle = "#111827";
        ctx.font = "bold 12px system-ui";
        ctx.fillText(item.category || item.type, 15, y + barHeight / 2 + 4);
      });
    } else {
      const maxValue = Math.max(...data.map(d => d.count));
      const barWidth = (width - 2 * padding) / data.length - 18;
      data.forEach((item, i) => {
        const value = item.count;
        const barHeight = ((height - 2 * padding - 30) * value) / maxValue;
        const x = padding + i * (barWidth + 18);
        const y = height - padding - barHeight - 15;
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, "#FFD700");
        gradient.addColorStop(1, "#B8860B");
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);
      });
    }
  }, [data, vertical]);
  return <canvas ref={canvasRef} width={600} height={250} style={{ width: "100%", height: "auto" }} />;
};

// -------------------- 📦 Chart Container --------------------
export const ChartContainer = ({ title, icon, iconBg, children }) => (
  <div
    style={{
      background: "linear-gradient(135deg, #FFFFFF 0%, #FAFAFA 100%)",
      border: "1px solid #E5E7EB",
      borderRadius: "1rem",
      padding: "1.25rem",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      marginBottom: "1.5rem",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
      <div style={{
        background: iconBg,
        padding: "0.5rem",
        borderRadius: "0.75rem",
        fontSize: "1.25rem",
        width: "2.5rem",
        height: "2.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        {icon}
      </div>
      <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#111827" }}>{title}</h2>
    </div>
    {children}
  </div>
);

// -------------------- ⚡ Activity Item --------------------
export const ActivityItem = ({ activity }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem',
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '0.75rem'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{
        background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
        padding: '0.5rem',
        borderRadius: '0.5rem',
        fontSize: '1rem'
      }}>
        {activity.icon}
      </div>
      <span style={{ fontWeight: '600', color: '#111827', fontSize: '0.875rem' }}>
        {activity.text}
      </span>
    </div>
    <span style={{
      fontSize: '0.75rem',
      color: '#6B7280',
      fontWeight: '600',
      background: 'rgba(243,244,246,0.8)',
      padding: '0.25rem 0.6rem',
      borderRadius: '9999px'
    }}>
      {activity.time}
    </span>
  </div>
);