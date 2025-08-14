const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied', 
      message: 'No token provided' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const result = await query(
      'SELECT id, email, family_id FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Invalid token', 
        message: 'User not found' 
      });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ 
      error: 'Invalid token', 
      message: 'Token is not valid' 
    });
  }
};

const authorizeFamilyMember = async (req, res, next) => {
  const { memberId } = req.params;
  
  try {
    // Check if the member belongs to the user's family
    const result = await query(
      'SELECT id FROM family_members WHERE id = $1 AND family_id = $2',
      [memberId, req.user.family_id]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ 
        error: 'Access denied', 
        message: 'You can only access your family members' 
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ 
      error: 'Server error', 
      message: 'Error checking family member access' 
    });
  }
};

module.exports = {
  authenticateToken,
  authorizeFamilyMember
};
