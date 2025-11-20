import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { voiceCommand, audio } = await req.json();

    console.log('Voice automation command received:', { hasVoiceCommand: !!voiceCommand, hasAudio: !!audio, userId: user.id });

    let transcribedText = voiceCommand;

    // If audio provided, transcribe it first using whisper
    if (audio && !voiceCommand) {
      const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: audio,
          model: 'whisper-1',
        }),
      });

      if (!whisperResponse.ok) {
        throw new Error('Voice transcription failed');
      }

      const whisperData = await whisperResponse.json();
      transcribedText = whisperData.text;
    }

    // Parse voice command into automation action
    const automationCommand = parseVoiceCommand(transcribedText);

    // Execute automation via automation-api
    const automationResponse = await fetch(`${supabaseUrl}/functions/v1/automation-api`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(automationCommand),
    });

    if (!automationResponse.ok) {
      throw new Error('Automation execution failed');
    }

    const automationResult = await automationResponse.json();

    // Generate voice response using god-tier voice bot
    const voiceResponse = await fetch(`${supabaseUrl}/functions/v1/godlike-voice-bot`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: generateResponseText(automationResult),
        voice: 'nova',
        speed: 1.0,
      }),
    });

    if (!voiceResponse.ok) {
      throw new Error('Voice generation failed');
    }

    const voiceData = await voiceResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        transcribedCommand: transcribedText,
        automationResult,
        voiceResponse: voiceData.audioContent,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Voice automation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function parseVoiceCommand(text: string): { command: string; parameters: any } {
  const lowerText = text.toLowerCase();

  // Rename files
  if (lowerText.includes('rename') && lowerText.includes('file')) {
    return {
      command: 'rename_files',
      parameters: { files: [], pattern: 'voice-command' }
    };
  }

  // Move files
  if (lowerText.includes('move') && (lowerText.includes('file') || lowerText.includes('pdf'))) {
    const folderMatch = text.match(/to\s+(.+?)(?:\.|$)/i);
    return {
      command: 'move_files',
      parameters: { files: [], targetFolder: folderMatch?.[1] || 'destination' }
    };
  }

  // Open app / join meeting
  if (lowerText.includes('open') && lowerText.includes('zoom')) {
    return {
      command: 'join_meeting',
      parameters: { appName: 'Zoom', meetingLink: '' }
    };
  }

  if (lowerText.includes('open')) {
    const appMatch = text.match(/open\s+(.+?)(?:\.|$)/i);
    return {
      command: 'open_app',
      parameters: { appName: appMatch?.[1] || 'app' }
    };
  }

  // Create report
  if (lowerText.includes('create') && lowerText.includes('report')) {
    return {
      command: 'create_report',
      parameters: { content: text }
    };
  }

  // Draft email
  if (lowerText.includes('draft') && lowerText.includes('email')) {
    return {
      command: 'draft_email',
      parameters: { content: text }
    };
  }

  // Summarize document
  if (lowerText.includes('summarize')) {
    return {
      command: 'summarize_document',
      parameters: { documentPath: '', content: text }
    };
  }

  // Default: orchestrator task
  return {
    command: 'orchestrator_task',
    parameters: { task: text, department: 'general' }
  };
}

function generateResponseText(result: any): string {
  if (!result.success) {
    return `Sorry, I couldn't complete that task. ${result.error || 'Please try again.'}`;
  }

  const commandResponses: Record<string, string> = {
    'rename_files': `Done! I've queued the file renaming.`,
    'move_files': `Got it! Moving those files to ${result.details?.targetFolder || 'the destination'}.`,
    'open_app': `Opening ${result.details?.appName || 'the app'} now.`,
    'join_meeting': `Joining the meeting now.`,
    'create_report': `I'm creating that report for you.`,
    'draft_email': `Drafting the email now.`,
    'summarize_document': `I'm summarizing that document.`,
    'orchestrator_task': `On it! I've started working on that task.`,
  };

  return commandResponses[result.command] || `Task ${result.command} is being processed.`;
}
