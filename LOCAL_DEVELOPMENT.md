# Local Development Setup for StoryForge

## Prerequisites

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Supabase CLI** (optional, for edge function testing)
- **Visual Studio Code** ([Download](https://code.visualstudio.com/))

## Quick Start

### 1. Initial Setup

#### Windows
```bash
# Run the setup script
setup-vscode.bat
```

#### macOS/Linux
```bash
# Make the script executable
chmod +x setup-vscode.sh

# Run the setup script
./setup-vscode.sh
```

### 2. Manual Setup (Alternative)

```bash
# Install dependencies
npm install

# Verify .env file exists (should be auto-generated)
# If missing, create .env with:
# VITE_SUPABASE_URL=https://tmqmpqxixukhpblgdvgp.supabase.co
# VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# VITE_SUPABASE_PROJECT_ID=tmqmpqxixukhpblgdvgp

# Start development server
npm run dev
```

### 3. Access the Application

Open your browser and navigate to: **http://localhost:8080**

## VS Code Setup

### Recommended Extensions (Auto-Install Prompt)

When you open the project, VS Code will prompt you to install:

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - Tailwind autocomplete
- **Deno** - Edge function support
- **Supabase** - Supabase integration
- **Auto Rename Tag** - HTML/JSX tag renaming
- **ES7+ React Snippets** - React code snippets

### Debugging

#### Debug React App
1. Press `F5` or go to **Run > Start Debugging**
2. Select "Launch Chrome against localhost"
3. App opens in Chrome with debugger attached

#### Debug Edge Function
1. Press `F5` or go to **Run > Start Debugging**
2. Select "Debug Supabase Edge Function"
3. Enter function name (e.g., `bot-orchestrator`)

### Available Tasks (Ctrl+Shift+B / Cmd+Shift+B)

- **Start Dev Server** - Launch Vite dev server
- **Build Project** - Build for production
- **Serve Supabase Edge Functions** - Test edge functions locally
- **Deploy Edge Function** - Deploy specific function

## Edge Functions Development

### Local Testing (Requires Supabase CLI)

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Serve edge functions locally
supabase functions serve --env-file .env

# Test a specific function
curl -X POST http://localhost:54321/functions/v1/bot-orchestrator \
  -H "Content-Type: application/json" \
  -d '{"message": "Test message", "mode": "god_tier"}'
```

### Edge Function Structure

All edge functions are in `supabase/functions/`:
- `bot-orchestrator/` - Main orchestrator with god-tier mode
- `veo-video-bot/` - Video generation
- `godlike-voice-bot/` - Voice synthesis
- And more...

Each function has an `index.ts` entry point.

## Project Structure

```
storyforge/
├── .vscode/              # VS Code configuration
│   ├── extensions.json   # Recommended extensions
│   ├── launch.json       # Debug configurations
│   ├── settings.json     # Workspace settings
│   └── tasks.json        # Build tasks
├── src/
│   ├── components/       # React components
│   ├── pages/           # Page components
│   ├── integrations/    # Supabase integration
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utility functions
├── supabase/
│   ├── functions/       # Edge functions
│   └── config.toml      # Supabase configuration
├── .env                 # Environment variables
└── vite.config.ts       # Vite configuration
```

## Available Scripts

```bash
# Development
npm run dev              # Start dev server (localhost:8080)

# Build
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking
```

## Environment Variables

Required variables (auto-configured in `.env`):

```env
VITE_SUPABASE_URL=https://tmqmpqxixukhpblgdvgp.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=tmqmpqxixukhpblgdvgp
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8080
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8080 | xargs kill -9
```

### Dependencies Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Supabase Connection Issues
- Verify `.env` file exists with correct credentials
- Check internet connection
- Ensure Supabase project is active

### Edge Function Errors
- Check function logs in Lovable Cloud dashboard
- Verify `supabase/config.toml` configuration
- Ensure all required secrets are configured

## Deployment

### Production Build
```bash
npm run build
```

### Deploy Edge Functions
Edge functions are automatically deployed when you push changes. For manual deployment:

```bash
supabase functions deploy bot-orchestrator
```

## Support

- [Documentation](https://docs.lovable.dev/)
- [GitHub Issues](https://github.com/your-repo/issues)
- [Community Discord](https://discord.com/channels/lovable)

## License

See LICENSE file for details.
