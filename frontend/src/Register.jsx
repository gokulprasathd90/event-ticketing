import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { eventsAPI, registrationsAPI } from './services/api';
import { showNotification } from './NotificationSystem';

function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    attendeeName: '',
    attendeeEmail: '',
    attendeePhone: '',
    ticketType: 'general',
    numberOfTickets: 1,
    specialRequirements: '',
    dietaryRestrictions: 'none',
    emergencyContact: '',
    emergencyPhone: '',
    agreeToTerms: false
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await eventsAPI.getAll({ limit: 50 });
        const apiEvents = res.events || [];
        setEvents(apiEvents);
        const eventId = searchParams.get('event');
        if (eventId) {
          const found = apiEvents.find(e => (e._id || e.id) === eventId || e._id === eventId);
          if (found) setSelectedEvent(found);
        }
      } catch (err) {
        console.error('Error loading events:', err);
        setError(err.message || 'Failed to load events');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEventSelect = (e) => {
    const eventId = e.target.value;
    const event = events.find(ev => (ev._id || ev.id).toString() === eventId);
    setSelectedEvent(event);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedEvent) {
      showNotification('error', 'Event Required', 'Please select an event to register for.');
      return;
    }

    if (!formData.agreeToTerms) {
      showNotification('error', 'Terms Required', 'Please agree to the terms and conditions.');
      return;
    }

    // Find default ticket type from event
    const ticketType = selectedEvent.ticketTypes?.[0];
    const registrationPayload = {
      eventId: selectedEvent._id || selectedEvent.id,
      ticketType: {
        name: ticketType?.name || 'General',
        price: Number(ticketType?.price || selectedEvent.eventPrice || 0),
        quantity: Number(formData.numberOfTickets || 1)
      },
      paymentMethod: 'cash',
      specialRequests: formData.specialRequirements || ''
    };

    // Create registration data
    const newRegistration = {
      id: Date.now().toString(),
      eventId: selectedEvent._id || selectedEvent.id,
      eventName: selectedEvent.title || selectedEvent.name,
      eventDate: selectedEvent.dateTime?.start || selectedEvent.date,
      eventCategory: selectedEvent.category || 'General',
      attendeeName: formData.attendeeName,
      attendeeEmail: formData.attendeeEmail,
      phone: formData.attendeePhone,
      ticketType: formData.ticketType,
      numberOfTickets: formData.numberOfTickets,
      totalAmount: (ticketType?.price || selectedEvent.eventPrice || 0) * formData.numberOfTickets,
      ticketPrice: ticketType?.price || selectedEvent.eventPrice || 0,
      status: 'confirmed',
      paymentStatus: 'pending',
      specialRequests: formData.specialRequirements,
      dietaryRestrictions: formData.dietaryRestrictions,
      emergencyContact: formData.emergencyContact,
      emergencyPhone: formData.emergencyPhone,
      createdAt: new Date().toISOString()
    };

    // Always save to localStorage first
    const existingRegistrations = JSON.parse(localStorage.getItem('userRegistrations') || '[]');
    existingRegistrations.push(newRegistration);
    localStorage.setItem('userRegistrations', JSON.stringify(existingRegistrations));
    console.log('Registration saved to localStorage:', newRegistration);

    // Try API as well
    try {
      await registrationsAPI.create(registrationPayload);
      console.log('Registration also saved to API');
    } catch (err) {
      console.warn('API save failed, but localStorage save succeeded:', err);
    }

    showNotification('success', 'Registration Successful!', 'You have been registered for the event.');
    window.dispatchEvent(new Event('registrationsUpdated'));
    navigate('/my-registrations');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem 0'
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '0 1rem'
      }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '2rem',
          color: 'white'
        }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            marginBottom: '0.5rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            🎫 Register for Event
          </h1>
          <p style={{ 
            fontSize: '1.1rem', 
            opacity: 0.9,
            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
          }}>
            Join amazing events and create unforgettable memories
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid rgba(255,255,255,0.3)',
              borderTop: '4px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
            <p style={{ color: 'white', fontSize: '1.1rem' }}>Loading events...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{ 
            padding: '1rem', 
            backgroundColor: 'rgba(220, 53, 69, 0.9)', 
            color: 'white', 
            borderRadius: '10px', 
            marginBottom: '1rem',
            border: '1px solid rgba(220, 53, 69, 0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <strong>⚠️ Error:</strong> {error}
          </div>
        )}

        {/* No Events State */}
        {!loading && !error && events.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <p style={{ color: 'white', fontSize: '1.1rem' }}>No events available for registration.</p>
          </div>
        )}

        {/* Registration Form */}
        {!loading && !error && events.length > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <form onSubmit={handleSubmit}>
              {/* Event Selection */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '1.1rem', 
                  fontWeight: '600', 
                  color: '#333', 
                  marginBottom: '0.5rem' 
                }}>
                  🎯 Select Event *
                </label>
                <select 
                  value={selectedEvent?.id || ''} 
                  onChange={handleEventSelect} 
                  required
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    borderRadius: '10px',
                    border: '2px solid #e1e5e9',
                    fontSize: '1rem',
                    backgroundColor: 'white',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
                >
                  <option value="">Choose an event...</option>
                  {events.map(event => (
                    <option key={event._id || event.id} value={(event._id || event.id).toString()}>
                      {(event.title || event.name)} - {event.dateTime?.start ? new Date(event.dateTime.start).toLocaleString() : `${event.date} ${event.time}`} (${event.ticketTypes?.[0]?.price || event.price || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Event Details Card */}
              {selectedEvent && (
                <div style={{ 
                  margin: '1.5rem 0', 
                  padding: '1.5rem', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '15px',
                  color: 'white',
                  boxShadow: '0 10px 20px rgba(102, 126, 234, 0.3)'
                }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.3rem' }}>📋 Event Details</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                      <strong>📅 Date:</strong><br />
                      {selectedEvent.dateTime?.start ? new Date(selectedEvent.dateTime.start).toLocaleString() : `${selectedEvent.date} ${selectedEvent.time}`}
                    </div>
                    <div>
                      <strong>📍 Location:</strong><br />
                      {selectedEvent.venue?.name || selectedEvent.location}
                    </div>
                    <div>
                      <strong>💰 Price:</strong><br />
                      ${selectedEvent.ticketTypes?.[0]?.price || selectedEvent.price}
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <strong>📝 Description:</strong><br />
                      {selectedEvent.description}
                    </div>
                  </div>
                </div>
              )}

              {/* Personal Information */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  fontSize: '1.3rem', 
                  fontWeight: '600', 
                  color: '#333', 
                  marginBottom: '1rem',
                  borderBottom: '2px solid #667eea',
                  paddingBottom: '0.5rem'
                }}>
                  👤 Personal Information
                </h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '1rem', 
                    fontWeight: '500', 
                    color: '#555', 
                    marginBottom: '0.5rem' 
                  }}>
                    Full Name *
                  </label>
                  <input 
                    type="text" 
                    name="attendeeName" 
                    value={formData.attendeeName}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '10px',
                      border: '2px solid #e1e5e9',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '1rem', 
                      fontWeight: '500', 
                      color: '#555', 
                      marginBottom: '0.5rem' 
                    }}>
                      Email Address *
                    </label>
                    <input 
                      type="email" 
                      name="attendeeEmail" 
                      value={formData.attendeeEmail}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: '2px solid #e1e5e9',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
                    />
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '1rem', 
                      fontWeight: '500', 
                      color: '#555', 
                      marginBottom: '0.5rem' 
                    }}>
                      Phone Number *
                    </label>
                    <input 
                      type="tel" 
                      name="attendeePhone" 
                      value={formData.attendeePhone}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: '2px solid #e1e5e9',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
                    />
                  </div>
                </div>
              </div>

              {/* Ticket Information */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  fontSize: '1.3rem', 
                  fontWeight: '600', 
                  color: '#333', 
                  marginBottom: '1rem',
                  borderBottom: '2px solid #667eea',
                  paddingBottom: '0.5rem'
                }}>
                  🎫 Ticket Information
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '1rem', 
                      fontWeight: '500', 
                      color: '#555', 
                      marginBottom: '0.5rem' 
                    }}>
                      Ticket Type *
                    </label>
                    <select 
                      name="ticketType" 
                      value={formData.ticketType}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: '2px solid #e1e5e9',
                        fontSize: '1rem',
                        backgroundColor: 'white',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
                    >
                      <option value="general">General Admission</option>
                      <option value="vip">VIP</option>
                      <option value="student">Student</option>
                      <option value="senior">Senior</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '1rem', 
                      fontWeight: '500', 
                      color: '#555', 
                      marginBottom: '0.5rem' 
                    }}>
                      Number of Tickets *
                    </label>
                    <input 
                      type="number" 
                      name="numberOfTickets" 
                      min="1" 
                      max="10"
                      value={formData.numberOfTickets}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: '2px solid #e1e5e9',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  fontSize: '1.3rem', 
                  fontWeight: '600', 
                  color: '#333', 
                  marginBottom: '1rem',
                  borderBottom: '2px solid #667eea',
                  paddingBottom: '0.5rem'
                }}>
                  ℹ️ Additional Information
                </h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '1rem', 
                    fontWeight: '500', 
                    color: '#555', 
                    marginBottom: '0.5rem' 
                  }}>
                    Special Requirements
                  </label>
                  <textarea 
                    name="specialRequirements" 
                    value={formData.specialRequirements}
                    onChange={handleChange}
                    placeholder="Any special accommodations needed (wheelchair access, etc.)"
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '10px',
                      border: '2px solid #e1e5e9',
                      fontSize: '1rem',
                      resize: 'vertical',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '1rem', 
                    fontWeight: '500', 
                    color: '#555', 
                    marginBottom: '0.5rem' 
                  }}>
                    Dietary Restrictions
                  </label>
                  <select 
                    name="dietaryRestrictions" 
                    value={formData.dietaryRestrictions}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '10px',
                      border: '2px solid #e1e5e9',
                      fontSize: '1rem',
                      backgroundColor: 'white',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
                  >
                    <option value="none">None</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="gluten-free">Gluten-Free</option>
                    <option value="dairy-free">Dairy-Free</option>
                    <option value="other">Other (please specify)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '1rem', 
                      fontWeight: '500', 
                      color: '#555', 
                      marginBottom: '0.5rem' 
                    }}>
                      Emergency Contact Name
                    </label>
                    <input 
                      type="text" 
                      name="emergencyContact" 
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: '2px solid #e1e5e9',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
                    />
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '1rem', 
                      fontWeight: '500', 
                      color: '#555', 
                      marginBottom: '0.5rem' 
                    }}>
                      Emergency Contact Phone
                    </label>
                    <input 
                      type="tel" 
                      name="emergencyPhone" 
                      value={formData.emergencyPhone}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: '2px solid #e1e5e9',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
                    />
                  </div>
                </div>
              </div>

              {/* Terms and Submit */}
              <div style={{ 
                marginTop: '2rem',
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                borderRadius: '15px',
                border: '1px solid #dee2e6'
              }}>
                <div style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  alignItems: 'flex-start',
                  marginBottom: '1.5rem'
                }}>
                  <input 
                    type="checkbox" 
                    name="agreeToTerms" 
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    required
                    style={{
                      width: '20px',
                      height: '20px',
                      marginTop: '0.25rem'
                    }}
                  />
                  <label htmlFor="agreeToTerms" style={{ 
                    fontSize: '1rem', 
                    color: '#555',
                    lineHeight: '1.5'
                  }}>
                    I agree to the event terms and conditions and understand that this registration is binding. *
                  </label>
                </div>
                
                <button 
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '1rem 2rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '15px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 20px rgba(102, 126, 234, 0.3)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 15px 30px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 10px 20px rgba(102, 126, 234, 0.3)';
                  }}
                >
                  🎫 Register for Event
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Register; 