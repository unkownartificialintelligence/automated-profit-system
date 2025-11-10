# Security Best Practices

## Overview
This document outlines security measures implemented and recommended practices for the Automated Profit System.

## ✅ Security Measures Implemented

### 1. Authentication & Authorization
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **No Hardcoded Secrets** - All secrets from environment variables
- ✅ **JWT Secret Validation** - Enforces 32+ character secure secrets
- ✅ **Token Expiration** - 24-hour expiry on JWT tokens
- ✅ **Password Hashing** - bcryptjs for secure password storage
- ✅ **Role-Based Access** - Admin role validation on protected routes

### 2. Rate Limiting
- ✅ **API Rate Limiting** - 100 requests per 15 minutes per IP
- ✅ **Auth Rate Limiting** - 5 login attempts per 15 minutes per IP
- ✅ **Rate Limit Headers** - Standard headers for client visibility

### 3. Input Validation & Sanitization
- ✅ **Input Sanitization** - All string inputs sanitized
- ✅ **SQL Injection Prevention** - Parameterized queries + pattern detection
- ✅ **Email Validation** - Regex validation for email fields
- ✅ **XSS Prevention** - < and > characters removed from inputs
- ✅ **Type Validation** - Numeric, string length, enum validation

### 4. CORS Protection
- ✅ **Origin Whitelist** - Only allowed domains can access API
- ✅ **Development Mode** - Flexible for development, strict for production
- ✅ **Credentials Support** - Secure cookie handling
- ✅ **Configurable Origins** - Environment-based configuration

### 5. HTTP Security Headers (Helmet.js)
- ✅ **X-Content-Type-Options** - Prevents MIME type sniffing
- ✅ **X-Frame-Options** - Prevents clickjacking
- ✅ **X-XSS-Protection** - Browser XSS protection
- ✅ **Strict-Transport-Security** - Forces HTTPS
- ✅ **Content-Security-Policy** - Restricts resource loading

### 6. Request Size Limiting
- ✅ **JSON Body Limit** - 10MB max to prevent DOS attacks
- ✅ **Payload Validation** - Request body validation

### 7. Logging & Monitoring
- ✅ **Structured Logging** - Winston with log levels
- ✅ **Security Event Logging** - Track security-related events
- ✅ **Error Logging** - Comprehensive error tracking
- ✅ **Request Logging** - HTTP request/response logging
- ✅ **Log Rotation** - Automatic log file rotation

### 8. Environment Configuration
- ✅ **Environment Validation** - Required vars checked at startup
- ✅ **Secret Management** - No secrets in code
- ✅ **.gitignore** - .env files excluded from version control
- ✅ **.env.example** - Template for required variables

## 🔐 Critical Security Checklist

### Before Production Deployment

#### Must Do
- [ ] Generate a secure JWT_SECRET (32+ characters)
- [ ] Configure ALLOWED_ORIGINS with your actual domains
- [ ] Set all API keys in environment variables
- [ ] Enable HTTPS/TLS (automatic on Render)
- [ ] Review and restrict CORS origins
- [ ] Set up error monitoring (Sentry)
- [ ] Configure database backups
- [ ] Review all admin user accounts
- [ ] Remove any test/debug endpoints
- [ ] Set NODE_ENV=production

#### Strongly Recommended
- [ ] Enable Two-Factor Authentication (2FA) for admin
- [ ] Set up automated security scanning
- [ ] Configure web application firewall (WAF)
- [ ] Implement IP whitelisting for admin routes
- [ ] Set up intrusion detection
- [ ] Regular dependency audits (`npm audit`)
- [ ] Password complexity requirements
- [ ] Session timeout configuration
- [ ] Implement CSRF protection for forms
- [ ] Set up security headers monitoring

## 🛡️ Security Configuration

### JWT Secret Generation

Generate a secure secret:
```bash
# Generate 32-byte random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env
JWT_SECRET=your_generated_secret_here
```

### CORS Configuration

**Development (.env):**
```bash
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Production (.env):**
```bash
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Rate Limiting Customization

Edit in **src/server.js**:

```javascript
// Adjust limits based on your traffic
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Requests per window
  message: { success: false, message: 'Too many requests' }
});

// Stricter for authentication
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 attempts per window
  skipSuccessfulRequests: true
});
```

## 🔍 Security Monitoring

### Log Security Events

```javascript
import logger from './utils/logger.js';

// Log failed login attempts
logger.logSecurityEvent('failed_login', {
  email: req.body.email,
  ip: req.ip,
  userAgent: req.get('user-agent')
});

// Log suspicious activity
logger.logSecurityEvent('sql_injection_attempt', {
  input: req.body.maliciousInput,
  ip: req.ip
});
```

### Monitor These Metrics

1. **Failed Login Attempts**
   - Alert after 10 failures from same IP
   - Review login patterns daily

2. **Rate Limit Violations**
   - Track IPs hitting rate limits
   - Block persistent offenders

3. **Validation Errors**
   - Monitor SQL injection patterns
   - Track XSS attempt patterns

4. **API Errors**
   - 500 errors indicate problems
   - 401/403 errors may indicate attacks

## 🚨 Common Vulnerabilities & Mitigations

### 1. SQL Injection
**Risk:** Attackers inject SQL code to access/modify database

**Mitigation:**
- ✅ Use parameterized queries (ALWAYS)
- ✅ Input validation middleware active
- ✅ Pattern detection for SQL keywords

**Example:**
```javascript
// ❌ NEVER DO THIS
db.query(`SELECT * FROM users WHERE email = '${email}'`);

// ✅ ALWAYS DO THIS
db.query('SELECT * FROM users WHERE email = ?', [email]);
```

### 2. Cross-Site Scripting (XSS)
**Risk:** Attackers inject malicious scripts

**Mitigation:**
- ✅ Input sanitization removes < and >
- ✅ Helmet.js XSS protection
- ✅ Content-Security-Policy headers

### 3. Cross-Site Request Forgery (CSRF)
**Risk:** Unauthorized actions via authenticated sessions

**Mitigation:**
- ⚠️ **TODO:** Implement CSRF tokens for state-changing operations
- Use SameSite cookies
- Verify Origin/Referer headers

**Implementation needed:**
```bash
npm install csurf --save
```

### 4. Brute Force Attacks
**Risk:** Attackers try many passwords

**Mitigation:**
- ✅ Rate limiting on login (5 attempts per 15 min)
- ✅ Account lockout after failures
- ⚠️ **TODO:** Implement CAPTCHA after 3 failures

### 5. Man-in-the-Middle (MITM)
**Risk:** Traffic intercepted/modified

**Mitigation:**
- ✅ HTTPS enforced (Helmet HSTS)
- ✅ Secure cookie flags
- ✅ Certificate validation

### 6. Denial of Service (DOS)
**Risk:** Service overwhelmed with requests

**Mitigation:**
- ✅ Rate limiting (100 req/15 min)
- ✅ Request size limits (10MB)
- ⚠️ **Recommended:** Use Cloudflare for DDoS protection

### 7. Sensitive Data Exposure
**Risk:** Secrets/passwords leaked

**Mitigation:**
- ✅ No secrets in code
- ✅ .env in .gitignore
- ✅ Passwords hashed (bcrypt)
- ✅ Error messages sanitized in production

### 8. Broken Authentication
**Risk:** Session hijacking, weak tokens

**Mitigation:**
- ✅ Secure JWT with strong secret
- ✅ Token expiration (24h)
- ✅ HTTPS only
- ⚠️ **TODO:** Implement refresh tokens

## 🔧 Additional Security Hardening

### 1. HTTPS Enforcement

Add to **src/server.js**:
```javascript
// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
  });
}
```

### 2. Security Headers Enhancement

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
}));
```

### 3. Implement CAPTCHA

For brute force protection:
```bash
npm install express-recaptcha --save
```

### 4. Database Security

- Use environment-specific database credentials
- Enable SSL for database connections
- Regular backups (automated on Render)
- Principle of least privilege for DB users

### 5. API Key Security

```javascript
// Rotate API keys regularly
// Never log API keys
logger.info('Printful API called', {
  // ❌ apiKey: PRINTFUL_API_KEY
  // ✅ apiKeyPresent: !!PRINTFUL_API_KEY
});
```

## 🎯 Security Testing

### Run Security Audit
```bash
# Check for vulnerable dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# View detailed report
npm audit --json
```

### Penetration Testing Tools
1. **OWASP ZAP** - Free web app security scanner
2. **Burp Suite** - Professional security testing
3. **Nikto** - Web server scanner

### Regular Security Tasks
- [ ] Weekly dependency audits
- [ ] Monthly security log reviews
- [ ] Quarterly penetration tests
- [ ] Annual security audit

## 📚 Security Resources

- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **Node.js Security Best Practices**: https://nodejs.org/en/docs/guides/security/
- **Express Security**: https://expressjs.com/en/advanced/best-practice-security.html
- **JWT Best Practices**: https://tools.ietf.org/html/rfc8725

## 🚀 Quick Security Wins

1. **Enable Sentry** - Track errors in real-time
2. **Use Cloudflare** - Free DDoS protection + WAF
3. **Enable 2FA** - For admin accounts
4. **Regular Updates** - Keep dependencies updated
5. **Backup Strategy** - Automated daily backups

## 📞 Incident Response Plan

If security breach detected:

1. **Immediate Actions**
   - Disable affected accounts
   - Rotate all secrets (JWT, API keys)
   - Review access logs
   - Block malicious IPs

2. **Investigation**
   - Check Sentry for error patterns
   - Review security logs
   - Identify attack vector
   - Assess damage

3. **Recovery**
   - Patch vulnerability
   - Restore from backup if needed
   - Deploy security fixes
   - Monitor for repeat attacks

4. **Post-Incident**
   - Document incident
   - Update security measures
   - Notify affected users (if required)
   - Improve monitoring

## Contact

For security issues: [Create a private security advisory on GitHub]

**Never disclose security vulnerabilities publicly**
