import React, { useState, useMemo, useEffect } from "react";
import { StatCard } from "./ChartsComponents";

export default function Reports() {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  // Get date 3 months from now
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 3);
  const threeMonthsLater = futureDate.toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(threeMonthsLater);
  const [filterType, setFilterType] = useState("all");
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch transactions from backend
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/api/transactions");
      
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }
      
      const data = await response.json();
      console.log("📊 Fetched transactions:", data);
      
      // Transform backend data to match frontend format
      const transformedData = data.map((transaction) => ({
        id: transaction.id,
        date: transaction.transaction_datetime ? 
          new Date(transaction.transaction_datetime).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0],
        memberName: transaction.member_name || "Unknown",
        type: determineType(transaction.product, transaction.member_name),
        item: transaction.product || determineItem(transaction.member_name),
        amount: parseFloat(transaction.total_amount) || 0,
        paymentMethod: "Cash", // Default since not in DB
        status: "Paid" // Default since not in DB
      }));
      
      setSalesData(transformedData);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching transactions:", error);
      setLoading(false);
      // Keep empty array if fetch fails
      setSalesData([]);
    }
  };

  // Helper function to determine transaction type
  const determineType = (product, memberName) => {
    // Check if product name contains "Weekly" or "Monthly" - these are memberships
    if (product && (
      product.toLowerCase().includes("weekly") || 
      product.toLowerCase().includes("monthly")
    )) {
      return "Membership";
    }
    
    if (!product || product === "null" || product === null) {
      // Check if it's a membership-related name pattern
      if (memberName && (
        memberName.includes("Membership") || 
        memberName.includes("Plan") ||
        memberName === "Walk-in"
      )) {
        return "Membership";
      }
      return "Membership"; // Default
    }
    return "Product";
  };

  // Helper function to determine item name
  const determineItem = (memberName) => {
    if (memberName === "Walk-in") {
      return "Walk-in Pass";
    }
    // Extract membership type if present
    if (memberName && memberName.includes("Membership")) {
      return memberName;
    }
    return "Membership";
  };

  // Filter sales by date range and type
  const filteredSales = useMemo(() => {
    return salesData.filter(sale => {
      const saleDate = new Date(sale.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      const dateMatch = saleDate >= start && saleDate <= end;
      const typeMatch = filterType === "all" || sale.type === filterType;
      return dateMatch && typeMatch;
    });
  }, [salesData, startDate, endDate, filterType]);

  // Calculate totals by type
  const membershipSales = useMemo(() => {
    return filteredSales
      .filter(sale => sale.type === "Membership")
      .reduce((sum, sale) => sum + sale.amount, 0);
  }, [filteredSales]);

  const productSales = useMemo(() => {
    return filteredSales
      .filter(sale => sale.type === "Product")
      .reduce((sum, sale) => sum + sale.amount, 0);
  }, [filteredSales]);

  const membershipCount = filteredSales.filter(s => s.type === "Membership").length;
  const productCount = filteredSales.filter(s => s.type === "Product").length;

  // Calculate stats from filtered data
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.amount, 0);

  return (
    <>
      {/* Header */}
      <div style={{
        marginBottom: '2.5rem',
        background: 'linear-gradient(135deg,#FFFFFF,#F9FAFB)',
        border: '1px solid #E5E7EB',
        borderRadius: '1.5rem',
        padding: '2rem 2.5rem',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#111827' }}>Sales Reports</h1>
            <p style={{ color: '#6B7280', fontSize: '1rem' }}>
              Track and analyze membership and product sales
            </p>
          </div>
          <button
            onClick={fetchTransactions}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg,#B8860B,#D4AF37)',
              border: 'none',
              borderRadius: '0.75rem',
              color: '#FFF',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '0.875rem',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#6B7280',
          fontSize: '1.125rem',
          fontWeight: '600'
        }}>
          ⏳ Loading transactions...
        </div>
      )}

      {!loading && (
        <>
          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.75rem',
            marginBottom: '2.5rem'
          }}>
            <StatCard stat={{ 
              title: 'Total Sales', 
              value: `₱${totalSales.toLocaleString()}`, 
              change: `${filteredSales.length} transactions`, 
              icon: '💰', 
              gradient: 'from-emerald-500 to-teal-600' 
            }} />
            <StatCard stat={{ 
              title: 'Membership Sales', 
              value: `₱${membershipSales.toLocaleString()}`, 
              change: `${membershipCount} memberships`, 
              icon: '👥', 
              gradient: 'from-blue-500 to-indigo-600' 
            }} />
            <StatCard stat={{ 
              title: 'Product Sales', 
              value: `₱${productSales.toLocaleString()}`, 
              change: `${productCount} products`, 
              icon: '🛍️', 
              gradient: 'from-amber-500 to-yellow-600' 
            }} />
          </div>

          {/* Filters */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', minWidth: '180px' }}>
                <label style={{ 
                  display: 'block',
                  fontWeight: '700', 
                  color: '#374151', 
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem'
                }}>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #D1D5DB',
                    fontWeight: '600',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              
              <div style={{ flex: '1', minWidth: '180px' }}>
                <label style={{ 
                  display: 'block',
                  fontWeight: '700', 
                  color: '#374151', 
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem'
                }}>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #D1D5DB',
                    fontWeight: '600',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div style={{ flex: '1', minWidth: '180px' }}>
                <label style={{ 
                  display: 'block',
                  fontWeight: '700', 
                  color: '#374151', 
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem'
                }}>Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #D1D5DB',
                    fontWeight: '600',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="all">All Sales</option>
                  <option value="Membership">Membership Only</option>
                  <option value="Product">Product Only</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                <button
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    const futureDate = new Date();
                    futureDate.setMonth(futureDate.getMonth() + 3);
                    const threeMonthsLater = futureDate.toISOString().split('T')[0];
                    setStartDate(today);
                    setEndDate(threeMonthsLater);
                    setFilterType("all");
                  }}
                  style={{
                    padding: '0.625rem 1.25rem',
                    background: 'linear-gradient(135deg,#B8860B,#D4AF37)',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#FFF',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >Reset</button>
              </div>
            </div>
          </div>

          {/* Sales Summary Cards */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '1.25rem',
            padding: '1.75rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            marginBottom: '2.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg,#B8860B,#D4AF37)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem'
              }}>📈</div>
              <h2 style={{ fontSize: '1.375rem', fontWeight: '800', color: '#111827', margin: 0 }}>
                Sales Breakdown
              </h2>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {/* Membership Card */}
              <div style={{
                background: 'linear-gradient(135deg, #DBEAFE, #BFDBFE)',
                borderRadius: '1rem',
                padding: '2rem',
                border: '2px solid #3B82F620',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '0.75rem',
                    background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>👥</div>
                  <div>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      color: '#1E40AF',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Membership Sales</div>
                  </div>
                </div>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: '800',
                  color: '#1E3A8A',
                  marginBottom: '0.5rem'
                }}>₱{membershipSales.toLocaleString()}</div>
                <div style={{
                  fontSize: '1rem',
                  color: '#1E40AF',
                  fontWeight: '600'
                }}>{membershipCount} membership{membershipCount !== 1 ? 's' : ''} sold</div>
                <div style={{
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #3B82F640',
                  fontSize: '0.875rem',
                  color: '#1E40AF',
                  fontWeight: '600'
                }}>
                  {totalSales > 0 ? `${Math.round((membershipSales / totalSales) * 100)}% of total sales` : '0% of total sales'}
                </div>
              </div>

              {/* Product Card */}
              <div style={{
                background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
                borderRadius: '1rem',
                padding: '2rem',
                border: '2px solid #F59E0B20',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '0.75rem',
                    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>🛍️</div>
                  <div>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      color: '#92400E',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Product Sales</div>
                  </div>
                </div>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: '800',
                  color: '#78350F',
                  marginBottom: '0.5rem'
                }}>₱{productSales.toLocaleString()}</div>
                <div style={{
                  fontSize: '1rem',
                  color: '#92400E',
                  fontWeight: '600'
                }}>{productCount} product{productCount !== 1 ? 's' : ''} sold</div>
                <div style={{
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #F59E0B40',
                  fontSize: '0.875rem',
                  color: '#92400E',
                  fontWeight: '600'
                }}>
                  {totalSales > 0 ? `${Math.round((productSales / totalSales) * 100)}% of total sales` : '0% of total sales'}
                </div>
              </div>
            </div>
          </div>

          {/* Sales Table */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '1.25rem',
            padding: '1.75rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <h2 style={{ fontSize: '1.375rem', fontWeight: '800', color: '#111827', marginBottom: '1rem' }}>
              All Sales Transactions
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                <thead>
                  <tr>
                    {['OR Number', 'Date', 'Member Name', 'Type', 'Item', 'Amount', 'Status'].map((h) => (
                      <th key={h} style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em'
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ 
                        padding: '2rem', 
                        textAlign: 'center', 
                        color: '#6B7280',
                        fontWeight: '600'
                      }}>
                        {salesData.length === 0 ? "No transactions found in database" : "No sales found for the selected filters"}
                      </td>
                    </tr>
                  ) : (
                    filteredSales.map((sale) => (
                      <tr key={sale.id} style={{
                        background: '#FFFFFF',
                        borderRadius: '0.75rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#F9FAFB';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#FFFFFF';
                      }}>
                        <td style={{ padding: '1rem', fontWeight: '600', color: '#6B7280', fontSize: '0.875rem' }}>
                          {`OR-${String(sale.id).padStart(4, '0')}`}
                        </td>
                        <td style={{ padding: '1rem', fontWeight: '600', color: '#374151' }}>
                          {new Date(sale.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '1rem', fontWeight: '600' }}>{sale.memberName}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            background: sale.type === 'Membership' ? '#DBEAFE' : '#FEF3C7',
                            color: sale.type === 'Membership' ? '#1E40AF' : '#92400E'
                          }}>{sale.type}</span>
                        </td>
                        <td style={{ padding: '1rem', color: '#6B7280' }}>{sale.item}</td>
                        <td style={{ padding: '1rem', fontWeight: '700', color: '#059669', fontSize: '1rem' }}>
                          ₱{sale.amount.toLocaleString()}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            background: sale.status === 'Paid' ? '#D1FAE5' : '#FEF3C7',
                            color: sale.status === 'Paid' ? '#059669' : '#D97706'
                          }}>{sale.status}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}