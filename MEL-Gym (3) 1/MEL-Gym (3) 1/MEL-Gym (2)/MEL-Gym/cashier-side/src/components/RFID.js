import React, { useState, useEffect } from 'react';
import { FaSearch, FaTimes, FaCreditCard, FaEdit, FaCheck, FaUsers } from 'react-icons/fa';

// ============================================
// AUDIT TRAIL LOGGING
// ============================================
const logAuditTrail = async (action, status) => {
  try {
    const cashierId = localStorage.getItem("cashierId");

    if (!cashierId) {
      console.error("❌ Cashier ID not found in localStorage");
      return;
    }

    const auditData = {
      id: parseInt(cashierId) || cashierId,
      role: "cashier",
      action: action,
      status: status
    };

    const response = await fetch("http://localhost:8000/api/audit-trail", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify(auditData)
    });

    const responseData = await response.json();

    if (response.ok && responseData.success) {
      console.log("✅ Audit trail logged successfully!");
    } else {
      console.error("❌ Failed to log audit trail");
    }
  } catch (error) {
    console.error("❌ Error logging audit trail:", error);
  }
};

const RFIDManagement = () => {
  const [members, setMembers] = useState([]);
  const [walkIns, setWalkIns] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [filteredWalkIns, setFilteredWalkIns] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rfidInput, setRfidInput] = useState('');
  const [itemType, setItemType] = useState('member');
  const [stats, setStats] = useState({
    noRfid: 0,
    totalMembers: 0,
    rfidAssigned: 0,
    walkinsNoRfid: 0
  });

  useEffect(() => {
    fetchData();
    logAuditTrail(`RFID MANAGEMENT PAGE - Accessed`, "SUCCESS");
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all transactions with status "paid"
      const transactionsResponse = await fetch('http://localhost:8000/api/cashier/transactions');
      const transactionsData = await transactionsResponse.json();
      
      // Filter for paid transactions only and get unique customers
      const paidTransactions = transactionsData.filter(t => t.status === 'paid');
      
      // Get unique paid customer names (by OR number)
      const uniquePaidCustomers = new Set();
      const seenOrNumbers = new Set();
      
      paidTransactions.forEach(t => {
        if (!seenOrNumbers.has(t.or_number)) {
          uniquePaidCustomers.add(t.member_name);
          seenOrNumbers.add(t.or_number);
        }
      });
      
      // Fetch all members
      const membersResponse = await fetch('http://localhost:8000/api/cashier/members');
      const membersData = await membersResponse.json();
      
      // Filter members that are in paid transactions and have no RFID
      const paidMembersNoRfid = membersData.filter(m => 
        uniquePaidCustomers.has(m.member_name) && !m.rfid
      );
      
      // Filter members that are in paid transactions and have RFID
      const paidMembersWithRfid = membersData.filter(m => 
        uniquePaidCustomers.has(m.member_name) && m.rfid
      );
      
      // Fetch walk-ins
      const walkinsResponse = await fetch('http://localhost:8000/api/walkin');
      const walkinsData = await walkinsResponse.json();
      const walkinsArray = walkinsData.success ? walkinsData.data : walkinsData;
      
      // Filter walk-ins in paid transactions and no RFID
      const paidWalkinsNoRfid = walkinsArray.filter(w => 
        uniquePaidCustomers.has(w.fullname) && !w.RFID_number
      );
      
      setMembers(paidMembersNoRfid);
      setWalkIns(paidWalkinsNoRfid);
      setFilteredMembers(paidMembersNoRfid);
      setFilteredWalkIns(paidWalkinsNoRfid);
      
      setStats({
        noRfid: paidMembersNoRfid.length + paidWalkinsNoRfid.length,
        totalMembers: membersData.length,
        rfidAssigned: paidMembersWithRfid.length,
        walkinsNoRfid: paidWalkinsNoRfid.length
      });
      
      setLoading(false);
      logAuditTrail(`FETCH RFID DATA - Success`, "SUCCESS");
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
      logAuditTrail(`FETCH RFID DATA - Error`, "FAILED");
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMembers(members);
      setFilteredWalkIns(walkIns);
    } else {
      const query = searchQuery.toLowerCase();
      const filteredM = members.filter(m => 
        m.member_name?.toLowerCase().includes(query) ||
        m.contact_number?.includes(query) ||
        m.id?.toString().includes(query)
      );
      const filteredW = walkIns.filter(w => 
        w.fullname?.toLowerCase().includes(query) ||
        w.walkin_id?.toString().includes(query)
      );
      setFilteredMembers(filteredM);
      setFilteredWalkIns(filteredW);
      logAuditTrail(`SEARCH RFID - Query: ${searchQuery}`, "SUCCESS");
    }
  }, [searchQuery, members, walkIns]);

  const handleAssignRFID = (item, type) => {
    setSelectedItem(item);
    setItemType(type);
    setRfidInput('');
    setShowModal(true);
    logAuditTrail(`OPEN RFID ASSIGN MODAL - ${type === 'member' ? item.member_name : item.fullname}`, "SUCCESS");
  };

  const submitRFID = async () => {
    if (!rfidInput.trim()) {
      alert('Please enter or scan RFID card number');
      logAuditTrail(`ASSIGN RFID - Empty Input`, "FAILED");
      return;
    }

    try {
      // Check if RFID already exists in members table
      const membersResponse = await fetch('http://localhost:8000/api/cashier/members');
      const membersData = await membersResponse.json();
      const rfidExistsInMembers = membersData.some(m => m.rfid === rfidInput.trim());

      // Check if RFID already exists in walk_in table
      const walkinsResponse = await fetch('http://localhost:8000/api/walkin');
      const walkinsData = await walkinsResponse.json();
      const walkinsArray = walkinsData.success ? walkinsData.data : walkinsData;
      const rfidExistsInWalkins = walkinsArray.some(w => w.RFID_number === rfidInput.trim());

      if (rfidExistsInMembers || rfidExistsInWalkins) {
        alert(`❌ RFID already used in ${rfidExistsInMembers ? 'members' : 'walk-ins'} table`);
        logAuditTrail(`ASSIGN RFID - Duplicate ${rfidInput} to ${itemType === 'member' ? selectedItem.member_name : selectedItem.fullname}`, "FAILED");
        return;
      }

      let endpoint = '';
      let body = {};

      if (itemType === 'member') {
        endpoint = `http://localhost:8000/api/cashier/members/${selectedItem.id}/rfid`;
        body = { rfid: rfidInput.trim() };
      } else {
        endpoint = `http://localhost:8000/api/walkin/${selectedItem.walkin_id}`;
        body = { RFID_number: rfidInput.trim() };
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        if (itemType === 'member') {
          try {
            await fetch(`http://localhost:8000/api/cashier/members/${selectedItem.id}/status`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ status: 'active' })
            });
          } catch (err) {
            console.log('Status update skipped:', err);
          }
        }

        alert(`✅ RFID assigned successfully!`);
        setShowModal(false);
        logAuditTrail(`ASSIGN RFID - ${rfidInput} to ${itemType === 'member' ? selectedItem.member_name : selectedItem.fullname}`, "SUCCESS");
        fetchData();
      } else {
        const error = await response.json();
        alert(`❌ ${error.error || 'Failed to assign RFID'}`);
        logAuditTrail(`ASSIGN RFID - Failed for ${itemType === 'member' ? selectedItem.member_name : selectedItem.fullname}`, "FAILED");
      }
    } catch (error) {
      console.error('Error assigning RFID:', error);
      alert('❌ Error assigning RFID');
      logAuditTrail(`ASSIGN RFID - Error: ${error.message}`, "FAILED");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '24px' }}>
      <div style={{ maxWidth: '100%', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaCreditCard style={{ width: '24px', height: '24px' }} />
            RFID Management - Paid Customers
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>Assign RFID cards to paid customers without RFID</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: 'white', border: '2px solid #3b82f6', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>No RFID (Paid)</div>
            <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#3b82f6' }}>{stats.noRfid}</div>
          </div>
          <div style={{ backgroundColor: 'white', border: '2px solid #60a5fa', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Total Members</div>
            <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#60a5fa' }}>{stats.totalMembers}</div>
          </div>
          <div style={{ backgroundColor: 'white', border: '2px solid #22c55e', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>RFID Assigned (Paid)</div>
            <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#22c55e' }}>{stats.rfidAssigned}</div>
          </div>
          <div style={{ backgroundColor: 'white', border: '2px solid #8b5cf6', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Walk-ins No RFID</div>
            <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#8b5cf6' }}>{stats.walkinsNoRfid}</div>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <FaSearch style={{ width: '20px', height: '20px', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search by name, contact number, or ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                width: '100%', 
                paddingLeft: '40px', 
                paddingRight: '16px', 
                paddingTop: '12px', 
                paddingBottom: '12px',
                border: '1px solid #d1d5db', 
                borderRadius: '8px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Members Table */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
            <h2 style={{ fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <FaCreditCard style={{ width: '20px', height: '20px' }} />
              Paid Members Without RFID
            </h2>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>ID</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Name</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Contact</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Type</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Valid Until</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" style={{ padding: '32px 16px', textAlign: 'center', color: '#6b7280' }}>Loading...</td></tr>
                ) : filteredMembers.length === 0 ? (
                  <tr><td colSpan="7" style={{ padding: '32px 16px', textAlign: 'center', color: '#6b7280' }}>No paid members without RFID found</td></tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr key={`m-${member.id}`} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px 16px', fontSize: '14px', fontFamily: 'monospace' }}>{member.id}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>{member.member_name}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>{member.contact_number || 'N/A'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>{member.membership_type}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', textTransform: 'capitalize' }}>
                        <span style={{ 
                          padding: '4px 12px', 
                          borderRadius: '6px', 
                          fontWeight: '500',
                          backgroundColor: member.status === 'active' ? '#d1fae5' : '#fee2e2',
                          color: member.status === 'active' ? '#065f46' : '#991b1b'
                        }}>
                          {member.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>{formatDate(member.membership_end)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => handleAssignRFID(member, 'member')}
                          style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: 'white', fontSize: '12px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                        >
                          Assign RFID
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Walk-ins Table */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
            <h2 style={{ fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <FaUsers style={{ width: '20px', height: '20px' }} />
              Paid Walk-ins Without RFID
            </h2>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>ID</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Name</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredWalkIns.length === 0 ? (
                  <tr><td colSpan="4" style={{ padding: '32px 16px', textAlign: 'center', color: '#6b7280' }}>No paid walk-ins without RFID found</td></tr>
                ) : (
                  filteredWalkIns.map((walkin) => (
                    <tr key={`w-${walkin.walkin_id}`} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px 16px', fontSize: '14px', fontFamily: 'monospace' }}>{walkin.walkin_id}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>{walkin.fullname}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>{formatDate(walkin.date)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => handleAssignRFID(walkin, 'walkin')}
                          style={{ padding: '6px 12px', backgroundColor: '#8b5cf6', color: 'white', fontSize: '12px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                        >
                          Assign RFID
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 20px 25px rgba(0,0,0,0.15)', width: '100%', maxWidth: '448px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid #e5e7eb', backgroundColor: itemType === 'member' ? '#3b82f6' : '#8b5cf6', color: 'white', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
              <h3 style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <FaCreditCard style={{ width: '20px', height: '20px' }} />
                Assign RFID
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ backgroundColor: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
              >
                <FaTimes style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                  {itemType === 'member' ? 'Member' : 'Walk-in'} Information
                </div>
                <div style={{ fontWeight: '600', fontSize: '18px' }}>
                  {selectedItem?.member_name || selectedItem?.fullname}
                </div>
                {itemType === 'member' ? (
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    ID: {selectedItem?.id} • {selectedItem?.membership_type}
                  </div>
                ) : (
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    ID: {selectedItem?.walkin_id} • {formatDate(selectedItem?.date)}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  RFID Card Number
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={rfidInput}
                    onChange={(e) => setRfidInput(e.target.value)}
                    placeholder="Enter or scan RFID"
                    style={{ width: '100%', padding: '8px 40px 8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none' }}
                    autoFocus
                  />
                  <FaCreditCard style={{ width: '20px', height: '20px', position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={submitRFID}
                  style={{ 
                    flex: 1, 
                    padding: '10px', 
                    backgroundColor: '#22c55e', 
                    color: 'white', 
                    borderRadius: '8px', 
                    fontWeight: '500', 
                    border: 'none', 
                    cursor: 'pointer'
                  }}
                >
                  <FaCheck style={{ width: '16px', height: '16px', display: 'inline', marginRight: '8px' }} />
                  Assign Card
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  style={{ 
                    flex: 1, 
                    padding: '10px', 
                    backgroundColor: '#6c757d', 
                    color: 'white', 
                    borderRadius: '8px', 
                    fontWeight: '500', 
                    border: 'none', 
                    cursor: 'pointer'
                  }}
                >
                  <FaTimes style={{ width: '16px', height: '16px', display: 'inline', marginRight: '8px' }} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RFIDManagement;