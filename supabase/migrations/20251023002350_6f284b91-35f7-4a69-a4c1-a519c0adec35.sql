-- Drop all existing RLS policies that require authentication
-- and create public access policies for all tables

-- Characters table
DROP POLICY IF EXISTS "Users can view own characters" ON public.characters;
DROP POLICY IF EXISTS "Users can insert own characters" ON public.characters;
DROP POLICY IF EXISTS "Users can update own characters" ON public.characters;
DROP POLICY IF EXISTS "Users can delete own characters" ON public.characters;
DROP POLICY IF EXISTS "Admins can view all characters" ON public.characters;
DROP POLICY IF EXISTS "Admins can insert all characters" ON public.characters;
DROP POLICY IF EXISTS "Admins can update all characters" ON public.characters;
DROP POLICY IF EXISTS "Admins can delete all characters" ON public.characters;

CREATE POLICY "Public access to characters" ON public.characters FOR ALL USING (true) WITH CHECK (true);

-- Projects table
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can view all projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can insert all projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can update all projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can delete all projects" ON public.projects;

CREATE POLICY "Public access to projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);

-- Episodes table
DROP POLICY IF EXISTS "Users can view own episodes" ON public.episodes;
DROP POLICY IF EXISTS "Users can insert own episodes" ON public.episodes;
DROP POLICY IF EXISTS "Users can update own episodes" ON public.episodes;
DROP POLICY IF EXISTS "Users can delete own episodes" ON public.episodes;
DROP POLICY IF EXISTS "Admins can view all episodes" ON public.episodes;
DROP POLICY IF EXISTS "Admins can insert all episodes" ON public.episodes;
DROP POLICY IF EXISTS "Admins can update all episodes" ON public.episodes;
DROP POLICY IF EXISTS "Admins can delete all episodes" ON public.episodes;

CREATE POLICY "Public access to episodes" ON public.episodes FOR ALL USING (true) WITH CHECK (true);

-- Media assets table
DROP POLICY IF EXISTS "Users can view own media" ON public.media_assets;
DROP POLICY IF EXISTS "Users can insert own media" ON public.media_assets;
DROP POLICY IF EXISTS "Users can update own media" ON public.media_assets;
DROP POLICY IF EXISTS "Users can delete own media" ON public.media_assets;
DROP POLICY IF EXISTS "Admins can view all media" ON public.media_assets;
DROP POLICY IF EXISTS "Admins can insert all media" ON public.media_assets;
DROP POLICY IF EXISTS "Admins can update all media" ON public.media_assets;
DROP POLICY IF EXISTS "Admins can delete all media" ON public.media_assets;

CREATE POLICY "Public access to media_assets" ON public.media_assets FOR ALL USING (true) WITH CHECK (true);

-- Viral bots table
DROP POLICY IF EXISTS "Users can view own bots" ON public.viral_bots;
DROP POLICY IF EXISTS "Users can insert own bots" ON public.viral_bots;
DROP POLICY IF EXISTS "Users can update own bots" ON public.viral_bots;
DROP POLICY IF EXISTS "Users can delete own bots" ON public.viral_bots;

CREATE POLICY "Public access to viral_bots" ON public.viral_bots FOR ALL USING (true) WITH CHECK (true);

-- Bot activities table
DROP POLICY IF EXISTS "Users can view own activities" ON public.bot_activities;
DROP POLICY IF EXISTS "Users can insert own activities" ON public.bot_activities;
DROP POLICY IF EXISTS "Users can update own activities" ON public.bot_activities;

CREATE POLICY "Public access to bot_activities" ON public.bot_activities FOR ALL USING (true) WITH CHECK (true);

-- Generation attachments table
DROP POLICY IF EXISTS "Users can view their own attachments" ON public.generation_attachments;
DROP POLICY IF EXISTS "Users can insert their own attachments" ON public.generation_attachments;
DROP POLICY IF EXISTS "Users can update their own attachments" ON public.generation_attachments;
DROP POLICY IF EXISTS "Users can delete their own attachments" ON public.generation_attachments;

CREATE POLICY "Public access to generation_attachments" ON public.generation_attachments FOR ALL USING (true) WITH CHECK (true);

-- System health table
DROP POLICY IF EXISTS "Admins can view system health" ON public.system_health;
DROP POLICY IF EXISTS "Admins can manage system health" ON public.system_health;

CREATE POLICY "Public access to system_health" ON public.system_health FOR ALL USING (true) WITH CHECK (true);

-- Error logs table
DROP POLICY IF EXISTS "Admins can view all error logs" ON public.error_logs;
DROP POLICY IF EXISTS "Admins can update error logs" ON public.error_logs;
DROP POLICY IF EXISTS "Service role can insert error logs" ON public.error_logs;

CREATE POLICY "Public access to error_logs" ON public.error_logs FOR ALL USING (true) WITH CHECK (true);

-- Bot execution stats
DROP POLICY IF EXISTS "Users can view their bot stats" ON public.bot_execution_stats;

CREATE POLICY "Public access to bot_execution_stats" ON public.bot_execution_stats FOR ALL USING (true) WITH CHECK (true);

-- All other viral bot related tables
DROP POLICY IF EXISTS "Users can insert own scripts" ON public.generated_scripts;
DROP POLICY IF EXISTS "Users can view own scripts" ON public.generated_scripts;
CREATE POLICY "Public access to generated_scripts" ON public.generated_scripts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can insert own thumbnails" ON public.generated_thumbnails;
DROP POLICY IF EXISTS "Users can view own thumbnails" ON public.generated_thumbnails;
CREATE POLICY "Public access to generated_thumbnails" ON public.generated_thumbnails FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can insert own hooks" ON public.hook_optimizations;
DROP POLICY IF EXISTS "Users can view own hooks" ON public.hook_optimizations;
CREATE POLICY "Public access to hook_optimizations" ON public.hook_optimizations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can insert own trends" ON public.trend_detections;
DROP POLICY IF EXISTS "Users can view own trends" ON public.trend_detections;
CREATE POLICY "Public access to trend_detections" ON public.trend_detections FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can insert own remixes" ON public.content_remixes;
DROP POLICY IF EXISTS "Users can view own remixes" ON public.content_remixes;
CREATE POLICY "Public access to content_remixes" ON public.content_remixes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can insert own injections" ON public.cultural_injections;
DROP POLICY IF EXISTS "Users can view own injections" ON public.cultural_injections;
CREATE POLICY "Public access to cultural_injections" ON public.cultural_injections FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can insert own engagement actions" ON public.engagement_actions;
DROP POLICY IF EXISTS "Users can view own engagement actions" ON public.engagement_actions;
CREATE POLICY "Public access to engagement_actions" ON public.engagement_actions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can insert own scheduled posts" ON public.scheduled_posts;
DROP POLICY IF EXISTS "Users can update own scheduled posts" ON public.scheduled_posts;
DROP POLICY IF EXISTS "Users can view own scheduled posts" ON public.scheduled_posts;
CREATE POLICY "Public access to scheduled_posts" ON public.scheduled_posts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can insert own metrics" ON public.performance_metrics;
DROP POLICY IF EXISTS "Users can view own metrics" ON public.performance_metrics;
CREATE POLICY "Public access to performance_metrics" ON public.performance_metrics FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can insert own ab tests" ON public.ab_tests;
DROP POLICY IF EXISTS "Users can update own ab tests" ON public.ab_tests;
DROP POLICY IF EXISTS "Users can view own ab tests" ON public.ab_tests;
CREATE POLICY "Public access to ab_tests" ON public.ab_tests FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can insert own affiliate links" ON public.affiliate_links;
DROP POLICY IF EXISTS "Users can update own affiliate links" ON public.affiliate_links;
DROP POLICY IF EXISTS "Users can view own affiliate links" ON public.affiliate_links;
CREATE POLICY "Public access to affiliate_links" ON public.affiliate_links FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can insert own leads" ON public.lead_captures;
DROP POLICY IF EXISTS "Users can view own leads" ON public.lead_captures;
DROP POLICY IF EXISTS "Admins can view all leads" ON public.lead_captures;
CREATE POLICY "Public access to lead_captures" ON public.lead_captures FOR ALL USING (true) WITH CHECK (true);