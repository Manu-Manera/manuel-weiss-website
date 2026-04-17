@echo off
REM Baut einen verteilbaren Windows-Ordner (TempusLoginMailer\TempusLoginMailer.exe) + ZIP.
REM Keine Installation noetig: Empfaenger entpackt das ZIP und startet die .exe.

setlocal enableextensions

cd /d "%~dp0"

echo ==========================================
echo   Tempus Login Mailer  -  Windows-Build
echo ==========================================
echo.

where python >nul 2>&1
if errorlevel 1 (
    echo FEHLER: "python" wurde nicht gefunden. Bitte Python 3.10+ installieren
    echo         von https://www.python.org/downloads/  (Haken bei "Add Python to PATH").
    pause
    exit /b 1
)

echo [1/4] Abhaengigkeiten installieren...
python -m pip install --upgrade pip >nul
python -m pip install -r requirements.txt
if errorlevel 1 ( echo FEHLER beim Installieren der Abhaengigkeiten. & pause & exit /b 1 )
python -m pip install pyinstaller
if errorlevel 1 ( echo FEHLER beim Installieren von PyInstaller. & pause & exit /b 1 )

echo.
echo [2/4] Alte Build-Artefakte entfernen...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
if exist TempusLoginMailer-windows.zip del /q TempusLoginMailer-windows.zip

echo.
echo [3/4] PyInstaller laeuft (das dauert 1-2 Minuten)...
python -m PyInstaller --noconfirm TempusLoginMailer.spec
if errorlevel 1 ( echo FEHLER beim Bauen. & pause & exit /b 1 )

echo.
echo [4/4] Distributions-ZIP erstellen...
if exist DISTRIBUTE_README.md copy /y DISTRIBUTE_README.md "dist\TempusLoginMailer\ANLEITUNG.md" >nul
powershell -NoLogo -NoProfile -Command "Compress-Archive -Path 'dist\TempusLoginMailer\*' -DestinationPath 'TempusLoginMailer-windows.zip' -Force"
if errorlevel 1 ( echo FEHLER beim Packen. & pause & exit /b 1 )

echo.
echo ==========================================
echo   Fertig!
echo   Ordner: dist\TempusLoginMailer\
echo   Start:  dist\TempusLoginMailer\TempusLoginMailer.exe
echo   ZIP:    %CD%\TempusLoginMailer-windows.zip
echo ==========================================
echo.
echo Verteilen:
echo   1. TempusLoginMailer-windows.zip an den Kollegen senden
echo   2. Empfaenger: ZIP entpacken, dann TempusLoginMailer.exe starten
echo.
pause
