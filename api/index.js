/**
 * Vercel Serverless Entry Point
 * This file is the entry point for all requests when deployed on Vercel
 */

import app from '../src/server.js';

// Export the Express app for Vercel serverless
export default app;
