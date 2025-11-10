/**
 * Input Validation Middleware
 * Provides sanitization and validation for API requests
 */

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Sanitize string input
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, ''); // Remove potential XSS characters
};

// Validate email format
export const isValidEmail = (email) => {
  return EMAIL_REGEX.test(email);
};

// Validate required fields
export const validateRequired = (fields) => {
  return (req, res, next) => {
    const errors = [];

    for (const field of fields) {
      if (!req.body[field] || (typeof req.body[field] === 'string' && req.body[field].trim() === '')) {
        errors.push(`${field} is required`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  };
};

// Validate email field
export const validateEmail = (fieldName = 'email') => {
  return (req, res, next) => {
    const email = req.body[fieldName];

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${fieldName} format`
      });
    }

    // Sanitize email
    req.body[fieldName] = sanitizeString(email).toLowerCase();
    next();
  };
};

// Validate numeric field
export const validateNumeric = (fields) => {
  return (req, res, next) => {
    const errors = [];

    for (const field of fields) {
      const value = req.body[field];
      if (value !== undefined && value !== null) {
        const num = Number(value);
        if (isNaN(num)) {
          errors.push(`${field} must be a valid number`);
        } else {
          req.body[field] = num; // Convert to number
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  };
};

// Validate string length
export const validateLength = (field, min = 0, max = 1000) => {
  return (req, res, next) => {
    const value = req.body[field];

    if (value && typeof value === 'string') {
      const length = value.trim().length;

      if (length < min) {
        return res.status(400).json({
          success: false,
          message: `${field} must be at least ${min} characters long`
        });
      }

      if (length > max) {
        return res.status(400).json({
          success: false,
          message: `${field} must not exceed ${max} characters`
        });
      }

      // Sanitize
      req.body[field] = sanitizeString(value);
    }

    next();
  };
};

// Validate positive number
export const validatePositive = (fields) => {
  return (req, res, next) => {
    const errors = [];

    for (const field of fields) {
      const value = req.body[field];
      if (value !== undefined && value !== null) {
        const num = Number(value);
        if (isNaN(num) || num < 0) {
          errors.push(`${field} must be a positive number`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  };
};

// Validate enum values
export const validateEnum = (field, allowedValues) => {
  return (req, res, next) => {
    const value = req.body[field];

    if (value && !allowedValues.includes(value)) {
      return res.status(400).json({
        success: false,
        message: `${field} must be one of: ${allowedValues.join(', ')}`
      });
    }

    next();
  };
};

// Sanitize all string fields in request body
export const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    }
  }
  next();
};

// Validate UUID format (for IDs)
export const validateUUID = (field) => {
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  return (req, res, next) => {
    const value = req.params[field] || req.body[field];

    if (value && !UUID_REGEX.test(value)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${field} format`
      });
    }

    next();
  };
};

// Validate integer (for database IDs)
export const validateInteger = (field, source = 'params') => {
  return (req, res, next) => {
    const value = source === 'params' ? req.params[field] : req.body[field];

    if (value) {
      const num = parseInt(value, 10);
      if (isNaN(num) || num.toString() !== value.toString()) {
        return res.status(400).json({
          success: false,
          message: `${field} must be a valid integer`
        });
      }

      // Store parsed integer
      if (source === 'params') {
        req.params[field] = num;
      } else {
        req.body[field] = num;
      }
    }

    next();
  };
};

// Prevent SQL injection - check for suspicious patterns
export const preventSQLInjection = (req, res, next) => {
  const suspiciousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
    /(--|\;|\/\*|\*\/|xp_|sp_)/gi
  ];

  const checkValue = (value) => {
    if (typeof value === 'string') {
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(value)) {
          return true;
        }
      }
    }
    return false;
  };

  // Check body
  if (req.body) {
    for (const key in req.body) {
      if (checkValue(req.body[key])) {
        return res.status(400).json({
          success: false,
          message: 'Invalid input detected'
        });
      }
    }
  }

  // Check query params
  if (req.query) {
    for (const key in req.query) {
      if (checkValue(req.query[key])) {
        return res.status(400).json({
          success: false,
          message: 'Invalid input detected'
        });
      }
    }
  }

  next();
};

export default {
  sanitizeString,
  isValidEmail,
  validateRequired,
  validateEmail,
  validateNumeric,
  validateLength,
  validatePositive,
  validateEnum,
  sanitizeBody,
  validateUUID,
  validateInteger,
  preventSQLInjection
};
