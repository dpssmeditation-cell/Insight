@echo off
echo ========================================
echo Restarting Insight Sharing Dev Server
echo ========================================
echo.

echo [1/4] Stopping all Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/4] Clearing Vite cache...
if exist node_modules\.vite (
    rmdir /s /q node_modules\.vite
    echo Vite cache cleared
) else (
    echo No Vite cache found
)

echo [3/4] Clearing dist folder...
if exist dist (
    rmdir /s /q dist
    echo Dist folder cleared
) else (
    echo No dist folder found
)

echo [4/4] Starting dev server...
echo.
echo ========================================
echo Server starting on http://localhost:3000
echo Press Ctrl+C to stop the server
echo ========================================
echo.

npm run dev
