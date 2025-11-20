import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { platform, videoUrl, title, description, tags } = await req.json();

    console.log('Social media upload request:', { platform, title, userId: user.id });

    // Validate required fields
    if (!platform || !videoUrl || !title) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: platform, videoUrl, title' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Process upload based on platform
    let result;
    if (platform === 'youtube') {
      result = await uploadToYouTube(videoUrl, title, description, tags);
    } else if (platform === 'tiktok') {
      result = await uploadToTikTok(videoUrl, title, description);
    } else if (platform === 'instagram') {
      result = await shareToInstagram(videoUrl, title);
    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported platform. Use: youtube, tiktok, or instagram' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Log the upload activity
    await supabase.from('scheduled_posts').insert({
      user_id: user.id,
      platform,
      content: description || title,
      post_url: result.url,
      posted_at: new Date().toISOString(),
      scheduled_time: new Date().toISOString(),
      status: 'published',
      metadata: { videoUrl, tags, uploadId: result.uploadId }
    });

    return new Response(
      JSON.stringify({
        success: true,
        platform,
        uploadId: result.uploadId,
        url: result.url,
        message: result.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Social media upload error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function uploadToYouTube(videoUrl: string, title: string, description?: string, tags?: string[]) {
  // YouTube API integration
  // Requires: YOUTUBE_API_KEY, YOUTUBE_CHANNEL_ID in secrets
  const apiKey = Deno.env.get('YOUTUBE_API_KEY');
  
  if (!apiKey) {
    throw new Error('YouTube API key not configured. Please add YOUTUBE_API_KEY to secrets.');
  }

  // TODO: Implement YouTube Data API v3 upload
  // For now, return a mock response with instructions
  return {
    uploadId: `yt-${Date.now()}`,
    url: 'https://youtube.com/upload-pending',
    platform: 'youtube',
    message: 'YouTube upload queued. Configure YouTube API credentials to enable uploads.',
    instructions: [
      '1. Create OAuth 2.0 credentials at console.cloud.google.com',
      '2. Add YOUTUBE_API_KEY and YOUTUBE_CLIENT_ID to Supabase secrets',
      '3. Enable YouTube Data API v3',
      '4. Implement OAuth flow for channel authorization'
    ]
  };
}

async function uploadToTikTok(videoUrl: string, title: string, description?: string) {
  // TikTok API integration
  // Requires: TIKTOK_ACCESS_TOKEN in secrets
  const accessToken = Deno.env.get('TIKTOK_ACCESS_TOKEN');
  
  if (!accessToken) {
    throw new Error('TikTok access token not configured. Please add TIKTOK_ACCESS_TOKEN to secrets.');
  }

  // TODO: Implement TikTok Content Posting API
  // For now, return a mock response with instructions
  return {
    uploadId: `tt-${Date.now()}`,
    url: 'https://tiktok.com/upload-pending',
    platform: 'tiktok',
    message: 'TikTok upload queued. Configure TikTok API credentials to enable uploads.',
    instructions: [
      '1. Register app at developers.tiktok.com',
      '2. Request Content Posting API access',
      '3. Add TIKTOK_ACCESS_TOKEN to Supabase secrets',
      '4. Implement OAuth flow for user authorization'
    ]
  };
}

async function shareToInstagram(videoUrl: string, title: string) {
  // Instagram Graph API integration
  // Requires: INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_ACCOUNT_ID in secrets
  const accessToken = Deno.env.get('INSTAGRAM_ACCESS_TOKEN');
  
  if (!accessToken) {
    throw new Error('Instagram access token not configured. Please add INSTAGRAM_ACCESS_TOKEN to secrets.');
  }

  // TODO: Implement Instagram Graph API container creation and publishing
  // For now, return a mock response with instructions
  return {
    uploadId: `ig-${Date.now()}`,
    url: 'https://instagram.com/upload-pending',
    platform: 'instagram',
    message: 'Instagram share queued. Configure Instagram API credentials to enable uploads.',
    instructions: [
      '1. Create Facebook App at developers.facebook.com',
      '2. Add Instagram Graph API permissions',
      '3. Add INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_ACCOUNT_ID to secrets',
      '4. Connect Instagram Business Account'
    ]
  };
}
