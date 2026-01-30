import React, { useState, useEffect } from 'react';

export default function CreateStaffAccount() {
  const [formData, setFormData] = useState({
    fullName: '',
    contactNumber: '',
    email: '',
    address: '',
    role: '',
    startDate: new Date().toISOString().split('T')[0],
    password: '',
    confirmPassword: ''
  });
  
  const [hoveredRow, setHoveredRow] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  // Fetch staff from backend on component mount
  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/staff/all');
      
      if (!response.ok) {
        throw new Error('Failed to fetch staff');
      }
      
      const data = await response.json();
      console.log('📥 Fetched staff data:', data);
      
      if (Array.isArray(data)) {
        const formattedStaff = data.map((staff, index) => ({
          id: staff.id,
          uniqueKey: `${staff.role}-${staff.id}-${index}`,
          name: staff.name,
          role: staff.role,
          icon: staff.role === 'trainer' ? '🏋️' : staff.role === 'cashier' ? '💰' : '👨‍💼',
          contact: staff.contact_number || '-',
          email: staff.email || '-',
          password: '********',
          // Normalize status - handle both 'Active'/'Inactive' and 'active'/'inactive'
          status: (staff.status || 'inactive').toString().trim().toLowerCase()
        }));
        setStaffList(formattedStaff);
        console.log('✅ Loaded staff:', formattedStaff.length);
      }
    } catch (error) {
      console.error('❌ Error fetching staff:', error);
      alert('Failed to load staff members. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // Validation
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    if (!formData.fullName || !formData.role || !formData.password) {
      alert('Please fill in all required fields (Name, Role, Password)!');
      return;
    }

    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }

    try {
      console.log('📤 Sending staff data:', {
        fullName: formData.fullName,
        email: formData.email,
        contactNumber: formData.contactNumber,
        address: formData.address,
        role: formData.role,
        startDate: formData.startDate,
        password: formData.password
      });

      const response = await fetch('http://localhost:8000/api/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          contactNumber: formData.contactNumber,
          address: formData.address,
          role: formData.role,
          startDate: formData.startDate,
          password: formData.password
        })
      });

      const data = await response.json();
      console.log('📥 Server response:', data);

      if (response.ok && data.success) {
        alert(`✅ ${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} account created successfully!`);
        
        // Reset form
        setFormData({
          fullName: '',
          contactNumber: '',
          email: '',
          address: '',
          role: '',
          startDate: new Date().toISOString().split('T')[0],
          password: '',
          confirmPassword: ''
        });

        // Refresh staff list
        fetchStaff();
      } else {
        alert('❌ ' + (data.error || 'Failed to create staff account'));
        console.error('Server error:', data);
      }
    } catch (error) {
      console.error('❌ Error creating staff:', error);
      alert('Failed to create staff account. Please check if the server is running.');
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      trainer: '#10B981',
      cashier: '#F59E0B',
      admin: '#3B82F6'
    };
    return colors[role] || '#6B7280';
  };

  const toggleStatus = async (staffId, currentStatus, newStatus, role) => {
    // Don't do anything if status hasn't changed
    if (currentStatus === newStatus) return;
    
    try {
      setUpdatingStatus(staffId);
      
      console.log(`🔄 Updating ${role} ID ${staffId} from ${currentStatus} to ${newStatus}`);
      
      const response = await fetch(`http://localhost:8000/api/staff/${staffId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          role: role
        })
      });

      const data = await response.json();
      console.log('📥 Status update response:', data);

      if (response.ok && data.success) {
        // Update local state
        setStaffList(prev => prev.map(staff => 
          staff.id === staffId && staff.role === role 
            ? { ...staff, status: newStatus } 
            : staff
        ));
        
        const statusEmoji = newStatus === 'active' ? '✅' : '⏸️';
        alert(`${statusEmoji} Staff account ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
      } else {
        alert('❌ ' + (data.error || 'Failed to update status'));
        // Force re-render to revert dropdown
        fetchStaff();
      }
    } catch (error) {
      console.error('❌ Error updating status:', error);
      alert('Failed to update status. Please check if the server is running.');
      // Force re-render to revert dropdown
      fetchStaff();
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <div style={{
      maxWidth: '95%',
      margin: '0 auto',
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, #FFFFFF, #F9FAFB)',
        border: '1px solid #E5E7EB',
        borderRadius: '1.5rem',
        padding: '2rem 2.5rem',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '800',
          color: '#111827',
          margin: '0 0 0.5rem 0'
        }}>
          Staff Management
        </h1>
        <p style={{
          color: '#6B7280',
          fontSize: '1.1rem',
          margin: 0
        }}>
          Create and manage staff accounts for your gym
        </p>
      </div>

      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '1.25rem',
        padding: '3rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        marginBottom: '2.5rem'
      }}>
        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: '700',
          color: '#111827',
          marginTop: 0,
          marginBottom: '2rem'
        }}>
          Create New Staff Account
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.75rem'
            }}>
              Full Name <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter full name"
              style={{
                width: '100%',
                padding: '1rem 1.25rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.5rem',
                fontSize: '1.05rem',
                outline: 'none',
                transition: 'border 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#B8860B'}
              onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.75rem'
            }}>
              Contact Number
            </label>
            <input
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="Enter contact number"
              style={{
                width: '100%',
                padding: '1rem 1.25rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.5rem',
                fontSize: '1.05rem',
                outline: 'none',
                transition: 'border 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#B8860B'}
              onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
            />
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.75rem'
            }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              style={{
                width: '100%',
                padding: '1rem 1.25rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.5rem',
                fontSize: '1.05rem',
                outline: 'none',
                transition: 'border 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#B8860B'}
              onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.75rem'
            }}>
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter address"
              style={{
                width: '100%',
                padding: '1rem 1.25rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.5rem',
                fontSize: '1.05rem',
                outline: 'none',
                transition: 'border 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#B8860B'}
              onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
            />
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.75rem'
            }}>
              Staff Role <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '1rem 1.25rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.5rem',
                fontSize: '1.05rem',
                outline: 'none',
                transition: 'border 0.2s',
                boxSizing: 'border-box',
                background: '#FFFFFF',
                cursor: 'pointer'
              }}
              onFocus={(e) => e.target.style.borderColor = '#B8860B'}
              onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
            >
              <option value="">Select Staff Role</option>
              <option value="trainer">🏋️ Trainer</option>
              <option value="cashier">💰 Cashier</option>
              <option value="admin">👨‍💼 Admin</option>
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.75rem'
            }}>
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '1rem 1.25rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.5rem',
                fontSize: '1.05rem',
                outline: 'none',
                transition: 'border 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#B8860B'}
              onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
            />
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          marginBottom: '2.5rem'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.75rem'
            }}>
              Password <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password (min. 6 characters)"
              style={{
                width: '100%',
                padding: '1rem 1.25rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.5rem',
                fontSize: '1.05rem',
                outline: 'none',
                transition: 'border 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#B8860B'}
              onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.75rem'
            }}>
              Confirm Password <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              style={{
                width: '100%',
                padding: '1rem 1.25rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.5rem',
                fontSize: '1.05rem',
                outline: 'none',
                transition: 'border 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#B8860B'}
              onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSubmit}
            style={{
              padding: '1rem 3rem',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '0.75rem',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 12px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 6px rgba(16, 185, 129, 0.3)';
            }}
          >
            ➕ Create Staff Account
          </button>
        </div>
      </div>

      {/* Staff List Table */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '1.25rem',
        padding: '3rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: '700',
          color: '#111827',
          marginTop: 0,
          marginBottom: '2rem'
        }}>
          All Staff Members {loading && <span style={{ fontSize: '1rem', color: '#6B7280', fontWeight: 'normal' }}>Loading...</span>}
        </h2>
        <div style={{ 
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          <style>
            {`
              div::-webkit-scrollbar {
                display: none;
              }
            `}
          </style>
          {staffList.length === 0 && !loading ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#6B7280',
              fontSize: '1.1rem',
              background: '#F9FAFB',
              borderRadius: '0.75rem'
            }}>
              📋 No staff members found. Create your first staff account above!
            </div>
          ) : (
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                  {['Name', 'Email', 'Contact Number', 'Password', 'Role', 'Status'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '1.5rem',
                        textAlign: 'left',
                        fontSize: '0.9rem',
                        fontWeight: '800',
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        background: '#F9FAFB'
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staffList.map((staff, index) => (
                  <tr
                    key={staff.uniqueKey}
                    onMouseEnter={() => setHoveredRow(index)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      background: hoveredRow === index ? 'linear-gradient(135deg,#FEF3C7,#FDE68A)' : '#FFFFFF',
                      transition: 'all 0.3s ease',
                      borderBottom: index === staffList.length - 1 ? 'none' : '1px solid #E5E7EB'
                    }}
                  >
                    <td style={{ padding: '1.5rem', fontWeight: '600', color: '#111827', fontSize: '1.1rem' }}>
                      {staff.icon} {staff.name}
                    </td>
                    <td style={{ padding: '1.5rem', color: '#6B7280', fontSize: '1.05rem' }}>{staff.email}</td>
                    <td style={{ padding: '1.5rem', color: '#6B7280', fontSize: '1.05rem' }}>{staff.contact}</td>
                    <td style={{ padding: '1.5rem', color: '#6B7280', fontFamily: 'monospace', fontSize: '1.05rem' }}>{staff.password}</td>
                    <td style={{ padding: '1.5rem' }}>
                      <span style={{
                        padding: '0.5rem 1.25rem',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#FFFFFF',
                        background: getRoleColor(staff.role),
                        textTransform: 'capitalize'
                      }}>
                        {staff.role}
                      </span>
                    </td>
                    <td style={{ padding: '1.5rem' }}>
                      <select
                        value={staff.status}
                        onChange={(e) => toggleStatus(staff.id, staff.status, e.target.value, staff.role)}
                        disabled={updatingStatus === staff.id}
                        style={{
                          padding: '0.75rem 1.25rem',
                          borderRadius: '0.5rem',
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: '#FFFFFF',
                          background: staff.status === 'active' 
                            ? '#10B981' 
                            : '#EF4444',
                          border: 'none',
                          cursor: updatingStatus === staff.id ? 'not-allowed' : 'pointer',
                          opacity: updatingStatus === staff.id ? 0.6 : 1,
                          outline: 'none',
                          appearance: 'none',
                          paddingRight: '2.5rem',
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 0.75rem center',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (updatingStatus !== staff.id) {
                            e.target.style.transform = 'translateY(-1px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        <option value="active" style={{ background: '#FFFFFF', color: '#000000' }}>
                          ✓ Active
                        </option>
                        <option value="inactive" style={{ background: '#FFFFFF', color: '#000000' }}>
                          ✗ Inactive
                        </option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}