-- Schema Optimization and World-Building Enhancement
-- Migration: 002_schema_optimization_world_building.sql

-- ==========================================
-- WORLD-BUILDING ENTITY TABLES
-- ==========================================

-- Characters that persist across stories
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  visual_traits TEXT, -- "blonde hair, blue eyes, always wears red cape"
  personality_traits TEXT[], -- ["brave", "curious", "kind"]  
  canonical_illustration_id UUID, -- Will reference illustrations(id) after illustrations are updated
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Settings/locations that appear in multiple stories
CREATE TABLE IF NOT EXISTS story_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  visual_description TEXT, -- "enchanted forest with glowing mushrooms"
  atmosphere VARCHAR(50), -- "magical", "cozy", "mysterious"
  canonical_illustration_id UUID, -- Will reference illustrations(id) after illustrations are updated
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Important objects/elements that appear across stories  
CREATE TABLE IF NOT EXISTS story_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(30) CHECK (type IN ('object', 'creature', 'vehicle', 'magical_item')),
  description TEXT,
  visual_description TEXT,
  significance TEXT, -- Why this element is important
  canonical_illustration_id UUID, -- Will reference illustrations(id) after illustrations are updated
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- ENHANCE ILLUSTRATIONS TABLE
-- ==========================================

-- Add new world-building reference columns to illustrations
ALTER TABLE illustrations 
ADD COLUMN IF NOT EXISTS target_entity_type VARCHAR(20) CHECK (target_entity_type IN ('character', 'setting', 'element', 'scene')),
ADD COLUMN IF NOT EXISTS depicts_character_id UUID,
ADD COLUMN IF NOT EXISTS depicts_setting_id UUID,  
ADD COLUMN IF NOT EXISTS depicts_element_id UUID,
ADD COLUMN IF NOT EXISTS dalle_revised_prompt TEXT;

-- Update illustration_sessions to support world-building targets
ALTER TABLE illustration_sessions
ADD COLUMN IF NOT EXISTS target_entity_type VARCHAR(20) CHECK (target_entity_type IN ('character', 'setting', 'element', 'scene')),
ADD COLUMN IF NOT EXISTS target_entity_id UUID;

-- ==========================================  
-- ENHANCED LINKING TABLES
-- ==========================================

-- Replace story_illustrations with enhanced version
DROP TABLE IF EXISTS story_illustration_links CASCADE;
CREATE TABLE story_illustration_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  illustration_id UUID NOT NULL REFERENCES illustrations(id) ON DELETE CASCADE,
  position INTEGER NOT NULL, -- Order in story (1, 2, 3...)
  caption TEXT, -- Optional caption for the illustration
  context TEXT, -- What part of story this illustrates
  layout_preferences JSONB DEFAULT '{}', -- Size, positioning, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(story_id, illustration_id),
  UNIQUE(story_id, position) -- Only one illustration per position
);

-- Which characters appear in which stories
CREATE TABLE IF NOT EXISTS story_character_appearances (
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  role VARCHAR(30) CHECK (role IN ('protagonist', 'antagonist', 'supporting', 'mentioned')),
  importance_score INTEGER DEFAULT 1 CHECK (importance_score >= 1 AND importance_score <= 5),
  PRIMARY KEY (story_id, character_id)
);

-- Which settings are used in which stories
CREATE TABLE IF NOT EXISTS story_setting_usage (
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,  
  setting_id UUID NOT NULL REFERENCES story_settings(id) ON DELETE CASCADE,
  scene_order INTEGER, -- Which scene number this setting appears in
  description_context TEXT, -- How it's described in this story
  PRIMARY KEY (story_id, setting_id)
);

-- Which elements appear in which stories
CREATE TABLE IF NOT EXISTS story_element_usage (
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  element_id UUID NOT NULL REFERENCES story_elements(id) ON DELETE CASCADE,
  importance VARCHAR(20) CHECK (importance IN ('central', 'supporting', 'background')),
  context TEXT, -- How the element is used in this story  
  PRIMARY KEY (story_id, element_id)
);

-- ==========================================
-- FOREIGN KEY CONSTRAINTS (Deferred)
-- ==========================================

-- Add foreign key constraints after all tables exist
-- Note: These will be added in a separate step to avoid circular dependencies

-- ==========================================
-- PERFORMANCE INDEXES  
-- ==========================================

-- Core performance indexes
CREATE INDEX IF NOT EXISTS idx_child_profiles_user_active ON child_profiles(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_stories_user_date ON stories(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_child_profile ON stories(child_profile_id);

-- Illustration indexes  
CREATE INDEX IF NOT EXISTS idx_illustrations_user_canonical ON illustrations(user_id, is_canonical);
CREATE INDEX IF NOT EXISTS idx_illustrations_session ON illustrations(session_id);
CREATE INDEX IF NOT EXISTS idx_illustrations_batch ON illustrations(generation_batch_id);
CREATE INDEX IF NOT EXISTS idx_illustrations_character ON illustrations(depicts_character_id);
CREATE INDEX IF NOT EXISTS idx_illustrations_setting ON illustrations(depicts_setting_id);
CREATE INDEX IF NOT EXISTS idx_illustrations_element ON illustrations(depicts_element_id);

-- Linking table indexes
CREATE INDEX IF NOT EXISTS idx_story_links_story_pos ON story_illustration_links(story_id, position);
CREATE INDEX IF NOT EXISTS idx_story_links_illustration ON story_illustration_links(illustration_id);

-- World-building indexes
CREATE INDEX IF NOT EXISTS idx_characters_user ON characters(user_id);
CREATE INDEX IF NOT EXISTS idx_settings_user ON story_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_elements_user ON story_elements(user_id);
CREATE INDEX IF NOT EXISTS idx_character_appearances ON story_character_appearances(story_id);
CREATE INDEX IF NOT EXISTS idx_setting_usage ON story_setting_usage(story_id);
CREATE INDEX IF NOT EXISTS idx_element_usage ON story_element_usage(story_id);

-- Session tracking indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user ON illustration_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_story ON illustration_sessions(story_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON illustration_sessions(status);

-- ==========================================
-- UPDATE TRIGGERS  
-- ==========================================

-- Update timestamp triggers for new tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all relevant tables
DROP TRIGGER IF EXISTS update_characters_updated_at ON characters;
CREATE TRIGGER update_characters_updated_at
    BEFORE UPDATE ON characters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_story_settings_updated_at ON story_settings;  
CREATE TRIGGER update_story_settings_updated_at
    BEFORE UPDATE ON story_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_story_elements_updated_at ON story_elements;
CREATE TRIGGER update_story_elements_updated_at
    BEFORE UPDATE ON story_elements
    FOR EACH ROW  
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- DATA MIGRATION PREP
-- ==========================================

-- Migrate existing story_illustrations data if it exists
INSERT INTO story_illustration_links (story_id, illustration_id, position, created_at)
SELECT story_id, illustration_id, position, created_at 
FROM story_illustrations
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'story_illustrations');

-- ==========================================
-- CLEANUP LEGACY FIELDS (Optional - can be done later)
-- ==========================================

-- These can be removed in a future migration after data is fully migrated:
-- ALTER TABLE stories DROP COLUMN IF EXISTS generation_prompt;
-- ALTER TABLE stories DROP COLUMN IF EXISTS word_count;
-- ALTER TABLE child_profiles DROP COLUMN IF EXISTS grade;

-- ==========================================
-- COMMENTS FOR DOCUMENTATION
-- ==========================================

COMMENT ON TABLE characters IS 'Persistent character entities that appear across multiple stories';
COMMENT ON TABLE story_settings IS 'Locations and settings that can be reused across stories for world consistency';
COMMENT ON TABLE story_elements IS 'Important objects, creatures, or magical items that appear in stories';
COMMENT ON TABLE story_illustration_links IS 'Enhanced story-illustration linking with positioning and context';
COMMENT ON TABLE story_character_appearances IS 'Tracks which characters appear in which stories';
COMMENT ON TABLE story_setting_usage IS 'Tracks which settings are used in which stories';
COMMENT ON TABLE story_element_usage IS 'Tracks which story elements appear in which stories';