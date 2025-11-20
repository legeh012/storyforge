-- Add performance indexes for frequently queried tables

-- Episodes table indexes
CREATE INDEX IF NOT EXISTS idx_episodes_user_status ON episodes(user_id, status);
CREATE INDEX IF NOT EXISTS idx_episodes_user_created ON episodes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_episodes_project_status ON episodes(project_id, status);

-- Media assets indexes
CREATE INDEX IF NOT EXISTS idx_media_assets_user_type ON media_assets(user_id, asset_type);
CREATE INDEX IF NOT EXISTS idx_media_assets_type_created ON media_assets(asset_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_assets_project ON media_assets(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_assets_episode ON media_assets(episode_id);

-- Bot activities indexes
CREATE INDEX IF NOT EXISTS idx_bot_activities_user_status ON bot_activities(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bot_activities_bot_status ON bot_activities(bot_id, status);
CREATE INDEX IF NOT EXISTS idx_bot_activities_started ON bot_activities(started_at DESC);

-- Bot execution stats indexes
CREATE INDEX IF NOT EXISTS idx_bot_execution_stats_type ON bot_execution_stats(bot_type, executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_bot_execution_stats_episode ON bot_execution_stats(episode_id);
CREATE INDEX IF NOT EXISTS idx_bot_execution_stats_quality ON bot_execution_stats(quality_score DESC);

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_status ON projects(user_id, status);
CREATE INDEX IF NOT EXISTS idx_projects_user_created ON projects(user_id, created_at DESC);

-- Characters indexes
CREATE INDEX IF NOT EXISTS idx_characters_user ON characters(user_id);
CREATE INDEX IF NOT EXISTS idx_characters_project ON characters(project_id);

-- Performance metrics indexes
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user ON performance_metrics(user_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_platform ON performance_metrics(platform, recorded_at DESC);

-- Generation attachments indexes
CREATE INDEX IF NOT EXISTS idx_generation_attachments_user ON generation_attachments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_attachments_project ON generation_attachments(project_id);
CREATE INDEX IF NOT EXISTS idx_generation_attachments_episode ON generation_attachments(episode_id);