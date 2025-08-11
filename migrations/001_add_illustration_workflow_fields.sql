-- Add new fields for collaborative illustration generation workflow
-- Migration: 001_add_illustration_workflow_fields.sql

-- First rename file_path to image_path if needed
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'illustrations' AND column_name = 'file_path') THEN
        ALTER TABLE illustrations RENAME COLUMN file_path TO image_path;
    END IF;
END $$;

-- Add new columns to illustrations table
ALTER TABLE illustrations 
ADD COLUMN IF NOT EXISTS image_path VARCHAR(255),
ADD COLUMN IF NOT EXISTS generation_batch_id UUID,
ADD COLUMN IF NOT EXISTS is_canonical BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS parent_illustration_id UUID,
ADD COLUMN IF NOT EXISTS variation_prompt TEXT,
ADD COLUMN IF NOT EXISTS iteration_round INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS story_context JSONB,
ADD COLUMN IF NOT EXISTS dalle_revised_prompt TEXT,
ADD COLUMN IF NOT EXISTS session_id UUID,
ADD COLUMN IF NOT EXISTS target_entity_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS depicts_character_id UUID,
ADD COLUMN IF NOT EXISTS depicts_setting_id UUID,
ADD COLUMN IF NOT EXISTS depicts_element_id UUID;

-- Add foreign key constraint only if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'illustrations_parent_illustration_id_fkey') THEN
        ALTER TABLE illustrations 
        ADD CONSTRAINT illustrations_parent_illustration_id_fkey 
        FOREIGN KEY (parent_illustration_id) REFERENCES illustrations(id);
    END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_illustrations_batch_id ON illustrations(generation_batch_id);
CREATE INDEX IF NOT EXISTS idx_illustrations_canonical ON illustrations(is_canonical) WHERE is_canonical = true;
CREATE INDEX IF NOT EXISTS idx_illustrations_parent ON illustrations(parent_illustration_id);
CREATE INDEX IF NOT EXISTS idx_illustrations_session ON illustrations USING GIN (story_context) WHERE story_context ? 'sessionId';

-- Create illustration_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS illustration_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
    scene_prompt TEXT NOT NULL,
    scene_type VARCHAR(20) NOT NULL CHECK (scene_type IN ('character', 'scene', 'object', 'setting')),
    current_round INTEGER DEFAULT 1,
    max_rounds INTEGER DEFAULT 5,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for session queries
CREATE INDEX IF NOT EXISTS idx_illustration_sessions_user ON illustration_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_illustration_sessions_story ON illustration_sessions(story_id);
CREATE INDEX IF NOT EXISTS idx_illustration_sessions_status ON illustration_sessions(status);

-- Update trigger for illustration_sessions
CREATE OR REPLACE FUNCTION update_illustration_sessions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_illustration_sessions_timestamp ON illustration_sessions;
CREATE TRIGGER update_illustration_sessions_timestamp
    BEFORE UPDATE ON illustration_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_illustration_sessions_timestamp();