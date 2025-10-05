import { useState } from 'react';

function Signup({ onSignup }) {
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate signup success
    if (onSignup) onSignup();
  };

  return (
    <div>
      <h2>Create Your Account</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label>First Name *</label>
            <input 
              type="text" 
              name="firstName" 
              value={formData.firstName}
              onChange={handleChange}
              required 
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
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label>Password *</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password}
              onChange={handleChange}
              required 
            />
          </div>
          <div>
            <label>Confirm Password *</label>
            <input 
              type="password" 
              name="confirmPassword" 
              value={formData.confirmPassword}
              onChange={handleChange}
              required 
            />
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
            />
          </div>
        </div>

        <div>
          <label>Preferred Contact Method</label>
          <select 
            name="preferredContact" 
            value={formData.preferredContact}
            onChange={handleChange}
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

        <button type="submit">Create Account</button>
      </form>
    </div>
  );
}

export default Signup; 