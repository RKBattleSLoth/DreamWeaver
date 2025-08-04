// Check existing profiles and stories in the database
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

async function checkExistingData() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service key for full access
    
    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase configuration');
        process.exit(1);
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔍 Checking existing data in the database...\n');
    
    try {
        // Check child profiles
        const { data: profiles, error: profileError } = await supabase
            .from('child_profiles')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (profileError) {
            console.error('❌ Error fetching profiles:', profileError);
        } else {
            console.log(`📊 Found ${profiles.length} child profiles:`);
            profiles.forEach(profile => {
                console.log(`  - ${profile.name} (Age: ${profile.age}, ID: ${profile.id})`);
                console.log(`    Created: ${new Date(profile.created_at).toLocaleDateString()}`);
                console.log(`    Active: ${profile.is_active ? 'Yes' : 'No'}`);
            });
        }
        
        console.log('\n');
        
        // Check stories
        const { data: stories, error: storyError } = await supabase
            .from('stories')
            .select('*, child_profiles(name)')
            .order('created_at', { ascending: false });
        
        if (storyError) {
            console.error('❌ Error fetching stories:', storyError);
        } else {
            console.log(`📚 Found ${stories.length} stories:`);
            stories.forEach(story => {
                console.log(`  - "${story.title}"`);
                console.log(`    For: ${story.child_profiles?.name || 'Unknown'}`);
                console.log(`    Theme: ${story.theme}`);
                console.log(`    Created: ${new Date(story.created_at).toLocaleDateString()}`);
                console.log(`    ID: ${story.id}`);
                console.log('');
            });
        }
        
        // Check users table if it exists
        const { data: users, error: userError } = await supabase
            .from('users')
            .select('*')
            .limit(10);
        
        if (!userError && users) {
            console.log(`\n👤 Found ${users.length} users in the system`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkExistingData();