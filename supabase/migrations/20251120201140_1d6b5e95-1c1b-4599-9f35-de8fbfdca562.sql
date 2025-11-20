-- Enable realtime for production-related tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.episodes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bot_activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bot_execution_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.media_assets;

-- Set replica identity for realtime updates
ALTER TABLE public.episodes REPLICA IDENTITY FULL;
ALTER TABLE public.bot_activities REPLICA IDENTITY FULL;
ALTER TABLE public.bot_execution_stats REPLICA IDENTITY FULL;
ALTER TABLE public.media_assets REPLICA IDENTITY FULL;