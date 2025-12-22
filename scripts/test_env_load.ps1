# Load environment variables from .env.production
$envFile = "C:\varsagel\varsagel\.env.production"
if (Test-Path $envFile) {
    Write-Host "Loading environment variables from .env.production..." -ForegroundColor Green
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim().Trim('"', "'")
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
            Write-Host "  Set: $name = $value" -ForegroundColor Cyan
        }
    }
    
    Write-Host "Environment variables loaded successfully!" -ForegroundColor Green
    Write-Host "NEXTAUTH_URL: $([Environment]::GetEnvironmentVariable('NEXTAUTH_URL'))" -ForegroundColor Yellow
    Write-Host "PORT: $([Environment]::GetEnvironmentVariable('PORT'))" -ForegroundColor Yellow
} else {
    Write-Host "⚠ .env.production dosyası bulunamadı" -ForegroundColor Yellow
}