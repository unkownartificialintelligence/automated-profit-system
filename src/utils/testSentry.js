/**
 * Sentry Test Endpoint
 * Use this to verify Sentry is working
 */

// Add this to your server.js file or create a test route

/**
 * @swagger
 * /api/test-sentry-error:
 *   get:
 *     summary: Test Sentry error tracking
 *     description: Triggers a test error to verify Sentry integration is working (development only)
 *     tags: [Testing]
 *     responses:
 *       500:
 *         description: Test error triggered
 */

export const testSentryError = (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Test endpoints disabled in production'
    });
  }

  // This will be caught by Sentry
  throw new Error('🧪 Test error for Sentry - If you see this in your Sentry dashboard, it\'s working!');
};
