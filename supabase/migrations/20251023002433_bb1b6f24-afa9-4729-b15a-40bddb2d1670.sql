-- First, drop ALL existing policies on all tables
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname 
              FROM pg_policies 
              WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Now create simple public access policies for all tables
CREATE POLICY "Public access" ON public.characters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.episodes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.media_assets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.viral_bots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.bot_activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.generation_attachments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.system_health FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.error_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.bot_execution_stats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.generated_scripts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.generated_thumbnails FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.hook_optimizations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.trend_detections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.content_remixes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.cultural_injections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.engagement_actions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.scheduled_posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.performance_metrics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.ab_tests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.affiliate_links FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.lead_captures FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.user_roles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.bot_templates FOR ALL USING (true) WITH CHECK (true);