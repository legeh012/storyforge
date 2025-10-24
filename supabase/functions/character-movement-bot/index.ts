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
    const { script, prompt } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('🧍 Character & Movement AI: Designing characters...');

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
            content: `You are a god-tier Character & Movement AI.

Your role:
- Design characters with realistic body language
- Create motion capture data specifications
- Sync dialogue with character movements
- Define voice tones and characteristics
- Generate character profiles

Output MUST be valid JSON:
{
  "characters": [
    {
      "name": "Character Name",
      "profile": "Description",
      "voiceTone": "Tone characteristics",
      "bodyLanguage": ["gesture1", "gesture2"],
      "motionData": {
        "walkingStyle": "description",
        "gestures": ["specific movements"],
        "facialExpressions": ["expression types"]
      },
      "dialogueSync": {
        "cadence": "speech pattern",
        "emphasis": ["key words"]
      }
    }
  ]
}`
          },
          {
            role: 'user',
            content: `Based on this script/prompt: ${script || prompt}\n\nGenerate detailed character designs with motion and voice specifications.`
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
        characters: [{
          name: 'Character A',
          profile: content.substring(0, 200),
          voiceTone: 'Dynamic',
          bodyLanguage: ['Expressive gestures'],
          motionData: {},
          dialogueSync: {}
        }]
      };
    }

    console.log('✅ Character & Movement AI: Character design complete');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Character & Movement AI error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
