import { Router, Request, Response } from 'express';
import { authenticateSupabaseUser } from '../middleware/supabase-auth.js';
import { validateBody, validateParams, storySchemas, paramSchemas } from '../middleware/validation.js';
import {
  getStoriesByUserId,
  getStoryById,
  generateAndSaveStory,
  createStory,
  updateStory,
  deleteStory,
  toggleFavoriteStory
} from '../services/stories.js';
import { getActiveChildProfile } from '../services/child-profiles.js';
import { 
  GenerateStoryRequest, 
  CreateStoryRequest,
  UpdateStoryRequest,
  ApiResponse 
} from '../../shared/types/index.js';

const router = Router();

// All routes require authentication
router.use(authenticateSupabaseUser);

// Get all stories for current user
router.get('/', async (req: Request, res: Response) => {
  try {
    const stories = await getStoriesByUserId(req.user!.id);
    
    res.json({
      success: true,
      data: stories
    });
  } catch (error: any) {
    console.error('Error fetching stories:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to fetch stories' }
    });
  }
});

// Get specific story
router.get('/:id',
  validateParams(paramSchemas.uuid),
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const story = await getStoryById(req.params.id, req.user!.id);
      
      if (!story) {
        return res.status(404).json({
          success: false,
          error: { message: 'Story not found' }
        });
      }

      res.json({
        success: true,
        data: story
      });
    } catch (error: any) {
      console.error('Error fetching story:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to fetch story' }
      });
    }
  }
);

// Generate new story with AI
router.post('/generate',
  validateBody(storySchemas.generate),
  async (req: Request<{}, ApiResponse, GenerateStoryRequest>, res: Response) => {
    try {
      // Get active child profile if not specified
      let childProfile = null;
      if (!req.body.child_profile_id) {
        childProfile = await getActiveChildProfile(req.user!.id);
      }

      const story = await generateAndSaveStory(
        req.user!.id,
        childProfile,
        req.body,
        req.authToken!
      );
      
      res.status(201).json({
        success: true,
        data: { story }
      });
    } catch (error: any) {
      console.error('Error generating story:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to generate story' }
      });
    }
  }
);

// Create story manually (without AI)
router.post('/',
  validateBody(storySchemas.create),
  async (req: Request<{}, ApiResponse, CreateStoryRequest>, res: Response) => {
    try {
      const story = await createStory(req.user!.id, req.body, req.authToken!);
      
      res.status(201).json({
        success: true,
        data: story
      });
    } catch (error: any) {
      console.error('Error creating story:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to create story' }
      });
    }
  }
);

// Update story
router.put('/:id',
  validateParams(paramSchemas.uuid),
  validateBody(storySchemas.update),
  async (req: Request<{ id: string }, ApiResponse, UpdateStoryRequest>, res: Response) => {
    try {
      const story = await updateStory(
        req.params.id, 
        req.user!.id, 
        req.body,
        req.authToken!
      );
      
      res.json({
        success: true,
        data: story
      });
    } catch (error: any) {
      console.error('Error updating story:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to update story' }
      });
    }
  }
);

// Delete story
router.delete('/:id',
  validateParams(paramSchemas.uuid),
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      await deleteStory(req.params.id, req.user!.id, req.authToken!);
      
      res.json({
        success: true,
        data: { message: 'Story deleted successfully' }
      });
    } catch (error: any) {
      console.error('Error deleting story:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to delete story' }
      });
    }
  }
);

// Toggle favorite status
router.post('/:id/favorite',
  validateParams(paramSchemas.uuid),
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const story = await toggleFavoriteStory(
        req.params.id,
        req.user!.id,
        req.authToken!
      );
      
      res.json({
        success: true,
        data: story
      });
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to toggle favorite' }
      });
    }
  }
);

export default router;