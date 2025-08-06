import pg from 'pg';
import { User, ChildProfile, Story, Illustration, StoryIllustration } from '../../shared/types/index.js';

const { Pool } = pg;

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Helper function to handle database queries
async function query<T>(text: string, params?: any[]): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } finally {
    client.release();
  }
}

// Helper function for single row queries
async function queryOne<T>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows.length > 0 ? rows[0] : null;
}

// User operations
export async function createUser(email: string, passwordHash: string): Promise<User> {
  const text = `
    INSERT INTO users (email, password_hash)
    VALUES ($1, $2)
    RETURNING *
  `;
  const result = await queryOne<User>(text, [email, passwordHash]);
  if (!result) throw new Error('Failed to create user');
  return result;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const text = 'SELECT * FROM users WHERE email = $1';
  return queryOne<User>(text, [email]);
}

export async function getUserById(id: string): Promise<User | null> {
  const text = 'SELECT * FROM users WHERE id = $1';
  return queryOne<User>(text, [id]);
}

// Child profile operations
export async function getChildProfilesByUserId(userId: string): Promise<ChildProfile[]> {
  const text = `
    SELECT * FROM child_profiles 
    WHERE user_id = $1 
    ORDER BY created_at DESC
  `;
  return query<ChildProfile>(text, [userId]);
}

export async function createChildProfile(
  userId: string,
  profileData: Omit<ChildProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<ChildProfile> {
  const text = `
    INSERT INTO child_profiles (
      user_id, name, age, grade, reading_level, 
      interests, favorite_themes, content_safety, 
      preferred_art_style, is_active
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;
  const params = [
    userId,
    profileData.name,
    profileData.age,
    profileData.grade,
    profileData.reading_level,
    profileData.interests,
    profileData.favorite_themes,
    profileData.content_safety,
    profileData.preferred_art_style,
    profileData.is_active || false
  ];
  const result = await queryOne<ChildProfile>(text, params);
  if (!result) throw new Error('Failed to create child profile');
  return result;
}

export async function updateChildProfile(
  id: string,
  userId: string,
  updates: Partial<Omit<ChildProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<ChildProfile> {
  const fields = [];
  const params = [];
  let paramCount = 1;

  // Build dynamic update query
  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      fields.push(`${key} = $${paramCount}`);
      params.push(value);
      paramCount++;
    }
  });

  params.push(id, userId);
  const text = `
    UPDATE child_profiles 
    SET ${fields.join(', ')}, updated_at = NOW()
    WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
    RETURNING *
  `;

  const result = await queryOne<ChildProfile>(text, params);
  if (!result) throw new Error('Failed to update child profile');
  return result;
}

export async function deleteChildProfile(id: string, userId: string): Promise<void> {
  const text = 'DELETE FROM child_profiles WHERE id = $1 AND user_id = $2';
  await query(text, [id, userId]);
}

export async function setActiveChildProfile(id: string, userId: string): Promise<ChildProfile> {
  // Transaction to deactivate all and activate one
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Deactivate all profiles for this user
    await client.query(
      'UPDATE child_profiles SET is_active = false WHERE user_id = $1',
      [userId]
    );
    
    // Activate the selected profile
    const result = await client.query(
      'UPDATE child_profiles SET is_active = true WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    
    await client.query('COMMIT');
    
    if (result.rows.length === 0) {
      throw new Error('Profile not found');
    }
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getActiveChildProfile(userId: string): Promise<ChildProfile | null> {
  const text = 'SELECT * FROM child_profiles WHERE user_id = $1 AND is_active = true';
  return queryOne<ChildProfile>(text, [userId]);
}

// Story operations
export async function getStoriesByUserId(userId: string): Promise<Story[]> {
  const text = `
    SELECT * FROM stories 
    WHERE user_id = $1 
    ORDER BY created_at DESC
  `;
  return query<Story>(text, [userId]);
}

export async function createStory(
  userId: string,
  storyData: Omit<Story, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Story> {
  const text = `
    INSERT INTO stories (
      user_id, child_profile_id, title, content, theme, 
      reading_level, word_count, generation_prompt, is_favorite
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;
  const params = [
    userId,
    storyData.child_profile_id,
    storyData.title,
    storyData.content,
    storyData.theme,
    storyData.reading_level,
    storyData.word_count,
    storyData.generation_prompt,
    storyData.is_favorite || false
  ];
  const result = await queryOne<Story>(text, params);
  if (!result) throw new Error('Failed to create story');
  return result;
}

export async function getStoryById(id: string, userId: string): Promise<Story | null> {
  const text = 'SELECT * FROM stories WHERE id = $1 AND user_id = $2';
  return queryOne<Story>(text, [id, userId]);
}

export async function updateStory(
  id: string,
  userId: string,
  updates: Partial<Omit<Story, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<Story> {
  const fields = [];
  const params = [];
  let paramCount = 1;

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      fields.push(`${key} = $${paramCount}`);
      params.push(value);
      paramCount++;
    }
  });

  params.push(id, userId);
  const text = `
    UPDATE stories 
    SET ${fields.join(', ')}, updated_at = NOW()
    WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
    RETURNING *
  `;

  const result = await queryOne<Story>(text, params);
  if (!result) throw new Error('Failed to update story');
  return result;
}

export async function deleteStory(id: string, userId: string): Promise<void> {
  const text = 'DELETE FROM stories WHERE id = $1 AND user_id = $2';
  await query(text, [id, userId]);
}

// Illustration operations
export async function getIllustrationsByUserId(userId: string): Promise<Illustration[]> {
  const text = `
    SELECT * FROM illustrations 
    WHERE user_id = $1 
    ORDER BY created_at DESC
  `;
  return query<Illustration>(text, [userId]);
}

export async function createIllustration(
  userId: string,
  illustrationData: Omit<Illustration, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Illustration> {
  const text = `
    INSERT INTO illustrations (
      user_id, title, description, file_path, storage_type,
      public_url, art_style, generation_prompt, width, height,
      file_size, mime_type, tags
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *
  `;
  const params = [
    userId,
    illustrationData.title,
    illustrationData.description,
    illustrationData.file_path || illustrationData.image_path, // Handle both field names
    'local', // Default to local storage for now
    illustrationData.public_url || illustrationData.image_url, // Handle both field names
    illustrationData.art_style,
    illustrationData.generation_prompt,
    illustrationData.width,
    illustrationData.height,
    illustrationData.file_size,
    'image/png', // Default mime type
    illustrationData.tags
  ];
  const result = await queryOne<Illustration>(text, params);
  if (!result) throw new Error('Failed to create illustration');
  return result;
}

export async function getIllustrationById(id: string, userId: string): Promise<Illustration | null> {
  const text = 'SELECT * FROM illustrations WHERE id = $1 AND user_id = $2';
  return queryOne<Illustration>(text, [id, userId]);
}

export async function updateIllustration(
  id: string,
  userId: string,
  updates: Partial<Omit<Illustration, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<Illustration> {
  const fields = [];
  const params = [];
  let paramCount = 1;

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      fields.push(`${key} = $${paramCount}`);
      params.push(value);
      paramCount++;
    }
  });

  params.push(id, userId);
  const text = `
    UPDATE illustrations 
    SET ${fields.join(', ')}, updated_at = NOW()
    WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
    RETURNING *
  `;

  const result = await queryOne<Illustration>(text, params);
  if (!result) throw new Error('Failed to update illustration');
  return result;
}

export async function deleteIllustration(id: string, userId: string): Promise<void> {
  const text = 'DELETE FROM illustrations WHERE id = $1 AND user_id = $2';
  await query(text, [id, userId]);
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

  const text = `
    INSERT INTO story_illustrations (story_id, illustration_id, position)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const result = await queryOne<StoryIllustration>(text, [storyId, illustrationId, position]);
  if (!result) throw new Error('Failed to link illustration to story');
  return result;
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

  const text = 'DELETE FROM story_illustrations WHERE story_id = $1 AND illustration_id = $2';
  await query(text, [storyId, illustrationId]);
}

export async function getStoryIllustrations(
  storyId: string,
  userId: string
): Promise<(StoryIllustration & { illustration: Illustration })[]> {
  // Verify user owns the story
  const story = await getStoryById(storyId, userId);
  if (!story) {
    throw new Error('Story not found');
  }

  const text = `
    SELECT 
      si.*,
      i.*
    FROM story_illustrations si
    JOIN illustrations i ON si.illustration_id = i.id
    WHERE si.story_id = $1
    ORDER BY si.position ASC
  `;
  
  const rows = await query<any>(text, [storyId]);
  
  // Transform the flat result into nested structure
  return rows.map(row => ({
    id: row.id,
    story_id: row.story_id,
    illustration_id: row.illustration_id,
    position: row.position,
    created_at: row.created_at,
    illustration: {
      id: row.illustration_id,
      user_id: row.user_id,
      title: row.title,
      description: row.description,
      image_url: row.public_url || row.file_path,
      image_path: row.file_path,
      art_style: row.art_style,
      generation_prompt: row.generation_prompt,
      width: row.width,
      height: row.height,
      file_size: row.file_size,
      tags: row.tags,
      created_at: row.created_at,
      updated_at: row.updated_at
    }
  }));
}

// Health check for database connection
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Close pool on shutdown
export async function closeDatabaseConnection(): Promise<void> {
  await pool.end();
}