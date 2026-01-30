import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChartBar, FaUsers, FaShoppingCart, FaBox, FaArrowRight } from 'react-icons/fa';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    transactionsToday: 0,
    activeMembers: 0,
    totalInventoryValue: 0,
    lowStockItems: 0,
    outOfStock: 0,
    currentPresent: 0,
    maxCapacity: 50
  });
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');

  // Environment-based API URL for deployment
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);
      updateGreeting(now);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const updateGreeting = (currentTime) => {
    const hour = currentTime.getHours();
    if (hour < 12) {
      setGreeting('Good Morning ☀️');
    } else if (hour < 18) {
      setGreeting('Good Afternoon 😊');
    } else {
      setGreeting('Good Evening 🌙');
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    updateGreeting(new Date());
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Fetch transactions today
      const transResponse = await fetch(`${API_BASE_URL}/api/transactions`);
      const transData = await transResponse.json();
      const todayDate = new Date().toISOString().split('T')[0];
      const todayTrans = transData.filter(t => {
        const txDate = new Date(t.transaction_datetime).toISOString().split('T')[0];
        return txDate === todayDate;
      });

      // Fetch members
      const membersResponse = await fetch(`${API_BASE_URL}/api/members`);
      const membersData = await membersResponse.json();
      const activeMembers = membersData.filter(m => m.status === 'active').length;

      // Fetch products
      const productsResponse = await fetch(`${API_BASE_URL}/api/products`);
      const productsData = await productsResponse.json();
      const inventoryValue = productsData.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0);
      const lowStock = productsData.filter(p => p.stock_quantity < 5 && p.stock_quantity > 0).length;
      const outOfStock = productsData.filter(p => p.stock_quantity === 0).length;

      // Fetch attendance - get current present count
      const attendResponse = await fetch(`${API_BASE_URL}/api/attendance/today`);
      const attendData = await attendResponse.json();
      const currentPresent = attendData.currentPresent || 0;
      
      // Fetch max capacity
      const capacityResponse = await fetch(`${API_BASE_URL}/api/attendance/capacity`);
      const capacityData = await capacityResponse.json();
      const maxCapacity = capacityData.maxCapacity || 50;

      setStats({
        transactionsToday: todayTrans.length,
        activeMembers,
        totalInventoryValue: inventoryValue,
        lowStockItems: lowStock,
        outOfStock,
        currentPresent,
        maxCapacity
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setLoading(false);
    }
  };

  const formatTime = () => {
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = () => {
    return time.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const capacityPercentage = (stats.currentPresent / stats.maxCapacity) * 100;
  const capacityStatus = stats.currentPresent >= stats.maxCapacity ? 'danger' : 
                         stats.currentPresent >= stats.maxCapacity * 0.7 ? 'warning' : 'success';

  const handleQuickAction = (path) => {
    navigate(path);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.greeting}>{greeting}</h1>
          <p style={styles.date}>{formatDate()}</p>
          <h2 style={styles.time}>{formatTime()}</h2>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div style={styles.statsGrid}>
        {/* Transactions Today */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <FaShoppingCart style={styles.icon} />
            <span style={styles.cardLabel}>Transactions Today</span>
          </div>
          <div style={{ ...styles.cardValue, color: '#0d6efd' }}>
            {loading ? '...' : stats.transactionsToday}
          </div>
          <p style={styles.cardDesc}>Completed payments</p>
        </div>

        {/* Active Members */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <FaUsers style={styles.icon} />
            <span style={styles.cardLabel}>Active Members</span>
          </div>
          <div style={{ ...styles.cardValue, color: '#28a745' }}>
            {loading ? '...' : stats.activeMembers}
          </div>
          <p style={styles.cardDesc}>Valid memberships</p>
        </div>

        {/* Gym Capacity */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <FaUsers style={styles.icon} />
            <span style={styles.cardLabel}>Gym Capacity</span>
          </div>
          <div style={{ ...styles.cardValue, color: capacityStatus === 'danger' ? '#dc3545' : capacityStatus === 'warning' ? '#ffc107' : '#28a745' }}>
            {loading ? '...' : `${stats.currentPresent}/${stats.maxCapacity}`}
          </div>
          <div style={styles.capacityBar}>
            <div style={{ ...styles.capacityFill, width: `${capacityPercentage}%`, backgroundColor: capacityStatus === 'danger' ? '#dc3545' : capacityStatus === 'warning' ? '#ffc107' : '#28a745' }}></div>
          </div>
          <p style={{...styles.cardDesc, marginTop: '8px'}}>
            {capacityStatus === 'danger' ? '⚠️ At capacity' : capacityStatus === 'warning' ? '⚠️ Nearly full' : '✅ Space available'}
          </p>
        </div>

        {/* Inventory Value */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <FaBox style={styles.icon} />
            <span style={styles.cardLabel}>Inventory Value</span>
          </div>
          <div style={{ ...styles.cardValue, color: '#0d6efd' }}>
            ₱{loading ? '...' : stats.totalInventoryValue.toLocaleString()}
          </div>
          <p style={styles.cardDesc}>Total stock value</p>
        </div>

        {/* Low Stock Items */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <FaChartBar style={styles.icon} />
            <span style={styles.cardLabel}>Low Stock Items</span>
          </div>
          <div style={{ ...styles.cardValue, color: '#ff9800' }}>
            {loading ? '...' : stats.lowStockItems}
          </div>
          <p style={styles.cardDesc}>Need reordering soon</p>
        </div>

        {/* Out of Stock */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <FaChartBar style={styles.icon} />
            <span style={styles.cardLabel}>Out of Stock</span>
          </div>
          <div style={{ ...styles.cardValue, color: '#dc3545' }}>
            {loading ? '...' : stats.outOfStock}
          </div>
          <p style={styles.cardDesc}>Unavailable items</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.quickActions}>
        <h3 style={styles.quickActionsTitle}>⚡ Quick Actions</h3>
        <div style={styles.actionButtonsGrid}>
          <button 
            onClick={() => handleQuickAction('/payments')}
            style={{ ...styles.actionButton, backgroundColor: '#0d6efd' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <FaShoppingCart style={{ marginRight: '8px' }} />
            New Transaction
            <FaArrowRight style={{ marginLeft: 'auto' }} />
          </button>
          <button 
            onClick={() => handleQuickAction('/reportsgeneration')}
            style={{ ...styles.actionButton, backgroundColor: '#28a745' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <FaChartBar style={{ marginRight: '8px' }} />
            View Reports
            <FaArrowRight style={{ marginLeft: 'auto' }} />
          </button>
          <button 
            onClick={() => handleQuickAction('/inventory')}
            style={{ ...styles.actionButton, backgroundColor: '#ff9800' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <FaBox style={{ marginRight: '8px' }} />
            Check Inventory
            <FaArrowRight style={{ marginLeft: 'auto' }} />
          </button>
          <button 
            onClick={() => handleQuickAction('/rfid')}
            style={{ ...styles.actionButton, backgroundColor: '#17a2b8' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <FaUsers style={{ marginRight: '8px' }} />
            RFID Management
            <FaArrowRight style={{ marginLeft: 'auto' }} />
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '32px 24px',
    backgroundColor: '#f5f7fa',
    minHeight: '100vh'
  },
  header: {
    marginBottom: '32px'
  },
  greeting: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 8px 0'
  },
  date: {
    fontSize: '16px',
    color: '#6b7280',
    margin: '0 0 16px 0'
  },
  time: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#0d6efd',
    margin: 0
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px'
  },
  icon: {
    fontSize: '24px',
    color: '#6b7280'
  },
  cardLabel: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500'
  },
  cardValue: {
    fontSize: '36px',
    fontWeight: 'bold',
    marginBottom: '8px'
  },
  cardDesc: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: 0
  },
  capacityBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '8px'
  },
  capacityFill: {
    height: '100%',
    transition: 'width 0.3s ease'
  },
  quickActions: {
    marginTop: '32px'
  },
  quickActionsTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 16px 0'
  },
  actionButtonsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px'
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 20px',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }
};

export default Dashboard;