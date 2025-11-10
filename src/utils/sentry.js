/**
 * Sentry Error Monitoring Integration
 * Provides real-time error tracking and performance monitoring
 */

import * as Sentry from '@sentry/node';
import logger from './logger.js';

// Try to import profiling, but don't fail if not available
let ProfilingIntegration;
try {
  const profilingModule = await import('@sentry/profiling-node');
  ProfilingIntegration = profilingModule.ProfilingIntegration;
} catch (error) {
  logger.debug('Sentry profiling not available');
}

let sentryInitialized = false;

/**
 * Initialize Sentry error monitoring
 * @param {Express} app - Express application instance
 */
export const initSentry = (app) => {
  if (!process.env.SENTRY_DSN) {
    logger.warn('⚠️  Sentry DSN not configured - error monitoring disabled');
    logger.info('   To enable: Set SENTRY_DSN in environment variables');
    logger.info('   Get DSN from: https://sentry.io');
    return false;
  }

  try {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',

      // Set sample rates based on environment
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

      integrations: [
        // Enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),

        // Enable Express.js middleware tracing
        new Sentry.Integrations.Express({ app }),

        // Enable profiling if available
        ...(ProfilingIntegration ? [new ProfilingIntegration()] : []),

        // Enable database query tracking
        new Sentry.Integrations.OnUncaughtException({
          onFatalError: (err) => {
            logger.error('Fatal error occurred', { error: err });
            process.exit(1);
          }
        }),

        new Sentry.Integrations.OnUnhandledRejection({
          mode: 'warn'
        })
      ],

      // Filter out sensitive data
      beforeSend(event, hint) {
        // Remove passwords and API keys from error data
        if (event.request) {
          if (event.request.data) {
            delete event.request.data.password;
            delete event.request.data.api_key;
            delete event.request.data.token;
          }

          if (event.request.headers) {
            delete event.request.headers.authorization;
            delete event.request.headers['x-api-key'];
          }
        }

        return event;
      },

      // Ignore certain errors
      ignoreErrors: [
        'Not allowed by CORS',
        'Too many requests',
        'Invalid token',
        'No token provided'
      ]
    });

    sentryInitialized = true;
    logger.info('✅ Sentry error monitoring initialized', {
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0
    });

    return true;
  } catch (error) {
    logger.error('Failed to initialize Sentry', { error: error.message });
    return false;
  }
};

/**
 * Get Sentry request handler middleware
 */
export const sentryRequestHandler = () => {
  if (!sentryInitialized) {
    return (req, res, next) => next();
  }
  return Sentry.Handlers.requestHandler();
};

/**
 * Get Sentry tracing handler middleware
 */
export const sentryTracingHandler = () => {
  if (!sentryInitialized) {
    return (req, res, next) => next();
  }
  return Sentry.Handlers.tracingHandler();
};

/**
 * Get Sentry error handler middleware
 */
export const sentryErrorHandler = () => {
  if (!sentryInitialized) {
    return (req, res, next) => next();
  }
  return Sentry.Handlers.errorHandler();
};

/**
 * Manually capture an exception
 */
export const captureException = (error, context = {}) => {
  if (!sentryInitialized) {
    logger.error('Exception occurred (Sentry not initialized)', { error, context });
    return;
  }

  Sentry.captureException(error, {
    tags: context.tags || {},
    extra: context.extra || {},
    user: context.user || {}
  });
};

/**
 * Manually capture a message
 */
export const captureMessage = (message, level = 'info', context = {}) => {
  if (!sentryInitialized) {
    logger.log(level, message, context);
    return;
  }

  Sentry.captureMessage(message, {
    level,
    tags: context.tags || {},
    extra: context.extra || {}
  });
};

/**
 * Set user context for error tracking
 */
export const setUser = (user) => {
  if (!sentryInitialized) return;

  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username || user.name
  });
};

/**
 * Clear user context
 */
export const clearUser = () => {
  if (!sentryInitialized) return;
  Sentry.setUser(null);
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (breadcrumb) => {
  if (!sentryInitialized) return;

  Sentry.addBreadcrumb({
    message: breadcrumb.message,
    category: breadcrumb.category || 'manual',
    level: breadcrumb.level || 'info',
    data: breadcrumb.data || {}
  });
};

/**
 * Check if Sentry is initialized
 */
export const isSentryEnabled = () => sentryInitialized;

export default {
  initSentry,
  sentryRequestHandler,
  sentryTracingHandler,
  sentryErrorHandler,
  captureException,
  captureMessage,
  setUser,
  clearUser,
  addBreadcrumb,
  isSentryEnabled
};
