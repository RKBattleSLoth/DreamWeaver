import { createClient } from '@supabase/supabase-js';

// Debug environment variables
console.log('Supabase service environment check:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL || 'MISSING');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Found' : 'MISSING');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL environment variable is required');
}

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
}

// Server-side client with service role key (bypasses RLS for admin operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Client-side client with anon key (respects RLS)
export const supabaseClient = createClient(
  supabaseUrl, 
  process.env.SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Helper to get authenticated user from request
export async function getAuthenticatedUser(authHeader: string | undefined) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    // Validate token by calling Supabase auth API directly
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': process.env.SUPABASE_ANON_KEY!
      }
    });
    
    if (!response.ok) {
      return null;
    }
    
    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Error verifying user token:', error);
    return null;
  }
}

// Helper to get Supabase client with user context
export function getSupabaseWithAuth(token: string) {
  return createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY!, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
}

// For server operations that need to respect RLS with a specific user
export function getSupabaseForUser(userId: string) {
  // When using service role key, we bypass RLS entirely
  // So we'll use the admin client but be careful to filter by user_id
  return supabaseAdmin;
}