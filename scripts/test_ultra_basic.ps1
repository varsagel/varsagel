# Basic test script to validate Ultra panel functionality
Write-Host "Testing Ultra Panel Basic Functions..." -ForegroundColor Green

# Test 1: Check if project root exists
$projectRoot = Split-Path -Parent $PSScriptRoot
Write-Host "Project Root: $projectRoot" -ForegroundColor Yellow
if (Test-Path $projectRoot) {
    Write-Host "✓ Project root exists" -ForegroundColor Green
} else {
    Write-Host "✗ Project root not found" -ForegroundColor Red
}

# Test 2: Check if package.json exists
$packageJson = Join-Path $projectRoot "package.json"
if (Test-Path $packageJson) {
    Write-Host "✓ package.json found" -ForegroundColor Green
} else {
    Write-Host "✗ package.json not found" -ForegroundColor Red
}

# Test 3: Test port checking functionality
Write-Host "`nTesting port checking..." -ForegroundColor Yellow
try {
    $portHTTP = 3000
    $portAlt = 3004
    $portHTTPS = 443
    
    $connHTTP = Get-NetTCPConnection -LocalPort $portHTTP -State Listen -ErrorAction SilentlyContinue
    $connAlt = Get-NetTCPConnection -LocalPort $portAlt -State Listen -ErrorAction SilentlyContinue
    $connHTTPS = Get-NetTCPConnection -LocalPort $portHTTPS -State Listen -ErrorAction SilentlyContinue
    
    Write-Host "Port 3000: $(if ($connHTTP) {'ACTIVE'} else {'INACTIVE'})" -ForegroundColor $(if ($connHTTP) {'Green'} else {'Red'})
    Write-Host "Port 3004: $(if ($connAlt) {'ACTIVE'} else {'INACTIVE'})" -ForegroundColor $(if ($connAlt) {'Green'} else {'Red'})
    Write-Host "Port 443: $(if ($connHTTPS) {'ACTIVE'} else {'INACTIVE'})" -ForegroundColor $(if ($connHTTPS) {'Green'} else {'Red'})
    
} catch {
    Write-Host "✗ Port checking failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Test system info gathering
Write-Host "`nTesting system info..." -ForegroundColor Yellow
try {
    $cpu = Get-WmiObject -Class Win32_Processor | Select-Object -First 1
    $cpuUsage = if ($cpu.LoadPercentage) { $cpu.LoadPercentage } else { 0 }
    Write-Host "CPU Usage: $cpuUsage%" -ForegroundColor Green
    
    $mem = Get-WmiObject -Class Win32_OperatingSystem
    $totalRAM = [math]::Round($mem.TotalVisibleMemorySize / 1MB, 2)
    $freeRAM = [math]::Round($mem.FreePhysicalMemory / 1MB, 2)
    $usedRAM = $totalRAM - $freeRAM
    $ramPercentage = [math]::Round(($usedRAM / $totalRAM) * 100, 1)
    Write-Host "RAM Usage: $ramPercentage% ($([math]::Round($usedRAM, 1)) GB / $totalRAM GB)" -ForegroundColor Green
    
} catch {
    Write-Host "✗ System info failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nBasic tests completed!" -ForegroundColor Green