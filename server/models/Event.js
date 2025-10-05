const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Organizer is required']
  },
  category: {
    type: String,
    required: [true, 'Event category is required'],
    enum: ['Music', 'Sports', 'Technology', 'Business', 'Education', 'Entertainment', 'Other']
  },
  venue: {
    name: {
      type: String,
      required: [true, 'Venue name is required']
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  dateTime: {
    start: {
      type: Date,
      required: [true, 'Event start date is required']
    },
    end: {
      type: Date,
      required: [true, 'Event end date is required']
    }
  },
  ticketTypes: [{
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    sold: {
      type: Number,
      default: 0
    },
    description: String
  }],
  images: [{
    url: String,
    alt: String
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  maxAttendees: {
    type: Number,
    min: [1, 'Max attendees must be at least 1']
  },
  tags: [String],
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for total tickets sold
eventSchema.virtual('totalTicketsSold').get(function() {
  const tickets = Array.isArray(this.ticketTypes) ? this.ticketTypes : [];
  return tickets.reduce((total, type) => total + (type.sold || 0), 0);
});

// Virtual for total revenue
eventSchema.virtual('totalRevenue').get(function() {
  const tickets = Array.isArray(this.ticketTypes) ? this.ticketTypes : [];
  return tickets.reduce((total, type) => total + ((type.sold || 0) * (type.price || 0)), 0);
});

// Virtual for available tickets
eventSchema.virtual('availableTickets').get(function() {
  const tickets = Array.isArray(this.ticketTypes) ? this.ticketTypes : [];
  return tickets.reduce((total, type) => total + ((type.quantity || 0) - (type.sold || 0)), 0);
});

// Update timestamp on save
eventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure virtuals are serialized
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
