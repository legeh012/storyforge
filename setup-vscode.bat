@echo off
REM StoryForge VS Code Setup Script for Windows

echo 🚀 Setting up StoryForge for VS Code development...

REM Check Node.js installation
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js v18+ from https://nodejs.org/
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% detected

REM Check npm installation
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not installed. Please install npm
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm %NPM_VERSION% detected

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Check if .env exists
if not exist .env (
    echo ❌ .env file not found. Please ensure your environment variables are configured.
    exit /b 1
)

echo ✅ Environment variables configured

REM Optional: Install Supabase CLI
set /p INSTALL_SUPABASE="📝 Do you want to install Supabase CLI for local edge function testing? (y/n) "
if /i "%INSTALL_SUPABASE%"=="y" (
    echo 📦 Installing Supabase CLI...
    call npm install -g supabase
    echo ✅ Supabase CLI installed
)

echo.
echo 🎉 Setup complete! You can now:
echo    1. Run 'npm run dev' to start the development server
echo    2. Open VS Code and install recommended extensions
echo    3. Visit http://localhost:8080 to see your app
echo.
echo 📚 For more info, check README.md
pause
