const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create initial family member
router.post('/members/initial', [
  authenticateToken,
  body('name').notEmpty().trim(),
  body('dateOfBirth').optional().isISO8601(),
  body('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say']),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { name, dateOfBirth, gender, email, password } = req.body;

    // Check if family already has members
    const existingMembers = await query(
      'SELECT COUNT(*) as count FROM family_members WHERE family_id = $1',
      [req.user.family_id]
    );

    if (parseInt(existingMembers.rows[0].count) > 0) {
      return res.status(400).json({
        error: 'Family already has members',
        message: 'Use the regular add member endpoint for additional family members'
      });
    }

    // Check if email already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Email already exists', 
        message: 'This email is already registered' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user account
    const nameParts = name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const userResult = await query(
      'INSERT INTO users (email, password, family_id, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [email, hashedPassword, req.user.family_id, firstName, lastName]
    );

    const userId = userResult.rows[0].id;

    const result = await query(
      `INSERT INTO family_members 
        (family_id, user_id, name, date_of_birth, gender) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, date_of_birth, gender, created_at`,
      [req.user.family_id, userId, name, dateOfBirth, gender]
    );

    res.status(201).json({
      message: 'Initial family member added successfully',
      member: result.rows[0]
    });
  } catch (error) {
    console.error('Add initial family member error:', error);
    res.status(500).json({ 
      error: 'Failed to add initial family member', 
      message: 'Could not add initial family member' 
    });
  }
});

// Get all family members
router.get('/members', authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user.family_id) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'User not authenticated or family not found' 
      });
    }
    const result = await query(
      `SELECT 
        fm.id, 
        fm.name, 
        fm.date_of_birth, 
        fm.gender,
        fm.created_at,
        u.email as user_email
      FROM family_members fm 
      LEFT JOIN users u ON fm.user_id = u.id 
      WHERE fm.family_id = $1 
      ORDER BY fm.created_at DESC`,
      [req.user.family_id]
    );

    res.json({
      members: result.rows
    });
  } catch (error) {
    console.error('Get family members error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch family members', 
      message: 'Could not retrieve family members' 
    });
  }
});

// Add new family member
router.post('/members', [
  authenticateToken,
  body('name').notEmpty().trim(),
  body('dateOfBirth').optional().isISO8601(),
  body('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say']),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { name, dateOfBirth, gender, email, password } = req.body;

    // Check if email already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Email already exists', 
        message: 'This email is already registered' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user account
    const nameParts = name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const userResult = await query(
      'INSERT INTO users (email, password, family_id, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [email, hashedPassword, req.user.family_id, firstName, lastName]
    );

    const userId = userResult.rows[0].id;

    // Insert family member with user_id
    const memberResult = await query(
      `INSERT INTO family_members 
        (family_id, user_id, name, date_of_birth, gender) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, date_of_birth, gender, created_at`,
      [req.user.family_id, userId, name, dateOfBirth, gender]
    );

    res.status(201).json({
      message: 'Family member added successfully',
      member: memberResult.rows[0]
    });
  } catch (error) {
    console.error('Add family member error:', error);
    res.status(500).json({ 
      error: 'Failed to add family member', 
      message: 'Could not add family member' 
    });
  }
});

// Get specific family member
router.get('/members/:memberId', authenticateToken, async (req, res) => {
  try {
    const { memberId } = req.params;

    const result = await query(
      `SELECT 
        fm.id, 
        fm.name, 
        fm.date_of_birth, 
        fm.gender,
        fm.created_at,
        u.email as user_email
      FROM family_members fm 
      LEFT JOIN users u ON fm.user_id = u.id 
      WHERE fm.id = $1 AND fm.family_id = $2`,
      [memberId, req.user.family_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Family member not found', 
        message: 'Family member does not exist' 
      });
    }

    res.json({
      member: result.rows[0]
    });
  } catch (error) {
    console.error('Get family member error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch family member', 
      message: 'Could not retrieve family member' 
    });
  }
});

// Update family member
router.put('/members/:memberId', [
  authenticateToken,
  body('name').optional().notEmpty().trim(),
  body('dateOfBirth').optional().isISO8601(),
  body('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { memberId } = req.params;
    const { name, dateOfBirth, gender } = req.body;

    // Check if member exists and belongs to family
    const checkResult = await query(
      'SELECT id FROM family_members WHERE id = $1 AND family_id = $2',
      [memberId, req.user.family_id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Family member not found', 
        message: 'Family member does not exist' 
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramCount++}`);
      updateValues.push(name);
    }
    if (dateOfBirth !== undefined) {
      updateFields.push(`date_of_birth = $${paramCount++}`);
      updateValues.push(dateOfBirth);
    }
    if (gender !== undefined) {
      updateFields.push(`gender = $${paramCount++}`);
      updateValues.push(gender);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ 
        error: 'No fields to update', 
        message: 'Please provide at least one field to update' 
      });
    }

    updateValues.push(memberId, req.user.family_id);

    const result = await query(
      `UPDATE family_members 
       SET ${updateFields.join(', ')}, updated_at = NOW() 
       WHERE id = $${paramCount++} AND family_id = $${paramCount++} 
       RETURNING id, name, date_of_birth, gender, created_at, updated_at`,
      updateValues
    );

    res.json({
      message: 'Family member updated successfully',
      member: result.rows[0]
    });
  } catch (error) {
    console.error('Update family member error:', error);
    res.status(500).json({ 
      error: 'Failed to update family member', 
      message: 'Could not update family member' 
    });
  }
});

// Delete family member
router.delete('/members/:memberId', authenticateToken, async (req, res) => {
  try {
    const { memberId } = req.params;

    // Check if member exists and belongs to family
    const checkResult = await query(
      'SELECT id FROM family_members WHERE id = $1 AND family_id = $2',
      [memberId, req.user.family_id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Family member not found', 
        message: 'Family member does not exist' 
      });
    }

    // Delete associated health data
    await query('DELETE FROM health_vitals WHERE member_id = $1', [memberId]);
    await query('DELETE FROM medical_reports WHERE member_id = $1', [memberId]);
    await query('DELETE FROM documents WHERE member_id = $1', [memberId]);

    // Delete family member
    await query(
      'DELETE FROM family_members WHERE id = $1 AND family_id = $2',
      [memberId, req.user.family_id]
    );

    res.json({
      message: 'Family member deleted successfully'
    });
  } catch (error) {
    console.error('Delete family member error:', error);
    res.status(500).json({ 
      error: 'Failed to delete family member', 
      message: 'Could not delete family member' 
    });
  }
});

module.exports = router;
