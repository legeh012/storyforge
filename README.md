# Mayza AI Productivity System

> Your comprehensive personal AI assistant for work, school, development, writing, planning, automation, and life management. Powered by advanced AI capabilities with local deployment support.

## 🚀 Quick Start

### Automated Setup (Recommended)

#### Windows
```bash
setup-vscode.bat
```

#### macOS/Linux
```bash
chmod +x setup-vscode.sh
./setup-vscode.sh
```

### Manual Setup

```sh
# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:8080
```

## 📋 Prerequisites

- **Node.js** v18+ - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)
- **Visual Studio Code** - [Download](https://code.visualstudio.com/) (recommended)
- **Supabase CLI** (optional) - `npm install -g supabase`

## 💻 Development

### VS Code Integration

**Recommended Extensions** (auto-install prompt on first open):
- ESLint - Code linting
- Prettier - Code formatting  
- Tailwind CSS IntelliSense - Tailwind autocomplete
- Deno - Edge function support
- Supabase - Supabase integration
- ES7+ React Snippets - React code snippets

**Debug Configurations:**
- Press `F5` to launch Chrome debugger against localhost
- Select "Debug Supabase Edge Function" to debug edge functions

**Available Tasks** (`Ctrl+Shift+B` / `Cmd+Shift+B`):
- Start Dev Server
- Build Project
- Preview Production Build
- Lint Code
- Serve Supabase Edge Functions
- Deploy Edge Function

### Project Structure

```
mayza/
├── .vscode/              # VS Code configuration
│   ├── extensions.json   # Recommended extensions
│   ├── launch.json       # Debug configurations
│   ├── settings.json     # Workspace settings
│   └── tasks.json        # Build tasks
├── src/
│   ├── components/       # React components (Mayza, UI, etc.)
│   ├── pages/           # Page components
│   ├── integrations/    # Supabase integration
│   ├── hooks/           # Custom React hooks
│   ├── stores/          # Zustand state management
│   └── lib/             # Utility functions
├── supabase/
│   ├── functions/       # Edge functions (automation, voice, etc.)
│   └── config.toml      # Supabase configuration
└── vite.config.ts       # Vite configuration
```

### Available Scripts

```bash
npm run dev              # Start dev server (localhost:8080)
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
```

## 🎯 Core Features

- **Digital Assistant** - Voice-activated AI assistant for task automation
- **Workflow Coordinator** - Multi-department collaboration system
- **Automation Engine** - macOS system integration and file operations
- **Task Planner** - Cross-domain task management (work, school, life)
- **Video Production** - Full AI-powered video creation pipeline
- **Context-Aware AI** - Deep conversation tracking with GPT-5.1 capabilities
- **Local Deployment** - Fully functional offline with local AI processing

## 🔧 Advanced Configuration

### Edge Functions

All edge functions are in `supabase/functions/`:
- `automation-api/` - System automation and file operations
- `voice-automation/` - Voice command processing
- `bot-orchestrator/` - Main AI orchestrator
- `godlike-voice-bot/` - Voice synthesis
- `veo-video-bot/` - Video generation
- And more...

### Local Edge Function Testing

```bash
# Install Supabase CLI
npm install -g supabase

# Link to project
supabase link --project-ref tmqmpqxixukhpblgdvgp

# Start local Supabase
supabase start

# Serve edge functions locally
supabase functions serve --env-file .env

# Test a function
curl -X POST http://localhost:54321/functions/v1/automation-api \
  -H "Content-Type: application/json" \
  -d '{"command": "organize_files"}'
```

## 📚 Documentation

- [Local Development Guide](./LOCAL_DEVELOPMENT.md) - Complete setup instructions
- [Local Bridge Setup](./LOCAL_BRIDGE_SETUP.md) - macOS automation integration
- [Lovable Docs](https://docs.lovable.dev/) - Platform documentation
- [Supabase Docs](https://supabase.com/docs) - Backend documentation

## 🚀 Deployment

### Via Lovable Platform

Simply open [Lovable](https://lovable.dev/projects/20bfd2da-a425-458f-990b-26226e51ac14) and click **Share → Publish**

### Production Build (Self-Hosting)

```bash
npm run build
# Output in dist/ folder
```

## 🌐 Custom Domain

Connect a custom domain in Project → Settings → Domains

[Learn more about custom domains](https://docs.lovable.dev/features/custom-domain)

## 🛠️ Tech Stack

- **Frontend**: Vite, React, TypeScript, Tailwind CSS, shadcn-ui
- **State**: Zustand, React Query
- **Backend**: Lovable Cloud (Supabase)
- **AI**: Lovable AI, OpenAI integration
- **Deployment**: Automated via Lovable Platform

## 📝 License

See LICENSE file for details.

---

**Project URL**: https://lovable.dev/projects/20bfd2da-a425-458f-990b-26226e51ac14
