# VitalX Smart Contract Deployment Script
# This script will help you deploy your contract to Stellar testnet

Write-Host "VitalX Smart Contract Deployment" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Update PATH to include Stellar CLI
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Check if stellar CLI is installed
Write-Host "Checking Stellar CLI..." -ForegroundColor Yellow
try {
    $stellarVersion = stellar --version
    Write-Host "[OK] Stellar CLI found: $stellarVersion" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "[ERROR] Stellar CLI not found. Please install it first." -ForegroundColor Red
    exit 1
}

# Step 1: Add testnet network
Write-Host "Step 1: Configuring Stellar testnet..." -ForegroundColor Yellow
try {
    stellar network add testnet --rpc-url https://soroban-testnet.stellar.org --network-passphrase "Test SDF Network ; September 2015" 2>$null
    Write-Host "[OK] Testnet configured" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "[WARNING] Testnet already configured" -ForegroundColor Yellow
    Write-Host ""
}

# Step 2: Generate or use existing identity
Write-Host "Step 2: Setting up deployer identity..." -ForegroundColor Yellow
$identityExists = stellar keys ls 2>$null | Select-String "deployer"

if ($identityExists) {
    Write-Host "[OK] Using existing deployer identity" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "Creating new deployer identity..." -ForegroundColor Yellow
    stellar keys generate deployer --network testnet
    Write-Host "[OK] Identity created" -ForegroundColor Green
    Write-Host ""
}

# Get deployer address
$deployerAddress = stellar keys address deployer
Write-Host "Deployer Address: $deployerAddress" -ForegroundColor Cyan
Write-Host ""

# Step 3: Check balance
Write-Host "Step 3: Checking account balance..." -ForegroundColor Yellow
try {
    $balance = stellar keys balance deployer --network testnet 2>$null
    Write-Host "Current Balance: $balance XLM" -ForegroundColor Green
    Write-Host ""
    
    if ([double]$balance -lt 1000) {
        Write-Host "[WARNING] Low balance detected!" -ForegroundColor Yellow
        Write-Host "Please fund your account:" -ForegroundColor Yellow
        Write-Host "1. Go to: https://laboratory.stellar.org/#account-creator" -ForegroundColor White
        Write-Host "2. Paste this address: $deployerAddress" -ForegroundColor White
        Write-Host "3. Click Get test network lumens" -ForegroundColor White
        Write-Host ""
        
        $continue = Read-Host "Have you funded the account? (y/n)"
        if ($continue -ne "y") {
            Write-Host "[ERROR] Deployment cancelled. Please fund the account first." -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "[WARNING] Account not found or not funded!" -ForegroundColor Red
    Write-Host "Please fund your account:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://laboratory.stellar.org/#account-creator" -ForegroundColor White
    Write-Host "2. Paste this address: $deployerAddress" -ForegroundColor White
    Write-Host "3. Click Get test network lumens" -ForegroundColor White
    Write-Host ""
    
    $continue = Read-Host "Have you funded the account? (y/n)"
    if ($continue -ne "y") {
        Write-Host "[ERROR] Deployment cancelled. Please fund the account first." -ForegroundColor Red
        exit 1
    }
}

# Step 4: Build contract
Write-Host "Step 4: Building smart contract..." -ForegroundColor Yellow
Write-Host "[WARNING] This requires Visual Studio C++ Build Tools" -ForegroundColor Yellow

Set-Location contracts

try {
    stellar contract build
    Write-Host "[OK] Contract built successfully!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "[ERROR] Build failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "The contract cannot be built without C++ Build Tools." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Cyan
    Write-Host "1. Install Build Tools: https://visualstudio.microsoft.com/visual-cpp-build-tools/" -ForegroundColor White
    Write-Host "2. Use pre-built WASM (contact developer)" -ForegroundColor White
    Write-Host "3. Use GitHub Actions to build in cloud" -ForegroundColor White
    Write-Host ""
    
    Set-Location ..
    exit 1
}

# Step 5: Deploy contract
Write-Host "Step 5: Deploying to Stellar testnet..." -ForegroundColor Yellow
Write-Host "This may take 30-60 seconds..." -ForegroundColor Yellow
Write-Host ""

try {
    $contractId = stellar contract deploy --wasm target/wasm32-unknown-unknown/release/vitalx_record_storage.wasm --source deployer --network testnet
    
    Write-Host "[OK] Contract deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "====================================" -ForegroundColor Cyan
    Write-Host "DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host "====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Contract ID:" -ForegroundColor Yellow
    Write-Host "$contractId" -ForegroundColor White
    Write-Host ""
    
    # Step 6: Update .env file
    Set-Location ..
    
    Write-Host "Step 6: Updating .env file..." -ForegroundColor Yellow
    
    $envContent = Get-Content .env -Raw
    
    if ($envContent -match "VITE_CONTRACT_ID=") {
        $envContent = $envContent -replace "VITE_CONTRACT_ID=.*", "VITE_CONTRACT_ID=$contractId"
    } else {
        $envContent += "`nVITE_CONTRACT_ID=$contractId"
    }
    
    Set-Content .env $envContent
    Write-Host "[OK] .env file updated" -ForegroundColor Green
    Write-Host ""
    
    # Final instructions
    Write-Host "====================================" -ForegroundColor Cyan
    Write-Host "NEXT STEPS:" -ForegroundColor Cyan
    Write-Host "====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Restart your dev server:" -ForegroundColor Yellow
    Write-Host "   npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Open: http://localhost:5173" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "3. Connect wallet and test upload" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "4. Verify on blockchain:" -ForegroundColor Yellow
    Write-Host "   https://stellar.expert/explorer/testnet/contract/$contractId" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "[ERROR] Deployment failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Set-Location ..
    exit 1
}
