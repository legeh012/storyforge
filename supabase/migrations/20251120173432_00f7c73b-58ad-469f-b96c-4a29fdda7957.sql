-- Create conversation memory table for god-tier orchestrator
CREATE TABLE IF NOT EXISTS public.orchestrator_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  conversation_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  context_summary TEXT,
  user_goals TEXT[],
  active_topics TEXT[]
);

-- Enable RLS (but allow public access since auth is removed)
ALTER TABLE public.orchestrator_conversations ENABLE ROW LEVEL SECURITY;

-- Allow public access
CREATE POLICY "Allow public read access" ON public.orchestrator_conversations FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.orchestrator_conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.orchestrator_conversations FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.orchestrator_conversations FOR DELETE USING (true);

-- Create index for faster session lookups
CREATE INDEX idx_orchestrator_sessions ON public.orchestrator_conversations(session_id);

-- Add update trigger
CREATE TRIGGER update_orchestrator_conversations_updated_at
  BEFORE UPDATE ON public.orchestrator_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();