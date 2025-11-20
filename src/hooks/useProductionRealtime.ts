import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ProductionUpdate {
  type: 'episode' | 'bot_activity' | 'bot_execution' | 'media_asset';
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  data: any;
  old?: any;
}

export const useProductionRealtime = (onUpdate?: (update: ProductionUpdate) => void) => {
  const [isConnected, setIsConnected] = useState(false);
  const [updates, setUpdates] = useState<ProductionUpdate[]>([]);

  const handleUpdate = useCallback((update: ProductionUpdate) => {
    setUpdates(prev => [...prev.slice(-99), update]); // Keep last 100 updates
    onUpdate?.(update);
  }, [onUpdate]);

  useEffect(() => {
    const channel: RealtimeChannel = supabase
      .channel('production-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'episodes'
        },
        (payload) => {
          handleUpdate({
            type: 'episode',
            action: payload.eventType as any,
            data: payload.new,
            old: payload.old
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bot_activities'
        },
        (payload) => {
          handleUpdate({
            type: 'bot_activity',
            action: payload.eventType as any,
            data: payload.new,
            old: payload.old
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bot_execution_stats'
        },
        (payload) => {
          handleUpdate({
            type: 'bot_execution',
            action: payload.eventType as any,
            data: payload.new,
            old: payload.old
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'media_assets'
        },
        (payload) => {
          handleUpdate({
            type: 'media_asset',
            action: payload.eventType as any,
            data: payload.new,
            old: payload.old
          });
        }
      )
      .subscribe((status) => {
        console.log('Production realtime status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [handleUpdate]);

  return { isConnected, updates };
};
