@echo off
REM Script Batch pour créer des Junction Points BMAD
REM PAS BESOIN DE PRIVILÈGES ADMINISTRATEUR

echo ========================================
echo Creation des Junction Points BMAD
echo ========================================
echo.

set FRONTEND=C:\Users\Mounkaila\WebstormProjects\icall26-front
set BACKEND=C:\laragon\www\backend-api

echo Dossier Frontend: %FRONTEND%
echo Dossier Backend:  %BACKEND%
echo.

REM Fonction pour créer un junction point
echo [1/3] Creation du junction point: _bmad
if exist "%FRONTEND%\_bmad" (
    echo   ^> Le dossier existe deja, suppression...
    rmdir "%FRONTEND%\_bmad" /S /Q 2>nul
)
mklink /J "%FRONTEND%\_bmad" "%BACKEND%\_bmad"
if %errorlevel% equ 0 (
    echo   ^> Succes!
) else (
    echo   ^> ERREUR lors de la creation!
)
echo.

echo [2/3] Creation du junction point: _bmad-output
if exist "%FRONTEND%\_bmad-output" (
    echo   ^> Le dossier existe deja, suppression...
    rmdir "%FRONTEND%\_bmad-output" /S /Q 2>nul
)
mklink /J "%FRONTEND%\_bmad-output" "%BACKEND%\_bmad-output"
if %errorlevel% equ 0 (
    echo   ^> Succes!
) else (
    echo   ^> ERREUR lors de la creation!
)
echo.

echo [3/3] Creation du junction point: .claude
if exist "%FRONTEND%\.claude" (
    echo   ^> Le dossier existe deja, suppression...
    rmdir "%FRONTEND%\.claude" /S /Q 2>nul
)
mklink /J "%FRONTEND%\.claude" "%BACKEND%\.claude"
if %errorlevel% equ 0 (
    echo   ^> Succes!
) else (
    echo   ^> ERREUR lors de la creation!
)
echo.

echo ========================================
echo TERMINE!
echo ========================================
echo.
echo Les junction points ont ete crees.
echo Vous pouvez maintenant utiliser les agents BMAD dans votre projet frontend.
echo.
echo Appuyez sur une touche pour fermer...
pause >nul
