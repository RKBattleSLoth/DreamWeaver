-- DreamWeaver Database Schema for Railway PostgreSQL
-- Compatible with standard PostgreSQL without Supabase-specific features

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Child profiles
CREATE TABLE child_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  age INTEGER,
  grade VARCHAR(50),
  reading_level VARCHAR(50), -- beginner, intermediate, advanced
  interests TEXT[], -- array of interests
  favorite_themes TEXT[], -- array of themes
  content_safety VARCHAR(50) DEFAULT 'strict',
  preferred_art_style VARCHAR(50) DEFAULT 'watercolor',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Stories (text only)
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  child_profile_id UUID REFERENCES child_profiles(id),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL, -- full story text
  theme VARCHAR(100),
  reading_level VARCHAR(50),
  word_count INTEGER,
  generation_prompt TEXT, -- original prompt used
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Illustrations (separate entity)
-- Modified to store file paths for local/cloud storage instead of Supabase URLs
CREATE TABLE illustrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  file_path VARCHAR(500) NOT NULL, -- local or cloud storage path
  storage_type VARCHAR(50) DEFAULT 'local', -- 'local', 's3', 'cloudinary', etc.
  public_url VARCHAR(500), -- public URL if using cloud storage
  art_style VARCHAR(100),
  generation_prompt TEXT, -- original prompt used
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  mime_type VARCHAR(100),
  tags TEXT[], -- searchable tags
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Story-Illustration linking (many-to-many)
CREATE TABLE story_illustrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  illustration_id UUID REFERENCES illustrations(id) ON DELETE CASCADE,
  position INTEGER, -- order within the story
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(story_id, illustration_id, position)
);

-- User sessions table (for JWT refresh tokens)
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  refresh_token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_child_profiles_user_id ON child_profiles(user_id);
CREATE INDEX idx_stories_user_id ON stories(user_id);
CREATE INDEX idx_stories_child_profile_id ON stories(child_profile_id);
CREATE INDEX idx_illustrations_user_id ON illustrations(user_id);
CREATE INDEX idx_story_illustrations_story_id ON story_illustrations(story_id);
CREATE INDEX idx_story_illustrations_illustration_id ON story_illustrations(illustration_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_refresh_token ON user_sessions(refresh_token);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_child_profiles_updated_at BEFORE UPDATE ON child_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_illustrations_updated_at BEFORE UPDATE ON illustrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();