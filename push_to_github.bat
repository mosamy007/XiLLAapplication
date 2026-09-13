@echo off
echo ===================================================
echo [XiLLA] Pushing to GitHub: https://github.com/mosamy007/XiLLAapplication
echo ===================================================

cd /d "%~dp0"

echo.
echo [1/5] Initializing Git repository...
git init
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git is not installed or not in PATH. Please install Git: https://git-scm.com/
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/5] Setting main branch...
git branch -M main

echo.
echo [3/5] Configuring remote origin...
git remote remove origin 2>nul
git remote add origin https://github.com/mosamy007/XiLLAapplication.git

echo.
echo [4/5] Staging files and creating commit...
git add .
git commit -m "XiLLA Protocol: Fullstack application deployment"

echo.
echo [5/5] Pushing to https://github.com/mosamy007/XiLLAapplication ...
git push -u origin main

echo.
echo ===================================================
echo [XiLLA] Upload Complete!
echo Repository: https://github.com/mosamy007/XiLLAapplication
echo ===================================================
pause
