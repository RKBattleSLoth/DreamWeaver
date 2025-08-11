// Story-Illustration Linking Service
// Manages the relationships between stories and their illustrations

import * as db from './db.js';
import type { StoryIllustrationLink } from '../../shared/types/index.js';

export interface LinkIllustrationToStoryRequest {
  storyId: string;
  illustrationId: string;
  position: number;
  caption?: string;
  context?: string;
  isCoverImage?: boolean;
  layoutPreferences?: {
    alignment?: 'left' | 'center' | 'right';
    size?: 'small' | 'medium' | 'large' | 'full';
    padding?: string;
  };
}

export class StoryIllustrationLinkingService {
  
  /**
   * Link an illustration to a story
   */
  async linkIllustrationToStory({
    storyId,
    illustrationId,
    position,
    caption,
    context,
    isCoverImage = false,
    layoutPreferences
  }: LinkIllustrationToStoryRequest): Promise<StoryIllustrationLink> {
    console.log('Linking illustration to story:', {
      storyId,
      illustrationId,
      position,
      isCoverImage
    });

    // Verify story exists and user owns it
    const story = await db.getStoryById(storyId);
    if (!story) {
      throw new Error('Story not found');
    }

    // Verify illustration exists and user owns it
    const illustration = await db.getIllustrationById(illustrationId);
    if (!illustration) {
      throw new Error('Illustration not found');
    }

    // If this is a cover image, ensure no other cover exists
    if (isCoverImage) {
      await db.query(
        'UPDATE story_illustration_links SET is_cover_image = false WHERE story_id = $1',
        [storyId]
      );
    }

    // Create the link
    const result = await db.query<StoryIllustrationLink>(
      `INSERT INTO story_illustration_links 
       (story_id, illustration_id, position, caption, context, is_cover_image, layout_preferences)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (story_id, illustration_id) 
       DO UPDATE SET 
         position = EXCLUDED.position,
         caption = EXCLUDED.caption,
         context = EXCLUDED.context,
         is_cover_image = EXCLUDED.is_cover_image,
         layout_preferences = EXCLUDED.layout_preferences
       RETURNING *`,
      [storyId, illustrationId, position, caption, context, isCoverImage, JSON.stringify(layoutPreferences)]
    );

    return result.rows[0];
  }

  /**
   * Get all illustrations for a story in order
   */
  async getStoryIllustrations(storyId: string, userId: string): Promise<Array<{
    link: StoryIllustrationLink;
    illustration: any;
  }>> {
    // Verify user owns the story
    const story = await db.getStoryById(storyId, userId);
    if (!story) {
      throw new Error('Story not found');
    }

    const result = await db.query(
      `SELECT 
        sil.*,
        i.id as illustration_id,
        i.title as illustration_title,
        i.description as illustration_description,
        i.image_path,
        i.art_style,
        i.is_canonical,
        i.created_at as illustration_created_at
       FROM story_illustration_links sil
       JOIN illustrations i ON sil.illustration_id = i.id
       WHERE sil.story_id = $1
       ORDER BY sil.position`,
      [storyId]
    );

    return result.rows.map(row => ({
      link: {
        id: row.id,
        story_id: row.story_id,
        illustration_id: row.illustration_id,
        position: row.position,
        caption: row.caption,
        context: row.context,
        is_cover_image: row.is_cover_image,
        layout_preferences: row.layout_preferences,
        created_at: row.created_at
      },
      illustration: {
        id: row.illustration_id,
        title: row.illustration_title,
        description: row.illustration_description,
        image_path: row.image_path,
        art_style: row.art_style,
        is_canonical: row.is_canonical,
        created_at: row.illustration_created_at
      }
    }));
  }

  /**
   * Update the position of illustrations in a story
   */
  async reorderStoryIllustrations(
    storyId: string,
    userId: string,
    illustrationOrder: Array<{ illustrationId: string; position: number }>
  ): Promise<void> {
    // Verify user owns the story
    const story = await db.getStoryById(storyId, userId);
    if (!story) {
      throw new Error('Story not found');
    }

    // Update positions in a transaction
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      
      for (const item of illustrationOrder) {
        await client.query(
          'UPDATE story_illustration_links SET position = $1 WHERE story_id = $2 AND illustration_id = $3',
          [item.position, storyId, item.illustrationId]
        );
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Remove an illustration from a story
   */
  async unlinkIllustrationFromStory(
    storyId: string,
    illustrationId: string,
    userId: string
  ): Promise<void> {
    // Verify user owns the story
    const story = await db.getStoryById(storyId, userId);
    if (!story) {
      throw new Error('Story not found');
    }

    await db.query(
      'DELETE FROM story_illustration_links WHERE story_id = $1 AND illustration_id = $2',
      [storyId, illustrationId]
    );
  }

  /**
   * Get cover illustration for a story
   */
  async getStoryCoverIllustration(storyId: string): Promise<any | null> {
    const result = await db.query(
      `SELECT i.*
       FROM illustrations i
       JOIN story_illustration_links sil ON i.id = sil.illustration_id
       WHERE sil.story_id = $1 AND sil.is_cover_image = true
       LIMIT 1`,
      [storyId]
    );

    return result.rows[0] || null;
  }

  /**
   * Get stories that use a specific illustration
   */
  async getStoriesUsingIllustration(illustrationId: string, userId: string): Promise<Array<{
    story: any;
    link: StoryIllustrationLink;
  }>> {
    const result = await db.query(
      `SELECT 
        s.*,
        sil.position,
        sil.caption,
        sil.context,
        sil.is_cover_image,
        sil.layout_preferences,
        sil.created_at as link_created_at
       FROM stories s
       JOIN story_illustration_links sil ON s.id = sil.story_id
       WHERE sil.illustration_id = $1 AND s.user_id = $2
       ORDER BY s.created_at DESC`,
      [illustrationId, userId]
    );

    return result.rows.map(row => ({
      story: {
        id: row.id,
        title: row.title,
        content: row.content,
        theme: row.theme,
        word_count: row.word_count,
        created_at: row.created_at
      },
      link: {
        id: row.id,
        story_id: row.id,
        illustration_id: illustrationId,
        position: row.position,
        caption: row.caption,
        context: row.context,
        is_cover_image: row.is_cover_image,
        layout_preferences: row.layout_preferences,
        created_at: row.link_created_at
      }
    }));
  }
}

// Export singleton instance
export const storyIllustrationLinking = new StoryIllustrationLinkingService();