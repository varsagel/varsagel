# Varsagel Control Panel - Fixed Version (No Mouse Spinning)
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Main Form
$form = New-Object System.Windows.Forms.Form
$form.Text = "Varsagel Control Panel"
$form.Size = New-Object System.Drawing.Size(500, 400)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedSingle"
$form.MaximizeBox = $false

# Colors
$bgColor = [System.Drawing.Color]::FromArgb(45, 45, 48)
$form.BackColor = $bgColor
$buttonColor = [System.Drawing.Color]::FromArgb(0, 122, 204)
$textColor = [System.Drawing.Color]::White

# Title
$title = New-Object System.Windows.Forms.Label
$title.Text = "VARSAGEL SERVER CONTROL"
$title.Font = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Bold)
$title.ForeColor = $textColor
$title.Location = New-Object System.Drawing.Point(50, 20)
$title.Size = New-Object System.Drawing.Size(400, 30)
$title.TextAlign = [System.Drawing.ContentAlignment]::MiddleCenter
$form.Controls.Add($title)

# Status Display
$statusLabel = New-Object System.Windows.Forms.Label
$statusLabel.Text = "Status: Checking..."
$statusLabel.Font = New-Object System.Drawing.Font("Arial", 12)
$statusLabel.ForeColor = $textColor
$statusLabel.Location = New-Object System.Drawing.Point(50, 70)
$statusLabel.Size = New-Object System.Drawing.Size(400, 25)
$statusLabel.TextAlign = [System.Drawing.ContentAlignment]::MiddleCenter
$form.Controls.Add($statusLabel)

# Port Display
$portLabel = New-Object System.Windows.Forms.Label
$portLabel.Text = "Active Port: -"
$portLabel.Font = New-Object System.Drawing.Font("Arial", 10)
$portLabel.ForeColor = $textColor
$portLabel.Location = New-Object System.Drawing.Point(50, 100)
$portLabel.Size = New-Object System.Drawing.Size(400, 20)
$portLabel.TextAlign = [System.Drawing.ContentAlignment]::MiddleCenter
$form.Controls.Add($portLabel)

# Log Display
$logBox = New-Object System.Windows.Forms.TextBox
$logBox.Multiline = $true
$logBox.ScrollBars = "Vertical"
$logBox.Font = New-Object System.Drawing.Font("Consolas", 8)
$logBox.Location = New-Object System.Drawing.Point(20, 200)
$logBox.Size = New-Object System.Drawing.Size(440, 150)
$logBox.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 30)
$logBox.ForeColor = [System.Drawing.Color]::LightGray
$logBox.ReadOnly = $true
$form.Controls.Add($logBox)

# Button Panel
$buttonPanel = New-Object System.Windows.Forms.Panel
$buttonPanel.Location = New-Object System.Drawing.Point(20, 130)
$buttonPanel.Size = New-Object System.Drawing.Size(440, 60)
$buttonPanel.BackColor = $bgColor
$form.Controls.Add($buttonPanel)

# Buttons
$btnStartDev = New-Object System.Windows.Forms.Button
$btnStartDev.Text = "Start Dev"
$btnStartDev.Location = New-Object System.Drawing.Point(10, 10)
$btnStartDev.Size = New-Object System.Drawing.Size(100, 40)
$btnStartDev.BackColor = $buttonColor
$btnStartDev.ForeColor = $textColor
$btnStartDev.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$buttonPanel.Controls.Add($btnStartDev)

$btnStartProd = New-Object System.Windows.Forms.Button
$btnStartProd.Text = "Start Prod"
$btnStartProd.Location = New-Object System.Drawing.Point(120, 10)
$btnStartProd.Size = New-Object System.Drawing.Size(100, 40)
$btnStartProd.BackColor = $buttonColor
$btnStartProd.ForeColor = $textColor
$btnStartProd.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$buttonPanel.Controls.Add($btnStartProd)

$btnStop = New-Object System.Windows.Forms.Button
$btnStop.Text = "Stop Server"
$btnStop.Location = New-Object System.Drawing.Point(230, 10)
$btnStop.Size = New-Object System.Drawing.Size(100, 40)
$btnStop.BackColor = [System.Drawing.Color]::FromArgb(220, 53, 69)
$btnStop.ForeColor = $textColor
$btnStop.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$buttonPanel.Controls.Add($btnStop)

$btnOpen = New-Object System.Windows.Forms.Button
$btnOpen.Text = "Open Site"
$btnOpen.Location = New-Object System.Drawing.Point(340, 10)
$btnOpen.Size = New-Object System.Drawing.Size(90, 40)
$btnOpen.BackColor = $buttonColor
$btnOpen.ForeColor = $textColor
$btnOpen.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$buttonPanel.Controls.Add($btnOpen)

# Background Worker for Status Updates
$backgroundWorker = New-Object System.ComponentModel.BackgroundWorker
$backgroundWorker.WorkerReportsProgress = $false
$backgroundWorker.WorkerSupportsCancellation = $true

# Functions
function Write-Log {
    param($Message, $Type = "INFO")
    $timestamp = Get-Date -Format "HH:mm:ss"
    $logEntry = "[$timestamp] [$Type] $Message`r`n"
    if ($logBox.InvokeRequired) {
        $logBox.Invoke([Action]{ 
            $logBox.AppendText($logEntry)
            $logBox.ScrollToCaret()
        })
    } else {
        $logBox.AppendText($logEntry)
        $logBox.ScrollToCaret()
    }
}

function Update-StatusLabel {
    param($Text, $Color)
    if ($statusLabel.InvokeRequired) {
        $statusLabel.Invoke([Action]{
            $statusLabel.Text = $Text
            $statusLabel.ForeColor = $Color
        })
    } else {
        $statusLabel.Text = $Text
        $statusLabel.ForeColor = $Color
    }
}

function Update-PortLabel {
    param($Text)
    if ($portLabel.InvokeRequired) {
        $portLabel.Invoke([Action]{
            $portLabel.Text = $Text
        })
    } else {
        $portLabel.Text = $Text
    }
}

function Check-ServerStatus {
    try {
        $portHTTP = 3000
        $portAlt = 3004
        $portHTTPS = 443
        
        $connHTTP = Get-NetTCPConnection -LocalPort $portHTTP -State Listen -ErrorAction SilentlyContinue
        $connAlt = Get-NetTCPConnection -LocalPort $portAlt -State Listen -ErrorAction SilentlyContinue
        $connHTTPS = Get-NetTCPConnection -LocalPort $portHTTPS -State Listen -ErrorAction SilentlyContinue
        
        if ($connAlt) {
            Update-StatusLabel "Status: ACTIVE (Port 3004)" ([System.Drawing.Color]::LimeGreen)
            Update-PortLabel "Active Port: 3004 (Development)"
            return 3004
        } elseif ($connHTTP) {
            Update-StatusLabel "Status: ACTIVE (Port 3000)" ([System.Drawing.Color]::LimeGreen)
            Update-PortLabel "Active Port: 3000 (Development)"
            return 3000
        } elseif ($connHTTPS) {
            Update-StatusLabel "Status: ACTIVE (Port 443)" ([System.Drawing.Color]::LimeGreen)
            Update-PortLabel "Active Port: 443 (HTTPS)"
            return 443
        } else {
            Update-StatusLabel "Status: STOPPED" ([System.Drawing.Color]::Red)
            Update-PortLabel "Active Port: -"
            return 0
        }
    } catch {
        Update-StatusLabel "Status: ERROR" ([System.Drawing.Color]::Red)
        Write-Log "Error checking status: $($_.Exception.Message)" "ERROR"
        return 0
    }
}

function Start-DevMode {
    $activePort = Check-ServerStatus
    if ($activePort -ne 0) {
        Write-Log "Server already running on port $activePort" "WARNING"
        [System.Windows.Forms.MessageBox]::Show("Server already running on port $activePort. Stop it first.", "Warning", "OK", "Warning")
        return
    }
    
    Write-Log "Starting development server on port 3004..." "INFO"
    try {
        Set-Location $PSScriptRoot\..
        $env:PORT = "3004"
        Start-Process "npm" -ArgumentList "run", "dev" -NoNewWindow -PassThru
        Write-Log "Development server started on port 3004" "SUCCESS"
        Start-Sleep -Seconds 2
        Check-ServerStatus
    } catch {
        Write-Log "Failed to start development server: $($_.Exception.Message)" "ERROR"
    }
}

function Start-ProdMode {
    $activePort = Check-ServerStatus
    if ($activePort -ne 0) {
        Write-Log "Server already running on port $activePort" "WARNING"
        [System.Windows.Forms.MessageBox]::Show("Server already running on port $activePort. Stop it first.", "Warning", "OK", "Warning")
        return
    }
    
    Write-Log "Starting production server..." "INFO"
    try {
        Set-Location $PSScriptRoot\..
        Start-Process "npm" -ArgumentList "run", "start" -NoNewWindow -PassThru
        Write-Log "Production server started" "SUCCESS"
        Start-Sleep -Seconds 2
        Check-ServerStatus
    } catch {
        Write-Log "Failed to start production server: $($_.Exception.Message)" "ERROR"
    }
}

function Stop-Server {
    $activePort = Check-ServerStatus
    if ($activePort -eq 0) {
        Write-Log "No server running" "WARNING"
        return
    }
    
    Write-Log "Stopping server..." "INFO"
    try {
        # Kill node processes
        Get-Process | Where-Object { $_.ProcessName -like "*node*" } | Stop-Process -Force -ErrorAction SilentlyContinue
        Write-Log "Server stopped" "SUCCESS"
        Start-Sleep -Seconds 1
        Check-ServerStatus
    } catch {
        Write-Log "Error stopping server: $($_.Exception.Message)" "ERROR"
    }
}

function Open-Site {
    $activePort = Check-ServerStatus
    if ($activePort -eq 0) {
        Write-Log "No server running to open" "WARNING"
        return
    }
    
    $url = "http://localhost:$activePort"
    Write-Log "Opening site: $url" "INFO"
    try {
        Start-Process $url
        Write-Log "Site opened in browser" "SUCCESS"
    } catch {
        Write-Log "Failed to open site: $($_.Exception.Message)" "ERROR"
    }
}

# Background Worker Event Handlers
$backgroundWorker.Add_DoWork({
    param($sender, $e)
    while (-not $backgroundWorker.CancellationPending) {
        Check-ServerStatus
        Start-Sleep -Seconds 3
    }
})

# Event Handlers
$btnStartDev.Add_Click({ Start-DevMode })
$btnStartProd.Add_Click({ Start-ProdMode })
$btnStop.Add_Click({ Stop-Server })
$btnOpen.Add_Click({ Open-Site })

# Form Events
$form.Add_Shown({
    Write-Log "Varsagel Control Panel started" "INFO"
    Write-Log "Checking server status..." "INFO"
    Check-ServerStatus
    $backgroundWorker.RunWorkerAsync()
})

$form.Add_FormClosed({
    $backgroundWorker.CancelAsync()
    Write-Log "Control panel closed" "INFO"
})

# Show Form
[void]$form.ShowDialog()