Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# --- SINGLE INSTANCE CHECK ---
$uniqueTitle = "Varsagel Manager Active"
try {
    $currentPid = $PID
    Get-Process | Where-Object { $_.MainWindowTitle -eq $uniqueTitle -and $_.Id -ne $currentPid } | ForEach-Object {
        Stop-Process -Id $_.Id -Force
    }
    $host.ui.RawUI.WindowTitle = $uniqueTitle
} catch {
    # Ignore errors in non-standard environments
}

# Set the working directory to the project root
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$projectRoot = Split-Path -Parent $scriptPath
Set-Location $projectRoot

# Ensure logs directory exists
if (-not (Test-Path "$projectRoot\logs")) {
    New-Item -ItemType Directory -Force -Path "$projectRoot\logs" | Out-Null
}

# --- UI CONFIGURATION ---
$form = New-Object System.Windows.Forms.Form
$form.Text = "Varsagel Yonetim Paneli"
$form.Size = New-Object System.Drawing.Size(620, 560)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedDialog"
$form.MaximizeBox = $false
$form.BackColor = [System.Drawing.Color]::FromArgb(240, 242, 245)

# Icons and Fonts
$fontHeader = New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Bold)
$fontNormal = New-Object System.Drawing.Font("Segoe UI", 10)
$fontBold = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$fontSmall = New-Object System.Drawing.Font("Consolas", 9)

# --- COLORS ---
$colGreen = [System.Drawing.Color]::FromArgb(40, 167, 69)
$colBlue = [System.Drawing.Color]::FromArgb(0, 123, 255)
$colRed = [System.Drawing.Color]::FromArgb(220, 53, 69)
$colOrange = [System.Drawing.Color]::FromArgb(253, 126, 20)
$colDark = [System.Drawing.Color]::FromArgb(52, 58, 64)
$colPurple = [System.Drawing.Color]::Purple
$colTeal = [System.Drawing.Color]::Teal
$colWhite = [System.Drawing.Color]::White
$colMaroon = [System.Drawing.Color]::Maroon

# --- HEADER ---
$lblHeader = New-Object System.Windows.Forms.Label
$lblHeader.Text = "Varsagel Kontrol Merkezi"
$lblHeader.Location = New-Object System.Drawing.Point(20, 20)
$lblHeader.Size = New-Object System.Drawing.Size(540, 30)
$lblHeader.Font = $fontHeader
$lblHeader.ForeColor = [System.Drawing.Color]::FromArgb(33, 37, 41)
$form.Controls.Add($lblHeader)

# --- STATUS SECTION ---
$grpStatus = New-Object System.Windows.Forms.GroupBox
$grpStatus.Text = "Durum"
$grpStatus.Location = New-Object System.Drawing.Point(20, 60)
$grpStatus.Size = New-Object System.Drawing.Size(560, 60)
$grpStatus.Font = $fontNormal

$lblStatus = New-Object System.Windows.Forms.Label
$lblStatus.Text = "Kontrol ediliyor..."
$lblStatus.Location = New-Object System.Drawing.Point(15, 25)
$lblStatus.Size = New-Object System.Drawing.Size(400, 25)
$lblStatus.ForeColor = [System.Drawing.Color]::Gray
$grpStatus.Controls.Add($lblStatus)

$btnRefresh = New-Object System.Windows.Forms.Button
$btnRefresh.Text = "Yenile"
$btnRefresh.Location = New-Object System.Drawing.Point(460, 20)
$btnRefresh.Size = New-Object System.Drawing.Size(80, 30)
$btnRefresh.Add_Click({ Update-Status })
$grpStatus.Controls.Add($btnRefresh)

$form.Controls.Add($grpStatus)

# --- ACTIONS SECTION ---
$grpActions = New-Object System.Windows.Forms.GroupBox
$grpActions.Text = "Islemler"
$grpActions.Location = New-Object System.Drawing.Point(20, 130)
$grpActions.Size = New-Object System.Drawing.Size(560, 260)
$grpActions.Font = $fontNormal

# Helper to create buttons
function Create-Button {
    param(
        [string]$text,
        [int]$x,
        [int]$y,
        [scriptblock]$action,
        [System.Drawing.Color]$color
    )

    $btn = New-Object System.Windows.Forms.Button
    $btn.Text = $text
    $btn.Location = New-Object System.Drawing.Point($x, $y)
    $btn.Size = New-Object System.Drawing.Size(160, 40)
    $btn.Font = $fontBold
    $btn.BackColor = $color
    $btn.ForeColor = $colWhite
    $btn.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
    $btn.FlatAppearance.BorderSize = 0
    $btn.Add_Click($action)
    return $btn
}

# Row 1: Server Control
$btnDev = Create-Button -text "Gelistirici Modu" -x 20 -y 30 -action { Start-Server "dev" } -color $colGreen
$grpActions.Controls.Add($btnDev)

$btnProd = Create-Button -text "Canli Mod" -x 190 -y 30 -action { Start-Server "start" } -color $colBlue
$grpActions.Controls.Add($btnProd)

$btnStop = Create-Button -text "Durdur" -x 360 -y 30 -action { Stop-Server } -color $colRed
$grpActions.Controls.Add($btnStop)

# Row 2: Maintenance
$btnBuild = Create-Button -text "Build Al" -x 20 -y 85 -action { Run-Command "npm run build" "Build Aliniyor..." } -color $colOrange
$grpActions.Controls.Add($btnBuild)

$btnDeploy = Create-Button -text "Deploy / Guncelle" -x 190 -y 85 -action { Start-Deploy } -color $colTeal
$grpActions.Controls.Add($btnDeploy)

$btnClean = Create-Button -text "Onbellegi Temizle" -x 360 -y 85 -action { Clean-Cache } -color $colDark
$grpActions.Controls.Add($btnClean)

# Row 3: Tools
$btnPrisma = Create-Button -text "Veritabani (Studio)" -x 20 -y 140 -action { Start-Process "cmd.exe" -ArgumentList "/c npx prisma studio" } -color $colPurple
$grpActions.Controls.Add($btnPrisma)

$btnInstall = Create-Button -text "Paketleri Yukle" -x 190 -y 140 -action { Run-Command "npm install" "Paketler Yukleniyor..." } -color $colDark
$grpActions.Controls.Add($btnInstall)

$btnOpenWeb = Create-Button -text "Siteyi Ac" -x 360 -y 140 -action { Open-Website } -color $colTeal
$grpActions.Controls.Add($btnOpenWeb)

# Row 4: Logs (New Feature)
$btnLogs = Create-Button -text "Hata Kayitlari" -x 20 -y 195 -action { Show-Logs } -color $colMaroon
$grpActions.Controls.Add($btnLogs)

$lblHint = New-Object System.Windows.Forms.Label
$lblHint.Text = "NOT: Gelistirici modu calisirken acilan siyah pencerede de hatalar gorunur."
$lblHint.Location = New-Object System.Drawing.Point(20, 250)
$lblHint.Size = New-Object System.Drawing.Size(500, 40)
$lblHint.ForeColor = [System.Drawing.Color]::Gray
$lblHint.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Italic)
$grpActions.Controls.Add($lblHint)

$form.Controls.Add($grpActions)

# --- LOGS/OUTPUT ---
$txtOutput = New-Object System.Windows.Forms.TextBox
$txtOutput.Multiline = $true
$txtOutput.ScrollBars = "Vertical"
$txtOutput.ReadOnly = $true
$txtOutput.Location = New-Object System.Drawing.Point(20, 410)
$txtOutput.Size = New-Object System.Drawing.Size(560, 90)
$txtOutput.Font = $fontSmall
$form.Controls.Add($txtOutput)

# --- FUNCTIONS ---

function Log-Message($msg) {
    $txtOutput.AppendText("[$((Get-Date).ToString('HH:mm:ss'))] $msg`r`n")
    $txtOutput.ScrollToCaret()
}

# Load environment variables for proper configuration
$envFile = "$projectRoot\.env.production"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim().Trim('"', "'")
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
    Log-Message "Production environment variables loaded from .env.production"
}

$script:activePort = 0

function Update-Status {
    $portHTTP = 3000
    $portAlt = 3004
    $portHTTPS = 443
    
    $connHTTP = Get-NetTCPConnection -LocalPort $portHTTP -State Listen -ErrorAction SilentlyContinue
    $connAlt = Get-NetTCPConnection -LocalPort $portAlt -State Listen -ErrorAction SilentlyContinue
    $connHTTPS = Get-NetTCPConnection -LocalPort $portHTTPS -State Listen -ErrorAction SilentlyContinue
    
    if ($connAlt) {
        $script:activePort = 3004
        $lblStatus.Text = "[ON] SUNUCU CALISIYOR (Port: 3004 - Dev/Alt)"
        $lblStatus.ForeColor = $colGreen
    } elseif ($connHTTP) {
        $script:activePort = 3000
        $lblStatus.Text = "[ON] SUNUCU CALISIYOR (Port: 3000 - Dev)"
        $lblStatus.ForeColor = $colGreen
    } elseif ($connHTTPS) {
        $script:activePort = 443
        $lblStatus.Text = "[ON] SUNUCU CALISIYOR (Port: 443 - Production HTTPS)"
        $lblStatus.ForeColor = $colGreen
    } else {
        $script:activePort = 0
        $lblStatus.Text = "[OFF] SUNUCU DURDU"
        $lblStatus.ForeColor = $colRed
    }
}

function Open-Website {
    if ($script:activePort -eq 3004) {
        Start-Process "http://localhost:3004"
    } elseif ($script:activePort -eq 3000) {
        Start-Process "http://localhost:3000"
    } elseif ($script:activePort -eq 443) {
        # Production mode - use production domain
        Start-Process "https://www.varsagel.com"
    } else {
        # Default fallback to production
        Start-Process "https://www.varsagel.com"
    }
}

function Start-Server($mode) {
    Update-Status
    # Check if really running
    if ($script:activePort -ne 0) {
        Log-Message "HATA: Sunucu zaten calisiyor (Port: $script:activePort). Once durdurun."
        [System.Windows.Forms.MessageBox]::Show("Sunucu zaten calisiyor. Lutfen once durdurun.", "Uyari", "OK", "Warning")
        return
    }

    if ($mode -eq "start") {
        # Check if build is needed
        if (-not (Test-Path "$projectRoot\.next")) {
            Log-Message "Production build bulunamadi. Build aliniyor..."
            $result = [System.Windows.Forms.MessageBox]::Show("Production build bulunamadi. Once build alinmasi gerekiyor.`n`nSimdi Build alinsin mi?", "Build Gerekli", "YesNo", "Question")
            if ($result -eq "Yes") {
                 Run-Command "npm run build" "Build Aliniyor..."
                 Log-Message "Build islemi baslatildi. Lutfen build penceresi kapanana kadar bekleyin, sonra tekrar Canli Mod'a tiklayin."
                 return
            } else {
                Log-Message "Build islemi iptal edildi."
                return
            }
        } else {
            # Ask for build confirmation even if .next exists
            $result = [System.Windows.Forms.MessageBox]::Show("Uygulamada degisiklik yaptiysaniz once Build (Derleme) almaniz gerekir.`n`nSimdi Build alinsin mi?", "Build Onayi", "YesNo", "Question")
            if ($result -eq "Yes") {
                 Run-Command "npm run build" "Build Aliniyor..."
                 Log-Message "Build islemi baslatildi. Lutfen build penceresi kapanana kadar bekleyin, sonra tekrar Canli Mod'a tiklayin."
                 return
            }
        }
    }

    if ($mode -eq "dev") {
        Log-Message "Gelistirici modu icin onbellek temizleniyor (Otomatik)..."
        Clean-Cache -silent $true
    }

    Log-Message "Sunucu baslatiliyor ($mode)..."
    
    # Clean stale locks
    $lockFile = "$projectRoot\.next\dev\lock"
    if (Test-Path $lockFile) {
        try {
            Remove-Item $lockFile -Force -ErrorAction SilentlyContinue
            Log-Message "Eski kilit dosyasi temizlendi."
        } catch {
            Log-Message "UYARI: Kilit dosyasi silinemedi."
        }
    }

    # Run command with proper environment setup
    if ($mode -eq "start") {
        # Production mode - use proper environment variables
        $cmd = "npm run $mode"
    } else {
        # Dev mode - use PORT=3004 for development
        $cmd = "set PORT=3004 && npm run $mode"
    }
    Start-Process "cmd.exe" -ArgumentList "/k", "title Varsagel Server && $cmd"
    
    Log-Message "Sunucu penceresi acildi. Yuklenmesi biraz zaman alabilir."
    Start-Sleep -Seconds 3
    Update-Status
}

function Stop-Server {
    Log-Message "Sunucu durduruluyor..."
    $ports = @(443, 3000, 3004)
    
    # First, try to kill Node.js processes (most common for Next.js)
    Get-Process | Where-Object { $_.ProcessName -eq "node" } | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            Log-Message "Node.js process sonlandirildi (PID: $($_.Id))"
        } catch {
            # Ignore errors
        }
    }
    
    # Then check ports and kill remaining processes
    for ($i = 0; $i -lt 3; $i++) {
        $anyRunning = $false
        
        foreach ($port in $ports) {
            $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
            
            if ($connections) {
                $anyRunning = $true
                foreach ($conn in $connections) {
                    try {
                        # Skip System Idle Process (0) and System (4)
                        if ($conn.OwningProcess -le 4) {
                            continue
                        }
                        
                        $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                        if ($proc) {
                            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
                            Log-Message "Islem sonlandirildi: $($proc.ProcessName) (PID: $($proc.Id)) - Port: $port"
                        }
                    } catch {
                        # Ignore errors
                    }
                }
            }
        }
        
        if (-not $anyRunning) {
            Log-Message "Sunucu zaten durmus durumda veya tum islemler sonlandirildi."
            break
        }
        
        Start-Sleep -Milliseconds 500
    }
    
    # Kill the cmd window with specific title
    $serverTitle = "Varsagel Server"
    Get-Process | Where-Object { $_.MainWindowTitle -eq $serverTitle } | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            Log-Message "Sunucu penceresi kapatildi (PID: $($_.Id))"
        } catch {
             # Ignore
        }
    }

    # Final check
    Update-Status
    if ($script:activePort -ne 0) {
        Log-Message "UYARI: Bazi islemler durdurulamadi. Yonetici olarak calistirmayi deneyin."
    } else {
        Log-Message "Sunucu basariyla durduruldu."
    }
}

function Start-Deploy {
    $result = [System.Windows.Forms.MessageBox]::Show("Sistemi guncellemek (Deploy) istediginize emin misiniz?`n`nBu islem sirasiyla:`n1. Git Pull (Guncellemeleri Ceker)`n2. NPM Install (Paketleri Yukler)`n3. Build (Projeyi Derler)`n4. Restart (Sunucuyu Yeniden Baslatir)`n`nDevam edilsin mi?", "Deploy Onayi", "YesNo", "Question")
    
    if ($result -eq "Yes") {
        Log-Message "Deploy islemi baslatiliyor..."
        
        # Stop existing server first
        Stop-Server
        
        # Run the deploy script in a new window so user can see progress
        $deployScript = "$projectRoot\scripts\deploy.ps1"
        Start-Process "powershell.exe" -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$deployScript`""
        
        Log-Message "Deploy penceresi acildi. Lutfen islem bitene kadar bekleyin."
    }
}

function Run-Command($command, $desc) {
    Log-Message "$desc"
    Start-Process "cmd.exe" -ArgumentList "/c", "$command", "&", "pause"
}

function Clean-Cache {
    param([bool]$silent = $false)
    Log-Message ".next klasoru siliniyor..."
    if (Test-Path "$projectRoot\.next") {
        try {
            Remove-Item "$projectRoot\.next" -Recurse -Force -ErrorAction Stop
            Log-Message ".next klasoru basariyla silindi."
        } catch {
            Log-Message "HATA: .next klasoru silinemedi. Dosya kullanimda olabilir."
            if (-not $silent) {
                [System.Windows.Forms.MessageBox]::Show("Klasor silinemedi. Lutfen once sunucuyu durdurun.", "Hata", "OK", "Error")
            }
        }
    } else {
        Log-Message ".next klasoru zaten yok."
    }
}

function Show-Logs {
    $logPath = "$projectRoot\logs\error.log"
    if (Test-Path $logPath) {
        Log-Message "Hata kayitlari aciliyor..."
        # Open with notepad or default viewer
        Start-Process "notepad.exe" -ArgumentList $logPath
    } else {
        Log-Message "Henuz bir hata kaydi (logs/error.log) bulunamadi."
        [System.Windows.Forms.MessageBox]::Show("Henuz bir hata kaydi olusmamis.", "Bilgi", "OK", "Information")
    }
}

# Initial Status Check
Update-Status

# Show Form
$form.ShowDialog()
