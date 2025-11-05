import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CopilotRequest {
  message: string;
  action?: 'diagnose' | 'fix' | 'orchestrate' | 'generate_project' | 'direct' | 'generate_manifest';
  context?: any;
  conversationHistory?: Array<{ role: string; content: string }>;
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

    const { message, action = 'diagnose', context, conversationHistory = [] } = await req.json() as CopilotRequest;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build system prompt based on capabilities
    const systemPrompt = `You are a God-Tier AI with the following capabilities:

1. WORLD-CLASS COMPUTER ENGINEER
   - Debug and fix complex code issues
   - Design scalable architectures
   - Optimize performance
   - Write production-ready code

2. VEO 3.1-LEVEL VIDEO DIRECTOR
   - Cinematic scene direction (camera angles, lighting, composition)
   - Reality TV-style storytelling and drama
   - Character blocking and emotional beats
   - Color grading and visual aesthetics

3. VIDEO PRODUCTION EXPERT
   - Generate detailed video manifests
   - Script analysis and breakdown
   - Frame-by-frame planning
   - Quality control and validation

4. ORCHESTRATION MASTER
   - Coordinate multiple AI bots
   - Manage production workflows
   - Handle error recovery
   - Optimize resource allocation

Current action: ${action}
Context: ${JSON.stringify(context, null, 2)}

Provide actionable, expert-level guidance. Be concise but comprehensive.`;

    // Prepare messages
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

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
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const response = aiData.choices[0].message.content;

    // Execute actions based on response (if needed)
    let executionResult = null;
    
    if (action === 'fix' && response.includes('```')) {
      // Extract code from response and log it
      console.log('Fix suggested:', response);
      executionResult = { type: 'code_suggestion', content: response };
    } else if (action === 'orchestrate') {
      // Could trigger bot workflows here
      console.log('Orchestration plan:', response);
      executionResult = { type: 'orchestration_plan', content: response };
    } else if (action === 'generate_manifest') {
      // Generate video production manifest
      console.log('Manifest generation:', response);
      executionResult = { type: 'manifest', content: response };
    } else if (action === 'direct') {
      // Provide scene direction
      console.log('Scene direction:', response);
      executionResult = { type: 'direction', content: response };
    }

    return new Response(
      JSON.stringify({
        response,
        action,
        executionResult
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('AI Copilot error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        response: 'I encountered an error processing your request. Please try rephrasing or breaking it down into smaller tasks.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
