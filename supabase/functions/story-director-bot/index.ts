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
    const { prompt } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('🎬 StoryDirector AI: Developing plot and arcs for:', prompt);

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
            content: `You are a god-tier StoryDirector AI for reality TV and cinematic productions.
            
Your role:
- Develop compelling plots with dramatic arcs
- Create emotional beats and character development
- Design episode structures with hooks and cliffhangers
- Generate detailed scripts and storyboards

Output MUST be valid JSON with this structure:
{
  "title": "Episode Title",
  "synopsis": "Brief overview",
  "script": "Full detailed script with scene descriptions",
  "storyboard": ["Scene 1 description", "Scene 2 description"],
  "characterArcs": [{"character": "Name", "arc": "Development path"}],
  "emotionalBeats": ["Beat 1", "Beat 2"],
  "dramaticStructure": {
    "act1": "Setup",
    "act2": "Confrontation", 
    "act3": "Resolution"
  }
}`
          },
          {
            role: 'user',
            content: `Create a god-tier story treatment for: ${prompt}`
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
        title: 'Generated Story',
        synopsis: content.substring(0, 200),
        script: content,
        storyboard: ['Scene analysis generated'],
        characterArcs: [],
        emotionalBeats: [],
        dramaticStructure: {}
      };
    }

    console.log('✅ StoryDirector AI: Plot development complete');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ StoryDirector AI error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
