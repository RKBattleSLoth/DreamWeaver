-- StoryTime AI v2.0 Database Schema
-- Execute this in Supabase SQL Editor

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
CREATE TABLE illustrations (
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

-- Story-Illustration linking (many-to-many)
CREATE TABLE story_illustrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  illustration_id UUID REFERENCES illustrations(id) ON DELETE CASCADE,
  position INTEGER, -- order within the story
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(story_id, illustration_id, position)
);

-- Indexes for performance
CREATE INDEX idx_child_profiles_user_id ON child_profiles(user_id);
CREATE INDEX idx_stories_user_id ON stories(user_id);
CREATE INDEX idx_stories_child_profile_id ON stories(child_profile_id);
CREATE INDEX idx_illustrations_user_id ON illustrations(user_id);
CREATE INDEX idx_story_illustrations_story_id ON story_illustrations(story_id);
CREATE INDEX idx_story_illustrations_illustration_id ON story_illustrations(illustration_id);

-- RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE illustrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_illustrations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Child profiles policies
CREATE POLICY "Users can view own child profiles" ON child_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create child profiles" ON child_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own child profiles" ON child_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own child profiles" ON child_profiles FOR DELETE USING (auth.uid() = user_id);

-- Stories policies
CREATE POLICY "Users can view own stories" ON stories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create stories" ON stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stories" ON stories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own stories" ON stories FOR DELETE USING (auth.uid() = user_id);

-- Illustrations policies
CREATE POLICY "Users can view own illustrations" ON illustrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create illustrations" ON illustrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own illustrations" ON illustrations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own illustrations" ON illustrations FOR DELETE USING (auth.uid() = user_id);

-- Story-illustration linking policies
CREATE POLICY "Users can view own story-illustration links" ON story_illustrations FOR SELECT USING (
  EXISTS (SELECT 1 FROM stories WHERE stories.id = story_illustrations.story_id AND stories.user_id = auth.uid())
);
CREATE POLICY "Users can create story-illustration links" ON story_illustrations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM stories WHERE stories.id = story_illustrations.story_id AND stories.user_id = auth.uid())
);
CREATE POLICY "Users can update own story-illustration links" ON story_illustrations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM stories WHERE stories.id = story_illustrations.story_id AND stories.user_id = auth.uid())
);
CREATE POLICY "Users can delete own story-illustration links" ON story_illustrations FOR DELETE USING (
  EXISTS (SELECT 1 FROM stories WHERE stories.id = story_illustrations.story_id AND stories.user_id = auth.uid())
);

-- Create storage bucket for illustrations
INSERT INTO storage.buckets (id, name, public) VALUES ('illustrations', 'illustrations', true);

-- Storage policies
CREATE POLICY "Users can upload illustrations" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'illustrations' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view illustrations" ON storage.objects FOR SELECT USING (
  bucket_id = 'illustrations' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own illustrations" ON storage.objects FOR UPDATE USING (
  bucket_id = 'illustrations' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own illustrations" ON storage.objects FOR DELETE USING (
  bucket_id = 'illustrations' AND auth.uid()::text = (storage.foldername(name))[1]
);