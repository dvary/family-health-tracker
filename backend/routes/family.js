const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Configure multer for profile picture uploads
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.env.UPLOAD_PATH || '/app/uploads', 'profiles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const profileUpload = multer({
  storage: profileStorage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB for profile pictures
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    // Enhanced validation: check both extension and MIME type
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF) are allowed for profile pictures'));
    }
  }
});

// Create initial family member
router.post('/members/initial', [
  authenticateToken,
  requireAdmin,
  body('name').notEmpty().trim(),
  body('dateOfBirth').optional().isISO8601(),
  body('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say']),
  body('bloodGroup').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  body('mobileNumber').optional().isMobilePhone('any'),
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

    const { name, dateOfBirth, gender, bloodGroup, mobileNumber, email, password } = req.body;
    const originalEmail = req.body.email; // Store original email before normalization

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
      'INSERT INTO users (email, original_email, password, family_id, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [email, originalEmail, hashedPassword, req.user.family_id, firstName, lastName, 'admin']
    );

    const userId = userResult.rows[0].id;

    const result = await query(
      `INSERT INTO family_members 
        (family_id, user_id, name, date_of_birth, gender, blood_group, mobile_number) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, name, date_of_birth, gender, blood_group, mobile_number, created_at`,
      [req.user.family_id, userId, name, dateOfBirth, gender, bloodGroup, mobileNumber]
    );

    res.status(201).json({
      message: 'Initial family member added successfully',
      member: result.rows[0]
    });
  } catch (error) {
    console.error('Add initial family member error:', error);
    
    // Handle specific database errors
    if (error.code === '23505') { // Unique violation
      if (error.constraint === 'users_email_key') {
        return res.status(400).json({ 
          error: 'Email already exists', 
          message: 'This email is already registered. Please use a different email address.' 
        });
      }
    }
    
    if (error.code === '23514') { // Check violation
      return res.status(400).json({ 
        error: 'Invalid data', 
        message: 'Please check your input data and try again.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to add initial family member', 
      message: 'Could not add initial family member. Please try again.' 
    });
  }
});

// Get all family members (admin can see all, regular users see only themselves)
router.get('/members', authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user.family_id) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'User not authenticated or family not found' 
      });
    }

    let query_text, query_params;

    if (req.user.role === 'admin') {
      // Admin can see all family members
      query_text = `SELECT 
        fm.id, 
        fm.name, 
        fm.date_of_birth, 
        fm.gender,
        fm.blood_group,
        fm.mobile_number,
        fm.profile_picture,
        fm.created_at,
        COALESCE(u.original_email, u.email) as user_email,
        u.id as user_id,
        u.role
      FROM family_members fm 
      LEFT JOIN users u ON fm.user_id = u.id 
      WHERE fm.family_id = $1 
      ORDER BY fm.created_at DESC`;
      query_params = [req.user.family_id];
    } else {
      // Regular users can only see their own data
      query_text = `SELECT 
        fm.id, 
        fm.name, 
        fm.date_of_birth, 
        fm.gender,
        fm.blood_group,
        fm.mobile_number,
        fm.profile_picture,
        fm.created_at,
        COALESCE(u.original_email, u.email) as user_email,
        u.id as user_id,
        u.role
      FROM family_members fm 
      LEFT JOIN users u ON fm.user_id = u.id 
      WHERE fm.family_id = $1 AND fm.user_id = $2 
      ORDER BY fm.created_at DESC`;
      query_params = [req.user.family_id, req.user.id];
    }

    const result = await query(query_text, query_params);

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
  requireAdmin,
  body('name').notEmpty().trim(),
  body('dateOfBirth').optional().isISO8601(),
  body('gender').isIn(['male', 'female', 'other', 'prefer_not_to_say']),
  body('bloodGroup').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  body('mobileNumber').optional().isString(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').optional().isIn(['non_admin', 'admin'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { name, dateOfBirth, gender, bloodGroup, mobileNumber, email, password } = req.body;
    const originalEmail = req.body.email; // Store original email before normalization

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

    const userRole = req.body.role || 'non_admin'; // Extract role with default

    const userResult = await query(
      'INSERT INTO users (email, original_email, password, family_id, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [email, originalEmail, hashedPassword, req.user.family_id, firstName, lastName, userRole]
    );

    const userId = userResult.rows[0].id;

    // Insert family member with user_id
    const memberResult = await query(
      `INSERT INTO family_members 
        (family_id, user_id, name, date_of_birth, gender, blood_group, mobile_number) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, name, date_of_birth, gender, blood_group, mobile_number, created_at`,
      [req.user.family_id, userId, name, dateOfBirth, gender, bloodGroup, mobileNumber]
    );

    res.status(201).json({
      message: 'Family member added successfully',
      member: memberResult.rows[0]
    });
  } catch (error) {
    console.error('Add family member error:', error);
    
    // Handle specific database errors
    if (error.code === '23505') { // Unique violation
      if (error.constraint === 'users_email_key') {
        return res.status(400).json({ 
          error: 'Email already exists', 
          message: 'This email is already registered. Please use a different email address.' 
        });
      }
    }
    
    if (error.code === '23514') { // Check violation
      return res.status(400).json({ 
        error: 'Invalid data', 
        message: 'Please check your input data and try again.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to add family member', 
      message: 'Could not add family member. Please try again.' 
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
        fm.blood_group,
        fm.mobile_number,
        fm.created_at,
        u.email as user_email,
        u.role
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
  requireAdmin,
  body('name').optional().notEmpty().trim(),
  body('dateOfBirth').optional().isISO8601(),
  body('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say']),
  body('bloodGroup').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  body('mobileNumber').optional().isString(),
  body('email').optional().isEmail().normalizeEmail(),
  body('password').optional().isLength({ min: 6 }),
  body('role').optional().isIn(['non_admin', 'admin'])
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
    const { name, dateOfBirth, gender, bloodGroup, mobileNumber, email, password, role } = req.body;

    // Check if member exists and belongs to family, and get user info
    const checkResult = await query(
      `SELECT fm.id, fm.user_id, u.email 
       FROM family_members fm 
       LEFT JOIN users u ON fm.user_id = u.id 
       WHERE fm.id = $1 AND fm.family_id = $2`,
      [memberId, req.user.family_id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Family member not found', 
        message: 'Family member does not exist' 
      });
    }

    const memberData = checkResult.rows[0];
    const userId = memberData.user_id;

    // Handle email update if provided
    if (email !== undefined && userId) {
      // Check if email already exists (excluding current user)
      const existingEmail = await query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, userId]
      );
      
      if (existingEmail.rows.length > 0) {
        return res.status(400).json({ 
          error: 'Email already exists', 
          message: 'This email is already registered by another user' 
        });
      }

      // Update user email and original email
      await query(
        'UPDATE users SET email = $1, original_email = $2, updated_at = NOW() WHERE id = $3',
        [email, email, userId]
      );
    }

    // Handle password update if provided
    if (password !== undefined && userId) {
      const hashedPassword = await bcrypt.hash(password, 12);
      await query(
        'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
        [hashedPassword, userId]
      );
    }

    // Handle role update if provided
    if (role !== undefined && userId) {
      await query(
        'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2',
        [role, userId]
      );
    }

    // Build update query for family member fields
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
    if (bloodGroup !== undefined) {
      updateFields.push(`blood_group = $${paramCount++}`);
      updateValues.push(bloodGroup);
    }
    if (mobileNumber !== undefined) {
      updateFields.push(`mobile_number = $${paramCount++}`);
      updateValues.push(mobileNumber);
    }

    // Only update family member if there are fields to update
    if (updateFields.length > 0) {
      updateValues.push(memberId, req.user.family_id);

      await query(
        `UPDATE family_members 
         SET ${updateFields.join(', ')}, updated_at = NOW() 
         WHERE id = $${paramCount++} AND family_id = $${paramCount++}`,
        updateValues
      );
    }

    // If name was updated and this member has a user_id, also update the user's name
    if (name !== undefined && userId) {
      // Split the name into first and last name
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      await query(
        'UPDATE users SET first_name = $1, last_name = $2, updated_at = NOW() WHERE id = $3',
        [firstName, lastName, userId]
      );
    }

    // Get updated member data
    const result = await query(
      `SELECT 
        fm.id, 
        fm.name, 
        fm.date_of_birth, 
        fm.gender,
        fm.blood_group,
        fm.mobile_number,
        fm.profile_picture,
        fm.created_at, 
        fm.updated_at,
        COALESCE(u.original_email, u.email) as user_email
      FROM family_members fm 
      LEFT JOIN users u ON fm.user_id = u.id 
      WHERE fm.id = $1 AND fm.family_id = $2`,
      [memberId, req.user.family_id]
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
router.delete('/members/:memberId', [authenticateToken, requireAdmin], async (req, res) => {
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

// Upload profile picture for family member
router.post('/members/:memberId/profile-picture', [authenticateToken, requireAdmin], profileUpload.single('profilePicture'), async (req, res) => {
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

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded', 
        message: 'Please select a profile picture to upload' 
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        error: 'Invalid file type', 
        message: 'Please upload a valid image file (JPEG, PNG, or GIF)' 
      });
    }

        // Validate file size (max 15MB)
    const maxSize = 15 * 1024 * 1024; // 15MB
    if (req.file.size > maxSize) {
      return res.status(400).json({
        error: 'File too large',
        message: 'Profile picture must be less than 15MB'
      });
    }

    // Use the file path from multer
    const filePath = `/uploads/profiles/${req.file.filename}`;

    // Update member with profile picture path
    const result = await query(
      `UPDATE family_members 
       SET profile_picture = $1, updated_at = NOW() 
       WHERE id = $2 AND family_id = $3 
       RETURNING id, name, profile_picture, updated_at`,
      [filePath, memberId, req.user.family_id]
    );

    res.json({
      message: 'Profile picture uploaded successfully',
      member: result.rows[0]
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ 
      error: 'Failed to upload profile picture', 
      message: 'Could not upload profile picture' 
    });
  }
});

module.exports = router;
