const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register new family account
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('familyName').notEmpty().trim(),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { email, password, familyName, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        error: 'User already exists', 
        message: 'Email is already registered' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create family
    const familyResult = await query(
      'INSERT INTO families (name) VALUES ($1) RETURNING id',
      [familyName]
    );
    const familyId = familyResult.rows[0].id;

    // Create user (first user in family becomes admin)
    const userResult = await query(
      'INSERT INTO users (email, password, family_id, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, first_name, last_name, role',
      [email, hashedPassword, familyId, firstName, lastName, 'admin']
    );

    // Create family member profile for the user
    await query(
      'INSERT INTO family_members (family_id, user_id, name, date_of_birth) VALUES ($1, $2, $3, $4)',
      [familyId, userResult.rows[0].id, `${firstName} ${lastName}`, null]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: userResult.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'Family account created successfully',
      user: {
        id: userResult.rows[0].id,
        email: userResult.rows[0].email,
        firstName: userResult.rows[0].first_name,
        lastName: userResult.rows[0].last_name,
        familyId,
        role: userResult.rows[0].role
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed', 
      message: 'Could not create family account' 
    });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    console.log('Login attempt for email:', req.body.email);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user
    const userResult = await query(
      'SELECT u.id, u.email, u.password, u.first_name, u.last_name, u.family_id, u.role, f.name as family_name FROM users u JOIN families f ON u.family_id = f.id WHERE u.email = $1',
      [email]
    );

    console.log('User query result:', userResult.rows.length, 'rows found');

    if (userResult.rows.length === 0) {
      console.log('No user found for email:', email);
      return res.status(401).json({ 
        error: 'Invalid credentials', 
        message: 'Email or password is incorrect' 
      });
    }

    const user = userResult.rows[0];
    console.log('User found:', { id: user.id, email: user.email, firstName: user.first_name });

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password validation:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ 
        error: 'Invalid credentials', 
        message: 'Email or password is incorrect' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const responseData = {
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        familyId: user.family_id,
        familyName: user.family_name,
        role: user.role
      },
      token
    };

    console.log('Sending login response:', { 
      message: responseData.message,
      userId: responseData.user.id,
      tokenPresent: !!responseData.token
    });

    res.json(responseData);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed', 
      message: 'Could not authenticate user' 
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userResult = await query(
      'SELECT u.id, u.email, u.first_name, u.last_name, u.family_id, u.role, f.name as family_name FROM users u JOIN families f ON u.family_id = f.id WHERE u.id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'User not found', 
        message: 'User profile not found' 
      });
    }

    const user = userResult.rows[0];
    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        familyId: user.family_id,
        familyName: user.family_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      error: 'Profile fetch failed', 
      message: 'Could not fetch user profile' 
    });
  }
});

module.exports = router;
