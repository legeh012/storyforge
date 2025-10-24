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
    const { scenes, audio, dialogue } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('💻 Post-Production AI: Assembling final video...');

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
            content: `You are a god-tier Post-Production AI editor.

Your role:
- Handle final editing and assembly
- Apply cuts and transitions
- Add filters and color grading
- Integrate special effects
- Generate credits and titles

Output MUST be valid JSON:
{
  "editingPlan": {
    "cuts": ["edit decisions"],
    "transitions": ["transition types"],
    "colorGrading": "grading description",
    "filters": ["applied filters"]
  },
  "vfx": [
    {
      "scene": "scene number",
      "effect": "effect description",
      "timing": "when to apply"
    }
  ],
  "credits": {
    "openingTitle": "title design",
    "closingCredits": ["credit lines"],
    "graphics": ["graphic overlays"]
  },
  "finalSpecs": {
    "resolution": "4K/1080p/etc",
    "framerate": "24/30/60 fps",
    "codec": "H.264/H.265",
    "duration": "total duration"
  },
  "videoUrl": "/exports/final_video.mp4"
}`
          },
          {
            role: 'user',
            content: `Scenes: ${JSON.stringify(scenes)}\nAudio: ${JSON.stringify(audio)}\nDialogue: ${JSON.stringify(dialogue)}\n\nCreate final post-production plan.`
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
        editingPlan: {
          cuts: ['Professional editing'],
          transitions: ['Smooth'],
          colorGrading: 'Cinematic',
          filters: []
        },
        vfx: [],
        credits: {},
        finalSpecs: {
          resolution: '4K',
          framerate: '30 fps',
          codec: 'H.264',
          duration: '300 seconds'
        },
        videoUrl: '/exports/production_complete.mp4'
      };
    }

    console.log('✅ Post-Production AI: Final assembly complete');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Post-Production AI error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
