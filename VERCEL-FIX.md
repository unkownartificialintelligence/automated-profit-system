# 🔧 QUICK FIX FOR VERCEL.JSON MERGE CONFLICT

## Run these commands in PowerShell:

```powershell
# Navigate to project directory
cd C:\Users\jerzi\automated-profit-system\automated-profit-system

# Abort the merge and start fresh
git merge --abort

# Pull the latest clean version
git pull origin claude/fix-issue-011CV3EX4MhR5SzS5GViqTzi

# Deploy to Vercel
vercel --prod --yes
```

## If that doesn't work, manually fix vercel.json:

Open `vercel.json` in Notepad and replace ALL contents with:

```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/src/server.js"
    },
    {
      "source": "/(.*)",
      "destination": "/src/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "crons": [
    {
      "path": "/api/automation/cron",
      "schedule": "0 7 * * *"
    }
  ],
  "regions": ["iad1"],
  "installCommand": "npm install",
  "buildCommand": "cd frontend && npm install && npm run build && cd .. && npm rebuild sqlite3",
  "devCommand": "npm run dev"
}
```

Then:
```powershell
git add vercel.json
git commit -m "Fix vercel.json merge conflict"
vercel --prod --yes
```

That's it! Your system will deploy to Vercel!
