# Local Bridge Server Setup for macOS Automation

This guide helps you set up a local bridge server that connects your macOS automation tools to Mayza.

## Quick Start

### 1. Install Dependencies

```bash
# Install Node.js if not already installed
brew install node

# Install required packages
npm install express cors axios
```

### 2. Create Bridge Server

Create a file `mayza-bridge.js`:

```javascript
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const app = express();

app.use(cors());
app.use(express.json());

const SUPABASE_URL = 'https://tmqmpqxixukhpblgdvgp.supabase.co';
const AUTH_TOKEN = 'YOUR_AUTH_TOKEN_HERE'; // Get from Mayza app

// File operations
app.post('/files/rename', async (req, res) => {
  const { files, pattern } = req.body;
  
  files.forEach(file => {
    exec(`mv "${file}" "${file.replace(/(.+)(\..+)$/, pattern + '$2')}"`, (error) => {
      if (error) console.error('Rename error:', error);
    });
  });
  
  res.json({ success: true, message: 'Files renamed' });
});

app.post('/files/move', async (req, res) => {
  const { files, destination } = req.body;
  
  files.forEach(file => {
    exec(`mv "${file}" "${destination}"`, (error) => {
      if (error) console.error('Move error:', error);
    });
  });
  
  res.json({ success: true, message: 'Files moved' });
});

// Application control
app.post('/app/open', async (req, res) => {
  const { appName } = req.body;
  exec(`open -a "${appName}"`, (error) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json({ success: true, message: `${appName} opened` });
  });
});

app.post('/app/zoom-join', async (req, res) => {
  const { meetingLink } = req.body;
  exec(`open "${meetingLink}"`, (error) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json({ success: true, message: 'Joining Zoom meeting' });
  });
});

const PORT = 3456;
app.listen(PORT, () => {
  console.log(`🚀 Mayza Bridge Server running on http://localhost:${PORT}`);
});
```

### 3. Run Bridge Server

```bash
node mayza-bridge.js
```

## Integration Examples

### Shell Script

```bash
#!/bin/bash
# mayza-command.sh

AUTH_TOKEN="your_auth_token_here"
AUTOMATION_API="https://tmqmpqxixukhpblgdvgp.supabase.co/functions/v1/automation-api"

curl -X POST "$AUTOMATION_API" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "command": "rename_files",
    "parameters": {
      "files": ["/path/to/file1.txt", "/path/to/file2.txt"],
      "pattern": "renamed_"
    }
  }'
```

### AppleScript

```applescript
-- Mayza AppleScript Integration
set authToken to "your_auth_token_here"
set apiUrl to "https://tmqmpqxixukhpblgdvgp.supabase.co/functions/v1/automation-api"

set commandJson to "{\"command\": \"open_app\", \"parameters\": {\"appName\": \"Zoom\"}}"

do shell script "curl -X POST " & quoted form of apiUrl & " -H 'Authorization: Bearer " & authToken & "' -H 'Content-Type: application/json' -d " & quoted form of commandJson
```

### Keyboard Maestro

1. Create new macro with "Execute Shell Script" action:

```bash
curl -X POST "https://tmqmpqxixukhpblgdvgp.supabase.co/functions/v1/automation-api" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"command": "orchestrator_task", "parameters": {"task": "Create a report"}}'
```

### Automator

1. Create new Quick Action
2. Add "Run Shell Script" action
3. Paste automation API call from shell script example above

### Hazel Rules

1. Create new rule for folder
2. Add "Run shell script" action with embedded command:

```bash
curl -X POST "https://tmqmpqxixukhpblgdvgp.supabase.co/functions/v1/automation-api" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"command\": \"move_files\", \"parameters\": {\"files\": [\"$1\"], \"targetFolder\": \"/destination\"}}"
```

## Voice Control Setup

### Using Siri Shortcuts

1. Create new Shortcut
2. Add "Get Contents of URL" action
3. Configure:
   - URL: `https://tmqmpqxixukhpblgdvgp.supabase.co/functions/v1/voice-automation`
   - Method: POST
   - Headers: Add Authorization with your token
   - Request Body: JSON with `{"voiceCommand": "your command"}`

### Using Dictation + Keyboard Maestro

1. Enable macOS Dictation
2. Create Keyboard Maestro macro triggered by spoken phrase
3. Pass dictation result to voice-automation endpoint

## Getting Your Auth Token

1. Open Mayza app
2. Go to Profile/Settings
3. Copy your API token
4. Use in scripts as `Authorization: Bearer YOUR_TOKEN`

## Available Commands

- `rename_files` - Rename multiple files
- `move_files` - Move files to folder
- `organize_files` - Auto-organize by type
- `open_app` - Open macOS application
- `join_meeting` - Join Zoom/Teams meeting
- `fill_form` - Fill form fields
- `create_report` - Generate report
- `draft_email` - Draft email in Mail app
- `summarize_document` - Summarize document
- `orchestrator_task` - Custom Mayza task

## Security Notes

- Keep your auth token secure
- Bridge server runs locally only
- Use HTTPS for production
- Rotate tokens regularly

## Troubleshooting

**Bridge server won't start:**
- Check if port 3456 is available
- Verify Node.js installation

**Commands not executing:**
- Verify auth token is correct
- Check bridge server logs
- Ensure macOS permissions granted

**Voice commands not working:**
- Test with text commands first
- Check microphone permissions
- Verify Whisper API access
