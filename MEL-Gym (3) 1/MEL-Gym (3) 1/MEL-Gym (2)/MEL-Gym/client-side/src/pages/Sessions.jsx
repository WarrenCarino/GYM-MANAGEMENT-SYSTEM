import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Dumbbell, Heart, Zap, Target, CheckCircle, AlertCircle } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

const GymBookingSessions = () => {
  const [selectedSession, setSelectedSession] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: ''
  });
  const [activeTab, setActiveTab] = useState('available');
  const [maxCapacity, setMaxCapacity] = useState(0);
  const [memberData, setMemberData] = useState(null);
  const [bookedTimeSlots, setBookedTimeSlots] = useState([]);
  const [membershipInfo, setMembershipInfo] = useState(null);
  const [bookingLimit, setBookingLimit] = useState(0);
  const [remainingBookings, setRemainingBookings] = useState(0);

  const sessionTypes = [
    {
      id: 1,
      name: 'Strength Training',
      icon: Dumbbell,
      bgClass: 'bg-primary',
      badgeClass: 'badge-primary',
      iconBg: 'bg-primary',
      description: 'Build muscle and increase power with weights and resistance training',
      duration: '60 minutes',
      durationMinutes: 60
    },
    {
      id: 2,
      name: 'Functional Fitness',
      icon: Target,
      bgClass: 'bg-warning',
      badgeClass: 'badge-warning',
      iconBg: 'bg-warning',
      description: 'Improve everyday movements with functional exercises',
      duration: '45 minutes',
      durationMinutes: 45
    },
    {
      id: 3,
      name: 'Cardio Blast',
      icon: Heart,
      bgClass: 'bg-info',
      badgeClass: 'badge-info',
      iconBg: 'bg-info',
      description: 'High-intensity cardio to boost endurance and burn calories',
      duration: '45 minutes',
      durationMinutes: 45
    },
    {
      id: 4,
      name: 'CrossFit Training',
      icon: Zap,
      bgClass: 'bg-success',
      badgeClass: 'badge-success',
      iconBg: 'bg-success',
      description: 'Intense functional movements combining strength, cardio, and gymnastics',
      duration: '60 minutes',
      durationMinutes: 60
    }
  ];

  const getContactNumberFromStorage = () => {
    let contactNumber = localStorage.getItem('contact_number') || 
                       localStorage.getItem('memberContact') || 
                       localStorage.getItem('phone') ||
                       localStorage.getItem('userContact');
    
    if (!contactNumber) {
      const userStr = localStorage.getItem('user') || localStorage.getItem('userData');
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          contactNumber = userObj.contact_number || userObj.phone || userObj.contact;
        } catch (e) {
          console.error('Could not parse user object from localStorage:', e);
        }
      }
    }
    
    return contactNumber;
  };

  const normalizeContact = (contact) => {
    if (!contact) return '';
    return String(contact).trim().toLowerCase();
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${String(displayHour).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const convertTo24Hour = (time12h) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    
    if (hours === '12') {
      hours = '00';
    }
    
    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
    
    return `${hours}:${minutes}:00`;
  };

  const calculateTimeout = (time12h, durationMinutes) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);
    
    if (hours === 12) {
      hours = modifier === 'AM' ? 0 : 12;
    } else if (modifier === 'PM') {
      hours += 12;
    }
    
    minutes += durationMinutes;
    
    if (minutes >= 60) {
      hours += Math.floor(minutes / 60);
      minutes = minutes % 60;
    }
    
    if (hours >= 24) {
      hours = hours % 24;
    }
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  };

  // Fetch membership info and calculate booking limits
  useEffect(() => {
    const fetchMembershipInfo = async () => {
      try {
        const contactNumber = getContactNumberFromStorage();
        if (!contactNumber) {
          console.warn('⚠️ No contact number found');
          return;
        }

        const response = await fetch('http://localhost:8000/api/members');
        const members = await response.json();
        const member = members.find(m => 
          normalizeContact(m.contact_number) === normalizeContact(contactNumber)
        );

        if (member) {
          setMembershipInfo(member);
          
          // Set booking limit based on membership type
          if (member.membership_type === 'Monthly') {
            setBookingLimit(5);
          } else if (member.membership_type === 'Weekly') {
            setBookingLimit(3);
          } else {
            setBookingLimit(0);
          }

          console.log('📋 Membership Info:', {
            type: member.membership_type,
            endDate: member.membership_end,
            limit: member.membership_type === 'Monthly' ? 5 : 3
          });
        }
      } catch (err) {
        console.error('❌ Error fetching membership info:', err);
      }
    };

    fetchMembershipInfo();
  }, []);

  // Fetch gym capacity
  useEffect(() => {
    const fetchCapacity = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/attendance/capacity');
        const data = await response.json();
        if (data.success && data.maxCapacity) {
          setMaxCapacity(data.maxCapacity);
        } else {
          setMaxCapacity(0);
        }
      } catch (err) {
        console.error('Error fetching capacity:', err);
        setMaxCapacity(0);
      }
    };
    fetchCapacity();
  }, []);

  // Fetch user bookings
  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        console.log('🔍 Starting to fetch user bookings...');
        
        const contactNumber = getContactNumberFromStorage();
        console.log('🔍 Contact number retrieved:', contactNumber);
        
        if (!contactNumber) {
          console.warn('⚠️ No contact number found in localStorage');
          return;
        }
        
        const sessionsResponse = await fetch('http://localhost:8000/api/sessions');
        
        if (!sessionsResponse.ok) {
          console.error('❌ Failed to fetch sessions:', sessionsResponse.status);
          return;
        }
        
        const allSessions = await sessionsResponse.json();
        console.log('📋 Total sessions from server:', allSessions.length);
        
        const userContactNormalized = normalizeContact(contactNumber);
        
        const userSessions = allSessions.filter(session => {
          const sessionContactNormalized = normalizeContact(session.client_contact);
          return sessionContactNormalized === userContactNormalized;
        });
        
        console.log(`✅ Found ${userSessions.length} bookings for contact: ${contactNumber}`);
        
        const transformedBookings = userSessions.map(session => {
          const sessionType = sessionTypes.find(st => st.name === session.session_type);
          
          return {
            id: session.session_id,
            name: session.client_name,
            email: session.client_email,
            phone: session.client_contact,
            date: formatDate(session.session_date),
            time: formatTime(session.session_timein),
            timeout: formatTime(session.session_timeout),
            session: session.session_type,
            sessionId: sessionType?.id || 0,
            bgClass: sessionType?.bgClass || 'bg-secondary',
            badgeClass: sessionType?.badgeClass || 'badge-secondary',
            trainer: session.trainer_name || '',
            status: session.status === 'pending' ? 'Pending' : 
                   session.status === 'approved' ? 'Approved' : 
                   session.status === 'cancelled' ? 'Cancelled' : 'Pending',
            requestDate: new Date(session.created_at).toLocaleDateString()
          };
        });
        
        setBookings(transformedBookings);
        
        // Calculate remaining bookings
        const activeBookings = transformedBookings.filter(b => 
          b.status === 'Pending' || b.status === 'Approved'
        ).length;
        
        setRemainingBookings(bookingLimit - activeBookings);
        
        console.log('✅ Bookings loaded successfully:', transformedBookings.length);
        
      } catch (err) {
        console.error('❌ Error fetching user bookings:', err);
      }
    };
    
    if (bookingLimit > 0) {
      fetchUserBookings();
    }
  }, [bookingLimit]);

  const handleBooking = async (session) => {
    // Check if membership info is loaded
    if (!membershipInfo) {
      alert('⚠️ Unable to load membership information. Please refresh the page.');
      return;
    }

    // Check if membership has expired
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const membershipEndDate = new Date(membershipInfo.membership_end);
    membershipEndDate.setHours(0, 0, 0, 0);
    
    if (today > membershipEndDate) {
      alert('❌ Booking Failed: Your membership has expired on ' + new Date(membershipInfo.membership_end).toLocaleDateString() + '. Please renew your membership to continue booking sessions.');
      return;
    }

    // Check membership type
    if (membershipInfo.membership_type !== 'Monthly' && membershipInfo.membership_type !== 'Weekly') {
      alert('⚠️ Your membership type does not allow session bookings. Please upgrade your membership.');
      return;
    }

    // Check booking limit
    const activeBookingsCount = bookings.filter(b => 
      b.status === 'Pending' || b.status === 'Approved'
    ).length;

    if (activeBookingsCount >= bookingLimit) {
      alert(`⚠️ You have reached your booking limit of ${bookingLimit} sessions for ${membershipInfo.membership_type} membership. Please cancel an existing booking or wait for a session to complete.`);
      return;
    }

    // Check if user already has a booking for this session type
    const existingBooking = bookings.find(b => 
      b.session === session.name && 
      (b.status === 'Pending' || b.status === 'Approved')
    );
    
    if (existingBooking) {
      alert(`⚠️ You already have a ${existingBooking.status.toLowerCase()} booking for ${session.name}. Please cancel your existing booking first or wait for it to be completed.`);
      return;
    }
    
    setSelectedSession(session);
    setShowBookingForm(true);
    setBookedTimeSlots([]);
    
    try {
      const memberIdFromStorage = localStorage.getItem('memberId') || 
                                   localStorage.getItem('member_id') || 
                                   localStorage.getItem('userId');
      
      let userId = memberIdFromStorage;
      
      const userStr = localStorage.getItem('user') || localStorage.getItem('userData');
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          userId = userId || userObj.userId || userObj.id || userObj.member_id;
        } catch (e) {
          console.error('Could not parse user object:', e);
        }
      }
      
      const contactNumber = getContactNumberFromStorage();
      
      if (userId) {
        const response = await fetch(`http://localhost:8000/api/members/${userId}`);
        const data = await response.json();
        
        if (data) {
          setMemberData(data);
          setFormData({
            name: data.member_name || '',
            email: data.email || '',
            phone: data.contact_number || contactNumber || '',
            date: '',
            time: ''
          });
        }
      } else if (contactNumber) {
        const response = await fetch('http://localhost:8000/api/members');
        const members = await response.json();
        const member = members.find(m => 
          normalizeContact(m.contact_number) === normalizeContact(contactNumber)
        );
        
        if (member) {
          setMemberData(member);
          setFormData({
            name: member.member_name || '',
            email: member.email || '',
            phone: member.contact_number || '',
            date: '',
            time: ''
          });
        }
      } else {
        const contactFromStorage = getContactNumberFromStorage();
        setFormData({
          name: '',
          email: '',
          phone: contactFromStorage || '',
          date: '',
          time: ''
        });
      }
    } catch (err) {
      console.error('❌ Error fetching member data:', err);
    }
  };

  const fetchBookedTimeSlotsForDate = async (selectedDate) => {
    if (!selectedDate) {
      setBookedTimeSlots([]);
      return;
    }
    
    try {
      const contactNumber = getContactNumberFromStorage();
      if (!contactNumber) return;
      
      const sessionsResponse = await fetch('http://localhost:8000/api/sessions');
      const allSessions = await sessionsResponse.json();
      
      const sessionsOnDate = allSessions.filter(session => {
        const sessionDate = new Date(session.session_date).toISOString().split('T')[0];
        
        return sessionDate === selectedDate && 
               normalizeContact(session.client_contact) === normalizeContact(contactNumber) &&
               (session.status === 'pending' || session.status === 'approved');
      });
      
      const bookedTimes = sessionsOnDate.map(session => formatTime(session.session_timein));
      
      console.log('🕒 Booked time slots for', selectedDate, ':', bookedTimes);
      setBookedTimeSlots(bookedTimes);
      
    } catch (error) {
      console.error('Error fetching booked time slots:', error);
      setBookedTimeSlots([]);
    }
  };

  const handleDateChange = (selectedDate) => {
    setFormData({...formData, date: selectedDate, time: ''});
    fetchBookedTimeSlotsForDate(selectedDate);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if selected date is beyond membership end date
    if (membershipInfo && formData.date) {
      const selectedDate = new Date(formData.date);
      selectedDate.setHours(0, 0, 0, 0);
      const membershipEndDate = new Date(membershipInfo.membership_end);
      membershipEndDate.setHours(0, 0, 0, 0);
      
      if (selectedDate > membershipEndDate) {
        alert('❌ Booking Failed: Selected date (' + new Date(formData.date).toLocaleDateString() + ') is beyond your membership end date (' + new Date(membershipInfo.membership_end).toLocaleDateString() + '). Please select a date within your membership period.');
        return;
      }
    }
    
    try {
      const bookingData = {
        client_name: formData.name || '',
        client_contact: formData.phone || '',
        client_email: formData.email || '',
        session_type: selectedSession.name || '',
        session_date: formData.date || '',
        session_timein: convertTo24Hour(formData.time),
        session_timeout: calculateTimeout(formData.time, selectedSession.durationMinutes),
        trainer_name: '',
        notes: 'Booked via member portal',
        status: 'pending'
      };

      if (!bookingData.client_name || !bookingData.client_contact || !bookingData.session_date || !bookingData.session_timein) {
        alert('⚠️ Please fill in all required fields: Name, Contact, Date, and Time');
        return;
      }

      console.log('📤 Sending booking data:', bookingData);

      const response = await fetch('http://localhost:8000/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();
      console.log('📥 Server response:', result);

      if (response.ok && result.success) {
        const newBooking = {
          id: result.data?.session_id || Date.now(),
          ...formData,
          session: selectedSession.name,
          sessionId: selectedSession.id,
          bgClass: selectedSession.bgClass,
          badgeClass: selectedSession.badgeClass,
          trainer: '',
          status: 'Pending',
          requestDate: new Date().toLocaleDateString()
        };
        
        const updatedBookings = [...bookings, newBooking];
        setBookings(updatedBookings);
        
        // Update remaining bookings
        const activeCount = updatedBookings.filter(b => 
          b.status === 'Pending' || b.status === 'Approved'
        ).length;
        setRemainingBookings(bookingLimit - activeCount);
        
        setFormData({ name: '', email: '', phone: '', date: '', time: '' });
        setShowBookingForm(false);
        setSelectedSession(null);
        setMemberData(null);
        
        alert(`✅ Booking request submitted successfully! You have ${bookingLimit - activeCount} bookings remaining. 💪`);
      } else {
        console.error('❌ Booking failed:', result);
        const errorMsg = result.error || result.details || 'Unknown error occurred';
        alert(`Failed to submit booking: ${errorMsg}`);
      }
    } catch (error) {
      console.error('❌ Error submitting booking:', error);
      alert('Error submitting booking. Please check your connection and try again.');
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8000/api/sessions/${bookingId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        const updatedBookings = bookings.filter(b => b.id !== bookingId);
        setBookings(updatedBookings);
        
        // Update remaining bookings
        const activeCount = updatedBookings.filter(b => 
          b.status === 'Pending' || b.status === 'Approved'
        ).length;
        setRemainingBookings(bookingLimit - activeCount);
        
        alert('✅ Booking cancelled successfully');
      } else {
        alert('❌ Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('❌ Error cancelling booking');
    }
  };

  const refreshBookings = async () => {
    try {
      const contactNumber = getContactNumberFromStorage();
      
      if (!contactNumber) {
        alert('⚠️ No contact number found. Please log in again.');
        return;
      }
      
      const sessionsResponse = await fetch('http://localhost:8000/api/sessions');
      const allSessions = await sessionsResponse.json();
      
      const userContactNormalized = normalizeContact(contactNumber);
      const userSessions = allSessions.filter(session => 
        normalizeContact(session.client_contact) === userContactNormalized
      );
      
      const transformedBookings = userSessions.map(session => {
        const sessionType = sessionTypes.find(st => st.name === session.session_type);
        
        return {
          id: session.session_id,
          name: session.client_name,
          email: session.client_email,
          phone: session.client_contact,
          date: formatDate(session.session_date),
          time: formatTime(session.session_timein),
          timeout: formatTime(session.session_timeout),
          session: session.session_type,
          sessionId: sessionType?.id || 0,
          bgClass: sessionType?.bgClass || 'bg-secondary',
          badgeClass: sessionType?.badgeClass || 'badge-secondary',
          trainer: session.trainer_name || '',
          status: session.status === 'pending' ? 'Pending' : 
                 session.status === 'approved' ? 'Approved' : 
                 session.status === 'cancelled' ? 'Cancelled' : 'Pending',
          requestDate: new Date(session.created_at).toLocaleDateString()
        };
      });
      
      setBookings(transformedBookings);
      
      // Update remaining bookings
      const activeCount = transformedBookings.filter(b => 
        b.status === 'Pending' || b.status === 'Approved'
      ).length;
      setRemainingBookings(bookingLimit - activeCount);
      
      alert('✅ Bookings refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing bookings:', error);
      alert('❌ Error refreshing bookings');
    }
  };

  // Get max date for booking (membership end date)
  const getMaxBookingDate = () => {
    if (!membershipInfo || !membershipInfo.membership_end) {
      return null;
    }
    return membershipInfo.membership_end;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '2rem' }}>
      <div className="container-fluid">
        <div className="card shadow-sm mb-4">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="h3 fw-bold mb-2">Session Booking</h1>
                <p className="text-muted mb-0">Track and manage your workout sessions</p>
              </div>
              <button 
                className="btn btn-warning text-white fw-semibold"
                onClick={refreshBookings}
              >
                <Calendar className="me-2" size={20} />
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Membership Info Alert */}
        {membershipInfo && (
          <div className="alert alert-info d-flex align-items-center mb-4" style={{backgroundColor: '#0d6efd', borderColor: '#0d6efd'}}>
            <AlertCircle className="me-3 text-white" size={24} />
            <div className="flex-grow-1 text-white">
              <strong>Membership: {membershipInfo.membership_type}</strong>
              <br />
              <span className="small">
                Booking Limit: {bookingLimit} sessions | 
                Remaining: {remainingBookings} bookings | 
                Valid Until: {new Date(membershipInfo.membership_end).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {!showBookingForm && (
          <div className="row g-4 mb-4">
            <div className="col-md-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="bg-success p-3 rounded">
                      <Calendar className="text-white" size={24} />
                    </div>
                    <span className="badge bg-success">{bookings.length} total</span>
                  </div>
                  <p className="text-muted text-uppercase small mb-1 fw-semibold">TOTAL REQUESTS</p>
                  <h2 className="fw-bold mb-0">{bookings.length}</h2>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="bg-warning p-3 rounded">
                      <Clock className="text-white" size={24} />
                    </div>
                    <span className="badge bg-warning text-white">{bookings.filter(b => b.status === 'Pending').length}</span>
                  </div>
                  <p className="text-muted text-uppercase small mb-1 fw-semibold">PENDING</p>
                  <h2 className="fw-bold mb-0">{bookings.filter(b => b.status === 'Pending').length}</h2>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="bg-success p-3 rounded">
                      <CheckCircle className="text-white" size={24} />
                    </div>
                    <span className="badge bg-success">{bookings.filter(b => b.status === 'Approved').length}</span>
                  </div>
                  <p className="text-muted text-uppercase small mb-1 fw-semibold">APPROVED</p>
                  <h2 className="fw-bold mb-0">{bookings.filter(b => b.status === 'Approved').length}</h2>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="bg-primary p-3 rounded">
                      <Dumbbell className="text-white" size={24} />
                    </div>
                    <span className="badge bg-primary">{remainingBookings}/{bookingLimit}</span>
                  </div>
                  <p className="text-muted text-uppercase small mb-1 fw-semibold">BOOKINGS LEFT</p>
                  <h2 className="fw-bold mb-0">{remainingBookings}</h2>
                </div>
              </div>
            </div>
          </div>
        )}

        {!showBookingForm && (
          <div className="mb-4">
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'available' ? 'active' : ''}`}
                  onClick={() => setActiveTab('available')}
                >
                  <Zap size={18} className="me-2" />
                  Available Sessions
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'requests' ? 'active' : ''}`}
                  onClick={() => setActiveTab('requests')}
                >
                  <Calendar size={18} className="me-2" />
                  My Booking Requests
                </button>
              </li>
            </ul>
          </div>
        )}

        {!showBookingForm && activeTab === 'requests' && (
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="h4 fw-bold mb-4 d-flex align-items-center">
                <Calendar className="text-warning me-3" size={28} />
                My Booking Requests
              </h2>
              
              {bookings.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Request Date</th>
                        <th>Session</th>
                        <th>Name</th>
                        <th>Trainer</th>
                        <th>Scheduled Date</th>
                        <th>Time In</th>
                        <th>Time Out</th>
                        <th>Contact</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.id}>
                          <td className="text-muted small">{booking.requestDate}</td>
                          <td className="fw-semibold">{booking.session}</td>
                          <td>{booking.name}</td>
                          <td>
                            {booking.status === 'Approved' && booking.trainer ? (
                              <span className="badge bg-info">{booking.trainer}</span>
                            ) : (
                              <span className="badge bg-secondary">Unassigned</span>
                            )}
                          </td>
                          <td>{booking.date}</td>
                          <td>{booking.time}</td>
                          <td>{booking.timeout}</td>
                          <td className="text-muted small">{booking.phone}</td>
                          <td>
                            <span className={`badge ${
                              booking.status === 'Pending' ? 'bg-warning text-dark' : 
                              booking.status === 'Approved' ? 'bg-success' : 
                              'bg-danger'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => handleCancel(booking.id)}
                              className="btn btn-sm btn-outline-danger"
                              disabled={booking.status === 'Approved'}
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <Calendar className="text-muted mb-3" size={48} />
                  <p className="text-muted">No booking requests yet. Book a session to get started!</p>
                  <button 
                    className="btn btn-warning text-white mt-3"
                    onClick={() => setActiveTab('available')}
                  >
                    Browse Sessions
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {!showBookingForm && activeTab === 'available' && (
          <div>
            <div className="row g-4 mb-4">
              {sessionTypes.map((session) => {
                const Icon = session.icon;
                const hasActiveBooking = bookings.find(b => 
                  b.session === session.name && 
                  (b.status === 'Pending' || b.status === 'Approved')
                );
                
                const canBook = remainingBookings > 0 && membershipInfo;
                
                return (
                  <div key={session.id} className="col-md-6">
                    <div className={`card shadow-sm h-100 ${hasActiveBooking ? 'border-success border-3' : ''}`}>
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start mb-4">
                          <div className={`${session.iconBg} p-3 rounded`}>
                            <Icon className="text-white" size={32} />
                          </div>
                          {hasActiveBooking && (
                            <span className="badge bg-success">
                              {hasActiveBooking.status === 'Approved' ? 'Booked' : 'Pending'}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="h5 fw-bold mb-3">{session.name.toUpperCase()}</h3>
                        <p className="text-muted mb-4">{session.description}</p>
                        
                        <div className="mb-4">
                          <div className="d-flex align-items-center text-muted mb-2">
                            <Clock size={16} className="me-2" />
                            <span className="small">{session.duration}</span>
                          </div>
                          <div className="d-flex align-items-center text-muted">
                            <Users size={16} className="me-2" />
                            <span className="small">Max Capacity: {maxCapacity || 'Loading...'}</span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleBooking(session)}
                          className={`btn ${hasActiveBooking || !canBook ? 'btn-secondary' : 'btn-warning text-white'} fw-semibold w-100`}
                          disabled={!!hasActiveBooking || !canBook}
                        >
                          {hasActiveBooking 
                            ? `Already Booked (${hasActiveBooking.status})` 
                            : !canBook 
                            ? 'Booking Limit Reached' 
                            : 'Book Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {showBookingForm && selectedSession && (
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4">
              <div className="mb-4">
                <h2 className="h4 fw-bold mb-2">Book {selectedSession.name}</h2>
                <p className="text-muted">{selectedSession.description}</p>
                {membershipInfo && (
                  <div className="alert alert-warning d-flex align-items-center mt-3">
                    <AlertCircle className="me-2 text-dark" size={20} />
                    <small className="text-dark">
                      You have <strong>{remainingBookings}</strong> booking(s) remaining. 
                      You can book sessions until <strong>{new Date(membershipInfo.membership_end).toLocaleDateString()}</strong>
                    </small>
                  </div>
                )}
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter your name"
                    disabled={memberData !== null}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-semibold">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="your@email.com"
                    disabled={memberData !== null}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-semibold">Phone Number *</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="09XX XXX XXXX"
                    disabled={memberData !== null}
                    required
                  />
                </div>
                
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.date}
                      onChange={(e) => handleDateChange(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      max={getMaxBookingDate()}
                      required
                    />
                    {membershipInfo && (
                      <small className="text-muted">
                        Bookable until: {new Date(membershipInfo.membership_end).toLocaleDateString()}
                      </small>
                    )}
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Time Slot *</label>
                    <select
                      className="form-select"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      required
                      disabled={!formData.date}
                    >
                      <option value="">{formData.date ? 'Select time slot' : 'Select a date first'}</option>
                      {selectedSession.durationMinutes === 45 ? (
                        <>
                          {!bookedTimeSlots.includes('08:00 AM') && <option value="08:00 AM">08:00 AM - 08:45 AM</option>}
                          {!bookedTimeSlots.includes('09:00 AM') && <option value="09:00 AM">09:00 AM - 09:45 AM</option>}
                          {!bookedTimeSlots.includes('10:00 AM') && <option value="10:00 AM">10:00 AM - 10:45 AM</option>}
                          {!bookedTimeSlots.includes('11:00 AM') && <option value="11:00 AM">11:00 AM - 11:45 AM</option>}
                          {!bookedTimeSlots.includes('12:00 PM') && <option value="12:00 PM">12:00 PM - 12:45 PM</option>}
                          {!bookedTimeSlots.includes('01:00 PM') && <option value="01:00 PM">01:00 PM - 01:45 PM</option>}
                          {!bookedTimeSlots.includes('02:00 PM') && <option value="02:00 PM">02:00 PM - 02:45 PM</option>}
                          {!bookedTimeSlots.includes('03:00 PM') && <option value="03:00 PM">03:00 PM - 03:45 PM</option>}
                          {!bookedTimeSlots.includes('04:00 PM') && <option value="04:00 PM">04:00 PM - 04:45 PM</option>}
                          {!bookedTimeSlots.includes('05:00 PM') && <option value="05:00 PM">05:00 PM - 05:45 PM</option>}
                          {!bookedTimeSlots.includes('06:00 PM') && <option value="06:00 PM">06:00 PM - 06:45 PM</option>}
                          {!bookedTimeSlots.includes('07:00 PM') && <option value="07:00 PM">07:00 PM - 07:45 PM</option>}
                          {!bookedTimeSlots.includes('08:00 PM') && <option value="08:00 PM">08:00 PM - 08:45 PM</option>}
                          {!bookedTimeSlots.includes('09:00 PM') && <option value="09:00 PM">09:00 PM - 09:45 PM</option>}
                        </>
                      ) : (
                        <>
                          {!bookedTimeSlots.includes('08:00 AM') && <option value="08:00 AM">08:00 AM - 09:00 AM</option>}
                          {!bookedTimeSlots.includes('09:00 AM') && <option value="09:00 AM">09:00 AM - 10:00 AM</option>}
                          {!bookedTimeSlots.includes('10:00 AM') && <option value="10:00 AM">10:00 AM - 11:00 AM</option>}
                          {!bookedTimeSlots.includes('11:00 AM') && <option value="11:00 AM">11:00 AM - 12:00 PM</option>}
                          {!bookedTimeSlots.includes('12:00 PM') && <option value="12:00 PM">12:00 PM - 01:00 PM</option>}
                          {!bookedTimeSlots.includes('01:00 PM') && <option value="01:00 PM">01:00 PM - 02:00 PM</option>}
                          {!bookedTimeSlots.includes('02:00 PM') && <option value="02:00 PM">02:00 PM - 03:00 PM</option>}
                          {!bookedTimeSlots.includes('03:00 PM') && <option value="03:00 PM">03:00 PM - 04:00 PM</option>}
                          {!bookedTimeSlots.includes('04:00 PM') && <option value="04:00 PM">04:00 PM - 05:00 PM</option>}
                          {!bookedTimeSlots.includes('05:00 PM') && <option value="05:00 PM">05:00 PM - 06:00 PM</option>}
                          {!bookedTimeSlots.includes('06:00 PM') && <option value="06:00 PM">06:00 PM - 07:00 PM</option>}
                          {!bookedTimeSlots.includes('07:00 PM') && <option value="07:00 PM">07:00 PM - 08:00 PM</option>}
                          {!bookedTimeSlots.includes('08:00 PM') && <option value="08:00 PM">08:00 PM - 09:00 PM</option>}
                          {!bookedTimeSlots.includes('09:00 PM') && <option value="09:00 PM">09:00 PM - 10:00 PM</option>}
                        </>
                      )}
                    </select>
                    {bookedTimeSlots.length > 0 && (
                      <small className="text-danger">
                        You have {bookedTimeSlots.length} slot(s) already booked on this date
                      </small>
                    )}
                  </div>
                </div>

                <div className="d-flex gap-3">
                  <button 
                    type="submit"
                    className="btn btn-warning text-white fw-semibold flex-fill"
                    disabled={!formData.name || !formData.email || !formData.phone || !formData.date || !formData.time}
                  >
                    <CheckCircle size={20} className="me-2" />
                    Confirm Booking
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBookingForm(false);
                      setSelectedSession(null);
                      setMemberData(null);
                      setFormData({ name: '', email: '', phone: '', date: '', time: '' });
                      setBookedTimeSlots([]);
                    }}
                    className="btn btn-secondary fw-semibold flex-fill"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GymBookingSessions;