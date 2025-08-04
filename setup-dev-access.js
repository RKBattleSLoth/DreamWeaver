// Quick development setup to create a child profile for testing
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

async function setupDevAccess() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase configuration');
        process.exit(1);
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔄 Setting up development access...');
    
    try {
        // Check if we already have a child profile
        const { data: existingProfiles, error: fetchError } = await supabase
            .from('child_profiles')
            .select('*')
            .limit(1);
        
        if (fetchError) {
            console.error('❌ Error checking existing profiles:', fetchError);
            return;
        }
        
        if (existingProfiles && existingProfiles.length > 0) {
            console.log('✅ Child profile already exists:', existingProfiles[0].name);
            return;
        }
        
        // Create a development child profile
        const { data, error } = await supabase
            .from('child_profiles')
            .insert({
                name: 'Demo Child',
                age: 6,
                grade: '1st',
                reading_level: 'beginner',
                content_safety: 'strict',
                illustration_style: 'watercolor',
                interests: ['animals', 'adventure'],
                favorite_themes: ['friendship', 'nature'],
                is_active: true
            })
            .select()
            .single();
        
        if (error) {
            console.error('❌ Error creating child profile:', error);
        } else {
            console.log('✅ Created development child profile:', data.name);
            console.log('🎉 You can now access the application at http://localhost:3002');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

setupDevAccess();