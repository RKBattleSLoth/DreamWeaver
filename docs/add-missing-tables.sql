-- Add only the missing tables for StoryTime AI v2.0
-- Run this after checking what tables already exist

-- Create child_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS child_profiles (
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

-- Create stories table if it doesn't exist
CREATE TABLE IF NOT EXISTS stories (
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

-- Create illustrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS illustrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  image_url VARCHAR(500) NOT NULL, -- Supabase storage URL
  image_path VARCHAR(500) NOT NULL, -- storage path
  art_style VARCHAR(100),
  generation_prompt TEXT, -- original prompt used
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  tags TEXT[], -- searchable tags
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create story_illustrations linking table if it doesn't exist
CREATE TABLE IF NOT EXISTS story_illustrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  illustration_id UUID REFERENCES illustrations(id) ON DELETE CASCADE,
  position INTEGER, -- order within the story
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(story_id, illustration_id, position)
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_child_profiles_user_id ON child_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_child_profile_id ON stories(child_profile_id);
CREATE INDEX IF NOT EXISTS idx_illustrations_user_id ON illustrations(user_id);
CREATE INDEX IF NOT EXISTS idx_story_illustrations_story_id ON story_illustrations(story_id);
CREATE INDEX IF NOT EXISTS idx_story_illustrations_illustration_id ON story_illustrations(illustration_id);

-- Enable RLS on new tables
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE illustrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_illustrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for child_profiles
CREATE POLICY IF NOT EXISTS "Users can view own child profiles" ON child_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can create child profiles" ON child_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update own child profiles" ON child_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can delete own child profiles" ON child_profiles FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for stories
CREATE POLICY IF NOT EXISTS "Users can view own stories" ON stories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can create stories" ON stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update own stories" ON stories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can delete own stories" ON stories FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for illustrations
CREATE POLICY IF NOT EXISTS "Users can view own illustrations" ON illustrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can create illustrations" ON illustrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update own illustrations" ON illustrations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can delete own illustrations" ON illustrations FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for story_illustrations
CREATE POLICY IF NOT EXISTS "Users can view own story-illustration links" ON story_illustrations FOR SELECT USING (
  EXISTS (SELECT 1 FROM stories WHERE stories.id = story_illustrations.story_id AND stories.user_id = auth.uid())
);
CREATE POLICY IF NOT EXISTS "Users can create story-illustration links" ON story_illustrations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM stories WHERE stories.id = story_illustrations.story_id AND stories.user_id = auth.uid())
);
CREATE POLICY IF NOT EXISTS "Users can update own story-illustration links" ON story_illustrations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM stories WHERE stories.id = story_illustrations.story_id AND stories.user_id = auth.uid())
);
CREATE POLICY IF NOT EXISTS "Users can delete own story-illustration links" ON story_illustrations FOR DELETE USING (
  EXISTS (SELECT 1 FROM stories WHERE stories.id = story_illustrations.story_id AND stories.user_id = auth.uid())
);

-- Create storage bucket for illustrations if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('illustrations', 'illustrations', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies if they don't exist
CREATE POLICY IF NOT EXISTS "Users can upload illustrations" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'illustrations' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can view illustrations" ON storage.objects FOR SELECT USING (
  bucket_id = 'illustrations' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can update own illustrations" ON storage.objects FOR UPDATE USING (
  bucket_id = 'illustrations' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can delete own illustrations" ON storage.objects FOR DELETE USING (
  bucket_id = 'illustrations' AND auth.uid()::text = (storage.foldername(name))[1]
);