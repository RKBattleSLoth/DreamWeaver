// Collaborative Illustration Generation Service
// Handles the iterative 4-image generation workflow

import { generateImageVariations, generateImageWithDALLE3 } from './openrouter.js';
import { fileStorage, StorageBuckets } from './file-storage.js';
import * as db from './db.js';
import type { 
  ChildProfile, 
  Story, 
  Illustration, 
  IllustrationSession 
} from '../../shared/types/index.js';
import crypto from 'crypto';

export interface IllustrationGenerationRequest {
  userId: string;
  storyId?: string;
  childProfile: ChildProfile;
  scenePrompt: string;
  sceneType: 'character' | 'scene' | 'object' | 'setting';
  illustrationStyle?: string;
}

export interface VariationSetRequest {
  sessionId: string;
  userId: string;
  round: number;
  basePrompt: string;
  favoriteIllustrationId?: string; // For iterations after round 1
  illustrationStyle?: string;
}

// Style-specific modifiers for consistent illustration generation
const ILLUSTRATION_STYLE_MODIFIERS = {
  watercolor: 'Soft watercolor painting with gentle brushstrokes, dreamy and flowing colors, peaceful atmosphere',
  cartoon: 'Cheerful cartoon illustration with bold outlines, vibrant colors, and expressive characters',
  sketch: 'Detailed pencil sketch with careful shading, artistic linework, and dynamic composition',
  digital_art: 'Clean digital illustration with modern styling, rich colors, and magical details',
  oil_painting: 'Beautiful oil painting with rich textures, classical artistic style, and warm lighting',
  storybook: 'Classic storybook illustration with warm colors, detailed backgrounds, and enchanting atmosphere',
  disney: 'Disney-style animation with expressive characters, vibrant colors, and magical storytelling',
  realistic: 'Realistic illustration with natural lighting, detailed textures, and lifelike proportions',
  anime: 'Anime-style illustration with expressive eyes, dynamic poses, and colorful details'
} as const;

// Variation templates for generating different perspectives/compositions in the SAME style
const VARIATION_TEMPLATES = {
  round1: [
    {
      perspective: 'wide_shot',
      mood: 'establishing',
      modifier: 'Wide establishing shot showing the full scene and environment'
    },
    {
      perspective: 'medium_shot',
      mood: 'balanced',
      modifier: 'Medium shot with balanced composition focusing on main subjects'
    },
    {
      perspective: 'close_up',
      mood: 'intimate',
      modifier: 'Close-up view highlighting emotions and important details'
    },
    {
      perspective: 'dynamic',
      mood: 'action',
      modifier: 'Dynamic angle with movement and energy in the composition'
    }
  ],
  
  iteration: [
    {
      perspective: 'alternate_angle',
      mood: 'enhanced',
      modifier: 'Enhanced version from a different angle with refined details and improved composition'
    },
    {
      perspective: 'different_lighting',
      mood: 'atmospheric',
      modifier: 'Same concept with different lighting and atmospheric mood for fresh interpretation'
    },
    {
      perspective: 'added_details',
      mood: 'enriched',
      modifier: 'Additional story elements and background details to create deeper narrative context'
    }
  ]
};

export class IllustrationGenerationService {
  
  /**
   * Start a new illustration session from a story
   */
  async startIllustrationSession(request: IllustrationGenerationRequest): Promise<{
    sessionId: string;
    variations: Illustration[];
  }> {
    console.log('Starting new illustration session:', {
      userId: request.userId,
      storyId: request.storyId,
      sceneType: request.sceneType,
      childName: request.childProfile.name
    });

    // Create session record
    const sessionId = crypto.randomUUID();
    
    // Build base prompt from story context and child profile
    const basePrompt = this.buildBasePrompt(request);
    
    // Determine the illustration style to use
    const illustrationStyle = request.illustrationStyle || request.childProfile.preferred_art_style || 'storybook';
    
    // Generate initial 4 variations
    const variations = await this.generateVariationSet({
      sessionId,
      userId: request.userId,
      round: 1,
      basePrompt,
      illustrationStyle
    });

    console.log(`Generated ${variations.length} initial variations for session ${sessionId}`);
    return { sessionId, variations };
  }

  /**
   * Generate a set of variations (4 for round 1, or 3 + favorite for iterations)
   * All variations use the same illustration style but different perspectives/compositions
   */
  async generateVariationSet({
    sessionId,
    userId,
    round,
    basePrompt,
    favoriteIllustrationId,
    illustrationStyle
  }: VariationSetRequest): Promise<Illustration[]> {
    const batchId = crypto.randomUUID();
    
    let variationTemplates;
    let includesFavorite = false;

    // Determine the style to use - default to storybook if not provided
    const selectedStyle = illustrationStyle || 'storybook';
    const styleModifier = ILLUSTRATION_STYLE_MODIFIERS[selectedStyle as keyof typeof ILLUSTRATION_STYLE_MODIFIERS] 
      || ILLUSTRATION_STYLE_MODIFIERS.storybook;

    if (round === 1) {
      // First round: 4 different perspectives in the SAME style
      variationTemplates = VARIATION_TEMPLATES.round1;
    } else {
      // Iteration rounds: 3 new variations + 1 favorite (all same style)
      variationTemplates = VARIATION_TEMPLATES.iteration;
      includesFavorite = true;
    }

    console.log(`Generating variation set for round ${round}, batch ${batchId}, style: ${selectedStyle}`);

    try {
      // Create variation templates with the consistent style
      const styledVariationTemplates = variationTemplates.map((template, index) => ({
        style: selectedStyle,
        perspective: template.perspective,
        mood: template.mood,
        modifier: `${styleModifier}. ${template.modifier}`
      }));

      // Generate new variations with consistent style
      const generationResults = await generateImageVariations(basePrompt, styledVariationTemplates);
      
      const illustrations: Illustration[] = [];

      // Process each generated image
      for (let i = 0; i < generationResults.length; i++) {
        const result = generationResults[i];
        const template = styledVariationTemplates[i];
        
        console.log(`Processing variation ${i + 1}:`, {
          url: result.url,
          urlType: typeof result.url,
          urlLength: result.url?.length,
          style: selectedStyle,
          perspective: template.perspective
        });
        
        // Download and save image to local storage
        const imageBuffer = await this.downloadImage(result.url);
        const fileName = `session_${sessionId}_r${round}_v${i + 1}_${Date.now()}.png`;
        
        console.log(`Downloaded image buffer for ${fileName}:`, {
          size: imageBuffer.length,
          type: typeof imageBuffer
        });
        
        const uploadResult = await fileStorage.upload(
          StorageBuckets.ILLUSTRATIONS,
          fileName,
          imageBuffer,
          {
            mimeType: 'image/png',
            metadata: {
              sessionId,
              batchId,
              round,
              variation: i + 1,
              originalUrl: result.url,
              prompt: result.prompt,
              revisedPrompt: result.revised_prompt,
              style: selectedStyle,
              perspective: template.perspective
            }
          }
        );
        
        console.log(`Successfully uploaded ${fileName} to storage as ${uploadResult.name}`);

        // Create illustration record with the actual stored filename
        const illustration = await db.createIllustration(userId, {
          session_id: sessionId,
          title: `Variation ${i + 1} - Round ${round}`,
          description: `${selectedStyle} - ${template.perspective}`,
          image_path: uploadResult.name,
          art_style: selectedStyle, // Use consistent style
          generation_prompt: result.prompt,
          dalle_revised_prompt: result.revised_prompt,
          generation_batch_id: batchId,
          iteration_round: round,
          // TODO: Add world-building entity links when we implement entity extraction
          // target_entity_type: request.target_entity_type,
          // depicts_character_id: request.depicts_character_id,
        });

        illustrations.push(illustration);
      }

      // Include favorite from previous round if this is an iteration
      if (includesFavorite && favoriteIllustrationId) {
        const favoriteIllustration = await db.getIllustrationById(favoriteIllustrationId, userId);
        if (favoriteIllustration) {
          illustrations.unshift(favoriteIllustration); // Add at beginning
        }
      }

      console.log(`Successfully generated ${illustrations.length} variations for session ${sessionId}`);
      return illustrations;

    } catch (error: any) {
      console.error('Error generating variation set:', error);
      console.error('Stack trace:', error.stack);
      throw new Error(`Failed to generate illustrations: ${error.message}`);
    }
  }

  /**
   * Select a favorite and either make it canonical or generate more variations
   */
  async selectFavoriteAndAction(
    sessionId: string,
    userId: string,
    selectedId: string,
    action: 'make_canon' | 'iterate',
    currentRound: number
  ): Promise<{
    action: string;
    canonicalIllustration?: Illustration;
    newVariations?: Illustration[];
  }> {
    console.log(`Processing selection: ${action} for illustration ${selectedId} in session ${sessionId}`);

    if (action === 'make_canon') {
      // Mark as canonical and complete session
      const canonicalIllustration = await db.updateIllustration(selectedId, userId, {
        is_canonical: true,
        title: 'Canonical Illustration'
      });

      // Clean up non-canonical variations from this session
      await this.cleanupSessionVariations(sessionId, userId, selectedId);

      return { action: 'make_canon', canonicalIllustration };
    
    } else if (action === 'iterate') {
      // Generate 3 new variations + keep favorite
      const favorite = await db.getIllustrationById(selectedId, userId);
      if (!favorite) {
        throw new Error('Selected favorite illustration not found');
      }

      // Build refined prompt based on favorite's success
      const refinedPrompt = this.buildRefinedPrompt(favorite);
      
      // Use the same style as the favorite illustration
      const illustrationStyle = favorite.art_style;
      
      const newVariations = await this.generateVariationSet({
        sessionId,
        userId,
        round: currentRound + 1,
        basePrompt: refinedPrompt,
        favoriteIllustrationId: selectedId,
        illustrationStyle
      });

      return { action: 'iterate', newVariations };
    }

    throw new Error('Invalid action specified');
  }

  /**
   * Build the base prompt from story context and child profile
   */
  private buildBasePrompt(request: IllustrationGenerationRequest): string {
    const { childProfile, scenePrompt, sceneType } = request;
    
    return `Create a children's book illustration for ${childProfile.name}, age ${childProfile.age}.

Scene: ${scenePrompt}
Type: ${sceneType}

Child's interests: ${childProfile.interests?.join(', ') || 'adventure and imagination'}
Reading level: ${childProfile.reading_level || 'beginner'}

Requirements:
- Age-appropriate for ${childProfile.age} year old
- Safe and positive imagery
- Engaging and imaginative
- Rich in storytelling details
- Professional children's book illustration quality
- Should spark wonder and curiosity`;
  }

  /**
   * Build a refined prompt based on the favorite illustration's successful elements
   */
  private buildRefinedPrompt(favoriteIllustration: Illustration): string {
    // For now, use the original generation prompt as base
    // TODO: Implement proper context tracking when we build the full world-building system
    const basePrompt = favoriteIllustration.generation_prompt || 'Children\'s book illustration';
    
    return `${basePrompt}

Building on successful elements from the previous favorite illustration:
- Art style that worked well: ${favoriteIllustration.art_style}
- Continue with similar composition and mood

Create variations that maintain these successful core elements while exploring:
- Different lighting and atmosphere  
- Alternative compositions and angles
- Enhanced storytelling details
- Varied character expressions or poses

High quality children's book illustration, safe for all ages, whimsical and engaging.`;
  }

  /**
   * Download image from URL and return as buffer
   */
  private async downloadImage(imageUrl: string): Promise<Buffer> {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error: any) {
      console.error('Error downloading image:', error);
      throw new Error(`Failed to download image: ${error.message}`);
    }
  }

  /**
   * Clean up non-canonical variations from a completed session
   */
  private async cleanupSessionVariations(
    sessionId: string, 
    userId: string, 
    keepIllustrationId: string
  ): Promise<void> {
    try {
      // Get all illustrations from this session
      const allIllustrations = await db.getIllustrationsByUserId(userId);
      const sessionIllustrations = allIllustrations.filter(
        ill => ill.session_id === sessionId && ill.id !== keepIllustrationId
      );

      // Delete files and database records
      for (const illustration of sessionIllustrations) {
        if (illustration.image_path) {
          await fileStorage.delete(StorageBuckets.ILLUSTRATIONS, illustration.image_path);
        }
        await db.deleteIllustration(illustration.id, userId);
      }

      console.log(`Cleaned up ${sessionIllustrations.length} variations from session ${sessionId}`);
    } catch (error) {
      console.error('Error cleaning up session variations:', error);
      // Don't throw - cleanup is non-critical
    }
  }

  /**
   * Get session history and progress
   */
  async getSessionHistory(sessionId: string, userId: string): Promise<{
    rounds: Array<{
      round: number;
      variations: Illustration[];
      selectedFavorite?: Illustration;
    }>;
  }> {
    const allIllustrations = await db.getIllustrationsByUserId(userId);
    const sessionIllustrations = allIllustrations.filter(
      ill => ill.session_id === sessionId
    );

    // Group by round
    const rounds: { [key: number]: Illustration[] } = {};
    sessionIllustrations.forEach(ill => {
      const round = ill.iteration_round || 1;
      if (!rounds[round]) rounds[round] = [];
      rounds[round].push(ill);
    });

    return {
      rounds: Object.entries(rounds).map(([round, variations]) => ({
        round: parseInt(round),
        variations,
        selectedFavorite: variations.find(v => v.is_canonical)
      }))
    };
  }
}

// Export singleton instance
export const illustrationGenerator = new IllustrationGenerationService();