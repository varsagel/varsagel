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

# Enhanced Functions
function Apply-Theme($themeName) {
    $script:currentTheme = $themeName.ToLower()
    $theme = $themes[$script:currentTheme]
    
    # Form backgrounds
    $form.BackColor = $theme.background
    if ($pnlHeader) { $pnlHeader.BackColor = $theme.panel }
    if ($pnlMenu) { $pnlMenu.BackColor = $theme.panel }
    if ($pnlStatus) { $pnlStatus.BackColor = $theme.panel }
    
    # Text colors
    if ($lblTitle) { $lblTitle.ForeColor = $theme.primary }
    if ($lblSubtitle) { $lblSubtitle.ForeColor = $theme.textDim }
    if ($lblClock) { $lblClock.ForeColor = $theme.textDim }
    if ($lblStatus) { $lblStatus.ForeColor = $theme.text }
    
    # Status cards
    if ($statusCards) {
        foreach ($card in $statusCards) {
            $card.Panel.BackColor = $theme.panel
            $card.Title.ForeColor = $theme.text
            $card.Value.ForeColor = $theme.text
            $card.Icon.ForeColor = $theme.primary
        }
    }
    
    # Quick actions panel
    if ($quickActionsPanel) { $quickActionsPanel.BackColor = $theme.panel }
    if ($lblQuickTitle) { $lblQuickTitle.ForeColor = $theme.primary }
    
    # Buttons
    if ($actionButtons) {
        foreach ($btn in $actionButtons) {
            $btn.BackColor = $theme.primary
            $btn.ForeColor = [System.Drawing.Color]::White
            $btn.FlatAppearance.BorderColor = $theme.border
            $btn.FlatAppearance.MouseOverBackColor = $theme.hover
        }
    }
    
    # Log box
    if ($logBox) { 
        $logBox.BackColor = $theme.panel
        $logBox.ForeColor = $theme.text
    }
    
    # Performance chart
    if ($performanceChart) { $performanceChart.BackColor = $theme.panel }
    
    # Settings panel
    if ($settingsPanel) { $settingsPanel.BackColor = $theme.background }
    if ($lblSettingsTitle) { $lblSettingsTitle.ForeColor = $theme.primary }
    if ($lblPortTitle) { $lblPortTitle.ForeColor = $theme.text }
    if ($lblThemeTitle) { $lblThemeTitle.ForeColor = $theme.text }
    if ($portInput) { 
        $portInput.BackColor = $theme.panel
        $portInput.ForeColor = $theme.text
    }
    if ($themePanel) { $themePanel.BackColor = $theme.panel }
    
    if ($txtLogs) {
        if ($txtLogs.InvokeRequired) {
            $txtLogs.Invoke([Action]{ 
                $txtLogs.BackColor = if ($script:currentTheme -eq "dark") { 
                    [System.Drawing.Color]::FromArgb(20, 20, 20) 
                } else { 
                    [System.Drawing.Color]::White 
                }
                $txtLogs.ForeColor = $theme.text
            })
        } else {
            $txtLogs.BackColor = if ($script:currentTheme -eq "dark") { 
                [System.Drawing.Color]::FromArgb(20, 20, 20) 
            } else { 
                [System.Drawing.Color]::White 
            }
            $txtLogs.ForeColor = $theme.text
        }
    }
    
    # Tab buttons
    if ($tabButtons) {
        foreach ($btn in $tabButtons) {
            $btn.BackColor = $theme.panel
            $btn.ForeColor = $theme.text
        }
    }
    
    # Action buttons
    if ($actionButtons -and $buttonConfigs) {
        for ($i = 0; $i -lt $actionButtons.Count; $i++) {
            $btn = $actionButtons[$i]
            $config = $buttonConfigs[$i]
            
            switch ($config.Color) {
                "primary" { $btn.BackColor = $theme.primary }
                "success" { $btn.BackColor = $theme.success }
                "danger" { $btn.BackColor = $theme.danger }
                "warning" { $btn.BackColor = $theme.warning }
                "info" { $btn.BackColor = [System.Drawing.Color]::FromArgb(52, 152, 219) }
                "secondary" { $btn.BackColor = $theme.textDim }
            }
            
            $btn.ForeColor = [System.Drawing.Color]::White
        }
    }
}

function Write-Log($msg, $type = "INFO") {
    $timestamp = Get-Date -Format "HH:mm:ss"
    $logEntry = "[$timestamp] [$type] $msg`r`n"
    
    # File logging
    $logFile = "$script:projectRoot\logs\panel_enhanced.log"
    $logDir = Split-Path -Parent $logFile
    if (!(Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
    "[$timestamp] [$type] $msg" | Out-File -FilePath $logFile -Append
    
    # UI logging
    if ($txtLogs) {
        if ($txtLogs.InvokeRequired) {
            $txtLogs.Invoke([Action]{ 
                if ($txtLogs.Lines.Count -gt $script:maxLogLines) {
                    $lines = $txtLogs.Lines
                    $txtLogs.Lines = $lines[($lines.Count - $script:maxLogLines + 100)..($lines.Count - 1)]
                }
                $txtLogs.AppendText($logEntry)
                $txtLogs.ScrollToCaret()
            })
        } else {
            if ($txtLogs.Lines.Count -gt $script:maxLogLines) {
                $lines = $txtLogs.Lines
                $txtLogs.Lines = $lines[($lines.Count - $script:maxLogLines + 100)..($lines.Count - 1)]
            }
            $txtLogs.AppendText($logEntry)
            $txtLogs.ScrollToCaret()
        }
    }
}
  
  # Main Form
$form = New-Object System.Windows.Forms.Form
$form.Text = "Varsagel Ultra Panel v3 - Enhanced"
$form.Size = New-Object System.Drawing.Size(1100, 800)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedSingle"
$form.MaximizeBox = $false
$form.MinimumSize = New-Object System.Drawing.Size(1000, 700)

# Enhanced Fonts
$fontTitle = New-Object System.Drawing.Font("Segoe UI", 20, [System.Drawing.FontStyle]::Bold)
$fontHeader = New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Bold)
$fontNormal = New-Object System.Drawing.Font("Segoe UI", 11)
$fontSmall = New-Object System.Drawing.Font("Segoe UI", 9)
$fontMono = New-Object System.Drawing.Font("Consolas", 9)

# Main Layout with better organization
$mainLayout = New-Object System.Windows.Forms.TableLayoutPanel
$mainLayout.Dock = [System.Windows.Forms.DockStyle]::Fill
$mainLayout.RowCount = 4
$mainLayout.ColumnCount = 1
$mainLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Absolute, 90)))  # Header
$mainLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Absolute, 50)))  # Menu
$mainLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Percent, 100))) # Content
$mainLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Absolute, 35)))  # Status bar
$form.Controls.Add($mainLayout)

# Header Panel with enhanced design
$pnlHeader = New-Object System.Windows.Forms.Panel
$pnlHeader.Dock = [System.Windows.Forms.DockStyle]::Fill
$pnlHeader.Margin = New-Object System.Windows.Forms.Padding(5)
$mainLayout.Controls.Add($pnlHeader, 0, 0)

# Logo and Title
$lblTitle = New-Object System.Windows.Forms.Label
$lblTitle.Text = "VARSAGEL"
$lblTitle.Font = $fontTitle
$lblTitle.Location = New-Object System.Drawing.Point(25, 15)
$lblTitle.AutoSize = $true
$pnlHeader.Controls.Add($lblTitle)

$lblSubtitle = New-Object System.Windows.Forms.Label
$lblSubtitle.Text = "Ultra Enhanced Control Panel v3"
$lblSubtitle.Font = $fontNormal
$lblSubtitle.Location = New-Object System.Drawing.Point(200, 25)
$lblSubtitle.AutoSize = $true
$pnlHeader.Controls.Add($lblSubtitle)

# Enhanced Clock and System Info
$lblClock = New-Object System.Windows.Forms.Label
$lblClock.Font = $fontSmall
$lblClock.Location = New-Object System.Drawing.Point(850, 15)
$lblClock.Size = New-Object System.Drawing.Size(200, 60)
$lblClock.TextAlign = [System.Drawing.ContentAlignment]::TopRight
$pnlHeader.Controls.Add($lblClock)

# Menu Panel
$pnlMenu = New-Object System.Windows.Forms.Panel
$pnlMenu.Dock = [System.Windows.Forms.DockStyle]::Fill
$pnlMenu.Margin = New-Object System.Windows.Forms.Padding(0)
$mainLayout.Controls.Add($pnlMenu, 0, 1)

# Enhanced Tab System
$tabs = @{}
$tabButtons = @()
$tabNames = @("dashboard", "server", "logs", "settings", "help")
$tabTitles = @("Dashboard", "Server", "Logs", "Settings", "Help")

for ($i = 0; $i -lt $tabNames.Count; $i++) {
    $btnTab = New-Object System.Windows.Forms.Button
    $btnTab.Text = $tabTitles[$i]
    $btnTab.Size = New-Object System.Drawing.Size(120, 40)
    $btnTab.Location = New-Object System.Drawing.Point((25 + $i * 130), 5)
    $btnTab.Font = $fontSmall
    $btnTab.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
    $btnTab.FlatAppearance.BorderSize = 0
    $btnTab.Tag = $tabNames[$i]
    $btnTab.Add_Click({
        param($sender, $e)
        Show-Tab $sender.Tag
    })
    $pnlMenu.Controls.Add($btnTab)
    $tabButtons += $btnTab
    
    # Tab panels
    $tabPanel = New-Object System.Windows.Forms.Panel
    $tabPanel.Dock = [System.Windows.Forms.DockStyle]::Fill
    $tabPanel.Visible = $false
    $tabs[$tabNames[$i]] = $tabPanel
}

# Content Panel
$pnlContent = New-Object System.Windows.Forms.Panel
$pnlContent.Dock = [System.Windows.Forms.DockStyle]::Fill
$pnlContent.Margin = New-Object System.Windows.Forms.Padding(10)
$mainLayout.Controls.Add($pnlContent, 0, 2)

# Add all tab panels to content panel
foreach ($tab in $tabs.Values) {
    $pnlContent.Controls.Add($tab)
}

# Status Bar
$pnlStatus = New-Object System.Windows.Forms.Panel
$pnlStatus.Dock = [System.Windows.Forms.DockStyle]::Fill
$pnlStatus.Margin = New-Object System.Windows.Forms.Padding(0)
$mainLayout.Controls.Add($pnlStatus, 0, 3)

$lblStatus = New-Object System.Windows.Forms.Label
$lblStatus.Text = "Ready"
$lblStatus.Font = $fontSmall
$lblStatus.Location = New-Object System.Drawing.Point(10, 8)
$lblStatus.AutoSize = $true
$pnlStatus.Controls.Add($lblStatus)

# Enhanced Dashboard Tab
$dashboardLayout = New-Object System.Windows.Forms.TableLayoutPanel
$dashboardLayout.Dock = [System.Windows.Forms.DockStyle]::Fill
$dashboardLayout.RowCount = 3
$dashboardLayout.ColumnCount = 3
$dashboardLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Percent, 25)))
$dashboardLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Percent, 35)))
$dashboardLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Percent, 40)))
$dashboardLayout.ColumnStyles.Add((New-Object System.Windows.Forms.ColumnStyle([System.Windows.Forms.SizeType]::Percent, 33)))
$dashboardLayout.ColumnStyles.Add((New-Object System.Windows.Forms.ColumnStyle([System.Windows.Forms.SizeType]::Percent, 34)))
$dashboardLayout.ColumnStyles.Add((New-Object System.Windows.Forms.ColumnStyle([System.Windows.Forms.SizeType]::Percent, 33)))
$tabs.dashboard.Controls.Add($dashboardLayout)

# Enhanced Status Cards
$statusCards = @()
$cardConfigs = @(
    @{Title = "SERVER STATUS"; Icon = "[SRV]"; Value = "STOPPED"; Color = "danger"},
    @{Title = "ACTIVE PORT"; Icon = "[P:]"; Value = "-"; Color = "info"},
    @{Title = "CPU USAGE"; Icon = "[CPU]"; Value = "0%"; Color = "warning"},
    @{Title = "MEMORY"; Icon = "[RAM]"; Value = "0 GB"; Color = "primary"},
    @{Title = "UPTIME"; Icon = "[UP]"; Value = "00:00:00"; Color = "success"},
    @{Title = "RESPONSE"; Icon = "[RES]"; Value = "0 ms"; Color = "info"}
)

for ($i = 0; $i -lt $cardConfigs.Count; $i++) {
    $cardPanel = New-Object System.Windows.Forms.Panel
    $cardPanel.Size = New-Object System.Drawing.Size(180, 80)
    $cardPanel.Location = New-Object System.Drawing.Point((10 + ($i % 3) * 200), (10 + [math]::Floor($i / 3) * 100))
    $cardPanel.BorderStyle = [System.Windows.Forms.BorderStyle]::FixedSingle
    $cardPanel.Margin = New-Object System.Windows.Forms.Padding(5)
    $dashboardLayout.Controls.Add($cardPanel, ($i % 3), [math]::Floor($i / 3))
    
    $lblCardIcon = New-Object System.Windows.Forms.Label
    $lblCardIcon.Text = $cardConfigs[$i].Icon
    $lblCardIcon.Font = New-Object System.Drawing.Font("Segoe UI", 16)
    $lblCardIcon.Location = New-Object System.Drawing.Point(10, 10)
    $lblCardIcon.Size = New-Object System.Drawing.Size(40, 40)
    $lblCardIcon.TextAlign = [System.Drawing.ContentAlignment]::MiddleCenter
    $cardPanel.Controls.Add($lblCardIcon)
    
    $lblCardTitle = New-Object System.Windows.Forms.Label
    $lblCardTitle.Text = $cardConfigs[$i].Title
    $lblCardTitle.Font = $fontSmall
    $lblCardTitle.Location = New-Object System.Drawing.Point(60, 10)
    $lblCardTitle.Size = New-Object System.Drawing.Size(110, 20)
    $cardPanel.Controls.Add($lblCardTitle)
    
    $lblCardValue = New-Object System.Windows.Forms.Label
    $lblCardValue.Text = $cardConfigs[$i].Value
    $lblCardValue.Font = New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Bold)
    $lblCardValue.Location = New-Object System.Drawing.Point(60, 35)
    $lblCardValue.Size = New-Object System.Drawing.Size(110, 30)
    $cardPanel.Controls.Add($lblCardValue)
    
    $statusCards += @{
        Panel = $cardPanel
        Icon = $lblCardIcon
        Title = $lblCardTitle
        Value = $lblCardValue
        Color = $cardConfigs[$i].Color
    }
}

# Quick Actions Panel
$quickActionsPanel = New-Object System.Windows.Forms.Panel
$quickActionsPanel.Dock = [System.Windows.Forms.DockStyle]::Fill
$quickActionsPanel.Margin = New-Object System.Windows.Forms.Padding(10)
$dashboardLayout.SetColumnSpan($quickActionsPanel, 3)
$dashboardLayout.Controls.Add($quickActionsPanel, 0, 1)

$lblQuickTitle = New-Object System.Windows.Forms.Label
$lblQuickTitle.Text = "Quick Actions"
$lblQuickTitle.Font = $fontHeader
$lblQuickTitle.Location = New-Object System.Drawing.Point(15, 15)
$lblQuickTitle.AutoSize = $true
$quickActionsPanel.Controls.Add($lblQuickTitle)

# Enhanced Action Buttons
$actionButtons = @()
$buttonConfigs = @(
    @{Text = "Start Dev Mode"; Icon = "[DEV]"; Color = "primary"; Action = "dev"; Description = "Start development server on www.varsagel.com"},
    @{Text = "Start Production"; Icon = "[PROD]"; Color = "success"; Action = "prod"; Description = "Start production server"},
    @{Text = "Stop Server"; Icon = "[STOP]"; Color = "danger"; Action = "stop"; Description = "Stop all running servers"},
    @{Text = "Open Website"; Icon = "[WEB]"; Color = "info"; Action = "open"; Description = "Open website in browser"},
    @{Text = "Build Project"; Icon = "[BUILD]"; Color = "warning"; Action = "build"; Description = "Build the project"},
    @{Text = "Clean Cache"; Icon = "[CLEAN]"; Color = "secondary"; Action = "clean"; Description = "Clean cache and temporary files"}
)

for ($i = 0; $i -lt $buttonConfigs.Count; $i++) {
    $btn = New-Object System.Windows.Forms.Button
    $btn.Text = "$($buttonConfigs[$i].Icon) $($buttonConfigs[$i].Text)`n$($buttonConfigs[$i].Description)"
    $btn.Size = New-Object System.Drawing.Size(180, 60)
    $btn.Location = New-Object System.Drawing.Point((15 + ($i % 4) * 195), (60 + [math]::Floor($i / 4) * 70))
    $btn.Font = New-Object System.Drawing.Font("Segoe UI", 9)
    $btn.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
    $btn.FlatAppearance.BorderSize = 0
    $btn.Tag = $buttonConfigs[$i].Action
    $btn.Add_Click({
        param($sender, $e)
        $action = $sender.Tag
        Execute-Action $action
    })
    $quickActionsPanel.Controls.Add($btn)
    $actionButtons += $btn
}

# Performance Chart Area
$chartPanel = New-Object System.Windows.Forms.Panel
$chartPanel.Dock = [System.Windows.Forms.DockStyle]::Fill
$chartPanel.Margin = New-Object System.Windows.Forms.Padding(10)
$chartPanel.BorderStyle = [System.Windows.Forms.BorderStyle]::FixedSingle
$dashboardLayout.SetColumnSpan($chartPanel, 2)
$dashboardLayout.Controls.Add($chartPanel, 0, 2)

$lblChartTitle = New-Object System.Windows.Forms.Label
$lblChartTitle.Text = "Performance Monitor"
$lblChartTitle.Font = $fontHeader
$lblChartTitle.Location = New-Object System.Drawing.Point(15, 15)
$lblChartTitle.AutoSize = $true
$chartPanel.Controls.Add($lblChartTitle)

# Performance Chart (Custom Drawing)
$performanceChart = New-Object System.Windows.Forms.Panel
$performanceChart.Location = New-Object System.Drawing.Point(15, 50)
$performanceChart.Size = New-Object System.Drawing.Size(550, 150)
$performanceChart.BorderStyle = [System.Windows.Forms.BorderStyle]::FixedSingle
$performanceChart.Add_Paint({
    param($sender, $e)
    $g = $e.Graphics
    $g.Clear($sender.BackColor)
    
    # Draw grid
    $penGrid = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(50, [System.Drawing.Color]::Gray))
    for ($x = 0; $x -lt $sender.Width; $x += 50) {
        $g.DrawLine($penGrid, $x, 0, $x, $sender.Height)
    }
    for ($y = 0; $y -lt $sender.Height; $y += 30) {
        $g.DrawLine($penGrid, 0, $y, $sender.Width, $y)
    }
    
    # Draw performance line (simulated)
    if ($script:performanceData.Count -gt 1) {
        $penLine = New-Object System.Drawing.Pen($themes[$script:currentTheme].chartLine, 2)
        $points = @()
        for ($i = 0; $i -lt $script:performanceData.Count; $i++) {
            $x = ($i / $script:performanceData.Count) * $sender.Width
            $y = $sender.Height - ($script:performanceData[$i] / 100) * $sender.Height
            $points += New-Object System.Drawing.PointF($x, $y)
        }
        $g.DrawLines($penLine, $points)
    }
})
$chartPanel.Controls.Add($performanceChart)

# System Info Panel
$systemInfoPanel = New-Object System.Windows.Forms.Panel
$systemInfoPanel.Dock = [System.Windows.Forms.DockStyle]::Fill
$systemInfoPanel.Margin = New-Object System.Windows.Forms.Padding(10)
$systemInfoPanel.BorderStyle = [System.Windows.Forms.BorderStyle]::FixedSingle
$dashboardLayout.Controls.Add($systemInfoPanel, 2, 2)

$lblSystemTitle = New-Object System.Windows.Forms.Label
$lblSystemTitle.Text = "System Information"
$lblSystemTitle.Font = $fontHeader
$lblSystemTitle.Location = New-Object System.Drawing.Point(15, 15)
$lblSystemTitle.AutoSize = $true
$systemInfoPanel.Controls.Add($lblSystemTitle)

# Server Tab
$serverLayout = New-Object System.Windows.Forms.TableLayoutPanel
$serverLayout.Dock = [System.Windows.Forms.DockStyle]::Fill
$serverLayout.RowCount = 2
$serverLayout.ColumnCount = 2
$serverLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Percent, 60)))
$serverLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Percent, 40)))
$serverLayout.ColumnStyles.Add((New-Object System.Windows.Forms.ColumnStyle([System.Windows.Forms.SizeType]::Percent, 50)))
$serverLayout.ColumnStyles.Add((New-Object System.Windows.Forms.ColumnStyle([System.Windows.Forms.SizeType]::Percent, 50)))
$tabs.server.Controls.Add($serverLayout)

# Logs Tab
$logsLayout = New-Object System.Windows.Forms.TableLayoutPanel
$logsLayout.Dock = [System.Windows.Forms.DockStyle]::Fill
$logsLayout.RowCount = 2
$logsLayout.ColumnCount = 1
$logsLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Absolute, 50)))
$logsLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Percent, 100)))
$tabs.logs.Controls.Add($logsLayout)

# Log Controls
$logControls = New-Object System.Windows.Forms.Panel
$logControls.Dock = [System.Windows.Forms.DockStyle]::Fill
$logsLayout.Controls.Add($logControls, 0, 0)

$btnClearLogs = New-Object System.Windows.Forms.Button
$btnClearLogs.Text = "Clear Logs"
$btnClearLogs.Size = New-Object System.Drawing.Size(100, 30)
$btnClearLogs.Location = New-Object System.Drawing.Point(15, 10)
$btnClearLogs.Font = $fontSmall
$btnClearLogs.Add_Click({ Clear-Logs })
$logControls.Controls.Add($btnClearLogs)

$btnExportLogs = New-Object System.Windows.Forms.Button
$btnExportLogs.Text = "Export Logs"
$btnExportLogs.Size = New-Object System.Drawing.Size(100, 30)
$btnExportLogs.Location = New-Object System.Drawing.Point(125, 10)
$btnExportLogs.Font = $fontSmall
$btnExportLogs.Add_Click({ Export-Logs })
$logControls.Controls.Add($btnExportLogs)

$cmbLogLevel = New-Object System.Windows.Forms.ComboBox
$cmbLogLevel.Size = New-Object System.Drawing.Size(120, 30)
$cmbLogLevel.Location = New-Object System.Drawing.Point(250, 10)
$cmbLogLevel.Font = $fontSmall
$cmbLogLevel.Items.AddRange(@("All", "INFO", "SUCCESS", "WARNING", "ERROR"))
$cmbLogLevel.SelectedIndex = 0
$cmbLogLevel.Add_SelectedIndexChanged({ Filter-Logs })
$logControls.Controls.Add($cmbLogLevel)

# Log Textbox
$txtLogs = New-Object System.Windows.Forms.TextBox
$txtLogs.Multiline = $true
$txtLogs.ScrollBars = "Vertical"
$txtLogs.Font = $fontMono
$txtLogs.Dock = [System.Windows.Forms.DockStyle]::Fill
$txtLogs.Margin = New-Object System.Windows.Forms.Padding(15)
$txtLogs.ReadOnly = $true
$logsLayout.Controls.Add($txtLogs, 0, 1)

# Settings Tab
$settingsLayout = New-Object System.Windows.Forms.TableLayoutPanel
$settingsLayout.Dock = [System.Windows.Forms.DockStyle]::Fill
$settingsLayout.RowCount = 2
$settingsLayout.ColumnCount = 2
$settingsLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Percent, 50)))
$settingsLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Percent, 50)))
$settingsLayout.ColumnStyles.Add((New-Object System.Windows.Forms.ColumnStyle([System.Windows.Forms.SizeType]::Percent, 50)))
$settingsLayout.ColumnStyles.Add((New-Object System.Windows.Forms.ColumnStyle([System.Windows.Forms.SizeType]::Percent, 50)))
$tabs.settings.Controls.Add($settingsLayout)

# Theme Selection
$themePanel = New-Object System.Windows.Forms.Panel
$themePanel.Dock = [System.Windows.Forms.DockStyle]::Fill
$themePanel.Margin = New-Object System.Windows.Forms.Padding(10)
$themePanel.BorderStyle = [System.Windows.Forms.BorderStyle]::FixedSingle
$settingsLayout.Controls.Add($themePanel, 0, 0)

$lblThemeTitle = New-Object System.Windows.Forms.Label
$lblThemeTitle.Text = "Theme Selection"
$lblThemeTitle.Font = $fontHeader
$lblThemeTitle.Location = New-Object System.Drawing.Point(15, 15)
$lblThemeTitle.AutoSize = $true
$themePanel.Controls.Add($lblThemeTitle)

$rbThemeDark = New-Object System.Windows.Forms.RadioButton
$rbThemeDark.Text = "Dark Theme"
$rbThemeDark.Location = New-Object System.Drawing.Point(15, 50)
$rbThemeDark.Size = New-Object System.Drawing.Size(120, 25)
$rbThemeDark.Font = $fontSmall
$rbThemeDark.Add_CheckedChanged({ if ($rbThemeDark.Checked) { Apply-Theme "dark" } })
$themePanel.Controls.Add($rbThemeDark)

$rbThemeLight = New-Object System.Windows.Forms.RadioButton
$rbThemeLight.Text = "Light Theme"
$rbThemeLight.Location = New-Object System.Drawing.Point(15, 80)
$rbThemeLight.Size = New-Object System.Drawing.Size(120, 25)
$rbThemeLight.Font = $fontSmall
$rbThemeLight.Add_CheckedChanged({ if ($rbThemeLight.Checked) { Apply-Theme "light" } })
$themePanel.Controls.Add($rbThemeLight)

$rbThemeNeon = New-Object System.Windows.Forms.RadioButton
$rbThemeNeon.Text = "Neon Theme"
$rbThemeNeon.Location = New-Object System.Drawing.Point(15, 110)
$rbThemeNeon.Size = New-Object System.Drawing.Size(120, 25)
$rbThemeNeon.Font = $fontSmall
$rbThemeNeon.Add_CheckedChanged({ if ($rbThemeNeon.Checked) { Apply-Theme "neon" } })
$themePanel.Controls.Add($rbThemeNeon)

$rbThemeDark.Checked = $true

function Update-SystemInfo {
    # Update clock
    $currentTime = Get-Date
    $lblClock.Text = "$($currentTime.ToString('HH:mm:ss'))`n$($currentTime.ToString('yyyy-MM-dd'))`n`nCPU: $([math]::Round((Get-Counter '\Processor(_Total)\% Processor Time').CounterSamples[0].CookedValue, 1))%`nRAM: $([math]::Round((Get-Counter '\Memory\Available MBytes').CounterSamples[0].CookedValue / 1024, 1)) GB"
    
    # Update performance data
    $cpuUsage = [math]::Round((Get-Counter '\Processor(_Total)\% Processor Time').CounterSamples[0].CookedValue, 1)
    $script:performanceData += $cpuUsage
    if ($script:performanceData.Count -gt 50) {
        $script:performanceData = $script:performanceData[1..50]
    }
    
    # Update status cards
    Update-StatusCard "CPU USAGE" "$cpuUsage%" "warning"
    
    # Update memory
    $totalRAM = (Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB
    $availableRAM = (Get-Counter '\Memory\Available MBytes').CounterSamples[0].CookedValue / 1024
    $usedRAM = $totalRAM - $availableRAM
    $ramPercentage = [math]::Round(($usedRAM / $totalRAM) * 100, 1)
    Update-StatusCard "MEMORY" "$ramPercentage% ($([math]::Round($usedRAM, 1)) GB)" "primary"
    
    # Invalidate chart to trigger redraw
    $performanceChart.Invalidate()
}

function Update-StatusCard($title, $value, $color) {
    foreach ($card in $statusCards) {
        if ($card.Title.Text -eq $title) {
            if ($card.Value.InvokeRequired) {
                $card.Value.Invoke([Action]{
                    $card.Value.Text = $value
                })
            } else {
                $card.Value.Text = $value
            }
            break
        }
    }
}

function Update-Status {
    $ports = @(443, 80, 3000, 3004)
    $runningPort = 0
    $responseTime = 0
    $isProduction = $false
    
    # Check local ports first
    foreach ($port in $ports) {
        $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        if ($connections) {
            $runningPort = $port
            break
        }
    }
    
    # Check if production site is accessible
    try {
        $prodResponse = Invoke-WebRequest -Uri "https://www.varsagel.com" -TimeoutSec 5 -UseBasicParsing
        if ($prodResponse.StatusCode -eq 200) {
            $isProduction = $true
            if ($runningPort -eq 0) {
                $runningPort = 443
            }
        }
    } catch {
        # Production site not accessible
    }
    
    $script:activePort = $runningPort
    
    if ($runningPort -gt 0 -or $isProduction) {
        $statusText = if ($isProduction) { "PRODUCTION" } else { "RUNNING" }
        $statusColor = if ($isProduction) { "success" } else { "info" }
        
        Update-StatusCard "SERVER STATUS" $statusText $statusColor
        Update-StatusCard "ACTIVE PORT" $(if ($isProduction) { "Production" } else { "Port $runningPort" }) "info"
        
        # Measure response time
        try {
            $startTime = Get-Date
            $testUrl = if ($isProduction) { "https://www.varsagel.com" } else { "http://localhost:$runningPort" }
            $response = Invoke-WebRequest -Uri $testUrl -TimeoutSec 5 -UseBasicParsing
            $endTime = Get-Date
            $responseTime = [math]::Round(($endTime - $startTime).TotalMilliseconds, 0)
            Update-StatusCard "RESPONSE" "$responseTime ms" "info"
        } catch {
            Update-StatusCard "RESPONSE" "Timeout" "danger"
        }
    } else {
        Update-StatusCard "SERVER STATUS" "STOPPED" "danger"
        Update-StatusCard "ACTIVE PORT" "-" "info"
        Update-StatusCard "RESPONSE" "-" "info"
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
    # Check if production site is already running
    try {
        $prodResponse = Invoke-WebRequest -Uri "https://www.varsagel.com" -TimeoutSec 3 -UseBasicParsing
        if ($prodResponse.StatusCode -eq 200) {
            Write-Log "Production site already running at www.varsagel.com" "INFO"
            [System.Windows.Forms.MessageBox]::Show("Production site already running at www.varsagel.com", "Info", "OK", "Information")
            return
        }
    } catch {
        # Production site not accessible, continue with local server start
    }
    
    if ($script:activePort -ne 0) {
        Write-Log "Server already running on port $script:activePort" "WARNING"
        [System.Windows.Forms.MessageBox]::Show("Server already running on port $script:activePort. Stop it first.", "Warning", "OK", "Warning")
        return
    }
    
    if ($mode -eq "build") {
        Build-Project
        return
    }
    
    Write-Log "Starting server in $mode mode..." "INFO"
    
    # Clean old lock files
    $lockFile = "$script:projectRoot\.next\dev\lock"
    if (Test-Path $lockFile) {
        try {
            Remove-Item $lockFile -Force -ErrorAction SilentlyContinue
            Write-Log "Old lock file cleaned" "INFO"
        } catch {
            Write-Log "Could not clean lock file" "WARNING"
        }
    }
    
    # Start server in background
    $startInfo = New-Object System.Diagnostics.ProcessStartInfo
    $startInfo.FileName = "cmd.exe"
    $startInfo.Arguments = "/k title Varsagel Server & npm run $mode"
    $startInfo.WorkingDirectory = $script:projectRoot
    $startInfo.UseShellExecute = $true
    $startInfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Normal
    
    [System.Diagnostics.Process]::Start($startInfo)
    
    Write-Log "Server window opened successfully" "SUCCESS"
    Start-Sleep -Seconds 3
    Update-Status
}

function Stop-Server {
    if ($script:activePort -eq 0) {
        Write-Log "No server running" "WARNING"
        return
    }
    
    Write-Log "Stopping server..." "INFO"
    
    # Stop processes on all ports
    $ports = @(443, 80, 3000, 3004)
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
    # For production, always open the main domain
    Start-Process "https://www.varsagel.com"
    Write-Log "Website opened: https://www.varsagel.com" "INFO"
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

function Clear-Logs {
    $txtLogs.Clear()
    Log-Message "Logs cleared" "INFO"
}

function Export-Logs {
    $saveDialog = New-Object System.Windows.Forms.SaveFileDialog
    $saveDialog.Filter = "Text Files (*.txt)|*.txt|Log Files (*.log)|*.log|All Files (*.*)|*.*"
    $saveDialog.Title = "Export Logs"
    $saveDialog.FileName = "varsagel_logs_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
    
    if ($saveDialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
        $txtLogs.Text | Out-File -FilePath $saveDialog.FileName -Encoding UTF8
        Log-Message "Logs exported to: $($saveDialog.FileName)" "SUCCESS"
    }
}

function Filter-Logs {
    # This would filter logs based on selected level
    Log-Message "Log filter changed to: $($cmbLogLevel.SelectedItem)" "INFO"
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
        Write-Log "Switched to $tabName tab" "INFO"
    }
}

# Background Workers for smooth operations
$systemInfoWorker = New-Object System.ComponentModel.BackgroundWorker
$systemInfoWorker.WorkerReportsProgress = $false
$systemInfoWorker.WorkerSupportsCancellation = $true

$systemInfoWorker.Add_DoWork({
    param($sender, $e)
    while (-not $sender.CancellationPending) {
        try {
            Update-SystemInfo
            Update-Status
            Start-Sleep -Seconds 2
        } catch {
            # Ignore errors in background worker
        }
    }
})

# Form Events
$form.Add_Shown({
    Write-Log "Varsagel Ultra Panel v3 started" "INFO"
    Write-Log "System initializing..." "INFO"
    
    Apply-Theme $script:currentTheme
    Show-Tab "dashboard"
    
    # Start background workers
    $systemInfoWorker.RunWorkerAsync()
    
    Write-Log "Panel ready" "SUCCESS"
})

$form.Add_FormClosed({
    Write-Log "Panel closing..." "INFO"
    
    # Stop background workers
    $systemInfoWorker.CancelAsync()
    
    Write-Log "Panel closed" "INFO"
})

# Show Form
[void]$form.ShowDialog()