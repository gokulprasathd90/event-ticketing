const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: user.toSafeObject()
    });

  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('name').optional().trim().isLength({ min: 2, max: 50 }),
  body('phone').optional().trim(),
  body('profilePicture').optional().trim()
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, phone, profilePicture } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (profilePicture) updateData.profilePicture = profilePicture;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: user.toSafeObject()
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Get user's event registrations
router.get('/registrations', authenticateToken, [
  query('status').optional().isIn(['pending', 'confirmed', 'cancelled', 'refunded']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    // Build filter
    const filter = { user: req.user.userId };
    if (status) {
      filter.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get registrations with event details
    const registrations = await Registration.find(filter)
      .populate('event', 'title description category venue dateTime images status')
      .sort({ registrationDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Registration.countDocuments(filter);

    res.json({
      registrations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRegistrations: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Fetch registrations error:', error);
    res.status(500).json({ message: 'Server error fetching registrations' });
  }
});

// Get single registration details
router.get('/registrations/:id', authenticateToken, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('event', 'title description category venue dateTime images status organizer')
      .populate('user', 'name email');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Check if user owns this registration
    if (registration.user._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ registration });

  } catch (error) {
    console.error('Fetch registration error:', error);
    res.status(500).json({ message: 'Server error fetching registration' });
  }
});

// Cancel registration
router.put('/registrations/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Check if user owns this registration
    if (registration.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if registration can be cancelled
    if (registration.status === 'cancelled') {
      return res.status(400).json({ message: 'Registration is already cancelled' });
    }

    if (registration.status === 'refunded') {
      return res.status(400).json({ message: 'Registration has been refunded' });
    }

    // Cancel registration
    await registration.cancelRegistration();

    res.json({ message: 'Registration cancelled successfully' });

  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({ message: 'Server error cancelling registration' });
  }
});

// Get user's favorite events (events they've shown interest in)
router.get('/favorites', authenticateToken, async (req, res) => {
  try {
    // For now, we'll return events the user has registered for
    // In a real app, you might have a separate favorites collection
    const registrations = await Registration.find({ 
      user: req.user.userId,
      status: { $in: ['pending', 'confirmed'] }
    }).populate('event', 'title description category venue dateTime images status');

    const favoriteEvents = registrations.map(reg => reg.event);

    res.json({ events: favoriteEvents });

  } catch (error) {
    console.error('Fetch favorites error:', error);
    res.status(500).json({ message: 'Server error fetching favorites' });
  }
});

// Get user dashboard data
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user's registrations count
    const totalRegistrations = await Registration.countDocuments({ user: userId });
    const confirmedRegistrations = await Registration.countDocuments({ 
      user: userId, 
      status: 'confirmed' 
    });

    // Get upcoming events user is registered for
    const upcomingRegistrations = await Registration.find({
      user: userId,
      status: { $in: ['pending', 'confirmed'] }
    }).populate({
      path: 'event',
      match: { 
        status: 'published',
        'dateTime.start': { $gt: new Date() }
      },
      select: 'title dateTime venue category'
    });

    const upcomingEvents = upcomingRegistrations
      .filter(reg => reg.event) // Filter out events that don't match criteria
      .map(reg => reg.event);

    // Get recent activity
    const recentActivity = await Registration.find({ user: userId })
      .populate('event', 'title')
      .sort({ registrationDate: -1 })
      .limit(5);

    const dashboardData = {
      totalRegistrations,
      confirmedRegistrations,
      upcomingEvents,
      recentActivity
    };

    res.json({ dashboard: dashboardData });

  } catch (error) {
    console.error('Fetch dashboard error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard' });
  }
});

// Search events (for users to discover events)
router.get('/search-events', authenticateToken, [
  query('q').optional().isString(),
  query('category').optional().isString(),
  query('date').optional().isString(),
  query('price').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const { q, category, date, price, page = 1, limit = 10 } = req.query;
    
    // Build filter
    const filter = { status: 'published' };
    
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ];
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (date) {
      const searchDate = new Date(date);
      filter['dateTime.start'] = { $gte: searchDate };
    }
    
    if (price) {
      const [minPrice, maxPrice] = price.split('-').map(p => parseFloat(p));
      if (minPrice && maxPrice) {
        filter['ticketTypes.price'] = { $gte: minPrice, $lte: maxPrice };
      } else if (minPrice) {
        filter['ticketTypes.price'] = { $gte: minPrice };
      } else if (maxPrice) {
        filter['ticketTypes.price'] = { $lte: maxPrice };
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get events
    const events = await Event.find(filter)
      .populate('organizer', 'name')
      .sort({ 'dateTime.start': 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Event.countDocuments(filter);

    res.json({
      events,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalEvents: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Search events error:', error);
    res.status(500).json({ message: 'Server error searching events' });
  }
});

module.exports = router;
