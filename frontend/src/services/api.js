const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    method: 'GET',
    headers: getAuthHeaders(),
    ...options,
    // Ensure CORS preflight-friendly defaults
    mode: 'cors',
    cache: 'no-cache'
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error?.message || 'Network error');
  }
};

// Auth API
export const authAPI = {
  // Register user
  register: async (userData) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    // Store token and user data
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userType', response.user.userType);
      localStorage.setItem('userId', response.user._id);
    }
    
    return response;
  },

  // Login user
  login: async (credentials) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    // Store token and user data
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userType', response.user.userType);
      localStorage.setItem('userId', response.user._id);
    }
    
    return response;
  },

  // Get current user profile
  getProfile: async () => {
    return await apiRequest('/auth/profile');
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
  }
};

// Events API
export const eventsAPI = {
  // Get all published events
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/events?${queryString}` : '/events';
    return await apiRequest(endpoint);
  },

  // Get featured events
  getFeatured: async () => {
    return await apiRequest('/events/featured');
  },

  // Get single event by ID
  getById: async (eventId) => {
    return await apiRequest(`/events/${eventId}`);
  },

  // Create new event (organizer only)
  create: async (eventData) => {
    return await apiRequest('/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  },

  // Update event (organizer only)
  update: async (eventId, eventData) => {
    return await apiRequest(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData)
    });
  },

  // Delete event (organizer only)
  delete: async (eventId) => {
    return await apiRequest(`/events/${eventId}`, {
      method: 'DELETE'
    });
  },

  // Get organizer's events
  getOrganizerEvents: async () => {
    return await apiRequest('/events/organizer/my-events');
  },

  // Get event statistics
  getStats: async (eventId) => {
    return await apiRequest(`/events/${eventId}/stats`);
  }
};

// Registrations API
export const registrationsAPI = {
  // Create new registration
  create: async (registrationData) => {
    return await apiRequest('/registrations', {
      method: 'POST',
      body: JSON.stringify(registrationData)
    });
  },

  // Get user's registrations
  getUserRegistrations: async () => {
    const response = await apiRequest('/registrations/my-registrations');
    // Backend returns { registrations: [...] }
    return Array.isArray(response) ? response : (response?.registrations || []);
  },

  // Get registration by ID
  getById: async (registrationId) => {
    return await apiRequest(`/registrations/${registrationId}`);
  },

  // Update registration
  update: async (registrationId, registrationData) => {
    return await apiRequest(`/registrations/${registrationId}`, {
      method: 'PUT',
      body: JSON.stringify(registrationData)
    });
  },

  // Cancel registration
  cancel: async (registrationId) => {
    return await apiRequest(`/registrations/${registrationId}/cancel`, {
      method: 'PUT'
    });
  },

  // Delete registration
  delete: async (registrationId) => {
    return await apiRequest(`/registrations/${registrationId}`, {
      method: 'DELETE'
    });
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return localStorage.getItem('isAuthenticated') === 'true';
};

// Get current user type
export const getUserType = () => {
  return localStorage.getItem('userType');
};

// Get current user ID
export const getUserId = () => {
  return localStorage.getItem('userId');
};
