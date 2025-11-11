/**
 * Structured Logging with Winston
 * Provides consistent, structured logging across the application
 */

import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development (more readable)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Detect serverless environment (Vercel)
const isServerless = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME;

// Build transports array based on environment
const transports = [
  // Always log to console
  new winston.transports.Console({
    format: consoleFormat
  })
];

// Only add file transports in non-serverless environments
if (!isServerless) {
  transports.push(
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: logFormat,
  defaultMeta: {
    service: 'automated-profit-system',
    environment: process.env.NODE_ENV || 'development',
    serverless: isServerless
  },
  transports,
  // Only use file-based exception/rejection handlers in non-serverless
  ...(isServerless ? {} : {
    exceptionHandlers: [
      new winston.transports.File({
        filename: path.join(__dirname, '../../logs/exceptions.log')
      })
    ],
    rejectionHandlers: [
      new winston.transports.File({
        filename: path.join(__dirname, '../../logs/rejections.log')
      })
    ]
  })
});

// Create a stream object for Morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Add request logging helper
logger.logRequest = (req, res, responseTime) => {
  logger.info('HTTP Request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`
  });
};

// Add error logging helper
logger.logError = (error, req = null) => {
  const errorLog = {
    message: error.message,
    stack: error.stack,
    name: error.name
  };

  if (req) {
    errorLog.request = {
      method: req.method,
      url: req.url,
      ip: req.ip,
      body: req.body,
      params: req.params,
      query: req.query
    };
  }

  logger.error('Application Error', errorLog);
};

// Add security event logging
logger.logSecurityEvent = (event, details = {}) => {
  logger.warn('Security Event', {
    event,
    ...details,
    timestamp: new Date().toISOString()
  });
};

// Add database query logging (use sparingly, only for debugging)
logger.logQuery = (query, params = []) => {
  if (process.env.LOG_LEVEL === 'debug') {
    logger.debug('Database Query', {
      query,
      params
    });
  }
};

// Add business event logging
logger.logBusinessEvent = (event, data = {}) => {
  logger.info('Business Event', {
    event,
    ...data
  });
};

export default logger;
