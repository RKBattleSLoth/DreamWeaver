-- Fix foreign key constraints to reference auth.users instead of public.users

-- First, drop the existing foreign key constraint
ALTER TABLE child_profiles 
DROP CONSTRAINT IF EXISTS child_profiles_user_id_fkey;

-- Add the correct foreign key constraint pointing to auth.users
ALTER TABLE child_profiles 
ADD CONSTRAINT child_profiles_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Do the same for other tables that reference users
ALTER TABLE stories 
DROP CONSTRAINT IF EXISTS stories_user_id_fkey;

ALTER TABLE stories 
ADD CONSTRAINT stories_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

ALTER TABLE illustrations 
DROP CONSTRAINT IF EXISTS illustrations_user_id_fkey;

ALTER TABLE illustrations 
ADD CONSTRAINT illustrations_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Verify the constraints
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
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('child_profiles', 'stories', 'illustrations');