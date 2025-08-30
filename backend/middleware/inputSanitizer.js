const validator = require('validator');
const path = require('path');

// Sanitize string inputs
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return validator.escape(str.trim());
};

// Sanitize email
const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return email;
  return validator.normalizeEmail(email.trim());
};

// Sanitize numeric inputs
const sanitizeNumber = (num) => {
  if (typeof num === 'number') return num;
  if (typeof num === 'string') {
    const parsed = parseFloat(num);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
};

// Sanitize date inputs
const sanitizeDate = (date) => {
  if (!date) return null;
  if (date instanceof Date) return date;
  if (typeof date === 'string') {
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

// Main sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Sanitize body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      const value = req.body[key];
      
      if (key.toLowerCase().includes('email')) {
        req.body[key] = sanitizeEmail(value);
      } else if (key.toLowerCase().includes('name') || key.toLowerCase().includes('description') || key.toLowerCase().includes('notes')) {
        req.body[key] = sanitizeString(value);
      } else if (key.toLowerCase().includes('value') || key.toLowerCase().includes('size') || key.toLowerCase().includes('count')) {
        req.body[key] = sanitizeNumber(value);
      } else if (key.toLowerCase().includes('date') || key.toLowerCase().includes('time')) {
        req.body[key] = sanitizeDate(value);
      } else if (typeof value === 'string') {
        req.body[key] = sanitizeString(value);
      }
    });
  }

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      const value = req.query[key];
      if (typeof value === 'string') {
        req.query[key] = sanitizeString(value);
      }
    });
  }

  next();
};

// Validate file upload
const validateFileUpload = (allowedTypes, maxSize) => {
  return (req, res, next) => {
    if (req.file) {
      // Check file size
      if (req.file.size > maxSize) {
        return res.status(400).json({
          error: 'File too large',
          message: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`
        });
      }

      // Check file type
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          error: 'Invalid file type',
          message: `Only ${allowedTypes.join(', ')} files are allowed`
        });
      }

      // Check file extension
      const ext = path.extname(req.file.originalname).toLowerCase();
      const allowedExtensions = allowedTypes.map(type => {
        switch (type) {
          case 'image/jpeg': return '.jpg';
          case 'image/png': return '.png';
          case 'image/gif': return '.gif';
          case 'application/pdf': return '.pdf';
          default: return null;
        }
      }).filter(Boolean);

      if (!allowedExtensions.includes(ext)) {
        return res.status(400).json({
          error: 'Invalid file extension',
          message: `Only ${allowedExtensions.join(', ')} extensions are allowed`
        });
      }
    }
    next();
  };
};

module.exports = {
  sanitizeInput,
  validateFileUpload,
  sanitizeString,
  sanitizeEmail,
  sanitizeNumber,
  sanitizeDate
};
