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
    const { script, characters } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('🗣️ Dialogue AI: Generating voice performances...');

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
            content: `You are a god-tier Dialogue AI for voice generation.

Your role:
- Generate natural, culturally nuanced speech
- Create voice acting specifications
- Design TTS parameters
- Sync dialogue with emotion
- Generate multilingual dialogue

Output MUST be valid JSON:
{
  "dialogueLines": [
    {
      "character": "Character Name",
      "line": "Dialogue text",
      "emotion": "emotional state",
      "delivery": "how to deliver line",
      "voiceSettings": {
        "pitch": "high/medium/low",
        "speed": "fast/medium/slow",
        "emphasis": ["emphasized words"]
      },
      "culturalNuance": "cultural context"
    }
  ],
  "voiceFiles": [
    {
      "character": "name",
      "fileSpec": "TTS specification",
      "model": "voice model to use"
    }
  ]
}`
          },
          {
            role: 'user',
            content: `Script: ${script}\nCharacters: ${JSON.stringify(characters)}\n\nGenerate complete dialogue and voice specifications.`
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
        dialogueLines: [{
          character: 'Character',
          line: content.substring(0, 200),
          emotion: 'Dynamic',
          delivery: 'Natural',
          voiceSettings: {},
          culturalNuance: 'Authentic'
        }],
        voiceFiles: []
      };
    }

    console.log('✅ Dialogue AI: Voice generation complete');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Dialogue AI error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
