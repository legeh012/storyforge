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

    const { command, parameters } = await req.json();

    console.log('Automation command received:', { command, parameters, userId: user.id });

    // Process automation commands
    const result = await processAutomationCommand(command, parameters, user.id, supabase);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Automation API error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function processAutomationCommand(
  command: string,
  parameters: any,
  userId: string,
  supabase: any
) {
  console.log('Processing command:', command);

  // File operations
  if (command === 'rename_files' || command === 'move_files' || command === 'organize_files') {
    return await handleFileOperation(command, parameters, userId, supabase);
  }

  // Application control
  if (command === 'open_app' || command === 'join_meeting') {
    return await handleAppControl(command, parameters, userId);
  }

  // Form filling
  if (command === 'fill_form') {
    return await handleFormFilling(parameters, userId, supabase);
  }

  // Document operations
  if (command === 'create_report' || command === 'summarize_document' || command === 'draft_email') {
    return await handleDocumentOperation(command, parameters, userId, supabase);
  }

  // Orchestrator integration
  if (command === 'orchestrator_task') {
    return await handleOrchestratorTask(parameters, userId, supabase);
  }

  return { success: false, error: 'Unknown command' };
}

async function handleFileOperation(command: string, parameters: any, userId: string, supabase: any) {
  const { files, targetFolder, pattern } = parameters;

  // Log the operation
  const { error: logError } = await supabase
    .from('bot_activities')
    .insert({
      user_id: userId,
      bot_id: 'automation-api',
      status: 'completed',
      results: { command, parameters, timestamp: new Date().toISOString() }
    });

  if (logError) console.error('Failed to log activity:', logError);

  return {
    success: true,
    command,
    message: `File operation ${command} queued`,
    details: {
      filesAffected: files?.length || 0,
      targetFolder,
      pattern
    }
  };
}

async function handleAppControl(command: string, parameters: any, userId: string) {
  const { appName, meetingLink } = parameters;

  return {
    success: true,
    command,
    message: `App control ${command} queued`,
    details: {
      appName,
      meetingLink,
      action: command === 'open_app' ? 'open' : 'join_meeting'
    }
  };
}

async function handleFormFilling(parameters: any, userId: string, supabase: any) {
  const { formData, targetApp } = parameters;

  // Store form data for processing
  const { data, error } = await supabase
    .from('orchestrator_conversations')
    .insert({
      session_id: `form-fill-${Date.now()}`,
      conversation_data: { type: 'form_fill', formData, targetApp },
      user_goals: ['fill_form']
    })
    .select()
    .single();

  if (error) throw error;

  return {
    success: true,
    command: 'fill_form',
    message: 'Form filling task created',
    sessionId: data.session_id,
    details: { targetApp, fieldsCount: Object.keys(formData || {}).length }
  };
}

async function handleDocumentOperation(command: string, parameters: any, userId: string, supabase: any) {
  const { content, documentPath, recipient } = parameters;

  // Create orchestrator task for document operations
  const { data, error } = await supabase
    .from('orchestrator_conversations')
    .insert({
      session_id: `doc-op-${Date.now()}`,
      conversation_data: { type: command, content, documentPath, recipient },
      user_goals: [command]
    })
    .select()
    .single();

  if (error) throw error;

  return {
    success: true,
    command,
    message: `Document operation ${command} queued`,
    sessionId: data.session_id,
    details: { documentPath, hasContent: !!content }
  };
}

async function handleOrchestratorTask(parameters: any, userId: string, supabase: any) {
  const { task, context, department } = parameters;

  // Create orchestrator conversation
  const { data, error } = await supabase
    .from('orchestrator_conversations')
    .insert({
      session_id: `automation-${Date.now()}`,
      conversation_data: {
        messages: [{
          role: 'user',
          content: task,
          timestamp: new Date().toISOString()
        }],
        context,
        activeDepartment: department || 'general'
      },
      user_goals: ['automation_task'],
      active_topics: [department || 'general']
    })
    .select()
    .single();

  if (error) throw error;

  return {
    success: true,
    command: 'orchestrator_task',
    message: 'Orchestrator task created',
    sessionId: data.session_id,
    details: { task, department }
  };
}
