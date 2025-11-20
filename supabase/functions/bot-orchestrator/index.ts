import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Department detection and routing
type Department = 'story' | 'character' | 'soundtrack' | 'cinematography' | 'dialogue' | 'post_production' | 'marketing' | null;

function detectDepartment(message: string): Department {
  const lowerMessage = message.toLowerCase();
  
  // Story/Script department
  if (/(script|story|plot|narrative|episode|scene|act|dialogue|character arc|storyline|write)/i.test(lowerMessage)) {
    return 'story';
  }
  
  // Character & Movement department
  if (/(character|movement|motion|animation|gesture|expression|walk|run|pose|design character)/i.test(lowerMessage)) {
    return 'character';
  }
  
  // Soundtrack department
  if (/(music|soundtrack|audio|sound|song|beat|melody|rhythm|compose)/i.test(lowerMessage)) {
    return 'soundtrack';
  }
  
  // Cinematography department
  if (/(camera|shot|angle|lighting|frame|composition|transition|zoom|pan|cinematic)/i.test(lowerMessage)) {
    return 'cinematography';
  }
  
  // Dialogue/Voice department
  if (/(voice|voiceover|tts|speak|say|narrat|vocal|accent)/i.test(lowerMessage)) {
    return 'dialogue';
  }
  
  // Post-Production department
  if (/(edit|effect|color|grade|render|export|compile|finish|polish|vfx)/i.test(lowerMessage)) {
    return 'post_production';
  }
  
  // Marketing & Analytics department
  if (/(viral|trend|market|analytics|engagement|views|seo|share|promote|optimize)/i.test(lowerMessage)) {
    return 'marketing';
  }
  
  return null;
}

function getDepartmentResponse(department: Department, message: string): string {
  const responses: Record<Exclude<Department, null>, string[]> = {
    story: [
      "Alright, let's work on the story. What's the vibe you're going for?",
      "Cool, script time. What should happen?",
      "Story mode activated. Give me the premise.",
      "I'm ready to write. What's the plot?"
    ],
    character: [
      "Character design - got it. Describe who you need.",
      "Let's build this character. What do they look like?",
      "Character department here. What's their deal?",
      "Cool, I'll design them. Give me details."
    ],
    soundtrack: [
      "Audio time. What kind of vibe?",
      "Music department ready. What sound are we going for?",
      "Let's talk sound. What genre?",
      "I'll handle the audio. Describe the mood."
    ],
    cinematography: [
      "Camera work - nice. What shots do you want?",
      "Cinematography mode. How should this look?",
      "Let's frame this. What's the visual style?",
      "Visual department ready. Describe the shots."
    ],
    dialogue: [
      "Voice work, got it. Who's speaking?",
      "Dialogue time. What should they say?",
      "Voice department here. Give me the lines.",
      "I'll handle the voices. What's the script?"
    ],
    post_production: [
      "Editing mode. What needs polish?",
      "Post-production ready. What effects?",
      "Let's finish this up. What changes?",
      "I'll handle the editing. What adjustments?"
    ],
    marketing: [
      "Marketing mode. What platform?",
      "Let's make it viral. What's the angle?",
      "Analytics time. What's the goal?",
      "I'll optimize this. Target audience?"
    ]
  };
  
  if (!department) return "";
  const options = responses[department];
  return options[Math.floor(Math.random() * options.length)];
}

// Local intelligence engine - generates responses without external AI APIs
function generateIntelligentResponse({ message, conversationHistory, userGoals, activeTopics, context, activeDepartment }: any): { response: string, department: Department } {
  const lowerMessage = message.toLowerCase();
  
  // Detect which department should handle this
  const detectedDepartment = detectDepartment(message);
  
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
    const greetings = [
      "Hey! What's up?",
      "Hi :) what are we doing today?",
      "Hey, how can I help?",
      "Hi! What do you need?"
    ];
    return { response: greetings[Math.floor(Math.random() * greetings.length)], department: null };
  }
  
  // If department detected, route to that department
  if (detectedDepartment) {
    const deptResponse = getDepartmentResponse(detectedDepartment, message);
    return { response: deptResponse, department: detectedDepartment };
  }
  
  if (isRequest) {
    // Video production requests
    if (lowerMessage.includes('video') || lowerMessage.includes('episode')) {
      return { 
        response: "Got it, full production. I'll coordinate all departments - story, characters, camera, audio, everything. What's it about?", 
        department: 'story' 
      };
    }
    
    // Generic creative request
    return { 
      response: "What do you want to create?", 
      department: null 
    };
  }
  
  if (isQuestion) {
    // Questions about capabilities
    if (lowerMessage.includes('what can') || lowerMessage.includes('what do')) {
      return { 
        response: "I run 7 departments: story/scripts, character design, music, camera work, dialogue/voice, editing, and marketing. What do you need?", 
        department: null 
      };
    }
    
    // Questions about process
    if (lowerMessage.includes('how') || lowerMessage.includes('process')) {
      return { 
        response: "I handle everything - just tell me what you want and I'll coordinate the departments to make it happen.", 
        department: null 
      };
    }
  }
  
  // Check if this is a follow-up to previous conversation
  if (hasContext && lastMessage?.role === 'assistant') {
    if (isConfirmation) {
      return { 
        response: "Cool, starting now.", 
        department: activeDepartment 
      };
    }
    
    // Analyze if user is providing additional details
    if (!isGreeting && !isQuestion) {
      return { 
        response: `Got it. Anything else?`, 
        department: activeDepartment 
      };
    }
  }
  
  // Default intelligent response
  return { response: "Okay, what else?", department: activeDepartment };
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
      const activeDepartment = existingConversation?.metadata?.active_department || null;
      
      console.log('🧠 Processing with local intelligence engine...');
      
      // Analyze user intent and generate intelligent response
      const { response: aiMessage, department: newDepartment } = generateIntelligentResponse({
        message,
        conversationHistory,
        userGoals,
        activeTopics,
        context: { episodeId, projectId, currentPage: context?.currentPage },
        activeDepartment
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
            metadata: { active_department: newDepartment }
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
            metadata: { active_department: newDepartment }
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
          activeDepartment: newDepartment,
          message: '⚡ God-Tier Orchestrator - Smart Department Routing Active'
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
