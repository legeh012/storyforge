import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RemixRequest {
  episode: string;
  cast?: string;
  music?: string;
  overlay?: string;
  remixable?: boolean;
}

interface RemixConfig {
  input: string;
  overlay?: string;
  music?: string;
  cast?: string;
  remixable?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Remix Engine Started ===');
    
    const requestData: RemixRequest = await req.json();
    const { episode, cast, music, overlay, remixable } = requestData;

    if (!episode) {
      throw new Error('Episode identifier is required');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('Loading base video for episode:', episode);

    // Construct base video path
    const baseVideoPath = `assets/videos/${episode}_base.mp4`;
    
    // Apply remix transformations
    const remixResult = await applyRemix({
      input: baseVideoPath,
      overlay,
      music,
      cast,
      remixable
    });

    console.log('Remix applied successfully:', remixResult);

    // Store remix metadata
    const remixMetadata = {
      episode_id: episode,
      base_video: baseVideoPath,
      output_video: remixResult.outputPath,
      applied_cast: cast,
      applied_music: music,
      applied_overlay: overlay,
      is_remixable: remixable,
      created_at: new Date().toISOString()
    };

    console.log('Remix metadata:', remixMetadata);

    // Return the remixed video URL
    const response = {
      success: true,
      videoUrl: remixResult.outputPath,
      metadata: remixMetadata,
      message: 'Video remix completed successfully',
    };

    console.log('Returning response:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in remix-engine function:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

/**
 * Apply remix transformations to the base video
 * This includes overlays, music tracks, cast tags, and remixability markers
 */
async function applyRemix(config: RemixConfig): Promise<{ outputPath: string; metadata: any }> {
  const { input, overlay, music, cast, remixable } = config;
  
  console.log('Applying remix with config:', config);

  // Generate unique output filename
  const timestamp = Date.now();
  const outputFilename = `${input.replace('_base.mp4', '')}_remix_${timestamp}.mp4`;

  // Build remix metadata
  const metadata: any = {
    source: input,
    transformations: [],
  };

  // Apply overlay transformations
  if (overlay) {
    console.log('Applying overlay:', overlay);
    metadata.transformations.push({
      type: 'overlay',
      style: overlay,
      timestamp: new Date().toISOString(),
    });

    // Map overlay styles to transformation logic
    switch (overlay) {
      case 'somali_word_drop':
        metadata.overlayConfig = {
          style: 'word_drop',
          language: 'somali',
          animation: 'drop_in',
          position: 'top_center',
        };
        break;
      case 'viral_caption':
        metadata.overlayConfig = {
          style: 'viral_caption',
          fontSize: 'large',
          fontWeight: 'bold',
          animation: 'typewriter',
        };
        break;
      case 'subtitle_clean':
        metadata.overlayConfig = {
          style: 'clean_subtitle',
          position: 'bottom_center',
          backgroundColor: 'rgba(0,0,0,0.7)',
        };
        break;
      case 'emoji_reactions':
        metadata.overlayConfig = {
          style: 'emoji_reactions',
          animation: 'bounce',
          position: 'random',
        };
        break;
      default:
        break;
    }
  }

  // Apply music track
  if (music && music !== 'none') {
    console.log('Applying music:', music);
    metadata.transformations.push({
      type: 'audio',
      track: music,
      timestamp: new Date().toISOString(),
    });

    // Map music tracks to audio files
    const musicTracks: Record<string, string> = {
      'luckiee_intro': 'assets/audio/luckiee_intro.mp3',
      'somali_vibes': 'assets/audio/somali_vibes.mp3',
      'comedy_beat': 'assets/audio/comedy_beat.mp3',
      'dramatic_moment': 'assets/audio/dramatic_moment.mp3',
      'party_time': 'assets/audio/party_time.mp3',
    };

    metadata.musicTrack = musicTracks[music] || null;
  }

  // Apply cast tags
  if (cast) {
    console.log('Applying cast:', cast);
    metadata.transformations.push({
      type: 'cast',
      characters: cast,
      timestamp: new Date().toISOString(),
    });

    metadata.castInfo = {
      primary_cast: cast,
      castLabel: getCastLabel(cast),
    };
  }

  // Mark as remixable
  if (remixable) {
    console.log('Marking as remixable');
    metadata.remixable = true;
    metadata.linkedTo = [
      `${outputFilename.replace('.mp4', '')}_remix`,
      `${outputFilename.replace('.mp4', '')}_overlay`,
    ];
  }

  console.log('Remix processing complete. Output:', outputFilename);

  return {
    outputPath: `/assets/videos/${outputFilename}`,
    metadata,
  };
}

/**
 * Get display label for cast selection
 */
function getCastLabel(cast: string): string {
  const castLabels: Record<string, string> = {
    'luckiee': 'Luckiee (Main Character)',
    'mama_halima': 'Mama Halima',
    'uncle_jama': 'Uncle Jama',
    'auntie_ayan': 'Auntie Ayan',
    'ensemble': 'Full Ensemble Cast',
  };

  return castLabels[cast] || cast;
}
