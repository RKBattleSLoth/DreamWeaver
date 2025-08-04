// Check if users table exists and its structure
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

async function checkUsersTable() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Checking users table...\n');
    
    try {
        // Try to query the users table
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .limit(1);
        
        if (error) {
            console.error('❌ Error querying users table:', error.message);
            console.log('\nUsers table might not exist. Creating it now...');
            
            // Create users table
            const { error: createError } = await supabase.rpc('exec_sql', {
                sql: `
                    CREATE TABLE IF NOT EXISTS users (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        email VARCHAR(255) UNIQUE NOT NULL,
                        password_hash VARCHAR(255) NOT NULL,
                        email_verified BOOLEAN DEFAULT false,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    );
                    
                    -- Add user_id column to child_profiles if it doesn't exist
                    ALTER TABLE child_profiles 
                    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
                    
                    -- Create index on user_id
                    CREATE INDEX IF NOT EXISTS idx_child_profiles_user_id ON child_profiles(user_id);
                `
            });
            
            if (createError) {
                console.error('❌ Failed to create users table:', createError);
            } else {
                console.log('✅ Users table created successfully!');
            }
        } else {
            console.log('✅ Users table exists!');
            
            // Check if child_profiles has user_id column
            const { data: columns, error: columnsError } = await supabase.rpc('exec_sql', {
                sql: `
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'child_profiles' 
                    AND column_name = 'user_id';
                `
            });
            
            if (!columns || columns.length === 0) {
                console.log('\n⚠️  child_profiles table missing user_id column. Adding it...');
                
                const { error: alterError } = await supabase.rpc('exec_sql', {
                    sql: `
                        ALTER TABLE child_profiles 
                        ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
                        
                        CREATE INDEX IF NOT EXISTS idx_child_profiles_user_id ON child_profiles(user_id);
                    `
                });
                
                if (alterError) {
                    console.error('❌ Failed to add user_id column:', alterError);
                } else {
                    console.log('✅ Added user_id column to child_profiles!');
                }
            } else {
                console.log('✅ child_profiles table has user_id column');
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkUsersTable();