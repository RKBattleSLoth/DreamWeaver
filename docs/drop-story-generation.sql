-- Drop the old story_generation table from v1.0
DROP TABLE IF EXISTS story_generation CASCADE;

-- Verify it's gone
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;