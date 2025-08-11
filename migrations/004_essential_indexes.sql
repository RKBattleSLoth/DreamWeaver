-- Migration: Essential Indexes for Story-Illustration Linking
-- Purpose: Add critical indexes to improve query performance
-- Date: 2025-08-10

-- Stories table indexes
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_child_profile_id ON stories(child_profile_id);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_is_favorite ON stories(is_favorite) WHERE is_favorite = true;

-- Illustrations table indexes
CREATE INDEX IF NOT EXISTS idx_illustrations_user_id ON illustrations(user_id);
CREATE INDEX IF NOT EXISTS idx_illustrations_session_id ON illustrations(session_id);
CREATE INDEX IF NOT EXISTS idx_illustrations_created_at ON illustrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_illustrations_is_canonical ON illustrations(is_canonical) WHERE is_canonical = true;
CREATE INDEX IF NOT EXISTS idx_illustrations_generation_batch_id ON illustrations(generation_batch_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_illustrations_user_canonical ON illustrations(user_id, is_canonical) WHERE is_canonical = true;
CREATE INDEX IF NOT EXISTS idx_illustrations_session_round ON illustrations(session_id, iteration_round);

-- Story-illustration linking
CREATE INDEX IF NOT EXISTS idx_story_illustration_links_story_id ON story_illustration_links(story_id);
CREATE INDEX IF NOT EXISTS idx_story_illustration_links_illustration_id ON story_illustration_links(illustration_id);
CREATE INDEX IF NOT EXISTS idx_story_illustration_links_story_position ON story_illustration_links(story_id, "position");