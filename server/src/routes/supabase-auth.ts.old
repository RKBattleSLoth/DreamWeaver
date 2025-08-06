import { Router, Request, Response } from 'express';
import { supabaseClient } from '../services/supabase.js';
import { validateBody, authSchemas } from '../middleware/validation.js';
import { authenticateSupabaseUser } from '../middleware/supabase-auth.js';
import { LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '../../shared/types/index.js';

const router = Router();

// Register new user using Supabase Auth
router.post('/register', 
  validateBody(authSchemas.register),
  async (req: Request<{}, ApiResponse<AuthResponse>, RegisterRequest>, res: Response) => {
    try {
      const { email, password } = req.body;

      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined // Disable email confirmation for development
        }
      });

      if (error) {
        return res.status(400).json({
          success: false,
          error: { message: error.message }
        });
      }

      if (!data.user || !data.session) {
        return res.status(400).json({
          success: false,
          error: { message: 'Registration failed' }
        });
      }

      // Return user info and token
      const userResponse = {
        id: data.user.id,
        email: data.user.email!,
        created_at: data.user.created_at,
        updated_at: data.user.updated_at
      };

      res.status(201).json({
        success: true,
        data: {
          user: userResponse,
          token: data.session.access_token
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to create user account' }
      });
    }
  }
);

// Login user using Supabase Auth
router.post('/login',
  validateBody(authSchemas.login),
  async (req: Request<{}, ApiResponse<AuthResponse>, LoginRequest>, res: Response) => {
    try {
      const { email, password } = req.body;

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return res.status(401).json({
          success: false,
          error: { message: error.message }
        });
      }

      if (!data.user || !data.session) {
        return res.status(401).json({
          success: false,
          error: { message: 'Login failed' }
        });
      }

      // Return user info and token
      const userResponse = {
        id: data.user.id,
        email: data.user.email!,
        created_at: data.user.created_at,
        updated_at: data.user.updated_at
      };

      res.json({
        success: true,
        data: {
          user: userResponse,
          token: data.session.access_token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Login failed' }
      });
    }
  }
);

// Get current user info
router.get('/me',
  authenticateSupabaseUser,
  async (req: Request, res: Response) => {
    try {
      // User info is already attached by authenticateSupabaseUser middleware
      res.json({
        success: true,
        data: { user: req.user }
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to get user information' }
      });
    }
  }
);

// Logout (handled client-side with Supabase)
router.post('/logout',
  authenticateSupabaseUser,
  async (req: Request, res: Response) => {
    try {
      // With Supabase, logout is primarily handled client-side
      // We can optionally invalidate the session server-side
      if (req.authToken) {
        await supabaseClient.auth.admin.signOut(req.authToken);
      }
      
      res.json({
        success: true,
        data: { message: 'Logged out successfully' }
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Logout failed' }
      });
    }
  }
);

export default router;