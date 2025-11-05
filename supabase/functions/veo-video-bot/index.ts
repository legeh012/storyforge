import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VeoRequest {
  episodeId: string;
  enhancementLevel?: 'standard' | 'premium' | 'god-tier';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token || '');
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { episodeId, enhancementLevel = 'god-tier' } = await req.json() as VeoRequest;

    console.log(`🎬 Veo God-Tier Bot: Starting video generation for episode ${episodeId}`);

    // Fetch episode data
    const { data: episode, error: episodeError } = await supabase
      .from('episodes')
      .select('*, projects(*)')
      .eq('id', episodeId)
      .single();

    if (episodeError || !episode) {
      throw new Error('Episode not found');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Step 1: God-Tier Cinematic Analysis
    console.log('🎨 Analyzing script for cinematic excellence...');
    
    const cinematicPrompt = `You are a world-class film director AI, equivalent to Veo 3.1 video generation capabilities.

SCRIPT:
${episode.script || episode.content || episode.synopsis}

PROJECT CONTEXT:
- Genre: ${episode.projects?.genre || 'drama'}
- Theme: ${episode.projects?.theme || 'contemporary'}
- Style: Netflix-grade photorealistic

TASK: Generate a detailed scene-by-scene breakdown with:
1. Camera movements (dolly, crane, steadicam, handheld)
2. Lighting design (three-point, natural, dramatic, golden hour)
3. Shot composition (rule of thirds, leading lines, depth of field)
4. Character blocking and movement
5. Emotional beats and pacing
6. Color grading recommendations
7. VFX requirements
8. Audio/soundtrack cues

Return ONLY valid JSON array of scenes with this structure:
[{
  "sceneNumber": 1,
  "duration": 5,
  "location": "location description",
  "timeOfDay": "morning/afternoon/evening/night",
  "weatherCondition": "clear/cloudy/rainy/etc",
  "cameraMovement": "detailed camera movement",
  "shotType": "wide/medium/close-up/extreme close-up",
  "lighting": "detailed lighting setup",
  "characterActions": "what characters do",
  "dialogue": "spoken dialogue",
  "emotionalTone": "emotional atmosphere",
  "colorPalette": ["#color1", "#color2"],
  "soundDesign": "audio description",
  "vfxNotes": "special effects needed",
  "imagePrompt": "ultra-detailed photorealistic prompt for image generation"
}]`;

    const cinematicResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a Veo 3.1-level AI cinematographer. Return ONLY valid JSON.' },
          { role: 'user', content: cinematicPrompt }
        ],
      }),
    });

    let scenes = [];
    if (cinematicResponse.ok) {
      const data = await cinematicResponse.json();
      const content = data.choices[0].message.content;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        scenes = JSON.parse(jsonMatch[0]);
        console.log(`✅ Generated ${scenes.length} cinematic scenes`);
      }
    }

    if (scenes.length === 0) {
      throw new Error('Failed to generate scenes');
    }

    // Step 2: God-Tier Image Generation
    console.log('🎥 Generating photorealistic frames...');
    const frameUrls: string[] = [];
    const frameDurations: number[] = [];
    const BATCH_SIZE = 3;

    for (let i = 0; i < scenes.length; i += BATCH_SIZE) {
      const batch = scenes.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(async (scene: any, batchIndex: number) => {
        const sceneIndex = i + batchIndex;
        
        const enhancedPrompt = `${scene.imagePrompt}

TECHNICAL SPECIFICATIONS:
- Netflix-grade photorealistic quality
- Camera: ${scene.cameraMovement}, ${scene.shotType}
- Lighting: ${scene.lighting}
- Time: ${scene.timeOfDay}
- Weather: ${scene.weatherCondition}
- Color: ${scene.colorPalette?.join(', ')}
- Style: Cinematic, professional, ultra-realistic
- NO: cartoon, anime, illustration, 3D render, CGI look
- YES: Real photography, film quality, authentic skin texture, natural lighting`;

        console.log(`📸 Generating frame ${sceneIndex + 1}/${scenes.length}...`);

        const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-image-preview',
            messages: [{
              role: 'user',
              content: enhancedPrompt
            }],
            modalities: ['image', 'text']
          }),
        });

        if (!imageResponse.ok) {
          throw new Error(`Image generation failed for scene ${sceneIndex + 1}`);
        }

        const imageData = await imageResponse.json();
        const base64Image = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        
        if (!base64Image) {
          throw new Error(`No image generated for scene ${sceneIndex + 1}`);
        }

        // Upload to storage
        const imageBuffer = Uint8Array.from(atob(base64Image.split(',')[1]), c => c.charCodeAt(0));
        const framePath = `${user.id}/${episodeId}/veo-frames/frame-${sceneIndex.toString().padStart(4, '0')}.png`;
        
        await supabase.storage
          .from('episode-videos')
          .upload(framePath, imageBuffer, {
            contentType: 'image/png',
            upsert: true
          });

        const frameUrl = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/episode-videos/${framePath}`;
        
        return {
          url: frameUrl,
          duration: scene.duration || 5,
          scene: scene
        };
      });

      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(result => {
        frameUrls.push(result.url);
        frameDurations.push(result.duration);
      });

      console.log(`✅ Batch ${Math.floor(i / BATCH_SIZE) + 1} complete`);
    }

    // Step 3: Trigger compilation
    console.log('🎬 Triggering god-tier video compilation...');
    
    const compilationResponse = await supabase.functions.invoke('compile-video', {
      body: {
        episodeId,
        userId: user.id,
        frameUrls,
        frameDurations,
        metadata: {
          enhancementLevel,
          scenes,
          totalScenes: scenes.length,
          cinematicAnalysis: 'veo-god-tier',
          generatedBy: 'veo-video-bot'
        }
      }
    });

    if (compilationResponse.error) {
      console.error('Compilation error:', compilationResponse.error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        episodeId,
        totalFrames: frameUrls.length,
        totalDuration: frameDurations.reduce((sum, d) => sum + d, 0),
        scenes: scenes.length,
        enhancementLevel,
        message: 'God-tier video generation complete'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Veo bot error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
