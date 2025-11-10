/**
 * Request ID Middleware
 * Adds unique request ID to each request for tracking and debugging
 */

import { randomUUID } from 'crypto';
import logger from '../utils/logger.js';

/**
 * Generate or use existing request ID
 */
export const requestIdMiddleware = (req, res, next) => {
  // Use existing request ID from header, or generate new one
  const requestId = req.headers['x-request-id'] || randomUUID();

  // Attach to request object
  req.id = requestId;

  // Add to response headers
  res.setHeader('X-Request-ID', requestId);

  // Log request with ID
  logger.info('Request received', {
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Track request timing
  const startTime = Date.now();

  // On response finish, log completion
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    logger.info('Request completed', {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
  });

  next();
};

export default requestIdMiddleware;
