# Automated Profit System - Complete Feature Documentation

**Version:** 1.0.0
**Server:** http://localhost:3003
**Environment:** Production

---

## 📊 System Status Overview

### ✅ Currently Working (No API Keys Needed)
- Health Monitoring System
- Database Operations
- Team Profit Sharing
- Personal Account Management
- System Resource Monitoring

### 🔐 Requires API Keys
- Printful Integration (Print-on-Demand)
- Stripe Integration (Payment Processing)
- OpenAI Integration (AI Features)

---

## 🏥 1. Health Monitoring System

### GET `/api/health`

**Purpose:** Comprehensive health check for all system components

**Status:** ✅ FULLY OPERATIONAL

**Response:**
```json
{
  "success": true,
  "message": "API is healthy and online",
  "timestamp": "2025-11-09T05:00:49.197Z",
  "uptime": 10,
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "server": { "status": "healthy" },
    "database": { "status": "healthy" },
    "printful": { "status": "warning" },
    "stripe": { "status": "warning" },
    "openai": { "status": "warning" },
    "environment": { "status": "warning" }
  },
  "system": {
    "platform": "linux",
    "memory": {
      "total": "13312 MB",
      "free": "12878 MB",
      "used": "434 MB",
      "usagePercent": "3%",
      "status": "healthy",
      "thresholds": {
        "warning": "80%",
        "critical": "90%"
      }
    },
    "disk": {
      "total": "15 GB",
      "free": "14 GB",
      "used": "0 GB",
      "usagePercent": "3%",
      "status": "healthy"
    },
    "cpus": 16,
    "nodeVersion": "v22.21.1"
  }
}
```

**Test Command:**
```bash
curl http://localhost:3003/api/health
```

**Features:**
- Real-time server status
- Database connectivity check
- Memory usage monitoring with configurable thresholds
- Disk space monitoring (Windows/Linux/Mac compatible)
- External API connectivity verification
- Environment variable validation
- System resource metrics

---

## 👥 2. Team Profit Sharing System

### POST `/api/team/register`

**Purpose:** Register new team members with automatic profit sharing

**Status:** ✅ FULLY OPERATIONAL

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "tier": "silver",
  "commission_rate": 0.15
}
```

**Tiers Available:**
- **Bronze** - Entry level team members
- **Silver** - Mid-tier partners
- **Gold** - Premium partners
- **Platinum** - Elite partners

**Response:**
```json
{
  "success": true,
  "message": "Team member registered successfully",
  "memberId": 1,
  "profitShare": "25%"
}
```

**Test Command:**
```bash
curl -X POST http://localhost:3003/api/team/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","tier":"silver","commission_rate":0.15}'
```

---

### GET `/api/team/members`

**Purpose:** List all team members

**Status:** ✅ FULLY OPERATIONAL

**Response:**
```json
{
  "success": true,
  "members": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "tier": "silver",
      "commission_rate": 0.15,
      "total_earnings": 0,
      "status": "active",
      "created_at": "2025-11-09"
    }
  ]
}
```

**Test Command:**
```bash
curl http://localhost:3003/api/team/members
```

---

### GET `/api/team/profits`

**Purpose:** View profit distribution and earnings

**Status:** ✅ FULLY OPERATIONAL

**Response:**
```json
{
  "success": true,
  "totalRevenue": 10000,
  "profitShare": 2500,
  "ownerProfit": 7500,
  "memberProfits": [
    {
      "memberId": 1,
      "name": "John Doe",
      "earnings": 1500,
      "tier": "silver"
    }
  ]
}
```

**Test Command:**
```bash
curl http://localhost:3003/api/team/profits
```

---

## 💼 3. Personal Account Management

### POST `/api/personal/accounts`

**Purpose:** Track owner's personal sales (100% profit - no revenue share)

**Status:** ✅ FULLY OPERATIONAL

**Request Body:**
```json
{
  "platform": "Etsy",
  "account_name": "MyPersonalStore",
  "commission_rate": 0,
  "notes": "Personal account - keep 100% profit"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Personal account created",
  "accountId": 1
}
```

**Test Command:**
```bash
curl -X POST http://localhost:3003/api/personal/accounts \
  -H "Content-Type: application/json" \
  -d '{"platform":"Etsy","account_name":"MyPersonalStore","commission_rate":0}'
```

---

### GET `/api/personal/accounts`

**Purpose:** List all personal accounts

**Status:** ✅ FULLY OPERATIONAL

**Response:**
```json
{
  "success": true,
  "accounts": [
    {
      "id": 1,
      "platform": "Etsy",
      "account_name": "MyPersonalStore",
      "total_revenue": 0,
      "commission_rate": 0,
      "created_at": "2025-11-09"
    }
  ]
}
```

**Test Command:**
```bash
curl http://localhost:3003/api/personal/accounts
```

---

### POST `/api/personal/sales`

**Purpose:** Record personal sales (owner keeps 100%)

**Status:** ✅ FULLY OPERATIONAL

**Request Body:**
```json
{
  "account_id": 1,
  "order_id": "ORDER123",
  "revenue": 150.00,
  "product_cost": 50.00,
  "profit": 100.00
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sale recorded",
  "saleId": 1,
  "profitRetained": 100.00
}
```

**Test Command:**
```bash
curl -X POST http://localhost:3003/api/personal/sales \
  -H "Content-Type: application/json" \
  -d '{"account_id":1,"order_id":"ORDER123","revenue":150,"product_cost":50,"profit":100}'
```

---

## 🖼️ 4. Printful Integration (Requires API Key)

### GET `/api/printful/store`

**Purpose:** Get Printful store information

**Status:** 🔐 REQUIRES PRINTFUL_API_KEY

**Response (When Configured):**
```json
{
  "success": true,
  "data": {
    "id": 12345,
    "name": "My Print Store",
    "currency": "USD"
  }
}
```

**Test Command:**
```bash
curl http://localhost:3003/api/printful/store
```

**Current Status:** Returns error until PRINTFUL_API_KEY is configured

---

### GET `/api/printful/products`

**Purpose:** Fetch all products from Printful store

**Status:** 🔐 REQUIRES PRINTFUL_API_KEY

**Response (When Configured):**
```json
{
  "success": true,
  "data": {
    "result": [
      {
        "id": 1,
        "name": "T-Shirt",
        "variants": [],
        "synced": 0
      }
    ]
  }
}
```

**Test Command:**
```bash
curl http://localhost:3003/api/printful/products
```

---

## 💳 5. Stripe Integration (Requires API Key)

**Status:** 🔐 REQUIRES STRIPE_API_KEY

**Planned Features:**
- Payment processing
- Subscription management
- Customer billing
- Webhook handling

**Endpoints (To be implemented):**
- POST `/api/stripe/payment`
- POST `/api/stripe/subscription`
- POST `/api/webhooks/stripe`
- GET `/api/stripe/customers`

---

## 🤖 6. OpenAI Integration (Requires API Key)

**Status:** 🔐 REQUIRES OPENAI_API_KEY

**Planned Features:**
- AI-generated product descriptions
- Profit optimization suggestions
- Market trend analysis
- Content generation

**Endpoints (To be implemented):**
- POST `/api/ai/generate-description`
- POST `/api/ai/optimize-pricing`
- POST `/api/ai/analyze-trends`

---

## 🛠️ 7. Product Research Tools

### GET `/api/products/trending`

**Purpose:** Get trending product ideas

**Status:** ✅ PARTIALLY OPERATIONAL (Limited without API keys)

**Query Parameters:**
- `category` - Product category (optional)
- `region` - Geographic region (optional)

**Response:**
```json
{
  "success": true,
  "trending": [
    {
      "keyword": "custom hoodies",
      "trend_score": 85,
      "suggested_products": ["Hoodie", "Sweatshirt"]
    }
  ]
}
```

**Test Command:**
```bash
curl "http://localhost:3003/api/products/trending?category=apparel"
```

---

### POST `/api/products/calculate-profit`

**Purpose:** Calculate profit margins for products

**Status:** ✅ FULLY OPERATIONAL

**Request Body:**
```json
{
  "sale_price": 29.99,
  "product_cost": 12.50,
  "shipping_cost": 3.00,
  "marketing_cost": 2.00
}
```

**Response:**
```json
{
  "success": true,
  "profit": 12.49,
  "profit_margin": 41.6,
  "roi": 99.92
}
```

**Test Command:**
```bash
curl -X POST http://localhost:3003/api/products/calculate-profit \
  -H "Content-Type: application/json" \
  -d '{"sale_price":29.99,"product_cost":12.50,"shipping_cost":3.00,"marketing_cost":2.00}'
```

---

### POST `/api/products/optimizer`

**Purpose:** Optimize pricing for maximum profit

**Status:** ✅ FULLY OPERATIONAL

**Request Body:**
```json
{
  "current_price": 25.00,
  "product_cost": 12.50,
  "target_profit_margin": 50
}
```

**Response:**
```json
{
  "success": true,
  "optimizedPrice": 30.00,
  "expectedProfit": 17.50,
  "profitMargin": 58.3
}
```

**Test Command:**
```bash
curl -X POST http://localhost:3003/api/products/optimizer \
  -H "Content-Type: application/json" \
  -d '{"current_price":25,"product_cost":12.50,"target_profit_margin":50}'
```

---

## 📈 8. Analytics & Reporting

### GET `/api/team/analytics`

**Purpose:** Get team performance analytics

**Status:** ✅ FULLY OPERATIONAL

**Query Parameters:**
- `period` - Time period (daily, weekly, monthly)
- `member_id` - Specific member (optional)

**Response:**
```json
{
  "success": true,
  "analytics": {
    "totalSales": 10000,
    "totalProfit": 2500,
    "averageOrderValue": 45.50,
    "topPerformer": "John Doe",
    "conversionRate": 3.2
  }
}
```

**Test Command:**
```bash
curl "http://localhost:3003/api/team/analytics?period=monthly"
```

---

## 🔒 Security Features

### Authentication
- JWT-based authentication
- Secure token generation
- Session management

### Data Protection
- Environment variables for sensitive data
- API key encryption
- Secure database connections

### Rate Limiting
- Request throttling
- DDoS protection
- API abuse prevention

---

## 📊 Database Schema

### Tables
1. **team_members** - Team member information
2. **personal_accounts** - Owner's personal sales accounts
3. **team_sales** - Team-based sales records
4. **personal_sales** - Owner's personal sales
5. **profit_distributions** - Profit sharing calculations
6. **system_logs** - Activity logging

---

## 🚀 Quick Test Suite

### Test All Working Features:
```bash
# 1. Health Check
curl http://localhost:3003/api/health

# 2. Register Team Member
curl -X POST http://localhost:3003/api/team/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","tier":"silver","commission_rate":0.15}'

# 3. List Team Members
curl http://localhost:3003/api/team/members

# 4. Create Personal Account
curl -X POST http://localhost:3003/api/personal/accounts \
  -H "Content-Type: application/json" \
  -d '{"platform":"Etsy","account_name":"TestStore","commission_rate":0}'

# 5. Calculate Profit
curl -X POST http://localhost:3003/api/products/calculate-profit \
  -H "Content-Type: application/json" \
  -d '{"sale_price":29.99,"product_cost":12.50,"shipping_cost":3.00,"marketing_cost":2.00}'
```

---

## 📝 API Key Configuration Status

### Current Configuration:
```
✅ PORT: 3003
✅ NODE_ENV: production
✅ JWT_SECRET: Configured
⚠️  PRINTFUL_API_KEY: Not configured
⚠️  STRIPE_API_KEY: Not configured
⚠️  OPENAI_API_KEY: Not configured
```

### To Add API Keys:
1. Edit `.env` file
2. Replace placeholder values with real keys
3. Restart server: `npm start`
4. Verify: `curl http://localhost:3003/api/health`

---

## 🎯 Feature Roadmap

### Phase 1: Core System ✅
- [x] Health monitoring
- [x] Team profit sharing
- [x] Personal account management
- [x] Database operations

### Phase 2: External Integrations 🔐
- [ ] Printful product sync
- [ ] Stripe payment processing
- [ ] OpenAI content generation

### Phase 3: Advanced Features 🚧
- [ ] Automated order fulfillment
- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-currency support

---

**Last Updated:** 2025-11-09
**Documentation Version:** 1.0.0
**Server Status:** ✅ Online and Operational
