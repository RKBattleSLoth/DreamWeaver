import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validation.js';
import { z } from 'zod';
import { storyIllustrationLinking } from '../services/story-illustration-linking.js';
import { ApiResponse } from '../../shared/types/index.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Validation schemas
const linkIllustrationSchema = z.object({
  story_id: z.string().uuid(),
  illustration_id: z.string().uuid(),
  position: z.number().int().min(1),
  caption: z.string().optional(),
  context: z.string().optional(),
  is_cover_image: z.boolean().default(false),
  layout_preferences: z.object({
    alignment: z.enum(['left', 'center', 'right']).optional(),
    size: z.enum(['small', 'medium', 'large', 'full']).optional(),
    padding: z.string().optional()
  }).optional()
});

const reorderSchema = z.object({
  story_id: z.string().uuid(),
  illustration_order: z.array(z.object({
    illustration_id: z.string().uuid(),
    position: z.number().int().min(1)
  }))
});

const unlinkSchema = z.object({
  story_id: z.string().uuid(),
  illustration_id: z.string().uuid()
});

const uuidSchema = z.object({
  id: z.string().uuid()
});

// Link an illustration to a story
router.post('/link',
  validateBody(linkIllustrationSchema),
  async (req: Request<{}, ApiResponse, z.infer<typeof linkIllustrationSchema>>, res: Response) => {
    try {
      console.log('Linking illustration to story:', {
        userId: req.user!.id,
        body: req.body
      });

      const link = await storyIllustrationLinking.linkIllustrationToStory({
        storyId: req.body.story_id,
        illustrationId: req.body.illustration_id,
        position: req.body.position,
        caption: req.body.caption,
        context: req.body.context,
        isCoverImage: req.body.is_cover_image,
        layoutPreferences: req.body.layout_preferences
      });

      res.status(201).json({
        success: true,
        data: { link }
      });

    } catch (error: any) {
      console.error('Error linking illustration to story:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to link illustration to story' }
      });
    }
  }
);

// Get all illustrations for a story
router.get('/story/:id/illustrations',
  validateParams(uuidSchema),
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const illustrations = await storyIllustrationLinking.getStoryIllustrations(
        req.params.id,
        req.user!.id
      );

      res.json({
        success: true,
        data: {
          story_id: req.params.id,
          illustrations,
          count: illustrations.length
        }
      });

    } catch (error: any) {
      console.error('Error fetching story illustrations:', error);
      
      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: { message: 'Story not found' }
        });
      } else {
        res.status(500).json({
          success: false,
          error: { message: error.message || 'Failed to fetch story illustrations' }
        });
      }
    }
  }
);

// Reorder illustrations in a story
router.put('/reorder',
  validateBody(reorderSchema),
  async (req: Request<{}, ApiResponse, z.infer<typeof reorderSchema>>, res: Response) => {
    try {
      await storyIllustrationLinking.reorderStoryIllustrations(
        req.body.story_id,
        req.user!.id,
        req.body.illustration_order
      );

      res.json({
        success: true,
        data: { message: 'Illustrations reordered successfully' }
      });

    } catch (error: any) {
      console.error('Error reordering illustrations:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to reorder illustrations' }
      });
    }
  }
);

// Unlink an illustration from a story
router.delete('/unlink',
  validateBody(unlinkSchema),
  async (req: Request<{}, ApiResponse, z.infer<typeof unlinkSchema>>, res: Response) => {
    try {
      await storyIllustrationLinking.unlinkIllustrationFromStory(
        req.body.story_id,
        req.body.illustration_id,
        req.user!.id
      );

      res.json({
        success: true,
        data: { message: 'Illustration unlinked successfully' }
      });

    } catch (error: any) {
      console.error('Error unlinking illustration:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to unlink illustration' }
      });
    }
  }
);

// Get cover illustration for a story
router.get('/story/:id/cover',
  validateParams(uuidSchema),
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const coverIllustration = await storyIllustrationLinking.getStoryCoverIllustration(
        req.params.id
      );

      res.json({
        success: true,
        data: {
          story_id: req.params.id,
          cover_illustration: coverIllustration
        }
      });

    } catch (error: any) {
      console.error('Error fetching story cover:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to fetch story cover' }
      });
    }
  }
);

// Get stories that use a specific illustration
router.get('/illustration/:id/stories',
  validateParams(uuidSchema),
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const stories = await storyIllustrationLinking.getStoriesUsingIllustration(
        req.params.id,
        req.user!.id
      );

      res.json({
        success: true,
        data: {
          illustration_id: req.params.id,
          stories,
          count: stories.length
        }
      });

    } catch (error: any) {
      console.error('Error fetching illustration stories:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to fetch illustration stories' }
      });
    }
  }
);

export default router;