import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { validateBody, validateParams, childProfileSchemas, paramSchemas } from '../middleware/validation.js';
import {
  getChildProfilesByUserId,
  getActiveChildProfile,
  createChildProfile,
  updateChildProfile,
  deleteChildProfile,
  setActiveChildProfile
} from '../services/child-profiles-service.js';
import { 
  CreateChildProfileRequest, 
  UpdateChildProfileRequest, 
  ApiResponse 
} from '../../shared/types/index.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all child profiles for current user
router.get('/', async (req: Request, res: Response) => {
  try {
    const profiles = await getChildProfilesByUserId(req.userId!);
    
    res.json({
      success: true,
      data: profiles
    });
  } catch (error: any) {
    console.error('Error fetching child profiles:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to fetch child profiles' }
    });
  }
});

// Get active child profile
router.get('/active', async (req: Request, res: Response) => {
  try {
    const profile = await getActiveChildProfile(req.userId!);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { message: 'No active child profile found' }
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error: any) {
    console.error('Error fetching active child profile:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to fetch active child profile' }
    });
  }
});

// Create new child profile
router.post('/',
  validateBody(childProfileSchemas.create),
  async (req: Request<{}, ApiResponse, CreateChildProfileRequest>, res: Response) => {
    try {
      // Pass the auth token to the service
      const profile = await createChildProfile(req.userId!, req.body);
      
      res.status(201).json({
        success: true,
        data: profile
      });
    } catch (error: any) {
      console.error('Error creating child profile:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to create child profile' }
      });
    }
  }
);

// Update child profile
router.put('/:id',
  validateParams(paramSchemas.uuid),
  validateBody(childProfileSchemas.update),
  async (req: Request<{ id: string }, ApiResponse, UpdateChildProfileRequest>, res: Response) => {
    try {
      const profile = await updateChildProfile(req.params.id, req.userId!, req.body);
      
      res.json({
        success: true,
        data: profile
      });
    } catch (error: any) {
      console.error('Error updating child profile:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to update child profile' }
      });
    }
  }
);

// Delete child profile
router.delete('/:id',
  validateParams(paramSchemas.uuid),
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      await deleteChildProfile(req.params.id, req.userId!);
      
      res.json({
        success: true,
        data: { message: 'Child profile deleted successfully' }
      });
    } catch (error: any) {
      console.error('Error deleting child profile:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to delete child profile' }
      });
    }
  }
);

// Set active child profile
router.post('/:id/activate',
  validateParams(paramSchemas.uuid),
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const profile = await setActiveChildProfile(req.params.id, req.userId!);
      
      res.json({
        success: true,
        data: profile
      });
    } catch (error: any) {
      console.error('Error activating child profile:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to activate child profile' }
      });
    }
  }
);

export default router;