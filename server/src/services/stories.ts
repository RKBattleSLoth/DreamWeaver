import { supabaseAdmin, getSupabaseWithAuth } from './supabase.js';
import { generateStoryWithOpenRouter } from './openrouter.js';
import type { Story, ChildProfile, GenerateStoryRequest } from '../../shared/types/index.js';

export async function getStoriesByUserId(userId: string): Promise<Story[]> {
  const { data, error } = await supabaseAdmin
    .from('stories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching stories:', error);
    throw new Error('Failed to fetch stories');
  }

  return data || [];
}

export async function getStoryById(id: string, userId: string): Promise<Story | null> {
  const { data, error } = await supabaseAdmin
    .from('stories')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching story:', error);
    throw new Error('Failed to fetch story');
  }

  return data;
}

export async function generateAndSaveStory(
  userId: string,
  childProfile: ChildProfile | null,
  params: GenerateStoryRequest,
  authToken: string
): Promise<Story> {
  // If no child profile specified but we have an active one, use it
  if (!childProfile && params.child_profile_id) {
    const { data } = await supabaseAdmin
      .from('child_profiles')
      .select('*')
      .eq('id', params.child_profile_id)
      .eq('user_id', userId)
      .single();
    
    childProfile = data;
  }

  // If still no profile, create a default one
  if (!childProfile) {
    childProfile = {
      id: '',
      user_id: userId,
      name: 'Little One',
      is_active: false,
      content_safety: 'strict',
      preferred_art_style: 'watercolor',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  // Generate the story using OpenRouter
  const { title, content, prompt } = await generateStoryWithOpenRouter({
    childProfile,
    theme: params.theme,
    customPrompt: params.custom_prompt,
    storyLength: params.story_length,
    readingLevel: params.reading_level
  });

  // Calculate word count
  const wordCount = content.split(/\s+/).length;

  // Save the story to database using authenticated client
  const supabase = getSupabaseWithAuth(authToken);
  
  const storyData = {
    user_id: userId,
    child_profile_id: childProfile.id || params.child_profile_id,
    title,
    content,
    theme: params.theme,
    reading_level: params.reading_level || childProfile.reading_level,
    word_count: wordCount,
    generation_prompt: prompt,
    is_favorite: false
  };

  const { data, error } = await supabase
    .from('stories')
    .insert([storyData])
    .select()
    .single();

  if (error) {
    console.error('Error saving story:', error);
    throw new Error('Failed to save story');
  }

  return data;
}

export async function createStory(
  userId: string,
  storyData: Omit<Story, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
  authToken: string
): Promise<Story> {
  // Calculate word count if not provided
  if (!storyData.word_count) {
    storyData.word_count = storyData.content.split(/\s+/).length;
  }

  const supabase = getSupabaseWithAuth(authToken);
  
  const { data, error } = await supabase
    .from('stories')
    .insert([{ ...storyData, user_id: userId }])
    .select()
    .single();

  if (error) {
    console.error('Error creating story:', error);
    throw new Error('Failed to create story');
  }

  return data;
}

export async function updateStory(
  id: string,
  userId: string,
  updates: Partial<Omit<Story, 'id' | 'user_id' | 'created_at' | 'updated_at'>>,
  authToken: string
): Promise<Story> {
  // Recalculate word count if content is updated
  if (updates.content) {
    updates.word_count = updates.content.split(/\s+/).length;
  }

  const supabase = getSupabaseWithAuth(authToken);
  
  const { data, error } = await supabase
    .from('stories')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating story:', error);
    throw new Error('Failed to update story');
  }

  return data;
}

export async function deleteStory(id: string, userId: string, authToken: string): Promise<void> {
  const supabase = getSupabaseWithAuth(authToken);
  
  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting story:', error);
    throw new Error('Failed to delete story');
  }
}

export async function toggleFavoriteStory(
  id: string,
  userId: string,
  authToken: string
): Promise<Story> {
  // First get the current favorite status
  const story = await getStoryById(id, userId);
  if (!story) {
    throw new Error('Story not found');
  }

  // Toggle the favorite status
  return updateStory(id, userId, { is_favorite: !story.is_favorite }, authToken);
}