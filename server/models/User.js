const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { CHAT_MODES } = require('./Chat');

// User roles and statuses
const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator'
};

const USER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  PENDING: 'pending'
};

const UserSchema = new mongoose.Schema({
  // Authentication
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true,
    lowercase: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: true,
    minlength: 8,
    select: false // Don't return password in queries by default
  },
  
  // Profile
  name: { 
    type: String, 
    required: true, 
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate: {
      validator: function(v) {
        // Basic phone number validation - adjust regex as needed
        return /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  avatar: { 
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  
  // Preferences
  preferences: {
    theme: { 
      type: String, 
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    defaultChatMode: { 
      type: String, 
      enum: Object.values(CHAT_MODES),
      default: CHAT_MODES.STUDY
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sound: { type: Boolean, default: true }
    }
  },
  
  // Security
  role: { 
    type: String, 
    enum: Object.values(USER_ROLES),
    default: USER_ROLES.USER
  },
  status: { 
    type: String, 
    enum: Object.values(USER_STATUS),
    default: USER_STATUS.ACTIVE
  },
  lastLogin: Date,
  failedLoginAttempts: { 
    type: Number, 
    default: 0 
  },
  lockUntil: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerified: { 
    type: Boolean, 
    default: false 
  },
  
  // Statistics
  stats: {
    totalChats: { type: Number, default: 0 },
    totalTokensUsed: { type: Number, default: 0 },
    favoriteMode: { type: String, default: CHAT_MODES.STUDY },
    lastActive: Date
  },
  
  // Timestamps
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Remove sensitive data when converting to JSON
      delete ret.password;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.emailVerificationToken;
      delete ret.failedLoginAttempts;
      delete ret.lockUntil;
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.emailVerificationToken;
      delete ret.failedLoginAttempts;
      delete ret.lockUntil;
      return ret;
    }
  }
});

// Virtual for user's full name (if we had first/last name split)
UserSchema.virtual('fullName').get(function() {
  return this.name;
});

// Pre-save hook to hash password
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to check password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
UserSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      email: this.email, 
      role: this.role 
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Method to check if account is locked
UserSchema.methods.isAccountLocked = function() {
  return this.lockUntil && this.lockUntil > Date.now();
};

// Method to increment failed login attempts
UserSchema.methods.incrementLoginAttempts = async function() {
  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCK_TIME = 15 * 60 * 1000; // 15 minutes
  
  if (this.failedLoginAttempts + 1 >= MAX_LOGIN_ATTEMPTS) {
    this.lockUntil = new Date(Date.now() + LOCK_TIME);
  }
  
  this.failedLoginAttempts += 1;
  await this.save();
};

// Method to reset login attempts after successful login
UserSchema.methods.resetLoginAttempts = async function() {
  this.failedLoginAttempts = 0;
  this.lockUntil = undefined;
  this.lastLogin = new Date();
  await this.save();
};

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ status: 1 });
UserSchema.index({ 'preferences.defaultChatMode': 1 });
UserSchema.index({ 'stats.lastActive': -1 });

// Create and export the model
const User = mongoose.model('User', UserSchema);

// Export constants
module.exports = {
  User,
  USER_ROLES,
  USER_STATUS
};