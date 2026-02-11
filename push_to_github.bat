@echo off
echo ==========================================
echo    GitHub Push Helper
echo ==========================================

echo Adding all changes...
git add .

set /p commit_msg="Enter commit message (press Enter for 'Update'): "
if "%commit_msg%"=="" set commit_msg=Update

echo.
echo Committing changes with message: "%commit_msg%"
git commit -m "%commit_msg%"

echo.
echo Pushing to GitHub...
git push origin HEAD

echo.
echo ==========================================
echo    Process Completed!
echo ==========================================
pause
