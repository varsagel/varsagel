# Varsagel Control Panel - Working Version
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
$bgColor = [System.Drawing.Color]::FromArgb(45, 45, 48)$form.BackColor = $bgColor
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
$logBox.Location = New-Object System.Drawing.Point(50, 140)
$logBox.Size = New-Object System.Drawing.Size(400, 150)
$logBox.Font = New-Object System.Drawing.Font("Consolas", 9)
$logBox.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 30)
$logBox.ForeColor = [System.Drawing.Color]::LightGray
$logBox.ReadOnly = $true
$form.Controls.Add($logBox)

# Button Panel
$buttonPanel = New-Object System.Windows.Forms.Panel
$buttonPanel.Location = New-Object System.Drawing.Point(50, 300)
$buttonPanel.Size = New-Object System.Drawing.Size(400, 50)
$form.Controls.Add($buttonPanel)

# Buttons
$btnStartDev = New-Object System.Windows.Forms.Button
$btnStartDev.Text = "Start Dev"
$btnStartDev.Size = New-Object System.Drawing.Size(90, 35)
$btnStartDev.Location = New-Object System.Drawing.Point(0, 0)
$btnStartDev.BackColor = $buttonColor
$btnStartDev.ForeColor = $textColor
$btnStartDev.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$buttonPanel.Controls.Add($btnStartDev)

$btnStartProd = New-Object System.Windows.Forms.Button
$btnStartProd.Text = "Start Prod"
$btnStartProd.Size = New-Object System.Drawing.Size(90, 35)
$btnStartProd.Location = New-Object System.Drawing.Point(100, 0)
$btnStartProd.BackColor = [System.Drawing.Color]::FromArgb(40, 167, 69)
$btnStartProd.ForeColor = $textColor
$btnStartProd.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$buttonPanel.Controls.Add($btnStartProd)

$btnStop = New-Object System.Windows.Forms.Button
$btnStop.Text = "Stop"
$btnStop.Size = New-Object System.Drawing.Size(90, 35)
$btnStop.Location = New-Object System.Drawing.Point(200, 0)
$btnStop.BackColor = [System.Drawing.Color]::FromArgb(220, 53, 69)
$btnStop.ForeColor = $textColor
$btnStop.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$buttonPanel.Controls.Add($btnStop)

$btnOpen = New-Object System.Windows.Forms.Button
$btnOpen.Text = "Open Site"
$btnOpen.Size = New-Object System.Drawing.Size(90, 35)
$btnOpen.Location = New-Object System.Drawing.Point(300, 0)
$btnOpen.BackColor = [System.Drawing.Color]::FromArgb(255, 193, 7)
$btnOpen.ForeColor = [System.Drawing.Color]::Black
$btnOpen.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$buttonPanel.Controls.Add($btnOpen)

# Functions
function Write-Log {
    param($Message, $Type = "INFO")
    $timestamp = Get-Date -Format "HH:mm:ss"
    $logEntry = "[$timestamp] [$Type] $Message`r`n"
    $logBox.AppendText($logEntry)
    $logBox.ScrollToCaret()
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
            $statusLabel.Text = "Status: ACTIVE (Port 3004)"
            $statusLabel.ForeColor = [System.Drawing.Color]::LimeGreen
            $portLabel.Text = "Active Port: 3004 (Development)"
            return 3004
        } elseif ($connHTTP) {
            $statusLabel.Text = "Status: ACTIVE (Port 3000)"
            $statusLabel.ForeColor = [System.Drawing.Color]::LimeGreen
            $portLabel.Text = "Active Port: 3000 (Development)"
            return 3000
        } elseif ($connHTTPS) {
            $statusLabel.Text = "Status: ACTIVE (Port 443)"
            $statusLabel.ForeColor = [System.Drawing.Color]::LimeGreen
            $portLabel.Text = "Active Port: 443 (HTTPS)"
            return 443
        } else {
            $statusLabel.Text = "Status: STOPPED"
            $statusLabel.ForeColor = [System.Drawing.Color]::Red
            $portLabel.Text = "Active Port: -"
            return 0
        }
    } catch {
        $statusLabel.Text = "Status: ERROR"
        $statusLabel.ForeColor = [System.Drawing.Color]::Red
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

# Event Handlers
$btnStartDev.Add_Click({ Start-DevMode })
$btnStartProd.Add_Click({ Start-ProdMode })
$btnStop.Add_Click({ Stop-Server })
$btnOpen.Add_Click({ Open-Site })

# Timer for status updates
$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 3000
$timer.Add_Tick({ Check-ServerStatus })

# Form Events
$form.Add_Shown({
    Write-Log "Varsagel Control Panel started" "INFO"
    Write-Log "Checking server status..." "INFO"
    Check-ServerStatus
    $timer.Start()
})

$form.Add_FormClosed({
    $timer.Stop()
    Write-Log "Control panel closed" "INFO"
})

# Show Form
[void]$form.ShowDialog()