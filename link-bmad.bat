@echo off
cd /d "C:\Users\Mounkaila\WebstormProjects\icall26-front"

echo Creation junction _bmad...
mklink /J _bmad "C:\laragon\www\backend-api\_bmad"

echo.
echo Creation junction _bmad-output...
mklink /J _bmad-output "C:\laragon\www\backend-api\_bmad-output"

echo.
echo Termine!
dir _bmad* /A
pause
