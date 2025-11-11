# 🔐 Personal Account Setup for Vercel

## Quick Setup Guide (5 minutes)

Your personal account authentication is now configured to work in Vercel's serverless environment using environment variables instead of a database.

---

## Step 1: Generate Your Password Hash

Run this command locally to generate your password hash:

```bash
node -e "
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter your desired password: ', (password) => {
  const hash = bcrypt.hashSync(password, 10);
  console.log('\n✅ Password hash generated!\n');
  console.log('Copy this hash:\n');
  console.log(hash);
  console.log('\n⚠️  Keep this hash secure - you will add it to Vercel environment variables.');
  rl.close();
});
"
```

Or use this simpler version:

```bash
node -e "console.log(require('bcryptjs').hashSync('YOUR_PASSWORD_HERE', 10))"
```

**Replace `YOUR_PASSWORD_HERE` with your actual password.**

---

## Step 2: Add Environment Variables to Vercel

Go to your Vercel dashboard:
https://vercel.com/jerzii-ais-projects/automated-profit-system/settings/environment-variables

Add these **3 environment variables**:

### Variable 1: ADMIN_EMAIL
```
Name: ADMIN_EMAIL
Value: your@email.com
```
(Replace with your actual email)

### Variable 2: ADMIN_PASSWORD_HASH
```
Name: ADMIN_PASSWORD_HASH
Value: [paste the hash from Step 1]
```
Example: `$2a$10$MJPy6jHpve05LMhkAYzKRe8fVHc02vO2SuCsQ8FKobaoKmjqJApeS`

### Variable 3: ADMIN_NAME (Optional)
```
Name: ADMIN_NAME
Value: Your Name
```

**Important:** Make sure to check:
- ✅ Production
- ✅ Preview
- ✅ Development

Then click **Save**.

---

## Step 3: Redeploy

After adding the environment variables:

1. Go to: https://vercel.com/jerzii-ais-projects/automated-profit-system
2. Click on the latest deployment
3. Click the **3 dots** (⋮) menu
4. Select **"Redeploy"**
5. Wait ~60 seconds for deployment

---

## Step 4: Login to Your Account

### Login Endpoint:
```
POST https://automated-profit-system-git-main-jerzii-ais-projects.vercel.app/api/auth/login
```

### Request Body:
```json
{
  "email": "your@email.com",
  "password": "your_password"
}
```

### Example with curl:
```bash
curl -X POST https://automated-profit-system-git-main-jerzii-ais-projects.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"your_password"}'
```

### Expected Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "your@email.com",
    "name": "Your Name",
    "role": "admin"
  }
}
```

---

## Step 5: Use Your Token

Copy the `token` from the login response and use it in your API requests:

```bash
curl https://automated-profit-system-git-main-jerzii-ais-projects.vercel.app/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Available Auth Endpoints:

### 1. Login
```
POST /api/auth/login
Body: { "email": "...", "password": "..." }
Returns: { token, user }
```

### 2. Verify Token
```
POST /api/auth/verify
Header: Authorization: Bearer <token>
Returns: { valid: true, user }
```

### 3. Get Current User
```
GET /api/auth/me
Header: Authorization: Bearer <token>
Returns: { user }
```

---

## Testing Your Setup

### Quick Test:
1. Open your browser
2. Go to: https://automated-profit-system-git-main-jerzii-ais-projects.vercel.app/api/auth/login
3. You should see: `{"success":false,"message":"Email is required"}`
   (This is correct - it means the endpoint is working)

### Full Test (with Postman or Thunder Client):
1. Create POST request to `/api/auth/login`
2. Add JSON body with your email and password
3. Send request
4. Copy the token from response
5. Use token in Authorization header for other endpoints

---

## Security Notes:

✅ **What's secure:**
- Passwords are hashed with bcrypt (10 rounds)
- JWT tokens expire after 24 hours
- Rate limiting: 5 login attempts per 15 minutes
- Email validation on all requests
- HTTPS encryption in Vercel

⚠️ **Important:**
- Keep your password hash secret
- Never commit `.env` files to git
- Use strong passwords (12+ characters)
- Rotate your JWT_SECRET regularly

---

## Troubleshooting:

### "Authentication not configured"
- Make sure you added all 3 environment variables in Vercel
- Redeploy after adding variables

### "Invalid credentials"
- Double-check your email matches ADMIN_EMAIL exactly
- Verify password hash was generated correctly
- Make sure you're using the original password, not the hash

### "JWT_SECRET not configured"
- JWT_SECRET should already be set (you added it earlier)
- Check Vercel environment variables dashboard

---

## Next Steps:

Once logged in, you can:
1. Access your personal profit tracking
2. Manage team members
3. View analytics
4. Configure automation settings
5. Access all API endpoints

Your token is valid for 24 hours, after which you'll need to login again.

---

**Need help?** Check the deployment at:
https://vercel.com/jerzii-ais-projects/automated-profit-system
