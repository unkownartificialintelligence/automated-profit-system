Write-Host "🛑 Stopping Jerzii AI..." -ForegroundColor Red
Write-Host ""

$ports = @(3000, 5173)
foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        $pids = $connections.OwningProcess | Select-Object -Unique
        foreach ($pid in $pids) {
            if ($pid -gt 0) {
                Write-Host "Stopping process on port $port..." -ForegroundColor Yellow
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

Write-Host ""
Write-Host "✅ Jerzii AI stopped" -ForegroundColor Green
Write-Host ""
