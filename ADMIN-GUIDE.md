# Admin Monitoring Dashboard Guide

Complete guide for accessing and using the Jerzii AI Admin Monitoring Dashboard.

## Quick Access

### Local Development
```
http://localhost:5173/admin
```

### Production
```
https://your-domain.vercel.app/admin
```

## Default Admin Credentials

**Email:** `admin@jerzii.ai`
**Password:** `admin123`

**IMPORTANT:** Change these credentials immediately after first login!

## Setup Instructions

### 1. Initialize Admin Database

Run the setup script to create admin tables and default user:

```bash
node setup-admin.js
```

This creates:
- `admin_users` table
- `clients` table
- `client_analytics` table
- `system_logs` table
- `team_activity` table
- Default admin user

### 2. Set JWT Secret

Update your `.env` file with a secure JWT secret:

```env
JWT_SECRET=your_very_secure_random_secret_key_here
```

Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Start the Server

```bash
# Backend
npm start

# Frontend (development)
cd frontend
npm run dev
```

### 4. Access Admin Panel

Navigate to `/admin` route:
- Local: `http://localhost:5173/admin`
- Login with default credentials
- Change password immediately

## Features Overview

### 1. Overview Tab

**System Statistics:**
- Total clients count
- Monthly Recurring Revenue (MRR)
- Active subscriptions
- System health status

**Insights:**
- Package distribution chart
- Recent system logs
- Quick stats overview

### 2. Clients Tab

**View All Clients:**
- Company name and contact information
- Email and phone
- Package tier (Basic, Professional, Enterprise)
- Subscription status (active, inactive, suspended)
- Monthly revenue
- Printful API keys (view/hide)

**Client Management:**
- Add new clients
- Edit client information
- Update subscription status
- Manage API keys
- Delete clients
- View client analytics

**Client Fields:**
- Company Name
- Contact Name
- Email (unique)
- Phone
- Package Tier
- Subscription Status
- Monthly Revenue
- Setup Date
- Printful API Key
- Custom Domain
- Notes

### 3. Team Members Tab

**View Team Members:**
- All admin users
- Email addresses
- Roles (admin, moderator, viewer)
- Join date

**Member Management:**
- Add new team members
- Edit member permissions
- Update roles
- Delete members (except yourself)

**Security:**
- Cannot delete your own account
- Password hashing with bcrypt
- Role-based access control

### 4. Activity Log Tab

**Monitor All Actions:**
- Client created/updated/deleted
- Admin user created/updated/deleted
- System changes
- Timestamp for each activity
- Admin who performed action

**Log Types:**
- Client operations
- User management
- System events
- Configuration changes

### 5. System Tab

**System Health:**
- Server status (online/offline)
- Database connection
- Server uptime
- Last updated timestamp

**Memory Metrics:**
- Heap used
- Heap total
- Resident Set Size (RSS)
- Memory usage graphs

## API Endpoints

All admin endpoints require authentication via JWT token.

### Authentication

**Login:**
```
POST /api/admin/login
Body: { email, password }
Response: { token, admin: { id, email, name } }
```

### Clients

```
GET    /api/admin/clients          # Get all clients
GET    /api/admin/clients/:id      # Get single client with analytics
POST   /api/admin/clients          # Create new client
PUT    /api/admin/clients/:id      # Update client
DELETE /api/admin/clients/:id      # Delete client
```

### Dashboard & Analytics

```
GET /api/admin/dashboard              # Dashboard overview stats
GET /api/admin/analytics/aggregate    # Aggregate analytics (30 days)
```

### Team Members

```
GET    /api/admin/users          # Get all admin users
POST   /api/admin/users          # Create new admin
PUT    /api/admin/users/:id      # Update admin
DELETE /api/admin/users/:id      # Delete admin
```

### System

```
GET /api/admin/health      # System health check
GET /api/admin/activity    # Team activity log
POST /api/admin/logs       # Create system log
```

## Using the API

### Authentication Header

All requests (except login) require the JWT token:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN'
}
```

### Example: Create Client

```javascript
const response = await fetch('http://localhost:3000/api/admin/clients', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    company_name: 'Example Corp',
    contact_name: 'John Doe',
    email: 'john@example.com',
    phone: '555-1234',
    package_tier: 'professional',
    printful_api_key: 'key_example'
  })
});
```

## Database Schema

### admin_users
- id (PRIMARY KEY)
- email (UNIQUE)
- password (hashed)
- name
- role
- created_at

### clients
- id (PRIMARY KEY)
- company_name
- contact_name
- email (UNIQUE)
- phone
- package_tier
- subscription_status
- monthly_revenue
- setup_date
- printful_api_key
- custom_domain
- notes

### client_analytics
- id (PRIMARY KEY)
- client_id (FOREIGN KEY)
- date
- revenue
- orders
- profit
- products_sold

### system_logs
- id (PRIMARY KEY)
- log_type
- severity
- message
- client_id (FOREIGN KEY)
- created_at

### team_activity
- id (PRIMARY KEY)
- admin_id (FOREIGN KEY)
- action
- client_id (FOREIGN KEY)
- details
- created_at

## Security Best Practices

### 1. Change Default Credentials
```bash
# Immediately after setup
# Login with default credentials
# Go to Team Members > Edit your account
# Change password to a strong one
```

### 2. Secure JWT Secret
```env
# Use a strong, random secret
JWT_SECRET=at_least_32_characters_long_random_string

# Generate secure secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Environment Variables
```env
# Never commit these to git!
JWT_SECRET=your_secret_here
PRINTFUL_API_KEY=your_key_here

# Add to .gitignore
.env
```

### 4. HTTPS in Production
- Always use HTTPS for admin panel
- Vercel provides SSL automatically
- Never access admin over HTTP in production

### 5. Password Requirements
- Minimum 8 characters
- Include uppercase, lowercase, numbers
- Use password manager
- Change regularly

## Common Tasks

### Add a New Client

1. Go to **Clients** tab
2. Click **Add Client** button
3. Fill in required fields:
   - Company Name
   - Contact Name
   - Email
   - Package Tier
4. Optional fields:
   - Phone
   - Printful API Key
   - Notes
5. Click **Save**

### View Client Analytics

1. Go to **Clients** tab
2. Click on client row
3. View 30-day analytics:
   - Revenue trends
   - Orders
   - Profit margins
   - Products sold

### Add Team Member

1. Go to **Team Members** tab
2. Click **Add Member**
3. Enter:
   - Name
   - Email
   - Password
   - Role
4. Click **Create**

### Monitor System Health

1. Go to **System** tab
2. View real-time metrics:
   - Server status
   - Database connection
   - Memory usage
   - Uptime

### Review Activity Logs

1. Go to **Activity Log** tab
2. See recent actions:
   - Who did what
   - When it happened
   - Affected clients
   - Change details

## Troubleshooting

### Cannot Login

**Problem:** Invalid credentials error

**Solutions:**
1. Verify default credentials: `admin@jerzii.ai` / `admin123`
2. Check if database was initialized: `node setup-admin.js`
3. Verify JWT_SECRET is set in `.env`
4. Check server logs for errors

### 401 Unauthorized

**Problem:** Token authentication fails

**Solutions:**
1. Re-login to get fresh token
2. Check JWT_SECRET matches between requests
3. Clear localStorage and login again
4. Verify token expiration (24h default)

### Cannot See Clients

**Problem:** Empty clients list

**Solutions:**
1. Add test client via API or UI
2. Check database: `sqlite3 database.db "SELECT * FROM clients;"`
3. Verify admin authentication
4. Check browser console for errors

### Database Errors

**Problem:** Database not found

**Solutions:**
```bash
# Initialize database
node setup-admin.js

# Verify database file exists
ls -la database.db

# Check permissions
chmod 644 database.db
```

## Deployment

### Deploy to Vercel

1. **Set Environment Variables:**
```bash
vercel env add JWT_SECRET
# Paste your secure JWT secret
```

2. **Deploy:**
```bash
.\Deploy-OWNER.ps1
```

3. **Access Admin:**
```
https://your-domain.vercel.app/admin
```

### Environment Variables on Vercel

Add these in Vercel Dashboard > Settings > Environment Variables:

```env
JWT_SECRET=your_production_secret_here
PRINTFUL_API_KEY=your_api_key
NODE_ENV=production
```

## Support

### Need Help?

1. Check this guide first
2. Review error messages in:
   - Browser console (F12)
   - Server logs
   - Activity log in admin panel
3. Verify all setup steps completed
4. Check database initialization

### Technical Support

- **Email:** support@jerzii.ai
- **Documentation:** `/ADMIN-GUIDE.md`
- **API Docs:** `/DEPLOYMENT.md`

---

**Security Notice:** The admin panel provides full access to system data and client information. Protect your credentials and always use HTTPS in production.

**Version:** 1.0
**Last Updated:** 2025-11-08
