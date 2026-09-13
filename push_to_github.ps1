Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "[XiLLA] Pushing to GitHub: https://github.com/mosamy007/XiLLAapplication" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

Set-Location $PSScriptRoot

Write-Host "`n[1/5] Initializing Git repository..." -ForegroundColor Yellow
git init

Write-Host "`n[2/5] Setting main branch..." -ForegroundColor Yellow
git branch -M main

Write-Host "`n[3/5] Configuring remote origin..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin https://github.com/mosamy007/XiLLAapplication.git

Write-Host "`n[4/5] Staging files and creating commit..." -ForegroundColor Yellow
git add .
git commit -m "XiLLA Protocol: Fullstack application deployment"

Write-Host "`n[5/5] Pushing to https://github.com/mosamy007/XiLLAapplication ..." -ForegroundColor Yellow
git push -u origin main

Write-Host "`n===================================================" -ForegroundColor Green
Write-Host "[XiLLA] Upload Complete!" -ForegroundColor Green
Write-Host "Repository: https://github.com/mosamy007/XiLLAapplication" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
