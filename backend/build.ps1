# # # Stop on errors
# # $ErrorActionPreference = "Stop"

# # # Step 1: Ensure dist folder exists
# # if (!(Test-Path -Path "dist")) {
# #     New-Item -ItemType Directory -Path "dist" | Out-Null
# # }

# # # Step 2: Copy package.json and package-lock.json to dist
# # Write-Host "Copying package files..." -ForegroundColor Cyan
# # Copy-Item "package*.json" -Destination "dist" -Force

# # # Step 3: Copy cert folder (if exists) recursively
# # if (Test-Path -Path "cert") {
# #     Write-Host "Copying cert folder..." -ForegroundColor Cyan
# #     Copy-Item -Path "cert" -Destination "dist" -Recurse -Force
# # }

# # # Step 4: Copy cert folder (if exists) recursively
# # if (Test-Path -Path "cert") {
# #     Write-Host "Copying public folder..." -ForegroundColor Cyan
# #     Copy-Item -Path "public" -Destination "dist" -Recurse -Force
# # }

# # # Step 5: Compile TypeScript
# # Write-Host "Compiling TypeScript..." -ForegroundColor Cyan
# # npm run build

# # # Step 6: Install dependencies in dist
# # Write-Host "Installing dependencies..." -ForegroundColor Cyan
# # Set-Location "dist"
# # npm install --omit=dev
# # Set-Location ".."

# # Write-Host "Build completed!" -ForegroundColor Green


# # Stop on errors
# $ErrorActionPreference = "Stop"

# # Get absolute paths
# $rootDir = $PSScriptRoot
# if (-not $rootDir) {
#     $rootDir = Get-Location
# }
# $distDir = Join-Path -Path $rootDir -ChildPath "dist"

# # Step 1: Ensure dist folder exists
# if (!(Test-Path -Path $distDir)) {
#     New-Item -ItemType Directory -Path $distDir | Out-Null
# }

# # Step 2: Copy package.json and package-lock.json to dist
# Write-Host "Copying package files..." -ForegroundColor Cyan
# Copy-Item (Join-Path -Path $rootDir -ChildPath "package.json") -Destination $distDir -Force
# Copy-Item (Join-Path -Path $rootDir -ChildPath "package-lock.json") -Destination $distDir -Force

# # Step 3: Copy cert folder (if exists) recursively
# $certDir = Join-Path -Path $rootDir -ChildPath "cert"
# if (Test-Path -Path $certDir) {
#     Write-Host "Copying cert folder..." -ForegroundColor Cyan
#     Copy-Item -Path $certDir -Destination $distDir -Recurse -Force
# }

# # Step 4: Copy public folder (if exists) recursively
# $publicDir = Join-Path -Path $rootDir -ChildPath "public"
# if (Test-Path -Path $publicDir) {
#     Write-Host "Copying public folder..." -ForegroundColor Cyan
#     Copy-Item -Path $publicDir -Destination $distDir -Recurse -Force
# }

# # Step 5: Compile TypeScript
# Write-Host "Compiling TypeScript..." -ForegroundColor Cyan
# Set-Location $rootDir
# npm run build

# # Step 6: Install dependencies in dist
# Write-Host "Installing dependencies..." -ForegroundColor Cyan
# Set-Location $distDir
# npm install --omit=dev
# Set-Location $rootDir

# Write-Host "Build completed!" -ForegroundColor Green



# Stop on errors
$ErrorActionPreference = "Stop"

# Get absolute paths
$rootDir = $PSScriptRoot
if (-not $rootDir) {
    $rootDir = Get-Location
}

# Define new dist directory one level up
$distDir = Join-Path -Path $rootDir -ChildPath "..\inventory-production\inventory-api-single-tenant-build" | Resolve-Path -Relative

Write-Host "The Current Active Directory is: $rootDir" -ForegroundColor Green
Write-Host "Build output directory: $distDir" -ForegroundColor Green

# Step 1: Ensure dist folder exists
if (!(Test-Path -Path $distDir)) {
    New-Item -ItemType Directory -Path $distDir -Force | Out-Null
}

# Step 2: Copy package.json and package-lock.json to dist
Write-Host "Copying package files..." -ForegroundColor Cyan
Copy-Item (Join-Path -Path $rootDir -ChildPath "package.json") -Destination $distDir -Force
Copy-Item (Join-Path -Path $rootDir -ChildPath "package-lock.json") -Destination $distDir -Force

# Step 3: Copy cert folder (if exists) recursively
$certDir = Join-Path -Path $rootDir -ChildPath "cert"
if (Test-Path -Path $certDir) {
    Write-Host "Copying cert folder..." -ForegroundColor Cyan
    Copy-Item -Path $certDir -Destination $distDir -Recurse -Force
}

# Step 4: Copy public folder (if exists) recursively
$publicDir = Join-Path -Path $rootDir -ChildPath "public"
if (Test-Path -Path $publicDir) {
    Write-Host "Copying public folder..." -ForegroundColor Cyan
    Copy-Item -Path $publicDir -Destination $distDir -Recurse -Force
}

# Step 5: Compile TypeScript
Write-Host "Compiling TypeScript..." -ForegroundColor Cyan
Set-Location $rootDir
npm run build

# Step 6: Install dependencies in dist
Write-Host "Installing dependencies..." -ForegroundColor Cyan
Set-Location $distDir
npm install --omit=dev
Set-Location $rootDir

Write-Host "Build completed!" -ForegroundColor Green
