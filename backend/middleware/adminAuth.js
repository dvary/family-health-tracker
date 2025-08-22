const { authenticateToken } = require('./auth');

const requireAdmin = (req, res, next) => {
  // First authenticate the token
  authenticateToken(req, res, (err) => {
    if (err) {
      return res.status(401).json({ 
        error: 'Authentication required', 
        message: 'Please log in to access this resource' 
      });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied', 
        message: 'Admin privileges required for this action' 
      });
    }

    next();
  });
};

module.exports = { requireAdmin };
