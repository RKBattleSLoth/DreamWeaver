-- Check existing tables in your Supabase database
-- Run this query first to see what already exists

SELECT table_name, table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check existing columns in users table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;