import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext.jsx';

function UserLogs() {
    const { user } = useAuth();
    const memberId = user?.id;

    const [userInfo, setUserInfo] = useState(null);
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [filteredAttendance, setFilteredAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentDateTime, setCurrentDateTime] = useState({ date: '', time: '' });
    const [filterOption, setFilterOption] = useState('last7'); // 'last7', 'last30', 'all', 'custom'
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Configure axios - Match your backend port
    axios.defaults.baseURL = 'http://127.0.0.1:8000';
    axios.defaults.withCredentials = false;

    useEffect(() => {
        if (memberId) {
            fetchUserAttendance();
            fetchCurrentDateTime();
            
            // Refresh attendance every 30 seconds
            const interval = setInterval(() => {
                fetchUserAttendance();
                fetchCurrentDateTime();
            }, 30000);
            
            return () => clearInterval(interval);
        } else {
            setError('No user logged in. Please log in to view your attendance.');
            setLoading(false);
        }
    }, [memberId]);

    const fetchCurrentDateTime = async () => {
        try {
            const response = await axios.get('/api/attendance/today');
            if (response.data.currentDate && response.data.currentTime) {
                setCurrentDateTime({ 
                    date: response.data.currentDate, 
                    time: response.data.currentTime 
                });
            }
        } catch (err) {
            console.error('Error fetching date/time:', err);
        }
    };

    const fetchUserAttendance = async () => {
        if (!memberId) {
            setError('Member ID not available. Please log in again.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Fetch member data using memberId (same as Membership component)
            const memberResponse = await axios.get(`/api/members/${memberId}`);
            const member = memberResponse.data;

            console.log('✅ Member data:', member);

            const userName = member.member_name;
            const contactNumber = member.contact_number;

            // Fetch all attendance records
            const attendanceResponse = await axios.get('/api/attendance');
            const attendanceData = attendanceResponse.data;

            if (attendanceData.data && attendanceData.data.length > 0) {
                // Filter records for the logged-in user by name
                const userRecords = attendanceData.data.filter(record => 
                    record.fullName === userName
                );

                console.log('✅ User attendance records:', userRecords);

                if (userRecords.length > 0) {
                    // Get the most recent record
                    const latestRecord = userRecords[0];
                    
                    setUserInfo({
                        name: userName,
                        contactNumber: contactNumber,
                        membershipType: member.membership_type,
                        lastCheckIn: latestRecord.timeIn ? `${latestRecord.date} - ${latestRecord.timeIn}` : 'N/A',
                        currentStatus: latestRecord.status === 'Present' ? 'Checked In' : 'Checked Out',
                        totalVisits: userRecords.length
                    });

                    // Store all records
                    setAttendanceHistory(userRecords);
                    // Apply initial filter
                    applyFilter(userRecords, filterOption);
                } else {
                    // User has no attendance records yet
                    setUserInfo({
                        name: userName,
                        contactNumber: contactNumber,
                        membershipType: member.membership_type,
                        lastCheckIn: 'No records yet',
                        currentStatus: 'No activity',
                        totalVisits: 0
                    });
                    setAttendanceHistory([]);
                    setFilteredAttendance([]);
                }
            } else {
                setError('No attendance records available');
            }
        } catch (err) {
            console.error('❌ Error fetching attendance:', err);
            setError(err.response?.data?.message || 'Failed to load attendance records');
        } finally {
            setLoading(false);
        }
    };

    const applyFilter = (records, filter) => {
        let filtered = [];
        
        switch(filter) {
            case 'last7':
                filtered = records.slice(0, 7);
                break;
            case 'last30':
                filtered = records.slice(0, 30);
                break;
            case 'all':
                filtered = records;
                break;
            case 'custom':
                if (startDate && endDate) {
                    filtered = records.filter(record => {
                        const recordDate = new Date(record.date);
                        const start = new Date(startDate);
                        const end = new Date(endDate);
                        return recordDate >= start && recordDate <= end;
                    });
                } else {
                    filtered = records;
                }
                break;
            default:
                filtered = records.slice(0, 7);
        }
        
        setFilteredAttendance(filtered);
    };

    const handleFilterChange = (newFilter) => {
        setFilterOption(newFilter);
        if (newFilter === 'custom') {
            setShowDatePicker(true);
        } else {
            setShowDatePicker(false);
            applyFilter(attendanceHistory, newFilter);
        }
    };

    const handleDateRangeApply = () => {
        if (!startDate || !endDate) {
            alert('Please select both start and end dates');
            return;
        }
        
        if (new Date(startDate) > new Date(endDate)) {
            alert('Start date must be before end date');
            return;
        }
        
        applyFilter(attendanceHistory, 'custom');
    };

    const handleClearDateRange = () => {
        setStartDate('');
        setEndDate('');
        setShowDatePicker(false);
        setFilterOption('last7');
        applyFilter(attendanceHistory, 'last7');
    };

    const calculateDuration = (timeIn, timeOut) => {
        if (!timeIn || !timeOut || timeOut === '12:00:00 AM') return 'In Progress';

        try {
            const parseTime = (timeStr) => {
                const [time, period] = timeStr.split(' ');
                let [hours, minutes] = time.split(':').map(Number);
                
                if (period === 'PM' && hours !== 12) hours += 12;
                if (period === 'AM' && hours === 12) hours = 0;
                
                return hours * 60 + minutes;
            };

            const inMinutes = parseTime(timeIn);
            const outMinutes = parseTime(timeOut);
            const duration = outMinutes - inMinutes;

            if (duration < 0) return 'Invalid';

            const hours = Math.floor(duration / 60);
            const minutes = duration % 60;

            return `${hours}h ${minutes}m`;
        } catch (err) {
            return 'N/A';
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>
                    <div style={styles.spinner}></div>
                    <p>Loading your attendance records...</p>
                </div>
            </div>
        );
    }

    if (error && !userInfo) {
        return (
            <div style={styles.container}>
                <div style={styles.errorBox}>
                    <span style={styles.errorIcon}>⚠️</span>
                    <div>
                        <h3 style={styles.errorTitle}>Error</h3>
                        <p style={styles.errorMessage}>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>📅 Attendance Log</h2>

            {currentDateTime.date && (
                <div style={styles.dateTime}>
                    <p><strong>Current Date:</strong> {currentDateTime.date}</p>
                    <p><strong>Current Time:</strong> {currentDateTime.time}</p>
                </div>
            )}

            {userInfo && (
                <>
                    <div style={styles.checkinStatus}>
                        <h3 style={styles.statusTitle}>✅ Check-In Status</h3>
                        <div style={styles.infoGrid}>
                            <div style={styles.infoItem}>
                                <p style={styles.infoLabel}>Name:</p>
                                <p style={styles.infoValue}>{userInfo.name}</p>
                            </div>
                            <div style={styles.infoItem}>
                                <p style={styles.infoLabel}>Membership:</p>
                                <p style={styles.infoValue}>{userInfo.membershipType}</p>
                            </div>
                            <div style={styles.infoItem}>
                                <p style={styles.infoLabel}>Last Check-In:</p>
                                <p style={styles.infoValue}>{userInfo.lastCheckIn}</p>
                            </div>
                            <div style={styles.infoItem}>
                                <p style={styles.infoLabel}>Current Status:</p>
                                <span style={{
                                    ...styles.statusBadge,
                                    backgroundColor: userInfo.currentStatus === 'Checked In' ? '#22c55e' : '#64748b'
                                }}>
                                    {userInfo.currentStatus}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Filter Options */}
                    <div style={styles.filterContainer}>
                        <div style={styles.filterLabel}>
                            <span>📊 Show:</span>
                            <span style={styles.recordCount}>
                                ({filteredAttendance.length} of {attendanceHistory.length} records)
                            </span>
                        </div>
                        <div style={styles.filterButtons}>
                            <button 
                                style={{
                                    ...styles.filterButton,
                                    ...(filterOption === 'last7' ? styles.filterButtonActive : {})
                                }}
                                onClick={() => handleFilterChange('last7')}
                            >
                                Last 7 Days
                            </button>
                            <button 
                                style={{
                                    ...styles.filterButton,
                                    ...(filterOption === 'last30' ? styles.filterButtonActive : {})
                                }}
                                onClick={() => handleFilterChange('last30')}
                            >
                                Last 30 Days
                            </button>
                            <button 
                                style={{
                                    ...styles.filterButton,
                                    ...(filterOption === 'all' ? styles.filterButtonActive : {})
                                }}
                                onClick={() => handleFilterChange('all')}
                            >
                                All Time
                            </button>
                            <button 
                                style={{
                                    ...styles.filterButton,
                                    ...(filterOption === 'custom' ? styles.filterButtonActive : {})
                                }}
                                onClick={() => handleFilterChange('custom')}
                            >
                                📅 Custom Range
                            </button>
                        </div>
                    </div>

                    {/* Custom Date Range Picker */}
                    {showDatePicker && (
                        <div style={styles.datePickerContainer}>
                            <div style={styles.datePickerHeader}>
                                <h4 style={styles.datePickerTitle}>Select Date Range</h4>
                            </div>
                            <div style={styles.dateInputs}>
                                <div style={styles.dateInputGroup}>
                                    <label style={styles.dateLabel}>Start Date:</label>
                                    <input 
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        style={styles.dateInput}
                                        max={endDate || new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div style={styles.dateInputGroup}>
                                    <label style={styles.dateLabel}>End Date:</label>
                                    <input 
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        style={styles.dateInput}
                                        min={startDate}
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>
                            <div style={styles.datePickerActions}>
                                <button 
                                    onClick={handleClearDateRange}
                                    style={styles.clearButton}
                                >
                                    Clear
                                </button>
                                <button 
                                    onClick={handleDateRangeApply}
                                    style={styles.applyButton}
                                >
                                    Apply Filter
                                </button>
                            </div>
                            {startDate && endDate && (
                                <div style={styles.dateRangeInfo}>
                                    <span style={styles.infoIcon}>ℹ️</span>
                                    Showing records from {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            <div style={styles.attendanceLog}>
                {filteredAttendance.length > 0 ? (
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Date</th>
                                    <th style={styles.th}>Time In</th>
                                    <th style={styles.th}>Time Out</th>
                                    <th style={styles.th}>Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAttendance.map((record, index) => (
                                    <tr key={record.id || index} style={styles.tr}>
                                        <td style={styles.td}>{formatDate(record.date)}</td>
                                        <td style={styles.td}>{record.timeIn || 'N/A'}</td>
                                        <td style={styles.td}>{record.timeOut || '-'}</td>
                                        <td style={styles.td}>
                                            {calculateDuration(record.timeIn, record.timeOut)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={styles.noRecords}>
                        <span style={styles.noRecordsIcon}>📊</span>
                        <h3 style={styles.noRecordsTitle}>No Attendance Records</h3>
                        <p style={styles.noRecordsText}>
                            You haven't checked in yet. Start your fitness journey today!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: '24px',
        maxWidth: '100%',
        width: '100%',
        margin: '0',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#f9fafb',
        boxSizing: 'border-box'
    },
    title: {
        fontSize: '28px',
        fontWeight: '700',
        marginBottom: '24px',
        color: '#111827'
    },
    loading: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '16px'
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '4px solid #e5e7eb',
        borderTop: '4px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '16px'
    },
    dateTime: {
        backgroundColor: '#ffffff',
        padding: '16px',
        borderRadius: '12px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: '24px',
        flexWrap: 'wrap'
    },
    errorBox: {
        display: 'flex',
        gap: '16px',
        padding: '20px',
        backgroundColor: '#fee2e2',
        borderRadius: '12px',
        border: '1px solid #fecaca'
    },
    errorIcon: {
        fontSize: '24px'
    },
    errorTitle: {
        margin: '0 0 8px 0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#991b1b'
    },
    errorMessage: {
        margin: 0,
        color: '#7f1d1d',
        fontSize: '14px'
    },
    checkinStatus: {
        backgroundColor: '#ffffff',
        padding: '24px',
        borderRadius: '12px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '2px solid #86efac'
    },
    statusTitle: {
        margin: '0 0 20px 0',
        fontSize: '20px',
        fontWeight: '600',
        color: '#111827'
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
    },
    infoItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    infoLabel: {
        margin: 0,
        fontSize: '14px',
        color: '#6b7280',
        fontWeight: '500'
    },
    infoValue: {
        margin: 0,
        fontSize: '16px',
        color: '#111827',
        fontWeight: '600'
    },
    statusBadge: {
        display: 'inline-block',
        padding: '6px 16px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '600',
        color: 'white',
        width: 'fit-content'
    },
    attendanceLog: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    tableContainer: {
        overflowX: 'auto'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse'
    },
    th: {
        backgroundColor: '#f3f4f6',
        color: '#374151',
        padding: '12px 16px',
        textAlign: 'left',
        fontWeight: '600',
        fontSize: '14px',
        borderBottom: '2px solid #e5e7eb'
    },
    tr: {
        borderBottom: '1px solid #e5e7eb',
        transition: 'background-color 0.2s'
    },
    td: {
        padding: '16px',
        color: '#374151',
        fontSize: '14px'
    },
    noRecords: {
        padding: '60px 20px',
        textAlign: 'center',
        color: '#6b7280'
    },
    noRecordsIcon: {
        fontSize: '48px',
        display: 'block',
        marginBottom: '16px'
    },
    noRecordsTitle: {
        margin: '0 0 8px 0',
        fontSize: '20px',
        fontWeight: '600',
        color: '#374151'
    },
    noRecordsText: {
        margin: 0,
        fontSize: '14px',
        color: '#6b7280'
    },
    filterContainer: {
        backgroundColor: '#ffffff',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
    },
    filterLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '16px',
        fontWeight: '600',
        color: '#374151'
    },
    recordCount: {
        fontSize: '14px',
        color: '#6b7280',
        fontWeight: '400'
    },
    filterButtons: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
    },
    filterButton: {
        padding: '10px 20px',
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        color: '#374151',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s',
        outline: 'none'
    },
    filterButtonActive: {
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        borderColor: '#3b82f6'
    },
    datePickerContainer: {
        backgroundColor: '#ffffff',
        padding: '24px',
        borderRadius: '12px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '2px solid #3b82f6'
    },
    datePickerHeader: {
        marginBottom: '20px'
    },
    datePickerTitle: {
        margin: 0,
        fontSize: '18px',
        fontWeight: '600',
        color: '#111827'
    },
    dateInputs: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
    },
    dateInputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    dateLabel: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151'
    },
    dateInput: {
        padding: '10px 12px',
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#111827',
        outline: 'none',
        transition: 'border-color 0.2s'
    },
    datePickerActions: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
        marginTop: '16px'
    },
    clearButton: {
        padding: '10px 24px',
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        color: '#6b7280',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    applyButton: {
        padding: '10px 24px',
        border: 'none',
        borderRadius: '8px',
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    dateRangeInfo: {
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#eff6ff',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#1e40af',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    infoIcon: {
        fontSize: '16px'
    }
};

export default UserLogs;