# Deployment Scripts

This repository includes three PowerShell deployment scripts for easy deployment to Vercel.

## Available Scripts

### Deploy-MENU.ps1 (Recommended)
Interactive menu to choose your deployment type. This is the easiest way to get started.

```powershell
.\Deploy-MENU.ps1
```

### Deploy-OWNER.ps1
Deploy to your personal Vercel account with full owner control.

**Features:**
- Deploys to your personal account (no team restrictions)
- Full owner control
- Automatic git configuration
- Commits and pushes changes before deployment

**Usage:**
```powershell
.\Deploy-OWNER.ps1
```

**Configuration:**
- Owner Name: MJ Jerzii
- Owner Email: mj@jerzii.com
- Project Name: automated-profit-system-personal

### Deploy-TEAM.ps1
Deploy to Jerzii AI team account.

**Features:**
- Deploys to team account (jerzii-ai)
- Requires team permissions
- Automatic git configuration for team
- Verifies team access before deployment

**Usage:**
```powershell
.\Deploy-TEAM.ps1
```

**Configuration:**
- Team Name: jerzii-ai
- Team Scope: jerzii-ai
- Project Name: automated-profit-system

## Quick Start

1. **Make sure you're logged into Vercel:**
   ```powershell
   vercel login
   ```

2. **Run the deployment menu:**
   ```powershell
   .\Deploy-MENU.ps1
   ```

3. **Or deploy directly:**
   ```powershell
   # For personal deployment (recommended for solo work)
   .\Deploy-OWNER.ps1

   # For team deployment
   .\Deploy-TEAM.ps1
   ```

## Prerequisites

- PowerShell 5.1 or higher
- Git installed and configured
- Vercel CLI installed (`npm install -g vercel`)
- Vercel account (personal or team access)

## Troubleshooting

### "Script cannot be loaded because running scripts is disabled"

Run this command in PowerShell as Administrator:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "Not logged into Vercel"

Log in to Vercel:
```powershell
vercel login
```

### Team deployment fails

Use the personal deployment instead:
```powershell
.\Deploy-OWNER.ps1
```

## Notes

- **Personal deployment (Deploy-OWNER.ps1)** is recommended for individual work to avoid team permission issues
- Both scripts will automatically commit your changes before deployment
- Scripts will prompt you before committing changes
- Old `.vercel` configuration is removed before each deployment to ensure clean state
