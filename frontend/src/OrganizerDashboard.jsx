import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI } from './services/api';

function OrganizerDashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    location: '',
    capacity: '',
    price: '',
    category: ''
  });

  // Load events from API
  useEffect(() => {
    const load = async () => {
      try {
        const res = await eventsAPI.getOrganizerEvents();
        setEvents(res.events || []);
      } catch (_err) {
        setEvents([]);
      }
    };
    load();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    // Map UI fields to API schema
    const startDate = newEvent.date && newEvent.time ? new Date(`${newEvent.date}T${newEvent.time}:00`) : null;
    // Ensure end is after start to satisfy backend validation
    const endDate = startDate ? new Date(startDate.getTime() + 60 * 60 * 1000) : null; // +1 hour
    const startIso = startDate ? startDate.toISOString() : null;
    const endIso = endDate ? endDate.toISOString() : null;
    const categoryMap = {
      conference: 'Business',
      workshop: 'Education',
      concert: 'Entertainment',
      sports: 'Sports',
      exhibition: 'Other',
      other: 'Other'
    };
    const eventData = {
      title: newEvent.name,
      description: newEvent.description || 'Event details to be announced.',
      category: categoryMap[newEvent.category] || 'Other',
      venue: { name: newEvent.location },
      dateTime: { start: startIso, end: endIso },
      ticketTypes: [{ name: 'General', price: Number(newEvent.price || 0), quantity: Number(newEvent.capacity || 1) }],
      status: 'published'
    };
    try {
      const res = await eventsAPI.create(eventData);
      setEvents([...events, res.event]);
      setNewEvent({
        name: '', description: '', date: '', time: '', location: '', capacity: '', price: '', category: ''
      });
      setShowCreateForm(false);
    } catch (err) {
      console.error('Create event failed:', err);
      setError(err.message || 'Failed to create event');
      alert(err.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await eventsAPI.delete(eventId);
      setEvents(events.filter(event => (event._id || event.id) !== eventId));
    } catch (_err) {}
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userType');
    navigate('/organizer-login');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Organizer Dashboard</h1>
        <button 
          onClick={handleLogout}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{ padding: '0.75rem 1.5rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {showCreateForm ? 'Cancel' : 'Create New Event'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '0.75rem', backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>
      )}

      {showCreateForm && (
        <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
          <h3>Create New Event</h3>
          <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label>Event Name *</label>
                <input 
                  type="text" 
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                  required 
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                />
              </div>
              <div>
                <label>Category *</label>
                <select 
                  value={newEvent.category}
                  onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                >
                  <option value="">Select Category</option>
                  <option value="conference">Conference</option>
                  <option value="workshop">Workshop</option>
                  <option value="concert">Concert</option>
                  <option value="sports">Sports</option>
                  <option value="exhibition">Exhibition</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label>Description *</label>
              <textarea 
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                required 
                rows="3"
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label>Date *</label>
                <input 
                  type="date" 
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  required 
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                />
              </div>
              <div>
                <label>Time *</label>
                <input 
                  type="time" 
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                  required 
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                />
              </div>
              <div>
                <label>Location *</label>
                <input 
                  type="text" 
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                  required 
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label>Capacity *</label>
                <input 
                  type="number" 
                  value={newEvent.capacity}
                  onChange={(e) => setNewEvent({...newEvent, capacity: e.target.value})}
                  required 
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                />
              </div>
              <div>
                <label>Price ($) *</label>
                <input 
                  type="number" 
                  value={newEvent.price}
                  onChange={(e) => setNewEvent({...newEvent, price: e.target.value})}
                  required 
                  step="0.01"
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                />
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} style={{ padding: '0.75rem', backgroundColor: isSubmitting ? '#6c757d' : '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </button>
          </form>
        </div>
      )}

      <div>
        <h2>My Events</h2>
        {events.length === 0 ? (
          <p style={{ textAlign: 'center', marginTop: '2rem', color: '#888' }}>No events created yet. Create your first event!</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {events.map(event => (
              <div key={event._id || event.id} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3>{event.title || event.name}</h3>
                    <p><strong>Category:</strong> {event.category}</p>
                    <p><strong>Date:</strong> {event.dateTime?.start ? new Date(event.dateTime.start).toLocaleString() : `${event.date} ${event.time}`}</p>
                    <p><strong>Location:</strong> {event.venue?.name || event.location}</p>
                    <p><strong>Capacity:</strong> {event.ticketTypes?.[0]?.quantity || event.capacity} people</p>
                    <p><strong>Price:</strong> ${event.ticketTypes?.[0]?.price || event.price}</p>
                    <p>{event.description}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteEvent(event._id || event.id)}
                    style={{ padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrganizerDashboard; 