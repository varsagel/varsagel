# Ultra Gelişmiş Varsagel Panel - Modern UI v2
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Global Değişkenler
$script:currentTheme = "dark"
$script:activePort = 0
$script:projectRoot = Split-Path -Parent $PSScriptRoot
$script:performanceData = @()
$script:maxLogLines = 1000

# Tema Tanımları
$themes = @{
    dark = @{
        primary = [System.Drawing.Color]::FromArgb(0, 122, 204)
        success = [System.Drawing.Color]::FromArgb(46, 204, 113)
        warning = [System.Drawing.Color]::FromArgb(241, 196, 15)
        danger = [System.Drawing.Color]::FromArgb(231, 76, 60)
        background = [System.Drawing.Color]::FromArgb(45, 45, 48)
        panel = [System.Drawing.Color]::FromArgb(37, 37, 38)
        text = [System.Drawing.Color]::FromArgb(220, 220, 220)
        textDim = [System.Drawing.Color]::FromArgb(160, 160, 160)
        hover = [System.Drawing.Color]::FromArgb(62, 62, 66)
        border = [System.Drawing.Color]::FromArgb(60, 60, 60)
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
    }
    blue = @{
        primary = [System.Drawing.Color]::FromArgb(13, 110, 253)
        success = [System.Drawing.Color]::FromArgb(25, 135, 84)
        warning = [System.Drawing.Color]::FromArgb(255, 193, 7)
        danger = [System.Drawing.Color]::FromArgb(220, 53, 69)
        background = [System.Drawing.Color]::FromArgb(227, 242, 253)
        panel = [System.Drawing.Color]::FromArgb(255, 255, 255)
        text = [System.Drawing.Color]::FromArgb(13, 71, 161)
        textDim = [System.Drawing.Color]::FromArgb(66, 133, 244)
        hover = [System.Drawing.Color]::FromArgb(187, 222, 251)
        border = [System.Drawing.Color]::FromArgb(144, 202, 249)
    }
}

# Ana Form
$form = New-Object System.Windows.Forms.Form
$form.Text = "Varsagel Ultra Kontrol Paneli"
$form.Size = New-Object System.Drawing.Size(1000, 750)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedSingle"
$form.MaximizeBox = $false
$form.MinimumSize = New-Object System.Drawing.Size(1000, 750)

# Fontlar
$fontTitle = New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Bold)
$fontHeader = New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Bold)
$fontNormal = New-Object System.Drawing.Font("Segoe UI", 11)
$fontSmall = New-Object System.Drawing.Font("Segoe UI", 9)
$fontMono = New-Object System.Drawing.Font("Consolas", 9)

# Ana Layout
$mainLayout = New-Object System.Windows.Forms.TableLayoutPanel
$mainLayout.Dock = [System.Windows.Forms.DockStyle]::Fill
$mainLayout.RowCount = 3
$mainLayout.ColumnCount = 1
$mainLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Absolute, 80)))
$mainLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Percent, 100)))
$mainLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Absolute, 30)))
$form.Controls.Add($mainLayout)

# Header Panel
$pnlHeader = New-Object System.Windows.Forms.Panel
$pnlHeader.Dock = [System.Windows.Forms.DockStyle]::Fill
$mainLayout.Controls.Add($pnlHeader, 0, 0)

# Logo ve Başlık
$lblTitle = New-Object System.Windows.Forms.Label
$lblTitle.Text = "VARSAGEL"
$lblTitle.Font = $fontTitle
$lblTitle.Location = New-Object System.Drawing.Point(20, 20)
$lblTitle.AutoSize = $true
$pnlHeader.Controls.Add($lblTitle)

$lblSubtitle = New-Object System.Windows.Forms.Label
$lblSubtitle.Text = "Ultra Kontrol Paneli"
$lblSubtitle.Font = $fontNormal
$lblSubtitle.Location = New-Object System.Drawing.Point(180, 28)
$lblSubtitle.AutoSize = $true
$pnlHeader.Controls.Add($lblSubtitle)

# Saat ve Tarih
$lblClock = New-Object System.Windows.Forms.Label
$lblClock.Font = $fontSmall
$lblClock.Location = New-Object System.Drawing.Point(850, 20)
$lblClock.AutoSize = $true
$pnlHeader.Controls.Add($lblClock)

# Tema Seçici
$cmbTheme = New-Object System.Windows.Forms.ComboBox
$cmbTheme.Size = New-Object System.Drawing.Size(120, 30)
$cmbTheme.Location = New-Object System.Drawing.Point(700, 25)
$cmbTheme.Font = $fontSmall
$cmbTheme.DropDownStyle = [System.Windows.Forms.ComboBoxStyle]::DropDownList
$cmbTheme.Items.AddRange(@("Dark Tema", "Light Tema", "Blue Tema"))
$cmbTheme.SelectedIndex = 0
$pnlHeader.Controls.Add($cmbTheme)

# Ana İçerik Alanı
$contentSplit = New-Object System.Windows.Forms.SplitContainer
$contentSplit.Dock = [System.Windows.Forms.DockStyle]::Fill
$contentSplit.SplitterDistance = 220
$contentSplit.IsSplitterFixed = $true
$contentSplit.BorderStyle = [System.Windows.Forms.BorderStyle]::None
$mainLayout.Controls.Add($contentSplit, 0, 1)

# Sol Menü Paneli
$pnlMenu = New-Object System.Windows.Forms.Panel
$pnlMenu.Dock = [System.Windows.Forms.DockStyle]::Fill
$contentSplit.Panel1.Controls.Add($pnlMenu)

# İçerik Paneli
$pnlContent = New-Object System.Windows.Forms.Panel
$pnlContent.Dock = [System.Windows.Forms.DockStyle]::Fill
$contentSplit.Panel2.Controls.Add($pnlContent)

# Status Bar
$statusBar = New-Object System.Windows.Forms.StatusStrip
$statusLabel = New-Object System.Windows.Forms.ToolStripStatusLabel
$statusLabel.Text = "Hazır"
$statusBar.Items.Add($statusLabel)
$mainLayout.Controls.Add($statusBar, 0, 2)

# TabControl for Content
$tabControl = New-Object System.Windows.Forms.TabControl
$tabControl.Dock = [System.Windows.Forms.DockStyle]::Fill
$tabControl.Appearance = [System.Windows.Forms.TabAppearance]::FlatButtons
$tabControl.SizeMode = [System.Windows.Forms.TabSizeMode]::Fixed
$tabControl.ItemSize = New-Object System.Drawing.Size(0, 1)
$pnlContent.Controls.Add($tabControl)

# Tab Pages
$tabs = @{
    dashboard = New-Object System.Windows.Forms.TabPage
    stats = New-Object System.Windows.Forms.TabPage
    logs = New-Object System.Windows.Forms.TabPage
    config = New-Object System.Windows.Forms.TabPage
    about = New-Object System.Windows.Forms.TabPage
}

foreach ($tab in $tabs.Values) {
    $tabControl.Controls.Add($tab)
}

# Dashboard Tab
$dashboardLayout = New-Object System.Windows.Forms.TableLayoutPanel
$dashboardLayout.Dock = [System.Windows.Forms.DockStyle]::Fill
$dashboardLayout.RowCount = 3
$dashboardLayout.ColumnCount = 2
$dashboardLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Percent, 35)))
$dashboardLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Percent, 35)))
$dashboardLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Percent, 30)))
$dashboardLayout.ColumnStyles.Add((New-Object System.Windows.Forms.ColumnStyle([System.Windows.Forms.SizeType]::Percent, 50)))
$dashboardLayout.ColumnStyles.Add((New-Object System.Windows.Forms.ColumnStyle([System.Windows.Forms.SizeType]::Percent, 50)))
$tabs.dashboard.Controls.Add($dashboardLayout)

# Status Cards
$statusCards = @()
$cardTitles = @("Sunucu Durumu", "Aktif Port", "CPU Kullanımı", "RAM Kullanımı")

for ($i = 0; $i -lt 4; $i++) {
    $card = New-Object System.Windows.Forms.Panel
    $card.Dock = [System.Windows.Forms.DockStyle]::Fill
    $card.Margin = New-Object System.Windows.Forms.Padding(10)
    $card.BorderStyle = [System.Windows.Forms.BorderStyle]::FixedSingle
    
    $lblCardTitle = New-Object System.Windows.Forms.Label
    $lblCardTitle.Text = $cardTitles[$i]
    $lblCardTitle.Font = $fontNormal
    $lblCardTitle.Location = New-Object System.Drawing.Point(15, 15)
    $lblCardTitle.AutoSize = $true
    $card.Controls.Add($lblCardTitle)
    
    $lblCardValue = New-Object System.Windows.Forms.Label
    $lblCardValue.Font = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
    $lblCardValue.Location = New-Object System.Drawing.Point(15, 50)
    $lblCardValue.AutoSize = $true
    $card.Controls.Add($lblCardValue)
    
    $dashboardLayout.Controls.Add($card, ($i % 2), [math]::Floor($i / 2))
    $statusCards += @{Panel = $card; Title = $lblCardTitle; Value = $lblCardValue}
}

# Quick Actions Panel
$quickActionsPanel = New-Object System.Windows.Forms.Panel
$quickActionsPanel.Dock = [System.Windows.Forms.DockStyle]::Fill
$quickActionsPanel.Margin = New-Object System.Windows.Forms.Padding(10)
$dashboardLayout.SetColumnSpan($quickActionsPanel, 2)
$dashboardLayout.Controls.Add($quickActionsPanel, 0, 2)

$lblQuickTitle = New-Object System.Windows.Forms.Label
$lblQuickTitle.Text = "Hızlı İşlemler"
$lblQuickTitle.Font = $fontHeader
$lblQuickTitle.Location = New-Object System.Drawing.Point(15, 15)
$lblQuickTitle.AutoSize = $true
$quickActionsPanel.Controls.Add($lblQuickTitle)

# Action Buttons
$actionButtons = @()
$buttonConfigs = @(
    @{Text = "Geliştirici Modu"; Color = "primary"; Action = "dev"},
    @{Text = "Canlı Modu"; Color = "success"; Action = "prod"},
    @{Text = "Durdur"; Color = "danger"; Action = "stop"},
    @{Text = "Siteyi Aç"; Color = "info"; Action = "open"},
    @{Text = "Build Al"; Color = "warning"; Action = "build"},
    @{Text = "Önbelleği Temizle"; Color = "secondary"; Action = "clean"}
)

for ($i = 0; $i -lt $buttonConfigs.Count; $i++) {
    $btn = New-Object System.Windows.Forms.Button
    $btn.Text = $buttonConfigs[$i].Text
    $btn.Size = New-Object System.Drawing.Size(140, 40)
    $btn.Location = New-Object System.Drawing.Point((15 + ($i % 3) * 155), (60 + [math]::Floor($i / 3) * 50))
    $btn.Font = $fontSmall
    $btn.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
    $btn.FlatAppearance.BorderSize = 0
    $quickActionsPanel.Controls.Add($btn)
    $actionButtons += $btn
}

# Stats Tab
$statsLayout = New-Object System.Windows.Forms.TableLayoutPanel
$statsLayout.Dock = [System.Windows.Forms.DockStyle]::Fill
$statsLayout.RowCount = 2
$statsLayout.ColumnCount = 1
$statsLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Percent, 60)))
$statsLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Percent, 40)))
$tabs.stats.Controls.Add($statsLayout)

# Performance Chart Placeholder
$chartPanel = New-Object System.Windows.Forms.Panel
$chartPanel.Dock = [System.Windows.Forms.DockStyle]::Fill
$chartPanel.Margin = New-Object System.Windows.Forms.Padding(10)
$chartPanel.BorderStyle = [System.Windows.Forms.BorderStyle]::FixedSingle
$statsLayout.Controls.Add($chartPanel, 0, 0)

$lblChartTitle = New-Object System.Windows.Forms.Label
$lblChartTitle.Text = "Performans Grafiği"
$lblChartTitle.Font = $fontHeader
$lblChartTitle.Location = New-Object System.Drawing.Point(15, 15)
$lblChartTitle.AutoSize = $true
$chartPanel.Controls.Add($lblChartTitle)

# Stats Grid
$statsGrid = New-Object System.Windows.Forms.DataGridView
$statsGrid.Dock = [System.Windows.Forms.DockStyle]::Fill
$statsGrid.Margin = New-Object System.Windows.Forms.Padding(10)
$statsGrid.AllowUserToAddRows = $false
$statsGrid.AllowUserToDeleteRows = $false
$statsGrid.ReadOnly = $true
$statsGrid.AutoSizeColumnsMode = [System.Windows.Forms.DataGridViewAutoSizeColumnsMode]::Fill
$statsLayout.Controls.Add($statsGrid, 0, 1)

# Logs Tab
$logsLayout = New-Object System.Windows.Forms.TableLayoutPanel
$logsLayout.Dock = [System.Windows.Forms.DockStyle]::Fill
$logsLayout.RowCount = 2
$logsLayout.ColumnCount = 1
$logsLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Absolute, 40)))
$logsLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Percent, 100)))
$tabs.logs.Controls.Add($logsLayout)

# Log Controls
$logControls = New-Object System.Windows.Forms.Panel
$logControls.Dock = [System.Windows.Forms.DockStyle]::Fill
$logsLayout.Controls.Add($logControls, 0, 0)

$btnClearLogs = New-Object System.Windows.Forms.Button
$btnClearLogs.Text = "Logları Temizle"
$btnClearLogs.Size = New-Object System.Drawing.Size(120, 30)
$btnClearLogs.Location = New-Object System.Drawing.Point(15, 5)
$btnClearLogs.Font = $fontSmall
$logControls.Controls.Add($btnClearLogs)

$btnExportLogs = New-Object System.Windows.Forms.Button
$btnExportLogs.Text = "Dışa Aktar"
$btnExportLogs.Size = New-Object System.Drawing.Size(120, 30)
$btnExportLogs.Location = New-Object System.Drawing.Point(150, 5)
$btnExportLogs.Font = $fontSmall
$logControls.Controls.Add($btnExportLogs)

$cmbLogLevel = New-Object System.Windows.Forms.ComboBox
$cmbLogLevel.Size = New-Object System.Drawing.Size(100, 30)
$cmbLogLevel.Location = New-Object System.Drawing.Point(300, 5)
$cmbLogLevel.Font = $fontSmall
$cmbLogLevel.DropDownStyle = [System.Windows.Forms.ComboBoxStyle]::DropDownList
$cmbLogLevel.Items.AddRange(@("Tümü", "Bilgi", "Başarı", "Uyarı", "Hata"))
$cmbLogLevel.SelectedIndex = 0
$logControls.Controls.Add($cmbLogLevel)

# Log TextBox
$txtLogs = New-Object System.Windows.Forms.TextBox
$txtLogs.Multiline = $true
$txtLogs.ScrollBars = "Vertical"
$txtLogs.ReadOnly = $true
$txtLogs.Dock = [System.Windows.Forms.DockStyle]::Fill
$txtLogs.Font = $fontMono
$txtLogs.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 30)
$txtLogs.ForeColor = [System.Drawing.Color]::LightGray
$txtLogs.BorderStyle = [System.Windows.Forms.BorderStyle]::None
$logsLayout.Controls.Add($txtLogs, 0, 1)

# Config Tab
$configLayout = New-Object System.Windows.Forms.TableLayoutPanel
$configLayout.Dock = [System.Windows.Forms.DockStyle]::Fill
$configLayout.RowCount = 3
$configLayout.ColumnCount = 2
$configLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Absolute, 40)))
$configLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Percent, 100)))
$configLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Absolute, 50)))
$configLayout.ColumnStyles.Add((New-Object System.Windows.Forms.ColumnStyle([System.Windows.Forms.SizeType]::Percent, 50)))
$configLayout.ColumnStyles.Add((New-Object System.Windows.Forms.ColumnStyle([System.Windows.Forms.SizeType]::Percent, 50)))
$tabs.config.Controls.Add($configLayout)

# Config Controls
$btnLoadConfig = New-Object System.Windows.Forms.Button
$btnLoadConfig.Text = "Yapılandırmayı Yükle"
$btnLoadConfig.Size = New-Object System.Drawing.Size(150, 30)
$btnLoadConfig.Location = New-Object System.Drawing.Point(15, 5)
$btnLoadConfig.Font = $fontSmall
$configLayout.Controls.Add($btnLoadConfig, 0, 0)

$btnSaveConfig = New-Object System.Windows.Forms.Button
$btnSaveConfig.Text = "Yapılandırmayı Kaydet"
$btnSaveConfig.Size = New-Object System.Drawing.Size(150, 30)
$btnSaveConfig.Location = New-Object System.Drawing.Point(180, 5)
$btnSaveConfig.Font = $fontSmall
$configLayout.Controls.Add($btnSaveConfig, 0, 0)

# Config TextBox
$txtConfig = New-Object System.Windows.Forms.TextBox
$txtConfig.Multiline = $true
$txtConfig.ScrollBars = "Vertical"
$txtConfig.Dock = [System.Windows.Forms.DockStyle]::Fill
$txtConfig.Font = $fontMono
$txtConfig.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 30)
$txtConfig.ForeColor = [System.Drawing.Color]::LightGray
$txtConfig.BorderStyle = [System.Windows.Forms.BorderStyle]::None
$configLayout.SetColumnSpan($txtConfig, 2)
$configLayout.Controls.Add($txtConfig, 0, 1)

# About Tab
$aboutLayout = New-Object System.Windows.Forms.TableLayoutPanel
$aboutLayout.Dock = [System.Windows.Forms.DockStyle]::Fill
$aboutLayout.RowCount = 3
$aboutLayout.ColumnCount = 1
$aboutLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Percent, 30)))
$aboutLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Percent, 40)))
$aboutLayout.RowStyles.Add((New-Object System.Windows.Forms.RowStyle([System.Windows.Forms.SizeType]::Percent, 30)))
$tabs.about.Controls.Add($aboutLayout)

# About Content
$lblAboutTitle = New-Object System.Windows.Forms.Label
$lblAboutTitle.Text = "Varsagel Ultra Kontrol Paneli v2.0"
$lblAboutTitle.Font = $fontHeader
$lblAboutTitle.Dock = [System.Windows.Forms.DockStyle]::Fill
$lblAboutTitle.TextAlign = [System.Drawing.ContentAlignment]::MiddleCenter
$aboutLayout.Controls.Add($lblAboutTitle, 0, 0)

$lblAboutDesc = New-Object System.Windows.Forms.Label
$lblAboutDesc.Text = "Gelişmiş sunucu yönetim arayüzü`nModern tasarım ve gelişmiş özelliklerle donatılmıştır.`n`nGeliştirici: AI Assistant`nSürüm: 2.0.0"
$lblAboutDesc.Font = $fontNormal
$lblAboutDesc.Dock = [System.Windows.Forms.DockStyle]::Fill
$lblAboutDesc.TextAlign = [System.Drawing.ContentAlignment]::MiddleCenter
$aboutLayout.Controls.Add($lblAboutDesc, 0, 1)

# Menu Buttons
$menuButtons = @()
$menuItems = @(
    @{Text = "Ana Sayfa"; Tag = "dashboard"; Icon = "[H]"},
    @{Text = "Istatistikler"; Tag = "stats"; Icon = "[S]"},
    @{Text = "Gunlukler"; Tag = "logs"; Icon = "[L]"},
    @{Text = "Yapilandirma"; Tag = "config"; Icon = "[C]"},
    @{Text = "Hakkinda"; Tag = "about"; Icon = "[A]"}
)

for ($i = 0; $i -lt $menuItems.Count; $i++) {
    $btnMenu = New-Object System.Windows.Forms.Button
    $btnMenu.Text = "$($menuItems[$i].Icon) $($menuItems[$i].Text)"
    $btnMenu.Size = New-Object System.Drawing.Size(180, 45)
    $btnMenu.Location = New-Object System.Drawing.Point(10, (10 + ($i * 55)))
    $btnMenu.Font = $fontNormal
    $btnMenu.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
    $btnMenu.FlatAppearance.BorderSize = 0
    $btnMenu.Tag = $menuItems[$i].Tag
    $pnlMenu.Controls.Add($btnMenu)
    $menuButtons += $btnMenu
}

# --- FONKSİYONLAR ---

function Apply-Theme($themeName) {
    $script:currentTheme = $themeName.ToLower()
    $theme = $themes[$script:currentTheme]
    
    # Form arka planı
    $form.BackColor = $theme.background
    $pnlHeader.BackColor = $theme.panel
    $pnlMenu.BackColor = $theme.panel
    
    # Metin renkleri
    $lblTitle.ForeColor = $theme.primary
    $lblSubtitle.ForeColor = $theme.textDim
    $lblClock.ForeColor = $theme.textDim
    
    # Status cards
    foreach ($card in $statusCards) {
        $card.Panel.BackColor = $theme.panel
        $card.Title.ForeColor = $theme.text
        $card.Value.ForeColor = $theme.text
    }
    
    # Quick actions panel
    $quickActionsPanel.BackColor = $theme.panel
    $lblQuickTitle.ForeColor = $theme.text
    
    # Log textbox
    if ($script:currentTheme -eq "dark") {
        $txtLogs.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 30)
        $txtLogs.ForeColor = [System.Drawing.Color]::LightGray
    } else {
        $txtLogs.BackColor = [System.Drawing.Color]::White
        $txtLogs.ForeColor = $theme.text
    }
    
    # Config textbox
    if ($script:currentTheme -eq "dark") {
        $txtConfig.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 30)
        $txtConfig.ForeColor = [System.Drawing.Color]::LightGray
    } else {
        $txtConfig.BackColor = [System.Drawing.Color]::White
        $txtConfig.ForeColor = $theme.text
    }
    
    # Menu buttons
    foreach ($btn in $menuButtons) {
        $btn.BackColor = $theme.panel
        $btn.ForeColor = $theme.text
    }
    
    # Action buttons
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
    
    Log-Message "Tema değiştirildi: $themeName" "INFO"
}

function Log-Message($msg, $type = "INFO") {
    $timestamp = Get-Date -Format "HH:mm:ss"
    $logEntry = "[$timestamp] [$type] $msg`r`n"
    
    # Log dosyasına yaz
    $logFile = "$script:projectRoot\logs\panel.log"
    $logDir = Split-Path -Parent $logFile
    if (!(Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
    "[$timestamp] [$type] $msg" | Out-File -FilePath $logFile -Append
    
    # Textbox'a ekle
    if ($txtLogs.Lines.Count -gt $script:maxLogLines) {
        $lines = $txtLogs.Lines
        $txtLogs.Lines = $lines[($lines.Count - $script:maxLogLines + 100)..($lines.Count - 1)]
    }
    
    $txtLogs.AppendText($logEntry)
    $txtLogs.ScrollToCaret()
}

function Update-SystemInfo {
    try {
        # CPU Kullanımı
        $cpu = Get-WmiObject -Class Win32_Processor | Select-Object -First 1
        $cpuUsage = if ($cpu.LoadPercentage) { $cpu.LoadPercentage } else { 0 }
        
        # RAM Kullanımı
        $mem = Get-WmiObject -Class Win32_OperatingSystem
        $totalRAM = [math]::Round($mem.TotalVisibleMemorySize / 1MB, 2)
        $freeRAM = [math]::Round($mem.FreePhysicalMemory / 1MB, 2)
        $usedRAM = $totalRAM - $freeRAM
        $ramPercentage = [math]::Round(($usedRAM / $totalRAM) * 100, 1)
        
        # Disk Kullanımı
        $disk = Get-WmiObject -Class Win32_LogicalDisk | Where-Object { $_.DeviceID -eq "C:" }
        $diskTotal = [math]::Round($disk.Size / 1GB, 2)
        $diskFree = [math]::Round($disk.FreeSpace / 1GB, 2)
        $diskUsed = $diskTotal - $diskFree
        $diskPercentage = [math]::Round(($diskUsed / $diskTotal) * 100, 1)
        
        # Status cards güncelle
        $statusCards[2].Value.Text = "%$cpuUsage"
        $statusCards[3].Value.Text = "%$ramPercentage ($([math]::Round($usedRAM, 1))) GB"
        
        # Performans verisi topla
        $perfData = @{
            Timestamp = Get-Date
            CPU = $cpuUsage
            RAM = $ramPercentage
            Disk = $diskPercentage
            Port = $script:activePort
        }
        
        $script:performanceData += $perfData
        if ($script:performanceData.Count -gt 100) {
            $script:performanceData = $script:performanceData[($script:performanceData.Count - 100)..($script:performanceData.Count - 1)]
        }
        
    } catch {
        Log-Message "Sistem bilgileri güncellenemedi: $($_.Exception.Message)" "ERROR"
    }
}

function Update-Status {
    try {
        $portHTTP = 3000
        $portAlt = 3004
        $portHTTPS = 443
        
        $connHTTP = Get-NetTCPConnection -LocalPort $portHTTP -State Listen -ErrorAction SilentlyContinue
        $connAlt = Get-NetTCPConnection -LocalPort $portAlt -State Listen -ErrorAction SilentlyContinue
        $connHTTPS = Get-NetTCPConnection -LocalPort $portHTTPS -State Listen -ErrorAction SilentlyContinue
        
        $theme = $themes[$script:currentTheme]
        
        if ($connAlt) {
            $script:activePort = 3004
            $statusCards[0].Value.Text = "AKTİF"
            $statusCards[0].Value.ForeColor = $theme.success
            $statusCards[1].Value.Text = "3004 (Geliştirme)"
            $statusLabel.Text = "Sunucu çalışıyor - Port 3004"
            Log-Message "Sunucu 3004 portunda aktif" "SUCCESS"
        } elseif ($connHTTP) {
            $script:activePort = 3000
            $statusCards[0].Value.Text = "AKTİF"
            $statusCards[0].Value.ForeColor = $theme.success
            $statusCards[1].Value.Text = "3000 (Geliştirme)"
            $statusLabel.Text = "Sunucu çalışıyor - Port 3000"
            Log-Message "Sunucu 3000 portunda aktif" "SUCCESS"
        } elseif ($connHTTPS) {
            $script:activePort = 443
            $statusCards[0].Value.Text = "AKTİF"
            $statusCards[0].Value.ForeColor = $theme.success
            $statusCards[1].Value.Text = "443 (HTTPS)"
            $statusLabel.Text = "Sunucu çalışıyor - Port 443"
            Log-Message "Sunucu 443 portunda aktif" "SUCCESS"
        } else {
            $script:activePort = 0
            $statusCards[0].Value.Text = "DURDU"
            $statusCards[0].Value.ForeColor = $theme.danger
            $statusCards[1].Value.Text = "-"
            $statusLabel.Text = "Sunucu durdu"
            Log-Message "Sunucu durdu" "WARNING"
        }
        
    } catch {
        Log-Message "Durum güncellenemedi: $($_.Exception.Message)" "ERROR"
    }
}

function Start-Server($mode) {
    Update-Status
    if ($script:activePort -ne 0) {
        Log-Message "HATA: Sunucu zaten çalışıyor (Port: $script:activePort)" "ERROR"
        [System.Windows.Forms.MessageBox]::Show("Sunucu zaten çalışıyor. Önce durdurun.", "Uyarı", "OK", "Warning")
        return
    }

    if ($mode -eq "start") {
        $result = [System.Windows.Forms.MessageBox]::Show("Uygulamada değişiklik yaptıysanız önce Build almanız gerekir.`n`nŞimdi Build alınsın mı?", "Build Onayı", "YesNo", "Question")
        if ($result -eq "Yes") {
             Log-Message "Build işlemi başlatılıyor..." "INFO"
             Run-Command "npm run build" "Build Alınıyor..."
             Log-Message "Build işlemi başlatıldı. Lütfen build penceresi kapanana kadar bekleyin." "INFO"
             return
        }
    }

    if ($mode -eq "dev") {
        Log-Message "Geliştirici modu için önbellek temizleniyor..." "INFO"
        Clean-Cache -silent $true
    }

    Log-Message "Sunucu başlatılıyor ($mode)..." "INFO"
    
    # Eski kilit dosyalarını temizle
    $lockFile = "$script:projectRoot\.next\dev\lock"
    if (Test-Path $lockFile) {
        try {
            Remove-Item $lockFile -Force -ErrorAction SilentlyContinue
            Log-Message "Eski kilit dosyası temizlendi" "INFO"
        } catch {
            Log-Message "Kilit dosyası temizlenemedi" "WARNING"
        }
    }

    $cmd = "cmd /c `"set PORT=3004 && npm run $mode`""
    Start-Process "cmd.exe" -ArgumentList "/k title Varsagel Server & $cmd"
    
    Log-Message "Sunucu penceresi açıldı" "SUCCESS"
    Start-Sleep -Seconds 3
    Update-Status
}

function Stop-Server {
    Log-Message "Sunucu durduruluyor..." "INFO"
    $ports = @(443, 3000, 3004)
    
    for ($i = 0; $i -lt 3; $i++) {
        $anyRunning = $false
        
        foreach ($port in $ports) {
            $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
            
            if ($connections) {
                $anyRunning = $true
                foreach ($conn in $connections) {
                    try {
                        if ($conn.OwningProcess -gt 4) {
                            $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                            if ($proc) {
                                Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
                                Log-Message "İşlem sonlandırıldı: $($proc.ProcessName) (PID: $($proc.Id))" "INFO"
                            }
                        }
                    } catch {
                        # Hataları yok say
                    }
                }
            }
        }
        
        if (-not $anyRunning) {
            Log-Message "Tüm işlemler sonlandırıldı" "SUCCESS"
            break
        }
        
        Start-Sleep -Milliseconds 500
    }
    
    # Sunucu penceresini kapat
    $serverTitle = "Varsagel Server"
    Get-Process | Where-Object { $_.MainWindowTitle -eq $serverTitle } | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            Log-Message "Sunucu penceresi kapatıldı" "INFO"
        } catch {
             # Hataları yok say
        }
    }

    Update-Status
    if ($script:activePort -ne 0) {
        Log-Message "Bazı işlemler durdurulamadı" "WARNING"
    } else {
        Log-Message "Sunucu başarıyla durduruldu" "SUCCESS"
    }
}

function Open-Website {
    if ($script:activePort -gt 0) {
        Start-Process "https://www.varsagel.com"
        Log-Message "Site açıldı: www.varsagel.com" "INFO"
    } else {
        Log-Message "Sunucu çalışmıyor, site açılamıyor" "WARNING"
        [System.Windows.Forms.MessageBox]::Show("Sunucu çalışmıyor. Önce sunucuyu başlatın.", "Uyarı", "OK", "Warning")
    }
}

function Run-Command($command, $desc) {
    Log-Message "$desc" "INFO"
    Start-Process "cmd.exe" -ArgumentList "/c", "$command", "&", "pause"
}

function Clean-Cache {
    param([bool]$silent = $false)
    Log-Message ".next klasörü temizleniyor..." "INFO"
    if (Test-Path "$script:projectRoot\.next") {
        try {
            Remove-Item "$script:projectRoot\.next" -Recurse -Force -ErrorAction Stop
            Log-Message ".next klasörü temizlendi" "SUCCESS"
        } catch {
            Log-Message ".next klasörü temizlenemedi" "ERROR"
            if (-not $silent) {
                [System.Windows.Forms.MessageBox]::Show("Klasör silinemedi. Lütfen önce sunucuyu durdurun.", "Hata", "OK", "Error")
            }
        }
    } else {
        Log-Message ".next klasörü zaten yok" "INFO"
    }
}

function Update-Clock {
    $lblClock.Text = Get-Date -Format "HH:mm:ss"
}

function Show-Logs {
    $logPath = "$script:projectRoot\logs\error.log"
    if (Test-Path $logPath) {
        Log-Message "Hata kayıtları açılıyor..." "INFO"
        Start-Process "notepad.exe" -ArgumentList $logPath
    } else {
        Log-Message "Henüz hata kaydı yok" "INFO"
        [System.Windows.Forms.MessageBox]::Show("Henüz bir hata kaydı oluşmamış.", "Bilgi", "OK", "Information")
    }
}

function Load-Config {
    try {
        $configPath = "$script:projectRoot\next.config.ts"
        if (Test-Path $configPath) {
            $content = Get-Content $configPath -Raw
            $txtConfig.Text = $content
            Log-Message "Yapılandırma dosyası yüklendi" "SUCCESS"
        } else {
            Log-Message "Yapılandırma dosyası bulunamadı" "WARNING"
            $txtConfig.Text = "// Yapılandırma dosyası bulunamadı"
        }
    } catch {
        Log-Message "Yapılandırma yüklenemedi: $($_.Exception.Message)" "ERROR"
    }
}

function Save-Config {
    try {
        $configPath = "$script:projectRoot\next.config.ts"
        $content = $txtConfig.Text
        
        # Yedek al
        $backupPath = "$configPath.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        if (Test-Path $configPath) {
            Copy-Item $configPath $backupPath -Force
            Log-Message "Yedek dosyası oluşturuldu: $backupPath" "INFO"
        }
        
        $content | Out-File $configPath -Encoding UTF8 -Force
        Log-Message "Yapılandırma dosyası kaydedildi" "SUCCESS"
        
        [System.Windows.Forms.MessageBox]::Show("Yapılandırma kaydedildi. Değişikliklerin geçerli olması için sunucuyu yeniden başlatın.", "Bilgi", "OK", "Information")
        
    } catch {
        Log-Message "Yapılandırma kaydedilemedi: $($_.Exception.Message)" "ERROR"
        [System.Windows.Forms.MessageBox]::Show("Yapılandırma kaydedilemedi: $($_.Exception.Message)", "Hata", "OK", "Error")
    }
}

function Switch-Tab($tabName) {
    $index = 0
    switch ($tabName) {
        "dashboard" { $index = 0 }
        "stats" { $index = 1 }
        "logs" { $index = 2 }
        "config" { $index = 3 }
        "about" { $index = 4 }
    }
    
    $tabControl.SelectedIndex = $index
    Log-Message "Sekme değiştirildi: $tabName" "INFO"
}

function Clear-Logs {
    $txtLogs.Clear()
    Log-Message "Günlükler temizlendi" "INFO"
}

function Export-Logs {
    $saveDialog = New-Object System.Windows.Forms.SaveFileDialog
    $saveDialog.Filter = "Text Files (*.txt)|*.txt|Log Files (*.log)|*.log|All Files (*.*)|*.*"
    $saveDialog.FileName = "varsagel_panel_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
    
    if ($saveDialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
        $txtLogs.Text | Out-File $saveDialog.FileName -Encoding UTF8
        Log-Message "Günlükler dışa aktarıldı: $($saveDialog.FileName)" "SUCCESS"
    }
}

# Buton Olayları
$actionButtons[0].Add_Click({ Start-Server "dev" })
$actionButtons[1].Add_Click({ Start-Server "start" })
$actionButtons[2].Add_Click({ Stop-Server })
$actionButtons[3].Add_Click({ Open-Website })
$actionButtons[4].Add_Click({ Run-Command "npm run build" "Build Alınıyor..." })
$actionButtons[5].Add_Click({ Clean-Cache })

$cmbTheme.Add_SelectedIndexChanged({
    $themeNames = @("dark", "light", "blue")
    Apply-Theme $themeNames[$cmbTheme.SelectedIndex]
})

$btnClearLogs.Add_Click({ Clear-Logs })
$btnExportLogs.Add_Click({ Export-Logs })
$btnLoadConfig.Add_Click({ Load-Config })
$btnSaveConfig.Add_Click({ Save-Config })

# Menu butonları
foreach ($btn in $menuButtons) {
    $btn.Add_Click({
        $tag = $this.Tag
        Switch-Tab $tag
        
        # Aktif butonu vurgula
        foreach ($b in $menuButtons) {
            $b.Font = $fontNormal
        }
        $this.Font = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
    })
}

# Timer'lar
$clockTimer = New-Object System.Windows.Forms.Timer
$clockTimer.Interval = 1000
$clockTimer.Add_Tick({ Update-Clock })

$statusTimer = New-Object System.Windows.Forms.Timer
$statusTimer.Interval = 2000
$statusTimer.Add_Tick({ 
    Update-Status
    Update-SystemInfo
})

$perfTimer = New-Object System.Windows.Forms.Timer
$perfTimer.Interval = 5000
$perfTimer.Add_Tick({
    # Performans verisini güncelle
    Update-SystemInfo
})

# Başlangıç
Log-Message "Varsagel Ultra Kontrol Paneli başlatıldı" "SUCCESS"
Log-Message "Gelişmiş yönetim arayüzü aktif" "INFO"

# Tema uygula
Apply-Theme "dark"

# İlk sekme
Switch-Tab "dashboard"
$menuButtons[0].Font = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)

# Timer'ları başlat
$clockTimer.Start()
$statusTimer.Start()
$perfTimer.Start()

# İlk güncelleme
Update-Status
Update-SystemInfo
Update-Clock

# Form göster
$form.ShowDialog()

# Temizlik
$clockTimer.Stop()
$statusTimer.Stop()
$perfTimer.Stop()

Log-Message "Panel kapatıldı" "INFO"