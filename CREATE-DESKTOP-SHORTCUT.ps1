$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$Home\Desktop\Start Jerzii AI.lnk")
$Shortcut.TargetPath = "powershell.exe"
$Shortcut.Arguments = "-ExecutionPolicy Bypass -File `"C:\Users\jerzi\automated-profit-system\automated-profit-system\START-JERZII-AI.ps1`""
$Shortcut.WorkingDirectory = "C:\Users\jerzi\automated-profit-system\automated-profit-system"
$Shortcut.IconLocation = "C:\Windows\System32\SHELL32.dll,13"
$Shortcut.Description = "Start Jerzii AI System"
$Shortcut.Save()

Write-Host "✅ Desktop shortcut created!" -ForegroundColor Green
