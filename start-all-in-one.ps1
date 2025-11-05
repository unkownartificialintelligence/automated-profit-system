# ==========================================
# JERZII AI - All-in-One Startup Script
# ==========================================
$ErrorActionPreference = "Stop"

# -------- CONFIG --------
$basePortSystem    = 3002
$basePortDashboard = 3003
$pm2NameSystem     = "automated-profit-system"
$pm2NameDashboard  = "automated-profit-dashboard"
$serverPathSystem  = "src/server.js"
$serverPathDash    = "src/dashboard.js"
$publicPath        = "src/public"
$indexFile         = "$publicPath/index.html"
$logFolder         = "logs"
$envFile           = ".env"

# -------- API KEYS & CONNECTORS --------
$Printful_API_KEY    = "your_printful_api_key_here"
$Stripe_API_KEY      = "your_stripe_api_key_here"
$OpenAI_API_KEY      = "your_openai_api_key_here"
$Other_Connector_Key = "your_other_connector_key_here"

# -------- HELPER FUNCTIONS --------

# Logging
function Write-Log {
    param([string]$message)
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $logMessage = "$timestamp - $message"
    Write-Host $logMessage
    if (-not (Test-Path $logFolder)) { New-Item -ItemType Directory -Path $logFolder | Out-Null }
    $logFile = "$logFolder\server-setup-$(Get-Date -Format 'yyyy-MM-dd').log"
    Add-Content -Path $logFile -Value $logMessage
}

# Get Free Port
function Get-FreePort {
    param([int]$startPort)
    $port = $startPort
    while (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue) { $port++ }
    return $port
}

# Kill process on port
function Kill-PortProcess {
    param([int]$port)
    $portPID = (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess
    if ($portPID) {
        Write-Log "⚠️  Port $port in use — killing PID $portPID..."
        Stop-Process -Id $portPID -Force
    } else {
        Write-Log "✅ Port $port is free."
    }
}

# Ensure PM2 log rotation
function Ensure-PM2Logrotate {
    $installed = pm2 module:list | Select-String "pm2-logrotate"
    if (-not $installed) {
        Write-Log "📦 Installing pm2-logrotate..."
        pm2 install pm2-logrotate
        Start-Sleep -Seconds 2
    }
    Write-Log "⚙ Configuring pm2-logrotate..."
    pm2 set pm2-logrotate:max_size 10M
    pm2 set pm2-logrotate:retain 14
    pm2 set pm2-logrotate:compress false
    pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss
    pm2 set pm2-logrotate:workerInterval 30
    pm2 set pm2-logrotate:rotateInterval "0 0 * * *"
    pm2 set pm2-logrotate:rotateModule true
}

# Start Server with PM2
function Start-Server {
    param(
        [string]$pm2Name,
        [string]$serverPath,
        [int]$port
    )

    Kill-PortProcess $port

    # Set environment variables
    $env:PORT             = $port
    $env:PRINTFUL_API_KEY = $Printful_API_KEY
    $env:STRIPE_API_KEY   = $Stripe_API_KEY
    $env:OPENAI_API_KEY   = $OpenAI_API_KEY
    $env:OTHER_CONNECTOR  = $Other_Connector_Key

    # Write/update .env file
    $envContent = @"
PORT=$port
NODE_ENV=production
PRINTFUL_API_KEY=$Printful_API_KEY
STRIPE_API_KEY=$Stripe_API_KEY
OPENAI_API_KEY=$OpenAI_API_KEY
OTHER_CONNECTOR=$Other_Connector_Key
"@
    $envContent | Set-Content $envFile

    $outLog = "$logFolder\$pm2Name-out.log"
    $errLog = "$logFolder\$pm2Name-err.log"

    pm2 delete $pm2Name | Out-Null
    pm2 start $serverPath `
        --name $pm2Name `
        --watch `
        --max-restarts 10 `
        --restart-delay 5000 `
        --output $outLog `
        --error $errLog

    Write-Log "✅ Started $pm2Name on port $port"
    Write-Log "➡ Logs: $outLog (stdout), $errLog (stderr)"
}

# -------- CREATE LANDING PAGE --------
if (-not (Test-Path $publicPath)) {
    Write-Host "📁 Creating public folder..."
    New-Item -ItemType Directory -Path $publicPath | Out-Null
}

$landingContent = @"
<!DOCTYPE html>
<html lang='en'>
<head>
<meta charset='UTF-8'>
<meta name='viewport' content='width=device-width, initial-scale=1.0'>
<title>Welcome to JERZII AI</title>
<style>
body { font-family: Arial, sans-serif; margin:0;padding:0;background:#f4f4f9;color:#333; }
header { background: linear-gradient(90deg, #4b6cb7, #182848); color:white; text-align:center; padding:3rem 1rem; }
header h1 { margin:0;font-size:3rem; } header p { font-size:1.2rem;margin-top:0.5rem; }
section { padding:3rem 1rem; max-width:1200px; margin:auto; }
.intro { text-align:center; }
.features ul { list-style:none;padding:0; display:flex; flex-wrap:wrap; justify-content:center; }
.features li { background:white;margin:1rem;padding:1.5rem;border-radius:10px; box-shadow:0 4px 6px rgba(0,0,0,0.1); width:250px; text-align:center; }
.pricing table { width:100%; border-collapse:collapse; margin-top:1rem; }
.pricing th, .pricing td { border:1px solid #ddd; padding:1rem; text-align:center; }
.pricing th { background:#4b6cb7; color:white; }
.cta { text-align:center; margin-top:3rem; }
.cta a { display:inline-block; padding:1rem 2rem; background:#4b6cb7; color:white; text-decoration:none; border-radius:8px; font-weight:bold; }
footer { text-align:center; padding:2rem 1rem; background:#222; color:white; margin-top:3rem; }
</style>
</head>
<body>
<header>
<h1>Welcome to JERZII AI</h1>
<p>Your Automated Profit & Dropshipping Partner</p>
</header>
<section class='intro'>
<h2>About JERZII AI</h2>
<p>JERZII AI is a cutting-edge automated profit system designed to help eCommerce businesses maximize revenue, streamline operations, and leverage AI-powered insights. Our platform integrates with Printful, Stripe, OpenAI, and other key connectors to give you complete control of your online business.</p>
</section>
<section class='features'>
<h2>Key Features</h2>
<ul>
<li>✅ Automated Dropshipping Management</li>
<li>✅ Real-Time Analytics Dashboard</li>
<li>✅ AI-Powered Product Recommendations</li>
<li>✅ Payment & Order Automation (Stripe & Printful)</li>
<li>✅ Dynamic Pricing & Inventory Management</li>
<li>✅ Secure, Scalable, & Reliable</li>
</ul>
</section>
<section class='pricing'>
<h2>Pricing & Tiers</h2>
<table>
<tr><th>Tier</th><th>Price</th><th>Features</th></tr>
<tr><td>Starter</td><td>$49/month</td><td>Basic automation, single store, standard support</td></tr>
<tr><td>Professional</td><td>$149/month</td><td>Multiple stores, AI recommendations, premium support</td></tr>
<tr><td>Enterprise</td><td>Custom</td><td>Full automation suite, dedicated account manager, custom integrations</td></tr>
</table>
</section>
<section class='info'>
<h2>Important Information</h2>
<ul>
<li>All transactions are secure and encrypted.</li>
<li>24/7 support available for all plans.</li>
<li>Custom API integrations available for Enterprise clients.</li>
<li>System requires Node.js and PM2 installed on Windows or Linux servers.</li>
</ul>
</section>
<div class='cta'>
<a href='mailto:contact@jerziiai.com'>Contact Us to Get Started</a>
</div>
<footer>&copy; 2025 JERZII AI. All rights reserved.</footer>
</body>
</html>
"@

$landingContent | Set-Content $indexFile
Write-Host "✅ Landing page ready!"

# -------- CREATE DASHBOARD SERVER IF NOT EXISTS --------
if (-not (Test-Path $serverPathDash)) {
    Write-Host "🖥 Creating basic dashboard server..."
    $dashboardContent = @"
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3004;
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});
app.listen(PORT, () => console.log(`Dashboard running on port \${PORT}`));
"@
    $dashboardContent | Set-Content $serverPathDash
}

# -------- MAIN STARTUP --------
try {
    Write-Log "🚀 Launching Jerzii AI Automated Profit System..."

    # Ensure pm2-logrotate is installed
    Ensure-PM2Logrotate

    # Detect free ports dynamically
    $portSystem = Get-FreePort $basePortSystem
    $portDash   = Get-FreePort ($portSystem + 1)

    # Start backend & dashboard
    Start-Server -pm2Name $pm2NameSystem -serverPath $serverPathSystem -port $portSystem
    Start-Server -pm2Name $pm2NameDashboard -serverPath $serverPathDash -port $portDash

    # Save PM2 process list & configure auto-start
    pm2 save
    if (-not (Get-Command pm2-startup -ErrorAction SilentlyContinue)) {
        npm install -g pm2-windows-startup
        Write-Log "📦 Installed pm2-windows-startup"
    }
    pm2-startup install
    pm2 save
    Write-Log "⚙ PM2 auto-start configured"

    # Open dashboard automatically
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:$portDash"

    Write-Log "✅ Dashboard opened in browser at http://localhost:$portDash"

} catch {
    Write-Log "❌ ERROR: $_"
}
