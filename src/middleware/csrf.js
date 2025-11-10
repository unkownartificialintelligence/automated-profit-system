/**
 * CSRF Protection Middleware
 * Modern CSRF protection using Double Submit Cookie pattern
 * Since csurf is deprecated, we implement a secure alternative
 */

import crypto from 'crypto';
import logger from '../utils/logger.js';

// Generate a random CSRF token
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Verify CSRF token
const verifyToken = (cookieToken, headerToken) => {
  if (!cookieToken || !headerToken) {
    return false;
  }

  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(cookieToken),
      Buffer.from(headerToken)
    );
  } catch (error) {
    return false;
  }
};

/**
 * CSRF Token Generator Middleware
 * Generates and sets CSRF token in cookie
 */
export const csrfTokenGenerator = (req, res, next) => {
  // Skip for GET, HEAD, OPTIONS (safe methods)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    // Generate token for future use
    if (!req.cookies?.csrf_token) {
      const token = generateToken();
      res.cookie('csrf_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000 // 1 hour
      });
    }
  }

  next();
};

/**
 * CSRF Protection Middleware
 * Validates CSRF token for state-changing operations
 */
export const csrfProtection = (req, res, next) => {
  // Skip CSRF for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF for API endpoints with Bearer token authentication
  // (assumes API clients handle CSRF differently)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return next();
  }

  // Get tokens
  const cookieToken = req.cookies?.csrf_token;
  const headerToken = req.headers['x-csrf-token'] || req.body?.csrf_token;

  // Verify token
  if (!verifyToken(cookieToken, headerToken)) {
    logger.logSecurityEvent('csrf_token_invalid', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });

    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token'
    });
  }

  next();
};

/**
 * CSRF Token Endpoint
 * Provides CSRF token to frontend applications
 */
export const getCsrfToken = (req, res) => {
  const token = req.cookies?.csrf_token || generateToken();

  if (!req.cookies?.csrf_token) {
    res.cookie('csrf_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000 // 1 hour
    });
  }

  res.json({
    success: true,
    csrfToken: token
  });
};

/**
 * Apply CSRF protection to specific routes
 * Usage: router.post('/endpoint', applyCsrfProtection, handler)
 */
export const applyCsrfProtection = (req, res, next) => {
  return csrfProtection(req, res, next);
};

export default {
  csrfTokenGenerator,
  csrfProtection,
  getCsrfToken,
  applyCsrfProtection
};
