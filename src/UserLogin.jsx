import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { authAPI } from './services/api';

function UserLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
        userType: 'user'
      });
      
      // The authAPI.login already handles storing the token and user data
      window.dispatchEvent(new Event('authChanged'));
      navigate('/home');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem' }}>
      <h2>User Login</h2>
      {error && (
        <div style={{ padding: '0.75rem', backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label>Email:</label>
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            required 
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>
        <div>
          <label>Password:</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type={showPassword ? 'text' : 'password'} 
              name="password"
              value={formData.password}
              onChange={handleChange}
              required 
              style={{ flex: 1, padding: '0.5rem', marginTop: '0.25rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ padding: '0.5rem 0.75rem', marginTop: '0.25rem' }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <button 
          type="submit"
          disabled={isLoading}
          style={{ 
            padding: '0.75rem', 
            backgroundColor: isLoading ? '#6c757d' : '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: isLoading ? 'not-allowed' : 'pointer' 
          }}
        >
          {isLoading ? 'Logging in...' : 'Login as User'}
        </button>
      </form>
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <p>Don't have a user account? <Link to="/user-signup">Sign up here</Link></p>
        <p>Are you an organizer? <Link to="/organizer-login">Login as Organizer</Link></p>
      </div>
    </div>
  );
}

export default UserLogin; 