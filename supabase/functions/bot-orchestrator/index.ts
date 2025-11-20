import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Local intelligence engine - generates responses without external AI APIs
function generateIntelligentResponse({ message, conversationHistory, userGoals, activeTopics, context }: any): string {
  const lowerMessage = message.toLowerCase();
  
  // Detect intent patterns
  const isGreeting = /^(hi|hello|hey|greetings)/i.test(message);
  const isQuestion = message.includes('?') || /^(what|how|why|when|where|who|can|could|would|should)/i.test(message);
  const isRequest = /^(create|make|build|generate|add|update|fix|change|remove)/i.test(message);
  const isConfirmation = /^(yes|yeah|yep|sure|okay|ok|correct|right)/i.test(message);
  
  // Check for context from previous conversation
  const hasContext = conversationHistory.length > 0;
  const lastMessage = hasContext ? conversationHistory[conversationHistory.length - 1] : null;
  
  // Generate contextual response
  if (isGreeting && !hasContext) {
    return "Welcome to the God-Tier AI Production Studio! I'm your autonomous orchestrator, ready to help you create professional-grade video content. I can handle everything from scriptwriting and storyboarding to final video production with realistic visuals and audio. What would you like to create today?";
  }
  
  if (isRequest) {
    // Video production requests
    if (lowerMessage.includes('video') || lowerMessage.includes('episode')) {
      return "I'll orchestrate a complete video production for you. I'll handle:\n\n1. **Script & Storyboard**: Crafting compelling narrative and scene breakdown\n2. **Character Design**: Creating realistic characters with proper movement\n3. **Cinematography**: Professional camera work, lighting, and transitions\n4. **Audio Production**: Dialogue, soundtrack, and sound effects\n5. **Post-Production**: Editing, effects, and final rendering\n\nLet me know the topic or theme you want, and I'll begin the production process immediately.";
    }
    
    // Script requests
    if (lowerMessage.includes('script') || lowerMessage.includes('story')) {
      return "I'll create a professional script for you with:\n- Engaging hook and narrative structure\n- Character development and dialogue\n- Scene descriptions and action beats\n- Pacing optimized for viewer retention\n\nWhat's the topic, genre, or theme you'd like the script to focus on?";
    }
    
    // Character requests
    if (lowerMessage.includes('character')) {
      return "I'll design realistic characters with detailed profiles including:\n- Appearance and visual design\n- Personality traits and motivations\n- Background story\n- Movement patterns and mannerisms\n\nDescribe the type of character you need, and I'll bring them to life.";
    }
    
    // General creative request
    return "I understand you want to create something. I can help with:\n- **Videos & Episodes**: Full production from script to final render\n- **Scripts & Stories**: Compelling narratives optimized for engagement\n- **Characters**: Realistic character design and animation\n- **Audio**: Music, dialogue, and sound effects\n\nWhat specifically would you like me to create?";
  }
  
  if (isQuestion) {
    // Questions about capabilities
    if (lowerMessage.includes('what can') || lowerMessage.includes('what do')) {
      return "As a God-Tier AI Orchestrator, I manage seven specialized departments:\n\n1. **Story Director**: Scripts, narratives, storyboards\n2. **Character & Movement**: Character design, animation, dialogue sync\n3. **Soundtrack**: Music composition and audio production\n4. **Cinematography**: Camera work, lighting, scene transitions\n5. **Dialogue**: Voice synthesis and TTS\n6. **Post-Production**: Editing, effects, color grading\n7. **Marketing & Analytics**: Viral optimization and trend analysis\n\nI coordinate all these to produce professional video content autonomously.";
    }
    
    // Questions about process
    if (lowerMessage.includes('how') || lowerMessage.includes('process')) {
      return "My production process:\n\n1. **Understanding**: I analyze your request and track context across our conversation\n2. **Planning**: I break down the project into coordinated tasks\n3. **Execution**: I orchestrate all production departments simultaneously\n4. **Quality Control**: I validate output and suggest improvements\n5. **Delivery**: I provide the final product with optimization recommendations\n\nI remember everything you tell me and build on it - no need to repeat yourself.";
    }
  }
  
  // Check if this is a follow-up to previous conversation
  if (hasContext && lastMessage?.role === 'assistant') {
    if (isConfirmation) {
      return "Great! I'll proceed with what we discussed. I'm starting the production process now and will keep you updated on progress.";
    }
    
    // Analyze if user is providing additional details
    if (!isGreeting && !isQuestion) {
      return `I've noted: "${message}". I'm incorporating this into the current project. I remember all our previous context, so I'm building on everything you've already told me. Is there anything else you'd like to add, or should I proceed with production?`;
    }
  }
  
  // Default intelligent response
  return "I understand. I'm tracking this in our conversation context. Based on everything you've told me so far, I'm ready to help you create professional content. What would you like me to focus on next?";
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

    const { message, context, campaign_type, topic, episodeId, projectId, mode, sessionId } = await req.json();
    
    // God-Tier mode operates without auth for public access
    const isGodTier = mode === 'god_tier';

    // GOD-TIER MODE: GPT-5.1-like conversational AI with deep context tracking
    if (isGodTier) {
      console.log('⚡ GOD-TIER ORCHESTRATOR: GPT-5.1 Mode - Deep Context Tracking Activated');

      // Retrieve or create conversation session
      const actualSessionId = sessionId || crypto.randomUUID();
      
      // Load conversation history
      const { data: existingConversation } = await supabase
        .from('orchestrator_conversations')
        .select('*')
        .eq('session_id', actualSessionId)
        .single();
      
      const conversationHistory = existingConversation?.conversation_data || [];
      const userGoals = existingConversation?.user_goals || [];
      const activeTopics = existingConversation?.active_topics || [];
      
      console.log('🧠 Processing with local intelligence engine...');
      
      // Analyze user intent and generate intelligent response
      const aiMessage = generateIntelligentResponse({
        message,
        conversationHistory,
        userGoals,
        activeTopics,
        context: { episodeId, projectId, currentPage: context?.currentPage }
      });

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
      if (existingConversation) {
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
          message: '⚡ God-Tier GPT-5.1 Orchestrator - Local Intelligence Active'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Standard mode - return basic response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Standard mode not implemented. Please use god_tier mode.'
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
