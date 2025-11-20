-- Create table for edit performance tracking
CREATE TABLE IF NOT EXISTS public.edit_performance_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE,
  edit_style TEXT NOT NULL,
  content_type TEXT,
  performance_score DECIMAL(4,2),
  actual_views INTEGER DEFAULT 0,
  actual_engagement_rate DECIMAL(5,2),
  actual_retention_rate DECIMAL(5,2),
  quality_score DECIMAL(3,1),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create table for A/B test results
CREATE TABLE IF NOT EXISTS public.ab_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  variations JSONB NOT NULL,
  winner_variation_id TEXT,
  shared BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.edit_performance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_results ENABLE ROW LEVEL SECURITY;

-- Policies for edit_performance_history
CREATE POLICY "Users can view their own edit performance"
  ON public.edit_performance_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own edit performance records"
  ON public.edit_performance_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own edit performance records"
  ON public.edit_performance_history
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own edit performance records"
  ON public.edit_performance_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for ab_test_results
CREATE POLICY "Users can view their own A/B test results"
  ON public.ab_test_results
  FOR SELECT
  USING (auth.uid() = user_id OR shared = true);

CREATE POLICY "Users can create their own A/B test results"
  ON public.ab_test_results
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own A/B test results"
  ON public.ab_test_results
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own A/B test results"
  ON public.ab_test_results
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_edit_performance_user_id ON public.edit_performance_history(user_id);
CREATE INDEX idx_edit_performance_style ON public.edit_performance_history(edit_style);
CREATE INDEX idx_edit_performance_content_type ON public.edit_performance_history(content_type);
CREATE INDEX idx_ab_test_results_user_id ON public.ab_test_results(user_id);
CREATE INDEX idx_ab_test_results_share_token ON public.ab_test_results(share_token);

-- Triggers for updated_at
CREATE TRIGGER update_edit_performance_updated_at
  BEFORE UPDATE ON public.edit_performance_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ab_test_results_updated_at
  BEFORE UPDATE ON public.ab_test_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();