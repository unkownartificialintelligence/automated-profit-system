# Automated Profit System - Setup & Configuration Guide

## Quick Start

This guide will walk you through setting up all necessary API keys and configurations to ensure your Automated Profit System is fully operational.

---

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [API Key Configuration](#api-key-configuration)
3. [Health Check Testing](#health-check-testing)
4. [Troubleshooting](#troubleshooting)
5. [Security Best Practices](#security-best-practices)

---

## Environment Setup

### 1. Create Your Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

### 2. Configure Core Settings

Edit the `.env` file and update these essential settings:

```bash
# Server Configuration
PORT=3003
NODE_ENV=production  # Use 'development' for local testing

# Security - IMPORTANT: Generate a strong secret!
JWT_SECRET=your_super_secure_jwt_secret_key_here_min_32_chars
```

**Generate a Strong JWT Secret:**

```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## API Key Configuration

### 🖼️ Printful API (Print-on-Demand)

**Purpose:** Connect to Printful for product fulfillment and inventory management.

**Setup Steps:**

1. Go to [Printful Dashboard](https://www.printful.com/dashboard/store)
2. Navigate to **Settings** → **API**
3. Click **Generate API Key**
4. Copy the key and add to `.env`:

```bash
PRINTFUL_API_KEY=your_printful_api_key_here
```

**Health Check:** The system will verify Printful connectivity at `/api/health`

---

### 💳 Stripe API (Payment Processing)

**Purpose:** Process payments and manage customer transactions.

**Setup Steps:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Find your API keys section
3. **For Development:**
   - Copy the **Test Mode** secret key (starts with `sk_test_...`)
4. **For Production:**
   - Copy the **Live Mode** secret key (starts with `sk_live_...`)
5. Add to `.env`:

```bash
STRIPE_API_KEY=sk_test_your_stripe_key_here
```

**Get Webhook Secret (Optional but Recommended):**

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Enter your endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen to
5. Copy the webhook signing secret:

```bash
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

**Health Check:** The system will verify Stripe connectivity by checking your account balance.

---

### 🤖 OpenAI API (AI Features)

**Purpose:** Enable AI-powered features like product description generation and profit optimization.

**Setup Steps:**

1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Click **Create new secret key**
3. Give it a name (e.g., "Automated Profit System")
4. Copy the key (you won't be able to see it again!)
5. Add to `.env`:

```bash
OPENAI_API_KEY=sk-your_openai_api_key_here
```

**Cost Management:**

- Set usage limits in your OpenAI dashboard
- Monitor usage at [OpenAI Usage Dashboard](https://platform.openai.com/usage)

**Health Check:** The system will verify OpenAI connectivity by listing available models.

---

### 📧 Email Configuration (Optional)

**Purpose:** Send transactional emails, notifications, and reports.

**For Gmail:**

1. Enable 2-factor authentication on your Google account
2. Generate an App Password:
   - Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Select **Mail** and your device
   - Copy the 16-character password
3. Add to `.env`:

```bash
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_16_char_app_password
EMAIL_FROM=noreply@yourcompany.com
```

---

## Health Check Configuration

### Configurable Thresholds

Customize health check warning and error thresholds in `.env`:

```bash
# Memory Usage Thresholds (percentage)
HEALTH_MEMORY_WARNING_THRESHOLD=80   # Yellow alert
HEALTH_MEMORY_CRITICAL_THRESHOLD=90  # Red alert

# Disk Space Thresholds (percentage)
HEALTH_DISK_WARNING_THRESHOLD=80     # Yellow alert
HEALTH_DISK_CRITICAL_THRESHOLD=90    # Red alert

# API Timeout (milliseconds)
HEALTH_API_TIMEOUT=5000              # 5 seconds
```

### Understanding Health Check Responses

The health endpoint (`/api/health`) returns three status levels:

- **healthy** ✅ - Everything working normally
- **warning** ⚠️ - Non-critical issue (e.g., optional API not configured)
- **unhealthy/critical** ❌ - Critical failure requiring immediate attention

**HTTP Status Codes:**
- `200 OK` - All critical systems healthy
- `503 Service Unavailable` - One or more critical systems down

---

## Health Check Testing

### 1. Start Your Server

```bash
npm start
```

### 2. Test Health Endpoint

**Using curl:**

```bash
curl http://localhost:3003/api/health
```

**Using PowerShell:**

```powershell
Invoke-WebRequest -Uri http://localhost:3003/api/health | Select-Object -ExpandProperty Content
```

**Using your browser:**

Navigate to: `http://localhost:3003/api/health`

### 3. Verify Response

A healthy system will show:

```json
{
  "success": true,
  "message": "API is healthy and online",
  "checks": {
    "server": { "status": "healthy" },
    "database": { "status": "healthy" },
    "printful": { "status": "healthy" },
    "stripe": { "status": "healthy" },
    "openai": { "status": "healthy" },
    "environment": { "status": "healthy" }
  },
  "system": {
    "memory": { "status": "healthy" },
    "disk": { "status": "healthy" }
  }
}
```

---

## Troubleshooting

### Common Issues

#### ❌ "Missing required env vars: JWT_SECRET"

**Fix:** Add a strong JWT secret to your `.env` file (see [Environment Setup](#environment-setup))

#### ❌ "Printful API connection failed"

**Causes:**
- Invalid API key
- Network connectivity issues
- Printful API is down

**Fix:**
1. Verify your API key in [Printful Dashboard](https://www.printful.com/dashboard/store)
2. Test connectivity: `curl https://api.printful.com/store -H "Authorization: Bearer YOUR_KEY"`
3. Check Printful status: [status.printful.com](https://status.printful.com)

#### ❌ "Stripe API key invalid or unauthorized"

**Causes:**
- Using test key in production or vice versa
- Copied key incorrectly
- API key was revoked

**Fix:**
1. Verify you're using the correct key for your environment
2. Regenerate a new key in [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
3. Ensure `NODE_ENV` matches your key type

#### ❌ "OpenAI API key invalid"

**Causes:**
- Invalid or revoked API key
- Account has insufficient credits

**Fix:**
1. Verify key in [OpenAI Dashboard](https://platform.openai.com/api-keys)
2. Check billing and usage limits
3. Generate a new key if needed

#### ⚠️ "SQLite3 module not available"

**Fix:**
```bash
npm rebuild sqlite3
```

#### ⚠️ "System resources critical - memory usage too high"

**Causes:**
- Too many concurrent requests
- Memory leak
- Insufficient server resources

**Fix:**
1. Restart the server
2. Check for memory leaks in custom code
3. Upgrade server resources if needed
4. Adjust threshold in `.env` if the warning is too sensitive

---

## Security Best Practices

### 🔒 API Key Security

1. **Never commit `.env` to Git**
   - The `.env` file is already in `.gitignore`
   - Only commit `.env.example` as a template

2. **Use environment-specific keys**
   - Test keys for development
   - Live keys for production
   - Separate keys for staging

3. **Rotate keys regularly**
   - Change API keys every 90 days
   - Immediately rotate if compromised

4. **Use secrets management in production**
   - AWS Secrets Manager
   - HashiCorp Vault
   - Environment variables in hosting platform

### 🛡️ Server Security

1. **Use HTTPS in production**
   - Never send API keys over HTTP
   - Use SSL/TLS certificates

2. **Set strong JWT secrets**
   - Minimum 32 characters
   - Random, not guessable
   - Different for each environment

3. **Enable rate limiting**
   - Already configured in the app
   - Adjust limits in `.env` as needed

4. **Monitor health checks**
   - Set up alerts for failures
   - Use uptime monitoring services (UptimeRobot, Pingdom, etc.)

---

## Monitoring & Alerts

### Setting Up Uptime Monitoring

1. **Sign up for a monitoring service:**
   - [UptimeRobot](https://uptimerobot.com) (Free)
   - [Pingdom](https://www.pingdom.com)
   - [StatusCake](https://www.statuscake.com)

2. **Add your health endpoint:**
   - URL: `https://yourdomain.com/api/health`
   - Check interval: 5 minutes
   - Alert on status code: `!= 200`

3. **Configure alerts:**
   - Email notifications
   - SMS alerts
   - Webhook integrations (Slack, Discord, etc.)

---

## Next Steps

Once everything is configured:

1. ✅ All API keys are set up
2. ✅ Health check returns all green
3. ✅ Uptime monitoring is configured

You're ready to:

- **Deploy to production** 🚀
- **Connect your frontend** 💻
- **Start making profits** 💰

---

## Support & Resources

- **API Documentation:**
  - [Printful API Docs](https://developers.printful.com)
  - [Stripe API Docs](https://stripe.com/docs/api)
  - [OpenAI API Docs](https://platform.openai.com/docs)

- **Get Help:**
  - Check the health endpoint for diagnostic info
  - Review server logs for errors
  - Open an issue in the repository

---

**Last Updated:** 2025-11-09
**Version:** 1.0.0
