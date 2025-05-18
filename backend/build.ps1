# Stop on errors
$ErrorActionPreference = "Stop"

# Step 1: Ensure dist folder exists
if (!(Test-Path -Path "dist")) {
    New-Item -ItemType Directory -Path "dist" | Out-Null
}

# Step 2: Copy package.json and package-lock.json to dist
Write-Host "Copying package files..." -ForegroundColor Cyan
Copy-Item "package*.json" -Destination "dist" -Force

# Step 3: Copy cert folder (if exists) recursively
if (Test-Path -Path "cert") {
    Write-Host "Copying cert folder..." -ForegroundColor Cyan
    Copy-Item -Path "cert" -Destination "dist" -Recurse -Force
}

# Step 4: Copy cert folder (if exists) recursively
if (Test-Path -Path "cert") {
    Write-Host "Copying public folder..." -ForegroundColor Cyan
    Copy-Item -Path "public" -Destination "dist" -Recurse -Force
}

# Step 5: Compile TypeScript
Write-Host "Compiling TypeScript..." -ForegroundColor Cyan
npm run build

# Step 6: Install dependencies in dist
Write-Host "Installing dependencies..." -ForegroundColor Cyan
Set-Location "dist"
npm install --omit=dev
Set-Location ".."

Write-Host "Build completed!" -ForegroundColor Green