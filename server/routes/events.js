const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');

const router = express.Router();

// Middleware to verify JWT token (reuse from auth.js)
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

// Middleware to check if user is organizer
const requireOrganizer = (req, res, next) => {
  if (req.user.userType !== 'organizer') {
    return res.status(403).json({ message: 'Access denied. Organizer role required.' });
  }
  next();
};

// Get all published events (public)
router.get('/', [
  query('category').optional().isString(),
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    
    // Build filter
    const filter = { status: 'published' };
    
    if (category) {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get events with organizer details
    const events = await Event.find(filter)
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 })
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
    console.error('Fetch events error:', error);
    res.status(500).json({ message: 'Server error fetching events' });
  }
});

// Get featured events
router.get('/featured', async (req, res) => {
  try {
    const featuredEvents = await Event.find({ 
      status: 'published', 
      isFeatured: true 
    })
    .populate('organizer', 'name')
    .sort({ createdAt: -1 })
    .limit(6);

    res.json({ events: featuredEvents });

  } catch (error) {
    console.error('Fetch featured events error:', error);
    res.status(500).json({ message: 'Server error fetching featured events' });
  }
});

// Get single event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email phone')
      .populate('registrations', 'status paymentStatus');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Only show published events to public
    if (event.status !== 'published') {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ event });

  } catch (error) {
    console.error('Fetch event error:', error);
    res.status(500).json({ message: 'Server error fetching event' });
  }
});

// Create new event (organizer only)
router.post('/', authenticateToken, requireOrganizer, [
  body('title').trim().isLength({ min: 2, max: 100 }).withMessage('Title must be 2-100 characters'),
  body('description').trim().isLength({ min: 1, max: 1000 }).withMessage('Description must be 1-1000 characters'),
  body('category').isIn(['Music', 'Sports', 'Technology', 'Business', 'Education', 'Entertainment', 'Other']).withMessage('Invalid category'),
  body('venue.name').trim().notEmpty().withMessage('Venue name is required'),
  body('dateTime.start').isISO8601().withMessage('Valid start date is required'),
  body('dateTime.end').isISO8601().withMessage('Valid end date is required'),
  body('ticketTypes').isArray({ min: 1 }).withMessage('At least one ticket type is required'),
  body('ticketTypes.*.name').trim().notEmpty().withMessage('Ticket type name is required'),
  body('ticketTypes.*.price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('ticketTypes.*.quantity').isInt({ min: 1 }).withMessage('Valid quantity is required')
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

    const eventData = req.body;
    eventData.organizer = req.user.userId;

    // Validate date logic
    const startDate = new Date(eventData.dateTime.start);
    const endDate = new Date(eventData.dateTime.end);
    
    if (startDate <= new Date()) {
      return res.status(400).json({ message: 'Event start date must be in the future' });
    }
    
    if (endDate <= startDate) {
      return res.status(400).json({ message: 'Event end date must be after start date' });
    }

    const event = new Event(eventData);
    await event.save();

    // Populate organizer details
    await event.populate('organizer', 'name email');

    res.status(201).json({
      message: 'Event created successfully',
      event
    });

  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error creating event' });
  }
});

// Update event (organizer only)
router.put('/:id', authenticateToken, requireOrganizer, [
  body('title').optional().trim().isLength({ min: 5, max: 100 }),
  body('description').optional().trim().isLength({ min: 20, max: 1000 }),
  body('category').optional().isIn(['Music', 'Sports', 'Technology', 'Business', 'Education', 'Entertainment', 'Other']),
  body('status').optional().isIn(['draft', 'published', 'cancelled'])
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

    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user owns this event
    if (event.organizer.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied. You can only edit your own events.' });
    }

    // Update event
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('organizer', 'name email');

    res.json({
      message: 'Event updated successfully',
      event: updatedEvent
    });

  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error updating event' });
  }
});

// Delete event (organizer only)
router.delete('/:id', authenticateToken, requireOrganizer, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user owns this event
    if (event.organizer.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied. You can only delete your own events.' });
    }

    // Check if event has registrations
    const registrations = await Registration.find({ event: req.params.id });
    if (registrations.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete event with existing registrations. Consider cancelling instead.' 
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: 'Event deleted successfully' });

  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error deleting event' });
  }
});

// Get organizer's events
router.get('/organizer/my-events', authenticateToken, requireOrganizer, async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.userId })
      .sort({ createdAt: -1 });

    res.json({ events });

  } catch (error) {
    console.error('Fetch organizer events error:', error);
    res.status(500).json({ message: 'Server error fetching organizer events' });
  }
});

// Get event statistics (organizer only)
router.get('/:id/stats', authenticateToken, requireOrganizer, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user owns this event
    if (event.organizer.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied. You can only view stats for your own events.' });
    }

    const registrations = await Registration.find({ event: req.params.id });
    
    const stats = {
      totalRegistrations: registrations.length,
      confirmedRegistrations: registrations.filter(r => r.status === 'confirmed').length,
      totalRevenue: registrations.reduce((sum, r) => sum + r.totalAmount, 0),
      ticketTypeBreakdown: {}
    };

    // Calculate ticket type breakdown
    event.ticketTypes.forEach(ticketType => {
      const sold = registrations.filter(r => r.ticketType.name === ticketType.name).length;
      stats.ticketTypeBreakdown[ticketType.name] = {
        sold,
        available: ticketType.quantity - sold,
        revenue: sold * ticketType.price
      };
    });

    res.json({ stats });

  } catch (error) {
    console.error('Fetch event stats error:', error);
    res.status(500).json({ message: 'Server error fetching event statistics' });
  }
});

module.exports = router;
