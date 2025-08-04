import { createClient } from '@supabase/supabase-js';
import { User, ChildProfile, Story, Illustration, StoryIllustration } from '../../shared/types/index.js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// User operations
export async function createUser(email: string, passwordHash: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .insert([{ email, password_hash: passwordHash }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return data;
}

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// Child profile operations
export async function getChildProfilesByUserId(userId: string): Promise<ChildProfile[]> {
  const { data, error } = await supabase
    .from('child_profiles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createChildProfile(
  userId: string, 
  profileData: Omit<ChildProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<ChildProfile> {
  const { data, error } = await supabase
    .from('child_profiles')
    .insert([{ ...profileData, user_id: userId }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateChildProfile(
  id: string,
  userId: string,
  updates: Partial<Omit<ChildProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<ChildProfile> {
  const { data, error } = await supabase
    .from('child_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteChildProfile(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('child_profiles')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function setActiveChildProfile(id: string, userId: string): Promise<ChildProfile> {
  // First, deactivate all profiles for this user
  await supabase
    .from('child_profiles')
    .update({ is_active: false })
    .eq('user_id', userId);

  // Then activate the selected profile
  const { data, error } = await supabase
    .from('child_profiles')
    .update({ is_active: true })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getActiveChildProfile(userId: string): Promise<ChildProfile | null> {
  const { data, error } = await supabase
    .from('child_profiles')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// Story operations
export async function getStoriesByUserId(userId: string): Promise<Story[]> {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createStory(
  userId: string,
  storyData: Omit<Story, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Story> {
  const { data, error } = await supabase
    .from('stories')
    .insert([{ ...storyData, user_id: userId }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getStoryById(id: string, userId: string): Promise<Story | null> {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateStory(
  id: string,
  userId: string,
  updates: Partial<Omit<Story, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<Story> {
  const { data, error } = await supabase
    .from('stories')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteStory(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}

// Illustration operations
export async function getIllustrationsByUserId(userId: string): Promise<Illustration[]> {
  const { data, error } = await supabase
    .from('illustrations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createIllustration(
  userId: string,
  illustrationData: Omit<Illustration, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Illustration> {
  const { data, error } = await supabase
    .from('illustrations')
    .insert([{ ...illustrationData, user_id: userId }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getIllustrationById(id: string, userId: string): Promise<Illustration | null> {
  const { data, error } = await supabase
    .from('illustrations')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateIllustration(
  id: string,
  userId: string,
  updates: Partial<Omit<Illustration, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<Illustration> {
  const { data, error } = await supabase
    .from('illustrations')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteIllustration(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('illustrations')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}

// Story-Illustration linking operations
export async function linkIllustrationToStory(
  storyId: string,
  illustrationId: string,
  position: number,
  userId: string
): Promise<StoryIllustration> {
  // Verify user owns both the story and illustration
  const [story, illustration] = await Promise.all([
    getStoryById(storyId, userId),
    getIllustrationById(illustrationId, userId)
  ]);

  if (!story || !illustration) {
    throw new Error('Story or illustration not found');
  }

  const { data, error } = await supabase
    .from('story_illustrations')
    .insert([{ story_id: storyId, illustration_id: illustrationId, position }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function unlinkIllustrationFromStory(
  storyId: string,
  illustrationId: string,
  userId: string
): Promise<void> {
  // Verify user owns the story
  const story = await getStoryById(storyId, userId);
  if (!story) {
    throw new Error('Story not found');
  }

  const { error } = await supabase
    .from('story_illustrations')
    .delete()
    .eq('story_id', storyId)
    .eq('illustration_id', illustrationId);

  if (error) throw error;
}

export async function getStoryIllustrations(storyId: string, userId: string): Promise<(StoryIllustration & { illustration: Illustration })[]> {
  // Verify user owns the story
  const story = await getStoryById(storyId, userId);
  if (!story) {
    throw new Error('Story not found');
  }

  const { data, error } = await supabase
    .from('story_illustrations')
    .select(`
      *,
      illustration:illustrations(*)
    `)
    .eq('story_id', storyId)
    .order('position', { ascending: true });

  if (error) throw error;
  return data || [];
}