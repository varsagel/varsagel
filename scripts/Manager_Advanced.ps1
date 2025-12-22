# Gelişmiş Varsagel Panel - Modern UI
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Ana Form
$form = New-Object System.Windows.Forms.Form
$form.Text = "Varsagel Kontrol Paneli - Gelişmiş"
$form.Size = New-Object System.Drawing.Size(900, 700)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedSingle"
$form.MaximizeBox = $false
$form.BackColor = [System.Drawing.Color]::FromArgb(45, 45, 48)

# Fontlar
$fontTitle = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$fontHeader = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
$fontNormal = New-Object System.Drawing.Font("Segoe UI", 10)
$fontSmall = New-Object System.Drawing.Font("Segoe UI", 9)

# Renkler
$colPrimary = [System.Drawing.Color]::FromArgb(0, 122, 204)
$colSuccess = [System.Drawing.Color]::FromArgb(46, 204, 113)
$colWarning = [System.Drawing.Color]::FromArgb(241, 196, 15)
$colDanger = [System.Drawing.Color]::FromArgb(231, 76, 60)
$colText = [System.Drawing.Color]::FromArgb(220, 220, 220)
$colTextDim = [System.Drawing.Color]::FromArgb(160, 160, 160)
$colPanel = [System.Drawing.Color]::FromArgb(37, 37, 38)
$colHover = [System.Drawing.Color]::FromArgb(62, 62, 66)

# Başlık Paneli
$pnlHeader = New-Object System.Windows.Forms.Panel
$pnlHeader.Size = New-Object System.Drawing.Size(900, 80)
$pnlHeader.Location = New-Object System.Drawing.Point(0, 0)
$pnlHeader.BackColor = $colPanel
$form.Controls.Add($pnlHeader)

# Logo ve Başlık
$lblTitle = New-Object System.Windows.Forms.Label
$lblTitle.Text = "VARSAGEL"
$lblTitle.Font = $fontTitle
$lblTitle.ForeColor = $colPrimary
$lblTitle.Location = New-Object System.Drawing.Point(20, 25)
$lblTitle.AutoSize = $true
$pnlHeader.Controls.Add($lblTitle)

$lblSubtitle = New-Object System.Windows.Forms.Label
$lblSubtitle.Text = "Kontrol Paneli"
$lblSubtitle.Font = $fontNormal
$lblSubtitle.ForeColor = $colTextDim
$lblSubtitle.Location = New-Object System.Drawing.Point(140, 32)
$lblSubtitle.AutoSize = $true
$pnlHeader.Controls.Add($lblSubtitle)

# Saat ve Tarih
$lblClock = New-Object System.Windows.Forms.Label
$lblClock.Font = $fontSmall
$lblClock.ForeColor = $colTextDim
$lblClock.Location = New-Object System.Drawing.Point(750, 25)
$lblClock.AutoSize = $true
$pnlHeader.Controls.Add($lblClock)

# Ana İçerik Alanı
$pnlMain = New-Object System.Windows.Forms.Panel
$pnlMain.Size = New-Object System.Drawing.Size(860, 580)
$pnlMain.Location = New-Object System.Drawing.Point(20, 100)
$pnlMain.BackColor = $colPanel
$form.Controls.Add($pnlMain)

# Sol Menü Paneli
$pnlMenu = New-Object System.Windows.Forms.Panel
$pnlMenu.Size = New-Object System.Drawing.Size(200, 580)
$pnlMenu.Location = New-Object System.Drawing.Point(0, 0)
$pnlMenu.BackColor = $colPanel
$pnlMain.Controls.Add($pnlMenu)

# İçerik Alanı
$pnlContent = New-Object System.Windows.Forms.Panel
$pnlContent.Size = New-Object System.Drawing.Size(660, 580)
$pnlContent.Location = New-Object System.Drawing.Point(200, 0)
$pnlContent.BackColor = $colPanel
$pnlMain.Controls.Add($pnlContent)

# Durum Göstergesi (Ana Sayfa)
$pnlStatus = New-Object System.Windows.Forms.Panel
$pnlStatus.Size = New-Object System.Drawing.Size(620, 120)
$pnlStatus.Location = New-Object System.Drawing.Point(20, 20)
$pnlStatus.BackColor = [System.Drawing.Color]::FromArgb(45, 45, 48)
$pnlStatus.BorderStyle = [System.Windows.Forms.BorderStyle]::None
$pnlContent.Controls.Add($pnlStatus)

# Durum Başlığı
$lblStatusTitle = New-Object System.Windows.Forms.Label
$lblStatusTitle.Text = "Sunucu Durumu"
$lblStatusTitle.Font = $fontHeader
$lblStatusTitle.ForeColor = $colText
$lblStatusTitle.Location = New-Object System.Drawing.Point(20, 15)
$lblStatusTitle.AutoSize = $true
$pnlStatus.Controls.Add($lblStatusTitle)

# Ana Durum Göstergesi
$lblMainStatus = New-Object System.Windows.Forms.Label
$lblMainStatus.Font = New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Bold)
$lblMainStatus.Location = New-Object System.Drawing.Point(20, 50)
$lblMainStatus.AutoSize = $true
$pnlStatus.Controls.Add($lblMainStatus)

# Port Bilgisi
$lblPortInfo = New-Object System.Windows.Forms.Label
$lblPortInfo.Font = $fontNormal
$lblPortInfo.ForeColor = $colTextDim
$lblPortInfo.Location = New-Object System.Drawing.Point(200, 55)
$lblPortInfo.AutoSize = $true
$pnlStatus.Controls.Add($lblPortInfo)

# CPU ve RAM Kullanımı
$lblCPU = New-Object System.Windows.Forms.Label
$lblCPU.Font = $fontSmall
$lblCPU.ForeColor = $colTextDim
$lblCPU.Location = New-Object System.Drawing.Point(400, 30)
$lblCPU.AutoSize = $true
$pnlStatus.Controls.Add($lblCPU)

$lblRAM = New-Object System.Windows.Forms.Label
$lblRAM.Font = $fontSmall
$lblRAM.ForeColor = $colTextDim
$lblRAM.Location = New-Object System.Drawing.Point(400, 55)
$lblRAM.AutoSize = $true
$pnlStatus.Controls.Add($lblRAM)

# Hızlı İşlemler Paneli
$pnlQuickActions = New-Object System.Windows.Forms.Panel
$pnlQuickActions.Size = New-Object System.Drawing.Size(620, 200)
$pnlQuickActions.Location = New-Object System.Drawing.Point(20, 160)
$pnlQuickActions.BackColor = [System.Drawing.Color]::FromArgb(45, 45, 48)
$pnlContent.Controls.Add($pnlQuickActions)

$lblQuickTitle = New-Object System.Windows.Forms.Label
$lblQuickTitle.Text = "Hizli Islemler"
$lblQuickTitle.Font = $fontHeader
$lblQuickTitle.ForeColor = $colText
$lblQuickTitle.Location = New-Object System.Drawing.Point(20, 15)
$lblQuickTitle.AutoSize = $true
$pnlQuickActions.Controls.Add($lblQuickTitle)

# Modern Butonlar
$btnStartDev = New-Object System.Windows.Forms.Button
$btnStartDev.Text = "Gelistirici Modu"
$btnStartDev.Size = New-Object System.Drawing.Size(180, 45)
$btnStartDev.Location = New-Object System.Drawing.Point(20, 60)
$btnStartDev.Font = $fontNormal
$btnStartDev.BackColor = $colPrimary
$btnStartDev.ForeColor = [System.Drawing.Color]::White
$btnStartDev.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnStartDev.FlatAppearance.BorderSize = 0
$pnlQuickActions.Controls.Add($btnStartDev)

$btnStartProd = New-Object System.Windows.Forms.Button
$btnStartProd.Text = "Canli Modu"
$btnStartProd.Size = New-Object System.Drawing.Size(180, 45)
$btnStartProd.Location = New-Object System.Drawing.Point(220, 60)
$btnStartProd.Font = $fontNormal
$btnStartProd.BackColor = $colSuccess
$btnStartProd.ForeColor = [System.Drawing.Color]::White
$btnStartProd.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnStartProd.FlatAppearance.BorderSize = 0
$pnlQuickActions.Controls.Add($btnStartProd)

$btnStop = New-Object System.Windows.Forms.Button
$btnStop.Text = "Durdur"
$btnStop.Size = New-Object System.Drawing.Size(180, 45)
$btnStop.Location = New-Object System.Drawing.Point(420, 60)
$btnStop.Font = $fontNormal
$btnStop.BackColor = $colDanger
$btnStop.ForeColor = [System.Drawing.Color]::White
$btnStop.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnStop.FlatAppearance.BorderSize = 0
$pnlQuickActions.Controls.Add($btnStop)

$btnOpenSite = New-Object System.Windows.Forms.Button
$btnOpenSite.Text = "Siteyi Ac"
$btnOpenSite.Size = New-Object System.Drawing.Size(180, 45)
$btnOpenSite.Location = New-Object System.Drawing.Point(20, 120)
$btnOpenSite.Font = $fontNormal
$btnOpenSite.BackColor = [System.Drawing.Color]::FromArgb(52, 152, 219)
$btnOpenSite.ForeColor = [System.Drawing.Color]::White
$btnOpenSite.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnOpenSite.FlatAppearance.BorderSize = 0
$pnlQuickActions.Controls.Add($btnOpenSite)

$btnBuild = New-Object System.Windows.Forms.Button
$btnBuild.Text = "Build Al"
$btnBuild.Size = New-Object System.Drawing.Size(180, 45)
$btnBuild.Location = New-Object System.Drawing.Point(220, 120)
$btnBuild.Font = $fontNormal
$btnBuild.BackColor = [System.Drawing.Color]::FromArgb(155, 89, 182)
$btnBuild.ForeColor = [System.Drawing.Color]::White
$btnBuild.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnBuild.FlatAppearance.BorderSize = 0
$pnlQuickActions.Controls.Add($btnBuild)

$btnClean = New-Object System.Windows.Forms.Button
$btnClean.Text = "Onbellegi Temizle"
$btnClean.Size = New-Object System.Drawing.Size(180, 45)
$btnClean.Location = New-Object System.Drawing.Point(420, 120)
$btnClean.Font = $fontNormal
$btnClean.BackColor = [System.Drawing.Color]::FromArgb(243, 156, 18)
$btnClean.ForeColor = [System.Drawing.Color]::White
$btnClean.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnClean.FlatAppearance.BorderSize = 0
$pnlQuickActions.Controls.Add($btnClean)

# Log ve İstatistikler Paneli
$pnlLogs = New-Object System.Windows.Forms.Panel
$pnlLogs.Size = New-Object System.Drawing.Size(620, 180)
$pnlLogs.Location = New-Object System.Drawing.Point(20, 380)
$pnlLogs.BackColor = [System.Drawing.Color]::FromArgb(45, 45, 48)
$pnlContent.Controls.Add($pnlLogs)

$lblLogsTitle = New-Object System.Windows.Forms.Label
$lblLogsTitle.Text = "Sistem Gunlugu"
$lblLogsTitle.Font = $fontHeader
$lblLogsTitle.ForeColor = $colText
$lblLogsTitle.Location = New-Object System.Drawing.Point(20, 15)
$lblLogsTitle.AutoSize = $true
$pnlLogs.Controls.Add($lblLogsTitle)

# Log TextBox
$txtLogs = New-Object System.Windows.Forms.TextBox
$txtLogs.Multiline = $true
$txtLogs.ScrollBars = "Vertical"
$txtLogs.ReadOnly = $true
$txtLogs.Location = New-Object System.Drawing.Point(20, 50)
$txtLogs.Size = New-Object System.Drawing.Size(580, 120)
$txtLogs.Font = $fontSmall
$txtLogs.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 30)
$txtLogs.ForeColor = $colText
$txtLogs.BorderStyle = [System.Windows.Forms.BorderStyle]::None
$pnlLogs.Controls.Add($txtLogs)

# Sol Menü Butonları
$menuButtons = @()
$menuItems = @(
    @{Text="Ana Sayfa"; Tag="home"},
    @{Text="Istatistikler"; Tag="stats"},
    @{Text="Yapilandirma"; Tag="config"},
    @{Text="Loglar"; Tag="logs"},
    @{Text="Hakkinda"; Tag="about"}
)

for ($i = 0; $i -lt $menuItems.Count; $i++) {
    $btnMenu = New-Object System.Windows.Forms.Button
    $btnMenu.Text = $menuItems[$i].Text
    $btnMenu.Size = New-Object System.Drawing.Size(180, 45)
    $btnMenu.Location = New-Object System.Drawing.Point(10, (10 + ($i * 55)))
    $btnMenu.Font = $fontNormal
    $btnMenu.BackColor = $colPanel
    $btnMenu.ForeColor = $colText
    $btnMenu.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
    $btnMenu.FlatAppearance.BorderSize = 0
    $btnMenu.Tag = $menuItems[$i].Tag
    $pnlMenu.Controls.Add($btnMenu)
    $menuButtons += $btnMenu
}

# Status Bar
$statusBar = New-Object System.Windows.Forms.StatusStrip
$statusLabel = New-Object System.Windows.Forms.ToolStripStatusLabel
$statusLabel.Text = "Hazir"
$statusBar.Items.Add($statusLabel)
$form.Controls.Add($statusBar)

# --- FONKSIYONLAR ---

function Log-Message($msg, $type = "INFO") {
    $timestamp = Get-Date -Format "HH:mm:ss"
    $logEntry = "[$timestamp] [$type] $msg`r`n"
    $txtLogs.AppendText($logEntry)
    $txtLogs.ScrollToCaret()
}

function Update-SystemInfo {
    # CPU Kullanımı
    $cpu = Get-WmiObject -Class Win32_Processor | Select-Object -First 1
    $cpuUsage = $cpu.LoadPercentage
    $lblCPU.Text = "CPU: %$cpuUsage"
    
    # RAM Kullanımı
    $mem = Get-WmiObject -Class Win32_OperatingSystem
    $totalRAM = [math]::Round($mem.TotalVisibleMemorySize / 1MB, 2)
    $freeRAM = [math]::Round($mem.FreePhysicalMemory / 1MB, 2)
    $usedRAM = $totalRAM - $freeRAM
    $ramPercentage = [math]::Round(($usedRAM / $totalRAM) * 100, 1)
    $lblRAM.Text = "RAM: %$ramPercentage ($([math]::Round($usedRAM, 1))GB / $totalRAM GB)"
}

function Update-Status {
    $portHTTP = 3000
    $portAlt = 3004
    $portHTTPS = 443
    
    $connHTTP = Get-NetTCPConnection -LocalPort $portHTTP -State Listen -ErrorAction SilentlyContinue
    $connAlt = Get-NetTCPConnection -LocalPort $portAlt -State Listen -ErrorAction SilentlyContinue
    $connHTTPS = Get-NetTCPConnection -LocalPort $portHTTPS -State Listen -ErrorAction SilentlyContinue
    
    if ($connAlt) {
        $script:activePort = 3004
        $lblMainStatus.Text = "AKTIF"
        $lblMainStatus.ForeColor = $colSuccess
        $lblPortInfo.Text = "Port: 3004 (Gelistirme)"
        $statusLabel.Text = "Sunucu calisiyor - Port 3004"
        Log-Message "Sunucu 3004 portunda aktif" "SUCCESS"
    } elseif ($connHTTP) {
        $script:activePort = 3000
        $lblMainStatus.Text = "AKTIF"
        $lblMainStatus.ForeColor = $colSuccess
        $lblPortInfo.Text = "Port: 3000 (Gelistirme)"
        $statusLabel.Text = "Sunucu calisiyor - Port 3000"
        Log-Message "Sunucu 3000 portunda aktif" "SUCCESS"
    } elseif ($connHTTPS) {
        $script:activePort = 443
        $lblMainStatus.Text = "AKTIF"
        $lblMainStatus.ForeColor = $colSuccess
        $lblPortInfo.Text = "Port: 443 (HTTPS)"
        $statusLabel.Text = "Sunucu calisiyor - Port 443"
        Log-Message "Sunucu 443 portunda aktif" "SUCCESS"
    } else {
        $script:activePort = 0
        $lblMainStatus.Text = "DURDU"
        $lblMainStatus.ForeColor = $colDanger
        $lblPortInfo.Text = "Port: -"
        $statusLabel.Text = "Sunucu durdu"
        Log-Message "Sunucu durdu" "WARNING"
    }
    
    Update-SystemInfo
}

function Start-Server($mode) {
    Update-Status
    if ($script:activePort -ne 0) {
        Log-Message "HATA: Sunucu zaten calisiyor (Port: $script:activePort)" "ERROR"
        [System.Windows.Forms.MessageBox]::Show("Sunucu zaten calisiyor. Once durdurun.", "Uyari", "OK", "Warning")
        return
    }

    if ($mode -eq "start") {
        $result = [System.Windows.Forms.MessageBox]::Show("Uygulamada degisiklik yaptiysaniz once Build almaniz gerekir.`n`nSimdi Build alinsin mi?", "Build Onayi", "YesNo", "Question")
        if ($result -eq "Yes") {
             Log-Message "Build islemi baslatiliyor..." "INFO"
             Run-Command "npm run build" "Build Aliniyor..."
             Log-Message "Build islemi baslatildi. Lutfen build penceresi kapanana kadar bekleyin." "INFO"
             return
        }
    }

    if ($mode -eq "dev") {
        Log-Message "Gelistirici modu icin onbellek temizleniyor..." "INFO"
        Clean-Cache -silent $true
    }

    Log-Message "Sunucu baslatiliyor ($mode)..." "INFO"
    
    # Eski kilit dosyalarini temizle
    $lockFile = "$projectRoot\.next\dev\lock"
    if (Test-Path $lockFile) {
        try {
            Remove-Item $lockFile -Force -ErrorAction SilentlyContinue
            Log-Message "Eski kilit dosyasi temizlendi" "INFO"
        } catch {
            Log-Message "Kilit dosyasi temizlenemedi" "WARNING"
        }
    }

    $cmd = "cmd /c `"set PORT=3004 && npm run $mode`""
    Start-Process "cmd.exe" -ArgumentList "/k title Varsagel Server & $cmd"
    
    Log-Message "Sunucu penceresi acildi" "SUCCESS"
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
                                Log-Message "Islem sonlandirildi: $($proc.ProcessName) (PID: $($proc.Id))" "INFO"
                            }
                        }
                    } catch {
                        # Hatalari yok say
                    }
                }
            }
        }
        
        if (-not $anyRunning) {
            Log-Message "Tum islemler sonlandirildi" "SUCCESS"
            break
        }
        
        Start-Sleep -Milliseconds 500
    }
    
    # Sunucu penceresini kapat
    $serverTitle = "Varsagel Server"
    Get-Process | Where-Object { $_.MainWindowTitle -eq $serverTitle } | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            Log-Message "Sunucu penceresi kapatildi" "INFO"
        } catch {
             # Hatalari yok say
        }
    }

    Update-Status
    if ($script:activePort -ne 0) {
        Log-Message "Bazi islemler durdurulamadi" "WARNING"
    } else {
        Log-Message "Sunucu basariyla durduruldu" "SUCCESS"
    }
}

function Open-Website {
    if ($script:activePort -gt 0) {
        Start-Process "https://www.varsagel.com"
        Log-Message "Site acildi: www.varsagel.com" "INFO"
    } else {
        Log-Message "Sunucu calismiyor, site acilamiyor" "WARNING"
        [System.Windows.Forms.MessageBox]::Show("Sunucu calismiyor. Once sunucuyu baslatin.", "Uyari", "OK", "Warning")
    }
}

function Run-Command($command, $desc) {
    Log-Message "$desc" "INFO"
    Start-Process "cmd.exe" -ArgumentList "/c", "$command", "&", "pause"
}

function Clean-Cache {
    param([bool]$silent = $false)
    Log-Message ".next klasoru temizleniyor..." "INFO"
    if (Test-Path "$projectRoot\.next") {
        try {
            Remove-Item "$projectRoot\.next" -Recurse -Force -ErrorAction Stop
            Log-Message ".next klasoru temizlendi" "SUCCESS"
        } catch {
            Log-Message ".next klasoru temizlenemedi" "ERROR"
            if (-not $silent) {
                [System.Windows.Forms.MessageBox]::Show("Klasor silinemedi. Lutfen once sunucuyu durdurun.", "Hata", "OK", "Error")
            }
        }
    } else {
        Log-Message ".next klasoru zaten yok" "INFO"
    }
}

function Update-Clock {
    $lblClock.Text = Get-Date -Format "HH:mm:ss"
}

function Show-Logs {
    $logPath = "$projectRoot\logs\error.log"
    if (Test-Path $logPath) {
        Log-Message "Hata kayitlari aciliyor..." "INFO"
        Start-Process "notepad.exe" -ArgumentList $logPath
    } else {
        Log-Message "Henuz hata kaydi yok" "INFO"
        [System.Windows.Forms.MessageBox]::Show("Henuz bir hata kaydi olusmamis.", "Bilgi", "OK", "Information")
    }
}

# Buton Olaylari
$btnStartDev.Add_Click({ Start-Server "dev" })
$btnStartProd.Add_Click({ Start-Server "start" })
$btnStop.Add_Click({ Stop-Server })
$btnOpenSite.Add_Click({ Open-Website })
$btnBuild.Add_Click({ Run-Command "npm run build" "Build Aliniyor..." })
$btnClean.Add_Click({ Clean-Cache })

# Saat Guncelleme Timer'i
$clockTimer = New-Object System.Windows.Forms.Timer
$clockTimer.Interval = 1000
$clockTimer.Add_Tick({ Update-Clock })
$clockTimer.Start()

# Durum Guncelleme Timer'i
$statusTimer = New-Object System.Windows.Forms.Timer
$statusTimer.Interval = 3000
$statusTimer.Add_Tick({ Update-Status })
$statusTimer.Start()

# Baslangic
Log-Message "Varsagel Kontrol Paneli baslatildi" "SUCCESS"
Log-Message "Gelismis yonetim arayuzu aktif" "INFO"
Update-Status
Update-Clock

# Form Goster
$form.ShowDialog()

# Temizlik
$clockTimer.Stop()
$statusTimer.Stop()