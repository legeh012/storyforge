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

    console.log('🎥 Cinematography AI: Planning camera work...');

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
            content: `You are a god-tier Cinematography AI director.

Your role:
- Design camera angles and movements
- Create lighting setups
- Plan scene transitions
- Generate shot lists
- Direct visual storytelling

Output MUST be valid JSON:
{
  "scenes": [
    {
      "sceneNumber": 1,
      "location": "Setting",
      "cameraAngles": ["angle descriptions"],
      "lighting": {
        "setup": "lighting description",
        "mood": "visual mood",
        "colorGrading": "color palette"
      },
      "shotList": [
        {
          "shot": "Shot type (wide/close-up/etc)",
          "camera": "camera movement",
          "framing": "composition",
          "duration": "seconds"
        }
      ],
      "transitions": "transition type to next scene"
    }
  ],
  "visualStyle": "Overall cinematic style"
}`
          },
          {
            role: 'user',
            content: `Script: ${script}\nCharacters: ${JSON.stringify(characters)}\n\nCreate complete cinematography plan.`
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
        scenes: [{
          sceneNumber: 1,
          location: 'Scene setting',
          cameraAngles: ['Dynamic angles'],
          lighting: { setup: 'Dramatic', mood: 'Intense' },
          shotList: [],
          transitions: 'Smooth'
        }],
        visualStyle: 'Cinematic'
      };
    }

    console.log('✅ Cinematography AI: Visual direction complete');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Cinematography AI error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
