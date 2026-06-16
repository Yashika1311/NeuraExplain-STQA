const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

// Middleware to protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // Check for token in cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access this route' 
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user from the token
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access this route' 
    });
  }
};

// Middleware to authorize specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `User role ${req.user.role} is not authorized to access this route` 
      });
    }
    next();
  };
};

// Middleware to check if user is the owner of the resource
exports.checkOwnership = (model) => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params.id);
      
      // Check if resource exists
      if (!resource) {
        return res.status(404).json({ 
          success: false, 
          message: 'Resource not found' 
        });
      }
      
      // Check if user is the owner or admin
      if (resource.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(401).json({ 
          success: false, 
          message: 'Not authorized to update this resource' 
        });
      }
      
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  };
};

// Middleware to check if user is active
exports.checkActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user || user.status !== 'active') {
      return res.status(401).json({ 
        success: false, 
        message: 'Account is not active' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Active check error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};