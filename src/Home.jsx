import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI } from './services/api';

const features = [
  {
    icon: '🎪',
    title: 'Discover Events',
    desc: 'Find concerts, exhibitions, and conferences near you.',
    color: '#667eea'
  },
  {
    icon: '🎫',
    title: 'Book Tickets',
    desc: 'Easy and secure ticket booking for all events.',
    color: '#10b981'
  },
  {
    icon: '👥',
    title: 'Invite Friends',
    desc: 'Share events and attend together with friends.',
    color: '#f59e0b'
  },
  {
    icon: '📊',
    title: 'Track Events',
    desc: 'Manage your registrations and get updates.',
    color: '#ef4444'
  }
];

const categories = ['All', 'Music', 'Sports', 'Technology', 'Business', 'Education', 'Entertainment', 'Other'];

function Home() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, selectedCategory, sortBy]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      // Try to load from API first
      try {
        const apiResponse = await eventsAPI.getAll();
        const apiEvents = apiResponse.events || apiResponse || [];
        if (Array.isArray(apiEvents) && apiEvents.length > 0) {
          setEvents(apiEvents);
          return;
        }
      } catch (apiError) {
        console.warn('API failed, trying localStorage:', apiError);
      }
      
      // Fallback to localStorage
      const savedEvents = localStorage.getItem('organizerEvents');
      if (savedEvents) {
        const parsedEvents = JSON.parse(savedEvents);
        setEvents(Array.isArray(parsedEvents) ? parsedEvents : []);
      } else {
        // Create some sample events if none exist
        const sampleEvents = [
          {
            id: '1',
            title: 'Tech Conference 2024',
            description: 'Join us for the biggest tech conference of the year with amazing speakers and networking opportunities.',
            category: 'Technology',
            dateTime: { start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
            venue: { name: 'Convention Center' },
            ticketTypes: [{ name: 'General', price: 99 }],
            price: 99,
            maxAttendees: 500
          },
          {
            id: '2',
            title: 'Music Festival',
            description: 'A weekend of amazing music with top artists from around the world.',
            category: 'Music',
            dateTime: { start: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() },
            venue: { name: 'Central Park' },
            ticketTypes: [{ name: 'VIP', price: 199 }],
            price: 199,
            maxAttendees: 1000
          }
        ];
        setEvents(sampleEvents);
        localStorage.setItem('organizerEvents', JSON.stringify(sampleEvents));
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    if (!Array.isArray(events)) {
      setFilteredEvents([]);
      return;
    }

    let filtered = [...events];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.dateTime?.start || a.date) - new Date(b.dateTime?.start || b.date);
        case 'price':
          return (a.ticketTypes?.[0]?.price || a.price || 0) - (b.ticketTypes?.[0]?.price || b.price || 0);
        case 'name':
          return (a.title || a.name || '').localeCompare(b.title || b.name || '');
        case 'popularity':
          return (b.registrations?.length || b.totalTicketsSold || 0) - (a.registrations?.length || a.totalTicketsSold || 0);
        default:
          return 0;
      }
    });

    setFilteredEvents(filtered);
  };

  const handleRegister = (eventId) => {
    if (!eventId) {
      console.error('No event ID provided');
      return;
    }
    navigate(`/register?event=${eventId}`);
  };

  const getEventStats = () => {
    const totalEvents = Array.isArray(events) ? events.length : 0;
    const totalRegistrations = Array.isArray(events) ? events.reduce((sum, event) => 
      sum + (event.registrations?.length || event.totalTicketsSold || 0), 0
    ) : 0;
    const avgPrice = Array.isArray(events) ? events.reduce((sum, event) => 
      sum + (event.ticketTypes?.[0]?.price || event.price || 0), 0
    ) / Math.max(totalEvents, 1) : 0;
    const categoriesCount = Array.isArray(events) ? new Set(events.map(e => e.category)).size : 0;

    return { totalEvents, totalRegistrations, avgPrice, categoriesCount };
  };

  const stats = getEventStats();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="fade-in-up">
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-content">
          <h1>Discover Amazing Events</h1>
          <p>
            Find and book tickets for concerts, conferences, workshops, and more. 
            Join thousands of people discovering their next great experience.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.totalEvents}</div>
          <div className="stat-label">Total Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalRegistrations}</div>
          <div className="stat-label">Registrations</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">${stats.avgPrice.toFixed(0)}</div>
          <div className="stat-label">Avg Price</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.categoriesCount}</div>
          <div className="stat-label">Categories</div>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-4" style={{ marginBottom: '3rem' }}>
        {features.map((feature, i) => (
          <div key={i} className="card" style={{ textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ 
              fontSize: '3rem', 
              marginBottom: '1rem',
              background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}40)`,
              borderRadius: '50%',
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              {feature.icon}
            </div>
            <h3 style={{ marginBottom: '0.5rem', color: '#1f2937' }}>{feature.title}</h3>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-container">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search events by name, description, or venue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="filter-tabs">
            {categories.map(category => (
              <button
                key={category}
                className={`filter-tab ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              background: '#f9fafb',
              color: '#374151',
              fontWeight: '500'
            }}
          >
            <option value="date">Sort by Date</option>
            <option value="price">Sort by Price</option>
            <option value="name">Sort by Name</option>
            <option value="popularity">Sort by Popularity</option>
          </select>
        </div>
      </div>

      {/* Events Section */}
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#1f2937', fontSize: '2rem' }}>
          Available Events ({filteredEvents.length})
        </h2>
        
        {filteredEvents.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎭</div>
            <h3 style={{ marginBottom: '1rem', color: '#6b7280' }}>No events found</h3>
            <p style={{ color: '#9ca3af' }}>
              {searchTerm || selectedCategory !== 'All' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'No events available at the moment. Check back later for exciting events!'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-3">
            {filteredEvents.map(event => (
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
                    {event.description?.substring(0, 120)}
                    {event.description?.length > 120 ? '...' : ''}
                  </p>
                  
                  <div className="event-meta">
                    <div className="event-meta-item">
                      <span className="event-meta-icon">📅</span>
                      <span>
                        {new Date(event.dateTime?.start || event.date).toLocaleDateString()} at{' '}
                        {new Date(event.dateTime?.start || event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div className="event-meta-item">
                      <span className="event-meta-icon">📍</span>
                      <span>{event.venue?.name || event.location}</span>
                    </div>
                    <div className="event-meta-item">
                      <span className="event-meta-icon">💰</span>
                      <span>
                        ${event.ticketTypes?.[0]?.price || event.price || 'Free'}
                        {event.ticketTypes?.length > 1 && ` - $${Math.max(...event.ticketTypes.map(t => t.price))}`}
                      </span>
                    </div>
                    <div className="event-meta-item">
                      <span className="event-meta-icon">👥</span>
                      <span>
                        {event.registrations?.length || event.totalTicketsSold || 0} registered
                        {event.maxAttendees && ` / ${event.maxAttendees}`}
                      </span>
                    </div>
                  </div>

                  <div className="event-footer">
                    <button 
                      className={`btn ${(event.registrations?.length || 0) >= (event.maxAttendees || event.capacity || Infinity) ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => handleRegister(event._id || event.id)}
                      disabled={(event.registrations?.length || 0) >= (event.maxAttendees || event.capacity || Infinity)}
                      style={{ flex: 1 }}
                    >
                      {(event.registrations?.length || 0) >= (event.maxAttendees || event.capacity || Infinity) ? 'Sold Out' : 'Register Now'}
                    </button>
                    <span className="event-category">
                      {event.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;