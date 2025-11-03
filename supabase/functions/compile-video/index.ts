import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CompileRequest {
  episodeId: string;
  userId: string;
  frameUrls: string[];
  frameDurations: number[];
  metadata: any;
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

    const { episodeId, userId, frameUrls, frameDurations, metadata } = await req.json() as CompileRequest;

    console.log(`🎬 Starting MP4 video compilation for episode ${episodeId}`);
    console.log(`📊 Processing ${frameUrls.length} frames into MP4 video`);

    // Use a video compilation service API
    // We'll use Shotstack API for professional video compilation
    const SHOTSTACK_API_KEY = Deno.env.get('SHOTSTACK_API_KEY');
    
    if (!SHOTSTACK_API_KEY) {
      console.warn('⚠️ SHOTSTACK_API_KEY not configured, using simplified video generation');
      
      // Fallback: Create video manifest for client-side playback
      const videoManifest = {
        type: 'image-sequence',
        episodeId,
        frames: frameUrls.map((url, index) => ({
          url,
          duration: frameDurations[index] || 5,
          index
        })),
        totalDuration: frameDurations.reduce((sum, d) => sum + d, 0),
        metadata,
        createdAt: new Date().toISOString(),
        format: 'video-manifest',
      };

      const manifestPath = `${userId}/${episodeId}/video-manifest.json`;
      await supabase.storage
        .from('episode-videos')
        .upload(manifestPath, JSON.stringify(videoManifest, null, 2), {
          contentType: 'application/json',
          upsert: true
        });

      const manifestUrl = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/episode-videos/${manifestPath}`;

      await supabase
        .from('episodes')
        .update({
          video_status: 'completed',
          video_url: manifestUrl,
          video_render_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', episodeId);

      return new Response(
        JSON.stringify({
          success: true,
          videoUrl: manifestUrl,
          format: 'manifest',
          totalFrames: frameUrls.length,
          message: 'Video manifest created - configure SHOTSTACK_API_KEY for MP4 export'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Compile frames into MP4 using Shotstack
    console.log('🎬 Compiling frames into MP4 video using Shotstack...');
    
    // Create Shotstack timeline
    const clips = frameUrls.map((url, index) => ({
      asset: {
        type: 'image',
        src: url
      },
      start: frameDurations.slice(0, index).reduce((sum, d) => sum + d, 0),
      length: frameDurations[index] || 5,
      fit: 'cover',
      scale: 1
    }));

    const shotstackPayload = {
      timeline: {
        background: '#000000',
        tracks: [{
          clips: clips
        }]
      },
      output: {
        format: 'mp4',
        resolution: 'hd',
        fps: 30,
        quality: 'high'
      }
    };

    const renderResponse = await fetch('https://api.shotstack.io/v1/render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': SHOTSTACK_API_KEY
      },
      body: JSON.stringify(shotstackPayload)
    });

    if (!renderResponse.ok) {
      throw new Error(`Shotstack render failed: ${await renderResponse.text()}`);
    }

    const renderData = await renderResponse.json();
    const renderId = renderData.response.id;
    
    console.log(`🎬 Shotstack render started: ${renderId}`);
    
    // Poll for completion (max 5 minutes)
    let videoUrl = null;
    const maxAttempts = 60;
    const pollInterval = 5000;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      const statusResponse = await fetch(`https://api.shotstack.io/v1/render/${renderId}`, {
        headers: { 'x-api-key': SHOTSTACK_API_KEY }
      });
      
      if (!statusResponse.ok) {
        console.error('Failed to check render status');
        continue;
      }
      
      const statusData = await statusResponse.json();
      const status = statusData.response.status;
      
      console.log(`📊 Render status: ${status} (attempt ${attempt + 1}/${maxAttempts})`);
      
      if (status === 'done') {
        videoUrl = statusData.response.url;
        console.log(`✅ MP4 video compiled: ${videoUrl}`);
        break;
      } else if (status === 'failed') {
        throw new Error('Video render failed in Shotstack');
      }
    }
    
    if (!videoUrl) {
      throw new Error('Video compilation timed out');
    }

    // Update episode with final MP4 video URL
    await supabase
      .from('episodes')
      .update({
        video_status: 'completed',
        video_url: videoUrl,
        video_render_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', episodeId);

    console.log('🎥 MP4 video compilation completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        videoUrl,
        format: 'mp4',
        totalFrames: frameUrls.length,
        totalDuration: frameDurations.reduce((sum, d) => sum + d, 0),
        message: 'MP4 video successfully compiled'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Video compilation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});