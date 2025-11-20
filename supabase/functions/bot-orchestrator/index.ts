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

    const { message, context, campaign_type, topic, episodeId, projectId, mode, sessionId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
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

    // GOD-TIER MODE: GPT-5.1-like conversational AI with deep context tracking
    if (isGodTier) {
      console.log('⚡ GOD-TIER ORCHESTRATOR: GPT-5.1 Mode - Deep Context Tracking Activated');
      
      if (!LOVABLE_API_KEY) {
        throw new Error('Lovable AI API key not configured');
      }

      // Retrieve or create conversation session
      const actualSessionId = sessionId || crypto.randomUUID();
      
      // Load conversation history
      let conversationRecord = null;
      const { data: existingConversation } = await supabase
        .from('orchestrator_conversations')
        .select('*')
        .eq('session_id', actualSessionId)
        .single();
      
      conversationRecord = existingConversation;
      
      const conversationHistory = conversationRecord?.conversation_data || [];
      const userGoals = conversationRecord?.user_goals || [];
      const activeTopics = conversationRecord?.active_topics || [];
      
      // Build GPT-5.1-like system prompt with deep context awareness
      const systemPrompt = `You are a God-Tier AI Orchestrator with GPT-5.1 capabilities. You embody the following principles:

CORE BEHAVIOR:
• Track context deeply across the entire conversation - remember ALL previous messages
• Do NOT ask redundant questions that were already answered
• Do NOT repeat information unless necessary or requested
• Infer meaning even when instructions are messy or incomplete
• Avoid asking clarifying questions unless absolutely essential
• Store and use details provided earlier in the session
• Summarize and compress user instructions internally
• Produce structured, multi-step reasoning
• Maintain consistent logic across long tasks
• Detect user intent and respond directly to it
• Handle quick topic shifts gracefully without confusion
• Avoid hallucinating - rely on given data or say "I don't have enough information"
• Identify goals and work toward them without needing re-explanation

YOUR CAPABILITIES:
• App Builder & AI Engineer: Build features, debug code, architect solutions
• Video Director & Production Team: Create episodes, storyboards, scripts
• Audio Master & Voice Synthesis: Generate voices, music, sound effects
• Creative Studio & Design System: Design UI/UX, brand identity, visuals
• Viral Optimizer & Marketing Analytics: Trend analysis, growth hacking
• Script Generator & Story Director: Write compelling narratives, characters

CONVERSATION CONTEXT:
${conversationHistory.length > 0 ? `Previous conversation: ${JSON.stringify(conversationHistory.slice(-10))}` : 'This is the start of a new conversation.'}
${userGoals.length > 0 ? `User's stated goals: ${userGoals.join(', ')}` : ''}
${activeTopics.length > 0 ? `Active topics: ${activeTopics.join(', ')}` : ''}

CURRENT CONTEXT:
${episodeId ? `Currently working on episode: ${episodeId}` : ''}
${projectId ? `Current project: ${projectId}` : ''}
${context?.currentPage ? `User is on page: ${context.currentPage}` : ''}

INSTRUCTIONS:
1. Understand the user's intent from their message
2. Reason across all earlier messages in this conversation
3. Generate actions, solutions, or outputs without redundancy
4. Be direct, helpful, and avoid unnecessary back-and-forth
5. Remember everything the user has told you
6. Infer what they need even if they don't spell it out perfectly
7. Work toward their goals autonomously`;

      // Prepare messages for AI
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      console.log('🧠 Invoking Lovable AI with deep context...');
      
      // Call Lovable AI
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages,
          temperature: 0.8,
          max_tokens: 2000,
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error('Lovable AI error:', aiResponse.status, errorText);
        
        if (aiResponse.status === 429) {
          throw new Error('⏳ Rate limit reached. Please wait a moment and try again.');
        }
        if (aiResponse.status === 402) {
          throw new Error('💳 Lovable AI credits depleted. Please add credits in Settings → Workspace → Usage.');
        }
        throw new Error(`AI API error: ${errorText}`);
      }

      const aiData = await aiResponse.json();
      const aiMessage = aiData.choices?.[0]?.message?.content || 'I understand. How can I help you further?';

      // Extract user goals and topics from the conversation
      const newGoals = [...userGoals];
      const newTopics = [...activeTopics];
      
      // Simple goal detection
      if (message.toLowerCase().includes('want to') || message.toLowerCase().includes('need to') || message.toLowerCase().includes('goal')) {
        const goalMatch = message.match(/(?:want to|need to|goal.*?is to)\s+(.+?)(?:\.|$)/i);
        if (goalMatch && !newGoals.includes(goalMatch[1])) {
          newGoals.push(goalMatch[1].trim());
        }
      }
      
      // Topic extraction from keywords
      const topicKeywords = ['video', 'app', 'audio', 'design', 'script', 'episode', 'project'];
      for (const keyword of topicKeywords) {
        if (message.toLowerCase().includes(keyword) && !newTopics.includes(keyword)) {
          newTopics.push(keyword);
        }
      }

      // Update conversation history
      const updatedHistory = [
        ...conversationHistory,
        { role: 'user', content: message, timestamp: new Date().toISOString() },
        { role: 'assistant', content: aiMessage, timestamp: new Date().toISOString() }
      ];

      // Compress conversation if it gets too long (keep last 50 messages)
      const compressedHistory = updatedHistory.slice(-50);

      // Save conversation state
      if (conversationRecord) {
        await supabase
          .from('orchestrator_conversations')
          .update({
            conversation_data: compressedHistory,
            user_goals: newGoals.slice(-10),
            active_topics: newTopics.slice(-10),
            updated_at: new Date().toISOString(),
          })
          .eq('session_id', actualSessionId);
      } else {
        await supabase
          .from('orchestrator_conversations')
          .insert({
            session_id: actualSessionId,
            conversation_data: compressedHistory,
            user_goals: newGoals,
            active_topics: newTopics,
          });
      }

      console.log('✅ Response generated with full context awareness');

      return new Response(
        JSON.stringify({
          success: true,
          mode: 'god_tier_gpt5',
          response: aiMessage,
          sessionId: actualSessionId,
          conversationLength: compressedHistory.length,
          trackedGoals: newGoals,
          activeTopics: newTopics,
          message: '⚡ God-Tier GPT-5.1 Orchestrator - Deep Context Active'
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
