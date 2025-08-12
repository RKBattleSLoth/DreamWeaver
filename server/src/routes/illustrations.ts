import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validation.js';
import { z } from 'zod';
import { illustrationGenerator } from '../services/illustration-generation.js';
import { getChildProfilesByUserId } from '../services/child-profiles-service.js';
import { getStoryById } from '../services/stories-service.js';
import { getIllustrationsByUserId, getIllustrationById } from '../services/db.js';
import { ApiResponse } from '../../shared/types/index.js';

const router = Router();

// Serve illustration images - public access for now since <img> tags can't send auth headers
// TODO: Implement signed URLs or session-based auth for better security
router.get('/image/:filename', async (req: Request<{ filename: string }>, res: Response) => {
  try {
    const { fileStorage, StorageBuckets } = await import('../services/file-storage.js');
    
    const filename = req.params.filename;
    console.log('Image request:', { filename, method: req.method });
    
    // Validate filename to prevent directory traversal
    if (!filename || filename.includes('../') || filename.includes('..\\')) {
      console.error('Invalid filename:', filename);
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid filename' }
      });
    }

    try {
      // Download the image from storage
      const imageBuffer = await fileStorage.download(StorageBuckets.ILLUSTRATIONS, filename);
      
      if (!imageBuffer) {
        console.error('Image buffer is null for:', filename);
        return res.status(404).json({
          success: false,
          error: { message: 'Image not found' }
        });
      }
      
      console.log('Successfully loaded image:', { 
        filename, 
        size: imageBuffer.length,
        type: imageBuffer.constructor.name 
      });
      
      // Set appropriate content type based on file extension
      const ext = filename.split('.').pop()?.toLowerCase();
      const contentType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 
                         ext === 'png' ? 'image/png' : 
                         ext === 'webp' ? 'image/webp' : 
                         ext === 'gif' ? 'image/gif' : 'application/octet-stream';
      
      res.set({
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Content-Length': imageBuffer.length.toString()
      });
      
      return res.send(imageBuffer);
      
    } catch (downloadError: any) {
      console.error('Error downloading image:', downloadError);
      return res.status(404).json({
        success: false,
        error: { message: 'Image not found' }
      });
    }

  } catch (error: any) {
    console.error('Error serving illustration image:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to serve image' }
    });
  }
});

// Debug endpoint to check storage (remove in production)
router.get('/debug/storage', async (req: Request, res: Response) => {
  try {
    const { fileStorage, StorageBuckets } = await import('../services/file-storage.js');
    const files = await fileStorage.list(StorageBuckets.ILLUSTRATIONS);
    
    // Test if we can actually read the first file
    let testFileResult = null;
    if (files.length > 0) {
      try {
        const testBuffer = await fileStorage.download(StorageBuckets.ILLUSTRATIONS, files[0].name);
        testFileResult = {
          name: files[0].name,
          size: testBuffer?.length || 0,
          readable: !!testBuffer
        };
      } catch (e: any) {
        testFileResult = {
          name: files[0].name,
          error: e.message
        };
      }
    }
    
    res.json({
      success: true,
      data: {
        storageType: process.env.STORAGE_TYPE || 'local',
        storagePath: process.env.LOCAL_STORAGE_PATH || './storage',
        filesCount: files.length,
        files: files.slice(0, 5).map(f => ({ 
          name: f.name,
          size: f.size,
          createdAt: f.createdAt
        })),
        testFileResult,
        workingDirectory: process.cwd()
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
});

// All other routes require authentication
router.use(authenticateToken);

// Validation schemas
const startSessionSchema = z.object({
  story_id: z.string().uuid().optional(),
  child_profile_id: z.string().uuid().optional(),
  scene_prompt: z.string().min(1).max(500),
  scene_type: z.enum(['character', 'scene', 'object', 'setting']),
  illustration_style: z.string().optional()
});

const generateVariationsSchema = z.object({
  session_id: z.string().uuid(),
  round: z.number().int().min(1).max(5),
  base_prompt: z.string().min(1),
  favorite_illustration_id: z.string().uuid().optional()
});

const selectFavoriteSchema = z.object({
  session_id: z.string().uuid(),
  selected_illustration_id: z.string().uuid(),
  action: z.enum(['make_canon', 'iterate']),
  current_round: z.number().int().min(1).max(5)
});

const uuidSchema = z.object({
  id: z.string().uuid()
});

// Get user's illustration gallery
router.get('/gallery', async (req: Request, res: Response) => {
  try {
    console.log('Gallery request:', { 
      userId: req.user!.id, 
      query: req.query,
      headers: req.headers.authorization ? 'Bearer token present' : 'No auth'
    });
    
    const illustrations = await getIllustrationsByUserId(req.user!.id);
    console.log('Found illustrations:', { 
      count: illustrations.length,
      firstThree: illustrations.slice(0, 3).map(ill => ({
        id: ill.id,
        image_path: ill.image_path,
        is_canonical: ill.is_canonical
      }))
    });
    
    // By default, show canonical illustrations in gallery
    // Use ?include_all=true to show all illustrations
    // If no canonical illustrations exist, show all to avoid empty gallery
    const includeAll = req.query.include_all === 'true';
    const canonicalIllustrations = illustrations.filter(ill => ill.is_canonical === true);
    const filteredIllustrations = includeAll 
      ? illustrations
      : canonicalIllustrations.length > 0 
        ? canonicalIllustrations 
        : illustrations; // Show all if no canonical ones exist

    // Transform illustrations to include proper image URLs
    const illustrationsWithUrls = filteredIllustrations.map(ill => {
      const imageUrl = ill.image_path ? `/api/illustrations/image/${ill.image_path}` : null;
      console.log('URL mapping:', { 
        id: ill.id, 
        image_path: ill.image_path, 
        constructed_url: imageUrl 
      });
      return {
        ...ill,
        image_url: imageUrl,
        // Keep the original for backwards compatibility
        public_url: imageUrl
      };
    });

    res.json({
      success: true,
      data: {
        illustrations: illustrationsWithUrls,
        total: illustrationsWithUrls.length
      }
    });
  } catch (error: any) {
    console.error('Error fetching illustration gallery:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to fetch illustrations' }
    });
  }
});

// Start new illustration session from story
router.post('/sessions', 
  validateBody(startSessionSchema),
  async (req: Request<{}, ApiResponse, z.infer<typeof startSessionSchema>>, res: Response) => {
    try {
      console.log('Starting illustration session:', {
        userId: req.user!.id,
        body: req.body
      });

      // Get child profile (specified or active)
      let childProfile = null;
      if (req.body.child_profile_id) {
        const profiles = await getChildProfilesByUserId(req.user!.id);
        childProfile = profiles.find(p => p.id === req.body.child_profile_id) || null;
      } else {
        // Get active profile
        const profiles = await getChildProfilesByUserId(req.user!.id);
        childProfile = profiles.find(p => p.is_active) || null;
      }

      if (!childProfile) {
        return res.status(400).json({
          success: false,
          error: { message: 'No child profile found. Please create a child profile first.' }
        });
      }

      // Get story context if story_id provided
      let story = null;
      if (req.body.story_id) {
        story = await getStoryById(req.body.story_id, req.user!.id);
        if (!story) {
          return res.status(404).json({
            success: false,
            error: { message: 'Story not found' }
          });
        }
      }

      // Start illustration session
      const result = await illustrationGenerator.startIllustrationSession({
        userId: req.user!.id,
        storyId: req.body.story_id,
        childProfile,
        scenePrompt: req.body.scene_prompt,
        sceneType: req.body.scene_type,
        illustrationStyle: req.body.illustration_style
      });

      // Transform variations to include proper image URLs
      const variationsWithUrls = result.variations.map(ill => ({
        ...ill,
        image_url: ill.image_path ? `/api/illustrations/image/${ill.image_path}` : null,
        public_url: ill.image_path ? `/api/illustrations/image/${ill.image_path}` : null
      }));

      res.status(201).json({
        success: true,
        data: {
          session_id: result.sessionId,
          variations: variationsWithUrls,
          child_profile: childProfile,
          story: story,
          round: 1
        }
      });

    } catch (error: any) {
      console.error('Error starting illustration session:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to start illustration session' }
      });
    }
  }
);

// Generate new variation set (for iterations)
router.post('/generate-variations',
  validateBody(generateVariationsSchema),
  async (req: Request<{}, ApiResponse, z.infer<typeof generateVariationsSchema>>, res: Response) => {
    try {
      console.log('Generating new variations:', {
        userId: req.user!.id,
        body: req.body
      });

      const variations = await illustrationGenerator.generateVariationSet({
        sessionId: req.body.session_id,
        userId: req.user!.id,
        round: req.body.round,
        basePrompt: req.body.base_prompt,
        favoriteIllustrationId: req.body.favorite_illustration_id
      });

      // Transform variations to include proper image URLs
      const variationsWithUrls = variations.map(ill => ({
        ...ill,
        image_url: ill.image_path ? `/api/illustrations/image/${ill.image_path}` : null,
        public_url: ill.image_path ? `/api/illustrations/image/${ill.image_path}` : null
      }));

      res.json({
        success: true,
        data: {
          variations: variationsWithUrls,
          round: req.body.round
        }
      });

    } catch (error: any) {
      console.error('Error generating variations:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to generate variations' }
      });
    }
  }
);

// Select favorite and choose action (make canon or iterate)
router.post('/select-favorite',
  validateBody(selectFavoriteSchema),
  async (req: Request<{}, ApiResponse, z.infer<typeof selectFavoriteSchema>>, res: Response) => {
    try {
      console.log('Processing favorite selection:', {
        userId: req.user!.id,
        body: req.body
      });

      const result = await illustrationGenerator.selectFavoriteAndAction(
        req.body.session_id,
        req.user!.id,
        req.body.selected_illustration_id,
        req.body.action,
        req.body.current_round
      );

      // Transform the result to include proper image URLs
      const transformedResult = {
        ...result,
        selectedFavorite: result.selectedFavorite ? {
          ...result.selectedFavorite,
          image_url: result.selectedFavorite.image_path ? `/api/illustrations/image/${result.selectedFavorite.image_path}` : null,
          public_url: result.selectedFavorite.image_path ? `/api/illustrations/image/${result.selectedFavorite.image_path}` : null
        } : undefined,
        variations: result.variations?.map(ill => ({
          ...ill,
          image_url: ill.image_path ? `/api/illustrations/image/${ill.image_path}` : null,
          public_url: ill.image_path ? `/api/illustrations/image/${ill.image_path}` : null
        }))
      };

      res.json({
        success: true,
        data: transformedResult
      });

    } catch (error: any) {
      console.error('Error processing favorite selection:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to process selection' }
      });
    }
  }
);

// Get session history and progress
router.get('/sessions/:id/history',
  validateParams(uuidSchema),
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const history = await illustrationGenerator.getSessionHistory(
        req.params.id,
        req.user!.id
      );

      res.json({
        success: true,
        data: history
      });

    } catch (error: any) {
      console.error('Error fetching session history:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to fetch session history' }
      });
    }
  }
);

// Get specific illustration
router.get('/:id',
  validateParams(uuidSchema),
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const illustration = await getIllustrationById(req.params.id, req.user!.id);
      
      if (!illustration) {
        return res.status(404).json({
          success: false,
          error: { message: 'Illustration not found' }
        });
      }

      res.json({
        success: true,
        data: illustration
      });

    } catch (error: any) {
      console.error('Error fetching illustration:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to fetch illustration' }
      });
    }
  }
);

// Update illustration details (title, description)
router.put('/:id',
  validateParams(uuidSchema),
  validateBody(z.object({
    title: z.string().max(200).optional(),
    description: z.string().max(1000).optional(),
    tags: z.array(z.string()).optional()
  })),
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const { updateIllustration } = await import('../services/db.js');
      
      const illustration = await updateIllustration(
        req.params.id,
        req.user!.id,
        req.body
      );

      res.json({
        success: true,
        data: illustration
      });

    } catch (error: any) {
      console.error('Error updating illustration:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to update illustration' }
      });
    }
  }
);

// Delete illustration
router.delete('/:id',
  validateParams(uuidSchema),
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const { deleteIllustration } = await import('../services/db.js');
      
      await deleteIllustration(req.params.id, req.user!.id);

      res.json({
        success: true,
        data: { message: 'Illustration deleted successfully' }
      });

    } catch (error: any) {
      console.error('Error deleting illustration:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to delete illustration' }
      });
    }
  }
);


export default router;