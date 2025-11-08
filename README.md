# 🚀 Automated Profit System

A complete Print-on-Demand automation system with Printful integration, AI-driven optimization, and streamlined deployment to Vercel.

## 📋 Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Deployment](#deployment)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

## ✨ Features

- **Printful Integration**: Automatic product sync and management
- **Express API Backend**: RESTful API with security middleware (Helmet, CORS)
- **React Frontend**: Modern UI built with React and Vite
- **Easy Deployment**: PowerShell scripts for one-click Vercel deployment
- **Environment Management**: Support for personal and team accounts
- **Health Monitoring**: Built-in health check endpoints
- **Security First**: Rate limiting, helmet protection, and secure configurations

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/unkownartificialintelligence/automated-profit-system.git
cd automated-profit-system
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Configure Environment
```bash
# Copy .env example (create your own)
# Add your API keys
```

Required environment variables:
```env
PRINTFUL_API_KEY=your_printful_api_key_here
PORT=3000
NODE_ENV=development
```

### 4. Run Locally
```bash
# Start backend (from root)
npm start

# Start frontend (in another terminal)
cd frontend
npm run dev
```

### 5. Deploy to Vercel (Windows)
```powershell
# Easy interactive menu
.\Deploy-MENU.ps1

# Or deploy directly to personal account
.\Deploy-OWNER.ps1
```

## 📦 Prerequisites

### Required Software

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/download/win)
- **Vercel CLI** - Install via: `npm install -g vercel`
- **PowerShell** (Windows) - For deployment scripts

### Required Accounts

- **Printful Account** - [Sign up](https://www.printful.com/)
- **Vercel Account** - [Sign up](https://vercel.com/)
- **GitHub Account** - [Sign up](https://github.com/)

## 💻 Installation

### Backend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Create a `.env` file in the root directory:
   ```env
   PRINTFUL_API_KEY=your_api_key
   PORT=3000
   NODE_ENV=development
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

   Server will run at `http://localhost:3000`

### Frontend Setup

1. **Navigate to frontend:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

   Frontend will run at `http://localhost:5173`

4. **Build for production:**
   ```bash
   npm run build
   ```

## 🚢 Deployment

We provide three PowerShell deployment scripts for easy Vercel deployment:

### Deploy-MENU.ps1 (Recommended)
Interactive menu to choose deployment type:
```powershell
.\Deploy-MENU.ps1
```

**Options:**
- Personal Deployment (Owner) - Your personal account
- Team Deployment - Jerzii AI team account
- Exit

### Deploy-OWNER.ps1
Direct deployment to your personal Vercel account:
```powershell
.\Deploy-OWNER.ps1
```

**Features:**
- Full owner control
- No team restrictions
- Automatic git configuration
- Change detection and commit prompts
- Project name: `automated-profit-system-personal`

### Deploy-TEAM.ps1
Deployment to Jerzii AI team account:
```powershell
.\Deploy-TEAM.ps1
```

**Features:**
- Team account deployment
- Requires team permissions
- Team verification before deployment
- Team scope: `jerzii-ai`

### First-Time Deployment Setup

1. **Login to Vercel:**
   ```powershell
   vercel login
   ```

2. **Run deployment menu:**
   ```powershell
   .\Deploy-MENU.ps1
   ```

3. **Choose deployment type:**
   - Select `1` for personal account (recommended for solo work)
   - Select `2` for team account (requires permissions)

4. **Follow prompts:**
   - Scripts will detect changes
   - Prompt to commit before deployment
   - Auto-configure git settings
   - Deploy to Vercel

### Deployment Configuration

The `vercel.json` file configures:
- API routes (`/api/*`) → Backend server
- Static routes (`/*`) → Frontend build
- Environment variables
- Build settings

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment documentation.

## ⚙️ Configuration

### Git Configuration

Scripts auto-configure Git with:
- **Owner Name**: MJ Jerzii
- **Owner Email**: mj@jerzii.com
- **Team Name**: Jerzii AI Team
- **Team Email**: team@jerzii.com

### Vercel Configuration

- **Personal Project**: `automated-profit-system-personal`
- **Team Scope**: `jerzii-ai`
- **Team Project**: `automated-profit-system`

### Environment Variables

Set these in Vercel dashboard or `.env` file:

```env
# Required
PRINTFUL_API_KEY=your_printful_api_key

# Optional
PORT=3000
NODE_ENV=production
```

## 🔌 API Endpoints

### Health Check
```
GET /api/health
```
Returns API health status

**Response:**
```json
{
  "success": true,
  "message": "API is healthy and online"
}
```

### Get Printful Store Info
```
GET /api/printful/store
```
Fetches connected Printful store information

**Response:**
```json
{
  "success": true,
  "data": { /* Printful store data */ }
}
```

### Get Products
```
GET /api/printful/products
```
Retrieves all products from Printful store

**Response:**
```json
{
  "success": true,
  "data": { /* Products array */ }
}
```

## 📁 Project Structure

```
automated-profit-system/
├── frontend/                  # React frontend
│   ├── dist/                 # Build output
│   ├── src/                  # Source files
│   │   ├── App.jsx          # Main app component
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Styles
│   ├── index.html           # HTML template
│   ├── package.json         # Frontend dependencies
│   └── vite.config.js       # Vite configuration
├── src/                      # Backend source
│   └── server.js            # Express server
├── Deploy-MENU.ps1          # Deployment menu
├── Deploy-OWNER.ps1         # Personal deployment
├── Deploy-TEAM.ps1          # Team deployment
├── DEPLOYMENT.md            # Deployment docs
├── package.json             # Backend dependencies
├── vercel.json              # Vercel configuration
├── .env                     # Environment variables
└── README.md                # This file
```

## 🐛 Troubleshooting

### Common Issues

#### "Script cannot be loaded because running scripts is disabled"
**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### "Not logged into Vercel"
**Solution:**
```powershell
vercel login
```

#### "must have access to team Jerzii AI"
**Solution:** Use personal deployment instead:
```powershell
.\Deploy-OWNER.ps1
```

#### "Git not found"
**Solution:** Install Git from [git-scm.com](https://git-scm.com/download/win)

#### "Vercel CLI not found"
**Solution:**
```powershell
npm install -g vercel
```

#### API not connecting to Printful
**Checklist:**
- Verify `PRINTFUL_API_KEY` in `.env` or Vercel environment variables
- Check API key is valid in Printful dashboard
- Ensure key has proper permissions

#### Frontend not loading
**Checklist:**
- Run `cd frontend && npm run build` to create production build
- Verify `frontend/dist` directory exists
- Check `vercel.json` routes configuration

### Development Mode Issues

#### Backend not starting
```bash
# Check port availability
netstat -ano | findstr :3000

# Try different port
PORT=3001 npm start
```

#### Frontend not starting
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Getting Help

1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment-specific help
2. Review error messages in terminal
3. Check Vercel deployment logs
4. Verify all prerequisites are installed

## 📚 Additional Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Detailed deployment guide
- **[QUICK-REFERENCE.txt](./QUICK-REFERENCE.txt)** - Command cheat sheet
- **[TEAM_ONBOARDING.md](./TEAM_ONBOARDING.md)** - Team member setup

## 🎯 Development Workflow

### Daily Development
1. Make code changes
2. Test locally (`npm start` + `cd frontend && npm run dev`)
3. Commit changes
4. Deploy with `.\Deploy-MENU.ps1`

### Feature Development
1. Create feature branch: `git checkout -b feature/your-feature`
2. Develop and test
3. Commit regularly
4. Deploy to test with `.\Deploy-OWNER.ps1`
5. Merge to main when ready

### Production Deployment
1. Ensure all tests pass
2. Build frontend: `cd frontend && npm run build`
3. Run deployment script: `.\Deploy-OWNER.ps1`
4. Verify deployment on Vercel

## 🔒 Security

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API rate limiting (ready to implement)
- **Environment Variables**: Secrets never committed to repo
- **Input Validation**: API request validation

## 📄 License

ISC

## 👤 Author

**MJ Jerzii**
- Email: mj@jerzii.com
- Team: Jerzii AI

## 🚀 Future Features

- AI-driven profit optimization
- Stripe/PayPal payment integration
- Shopify + Etsy auto-sync
- Analytics dashboard
- Multi-tenant support
- Automated trend analysis

---

**Version:** 2.0
**Last Updated:** 2025-11-08
