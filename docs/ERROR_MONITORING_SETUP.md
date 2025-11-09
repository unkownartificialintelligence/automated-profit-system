# Error Monitoring Setup Guide

## Overview
This guide explains how to set up error monitoring using Sentry for production environments.

## Why Error Monitoring?

Error monitoring provides:
- **Real-time error tracking** - Get notified immediately when errors occur
- **Stack traces** - See exactly where errors happened
- **User context** - Understand what users were doing when errors occurred
- **Performance monitoring** - Track slow API endpoints
- **Release tracking** - Monitor errors by deployment version

## Sentry Setup (Recommended)

### 1. Create Sentry Account

1. Go to [https://sentry.io](https://sentry.io)
2. Sign up for a free account (up to 5,000 errors/month free)
3. Create a new project and select **Node.js/Express**

### 2. Install Sentry SDK

```bash
npm install @sentry/node @sentry/profiling-node --save
```

### 3. Configure Sentry

Create a Sentry configuration file:

**src/utils/sentry.js:**
```javascript
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

export const initSentry = (app) => {
  if (!process.env.SENTRY_DSN) {
    console.warn('⚠️  Sentry DSN not configured - error monitoring disabled');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      // Enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // Enable Express.js middleware tracing
      new Sentry.Integrations.Express({ app }),
      // Enable profiling
      new ProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Profiling
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  });

  console.log('✅ Sentry error monitoring initialized');
};

export default Sentry;
```

### 4. Add to server.js

Add this to **src/server.js** (before routes):

```javascript
import { initSentry } from './utils/sentry.js';
import Sentry from './utils/sentry.js';

// Initialize Sentry FIRST
initSentry(app);

// Sentry request handler must be the first middleware
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// ... your other middleware and routes ...

// Sentry error handler must be BEFORE other error handlers
app.use(Sentry.Handlers.errorHandler());

// Your custom error handler
app.use((err, req, res, next) => {
  logger.logError(err, req);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});
```

### 5. Add Environment Variable

Add to **.env**:
```bash
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

Add to **.env.example**:
```bash
# Error Monitoring (Recommended for production)
SENTRY_DSN=your_sentry_dsn_here
```

### 6. Add to render.yaml

```yaml
- key: SENTRY_DSN
  sync: false
```

## Manual Error Tracking

You can manually capture errors:

```javascript
import Sentry from './utils/sentry.js';

try {
  // Your code
} catch (error) {
  Sentry.captureException(error, {
    user: { id: userId, email: userEmail },
    tags: { feature: 'product-upload' },
    extra: { productData: data }
  });
}
```

## Alternative: Logging Services

If you prefer not to use Sentry, consider:

### LogRocket (Frontend + Backend)
- Great for session replay
- $99/month for production
- [https://logrocket.com](https://logrocket.com)

### Datadog (Enterprise)
- Comprehensive monitoring
- Expensive but powerful
- [https://www.datadoghq.com](https://www.datadoghq.com)

### Rollbar (Similar to Sentry)
- Good Sentry alternative
- Similar pricing
- [https://rollbar.com](https://rollbar.com)

## Best Practices

### 1. Don't Log Sensitive Data
```javascript
// ❌ BAD
Sentry.captureException(error, {
  extra: { password: req.body.password }
});

// ✅ GOOD
Sentry.captureException(error, {
  extra: {
    email: req.body.email,
    // Never log passwords or API keys
  }
});
```

### 2. Use Breadcrumbs
```javascript
Sentry.addBreadcrumb({
  category: 'auth',
  message: 'User login attempt',
  level: 'info'
});
```

### 3. Tag Errors for Filtering
```javascript
Sentry.setTag('feature', 'product-upload');
Sentry.setTag('tier', 'premium');
```

### 4. Set User Context
```javascript
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.username
});
```

## Testing Sentry

Test that Sentry is working:

```bash
curl http://localhost:3000/api/test-error
```

Add this test endpoint to **server.js**:
```javascript
// Test error endpoint (remove in production)
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/test-error', () => {
    throw new Error('Test Sentry error tracking!');
  });
}
```

## Monitoring Dashboard

After setup:
1. Go to your Sentry dashboard
2. Navigate to **Issues** to see errors
3. Check **Performance** for slow endpoints
4. Set up **Alerts** for critical errors

## Cost Considerations

| Plan | Errors/Month | Cost |
|------|--------------|------|
| Developer | 5,000 | Free |
| Team | 50,000 | $26/month |
| Business | 100,000 | $80/month |

Start with the free tier and upgrade as needed.

## Next Steps

1. ✅ Install Sentry SDK
2. ✅ Configure Sentry in your app
3. ✅ Add SENTRY_DSN to environment variables
4. ✅ Test error tracking
5. ✅ Set up Slack/email alerts in Sentry dashboard
6. ✅ Configure release tracking for deployments

## Support

- **Sentry Docs**: https://docs.sentry.io/platforms/node/guides/express/
- **Troubleshooting**: https://docs.sentry.io/platforms/node/troubleshooting/
