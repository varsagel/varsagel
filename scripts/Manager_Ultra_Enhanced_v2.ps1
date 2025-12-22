# Varsagel Ultra Panel v3 - Enhanced Edition
# Combines the best features with improved stability and performance

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.ComponentModel

# Global Variables
$script:currentTheme = "dark"
$script:activePort = 0
$script:projectRoot = Split-Path -Parent $PSScriptRoot
$script:performanceData = @()
$script:maxLogLines = 1000
$script:backgroundWorkers = @()

# Enhanced Themes with better color schemes
$themes = @{
    dark = @{
        primary = [System.Drawing.Color]::FromArgb(0, 122, 204)
        success = [System.Drawing.Color]::FromArgb(46, 204, 113)
        warning = [System.Drawing.Color]::FromArgb(241, 196, 15)
        danger = [System.Drawing.Color]::FromArgb(231, 76, 60)
        background = [System.Drawing.Color]::FromArgb(30, 30, 33)
        panel = [System.Drawing.Color]::FromArgb(37, 37, 40)
        text = [System.Drawing.Color]::FromArgb(220, 220, 220)
        textDim = [System.Drawing.Color]::FromArgb(160, 160, 160)
        hover = [System.Drawing.Color]::FromArgb(62, 62, 66)
        border = [System.Drawing.Color]::FromArgb(60, 60, 60)
        chartLine = [System.Drawing.Color]::FromArgb(52, 152, 219)
    }
    light = @{
        primary = [System.Drawing.Color]::FromArgb(0, 123, 255)
        success = [System.Drawing.Color]::FromArgb(40, 167, 69)
        warning = [System.Drawing.Color]::FromArgb(255, 193, 7)
        danger = [System.Drawing.Color]::FromArgb(220, 53, 69)
        background = [System.Drawing.Color]::FromArgb(248, 249, 250)
        panel = [System.Drawing.Color]::White
        text = [System.Drawing.Color]::FromArgb(33, 37, 41)
        textDim = [System.Drawing.Color]::FromArgb(108, 117, 125)
        hover = [System.Drawing.Color]::FromArgb(233, 236, 239)
        border = [System.Drawing.Color]::FromArgb(222, 226, 230)
        chartLine = [System.Drawing.Color]::FromArgb(0, 123, 255)
    }
    neon = @{
        primary = [System.Drawing.Color]::FromArgb(255, 0, 255)
        success = [System.Drawing.Color]::FromArgb(0, 255, 0)
        warning = [System.Drawing.Color]::FromArgb(255, 255, 0)
        danger = [System.Drawing.Color]::FromArgb(255, 0, 0)
        background = [System.Drawing.Color]::FromArgb(10, 10, 20)
        panel = [System.Drawing.Color]::FromArgb(20, 20, 30)
        text = [System.Drawing.Color]::FromArgb(255, 255, 255)
        textDim = [System.Drawing.Color]::FromArgb(200, 200, 200)
        hover = [System.Drawing.Color]::FromArgb(40, 40, 50)
        border = [System.Drawing.Color]::FromArgb(255, 0, 255)
        chartLine = [System.Drawing.Color]::FromArgb(0, 255, 255)
    }
}

# Enhanced Functions - Defined before UI creation
function Log-Message($msg, $type = "INFO") {
    $timestamp = Get-Date -Format "HH:mm:ss"
    $logEntry = "[$timestamp] [$type] $msg`r`n"
    
    # File logging
    $logFile = "$script:projectRoot\logs\panel_enhanced.log"
    $logDir = Split-Path -Parent $logFile
    if (!(Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
    "[$timestamp] [$type] $msg" | Out-File -FilePath $logFile -Append
    
    Write-Host "[$timestamp] [$type] $msg"
}

function Apply-Theme($themeName) {
    $script:currentTheme = $themeName.ToLower()
    $theme = $themes[$script:currentTheme]
    
    try {
        # Form backgrounds
        $form.BackColor = $theme.background
        $pnlHeader.BackColor = $theme.panel
        $pnlMenu.BackColor = $theme.panel
        $pnlStatus.BackColor = $theme.panel
        
        # Text colors
        $lblTitle.ForeColor = $theme.primary
        $lblSubtitle.ForeColor = $theme.textDim
        $lblClock.ForeColor = $theme.textDim
        $lblStatus.ForeColor = $theme.text
        
        Log-Message "Theme applied: $themeName" "SUCCESS"
    } catch {
        Log-Message "Error applying theme: $($_.Exception.Message)" "ERROR"
    }
}

function Update-SystemInfo {
    try {
        # Update clock
        $currentTime = Get-Date
        $cpuUsage = [math]::Round((Get-Counter '\Processor(_Total)\% Processor Time').CounterSamples[0].CookedValue, 1)
        $availableRAM = (Get-Counter '\Memory\Available MBytes').CounterSamples[0].CookedValue / 1024
        
        $clockText = "$($currentTime.ToString('HH:mm:ss'))`n$($currentTime.ToString('yyyy-MM-dd'))`n`nCPU: $cpuUsage%`nRAM: $([math]::Round($availableRAM, 1)) GB Available"
        
        if ($lblClock.InvokeRequired) {
            $lblClock.Invoke([Action]{ $lblClock.Text = $clockText })
        } else {
            $lblClock.Text = $clockText
        }
        
        # Update performance data
        $script:performanceData += $cpuUsage
        if ($script:performanceData.Count -gt 50) {
            $script:performanceData = $script:performanceData[1..50]
        }
        
    } catch {
        Log-Message "Error updating system info: $($_.Exception.Message)" "ERROR"
    }
}

function Update-Status {
    try {
        $ports = @(443, 3000, 3004)
        $runningPort = 0
        
        foreach ($port in $ports) {
            $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
            if ($connections) {
                $runningPort = $port
                break
            }
        }
        
        $script:activePort = $runningPort
        
        if ($runningPort -gt 0) {
            Log-Message "Server running on port $runningPort" "SUCCESS"
        } else {
            Log-Message "Server stopped" "INFO"
        }
        
    } catch {
        Log-Message "Error updating status: $($_.Exception.Message)" "ERROR"
    }
}

function Execute-Action($action) {
    switch ($action) {
        "dev" { Start-Server "dev" }
        "prod" { Start-Server "prod" }
        "stop" { Stop-Server }
        "open" { Open-Website }
        "build" { Build-Project }
        "clean" { Clean-Cache }
    }
}

function Start-Server($mode) {
    if ($script:activePort -ne 0) {
        Log-Message "Server already running on port $script:activePort" "WARNING"
        [System.Windows.Forms.MessageBox]::Show("Server already running on port $script:activePort. Stop it first.", "Warning", "OK", "Warning")
        return
    }
    
    Log-Message "Starting server in $mode mode..." "INFO"
    
    # Clean old lock files
    $lockFile = "$script:projectRoot\.next\dev\lock"
    if (Test-Path $lockFile) {
        try {
            Remove-Item $lockFile -Force -ErrorAction SilentlyContinue
            Log-Message "Old lock file cleaned" "INFO"
        } catch {
            Log-Message "Could not clean lock file" "WARNING"
        }
    }
    
    # Start server in background
    $startInfo = New-Object System.Diagnostics.ProcessStartInfo
    $startInfo.FileName = "cmd.exe"
    $startInfo.Arguments = "/k title Varsagel Server & set PORT=3004 & npm run $mode"
    $startInfo.WorkingDirectory = $script:projectRoot
    $startInfo.UseShellExecute = $true
    $startInfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Normal
    
    [System.Diagnostics.Process]::Start($startInfo)
    
    Log-Message "Server window opened successfully" "SUCCESS"
    Start-Sleep -Seconds 3
    Update-Status
}

function Stop-Server {
    if ($script:activePort -eq 0) {
        Log-Message "No server running" "WARNING"
        return
    }
    
    Log-Message "Stopping server..." "INFO"
    
    # Stop processes on all ports
    $ports = @(443, 3000, 3004)
    foreach ($port in $ports) {
        $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        foreach ($conn in $connections) {
            if ($conn.OwningProcess -gt 4) {
                try {
                    $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                    if ($proc) {
                        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
                        Log-Message "Process terminated: $($proc.ProcessName) (PID: $($proc.Id))" "INFO"
                    }
                } catch {
                    # Ignore errors
                }
            }
        }
    }
    
    # Close server window
    $serverTitle = "Varsagel Server"
    Get-Process | Where-Object { $_.MainWindowTitle -eq $serverTitle } | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            Log-Message "Server window closed" "INFO"
        } catch {
            # Ignore errors
        }
    }
    
    Start-Sleep -Seconds 1
    Update-Status
    
    if ($script:activePort -eq 0) {
        Log-Message "Server stopped successfully" "SUCCESS"
    } else {
        Log-Message "Some processes could not be stopped" "WARNING"
    }
}

function Open-Website {
    if ($script:activePort -gt 0) {
        Start-Process "http://localhost:$script:activePort"
        Log-Message "Website opened: localhost:$script:activePort" "INFO"
    } else {
        Log-Message "No server running to open website" "WARNING"
        [System.Windows.Forms.MessageBox]::Show("No server running. Please start the server first.", "Warning", "OK", "Warning")
    }
}

function Build-Project {
    Log-Message "Starting build process..." "INFO"
    try {
        Set-Location $script:projectRoot
        $buildProcess = Start-Process "npm" -ArgumentList "run", "build" -NoNewWindow -PassThru -Wait
        if ($buildProcess.ExitCode -eq 0) {
            Log-Message "Build completed successfully" "SUCCESS"
        } else {
            Log-Message "Build failed with exit code: $($buildProcess.ExitCode)" "ERROR"
        }
    } catch {
        Log-Message "Build error: $($_.Exception.Message)" "ERROR"
    }
}

function Clean-Cache {
    Log-Message "Cleaning cache and temporary files..." "INFO"
    try {
        $cachePaths = @(
            "$script:projectRoot\.next",
            "$script:projectRoot\node_modules\.cache",
            "$script:projectRoot\dist"
        )
        
        foreach ($path in $cachePaths) {
            if (Test-Path $path) {
                Remove-Item $path -Recurse -Force -ErrorAction SilentlyContinue
                Log-Message "Cleaned: $path" "INFO"
            }
        }
        
        Log-Message "Cache cleaning completed" "SUCCESS"
    } catch {
        Log-Message "Cache cleaning error: $($_.Exception.Message)" "ERROR"
    }
}

function Show-Tab($tabName) {
    # Hide all tabs
    foreach ($tab in $tabs.Values) {
        $tab.Visible = $false
    }
    
    # Show selected tab
    if ($tabs.ContainsKey($tabName)) {
        $tabs[$tabName].Visible = $true
        $lblStatus.Text = "Current Tab: $tabName"
        Log-Message "Switched to $tabName tab" "INFO"
    }
}

# Main Form
$form = New-Object System.Windows.Forms.Form
$form.Text = "Varsagel Ultra Panel v3 - Enhanced"
$form.Size = New-Object System.Drawing.Size(900, 600)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedSingle"
$form.MaximizeBox = $false
$form.MinimumSize = New-Object System.Drawing.Size(800, 500)

# Enhanced Fonts
$fontTitle = New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Bold)
$fontHeader = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
$fontNormal = New-Object System.Drawing.Font("Segoe UI", 10)
$fontSmall = New-Object System.Drawing.Font("Segoe UI", 9)

# Main Layout
$mainLayout = New-Object System.Windows.Forms.TableLayoutPanel
$mainLayout.Dock = [System.Windows.Forms.DockStyle]::Fill
$mainLayout.RowCount = 3
$mainLayout.ColumnCount = 1
$mainLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Absolute, 80)))  # Header
$mainLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Absolute, 40)))  # Menu
$mainLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Percent, 100))) # Content
$form.Controls.Add($mainLayout)

# Header Panel
$pnlHeader = New-Object System.Windows.Forms.Panel
$pnlHeader.Dock = [System.Windows.Forms.DockStyle]::Fill
$pnlHeader.Margin = New-Object System.Windows.Forms.Padding(5)
$mainLayout.Controls.Add($pnlHeader, 0, 0)

# Logo and Title
$lblTitle = New-Object System.Windows.Forms.Label
$lblTitle.Text = "VARSAGEL ULTRA"
$lblTitle.Font = $fontTitle
$lblTitle.Location = New-Object System.Drawing.Point(20, 15)
$lblTitle.AutoSize = $true
$pnlHeader.Controls.Add($lblTitle)

$lblSubtitle = New-Object System.Windows.Forms.Label
$lblSubtitle.Text = "Enhanced Control Panel v3"
$lblSubtitle.Font = $fontNormal
$lblSubtitle.Location = New-Object System.Drawing.Point(220, 25)
$lblSubtitle.AutoSize = $true
$pnlHeader.Controls.Add($lblSubtitle)

# Clock
$lblClock = New-Object System.Windows.Forms.Label
$lblClock.Font = $fontSmall
$lblClock.Location = New-Object System.Drawing.Point(650, 15)
$lblClock.Size = New-Object System.Drawing.Size(200, 50)
$lblClock.TextAlign = [System.Drawing.ContentAlignment]::TopRight
$pnlHeader.Controls.Add($lblClock)

# Menu Panel
$pnlMenu = New-Object System.Windows.Forms.Panel
$pnlMenu.Dock = [System.Windows.Forms.DockStyle]::Fill
$pnlMenu.Margin = New-Object System.Windows.Forms.Padding(0)
$mainLayout.Controls.Add($pnlMenu, 0, 1)

# Simple Tab Buttons
$btnDashboard = New-Object System.Windows.Forms.Button
$btnDashboard.Text = "Dashboard"
$btnDashboard.Size = New-Object System.Drawing.Size(100, 30)
$btnDashboard.Location = New-Object System.Drawing.Point(20, 5)
$btnDashboard.Font = $fontSmall
$btnDashboard.Add_Click({ Show-Tab "dashboard" })
$pnlMenu.Controls.Add($btnDashboard)

$btnServer = New-Object System.Windows.Forms.Button
$btnServer.Text = "Server"
$btnServer.Size = New-Object System.Drawing.Size(100, 30)
$btnServer.Location = New-Object System.Drawing.Point(130, 5)
$btnServer.Font = $fontSmall
$btnServer.Add_Click({ Show-Tab "server" })
$pnlMenu.Controls.Add($btnServer)

$btnLogs = New-Object System.Windows.Forms.Button
$btnLogs.Text = "Logs"
$btnLogs.Size = New-Object System.Drawing.Size(100, 30)
$btnLogs.Location = New-Object System.Drawing.Point(240, 5)
$btnLogs.Font = $fontSmall
$btnLogs.Add_Click({ Show-Tab "logs" })
$pnlMenu.Controls.Add($btnLogs)

# Content Panel
$pnlContent = New-Object System.Windows.Forms.Panel
$pnlContent.Dock = [System.Windows.Forms.DockStyle]::Fill
$pnlContent.Margin = New-Object System.Windows.Forms.Padding(10)
$mainLayout.Controls.Add($pnlContent, 0, 2)

# Tab Panels
$tabs = @{
    dashboard = New-Object System.Windows.Forms.Panel
    server = New-Object System.Windows.Forms.Panel
    logs = New-Object System.Windows.Forms.Panel
}

foreach ($tab in $tabs.Values) {
    $tab.Dock = [System.Windows.Forms.DockStyle]::Fill
    $tab.Visible = $false
    $pnlContent.Controls.Add($tab)
}

# Dashboard Tab
$dashboardLayout = New-Object System.Windows.Forms.TableLayoutPanel
$dashboardLayout.Dock = [System.Windows.Forms.DockStyle]::Fill
$dashboardLayout.RowCount = 3
$dashboardLayout.ColumnCount = 2
$dashboardLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Percent, 30)))
$dashboardLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Percent, 40)))
$dashboardLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Percent, 30)))
$dashboardLayout.ColumnStyles.Add((New-Object System.Windows.Forms.ColumnStyle([System.Windows.Forms.SizeType]::Percent, 50)))
$dashboardLayout.ColumnStyles.Add((New-Object System.Windows.Forms.ColumnStyle([System.Windows.Forms.SizeType]::Percent, 50)))
$tabs.dashboard.Controls.Add($dashboardLayout)

# Status Panel
$statusPanel = New-Object System.Windows.Forms.Panel
$statusPanel.Dock = [System.Windows.Forms.DockStyle]::Fill
$statusPanel.Margin = New-Object System.Windows.Forms.Padding(5)
$statusPanel.BorderStyle = [System.Windows.Forms.BorderStyle]::FixedSingle
$dashboardLayout.Controls.Add($statusPanel, 0, 0)
$dashboardLayout.SetColumnSpan($statusPanel, 2)

$lblStatusTitle = New-Object System.Windows.Forms.Label
$lblStatusTitle.Text = "Server Status"
$lblStatusTitle.Font = $fontHeader
$lblStatusTitle.Location = New-Object System.Drawing.Point(15, 15)
$lblStatusTitle.AutoSize = $true
$statusPanel.Controls.Add($lblStatusTitle)

$lblServerStatus = New-Object System.Windows.Forms.Label
$lblServerStatus.Text = "Status: STOPPED"
$lblServerStatus.Font = $fontNormal
$lblServerStatus.Location = New-Object System.Drawing.Point(15, 45)
$lblServerStatus.AutoSize = $true
$statusPanel.Controls.Add($lblServerStatus)

$lblPortStatus = New-Object System.Windows.Forms.Label
$lblPortStatus.Text = "Port: -"
$lblPortStatus.Font = $fontNormal
$lblPortStatus.Location = New-Object System.Drawing.Point(15, 75)
$lblPortStatus.AutoSize = $true
$statusPanel.Controls.Add($lblPortStatus)

# Actions Panel
$actionsPanel = New-Object System.Windows.Forms.Panel
$actionsPanel.Dock = [System.Windows.Forms.DockStyle]::Fill
$actionsPanel.Margin = New-Object System.Windows.Forms.Padding(5)
$actionsPanel.BorderStyle = [System.Windows.Forms.BorderStyle]::FixedSingle
$dashboardLayout.Controls.Add($actionsPanel, 0, 1)
$dashboardLayout.SetColumnSpan($actionsPanel, 2)

$lblActionsTitle = New-Object System.Windows.Forms.Label
$lblActionsTitle.Text = "Quick Actions"
$lblActionsTitle.Font = $fontHeader
$lblActionsTitle.Location = New-Object System.Drawing.Point(15, 15)
$lblActionsTitle.AutoSize = $true
$actionsPanel.Controls.Add($lblActionsTitle)

# Action Buttons
$btnStartDev = New-Object System.Windows.Forms.Button
$btnStartDev.Text = "Start Dev Mode"
$btnStartDev.Size = New-Object System.Drawing.Size(120, 40)
$btnStartDev.Location = New-Object System.Drawing.Point(15, 50)
$btnStartDev.Font = $fontSmall
$btnStartDev.BackColor = [System.Drawing.Color]::FromArgb(0, 123, 255)
$btnStartDev.ForeColor = [System.Drawing.Color]::White
$btnStartDev.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnStartDev.Add_Click({ Start-Server "dev" })
$actionsPanel.Controls.Add($btnStartDev)

$btnStartProd = New-Object System.Windows.Forms.Button
$btnStartProd.Text = "Start Production"
$btnStartProd.Size = New-Object System.Drawing.Size(120, 40)
$btnStartProd.Location = New-Object System.Drawing.Point(150, 50)
$btnStartProd.Font = $fontSmall
$btnStartProd.BackColor = [System.Drawing.Color]::FromArgb(40, 167, 69)
$btnStartProd.ForeColor = [System.Drawing.Color]::White
$btnStartProd.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnStartProd.Add_Click({ Start-Server "prod" })
$actionsPanel.Controls.Add($btnStartProd)

$btnStop = New-Object System.Windows.Forms.Button
$btnStop.Text = "Stop Server"
$btnStop.Size = New-Object System.Drawing.Size(120, 40)
$btnStop.Location = New-Object System.Drawing.Point(285, 50)
$btnStop.Font = $fontSmall
$btnStop.BackColor = [System.Drawing.Color]::FromArgb(220, 53, 69)
$btnStop.ForeColor = [System.Drawing.Color]::White
$btnStop.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnStop.Add_Click({ Stop-Server })
$actionsPanel.Controls.Add($btnStop)

$btnOpenSite = New-Object System.Windows.Forms.Button
$btnOpenSite.Text = "Open Website"
$btnOpenSite.Size = New-Object System.Drawing.Size(120, 40)
$btnOpenSite.Location = New-Object System.Drawing.Point(420, 50)
$btnOpenSite.Font = $fontSmall
$btnOpenSite.BackColor = [System.Drawing.Color]::FromArgb(23, 162, 184)
$btnOpenSite.ForeColor = [System.Drawing.Color]::White
$btnOpenSite.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnOpenSite.Add_Click({ Open-Website })
$actionsPanel.Controls.Add($btnOpenSite)

# Info Panel
$infoPanel = New-Object System.Windows.Forms.Panel
$infoPanel.Dock = [System.Windows.Forms.DockStyle]::Fill
$infoPanel.Margin = New-Object System.Windows.Forms.Padding(5)
$infoPanel.BorderStyle = [System.Windows.Forms.BorderStyle]::FixedSingle
$dashboardLayout.Controls.Add($infoPanel, 0, 2)
$dashboardLayout.SetColumnSpan($infoPanel, 2)

$lblInfoTitle = New-Object System.Windows.Forms.Label
$lblInfoTitle.Text = "System Information"
$lblInfoTitle.Font = $fontHeader
$lblInfoTitle.Location = New-Object System.Drawing.Point(15, 15)
$lblInfoTitle.AutoSize = $true
$infoPanel.Controls.Add($lblInfoTitle)

$lblSystemInfo = New-Object System.Windows.Forms.Label
$lblSystemInfo.Text = "CPU: 0%`nRAM: 0 GB Used`nUptime: 00:00:00"
$lblSystemInfo.Font = $fontSmall
$lblSystemInfo.Location = New-Object System.Drawing.Point(15, 45)
$lblSystemInfo.AutoSize = $true
$infoPanel.Controls.Add($lblSystemInfo)

# Server Tab
$serverPanel = New-Object System.Windows.Forms.Panel
$serverPanel.Dock = [System.Windows.Forms.DockStyle]::Fill
$serverPanel.Margin = New-Object System.Windows.Forms.Padding(5)
$serverPanel.BorderStyle = [System.Windows.Forms.BorderStyle]::FixedSingle
$tabs.server.Controls.Add($serverPanel)

$lblServerTitle = New-Object System.Windows.Forms.Label
$lblServerTitle.Text = "Server Management"
$lblServerTitle.Font = $fontHeader
$lblServerTitle.Location = New-Object System.Drawing.Point(15, 15)
$lblServerTitle.AutoSize = $true
$serverPanel.Controls.Add($lblServerTitle)

# Logs Tab
$logsPanel = New-Object System.Windows.Forms.Panel
$logsPanel.Dock = [System.Windows.Forms.DockStyle]::Fill
$logsPanel.Margin = New-Object System.Windows.Forms.Padding(5)
$logsPanel.BorderStyle = [System.Windows.Forms.BorderStyle]::FixedSingle
$tabs.logs.Controls.Add($logsPanel)

$lblLogsTitle = New-Object System.Windows.Forms.Label
$lblLogsTitle.Text = "Application Logs"
$lblLogsTitle.Font = $fontHeader
$lblLogsTitle.Location = New-Object System.Drawing.Point(15, 15)
$lblLogsTitle.AutoSize = $true
$logsPanel.Controls.Add($lblLogsTitle)

$txtLogs = New-Object System.Windows.Forms.TextBox
$txtLogs.Multiline = $true
$txtLogs.ScrollBars = "Vertical"
$txtLogs.Font = $fontSmall
$txtLogs.Location = New-Object System.Drawing.Point(15, 50)
$txtLogs.Size = New-Object System.Drawing.Size(750, 300)
$txtLogs.ReadOnly = $true
$txtLogs.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 30)
$txtLogs.ForeColor = [System.Drawing.Color]::LightGray
$logsPanel.Controls.Add($txtLogs)

# Background Workers
$systemInfoWorker = New-Object System.ComponentModel.BackgroundWorker
$systemInfoWorker.WorkerReportsProgress = $false
$systemInfoWorker.WorkerSupportsCancellation = $true

$systemInfoWorker.Add_DoWork({
    param($sender, $e)
    while (-not $sender.CancellationPending) {
        try {
            Update-SystemInfo
            Update-Status
            
            # Update UI elements
            if ($lblServerStatus.InvokeRequired) {
                $lblServerStatus.Invoke([Action]{
                    if ($script:activePort -gt 0) {
                        $lblServerStatus.Text = "Status: RUNNING (Port $script:activePort)"
                        $lblServerStatus.ForeColor = [System.Drawing.Color]::LimeGreen
                        $lblPortStatus.Text = "Port: $script:activePort"
                    } else {
                        $lblServerStatus.Text = "Status: STOPPED"
                        $lblServerStatus.ForeColor = [System.Drawing.Color]::Red
                        $lblPortStatus.Text = "Port: -"
                    }
                })
            }
            
            Start-Sleep -Seconds 3
        } catch {
            # Ignore errors in background worker
        }
    }
})

# Form Events
$form.Add_Shown({
    Log-Message "Varsagel Ultra Panel v3 started" "INFO"
    Log-Message "System initializing..." "INFO"
    
    Apply-Theme $script:currentTheme
    Show-Tab "dashboard"
    
    # Start background workers
    $systemInfoWorker.RunWorkerAsync()
    
    Log-Message "Panel ready" "SUCCESS"
})

$form.Add_FormClosed({
    Log-Message "Panel closing..." "INFO"
    
    # Stop background workers
    $systemInfoWorker.CancelAsync()
    
    Log-Message "Panel closed" "INFO"
})

# Show Form
[void]$form.ShowDialog()