# Environment Setup Script for Explore Sensei
# This script helps configure the environment variables for the project

Write-Host "Explore Sensei Environment Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Check if .env file exists
if (Test-Path ".env") {
    Write-Host ".env file found" -ForegroundColor Green
} else {
    Write-Host ".env file not found. Creating one..." -ForegroundColor Yellow
    New-Item -Path ".env" -ItemType File
}

# Environment variables to set
$envVars = @{
    "VITE_GOOGLE_MAPS_API_KEY" = "AIzaSyBaUoISC-zfsvfJumBuZnstJv9uf4BgWJM"
    "VITE_GOOGLE_MAPS_API_KEY_ALT" = "AIzaSyDcVJ1Za5tw7LS_OJh8t3RtDjdOoTz8-6I"
    "VITE_SUPABASE_ANON_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvZGdsemJncXNhZmdobGloaXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNDcwMDQsImV4cCI6MjA2NDkyMzAwNH0.uLAZ_zY3zY-QmDDXwkAuspCUW9NpotsTV5fVCiHf5mM"
    "VITE_SUPABASE_PROJECT_ID" = "vodglzbgqsafghlihivy"
    "VITE_SUPABASE_PUBLISHABLE_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvZGdsemJncXNhZmdobGloaXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNDcwMDQsImV4cCI6MjA2NDkyMzAwNH0.uLAZ_zY3zY-QmDDXwkAuspCUW9NpotsTV5fVCiHf5mM"
    "VITE_SUPABASE_URL" = "https://vodglzbgqsafghlihivy.supabase.co"
    "VITE_OPENWEATHER_API_KEY" = "fcd180ffa1ffafd662a60892c7a2bb97"
    "GEMINI_API_KEY" = "AlzaSyBECTAY-5fOWzeh02GhJxDbV9UVQUmOdag"
    "LOVABLE_API_KEY" = "your_lovable_api_key_here"
}

Write-Host "`nSetting up environment variables..." -ForegroundColor Blue

# Create .env content
$envContent = @"
# Google Maps API Keys
VITE_GOOGLE_MAPS_API_KEY="AIzaSyBaUoISC-zfsvfJumBuZnstJv9uf4BgWJM"
VITE_GOOGLE_MAPS_API_KEY_ALT="AIzaSyDcVJ1Za5tw7LS_OJh8t3RtDjdOoTz8-6I"

# Supabase Configuration
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvZGdsemJncXNhZmdobGloaXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNDcwMDQsImV4cCI6MjA2NDkyMzAwNH0.uLAZ_zY3zY-QmDDXwkAuspCUW9NpotsTV5fVCiHf5mM"
VITE_SUPABASE_PROJECT_ID="vodglzbgqsafghlihivy"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvZGdsemJncXNhZmdobGloaXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNDcwMDQsImV4cCI6MjA2NDkyMzAwNH0.uLAZ_zY3zY-QmDDXwkAuspCUW9NpotsTV5fVCiHf5mM"
VITE_SUPABASE_URL="https://vodglzbgqsafghlihivy.supabase.co"

# Weather API
VITE_OPENWEATHER_API_KEY="fcd180ffa1ffafd662a60892c7a2bb97"

# AI/Gemini API
GEMINI_API_KEY="AlzaSyBECTAY-5fOWzeh02GhJxDbV9UVQUmOdag"

# Lovable AI API (for AI functions)
LOVABLE_API_KEY="your_lovable_api_key_here"
"@

# Write to .env file
try {
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "Environment variables written to .env file" -ForegroundColor Green
} catch {
    Write-Host "Error writing to .env file: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Update LOVABLE_API_KEY in .env with your actual Lovable AI key" -ForegroundColor White
Write-Host "2. Run 'npm install' to install dependencies" -ForegroundColor White
Write-Host "3. Run 'npm run dev' to start the development server" -ForegroundColor White

Write-Host "`nAPI Keys Configured:" -ForegroundColor Green
Write-Host "• Google Maps: Primary + Alternate keys" -ForegroundColor Green
Write-Host "• Supabase: All configuration keys" -ForegroundColor Green
Write-Host "• OpenWeather: Weather data API" -ForegroundColor Green
Write-Host "• Gemini AI: AI analysis API" -ForegroundColor Green
Write-Host "• Lovable AI: Needs your actual key" -ForegroundColor Yellow

Write-Host "`nReady to start development!" -ForegroundColor Cyan
