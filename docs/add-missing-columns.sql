-- Add any missing columns to the child_profiles table
-- Run this after checking which columns exist

-- Add preferred_art_style if it doesn't exist
ALTER TABLE child_profiles 
ADD COLUMN IF NOT EXISTS preferred_art_style VARCHAR(50) DEFAULT 'watercolor';

-- Add content_safety if it doesn't exist  
ALTER TABLE child_profiles 
ADD COLUMN IF NOT EXISTS content_safety VARCHAR(50) DEFAULT 'strict';

-- Add interests array if it doesn't exist
ALTER TABLE child_profiles 
ADD COLUMN IF NOT EXISTS interests TEXT[];

-- Add favorite_themes array if it doesn't exist
ALTER TABLE child_profiles 
ADD COLUMN IF NOT EXISTS favorite_themes TEXT[];

-- Add reading_level if it doesn't exist
ALTER TABLE child_profiles 
ADD COLUMN IF NOT EXISTS reading_level VARCHAR(50);

-- Add grade if it doesn't exist
ALTER TABLE child_profiles 
ADD COLUMN IF NOT EXISTS grade VARCHAR(50);

-- Add age if it doesn't exist
ALTER TABLE child_profiles 
ADD COLUMN IF NOT EXISTS age INTEGER;

-- Add is_active if it doesn't exist
ALTER TABLE child_profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;

-- Add timestamps if they don't exist
ALTER TABLE child_profiles 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

ALTER TABLE child_profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Verify the table structure after adding columns
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'child_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;