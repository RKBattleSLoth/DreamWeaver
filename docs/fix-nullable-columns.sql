-- Fix nullable constraints on optional columns in child_profiles table

-- Make reading_level nullable (it's optional)
ALTER TABLE child_profiles 
ALTER COLUMN reading_level DROP NOT NULL;

-- Make age nullable (it's optional)
ALTER TABLE child_profiles 
ALTER COLUMN age DROP NOT NULL;

-- Make grade nullable (it's optional)
ALTER TABLE child_profiles 
ALTER COLUMN grade DROP NOT NULL;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'child_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;