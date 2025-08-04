-- Safe way to fix the foreign key constraint

-- Step 1: Check if there's data in child_profiles
SELECT COUNT(*) as existing_profiles FROM child_profiles;

-- Step 2: If you want to preserve existing data, first backup
-- CREATE TABLE child_profiles_backup AS SELECT * FROM child_profiles;

-- Step 3: Drop the existing constraint without validation
ALTER TABLE child_profiles 
DROP CONSTRAINT IF EXISTS child_profiles_user_id_fkey CASCADE;

-- Step 4: Clean up any orphaned records (optional - only if you don't need them)
-- DELETE FROM child_profiles WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Step 5: Add the new constraint with NOT VALID to skip existing data check
ALTER TABLE child_profiles 
ADD CONSTRAINT child_profiles_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE
NOT VALID;

-- Step 6: Validate the constraint for future inserts (optional)
-- ALTER TABLE child_profiles VALIDATE CONSTRAINT child_profiles_user_id_fkey;

-- Do the same for other tables
ALTER TABLE stories 
DROP CONSTRAINT IF EXISTS stories_user_id_fkey CASCADE;

ALTER TABLE stories 
ADD CONSTRAINT stories_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE
NOT VALID;

ALTER TABLE illustrations 
DROP CONSTRAINT IF EXISTS illustrations_user_id_fkey CASCADE;

ALTER TABLE illustrations 
ADD CONSTRAINT illustrations_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE
NOT VALID;

-- Verify the new constraints
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