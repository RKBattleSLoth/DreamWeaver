import { supabaseAdmin, getSupabaseWithAuth } from './supabase.js';
import type { ChildProfile } from '../../shared/types/index.js';

export async function getChildProfilesByUserId(userId: string): Promise<ChildProfile[]> {
  const { data, error } = await supabaseAdmin
    .from('child_profiles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching child profiles:', error);
    throw new Error('Failed to fetch child profiles');
  }

  return data || [];
}

export async function getActiveChildProfile(userId: string): Promise<ChildProfile | null> {
  const { data, error } = await supabaseAdmin
    .from('child_profiles')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    console.error('Error fetching active child profile:', error);
    throw new Error('Failed to fetch active child profile');
  }

  return data;
}

export async function createChildProfile(
  userId: string,
  profileData: Omit<ChildProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
  authToken: string
): Promise<ChildProfile> {
  // Clean up the data - remove undefined values
  const cleanData = Object.entries(profileData).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as any);

  // Use authenticated client to respect RLS
  const supabase = getSupabaseWithAuth(authToken);
  
  const { data, error } = await supabase
    .from('child_profiles')
    .insert([{ ...cleanData, user_id: userId }])
    .select()
    .single();

  if (error) {
    console.error('Error creating child profile:', error);
    throw new Error('Failed to create child profile');
  }

  return data;
}

export async function updateChildProfile(
  id: string,
  userId: string,
  updates: Partial<Omit<ChildProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<ChildProfile> {
  const { data, error } = await supabaseAdmin
    .from('child_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating child profile:', error);
    throw new Error('Failed to update child profile');
  }

  return data;
}

export async function deleteChildProfile(id: string, userId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('child_profiles')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting child profile:', error);
    throw new Error('Failed to delete child profile');
  }
}

export async function setActiveChildProfile(id: string, userId: string): Promise<ChildProfile> {
  // Start a transaction to ensure atomicity
  const { error: deactivateError } = await supabaseAdmin
    .from('child_profiles')
    .update({ is_active: false })
    .eq('user_id', userId);

  if (deactivateError) {
    console.error('Error deactivating profiles:', deactivateError);
    throw new Error('Failed to deactivate existing profiles');
  }

  // Activate the selected profile
  const { data, error } = await supabaseAdmin
    .from('child_profiles')
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error activating child profile:', error);
    throw new Error('Failed to activate child profile');
  }

  return data;
}