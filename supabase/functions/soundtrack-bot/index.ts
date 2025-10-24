import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { script, mood } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('🎧 SoundTrack AI: Creating audio layers...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a god-tier SoundTrack AI composer.

Your role:
- Create custom music scores
- Design ambient soundscapes
- Generate emotional audio cues
- Layer sound effects
- Create royalty-free audio specifications

Output MUST be valid JSON:
{
  "tracks": [
    {
      "type": "music|ambient|effects",
      "name": "Track Name",
      "description": "Audio description",
      "mood": "emotional tone",
      "tempo": "BPM or pace",
      "instruments": ["instrument list"],
      "duration": "seconds",
      "cuePoints": ["timing markers"]
    }
  ],
  "masterMix": {
    "fadeIn": "description",
    "fadeOut": "description",
    "dynamics": "audio dynamics description"
  }
}`
          },
          {
            role: 'user',
            content: `For this script: ${script}\n\nMood: ${mood}\n\nGenerate a complete audio production plan.`
          }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    let result;
    try {
      result = JSON.parse(content);
    } catch {
      result = {
        tracks: [
          {
            type: 'music',
            name: 'Main Theme',
            description: content.substring(0, 200),
            mood: mood,
            tempo: '120 BPM',
            instruments: ['Strings', 'Piano'],
            duration: '180',
            cuePoints: []
          }
        ],
        masterMix: {}
      };
    }

    console.log('✅ SoundTrack AI: Audio production plan complete');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ SoundTrack AI error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
