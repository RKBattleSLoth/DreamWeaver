-- Migration: Comprehensive Indexing and Story-Illustration Linking
-- Purpose: Optimize performance and establish robust relationships between stories, illustrations, and world-building entities
-- Date: 2025-08-10

-- ================================================
-- PART 1: Performance Indexes
-- ================================================

-- Stories table indexes
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_child_profile_id ON stories(child_profile_id);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_is_favorite ON stories(is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_stories_theme ON stories(theme);
CREATE INDEX IF NOT EXISTS idx_stories_word_count ON stories(word_count);

-- Illustrations table indexes
CREATE INDEX IF NOT EXISTS idx_illustrations_user_id ON illustrations(user_id);
CREATE INDEX IF NOT EXISTS idx_illustrations_session_id ON illustrations(session_id);
CREATE INDEX IF NOT EXISTS idx_illustrations_created_at ON illustrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_illustrations_is_canonical ON illustrations(is_canonical) WHERE is_canonical = true;
CREATE INDEX IF NOT EXISTS idx_illustrations_generation_batch_id ON illustrations(generation_batch_id);
CREATE INDEX IF NOT EXISTS idx_illustrations_art_style ON illustrations(art_style);
CREATE INDEX IF NOT EXISTS idx_illustrations_target_entity_type ON illustrations(target_entity_type);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_illustrations_user_canonical ON illustrations(user_id, is_canonical) WHERE is_canonical = true;
CREATE INDEX IF NOT EXISTS idx_illustrations_session_round ON illustrations(session_id, iteration_round);

-- ================================================
-- PART 2: Story-Illustration Linking Enhancement
-- ================================================

-- Add missing columns to story_illustration_links if they don't exist
ALTER TABLE story_illustration_links 
ADD COLUMN IF NOT EXISTS layout_preferences JSONB,
ADD COLUMN IF NOT EXISTS is_cover_image BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS display_size VARCHAR(20) DEFAULT 'medium' CHECK (display_size IN ('small', 'medium', 'large', 'full'));

-- Indexes for story_illustration_links
CREATE INDEX IF NOT EXISTS idx_story_illustration_links_story_id ON story_illustration_links(story_id);
CREATE INDEX IF NOT EXISTS idx_story_illustration_links_illustration_id ON story_illustration_links(illustration_id);
CREATE INDEX IF NOT EXISTS idx_story_illustration_links_position ON story_illustration_links(story_id, position);
CREATE INDEX IF NOT EXISTS idx_story_illustration_links_cover ON story_illustration_links(story_id) WHERE is_cover_image = true;

-- ================================================
-- PART 3: World-Building Entity Tables
-- ================================================

-- Create story_elements table if it doesn't exist
CREATE TABLE IF NOT EXISTS story_elements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('object', 'creature', 'vehicle', 'magical_item')),
    description TEXT,
    visual_description TEXT,
    significance TEXT,
    canonical_illustration_id UUID REFERENCES illustrations(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create story_element_usage table if it doesn't exist
CREATE TABLE IF NOT EXISTS story_element_usage (
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    element_id UUID NOT NULL REFERENCES story_elements(id) ON DELETE CASCADE,
    importance VARCHAR(20) NOT NULL CHECK (importance IN ('central', 'supporting', 'background')),
    context TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (story_id, element_id)
);

-- Indexes for world-building tables
CREATE INDEX IF NOT EXISTS idx_characters_user_id ON characters(user_id);
CREATE INDEX IF NOT EXISTS idx_characters_canonical_illustration ON characters(canonical_illustration_id);
CREATE INDEX IF NOT EXISTS idx_story_settings_user_id ON story_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_story_elements_user_id ON story_elements(user_id);
CREATE INDEX IF NOT EXISTS idx_story_elements_type ON story_elements(type);

-- Indexes for relationship tables
CREATE INDEX IF NOT EXISTS idx_story_character_appearances_story ON story_character_appearances(story_id);
CREATE INDEX IF NOT EXISTS idx_story_character_appearances_character ON story_character_appearances(character_id);
CREATE INDEX IF NOT EXISTS idx_story_setting_usage_story ON story_setting_usage(story_id);
CREATE INDEX IF NOT EXISTS idx_story_setting_usage_setting ON story_setting_usage(setting_id);
CREATE INDEX IF NOT EXISTS idx_story_element_usage_story ON story_element_usage(story_id);
CREATE INDEX IF NOT EXISTS idx_story_element_usage_element ON story_element_usage(element_id);

-- ================================================
-- PART 4: Full-Text Search Indexes
-- ================================================

-- Create GIN indexes for full-text search on stories
CREATE INDEX IF NOT EXISTS idx_stories_content_search ON stories USING GIN(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_stories_title_search ON stories USING GIN(to_tsvector('english', title));

-- Create GIN indexes for full-text search on illustrations
CREATE INDEX IF NOT EXISTS idx_illustrations_prompt_search ON illustrations USING GIN(to_tsvector('english', generation_prompt));
CREATE INDEX IF NOT EXISTS idx_illustrations_description_search ON illustrations USING GIN(to_tsvector('english', description));

-- ================================================
-- PART 5: Materialized Views for Performance
-- ================================================

-- Create a materialized view for story statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS story_statistics AS
SELECT 
    s.id as story_id,
    s.user_id,
    s.child_profile_id,
    s.title,
    s.created_at,
    COUNT(DISTINCT sil.illustration_id) as illustration_count,
    COUNT(DISTINCT sca.character_id) as character_count,
    COUNT(DISTINCT ssu.setting_id) as setting_count,
    COUNT(DISTINCT seu.element_id) as element_count,
    MAX(CASE WHEN sil.is_cover_image THEN sil.illustration_id END) as cover_illustration_id
FROM stories s
LEFT JOIN story_illustration_links sil ON s.id = sil.story_id
LEFT JOIN story_character_appearances sca ON s.id = sca.story_id
LEFT JOIN story_setting_usage ssu ON s.id = ssu.story_id
LEFT JOIN story_element_usage seu ON s.id = seu.story_id
GROUP BY s.id, s.user_id, s.child_profile_id, s.title, s.created_at;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_story_statistics_story_id ON story_statistics(story_id);
CREATE INDEX IF NOT EXISTS idx_story_statistics_user_id ON story_statistics(user_id);

-- ================================================
-- PART 6: Trigger Functions for Data Integrity
-- ================================================

-- Function to update story updated_at timestamp when illustrations are linked
CREATE OR REPLACE FUNCTION update_story_timestamp_on_illustration_link()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE stories SET updated_at = NOW() WHERE id = NEW.story_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for story_illustration_links
DROP TRIGGER IF EXISTS update_story_on_illustration_link ON story_illustration_links;
CREATE TRIGGER update_story_on_illustration_link
AFTER INSERT OR UPDATE ON story_illustration_links
FOR EACH ROW
EXECUTE FUNCTION update_story_timestamp_on_illustration_link();

-- Function to ensure only one cover image per story
CREATE OR REPLACE FUNCTION ensure_single_cover_image()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_cover_image = true THEN
        UPDATE story_illustration_links 
        SET is_cover_image = false 
        WHERE story_id = NEW.story_id 
        AND illustration_id != NEW.illustration_id 
        AND is_cover_image = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for single cover image
DROP TRIGGER IF EXISTS ensure_single_cover ON story_illustration_links;
CREATE TRIGGER ensure_single_cover
BEFORE INSERT OR UPDATE ON story_illustration_links
FOR EACH ROW
EXECUTE FUNCTION ensure_single_cover_image();

-- ================================================
-- PART 7: Helper Functions for Queries
-- ================================================

-- Function to get all illustrations for a story with proper ordering
CREATE OR REPLACE FUNCTION get_story_illustrations(p_story_id UUID)
RETURNS TABLE (
    illustration_id UUID,
    title VARCHAR,
    image_path VARCHAR,
    position INT,
    is_cover BOOLEAN,
    caption TEXT,
    context TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.title,
        i.image_path,
        sil.position,
        sil.is_cover_image,
        sil.caption,
        sil.context
    FROM illustrations i
    JOIN story_illustration_links sil ON i.id = sil.illustration_id
    WHERE sil.story_id = p_story_id
    ORDER BY sil.position;
END;
$$ LANGUAGE plpgsql;

-- Function to get world-building summary for a user
CREATE OR REPLACE FUNCTION get_user_world_building_summary(p_user_id UUID)
RETURNS TABLE (
    entity_type TEXT,
    entity_count BIGINT,
    illustrated_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'characters'::TEXT, COUNT(*), COUNT(canonical_illustration_id)
    FROM characters WHERE user_id = p_user_id
    UNION ALL
    SELECT 'settings'::TEXT, COUNT(*), COUNT(canonical_illustration_id)
    FROM story_settings WHERE user_id = p_user_id
    UNION ALL
    SELECT 'elements'::TEXT, COUNT(*), COUNT(canonical_illustration_id)
    FROM story_elements WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- PART 8: Performance Statistics
-- ================================================

-- Create a table to track query performance (optional, for monitoring)
CREATE TABLE IF NOT EXISTS query_performance_log (
    id SERIAL PRIMARY KEY,
    query_type VARCHAR(100),
    execution_time_ms INTEGER,
    user_id UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_query_performance_created ON query_performance_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_query_performance_type ON query_performance_log(query_type);

-- ================================================
-- Comments for documentation
-- ================================================

COMMENT ON TABLE story_illustration_links IS 'Links stories to illustrations with positioning and display metadata';
COMMENT ON COLUMN story_illustration_links.position IS 'Order of illustration within the story (1-based)';
COMMENT ON COLUMN story_illustration_links.is_cover_image IS 'Whether this illustration is the story cover';
COMMENT ON COLUMN story_illustration_links.layout_preferences IS 'JSON object containing layout preferences like alignment, padding, etc.';

COMMENT ON MATERIALIZED VIEW story_statistics IS 'Pre-computed statistics for stories to improve query performance';
COMMENT ON FUNCTION get_story_illustrations IS 'Retrieves all illustrations for a story in proper order';
COMMENT ON FUNCTION get_user_world_building_summary IS 'Provides a summary of user world-building entities';