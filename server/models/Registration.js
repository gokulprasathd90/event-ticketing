const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event is required']
  },
  ticketType: {
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    }
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash'],
    required: true
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  checkInStatus: {
    type: String,
    enum: ['not_checked_in', 'checked_in', 'no_show'],
    default: 'not_checked_in'
  },
  checkInTime: Date,
  specialRequests: String,
  isActive: {
    type: Boolean,
    default: true
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

// Compound index to prevent duplicate registrations
registrationSchema.index({ user: 1, event: 1 }, { unique: true });

// Update timestamp on save
registrationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for registration status
registrationSchema.virtual('isConfirmed').get(function() {
  return this.status === 'confirmed' && this.paymentStatus === 'completed';
});

// Method to cancel registration
registrationSchema.methods.cancelRegistration = function() {
  this.status = 'cancelled';
  this.isActive = false;
  return this.save();
};

// Method to check in
registrationSchema.methods.checkIn = function() {
  this.checkInStatus = 'checked_in';
  this.checkInTime = new Date();
  return this.save();
};

module.exports = mongoose.model('Registration', registrationSchema);
