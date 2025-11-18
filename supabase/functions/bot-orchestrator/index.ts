import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { message, context, campaign_type, topic, episodeId, projectId, mode } = await req.json();
    
    // God-Tier mode can operate without auth for public access
    let userId = null;
    let isGodTier = mode === 'god_tier';
    
    if (!isGodTier) {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) throw new Error('No authorization header');

      const { data: { user }, error: userError } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      );

      if (userError || !user) throw new Error('Unauthorized');
      userId = user.id;
    }

    // GOD-TIER MODE: All capabilities available, no restrictions (Personal App Mode - No Payment)
    if (isGodTier) {
      console.log('⚡ GOD-TIER ORCHESTRATOR: All capabilities activated (Personal Mode)');
      
      // Analyze message with keyword matching for capability routing
      const messageLower = message.toLowerCase();
      const capabilities: string[] = [];
      const actions: string[] = [];
      
      // Determine capabilities based on keywords
      if (messageLower.match(/video|episode|production|render|film/)) {
        capabilities.push('Video Director', 'Production Team');
        actions.push('Prepare video production pipeline', 'Generate storyboard');
      }
      if (messageLower.match(/app|code|build|develop|feature/)) {
        capabilities.push('App Builder', 'AI Engineer');
        actions.push('Analyze requirements', 'Plan implementation');
      }
      if (messageLower.match(/audio|voice|sound|music|soundtrack/)) {
        capabilities.push('Audio Master', 'Voice Synthesis');
        actions.push('Prepare audio generation', 'Configure voice settings');
      }
      if (messageLower.match(/design|creative|ui|ux|style/)) {
        capabilities.push('Creative Studio', 'Design System');
        actions.push('Design analysis', 'Style recommendations');
      }
      if (messageLower.match(/viral|trend|marketing|analytics|optimize/)) {
        capabilities.push('Viral Optimizer', 'Marketing Analytics');
        actions.push('Trend analysis', 'Optimization strategy');
      }
      if (messageLower.match(/script|story|character|dialogue/)) {
        capabilities.push('Script Generator', 'Story Director');
        actions.push('Script development', 'Character planning');
      }
      
      // Default capabilities if none matched
      if (capabilities.length === 0) {
        capabilities.push('App Builder', 'Video Director', 'Creative Studio');
        actions.push('Analyze request', 'Provide guidance', 'Orchestrate workflow');
      }
      
      // Generate contextual response
      let response = `I've activated ${capabilities.join(', ')} for your request. `;
      
      if (episodeId) {
        response += `Working on episode ${episodeId}. `;
      }
      if (projectId) {
        response += `Project ${projectId} ready. `;
      }
      
      response += `Here's what I'll do:\n\n${actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\n`;
      response += `All god-tier capabilities are standing by. What would you like to focus on first?`;
      
      const analysis = {
        capabilities,
        actions,
        response
      };

      return new Response(
        JSON.stringify({
          success: true,
          mode: 'god_tier',
          activatedCapabilities: analysis.capabilities,
          recommendedActions: analysis.actions,
          response: analysis.response,
          message: '⚡ God-Tier Orchestrator engaged - All capabilities available'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Standard mode with role checks
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    const isAdmin = userRole?.role === 'admin';
    const isCreator = userRole?.role === 'creator';

    console.log(`🤖 Autonomous Orchestrator activated for ${isAdmin ? 'ADMIN' : 'CREATOR'}`);

    // Get user's active bots
    const { data: bots, error: botsError } = await supabase
      .from('viral_bots')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (botsError) throw botsError;

    const orchestrationSteps = [];
    let autonomousMode = 'standard';

    // ADMIN: Full autonomous orchestration with advanced AI decision-making
    if (isAdmin && campaign_type === 'full_viral_campaign') {
      autonomousMode = 'god_tier_autonomous';
      
      console.log('🎯 ADMIN MODE: Activating GOD-TIER autonomous orchestration');
      
      // Admin gets ALL bots with intelligent auto-sequencing
      orchestrationSteps.push(
        { bot: 'Trend Detection', action: 'AI-powered trend analysis with predictive modeling', status: 'queued', priority: 1 },
        { bot: 'Script Generator', action: 'Multi-variant viral script generation', status: 'queued', priority: 2 },
        { bot: 'Cultural Injection', action: 'Deep cultural context integration', status: 'queued', priority: 3 },
        { bot: 'Expert Director', action: 'Cinematic direction with advanced techniques', status: 'queued', priority: 4 },
        { bot: 'Scene Orchestration', action: 'Reality TV-style scene optimization', status: 'queued', priority: 5 },
        { bot: 'Hook Optimization', action: 'Multi-platform hook testing and optimization', status: 'queued', priority: 6 },
        { bot: 'Ultra Video Bot', action: 'GEN-3 ALPHA TURBO photorealistic generation', status: 'queued', priority: 7 },
        { bot: 'Remix Bot', action: 'AI-driven content variations for all platforms', status: 'queued', priority: 8 },
        { bot: 'Cross-Platform Poster', action: 'Intelligent scheduling across all platforms', status: 'queued', priority: 9 },
        { bot: 'Performance Tracker', action: 'Real-time analytics with auto-optimization', status: 'queued', priority: 10 }
      );

      // Log admin orchestration
      await supabase.from('bot_activities').insert({
        bot_id: null,
        user_id: userId,
        status: 'running',
        results: { 
          mode: 'god_tier_autonomous',
          topic,
          episodeId,
          projectId,
          activatedBots: orchestrationSteps.length
        }
      });
    }
    // CREATOR: Smart autonomous orchestration with essential bots
    else if (isCreator && campaign_type === 'full_viral_campaign') {
      autonomousMode = 'creator_autonomous';
      
      console.log('⚡ CREATOR MODE: Activating smart autonomous orchestration');
      
      // Creator gets core viral optimization bots
      const trendBot = bots.find(b => b.bot_type === 'trend_detection');
      if (trendBot) {
        orchestrationSteps.push({
          bot: 'Trend Detection',
          action: 'Analyze trending topics for viral opportunities',
          status: 'queued',
          priority: 1
        });
      }

      const scriptBot = bots.find(b => b.bot_type === 'script_generator');
      if (scriptBot) {
        orchestrationSteps.push({
          bot: 'Script Generator',
          action: 'Create viral-optimized script',
          status: 'queued',
          priority: 2
        });
      }

      const hookBot = bots.find(b => b.bot_type === 'hook_optimization');
      if (hookBot) {
        orchestrationSteps.push({
          bot: 'Hook Optimization',
          action: 'Optimize title and description for CTR',
          status: 'queued',
          priority: 3
        });
      }

      const remixBot = bots.find(b => b.bot_type === 'remix');
      if (remixBot) {
        orchestrationSteps.push({
          bot: 'Remix Bot',
          action: 'Generate platform-specific variations',
          status: 'queued',
          priority: 4
        });
      }

      const posterBot = bots.find(b => b.bot_type === 'cross_platform_poster');
      if (posterBot) {
        orchestrationSteps.push({
          bot: 'Cross-Platform Poster',
          action: 'Schedule posts across platforms',
          status: 'queued',
          priority: 5
        });
      }

      const trackerBot = bots.find(b => b.bot_type === 'performance_tracker');
      if (trackerBot) {
        orchestrationSteps.push({
          bot: 'Performance Tracker',
          action: 'Monitor campaign metrics',
          status: 'queued',
          priority: 6
        });
      }

      // Log creator orchestration
      await supabase.from('bot_activities').insert({
        bot_id: null,
        user_id: userId,
        status: 'running',
        results: { 
          mode: 'creator_autonomous',
          topic,
          episodeId,
          projectId,
          activatedBots: orchestrationSteps.length
        }
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        campaign: campaign_type,
        topic,
        autonomousMode,
        userRole: isAdmin ? 'admin' : isCreator ? 'creator' : 'user',
        activatedBots: orchestrationSteps.length,
        execution_plan: orchestrationSteps,
        estimated_completion: isAdmin ? '10-20 minutes (God-Tier)' : '15-30 minutes',
        message: isAdmin 
          ? '🎯 God-Tier Autonomous Orchestration activated - All bots working in perfect harmony'
          : '⚡ Smart Autonomous Orchestration activated - Core viral bots engaged'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Bot orchestrator error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
