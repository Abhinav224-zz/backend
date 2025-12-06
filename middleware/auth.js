const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT Secret - Hardcoded in code (must match the one in routes/auth.js)
const JWT_SECRET = 'your_super_secret_jwt_key_change_this_in_production';

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided. Authentication required.' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from token
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found. Invalid token.' 
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired. Please login again.' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Authentication error', 
      error: error.message 
    });
  }
};

module.exports = authMiddleware;

