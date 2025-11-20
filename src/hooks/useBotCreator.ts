import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BotConfig {
  name: string;
  description: string;
  category: string;
  capabilities?: string[];
  triggers?: string[];
  actions?: string[];
  priority?: 'low' | 'medium' | 'high';
  isActive?: boolean;
}

export const useBotCreator = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const createBot = async (botConfig: BotConfig) => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('bot-creator', {
        body: { 
          action: 'create',
          botConfig 
        }
      });

      if (error) throw error;

      toast({
        title: "✨ Bot Created",
        description: data.message || `Successfully created ${botConfig.name}`,
      });

      return { success: true, bot: data.bot };
    } catch (error) {
      console.error('Bot creation error:', error);
      toast({
        title: "Bot Creation Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const listCustomBots = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('bot-creator', {
        body: { action: 'list' }
      });

      if (error) throw error;

      return { success: true, bots: data.bots };
    } catch (error) {
      console.error('List bots error:', error);
      toast({
        title: "Failed to Load Bots",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateBot = async (botId: string, updates: Partial<BotConfig>) => {
    try {
      const { data, error } = await supabase.functions.invoke('bot-creator', {
        body: { 
          action: 'update',
          botConfig: { botId, updates }
        }
      });

      if (error) throw error;

      toast({
        title: "✅ Bot Updated",
        description: data.message,
      });

      return { success: true, bot: data.bot };
    } catch (error) {
      console.error('Bot update error:', error);
      toast({
        title: "Bot Update Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteBot = async (botId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('bot-creator', {
        body: { 
          action: 'delete',
          botConfig: { botId }
        }
      });

      if (error) throw error;

      toast({
        title: "🗑️ Bot Deleted",
        description: data.message,
      });

      return { success: true };
    } catch (error) {
      console.error('Bot delete error:', error);
      toast({
        title: "Bot Deletion Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    createBot,
    listCustomBots,
    updateBot,
    deleteBot,
    isCreating,
  };
};
