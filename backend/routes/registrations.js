const express = require('express');
const { body, validationResult } = require('express-validator');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');

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

// Create new registration
router.post('/', authenticateToken, [
  body('eventId').isMongoId().withMessage('Valid event ID is required'),
  body('ticketType').isObject().withMessage('Ticket type is required'),
  body('ticketType.name').trim().notEmpty().withMessage('Ticket type name is required'),
  body('ticketType.price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('ticketType.quantity').isInt({ min: 1 }).withMessage('Valid quantity is required'),
  body('paymentMethod').isIn(['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash']).withMessage('Valid payment method is required'),
  body('specialRequests').optional().trim()
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

    const { eventId, ticketType, paymentMethod, specialRequests } = req.body;
    const userId = req.user.userId;

    // Check if event exists and is published
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'published') {
      return res.status(400).json({ message: 'Event is not available for registration' });
    }

    // Check if user already registered for this event
    const existingRegistration = await Registration.findOne({ 
      user: userId, 
      event: eventId 
    });

    if (existingRegistration) {
      return res.status(400).json({ message: 'You have already registered for this event' });
    }

    // Find the ticket type in the event
    const eventTicketType = event.ticketTypes.find(t => t.name === ticketType.name);
    if (!eventTicketType) {
      return res.status(400).json({ message: 'Invalid ticket type for this event' });
    }

    // Check if enough tickets are available
    if (eventTicketType.sold + ticketType.quantity > eventTicketType.quantity) {
      return res.status(400).json({ message: 'Not enough tickets available' });
    }

    // Calculate total amount
    const totalAmount = ticketType.price * ticketType.quantity;

    // Create registration
    const registration = new Registration({
      user: userId,
      event: eventId,
      ticketType: {
        name: ticketType.name,
        price: ticketType.price,
        quantity: ticketType.quantity
      },
      totalAmount,
      paymentMethod,
      specialRequests,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await registration.save();

    // Update event ticket sales
    eventTicketType.sold += ticketType.quantity;
    await event.save();

    // Populate event and user details
    await registration.populate([
      { path: 'event', select: 'title description category venue dateTime images status' },
      { path: 'user', select: 'name email' }
    ]);

    res.status(201).json({
      message: 'Registration created successfully',
      registration
    });

  } catch (error) {
    console.error('Create registration error:', error);
    res.status(500).json({ message: 'Server error creating registration' });
  }
});

// Get user's registrations
router.get('/my-registrations', authenticateToken, async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user.userId })
      .populate('event', 'title description category venue dateTime images status')
      .sort({ registrationDate: -1 });

    res.json({ registrations });

  } catch (error) {
    console.error('Fetch registrations error:', error);
    res.status(500).json({ message: 'Server error fetching registrations' });
  }
});

// Get single registration by ID
router.get('/:id', authenticateToken, async (req, res) => {
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

// Update registration
router.put('/:id', authenticateToken, [
  body('specialRequests').optional().trim()
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

    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Check if user owns this registration
    if (registration.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow updating special requests for pending registrations
    if (registration.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot update confirmed or cancelled registrations' });
    }

    // Update registration
    const updatedRegistration = await Registration.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'event', select: 'title description category venue dateTime images status' },
      { path: 'user', select: 'name email' }
    ]);

    res.json({
      message: 'Registration updated successfully',
      registration: updatedRegistration
    });

  } catch (error) {
    console.error('Update registration error:', error);
    res.status(500).json({ message: 'Server error updating registration' });
  }
});

// Cancel registration
router.put('/:id/cancel', authenticateToken, async (req, res) => {
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

    // Update event ticket sales
    const event = await Event.findById(registration.event);
    if (event) {
      const ticketType = event.ticketTypes.find(t => t.name === registration.ticketType.name);
      if (ticketType) {
        ticketType.sold = Math.max(0, ticketType.sold - registration.ticketType.quantity);
        await event.save();
      }
    }

    res.json({ message: 'Registration cancelled successfully' });

  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({ message: 'Server error cancelling registration' });
  }
});

// Delete registration (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Check if user owns this registration
    if (registration.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow deletion of pending registrations
    if (registration.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot delete confirmed or cancelled registrations' });
    }

    // Update event ticket sales
    const event = await Event.findById(registration.event);
    if (event) {
      const ticketType = event.ticketTypes.find(t => t.name === registration.ticketType.name);
      if (ticketType) {
        ticketType.sold = Math.max(0, ticketType.sold - registration.ticketType.quantity);
        await event.save();
      }
    }

    await Registration.findByIdAndDelete(req.params.id);

    res.json({ message: 'Registration deleted successfully' });

  } catch (error) {
    console.error('Delete registration error:', error);
    res.status(500).json({ message: 'Server error deleting registration' });
  }
});

module.exports = router;
