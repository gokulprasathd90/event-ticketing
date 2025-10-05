import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    { icon: '🎪', title: 'Create Events', desc: 'Build amazing events with our intuitive platform' },
    { icon: '🎫', title: 'Sell Tickets', desc: 'Secure ticket sales with integrated payment processing' },
    { icon: '📊', title: 'Analytics', desc: 'Track performance with detailed insights and reports' },
    { icon: '👥', title: 'Community', desc: 'Connect with attendees and build lasting relationships' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Cdefs%3E%3Cpattern id=\'grain\' width=\'100\' height=\'100\' patternUnits=\'userSpaceOnUse\'%3E%3Ccircle cx=\'25\' cy=\'25\' r=\'1\' fill=\'white\' opacity=\'0.1\'/%3E%3Ccircle cx=\'75\' cy=\'75\' r=\'1\' fill=\'white\' opacity=\'0.1\'/%3E%3Ccircle cx=\'50\' cy=\'10\' r=\'0.5\' fill=\'white\' opacity=\'0.1\'/%3E%3Ccircle cx=\'10\' cy=\'60\' r=\'0.5\' fill=\'white\' opacity=\'0.1\'/%3E%3Ccircle cx=\'90\' cy=\'40\' r=\'0.5\' fill=\'white\' opacity=\'0.1\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100\' height=\'100\' fill=\'url(%23grain)\'/%3E%3C/svg%3E")',
        animation: 'float 20s ease-in-out infinite'
      }}></div>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '100vh',
        padding: '2rem',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Main Content */}
        <div style={{ 
          textAlign: 'center', 
          maxWidth: '800px', 
          width: '100%',
          animation: 'fadeInUp 1s ease-out'
        }}>
          <h1 style={{ 
            fontSize: '4rem', 
            marginBottom: '1rem', 
            fontWeight: '800',
            background: 'linear-gradient(45deg, #ffffff, #f0f9ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: '1.2'
          }}>
            EventHub Platform
          </h1>
          
          <p style={{ 
            fontSize: '1.5rem', 
            marginBottom: '3rem', 
            opacity: 0.9,
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto 3rem'
          }}>
            The ultimate platform for event creators and attendees. 
            Create, discover, and connect through amazing experiences.
          </p>

          {/* Feature Showcase */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '3rem',
            minHeight: '120px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '2rem',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'all 0.5s ease',
              transform: 'scale(1)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                {features[currentFeature].icon}
              </div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>
                {features[currentFeature].title}
              </h3>
              <p style={{ opacity: 0.8, fontSize: '1rem' }}>
                {features[currentFeature].desc}
              </p>
            </div>
          </div>

          {/* Role Selection */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem', 
            marginBottom: '3rem' 
          }}>
            <div 
              className="role-card"
              style={{ 
                padding: '2.5rem', 
                background: 'rgba(255, 255, 255, 0.1)', 
                borderRadius: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '2px solid transparent',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-10px) scale(1.02)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                e.target.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.borderColor = 'transparent';
                e.target.style.boxShadow = 'none';
              }}
              onClick={() => navigate('/organizer-login')}
            >
              <div style={{ 
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                fontSize: '2rem',
                opacity: 0.3
              }}>
                🎪
              </div>
              
              <h2 style={{ 
                marginBottom: '1rem', 
                fontSize: '2rem',
                fontWeight: '700'
              }}>
                🎪 Organizer
              </h2>
              
              <p style={{ 
                marginBottom: '1.5rem', 
                fontSize: '1.1rem',
                opacity: 0.9,
                lineHeight: '1.6'
              }}>
                Create and manage events, track registrations, and grow your audience with our professional tools.
              </p>
              
              <ul style={{ 
                textAlign: 'left', 
                listStyle: 'none', 
                padding: 0,
                marginBottom: '2rem'
              }}>
                <li style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  ✓ Advanced event management dashboard
                </li>
                <li style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  ✓ Real-time registration tracking
                </li>
                <li style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  ✓ Comprehensive analytics & insights
                </li>
                <li style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  ✓ Integrated payment processing
                </li>
              </ul>
              
              <button style={{ 
                width: '100%',
                padding: '1rem 2rem', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '12px', 
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
              }}
              >
                Login as Organizer
              </button>
            </div>

            <div 
              className="role-card"
              style={{ 
                padding: '2.5rem', 
                background: 'rgba(255, 255, 255, 0.1)', 
                borderRadius: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '2px solid transparent',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-10px) scale(1.02)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                e.target.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.borderColor = 'transparent';
                e.target.style.boxShadow = 'none';
              }}
              onClick={() => navigate('/user-login')}
            >
              <div style={{ 
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                fontSize: '2rem',
                opacity: 0.3
              }}>
                👤
              </div>
              
              <h2 style={{ 
                marginBottom: '1rem', 
                fontSize: '2rem',
                fontWeight: '700'
              }}>
                👤 Event Attendee
              </h2>
              
              <p style={{ 
                marginBottom: '1.5rem', 
                fontSize: '1.1rem',
                opacity: 0.9,
                lineHeight: '1.6'
              }}>
                Discover amazing events, register for tickets, and manage your bookings with ease.
              </p>
              
              <ul style={{ 
                textAlign: 'left', 
                listStyle: 'none', 
                padding: 0,
                marginBottom: '2rem'
              }}>
                <li style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  ✓ Discover events by category & location
                </li>
                <li style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  ✓ Secure ticket booking & payment
                </li>
                <li style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  ✓ Personal event calendar & reminders
                </li>
                <li style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  ✓ Social features & event sharing
                </li>
              </ul>
              
              <button style={{ 
                width: '100%',
                padding: '1rem 2rem', 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '12px', 
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
              }}
              >
                Login as Attendee
              </button>
            </div>
          </div>

          {/* Sign Up Section */}
          <div style={{ 
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h3 style={{ 
              marginBottom: '1rem', 
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>
              New to EventHub?
            </h3>
            <p style={{ 
              marginBottom: '2rem', 
              opacity: 0.8,
              fontSize: '1rem'
            }}>
              Join thousands of event creators and attendees worldwide
            </p>
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button 
                onClick={() => navigate('/organizer-signup')}
                style={{ 
                  padding: '0.75rem 2rem', 
                  background: 'transparent', 
                  color: 'white', 
                  border: '2px solid rgba(255, 255, 255, 0.5)', 
                  borderRadius: '12px', 
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.borderColor = 'white';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Sign up as Organizer
              </button>
              <button 
                onClick={() => navigate('/user-signup')}
                style={{ 
                  padding: '0.75rem 2rem', 
                  background: 'transparent', 
                  color: 'white', 
                  border: '2px solid rgba(255, 255, 255, 0.5)', 
                  borderRadius: '12px', 
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.borderColor = 'white';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Sign up as Attendee
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default LandingPage; 