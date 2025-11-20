-- Disable RLS and allow public access to all tables for personal app use

-- Profiles table - allow public access
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Allow public read access to profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert to profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to profiles" ON public.profiles FOR UPDATE USING (true);

-- Projects table - allow public access
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
CREATE POLICY "Allow public read access to projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow public insert to projects" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to projects" ON public.projects FOR UPDATE USING (true);
CREATE POLICY "Allow public delete to projects" ON public.projects FOR DELETE USING (true);

-- Episodes table - allow public access
DROP POLICY IF EXISTS "Users can view their own episodes" ON public.episodes;
DROP POLICY IF EXISTS "Users can create their own episodes" ON public.episodes;
DROP POLICY IF EXISTS "Users can update their own episodes" ON public.episodes;
DROP POLICY IF EXISTS "Users can delete their own episodes" ON public.episodes;
CREATE POLICY "Allow public read access to episodes" ON public.episodes FOR SELECT USING (true);
CREATE POLICY "Allow public insert to episodes" ON public.episodes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to episodes" ON public.episodes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete to episodes" ON public.episodes FOR DELETE USING (true);

-- Characters table - allow public access
DROP POLICY IF EXISTS "Users can view their own characters" ON public.characters;
DROP POLICY IF EXISTS "Users can create their own characters" ON public.characters;
DROP POLICY IF EXISTS "Users can update their own characters" ON public.characters;
DROP POLICY IF EXISTS "Users can delete their own characters" ON public.characters;
CREATE POLICY "Allow public read access to characters" ON public.characters FOR SELECT USING (true);
CREATE POLICY "Allow public insert to characters" ON public.characters FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to characters" ON public.characters FOR UPDATE USING (true);
CREATE POLICY "Allow public delete to characters" ON public.characters FOR DELETE USING (true);

-- Media assets table - allow public access
DROP POLICY IF EXISTS "Users can view their own media assets" ON public.media_assets;
DROP POLICY IF EXISTS "Users can create their own media assets" ON public.media_assets;
DROP POLICY IF EXISTS "Users can update their own media assets" ON public.media_assets;
DROP POLICY IF EXISTS "Users can delete their own media assets" ON public.media_assets;
CREATE POLICY "Allow public read access to media_assets" ON public.media_assets FOR SELECT USING (true);
CREATE POLICY "Allow public insert to media_assets" ON public.media_assets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to media_assets" ON public.media_assets FOR UPDATE USING (true);
CREATE POLICY "Allow public delete to media_assets" ON public.media_assets FOR DELETE USING (true);

-- Generation attachments table - allow public access
DROP POLICY IF EXISTS "Users can view their own generation attachments" ON public.generation_attachments;
DROP POLICY IF EXISTS "Users can create their own generation attachments" ON public.generation_attachments;
DROP POLICY IF EXISTS "Users can update their own generation attachments" ON public.generation_attachments;
DROP POLICY IF EXISTS "Users can delete their own generation attachments" ON public.generation_attachments;
CREATE POLICY "Allow public read access to generation_attachments" ON public.generation_attachments FOR SELECT USING (true);
CREATE POLICY "Allow public insert to generation_attachments" ON public.generation_attachments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to generation_attachments" ON public.generation_attachments FOR UPDATE USING (true);
CREATE POLICY "Allow public delete to generation_attachments" ON public.generation_attachments FOR DELETE USING (true);

-- Bot activities table - allow public access
CREATE POLICY "Allow public read access to bot_activities" ON public.bot_activities FOR SELECT USING (true);
CREATE POLICY "Allow public insert to bot_activities" ON public.bot_activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to bot_activities" ON public.bot_activities FOR UPDATE USING (true);
CREATE POLICY "Allow public delete to bot_activities" ON public.bot_activities FOR DELETE USING (true);

-- All other bot-related tables - allow public access
CREATE POLICY "Allow public access to viral_bots" ON public.viral_bots FOR ALL USING (true);
CREATE POLICY "Allow public access to generated_scripts" ON public.generated_scripts FOR ALL USING (true);
CREATE POLICY "Allow public access to trend_detections" ON public.trend_detections FOR ALL USING (true);
CREATE POLICY "Allow public access to content_remixes" ON public.content_remixes FOR ALL USING (true);
CREATE POLICY "Allow public access to cultural_injections" ON public.cultural_injections FOR ALL USING (true);
CREATE POLICY "Allow public access to hook_optimizations" ON public.hook_optimizations FOR ALL USING (true);
CREATE POLICY "Allow public access to generated_thumbnails" ON public.generated_thumbnails FOR ALL USING (true);
CREATE POLICY "Allow public access to performance_metrics" ON public.performance_metrics FOR ALL USING (true);
CREATE POLICY "Allow public access to scheduled_posts" ON public.scheduled_posts FOR ALL USING (true);
CREATE POLICY "Allow public access to engagement_actions" ON public.engagement_actions FOR ALL USING (true);
CREATE POLICY "Allow public access to affiliate_links" ON public.affiliate_links FOR ALL USING (true);
CREATE POLICY "Allow public access to lead_captures" ON public.lead_captures FOR ALL USING (true);
CREATE POLICY "Allow public access to ab_tests" ON public.ab_tests FOR ALL USING (true);