@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   Electron + ucbuilder Setup Tool
echo ========================================
echo.

:: Ask for project name
set /p projectName=Enter your project name: 
if "%projectName%"=="" (
    echo Project name cannot be empty!
    exit /b
)

:: Ask for Electron version
set /p electronVersion=Enter Electron version (e.g. 31.6.0,blank for latest): 
if "%electronVersion%"=="" (
    echo Using latest Electron version...
    set electronVersion=latest
)

echo.
echo Creating project folder "%projectName%"...
mkdir "%projectName%"
cd "%projectName%"

if not "%CD%"=="" (
    echo Now in: %CD%
) else (
    echo Failed to enter project directory!
    exit /b
)

echo.
echo Initializing Node.js project...
call npm init -y
if errorlevel 1 (
    echo ❌ npm init failed!
    exit /b
)

echo.
echo Installing Electron@%electronVersion% ...
call npm install electron@%electronVersion% --save
if errorlevel 1 (
    echo ❌ Electron install failed!
    exit /b
)

echo.
echo Installing rimraf ...
call npm install rimraf --save-dev
if errorlevel 1 (
    echo ❌ rimraf install failed!
    exit /b
)

echo.
echo Installing @types/node ...
call npm install @types/node --save-dev
if errorlevel 1 (
    echo ❌ @types/node install failed!
    exit /b
)

echo.
echo Installing typescript ...
call npm install typescript --save-dev
if errorlevel 1 (
    echo ❌ typescript install failed!
    exit /b
)

echo.
echo Installing ucbuilder...
call npm install ucbuilder --save
if errorlevel 1 (
    echo ❌ ucbuilder install failed!
    exit /b
)

@REM cd ../ucbuilder
@REM call npm run rebuild  
@REM call npm pack
@REM cd ../"%projectName%"
@REM call npm install "../ucbuilder/ucbuilder-1.0.4.tgz"

echo.
echo Running ucbuilder startup setup...
if exist node_modules\ucbuilder\out\setupForStartup\index.js (
    node node_modules\ucbuilder\out\setupForStartup\index.js "%projectName%"
) else (
    echo ⚠️ Could not find ucbuilder setup file!
)

echo.
echo ========================================
echo ✅ Project "%projectName%" setup complete!
echo Directory: %CD%
echo ========================================



echo.
echo Opening project in Visual Studio Code...
call code .

pause
