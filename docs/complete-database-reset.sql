-- Complete Database Reset for StoryTime AI v2.0
-- This will remove ALL existing tables and data, then rebuild correctly

-- Step 1: Drop all existing tables from the old version
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS store_generation CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS stories CASCADE;
DROP TABLE IF EXISTS child_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;  -- This is the problematic public.users table

-- Step 2: Ensure UUID extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 3: Create new tables with correct foreign keys to auth.users

-- Child profiles (linked to auth.users)
CREATE TABLE child_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  age INTEGER,
  grade VARCHAR(50),
  reading_level VARCHAR(50),
  interests TEXT[],
  favorite_themes TEXT[],
  content_safety VARCHAR(50) DEFAULT 'strict',
  preferred_art_style VARCHAR(50) DEFAULT 'watercolor',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Stories (text only)
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  child_profile_id UUID REFERENCES child_profiles(id),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  theme VARCHAR(100),
  reading_level VARCHAR(50),
  word_count INTEGER,
  generation_prompt TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Illustrations (separate entity)
CREATE TABLE illustrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  image_url VARCHAR(500) NOT NULL,
  image_path VARCHAR(500) NOT NULL,
  art_style VARCHAR(100),
  generation_prompt TEXT,
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Story-Illustration linking (many-to-many)
CREATE TABLE story_illustrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  illustration_id UUID REFERENCES illustrations(id) ON DELETE CASCADE,
  position INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(story_id, illustration_id, position)
);

-- Step 4: Create indexes for performance
CREATE INDEX idx_child_profiles_user_id ON child_profiles(user_id);
CREATE INDEX idx_child_profiles_active ON child_profiles(user_id, is_active);
CREATE INDEX idx_stories_user_id ON stories(user_id);
CREATE INDEX idx_stories_child_profile_id ON stories(child_profile_id);
CREATE INDEX idx_stories_created_at ON stories(user_id, created_at DESC);
CREATE INDEX idx_illustrations_user_id ON illustrations(user_id);
CREATE INDEX idx_illustrations_created_at ON illustrations(user_id, created_at DESC);
CREATE INDEX idx_story_illustrations_story_id ON story_illustrations(story_id);
CREATE INDEX idx_story_illustrations_illustration_id ON story_illustrations(illustration_id);

-- Step 5: Enable RLS on all tables
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE illustrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_illustrations ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies
-- Child profiles policies
CREATE POLICY "Users can view own child profiles" ON child_profiles 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create child profiles" ON child_profiles 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own child profiles" ON child_profiles 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own child profiles" ON child_profiles 
FOR DELETE USING (auth.uid() = user_id);

-- Stories policies
CREATE POLICY "Users can view own stories" ON stories 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create stories" ON stories 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stories" ON stories 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stories" ON stories 
FOR DELETE USING (auth.uid() = user_id);

-- Illustrations policies
CREATE POLICY "Users can view own illustrations" ON illustrations 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create illustrations" ON illustrations 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own illustrations" ON illustrations 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own illustrations" ON illustrations 
FOR DELETE USING (auth.uid() = user_id);

-- Story-illustrations policies
CREATE POLICY "Users can view own story-illustration links" ON story_illustrations 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM stories WHERE stories.id = story_illustrations.story_id AND stories.user_id = auth.uid())
);

CREATE POLICY "Users can create story-illustration links" ON story_illustrations 
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM stories WHERE stories.id = story_illustrations.story_id AND stories.user_id = auth.uid())
);

CREATE POLICY "Users can update own story-illustration links" ON story_illustrations 
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM stories WHERE stories.id = story_illustrations.story_id AND stories.user_id = auth.uid())
);

CREATE POLICY "Users can delete own story-illustration links" ON story_illustrations 
FOR DELETE USING (
  EXISTS (SELECT 1 FROM stories WHERE stories.id = story_illustrations.story_id AND stories.user_id = auth.uid())
);

-- Step 7: Create storage bucket for illustrations
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'illustrations', 
  'illustrations', 
  true, 
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Step 8: Storage policies
CREATE POLICY "Users can upload illustrations" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'illustrations' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view illustrations" ON storage.objects 
FOR SELECT USING (
  bucket_id = 'illustrations'
);

CREATE POLICY "Users can update own illustrations" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'illustrations' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own illustrations" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'illustrations' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Step 9: Verify the results
SELECT 'Tables in public schema:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

SELECT 'Foreign key constraints:' as info;
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public';

SELECT 'Your auth.users entry:' as info;
SELECT id, email, created_at 
FROM auth.users 
WHERE id = auth.uid();