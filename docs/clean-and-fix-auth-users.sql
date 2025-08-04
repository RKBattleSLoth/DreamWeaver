-- Clean up all data and fix foreign key constraints to use auth.users

-- Step 1: Delete all existing data from affected tables
TRUNCATE TABLE story_illustrations CASCADE;
TRUNCATE TABLE illustrations CASCADE;
TRUNCATE TABLE stories CASCADE;
TRUNCATE TABLE child_profiles CASCADE;

-- Step 2: Drop the old users table if it exists
DROP TABLE IF EXISTS users CASCADE;

-- Step 3: Drop all existing foreign key constraints
ALTER TABLE child_profiles DROP CONSTRAINT IF EXISTS child_profiles_user_id_fkey CASCADE;
ALTER TABLE stories DROP CONSTRAINT IF EXISTS stories_user_id_fkey CASCADE;
ALTER TABLE illustrations DROP CONSTRAINT IF EXISTS illustrations_user_id_fkey CASCADE;

-- Step 4: Add correct foreign key constraints pointing to auth.users
ALTER TABLE child_profiles 
ADD CONSTRAINT child_profiles_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

ALTER TABLE stories 
ADD CONSTRAINT stories_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

ALTER TABLE illustrations 
ADD CONSTRAINT illustrations_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Step 5: Update RLS policies to ensure they use auth.uid() correctly
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own child profiles" ON child_profiles;
DROP POLICY IF EXISTS "Users can create child profiles" ON child_profiles;
DROP POLICY IF EXISTS "Users can update own child profiles" ON child_profiles;
DROP POLICY IF EXISTS "Users can delete own child profiles" ON child_profiles;

DROP POLICY IF EXISTS "Users can view own stories" ON stories;
DROP POLICY IF EXISTS "Users can create stories" ON stories;
DROP POLICY IF EXISTS "Users can update own stories" ON stories;
DROP POLICY IF EXISTS "Users can delete own stories" ON stories;

DROP POLICY IF EXISTS "Users can view own illustrations" ON illustrations;
DROP POLICY IF EXISTS "Users can create illustrations" ON illustrations;
DROP POLICY IF EXISTS "Users can update own illustrations" ON illustrations;
DROP POLICY IF EXISTS "Users can delete own illustrations" ON illustrations;

DROP POLICY IF EXISTS "Users can view own story-illustration links" ON story_illustrations;
DROP POLICY IF EXISTS "Users can create story-illustration links" ON story_illustrations;
DROP POLICY IF EXISTS "Users can update own story-illustration links" ON story_illustrations;
DROP POLICY IF EXISTS "Users can delete own story-illustration links" ON story_illustrations;

-- Recreate RLS policies with auth.uid()
CREATE POLICY "Users can view own child profiles" ON child_profiles 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create child profiles" ON child_profiles 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own child profiles" ON child_profiles 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own child profiles" ON child_profiles 
FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own stories" ON stories 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create stories" ON stories 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stories" ON stories 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stories" ON stories 
FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own illustrations" ON illustrations 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create illustrations" ON illustrations 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own illustrations" ON illustrations 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own illustrations" ON illustrations 
FOR DELETE USING (auth.uid() = user_id);

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

-- Step 6: Verify everything is correct
SELECT 'Foreign Key Constraints:' as info;
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('child_profiles', 'stories', 'illustrations');

SELECT 'Tables in public schema:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

SELECT 'Current user in auth.users:' as info;
SELECT id, email, created_at 
FROM auth.users 
WHERE id = auth.uid();