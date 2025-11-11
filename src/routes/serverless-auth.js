/**
 * Serverless-Compatible Authentication
 * Uses environment variables instead of database for Vercel deployment
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { validateRequired, validateEmail } from '../middleware/validation.js';

const router = express.Router();

// Strict rate limiter for authentication
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes.'
  }
});

/**
 * POST /api/auth/login
 * Environment-based login for serverless deployment
 */
router.post('/login',
  authLimiter,
  validateRequired(['email', 'password']),
  validateEmail('email'),
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Check if environment variables are configured
      if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD_HASH) {
        return res.status(500).json({
          success: false,
          message: 'Authentication not configured. Please set ADMIN_EMAIL and ADMIN_PASSWORD_HASH in Vercel environment variables.'
        });
      }

      if (!process.env.JWT_SECRET) {
        return res.status(500).json({
          success: false,
          message: 'JWT_SECRET not configured'
        });
      }

      // Validate email
      if (email !== process.env.ADMIN_EMAIL) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Validate password
      const validPassword = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
      if (!validPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          email: email,
          role: 'admin',
          name: process.env.ADMIN_NAME || 'Admin'
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        token,
        user: {
          email: email,
          name: process.env.ADMIN_NAME || 'Admin',
          role: 'admin'
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during login'
      });
    }
  }
);

/**
 * POST /api/auth/verify
 * Verify JWT token
 */
router.post('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'JWT_SECRET not configured'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.json({
      success: true,
      valid: true,
      user: {
        email: decoded.email,
        name: decoded.name,
        role: decoded.role
      }
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      valid: false,
      message: 'Invalid or expired token'
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user info from token
 */
router.get('/me', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.json({
      success: true,
      user: {
        email: decoded.email,
        name: decoded.name,
        role: decoded.role
      }
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

export default router;
