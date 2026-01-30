import React, { useState, useEffect } from 'react';
import { Calendar, Dumbbell, Activity, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../AuthContext.jsx';

function Membership({ setActivePage }) {
  const { user } = useAuth();
  const memberId = user?.id;

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [memberData, setMemberData] = useState(null);
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configure axios
  axios.defaults.baseURL = 'http://127.0.0.1:8000';
  axios.defaults.withCredentials = false;

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Helper function to calculate days until renewal
  const calculateDaysUntil = (endDate) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Fetch member data and benefits
  useEffect(() => {
    const fetchMemberData = async () => {
      if (!memberId) {
        setError('Member ID not available. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch member basic info
        const memberResponse = await axios.get(`/api/members/${memberId}`);
        const member = memberResponse.data;

        // Check if member status is inactive
        const isInactive = member.status === 'inactive';
        setIsCancelled(isInactive);

        // Set member data
        setMemberData({
          id: member.id,
          name: member.member_name,
          membershipType: member.membership_type,
          memberSince: formatDate(member.membership_start),
          renewalDate: formatDate(member.membership_end),
          membershipStatus: member.status,
          rfidNumber: member.rfid_number,
          classesAttended: 0,
          workoutsLogged: 0,
          daysUntilRenewal: calculateDaysUntil(member.membership_end)
        });

        // Fetch all membership plans
        const plansResponse = await axios.get(`/api/membership-plans`);
        const plans = plansResponse.data;

        console.log('📊 All plans:', plans);
        console.log('🔍 Looking for membership_type:', member.membership_type);

        // Find the plan that matches the member's membership_type name
        const matchedPlan = plans.find(plan => 
          plan.membershipname && 
          plan.membershipname.toLowerCase() === member.membership_type.toLowerCase()
        );

        console.log('✅ Matched plan:', matchedPlan);

        if (matchedPlan && matchedPlan.membershipbenefits) {
          // Parse benefits (could be comma-separated from GROUP_CONCAT)
          let benefitsList = matchedPlan.membershipbenefits
            .split(',')
            .map(b => b.trim())
            .filter(b => b);
          
          setBenefits(benefitsList);
          console.log('✅ Benefits loaded:', benefitsList);
        } else {
          console.warn(`⚠️ No matching plan found for membership_type: "${member.membership_type}"`);
          setBenefits([]);
        }

      } catch (err) {
        console.error('❌ Error fetching member data:', err);
        setError(err.response?.data?.message || 'Failed to load member information.');
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, [memberId]);

  // Cancel membership - Remove RFID and set status to inactive
  const handleCancelConfirm = async () => {
    try {
      const response = await axios.post(`/api/members/membership/cancel`, { id: memberId });
      if (response.data.success) {
        setIsCancelled(true);
        setShowCancelModal(false);
        
        // Update local state
        setMemberData(prev => ({
          ...prev,
          membershipStatus: 'inactive',
          rfidNumber: null
        }));
        
        alert('Membership cancelled successfully. Your RFID access has been removed.');
        
        // Store inactive status in localStorage
        localStorage.setItem('membershipInactive', 'true');
      }
    } catch (err) {
      console.error('Error cancelling membership:', err);
      alert(err.response?.data?.message || 'Failed to cancel membership.');
    }
  };

  const handleKeepMembership = () => {
    setShowCancelModal(false);
  };

  const handleRenewClick = () => {
    console.log('Renew clicked, showing modal');
    setShowRenewModal(true);
  };

  const handleRenewConfirm = () => {
    console.log('Renew confirmed, navigating to payment');
    if (setActivePage) {
      setActivePage('payment');
    }
    setShowRenewModal(false);
  };

  if (loading) {
    return (
      <div className="membership-container" style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '1.5rem', color: '#6B7280', marginBottom: '1rem' }}>
          Loading member information...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="membership-container">
        <div className="alert alert-error">
          <AlertCircle className="alert-icon" size={20} />
          <div>
            <h3 className="alert-title">Error</h3>
            <p className="alert-message">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!memberData) {
    return (
      <div className="membership-container">
        <div className="alert alert-warning">
          <AlertCircle className="alert-icon" size={20} />
          <div>
            <h3 className="alert-title">No Member Data Found</h3>
            <p className="alert-message">No information available for this member.</p>
          </div>
        </div>
      </div>
    );
  }

  const isExpired = memberData.membershipStatus === 'expired';
  const daysUntilRenewal = memberData.daysUntilRenewal || 0;
  const isExpiringSoon = daysUntilRenewal === 1;

  return (
    <div className="membership-container">
      <h2 className="membership-title">Membership Information</h2>

      {/* Inactive Account Alert - MOST IMPORTANT */}
      {isCancelled && (
        <div className="alert alert-error" style={{ 
          backgroundColor: '#FEE2E2', 
          border: '2px solid #DC2626',
          padding: '1.5rem',
          marginBottom: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)'
        }}>
          <AlertCircle className="alert-icon" size={24} style={{ color: '#DC2626' }} />
          <div>
            <h3 className="alert-title" style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              ⚠️ Account Inactive - Membership Required
            </h3>
            <p className="alert-message" style={{ fontSize: '1rem', color: '#7F1D1D' }}>
              Your account needs to purchase a membership to access gym facilities. 
              Your RFID access has been removed. Please renew your membership to continue using our services.
            </p>
          </div>
        </div>
      )}

      {/* Status Alert */}
      {!isCancelled && isExpired && (
        <div className="alert alert-error">
          <AlertCircle className="alert-icon" size={20} />
          <div>
            <h3 className="alert-title">Membership Expired</h3>
            <p className="alert-message">
              Your membership expired on {memberData.renewalDate}. Renew now to continue enjoying all benefits.
            </p>
          </div>
        </div>
      )}

      {isExpiringSoon && !isCancelled && (
        <div className="alert alert-warning">
          <AlertCircle className="alert-icon" size={20} />
          <div>
            <h3 className="alert-title">Membership Expiring Soon</h3>
            <p className="alert-message">
              Your membership will expire in {daysUntilRenewal} day. Renew now to avoid interruption.
            </p>
          </div>
        </div>
      )}

      <div className="membership-card">
        <div className="membership-card-bg"></div>

        <div className="membership-card-content">
          {/* Header */}
          <div className="membership-card-header">
            <div className="membership-info">
              <p className="membership-label">Membership Type</p>
              <h3 className="membership-type">{memberData.membershipType || 'Standard'}</h3>
            </div>
            <div className="membership-id">
              <p>ID: #{memberData.id || 'N/A'}</p>
            </div>
          </div>

          {/* Member Details */}
          <div className="membership-details">
            <div className="member-detail">
              <p className="membership-label">Member Name</p>
              <p className="membership-value">{memberData.name || 'N/A'}</p>
            </div>
            <div className="member-detail">
              <p className="membership-label">RFID Status</p>
              <p className="membership-value" style={{ 
                color: isCancelled ? '#DC2626' : '#10B981',
                fontWeight: 'bold'
              }}>
                {isCancelled ? '❌ Removed' : `✅ ${memberData.rfidNumber || 'Active'}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="membership-grid">
        <div className="membership-box">
          <p className="label">Membership Type</p>
          <p className="value">{memberData.membershipType || 'Standard'}</p>
        </div>

        <div className="membership-box">
          <p className="label">Membership Status</p>
          <div className="status-container">
            <span className={`status-badge ${
              isCancelled ? 'status-cancelled' : 
              isExpired ? 'status-expired' : 
              isExpiringSoon ? 'status-expiring' : 
              'status-active'
            }`}>
              {isCancelled ? 'INACTIVE' : 
               isExpired ? 'Expired' : 
               isExpiringSoon ? 'Expiring Soon' : 
               'Active'}
            </span>
          </div>
        </div>

        <div className="membership-box">
          <p className="label">Membership Renewal Date</p>
          <p className="value">{memberData.renewalDate || 'N/A'}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">
            <Calendar size={24} />
          </div>
          <div>
            <p className="stat-label">Member Since</p>
            <p className="stat-value">{memberData.memberSince || 'N/A'}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-green">
            <Activity size={24} />
          </div>
          <div>
            <p className="stat-label">Classes Attended</p>
            <p className="stat-value">{memberData.classesAttended || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-purple">
            <Dumbbell size={24} />
          </div>
          <div>
            <p className="stat-label">Workouts Logged</p>
            <p className="stat-value">{memberData.workoutsLogged || 0}</p>
          </div>
        </div>
      </div>

      {/* Benefits Section - NOW DYNAMIC! */}
      <div className="benefits-section">
        <h3 className="section-title">{memberData.membershipType} Benefits</h3>
        {isCancelled ? (
          <div style={{ 
            backgroundColor: '#FEF3C7', 
            border: '1px solid #F59E0B',
            borderRadius: '8px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <AlertCircle size={32} style={{ color: '#D97706', marginBottom: '0.5rem' }} />
            <p style={{ color: '#92400E', fontWeight: '600' }}>
              Benefits unavailable. Please purchase a membership to view and access benefits.
            </p>
          </div>
        ) : (
          <div className="benefits-grid">
            {benefits.length > 0 ? (
              benefits.map((benefit, idx) => (
                <div key={idx} className="benefit-item">
                  <CheckCircle className="benefit-check" size={20} />
                  <span>{benefit}</span>
                </div>
              ))
            ) : (
              <div className="benefit-item">
                <AlertCircle className="benefit-check" size={20} style={{ color: '#F59E0B' }} />
                <span>No benefits information available for this membership type</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="membership-actions">
        
        <button 
          className={`cancel-btn ${isCancelled ? 'cancel-btn-disabled' : ''}`}
          onClick={() => setShowCancelModal(true)}
          disabled={isCancelled}
        >
          Cancel Membership
        </button>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon modal-icon-error">
                <AlertCircle size={32} />
              </div>
              <h3 className="modal-title">Cancel Membership?</h3>
              <p className="modal-description">
                Are you sure you want to cancel your membership? This will:
              </p>
            </div>
            <div className="modal-warning" style={{ backgroundColor: '#FEF3C7', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem', color: '#92400E' }}>
                <li>Remove your RFID access immediately</li>
                <li>Set your account status to INACTIVE</li>
                <li>Block access to all gym facilities and features</li>
                <li>You'll need to purchase a new membership to regain access</li>
              </ul>
            </div>
            <div className="modal-actions">
              <button onClick={handleKeepMembership} className="btn btn-keep">
                Keep Membership
              </button>
              <button onClick={handleCancelConfirm} className="btn btn-delete">
                Yes, Cancel & Remove RFID
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Renew Modal */}
      {showRenewModal && (
        <div className="modal-overlay" onClick={() => setShowRenewModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon modal-icon-success">
                <CheckCircle size={32} />
              </div>
              <h3 className="modal-title">
                {isCancelled ? 'Purchase Membership' : 'Renew Membership'}
              </h3>
              <p className="modal-description">
                {isCancelled 
                  ? 'Reactivate your account and regain full access to gym facilities' 
                  : 'Continue your fitness journey with us'}
              </p>
            </div>
            <div className="modal-content">
              <div className="pricing-details">
                <div className="pricing-row">
                  <span>Plan</span>
                  <span className="font-semibold">{memberData.membershipType || 'Premium'}</span>
                </div>
                <div className="pricing-row">
                  <span>Duration</span>
                  <span className="font-semibold">1 Year</span>
                </div>
                {isCancelled && (
                  <div className="pricing-row" style={{ color: '#10B981' }}>
                    <span>Includes</span>
                    <span className="font-semibold">New RFID Card</span>
                  </div>
                )}
                <div className="pricing-total">
                  <span>Total</span>
                  <span className="pricing-amount">$599</span>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowRenewModal(false)} className="btn btn-cancel">
                Cancel
              </button>
              <button onClick={handleRenewConfirm} className="btn btn-confirm">
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Membership;