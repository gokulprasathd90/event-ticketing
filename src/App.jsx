import './App.css';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './Home';
import Login from './Login';
import Signup from './Signup';
import Register from './Register';
import About from './About';
import MyRegistrations from './MyRegistrations';
import LandingPage from './LandingPage';
import OrganizerLogin from './OrganizerLogin';
import UserLogin from './UserLogin';
import OrganizerSignup from './OrganizerSignup';
import UserSignup from './UserSignup';
import OrganizerDashboard from './OrganizerDashboard';
import EnhancedDashboard from './EnhancedDashboard';
import NotificationSystem from './NotificationSystem';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [userType, setUserType] = useState(() => {
    return localStorage.getItem('userType') || null;
  });

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true');
      setUserType(localStorage.getItem('userType'));
    };
    
    checkAuth();
    
    // Listen for auth changes
    window.addEventListener('storage', checkAuth);
    window.addEventListener('authChanged', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authChanged', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userType');
    setIsAuthenticated(false);
    setUserType(null);
  };

  function PrivateRoute({ children, requiredUserType = null }) {
    if (!isAuthenticated) {
      return <Navigate to="/" replace />;
    }
    if (requiredUserType && userType !== requiredUserType) {
      // Redirect authenticated users to their appropriate home
      const fallback = userType === 'organizer' ? '/organizer-dashboard' : '/home';
      return <Navigate to={fallback} replace />;
    }
    return children;
  }

  return (
    <Router>
      <nav>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: '800', 
              background: 'linear-gradient(45deg, #ffffff, #f0f9ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              EventHub
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {isAuthenticated && userType === 'user' && (
              <>
                <NavLink to="/home" className={({ isActive }) => isActive ? 'active' : ''}>🏠 Home</NavLink>
                <NavLink to="/register" className={({ isActive }) => isActive ? 'active' : ''}>🎫 Register</NavLink>
                <NavLink to="/my-registrations" className={({ isActive }) => isActive ? 'active' : ''}>📋 My Events</NavLink>
                <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>ℹ️ About</NavLink>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}>
                  <span>👤</span>
                  <span>{localStorage.getItem('userName') || 'User'}</span>
                </div>
                <NotificationSystem />
                <button onClick={handleLogout} style={{ 
                  background: 'rgba(239, 68, 68, 0.2)', 
                  border: '1px solid rgba(239, 68, 68, 0.3)', 
                  color: 'white', 
                  cursor: 'pointer', 
                  fontWeight: 500,
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease'
                }}>
                  Logout
                </button>
              </>
            )}
            {isAuthenticated && userType === 'organizer' && (
              <>
                <NavLink to="/organizer-dashboard" className={({ isActive }) => isActive ? 'active' : ''}>📊 Dashboard</NavLink>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}>
                  <span>🎪</span>
                  <span>{localStorage.getItem('userName') || 'Organizer'}</span>
                </div>
                <NotificationSystem />
                <button onClick={handleLogout} style={{ 
                  background: 'rgba(239, 68, 68, 0.2)', 
                  border: '1px solid rgba(239, 68, 68, 0.3)', 
                  color: 'white', 
                  cursor: 'pointer', 
                  fontWeight: 500,
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease'
                }}>
                  Logout
                </button>
              </>
            )}
            {!isAuthenticated && (
              <>
                <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>🏠 Home</NavLink>
                <NavLink to="/user-login" className={({ isActive }) => isActive ? 'active' : ''}>👤 User Login</NavLink>
                <NavLink to="/organizer-login" className={({ isActive }) => isActive ? 'active' : ''}>🎪 Organizer Login</NavLink>
              </>
            )}
          </div>
        </div>
      </nav>
      <div className="container">
        <Routes>
          <Route path="/" element={!isAuthenticated ? <LandingPage /> : <Navigate to={userType === 'organizer' ? '/organizer-dashboard' : '/home'} replace />} />
          <Route path="/landing" element={<LandingPage />} />
          
          {/* User Routes */}
          <Route path="/user-login" element={<UserLogin />} />
          <Route path="/user-signup" element={<UserSignup />} />
          <Route path="/home" element={<PrivateRoute requiredUserType="user"><Home /></PrivateRoute>} />
          <Route path="/register" element={<PrivateRoute requiredUserType="user"><Register /></PrivateRoute>} />
          <Route path="/my-registrations" element={<PrivateRoute requiredUserType="user"><MyRegistrations /></PrivateRoute>} />
          <Route path="/about" element={<PrivateRoute requiredUserType="user"><About /></PrivateRoute>} />
          
          {/* Organizer Routes */}
          <Route path="/organizer-login" element={<OrganizerLogin />} />
          <Route path="/organizer-signup" element={<OrganizerSignup />} />
          <Route path="/organizer-dashboard" element={<PrivateRoute requiredUserType="organizer"><EnhancedDashboard /></PrivateRoute>} />
          
          {/* Legacy routes for backward compatibility */}
          <Route path="/login" element={<UserLogin />} />
          <Route path="/signup" element={<UserSignup />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <footer>
        &copy; {new Date().getFullYear()} Event Ticketing. All rights reserved. |
        <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">Instagram</a> |
        <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">Facebook</a> |
        <a href="mailto:info@eventticketing.com">Contact</a>
      </footer>
    </Router>
  );
}

export default App;