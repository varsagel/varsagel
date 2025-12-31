# GitHub Backup Script
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

# Git path detection
$gitPath = "C:\Program Files\Git\cmd\git.exe"
if (-not (Test-Path $gitPath)) {
    if (Get-Command git -ErrorAction SilentlyContinue) {
        $gitPath = "git"
    } else {
        Write-Host "HATA: Git bulunamadı. Lütfen Git'in yüklü olduğundan emin olun." -ForegroundColor Red
        exit 1
    }
}

# Configure Credential Manager Explicitly
$gcmPath = "C:\Program Files\Git\mingw64\bin\git-credential-manager.exe"
if (Test-Path $gcmPath) {
    & $gitPath config --global credential.helper "'$gcmPath'"
    # FORCE BROWSER AUTHENTICATION
    & $gitPath config --global credential.github.authMode browser
    & $gitPath config --global --unset credential.provider 2>$null
}

Write-Host "=== Varsagel GitHub Yedekleme Aracı ===" -ForegroundColor Cyan

# 1. Check/Init Repo
if (-not (Test-Path ".git")) {
    Write-Host "Git deposu başlatılıyor..." -ForegroundColor Yellow
    & $gitPath init
    & $gitPath branch -M main
}

# 2. Configure User (Auto-fill to avoid blocking)
$userName = & $gitPath config user.name
if ([string]::IsNullOrWhiteSpace($userName)) {
    Write-Host "Kullanıcı bilgileri otomatik tanımlanıyor..." -ForegroundColor Gray
    & $gitPath config user.name "Varsagel Admin"
    & $gitPath config user.email "admin@varsagel.com"
}

# 3. Configure Remote (if missing)
$remoteUrl = & $gitPath remote get-url origin 2>$null
if ([string]::IsNullOrWhiteSpace($remoteUrl)) {
    # Default to the provided URL
    $defaultUrl = "https://github.com/varsagel/varsagel.git"
    & $gitPath remote add origin $defaultUrl
    & $gitPath branch -M main
    Write-Host "Uzak depo eklendi: $defaultUrl" -ForegroundColor Green
}

# 4. Trigger Auth (Fetch)
Write-Host "GitHub bağlantısı kuruluyor..." -ForegroundColor Cyan
Write-Host "Lütfen açılan tarayıcı penceresinden giriş yapın." -ForegroundColor Yellow

# 5. Add & Commit
Write-Host "Dosyalar hazırlanıyor..." -ForegroundColor Gray
& $gitPath add .

$status = & $gitPath status --porcelain
if (-not [string]::IsNullOrWhiteSpace($status)) {
    $date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    & $gitPath commit -m "Backup: $date"
}

# 6. Push
$remoteUrl = & $gitPath remote get-url origin 2>$null
if (-not [string]::IsNullOrWhiteSpace($remoteUrl)) {
    Write-Host "GitHub'a yükleniyor..." -ForegroundColor Cyan
    
    # Get current branch
    $branch = & $gitPath branch --show-current
    if ([string]::IsNullOrWhiteSpace($branch)) { $branch = "main" }

    try {
        & $gitPath push -u origin $branch
        Write-Host "BAŞARILI: Yedekleme tamamlandı." -ForegroundColor Green
    } catch {
        Write-Host "HATA: Yükleme başarısız oldu." -ForegroundColor Red
        Write-Host $_ -ForegroundColor Red
    }
}

Write-Host "Pencereyi kapatabilirsiniz." -ForegroundColor Gray
