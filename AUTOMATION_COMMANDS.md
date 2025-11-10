# 🚀 Automation Commands - Quick Reference

**Easy-to-run scripts for full automation**

---

## ⚡ Quick Commands

### Run Full Automation (3 Products)
```bash
./run-automation.sh
```

### Run with Custom Number of Products
```bash
./run-automation.sh 5    # Process 5 products
./run-automation.sh 1    # Process 1 product
./run-automation.sh 10   # Process 10 products
```

### Quick Start (Top 1 Product Only)
```bash
./quick-start.sh
```

---

## 📊 Status & Monitoring

### Check Automation Status
```bash
curl http://localhost:3003/api/full-automation/status | python3 -m json.tool
```

### View System Dashboard
```bash
curl http://localhost:3003/api/dashboard | python3 -m json.tool
```

### View Analytics
```bash
curl http://localhost:3003/api/analytics | python3 -m json.tool
```

---

## 🎨 Manual Alternative (If Scripts Don't Work)

### Full Automation (3 Products)
```bash
curl -X POST http://localhost:3003/api/full-automation/run \
  -H "Content-Type: application/json" \
  -d '{"use_todays_products":true,"max_products":3}'
```

### Quick Start (1 Product)
```bash
curl -X POST http://localhost:3003/api/full-automation/quick-start
```

---

## 🔧 Server Management

### Start Server
```bash
./deploy.sh
```

### Stop Server
```bash
./stop.sh
```

### Check Server Status
```bash
./status.sh
```

---

## 📖 Documentation

- **FULL_AUTOMATION_GUIDE.md** - Complete automation guide
- **CANVA_AUTO_DESIGNS.md** - Design creation guide
- **CHRISTMAS_PROFIT_SYSTEM.md** - Christmas products guide
- **MARKETING_AUTOMATION.md** - Marketing campaigns guide

---

## 💡 Quick Tips

**Daily Workflow:**
```bash
# 1. Start server (if not running)
./deploy.sh

# 2. Run automation
./run-automation.sh

# 3. Follow instructions in output
# 4. Start earning!
```

**Troubleshooting:**
```bash
# Check if server is running
./status.sh

# View logs
tail -f data/logs/server.log

# Restart server
./deploy.sh
```

---

**Last Updated:** 2025-11-10
**Scripts Location:** /home/user/automated-profit-system/

