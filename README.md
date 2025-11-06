# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/20bfd2da-a425-458f-990b-26226e51ac14

## Prerequisites

Before running this application locally, ensure you have:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)
- **Supabase CLI** (optional, for edge functions) - Install with: `npm install -g supabase`

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/20bfd2da-a425-458f-990b-26226e51ac14) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use Visual Studio Code (Recommended)**

If you want to work locally using VS Code, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm install

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**VS Code Setup:**
- Install recommended extensions (VS Code will prompt you on first open)
- The app will run on `http://localhost:8080`
- Environment variables are already configured in `.env`
- Edge functions deploy automatically to Lovable Cloud

**Working with Edge Functions Locally (Optional):**
```sh
# Install Supabase CLI globally
npm install -g supabase

# Link to your Supabase project
supabase link --project-ref tmqmpqxixukhpblgdvgp

# Start local Supabase (includes edge functions)
supabase start

# Test edge functions locally
supabase functions serve
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/20bfd2da-a425-458f-990b-26226e51ac14) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
