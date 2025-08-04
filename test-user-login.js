// Test if we can login with existing user
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

async function testUserLogin() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Testing user login...\n');
    
    try {
        // First, check if users table exists
        const { data: testQuery, error: testError } = await supabase
            .from('users')
            .select('id')
            .limit(1);
        
        if (testError) {
            console.error('❌ Users table not accessible:', testError.message);
            console.log('\nThe users table might not exist. You may need to create it first.');
            return;
        }
        
        // Get list of existing users
        const { data: users, error } = await supabase
            .from('users')
            .select('id, email, created_at')
            .order('created_at', { ascending: false })
            .limit(10);
        
        if (error) {
            console.error('❌ Error fetching users:', error);
        } else if (users && users.length > 0) {
            console.log(`✅ Found ${users.length} existing users:`);
            users.forEach(user => {
                console.log(`  - ${user.email} (created: ${new Date(user.created_at).toLocaleDateString()})`);
            });
            
            console.log('\nYou can login with any of these email addresses.');
            console.log('If you forgot the password, you can create a new account on the register page.');
        } else {
            console.log('ℹ️ No users found in the database.');
            console.log('You need to register a new account first at /register');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testUserLogin();