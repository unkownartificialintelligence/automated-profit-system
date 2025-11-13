# Automated Profit System - Login Credentials

**System URL:** http://localhost:3000
**Date Created:** November 13, 2025
**Authentication:** JWT-based with 7-day token expiry

---

## User Accounts

The system has been configured with **6 default user accounts** across 3 role types: **Admin**, **Team**, and **Client**.

### 🔐 ADMIN ACCOUNTS (Full System Access)

Admin users have complete access to all system features, including:
- Full dashboard and analytics
- Product catalog management (create, edit, delete)
- Team performance tracking and management
- Automation controls
- Global trending data across 10 countries
- System settings and API key management
- User management (view/edit all users)

#### Account 1: System Administrator
- **Email:** admin@jerzii.ai
- **Password:** Admin@2025
- **Name:** System Administrator
- **Company:** Jerzii AI
- **Role:** admin
- **Use Case:** System administration and configuration

#### Account 2: Business Owner
- **Email:** owner@jerzii.ai
- **Password:** Owner@2025
- **Name:** Business Owner
- **Company:** Jerzii AI
- **Role:** admin
- **Use Case:** Primary owner account for business operations

---

### 👥 TEAM ACCOUNTS (Team Features Access)

Team members have access to:
- Dashboard with team performance metrics
- Product catalog (view and create)
- Team profits and rankings
- Personal task queue
- Automation status monitoring
- Analytics and trending data
- Limited settings (cannot modify API keys)

#### Account 3: Team Member 1
- **Email:** team1@jerzii.ai
- **Password:** Team@2025
- **Name:** Team Member 1
- **Company:** Jerzii AI
- **Role:** team
- **Use Case:** Team member operations

#### Account 4: Team Member 2
- **Email:** team2@jerzii.ai
- **Password:** Team@2025
- **Name:** Team Member 2
- **Company:** Jerzii AI
- **Role:** team
- **Use Case:** Team member operations

---

### 👤 CLIENT ACCOUNTS (Limited Access)

Clients have restricted access to:
- Basic dashboard view
- Product catalog (view only)
- Personal queue
- Their own analytics
- Limited settings (profile only)

#### Account 5: Demo Client 1
- **Email:** client1@example.com
- **Password:** Client@2025
- **Name:** Demo Client 1
- **Company:** Client Company 1
- **Role:** client
- **Use Case:** Client demonstration and testing

#### Account 6: Demo Client 2
- **Email:** client2@example.com
- **Password:** Client@2025
- **Name:** Demo Client 2
- **Company:** Client Company 2
- **Role:** client
- **Use Case:** Client demonstration and testing

---

## Access Levels Summary

| Feature | Admin | Team | Client |
|---------|-------|------|--------|
| Dashboard (Full) | ✅ | ✅ | ⚠️ Limited |
| Products - View | ✅ | ✅ | ✅ |
| Products - Create | ✅ | ✅ | ❌ |
| Products - Edit/Delete | ✅ | ⚠️ Own Only | ❌ |
| Team Profits | ✅ | ✅ | ❌ |
| Personal Queue | ✅ | ✅ | ✅ |
| Global Trending | ✅ | ✅ | ⚠️ Limited |
| Automation Controls | ✅ | ⚠️ View Only | ❌ |
| Analytics | ✅ | ✅ | ⚠️ Own Data Only |
| Settings - Profile | ✅ | ✅ | ✅ |
| Settings - API Keys | ✅ | ❌ | ❌ |
| User Management | ✅ | ❌ | ❌ |

---

## Quick Start Guide

### 1. Access the System
Open your browser and navigate to: **http://localhost:3000**

### 2. Choose Your Account
The login page is pre-filled with the **Business Owner** account credentials.

To test different user roles:
1. Click "Show Test Accounts" on the login page
2. Select the account type you want to test
3. Credentials will auto-fill
4. Click "Sign In"

### 3. First Login Recommendations

#### For Business Owner:
1. Navigate to **Settings** page
2. Configure API keys:
   - Printful API Key (for product fulfillment)
   - Canva API Key (for design automation)
   - Stripe API Key (for payment processing)
   - OpenAI API Key (for AI features)
3. Update profile information
4. Review **Automation** settings
5. Check **Analytics** dashboard

#### For Team Members:
1. Review **Dashboard** for current metrics
2. Check **Personal Queue** for tasks
3. Explore **Team Profits** to see rankings
4. Review **Trending** products for opportunities

#### For Clients:
1. View **Dashboard** overview
2. Browse **Products** catalog
3. Check **Personal Queue** for updates

---

## Security Notes

⚠️ **IMPORTANT SECURITY INFORMATION:**

1. **Change Default Passwords:** These are demo credentials. In production, all users should change their passwords immediately after first login.

2. **Token Security:**
   - JWT tokens are stored in browser localStorage
   - Tokens expire after 7 days
   - Logout to clear tokens from browser

3. **Password Requirements:**
   - Current passwords are for demonstration only
   - Production passwords should be complex and unique
   - Consider implementing password complexity rules

4. **API Key Protection:**
   - API keys are stored in the database
   - Only admin users can view/modify API keys
   - Never commit API keys to version control

5. **Database Security:**
   - Passwords are hashed using bcryptjs (10 rounds)
   - Database file: `data/app.db`
   - Backup database regularly

---

## API Authentication

### Login Endpoint
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "owner@jerzii.ai",
  "password": "Owner@2025"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "email": "owner@jerzii.ai",
    "name": "Business Owner",
    "role": "admin",
    "company": "Jerzii AI"
  }
}
```

### Using the Token
Include the token in the Authorization header for all subsequent requests:

```bash
Authorization: Bearer <token>
```

### Get Current User
```bash
GET /api/auth/me
Authorization: Bearer <token>
```

### Register New User (Admin Only)
```bash
POST /api/auth/register
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "SecurePassword123",
  "name": "New User",
  "role": "team",
  "company": "Company Name"
}
```

---

## Troubleshooting

### Cannot Login
- Verify you're using the correct email and password
- Check that the server is running on port 3000
- Clear browser localStorage and try again
- Check server logs for authentication errors

### Token Expired
- Tokens expire after 7 days
- Simply log in again to get a new token
- Consider implementing refresh tokens for production

### Forgot Password
- Currently no password reset functionality
- Admin users can update passwords via user management
- For production, implement password reset flow

### Access Denied Errors
- Verify your user role has permission for the feature
- Check the Access Levels table above
- Contact admin to upgrade account permissions

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Update JWT_SECRET environment variable
- [ ] Configure production database (consider PostgreSQL)
- [ ] Implement password reset functionality
- [ ] Add password complexity requirements
- [ ] Enable HTTPS/SSL certificates
- [ ] Set up backup strategy for database
- [ ] Configure proper CORS origins
- [ ] Implement rate limiting on auth endpoints
- [ ] Set up monitoring and logging
- [ ] Review and update user roles as needed
- [ ] Test all authentication flows
- [ ] Document user onboarding process

---

## Support

For technical support or questions:
- Review the TESTING-REPORT.md for system architecture
- Check server logs: `tail -f /tmp/server.log`
- Verify database: `sqlite3 data/app.db "SELECT * FROM users;"`
- Contact system administrator

**System Status:** ✅ OPERATIONAL
**Last Updated:** November 13, 2025
