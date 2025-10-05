import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI, authAPI } from './services/api';
import { showNotification } from './NotificationSystem';

function EnhancedDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    category: 'Technology',
    venue: { name: '', address: { city: '', state: '' } },
    dateTime: { start: '', end: '' },
    ticketTypes: [{ name: 'General', price: 0, quantity: 100 }],
    maxAttendees: 100
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const userEvents = await eventsAPI.getOrganizerEvents();
      // API returns { events: [...] }
      const list = Array.isArray(userEvents) ? userEvents : (userEvents?.events || []);
      setEvents(list);
    } catch (error) {
      console.error('Error loading events:', error);
      // Fallback to localStorage
      const savedEvents = localStorage.getItem('organizerEvents');
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!newEvent.title.trim()) {
      showNotification('error', 'Validation Error', 'Event title is required.');
      return;
    }
    
    if (!newEvent.description.trim()) {
      showNotification('error', 'Validation Error', 'Event description is required.');
      return;
    }
    
    if (!newEvent.venue.name.trim()) {
      showNotification('error', 'Validation Error', 'Venue name is required.');
      return;
    }
    
    if (!newEvent.dateTime.start || !newEvent.dateTime.end) {
      showNotification('error', 'Validation Error', 'Start and end dates are required.');
      return;
    }
    
    try {
      // Try API first
      try {
        // Ensure published so it appears on public Home listing
        const payload = { ...newEvent, status: 'published' };
        const createdResponse = await eventsAPI.create(payload);
        const createdEvent = createdResponse?.event || createdResponse;
        setEvents(prev => Array.isArray(prev) ? [...prev, createdEvent] : [createdEvent]);
        showNotification('success', 'Event Created!', 'Your event has been created successfully via API.');
      } catch (apiError) {
        console.warn('API failed, using localStorage fallback:', apiError);
        
        // Fallback to localStorage
        const eventId = Date.now().toString();
        const createdEvent = {
          _id: eventId,
          id: eventId,
          title: newEvent.title,
          description: newEvent.description,
          category: newEvent.category,
          venue: {
            name: newEvent.venue.name,
            address: {
              city: newEvent.venue.address.city,
              state: newEvent.venue.address.state || ''
            }
          },
          dateTime: {
            start: newEvent.dateTime.start,
            end: newEvent.dateTime.end
          },
          ticketTypes: newEvent.ticketTypes,
          maxAttendees: newEvent.maxAttendees,
          organizer: localStorage.getItem('userId') || 'current-user',
          status: 'published',
          registrations: [],
          createdAt: new Date().toISOString(),
          totalTicketsSold: 0,
          totalRevenue: 0
        };
        
        // Save to localStorage
        const existingEvents = JSON.parse(localStorage.getItem('organizerEvents') || '[]');
        existingEvents.push(createdEvent);
        localStorage.setItem('organizerEvents', JSON.stringify(existingEvents));
        
        setEvents(prev => Array.isArray(prev) ? [...prev, createdEvent] : [createdEvent]);
        showNotification('success', 'Event Created!', 'Your event has been saved locally.');
      }
      
      setShowCreateForm(false);
      setNewEvent({
        title: '',
        description: '',
        category: 'Technology',
        venue: { name: '', address: { city: '', state: '' } },
        dateTime: { start: '', end: '' },
        ticketTypes: [{ name: 'General', price: 0, quantity: 100 }],
        maxAttendees: 100
      });
      
    } catch (error) {
      console.error('Error creating event:', error);
      showNotification('error', 'Creation Failed', 'Failed to create event. Please try again.');
    }
  };

  const getDashboardStats = () => {
    const totalEvents = Array.isArray(events) ? events.length : 0;
    const totalRegistrations = Array.isArray(events) ? events.reduce((sum, event) => 
      sum + (event.registrations?.length || event.totalTicketsSold || 0), 0
    ) : 0;
    const totalRevenue = Array.isArray(events) ? events.reduce((sum, event) => 
      sum + (event.totalRevenue || 0), 0
    ) : 0;
    const avgAttendance = totalEvents > 0 ? (totalRegistrations / totalEvents).toFixed(1) : 0;

    return { totalEvents, totalRegistrations, totalRevenue, avgAttendance };
  };

  const stats = getDashboardStats();

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
          <h1>Organizer Dashboard</h1>
          <p>Manage your events, track registrations, and grow your audience</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.totalEvents}</div>
          <div className="stat-label">Total Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalRegistrations}</div>
          <div className="stat-label">Total Registrations</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">${stats.totalRevenue.toFixed(0)}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.avgAttendance}</div>
          <div className="stat-label">Avg Attendance</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e5e7eb' }}>
          {[
            { id: 'overview', label: '📊 Overview', icon: '📊' },
            { id: 'events', label: '🎪 My Events', icon: '🎪' },
            { id: 'create', label: '➕ Create Event', icon: '➕' },
            { id: 'analytics', label: '📈 Analytics', icon: '📈' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`filter-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={{ padding: '1rem 1.5rem', fontSize: '1rem' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>Recent Activity</h3>
            <div className="grid grid-2">
              <div className="card">
                <h4 style={{ marginBottom: '1rem', color: '#374151' }}>🎯 Quick Actions</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setActiveTab('create')}
                  >
                    Create New Event
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setActiveTab('events')}
                  >
                    View All Events
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setActiveTab('analytics')}
                  >
                    View Analytics
                  </button>
                </div>
              </div>
              
              <div className="card">
                <h4 style={{ marginBottom: '1rem', color: '#374151' }}>📈 Performance</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Event Success Rate:</span>
                    <span style={{ fontWeight: '600', color: '#059669' }}>85%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Avg. Event Rating:</span>
                    <span style={{ fontWeight: '600', color: '#059669' }}>4.7/5</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Repeat Attendees:</span>
                    <span style={{ fontWeight: '600', color: '#059669' }}>23%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ color: '#1f2937' }}>My Events ({Array.isArray(events) ? events.length : 0})</h3>
              <button 
                className="btn btn-primary"
                onClick={() => setActiveTab('create')}
              >
                ➕ Create New Event
              </button>
            </div>
            
            {!Array.isArray(events) || events.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎪</div>
                <h3 style={{ marginBottom: '1rem', color: '#6b7280' }}>No events yet</h3>
                <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
                  Create your first event to start building your audience!
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveTab('create')}
                >
                  Create Your First Event
                </button>
              </div>
            ) : (
              <div className="grid grid-2">
                {Array.isArray(events) && events.map(event => (
                  <div key={event._id || event.id} className="event-card">
                    <div className="event-image">
                      {event.category === 'Music' ? '🎵' : 
                       event.category === 'Sports' ? '⚽' : 
                       event.category === 'Technology' ? '💻' : 
                       event.category === 'Business' ? '💼' : 
                       event.category === 'Education' ? '📚' : 
                       event.category === 'Entertainment' ? '🎪' : '🎭'}
                    </div>
                    
                    <div className="event-content">
                      <h3 className="event-title">{event.title || event.name}</h3>
                      <p className="event-description">
                        {event.description?.substring(0, 100)}
                        {event.description?.length > 100 ? '...' : ''}
                      </p>
                      
                      <div className="event-meta">
                        <div className="event-meta-item">
                          <span className="event-meta-icon">📅</span>
                          <span>
                            {new Date(event.dateTime?.start || event.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="event-meta-item">
                          <span className="event-meta-icon">👥</span>
                          <span>
                            {event.registrations?.length || event.totalTicketsSold || 0} registrations
                          </span>
                        </div>
                        <div className="event-meta-item">
                          <span className="event-meta-icon">💰</span>
                          <span>
                            ${event.totalRevenue || 0} revenue
                          </span>
                        </div>
                      </div>

                      <div className="event-footer">
                        <button className="btn btn-secondary" style={{ flex: 1 }}>
                          Edit Event
                        </button>
                        <span className="event-category">
                          {event.status || 'Published'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Event Tab */}
        {activeTab === 'create' && (
          <div>
            <h3 style={{ marginBottom: '2rem', color: '#1f2937' }}>Create New Event</h3>
            <form onSubmit={handleCreateEvent} className="card">
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Event Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-input"
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
                  >
                    <option value="Technology">Technology</option>
                    <option value="Music">Music</option>
                    <option value="Sports">Sports</option>
                    <option value="Business">Business</option>
                    <option value="Education">Education</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Venue Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newEvent.venue.name}
                    onChange={(e) => setNewEvent({...newEvent, venue: {...newEvent.venue, name: e.target.value}})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newEvent.venue.address.city}
                    onChange={(e) => setNewEvent({...newEvent, venue: {...newEvent.venue, address: {...newEvent.venue.address, city: e.target.value}}})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={newEvent.dateTime.start}
                    onChange={(e) => setNewEvent({...newEvent, dateTime: {...newEvent.dateTime, start: e.target.value}})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">End Date & Time</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={newEvent.dateTime.end}
                    onChange={(e) => setNewEvent({...newEvent, dateTime: {...newEvent.dateTime, end: e.target.value}})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Ticket Price ($)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newEvent.ticketTypes[0].price}
                    onChange={(e) => setNewEvent({...newEvent, ticketTypes: [{...newEvent.ticketTypes[0], price: parseFloat(e.target.value)}]})}
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Available Tickets</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newEvent.ticketTypes[0].quantity}
                    onChange={(e) => setNewEvent({...newEvent, ticketTypes: [{...newEvent.ticketTypes[0], quantity: parseInt(e.target.value)}]})}
                    min="1"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setActiveTab('events')}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Event
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <h3 style={{ marginBottom: '2rem', color: '#1f2937' }}>Event Analytics</h3>
            <div className="grid grid-2">
              <div className="card">
                <h4 style={{ marginBottom: '1rem', color: '#374151' }}>📊 Registration Trends</h4>
                <div style={{ height: '200px', background: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                  📈 Chart Placeholder
                </div>
              </div>
              
              <div className="card">
                <h4 style={{ marginBottom: '1rem', color: '#374151' }}>💰 Revenue Breakdown</h4>
                <div style={{ height: '200px', background: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                  💵 Chart Placeholder
                </div>
              </div>
              
              <div className="card">
                <h4 style={{ marginBottom: '1rem', color: '#374151' }}>🎯 Category Performance</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {['Technology', 'Music', 'Business', 'Education'].map(category => (
                    <div key={category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{category}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '100px', height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.random() * 100}%`, height: '100%', background: '#667eea' }}></div>
                        </div>
                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {Math.floor(Math.random() * 50) + 10}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="card">
                <h4 style={{ marginBottom: '1rem', color: '#374151' }}>📅 Upcoming Events</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {Array.isArray(events) && events.slice(0, 3).map(event => (
                    <div key={event._id || event.id} style={{ 
                      padding: '1rem', 
                      background: '#f8fafc', 
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                        {event.title || event.name}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {new Date(event.dateTime?.start || event.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EnhancedDashboard;
