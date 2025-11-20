import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutoEditRequest {
  episodeId?: string;
  scenes: any[];
  preferences?: {
    style?: 'cinematic' | 'dynamic' | 'minimal' | 'viral';
    pacing?: 'slow' | 'medium' | 'fast';
    mood?: string;
    targetDuration?: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { episodeId, scenes, preferences = {} } = await req.json() as AutoEditRequest;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('🎬 Mayza Auto-Editor: Analyzing scenes for intelligent editing...');
    console.log(`📊 Processing ${scenes.length} scenes with ${preferences.style || 'cinematic'} style`);

    // Step 1: AI-powered scene analysis and optimization
    const analysisPrompt = `You are Mayza's auto-editing AI with god-tier editing capabilities.

Analyze these scenes and create an optimized edit:

Scenes: ${JSON.stringify(scenes, null, 2)}

Editing Preferences:
- Style: ${preferences.style || 'cinematic'}
- Pacing: ${preferences.pacing || 'medium'}
- Mood: ${preferences.mood || 'dramatic'}
- Target Duration: ${preferences.targetDuration || 'optimal'}

Provide intelligent editing decisions:
1. Scene ordering and sequencing
2. Optimal duration for each scene
3. Transition types between scenes
4. Color grading recommendations
5. Audio/music sync points
6. Visual effects to apply
7. Text overlays and titles
8. Pacing adjustments
9. Cut points and timing
10. Overall narrative flow

Return ONLY valid JSON:
{
  "editedScenes": [
    {
      "id": "scene-id",
      "order": 1,
      "duration": 5.5,
      "cuts": ["cut points in seconds"],
      "transition": "fade/cut/slide/zoom",
      "colorGrading": "warm/cool/vibrant/muted",
      "effects": ["effect names"],
      "textOverlays": [{"text": "content", "timing": 1.5, "position": "center"}],
      "musicSync": {"start": 0, "intensity": "high/medium/low"},
      "reasoning": "why this edit works"
    }
  ],
  "overallPacing": "description",
  "narrativeArc": "beginning/middle/end structure",
  "totalDuration": 30,
  "qualityScore": 9.5,
  "recommendations": ["additional suggestions"]
}`;

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
            content: 'You are Mayza\'s god-tier auto-editing AI. You understand cinematic timing, narrative flow, pacing, and visual storytelling at the highest level. Provide intelligent, production-ready editing decisions.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again in a moment.',
          code: 'RATE_LIMIT'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'Payment required. Please add credits to continue using Mayza AI.',
          code: 'PAYMENT_REQUIRED'
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    let editingResult;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        editingResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.warn('Failed to parse AI response, using fallback', parseError);
      // Fallback with intelligent defaults
      editingResult = {
        editedScenes: scenes.map((scene, index) => ({
          ...scene,
          order: index + 1,
          duration: scene.duration || 5,
          transition: index === 0 ? 'fade' : 'cut',
          colorGrading: 'cinematic',
          effects: [],
          textOverlays: [],
          musicSync: { start: 0, intensity: 'medium' },
          reasoning: 'Standard edit with professional defaults'
        })),
        overallPacing: preferences.pacing || 'medium',
        narrativeArc: 'Classic three-act structure',
        totalDuration: scenes.reduce((sum, s) => sum + (s.duration || 5), 0),
        qualityScore: 8.0,
        recommendations: ['Consider adding transitions', 'Optimize pacing for platform']
      };
    }

    // Step 2: Apply automatic optimizations
    console.log('⚡ Applying AI-powered optimizations...');
    
    const optimizedScenes = editingResult.editedScenes.map((scene: any) => ({
      ...scene,
      // Add smart defaults if AI didn't provide them
      transition: scene.transition || 'fade',
      colorGrading: scene.colorGrading || 'natural',
      effects: scene.effects || [],
      // Auto-calculate optimal timing
      duration: scene.duration || (preferences.targetDuration 
        ? preferences.targetDuration / editingResult.editedScenes.length 
        : 5),
    }));

    // Step 3: Store editing results if episodeId provided
    if (episodeId) {
      console.log('💾 Saving auto-edit results to database...');
      
      await supabase
        .from('episodes')
        .update({
          storyboard: optimizedScenes,
          updated_at: new Date().toISOString()
        })
        .eq('id', episodeId);
    }

    console.log('✅ Mayza Auto-Editor: Edit complete');
    console.log(`📊 Quality Score: ${editingResult.qualityScore}/10`);
    console.log(`⏱️ Total Duration: ${editingResult.totalDuration}s`);

    return new Response(
      JSON.stringify({
        success: true,
        editedScenes: optimizedScenes,
        metadata: {
          totalDuration: editingResult.totalDuration,
          qualityScore: editingResult.qualityScore,
          overallPacing: editingResult.overallPacing,
          narrativeArc: editingResult.narrativeArc,
          recommendations: editingResult.recommendations,
        },
        message: 'Auto-edit complete with AI-powered optimizations'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Auto-Editor error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'AUTO_EDIT_ERROR'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
