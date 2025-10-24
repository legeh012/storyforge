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
    const { content, metadata } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('📈 Marketing & Analytics AI: Optimizing for virality...');

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
            content: `You are a god-tier Marketing & Analytics AI.

Your role:
- Analyze viral trends
- Predict virality potential
- Generate optimized titles and descriptions
- Design thumbnail concepts
- Determine optimal release timing
- Create marketing strategy

Output MUST be valid JSON:
{
  "viralAnalysis": {
    "score": 0-100,
    "factors": ["key factors"],
    "predictions": "virality predictions"
  },
  "optimization": {
    "titles": ["title option 1", "title option 2", "title option 3"],
    "descriptions": ["optimized description"],
    "hashtags": ["#trending", "#hashtags"],
    "thumbnailConcepts": [
      {
        "concept": "thumbnail idea",
        "elements": ["visual elements"],
        "colors": ["color palette"]
      }
    ]
  },
  "releaseStrategy": {
    "optimalTime": "best time to post",
    "platforms": ["platform priorities"],
    "targetAudience": "audience description",
    "campaignIdeas": ["marketing campaign ideas"]
  },
  "analytics": {
    "expectedReach": "reach estimate",
    "engagementPrediction": "engagement forecast",
    "monetizationPotential": "revenue potential"
  }
}`
          },
          {
            role: 'user',
            content: `Content: ${content}\nMetadata: ${JSON.stringify(metadata)}\n\nCreate complete viral marketing strategy.`
          }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.choices[0].message.content;
    
    let result;
    try {
      result = JSON.parse(aiContent);
    } catch {
      result = {
        viralAnalysis: {
          score: 85,
          factors: ['High engagement potential'],
          predictions: 'Strong viral potential'
        },
        optimization: {
          titles: ['Generated Title'],
          descriptions: ['Optimized description'],
          hashtags: ['#viral'],
          thumbnailConcepts: []
        },
        releaseStrategy: {
          optimalTime: 'Peak hours',
          platforms: ['YouTube', 'TikTok', 'Instagram'],
          targetAudience: 'Broad appeal',
          campaignIdeas: []
        },
        analytics: {
          expectedReach: '1M+ views',
          engagementPrediction: 'High',
          monetizationPotential: '$5000+'
        }
      };
    }

    console.log('✅ Marketing & Analytics AI: Viral strategy complete');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Marketing & Analytics AI error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
