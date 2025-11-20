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

    const { action, botConfig } = await req.json();

    console.log('Bot creator request:', { action, botConfig, userId: user.id });

    if (action === 'create') {
      return await createBot(botConfig, user.id, supabase);
    } else if (action === 'list') {
      return await listCustomBots(user.id, supabase);
    } else if (action === 'update') {
      return await updateBot(botConfig, user.id, supabase);
    } else if (action === 'delete') {
      return await deleteBot(botConfig.botId, user.id, supabase);
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Bot creator error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function createBot(botConfig: any, userId: string, supabase: any) {
  const {
    name,
    description,
    category,
    capabilities,
    triggers,
    actions,
    priority = 'medium',
    isActive = true,
  } = botConfig;

  // Validate required fields
  if (!name || !description || !category) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields: name, description, category' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // Create bot configuration
  const config = {
    description,
    category,
    capabilities: capabilities || [],
    triggers: triggers || [],
    actions: actions || [],
    priority,
    customBot: true,
    createdByMayza: true,
    createdAt: new Date().toISOString(),
  };

  // Insert the bot
  const { data, error } = await supabase
    .from('viral_bots')
    .insert({
      user_id: userId,
      name,
      bot_type: 'persona_bot', // Use persona_bot as the base type for custom bots
      config,
      is_active: isActive,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create bot:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create bot', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  console.log('Bot created successfully:', data.id);

  return new Response(
    JSON.stringify({
      success: true,
      message: `✨ Bot "${name}" created successfully!`,
      bot: {
        id: data.id,
        name: data.name,
        type: data.bot_type,
        config: data.config,
        isActive: data.is_active,
      },
      details: {
        category,
        capabilities: capabilities?.length || 0,
        triggers: triggers?.length || 0,
        actions: actions?.length || 0,
      }
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function listCustomBots(userId: string, supabase: any) {
  const { data, error } = await supabase
    .from('viral_bots')
    .select('*')
    .eq('user_id', userId)
    .contains('config', { customBot: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to list bots:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to list bots' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      bots: data || [],
      count: data?.length || 0,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function updateBot(botConfig: any, userId: string, supabase: any) {
  const { botId, updates } = botConfig;

  if (!botId) {
    return new Response(
      JSON.stringify({ error: 'Bot ID is required' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // Get existing bot to merge config
  const { data: existingBot, error: fetchError } = await supabase
    .from('viral_bots')
    .select('config')
    .eq('id', botId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !existingBot) {
    return new Response(
      JSON.stringify({ error: 'Bot not found' }),
      {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  const updatedConfig = {
    ...existingBot.config,
    ...updates.config,
    updatedAt: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('viral_bots')
    .update({
      name: updates.name,
      config: updatedConfig,
      is_active: updates.isActive,
    })
    .eq('id', botId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Failed to update bot:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update bot' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: `✅ Bot "${data.name}" updated successfully`,
      bot: data,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function deleteBot(botId: string, userId: string, supabase: any) {
  if (!botId) {
    return new Response(
      JSON.stringify({ error: 'Bot ID is required' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  const { error } = await supabase
    .from('viral_bots')
    .delete()
    .eq('id', botId)
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to delete bot:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete bot' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: '🗑️ Bot deleted successfully',
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}
