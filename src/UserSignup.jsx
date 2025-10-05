import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from './services/api';

function UserSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    address: '',
    city: '',
    zipCode: '',
    preferredContact: 'email',
    newsletter: false,
    terms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    try {
      const userData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        userType: 'user',
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        city: formData.city,
        zipCode: formData.zipCode,
        preferredContact: formData.preferredContact,
        newsletter: formData.newsletter
      };
      
      await authAPI.register(userData);
      navigate('/user-login');
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <h2>User Registration</h2>
      {error && (
        <div style={{ padding: '0.75rem', backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label>First Name *</label>
            <input 
              type="text" 
              name="firstName" 
              value={formData.firstName}
              onChange={handleChange}
              required 
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
          <div>
            <label>Last Name *</label>
            <input 
              type="text" 
              name="lastName" 
              value={formData.lastName}
              onChange={handleChange}
              required 
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
        </div>

        <div>
          <label>Email Address *</label>
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
          <label>Phone Number *</label>
          <input 
            type="tel" 
            name="phone" 
            value={formData.phone}
            onChange={handleChange}
            required 
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label>Password *</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="password" 
                value={formData.password}
                onChange={handleChange}
                required 
                style={{ flex: 1, padding: '0.5rem', marginTop: '0.25rem' }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ padding: '0.5rem 0.75rem', marginTop: '0.25rem' }}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div>
            <label>Confirm Password *</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type={showConfirm ? 'text' : 'password'} 
                name="confirmPassword" 
                value={formData.confirmPassword}
                onChange={handleChange}
                required 
                style={{ flex: 1, padding: '0.5rem', marginTop: '0.25rem' }}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ padding: '0.5rem 0.75rem', marginTop: '0.25rem' }}>
                {showConfirm ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
        </div>

        <div>
          <label>Date of Birth *</label>
          <input 
            type="date" 
            name="dateOfBirth" 
            value={formData.dateOfBirth}
            onChange={handleChange}
            required 
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

        <div>
          <label>Street Address *</label>
          <input 
            type="text" 
            name="address" 
            value={formData.address}
            onChange={handleChange}
            required 
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label>City *</label>
            <input 
              type="text" 
              name="city" 
              value={formData.city}
              onChange={handleChange}
              required 
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
          <div>
            <label>ZIP Code *</label>
            <input 
              type="text" 
              name="zipCode" 
              value={formData.zipCode}
              onChange={handleChange}
              required 
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
        </div>

        <div>
          <label>Preferred Contact Method</label>
          <select 
            name="preferredContact" 
            value={formData.preferredContact}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          >
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="sms">SMS</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input 
            type="checkbox" 
            name="newsletter" 
            id="newsletter"
            checked={formData.newsletter}
            onChange={handleChange}
          />
          <label htmlFor="newsletter">Subscribe to newsletter for event updates</label>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input 
            type="checkbox" 
            name="terms" 
            id="terms"
            checked={formData.terms}
            onChange={handleChange}
            required
          />
          <label htmlFor="terms">I agree to the Terms and Conditions *</label>
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
          {isLoading ? 'Creating Account...' : 'Create User Account'}
        </button>
      </form>
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <p>Already have a user account? <Link to="/user-login">Login here</Link></p>
        <p>Are you an organizer? <Link to="/organizer-signup">Sign up as Organizer</Link></p>
      </div>
    </div>
  );
}

export default UserSignup; 