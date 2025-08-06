import * as db from './db.js';
import type { Story, StoryWithIllustrations } from '../../shared/types/index.js';

export async function getStoriesByUserId(userId: string): Promise<Story[]> {
  try {
    return await db.getStoriesByUserId(userId);
  } catch (error) {
    console.error('Error fetching stories:', error);
    throw new Error('Failed to fetch stories');
  }
}

export async function createStory(
  userId: string,
  storyData: Omit<Story, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
  authToken?: string
): Promise<Story> {
  try {
    // Clean up the data - remove undefined values
    const cleanData = Object.entries(storyData).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    return await db.createStory(userId, cleanData);
  } catch (error) {
    console.error('Error creating story:', error);
    throw new Error('Failed to create story');
  }
}

export async function getStoryById(
  id: string,
  userId: string,
  authToken?: string
): Promise<Story | null> {
  try {
    return await db.getStoryById(id, userId);
  } catch (error) {
    console.error('Error fetching story:', error);
    throw new Error('Failed to fetch story');
  }
}

export async function getStoryWithIllustrations(
  id: string,
  userId: string,
  authToken?: string
): Promise<StoryWithIllustrations | null> {
  try {
    const [story, illustrations] = await Promise.all([
      db.getStoryById(id, userId),
      db.getStoryIllustrations(id, userId)
    ]);

    if (!story) {
      return null;
    }

    return {
      ...story,
      illustrations: illustrations.map(si => si.illustration)
    };
  } catch (error) {
    console.error('Error fetching story with illustrations:', error);
    throw new Error('Failed to fetch story with illustrations');
  }
}

export async function updateStory(
  id: string,
  userId: string,
  updates: Partial<Omit<Story, 'id' | 'user_id' | 'created_at' | 'updated_at'>>,
  authToken?: string
): Promise<Story> {
  try {
    // Clean up the data - remove undefined values
    const cleanUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    return await db.updateStory(id, userId, cleanUpdates);
  } catch (error) {
    console.error('Error updating story:', error);
    throw new Error('Failed to update story');
  }
}

export async function deleteStory(
  id: string,
  userId: string,
  authToken?: string
): Promise<void> {
  try {
    await db.deleteStory(id, userId);
  } catch (error) {
    console.error('Error deleting story:', error);
    throw new Error('Failed to delete story');
  }
}

export async function linkIllustrationToStory(
  storyId: string,
  illustrationId: string,
  position: number,
  userId: string,
  authToken?: string
): Promise<void> {
  try {
    await db.linkIllustrationToStory(storyId, illustrationId, position, userId);
  } catch (error) {
    console.error('Error linking illustration to story:', error);
    throw new Error('Failed to link illustration to story');
  }
}

export async function unlinkIllustrationFromStory(
  storyId: string,
  illustrationId: string,
  userId: string,
  authToken?: string
): Promise<void> {
  try {
    await db.unlinkIllustrationFromStory(storyId, illustrationId, userId);
  } catch (error) {
    console.error('Error unlinking illustration from story:', error);
    throw new Error('Failed to unlink illustration from story');
  }
}

export async function getStoryIllustrations(
  storyId: string,
  userId: string,
  authToken?: string
): Promise<any[]> {
  try {
    return await db.getStoryIllustrations(storyId, userId);
  } catch (error) {
    console.error('Error fetching story illustrations:', error);
    throw new Error('Failed to fetch story illustrations');
  }
}