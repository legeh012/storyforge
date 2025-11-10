-- Create performance metrics table for tracking video generation
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create AI analysis cache table
CREATE TABLE IF NOT EXISTS public.ai_analysis_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  analysis_result JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours')
);

-- Enable RLS
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis_cache ENABLE ROW LEVEL SECURITY;

-- Public access policies (no auth required)
CREATE POLICY "Allow public read on performance_metrics" ON public.performance_metrics FOR SELECT USING (true);
CREATE POLICY "Allow public insert on performance_metrics" ON public.performance_metrics FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on ai_analysis_cache" ON public.ai_analysis_cache FOR SELECT USING (true);
CREATE POLICY "Allow public insert on ai_analysis_cache" ON public.ai_analysis_cache FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on ai_analysis_cache" ON public.ai_analysis_cache FOR UPDATE USING (true);

-- Create index for cache lookups
CREATE INDEX idx_ai_cache_key ON public.ai_analysis_cache(cache_key);
CREATE INDEX idx_ai_cache_expires ON public.ai_analysis_cache(expires_at);

-- Add retry tracking to episodes
ALTER TABLE public.episodes 
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_retry_at TIMESTAMPTZ;