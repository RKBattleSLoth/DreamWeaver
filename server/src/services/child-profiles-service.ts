import * as db from './db.js';
import type { ChildProfile } from '../../shared/types/index.js';

export async function getChildProfilesByUserId(userId: string): Promise<ChildProfile[]> {
  try {
    return await db.getChildProfilesByUserId(userId);
  } catch (error) {
    console.error('Error fetching child profiles:', error);
    throw new Error('Failed to fetch child profiles');
  }
}

export async function getActiveChildProfile(userId: string): Promise<ChildProfile | null> {
  try {
    return await db.getActiveChildProfile(userId);
  } catch (error) {
    console.error('Error fetching active child profile:', error);
    throw new Error('Failed to fetch active child profile');
  }
}

export async function createChildProfile(
  userId: string,
  profileData: Omit<ChildProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
  authToken?: string // Keep for compatibility but not used with direct DB
): Promise<ChildProfile> {
  try {
    // Clean up the data - remove undefined values
    const cleanData = Object.entries(profileData).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    return await db.createChildProfile(userId, cleanData);
  } catch (error) {
    console.error('Error creating child profile:', error);
    throw new Error('Failed to create child profile');
  }
}

export async function updateChildProfile(
  id: string,
  userId: string,
  updates: Partial<Omit<ChildProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>,
  authToken?: string
): Promise<ChildProfile> {
  try {
    // Clean up the data - remove undefined values
    const cleanUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    return await db.updateChildProfile(id, userId, cleanUpdates);
  } catch (error) {
    console.error('Error updating child profile:', error);
    throw new Error('Failed to update child profile');
  }
}

export async function deleteChildProfile(
  id: string,
  userId: string,
  authToken?: string
): Promise<void> {
  try {
    await db.deleteChildProfile(id, userId);
  } catch (error) {
    console.error('Error deleting child profile:', error);
    throw new Error('Failed to delete child profile');
  }
}

export async function setActiveChildProfile(
  id: string,
  userId: string,
  authToken?: string
): Promise<ChildProfile> {
  try {
    return await db.setActiveChildProfile(id, userId);
  } catch (error) {
    console.error('Error setting active child profile:', error);
    throw new Error('Failed to set active child profile');
  }
}