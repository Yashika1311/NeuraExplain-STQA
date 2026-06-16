const { User } = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Input validation
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide all required fields: name, email, password, and phone' 
      });
    }

    // Check if user already exists by email or phone
    let existingUser = await User.findOne({ 
      $or: [
        { email },
        { phone }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: existingUser.email === email 
          ? 'Email already in use' 
          : 'Phone number already in use'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      phone,
      password
    });

    await user.save();

    // Generate JWT token
    const token = user.generateAuthToken();

    // Remove sensitive data before sending response
    const userResponse = user.toObject();
    delete userResponse.password;

    // Set CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', true);

    return res.status(201).json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Set CORS headers for error response
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      const retryAfter = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
      return res.status(403).json({
        success: false,
        message: `Account locked. Try again in ${retryAfter} minutes`
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Increment failed login attempts
      await user.incrementLoginAttempts();
      
      const attemptsLeft = 4 - user.failedLoginAttempts;
      return res.status(401).json({
        success: false,
        message: `Invalid credentials. ${attemptsLeft} attempts left`,
        attemptsLeft
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Generate JWT token
    const token = user.generateAuthToken();

    // Log token to server output for developer visibility (local/dev only)
    try {
      console.log(`Login token for ${user.email}: ${token}`);
    } catch (e) {
      console.log('Login token:', token);
    }

    // Remove sensitive data before sending response
    user = user.toObject();
    delete user.password;

    res.json({
      success: true,
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user found with this email' });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Hash token and set to resetPasswordToken field
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
      
    // Set expire (10 minutes)
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    
    await user.save();
    
    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
    
    // Send email
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
    
    try {
      await sendEmail({
        email: user.email,
        subject: 'Password reset token',
        message
      });
      
      res.status(200).json({ success: true, message: 'Email sent' });
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      
      return res.status(500).json({ 
        success: false, 
        message: 'Email could not be sent' 
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');
      
    const user = await User.findOne({
      passwordResetToken: resetPasswordToken,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    
    // Set new password
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    await user.save();
    
    // Generate JWT token
    const token = user.generateAuthToken();
    
    res.json({
      success: true,
      token,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};