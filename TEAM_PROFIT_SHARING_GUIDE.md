# 🎯 Team Profit Sharing System - Complete Guide

**Automated tier-based revenue sharing with milestone tracking**

---

## 📋 Overview

This system automatically manages team members, tracks their profits, deducts 25% revenue share for growth funding, and releases payouts when they reach profit milestones.

### Key Features:
- ✅ **4 Tier Levels** - Bronze, Silver, Gold, Platinum
- ✅ **Automatic 25% Share** - Deducted from every profit
- ✅ **Milestone Tracking** - $5K, $7.5K, $10K thresholds
- ✅ **Auto Payouts** - Released when milestone reached
- ✅ **Full API** - Manage everything programmatically

---

## 🚀 Quick Start

### 1. Initialize the Database

```bash
# Run the database setup
node src/database/init-team-profits.js
```

This creates:
- **tiers** table - Service tier definitions
- **team_members** table - Team member accounts
- **profits** table - Individual sales/profits
- **revenue_shares** table - 25% automatic deductions
- **payouts** table - Milestone-based payouts

### 2. Start the Server

```bash
npm start
```

Server will run on `http://localhost:3003`

### 3. Test the System

```bash
# Check health
curl http://localhost:3003/api/health

# Get overview stats
curl http://localhost:3003/api/team/stats/overview
```

---

## 📊 Default Tiers

| Tier | Revenue Share | Milestone | Features |
|------|--------------|-----------|----------|
| **Bronze** | 25% | $5,000 | Basic Dashboard, Manual Processing, Email Support |
| **Silver** | 25% | $5,000 | Advanced Dashboard, Semi-Automated, Priority Support |
| **Gold** | 25% | $7,500 | Full Automation, 24/7 Support, Analytics |
| **Platinum** | 25% | $10,000 | Enterprise Dashboard, White Label, API Access |

---

## 🔌 API Endpoints

### Team Member Management

#### Get All Team Members
```http
GET /api/team
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "members": [
    {
      "id": 1,
      "email": "member@example.com",
      "name": "John Doe",
      "tier_name": "Bronze",
      "total_profit": 3250.00,
      "milestone_reached": 0,
      "pending_shares": 812.50,
      "released_shares": 0
    }
  ]
}
```

#### Add New Team Member
```http
POST /api/team
Content-Type: application/json

{
  "email": "newmember@example.com",
  "name": "Jane Smith",
  "tier_id": 1,
  "printful_api_key": "optional_key",
  "stripe_account_id": "optional_stripe_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Team member added successfully",
  "member": { ... }
}
```

#### Get Specific Team Member
```http
GET /api/team/:id
```

#### Update Team Member
```http
PUT /api/team/:id
Content-Type: application/json

{
  "tier_id": 2,
  "status": "active"
}
```

---

### Profit Tracking

#### Add Profit Record (Auto-calculates 25% share)
```http
POST /api/team/:id/profits
Content-Type: application/json

{
  "order_id": "PRINTFUL_123456",
  "sale_amount": 100.00,
  "cost_amount": 60.00,
  "description": "T-shirt sale"
}
```

**What Happens Automatically:**
1. Profit calculated: $100 - $60 = $40
2. 25% share deducted: $40 × 0.25 = $10
3. Revenue share stored as "held" (until milestone)
4. Member's total_profit updated
5. **If milestone reached**: shares released & payout created

**Response:**
```json
{
  "success": true,
  "message": "Profit recorded successfully",
  "profit": {
    "id": 123,
    "team_member_id": 1,
    "sale_amount": 100.00,
    "cost_amount": 60.00,
    "profit_amount": 40.00,
    "revenue_share_amount": 10.00
  },
  "milestone_reached": false,
  "total_profit": 3290.00
}
```

#### Get Member's Profit History
```http
GET /api/team/:id/profits
```

---

### Revenue Shares & Payouts

#### Get Pending Revenue Shares (Held until milestone)
```http
GET /api/team/revenue-shares/pending
```

**Response:**
```json
{
  "success": true,
  "totalPending": 2450.00,
  "count": 98,
  "shares": [
    {
      "id": 1,
      "team_member_id": 1,
      "share_amount": 10.00,
      "status": "held",
      "member_name": "John Doe",
      "total_profit": 3250.00,
      "profit_milestone": 5000
    }
  ]
}
```

#### Get Released Revenue Shares (Milestone reached)
```http
GET /api/team/revenue-shares/released
```

#### Get All Payouts
```http
GET /api/team/payouts
```

**Response:**
```json
{
  "success": true,
  "totalPending": 1250.00,
  "pendingCount": 2,
  "totalCount": 5,
  "payouts": [
    {
      "id": 1,
      "team_member_id": 3,
      "total_amount": 1250.00,
      "milestone_amount": 5000,
      "status": "pending",
      "member_name": "Mike Johnson",
      "tier_name": "Bronze"
    }
  ]
}
```

#### Process Payout (Mark as Paid)
```http
POST /api/team/payouts/:id/process
Content-Type: application/json

{
  "payment_method": "stripe",
  "payment_reference": "txn_1234567890"
}
```

---

### Dashboard Statistics

#### Get Overview Stats
```http
GET /api/team/stats/overview
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_members": 10,
    "members_reached_milestone": 3,
    "total_system_profit": 45000.00,
    "pending_shares": 5500.00,
    "released_shares": 3750.00,
    "pending_payouts": 3750.00,
    "completed_payouts": 2500.00
  },
  "tierBreakdown": [
    {
      "tier_name": "Bronze",
      "member_count": 6,
      "tier_total_profit": 18000.00
    },
    {
      "tier_name": "Silver",
      "member_count": 3,
      "tier_total_profit": 15000.00
    }
  ]
}
```

---

## 💰 How Revenue Sharing Works

### Example Scenario:

**Team Member:** Sarah (Bronze tier, $5K milestone)

1. **Sale Made:**
   - Product sold for $100
   - Cost: $60
   - **Profit: $40**

2. **Automatic 25% Share:**
   - Revenue share: $40 × 0.25 = **$10 held**
   - Sarah keeps: $30
   - Your share: $10 (held until milestone)

3. **Progress Tracking:**
   - Sarah's total profit: $3,250 → $3,290
   - Still needs: $5,000 - $3,290 = **$1,710 more**

4. **Milestone Reached ($5,000):**
   - All held shares **automatically released**
   - Payout created: **$1,250** (25% of $5,000)
   - Status changes: "held" → "released"
   - Notification sent

5. **Process Payout:**
   - You transfer $1,250 to your account
   - Mark payout as "completed" via API
   - Shares marked as "paid_out"

6. **After Milestone:**
   - Sarah continues earning (no more automatic deductions)
   - She keeps 100% of profits after $5K threshold
   - Build their account for success!

---

## 🎯 Workflow Examples

### Adding a New Team Member

```bash
# Add Bronze tier member
curl -X POST http://localhost:3003/api/team \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sarah@example.com",
    "name": "Sarah Johnson",
    "tier_id": 1,
    "printful_api_key": "pk_abc123"
  }'
```

### Recording a Sale

```bash
# Record profit for member ID 1
curl -X POST http://localhost:3003/api/team/1/profits \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "PRINTFUL_789",
    "sale_amount": 150.00,
    "cost_amount": 90.00,
    "description": "Hoodie sale"
  }'

# Automatically calculates:
# - Profit: $60
# - 25% share: $15 (held)
# - Checks milestone
```

### Checking Pending Payouts

```bash
# Get all pending payouts
curl http://localhost:3003/api/team/payouts

# Shows members who hit milestone
# and amounts ready for transfer
```

### Processing a Payout

```bash
# Mark payout ID 1 as completed
curl -X POST http://localhost:3003/api/team/payouts/1/process \
  -H "Content-Type: application/json" \
  -d '{
    "payment_method": "stripe",
    "payment_reference": "transfer_abc123"
  }'
```

---

## 🔧 Database Triggers (Automatic)

The system uses SQLite triggers for automation:

### 1. **calculate_revenue_share**
- Fires when profit is added
- Automatically creates revenue share (25%)
- Updates team member's total_profit

### 2. **check_milestone_reached**
- Fires when total_profit changes
- Checks if milestone reached
- Releases all held shares
- Creates payout record

**You don't need to manage these - they're automatic!**

---

## 📈 Admin Dashboard Integration

### Example Dashboard Display:

```javascript
// Fetch overview stats
const stats = await fetch('/api/team/stats/overview').then(r => r.json());

console.log(`
Team Performance:
- Total Members: ${stats.stats.total_members}
- Milestones Reached: ${stats.stats.members_reached_milestone}
- System Profit: $${stats.stats.total_system_profit}
- Pending Shares: $${stats.stats.pending_shares}
- Ready to Collect: $${stats.stats.released_shares}
`);

// Fetch pending payouts
const payouts = await fetch('/api/team/payouts').then(r => r.json());

payouts.payouts.filter(p => p.status === 'pending').forEach(payout => {
  console.log(`
  💰 ${payout.member_name} reached $${payout.milestone_amount} milestone
     Ready to transfer: $${payout.total_amount}
  `);
});
```

---

## 🎨 Customization

### Change Revenue Share Percentage

Edit tier in database:
```sql
UPDATE tiers
SET revenue_share_percentage = 20  -- Change to 20%
WHERE name = 'Bronze';
```

### Change Milestone Amount

```sql
UPDATE tiers
SET profit_milestone = 10000  -- Change to $10K
WHERE name = 'Bronze';
```

### Add Custom Tier

```sql
INSERT INTO tiers (name, description, revenue_share_percentage, profit_milestone, features)
VALUES (
  'Diamond',
  'Ultra-premium tier',
  25,
  15000,
  '["Everything", "Personal Account Manager", "Priority API Access"]'
);
```

---

## 🔒 Security Notes

1. **Authentication Required** - Add authentication middleware for production
2. **Validate Input** - All endpoints validate required fields
3. **SQL Injection Protection** - Parameterized queries used throughout
4. **API Keys** - Store Printful/Stripe keys securely in database

---

## 📊 Sample Data for Testing

```bash
# Initialize database
node src/database/init-team-profits.js

# Add test members
curl -X POST http://localhost:3003/api/team \
  -H "Content-Type: application/json" \
  -d '{"email":"test1@example.com","name":"Test User 1","tier_id":1}'

# Add test profit
curl -X POST http://localhost:3003/api/team/1/profits \
  -H "Content-Type: application/json" \
  -d '{"sale_amount":100,"cost_amount":60,"description":"Test sale"}'

# Check results
curl http://localhost:3003/api/team/1
```

---

## 🚀 Ready for Your Server Deployment

When you deploy to your new server:

1. ✅ Database schema is ready
2. ✅ All API endpoints built
3. ✅ Automatic calculations configured
4. ✅ Milestone tracking active
5. ✅ Payout system operational

**Your tier-based profit sharing system is complete and ready to scale!** 🎉

---

**Questions or customization needs?** All code is documented and modular for easy modification.
