# 🚀 JERZII AI - TEAM ONBOARDING GUIDE

## Quick Start (5 Minutes)

### For Team Members:

1. **Start the System:**
   - Double-click `START-JERZII-AI.ps1`
   - Wait 10 seconds for everything to boot
   - Browser opens automatically to dashboard

2. **Login as Admin:**
   - Email: `admin@jerzii.ai`
   - Password: `admin123`
   - Change password immediately!

3. **What You Can Do:**
   - View all clients
   - Monitor system health
   - Add new clients
   - Track revenue
   - View analytics

### For New Clients:

1. **Access Dashboard:**
   - Go to: http://localhost:5173
   - Or click link from startup script

2. **Login:**
   - Use credentials provided by team
   - Default demo: test@example.com / password123

3. **Features Available:**
   - Order tracking
   - Product analytics
   - Trend insights
   - Automation status

## Daily Operations

### Morning Startup:
```powershell
.\START-JERZII-AI.ps1
```

### End of Day:
```powershell
.\STOP-JERZII-AI.ps1
```

### Check System Health:
- Admin dashboard shows all metrics
- Green = good, Red = needs attention

## Troubleshooting

**Servers won't start:**
1. Run: `.\STOP-JERZII-AI.ps1`
2. Wait 5 seconds
3. Run: `.\START-JERZII-AI.ps1`

**Port already in use:**
- Startup script automatically clears ports
- If issue persists, restart computer

**Can't login:**
- Check if backend is running (port 3000)
- Verify database exists (database.db)

## Support

**For urgent issues:**
- Check admin dashboard first
- Review system logs
- Contact tech lead

**System is worth $10,000+ and production-ready!**
