import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registrationsAPI } from './services/api';
import { showNotification } from './NotificationSystem';

function MyRegistrations() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // Load registrations
  useEffect(() => {
    loadRegistrations();
    
    // Listen for registration updates
    const handleRegistrationUpdate = () => {
      loadRegistrations();
    };
    
    window.addEventListener('registrationsUpdated', handleRegistrationUpdate);
    
    return () => {
      window.removeEventListener('registrationsUpdated', handleRegistrationUpdate);
    };
  }, []);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      console.log('Loading registrations...');
      
      // Try API first
      try {
        const apiRegistrations = await registrationsAPI.getUserRegistrations();
        console.log('API registrations:', apiRegistrations);
        setRegistrations(Array.isArray(apiRegistrations) ? apiRegistrations : []);
      } catch (apiError) {
        console.warn('API failed, using localStorage fallback:', apiError);
        // Fallback to localStorage
        const saved = localStorage.getItem('userRegistrations');
        console.log('localStorage data:', saved);
        if (saved) {
          const parsed = JSON.parse(saved);
          console.log('Parsed registrations:', parsed);
          setRegistrations(Array.isArray(parsed) ? parsed : []);
        } else {
          console.log('No localStorage data found');
          setRegistrations([]);
        }
      }
    } catch (error) {
      console.error('Error loading registrations:', error);
      // Fallback to localStorage
      const saved = localStorage.getItem('userRegistrations');
      if (saved) {
        const parsed = JSON.parse(saved);
        setRegistrations(Array.isArray(parsed) ? parsed : []);
      } else {
        setRegistrations([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Cancel registration
  const handleCancel = async (registrationId) => {
    try {
      // Try API first
      try {
        await registrationsAPI.cancel(registrationId);
        showNotification('success', 'Registration Cancelled', 'Your registration has been cancelled successfully.');
      } catch (apiError) {
        console.warn('API failed, using localStorage fallback:', apiError);
        // Fallback to localStorage
        const updatedRegistrations = Array.isArray(registrations) ? registrations.filter(reg => reg.id !== registrationId) : [];
        setRegistrations(updatedRegistrations);
        localStorage.setItem('userRegistrations', JSON.stringify(updatedRegistrations));
        showNotification('success', 'Registration Cancelled', 'Your registration has been cancelled locally.');
      }
    } catch (error) {
      console.error('Error cancelling registration:', error);
      showNotification('error', 'Cancellation Failed', 'Failed to cancel registration. Please try again.');
    }
  };

  // Start editing
  const startEdit = (reg) => {
    setEditingId(reg.id);
    setEditData({
      attendeeName: reg.attendeeName || '',
      attendeeEmail: reg.attendeeEmail || '',
      phone: reg.phone || ''
    });
  };

  // Handle edit form change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  // Save edit
  const handleEditSave = async () => {
    try {
      // Try API first
      try {
        await registrationsAPI.update(editingId, editData);
        showNotification('success', 'Registration Updated', 'Your registration has been updated successfully.');
      } catch (apiError) {
        console.warn('API failed, using localStorage fallback:', apiError);
        // Fallback to localStorage
        const updatedRegistrations = Array.isArray(registrations) ? registrations.map(r => 
          r.id === editingId ? { ...r, ...editData } : r
        ) : [];
        setRegistrations(updatedRegistrations);
        localStorage.setItem('userRegistrations', JSON.stringify(updatedRegistrations));
        showNotification('success', 'Registration Updated', 'Your registration has been updated locally.');
      }
      setEditingId(null);
    } catch (error) {
      console.error('Error updating registration:', error);
      showNotification('error', 'Update Failed', 'Failed to update registration. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="fade-in-up">
      {/* Header */}
      <div className="hero" style={{ marginBottom: '2rem' }}>
        <div className="hero-content">
          <h1>My Event Registrations</h1>
          <p>Manage your event registrations and bookings</p>
        </div>
      </div>

      {/* Registrations List */}
      {!Array.isArray(registrations) || registrations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
          <h3 style={{ marginBottom: '1rem', color: '#6b7280' }}>No registrations yet</h3>
          <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
            You haven't registered for any events yet. Browse events and register to see them here!
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/home')}
          >
            Browse Events
          </button>
        </div>
      ) : (
        <div className="grid grid-2">
          {Array.isArray(registrations) && registrations.map(registration => (
            <div key={registration.id || registration._id} className="event-card">
              <div className="event-image">
                {registration.eventCategory === 'Music' ? '🎵' : 
                 registration.eventCategory === 'Sports' ? '⚽' : 
                 registration.eventCategory === 'Technology' ? '💻' : 
                 registration.eventCategory === 'Business' ? '💼' : 
                 registration.eventCategory === 'Education' ? '📚' : 
                 registration.eventCategory === 'Entertainment' ? '🎪' : '🎫'}
              </div>
              
              <div className="event-content">
                <h3 className="event-title">{registration.eventName || registration.event?.title}</h3>
                
                <div className="event-meta">
                  <div className="event-meta-item">
                    <span className="event-meta-icon">👤</span>
                    <span>
                      {editingId === registration.id ? (
                        <input
                          type="text"
                          name="attendeeName"
                          value={editData.attendeeName}
                          onChange={handleEditChange}
                          className="form-input"
                          style={{ width: '100%', padding: '0.25rem' }}
                        />
                      ) : (
                        registration.attendeeName || registration.user?.name || 'Your Name'
                      )}
                    </span>
                  </div>
                  
                  <div className="event-meta-item">
                    <span className="event-meta-icon">📧</span>
                    <span>
                      {editingId === registration.id ? (
                        <input
                          type="email"
                          name="attendeeEmail"
                          value={editData.attendeeEmail}
                          onChange={handleEditChange}
                          className="form-input"
                          style={{ width: '100%', padding: '0.25rem' }}
                        />
                      ) : (
                        registration.attendeeEmail || registration.user?.email || 'your.email@example.com'
                      )}
                    </span>
                  </div>
                  
                  <div className="event-meta-item">
                    <span className="event-meta-icon">📅</span>
                    <span>
                      {registration.eventDate ? new Date(registration.eventDate).toLocaleDateString() : 
                       registration.event?.dateTime?.start ? new Date(registration.event.dateTime.start).toLocaleDateString() :
                       'TBD'}
                    </span>
                  </div>
                  
                  <div className="event-meta-item">
                    <span className="event-meta-icon">🎫</span>
                    <span>
                      {registration.numberOfTickets || 1} ticket(s) - ${registration.ticketPrice || 0} each
                    </span>
                  </div>
                  
                  <div className="event-meta-item">
                    <span className="event-meta-icon">💰</span>
                    <span>
                      Total: ${registration.totalAmount || (registration.ticketPrice || 0) * (registration.numberOfTickets || 1)}
                    </span>
                  </div>
                  
                  <div className="event-meta-item">
                    <span className="event-meta-icon">📊</span>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      backgroundColor: registration.status === 'confirmed' ? '#d1fae5' : '#fef3c7',
                      color: registration.status === 'confirmed' ? '#065f46' : '#92400e'
                    }}>
                      {registration.status || 'pending'}
                    </span>
                  </div>
                </div>

                <div className="event-footer">
                  {editingId === registration.id ? (
                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                      <button 
                        className="btn btn-success"
                        onClick={handleEditSave}
                        style={{ flex: 1 }}
                      >
                        Save
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => setEditingId(null)}
                        style={{ flex: 1 }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => startEdit(registration)}
                        style={{ flex: 1 }}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleCancel(registration.id || registration._id)}
                        style={{ flex: 1 }}
                      >
                        Cancel Registration
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyRegistrations; 