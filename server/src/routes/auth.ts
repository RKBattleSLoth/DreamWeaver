import { Router, Request, Response } from 'express';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';
import { createUser, getUserByEmail } from '../services/database.js';
import { validateBody, authSchemas } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import { LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '../../shared/types/index.js';

const router = Router();

// Register new user
router.post('/register', 
  validateBody(authSchemas.register),
  async (req: Request<{}, ApiResponse<AuthResponse>, RegisterRequest>, res: Response) => {
    try {
      const { email, password } = req.body;

      // Check if user already exists
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: { message: 'User with this email already exists' }
        });
      }

      // Hash password and create user
      const passwordHash = hashPassword(password);
      const user = await createUser(email, passwordHash);

      // Generate token
      const token = generateToken(user);

      // Return user info without password hash
      const userResponse = {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at
      };

      res.status(201).json({
        success: true,
        data: {
          user: userResponse,
          token
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

// Login user
router.post('/login',
  validateBody(authSchemas.login),
  async (req: Request<{}, ApiResponse<AuthResponse>, LoginRequest>, res: Response) => {
    try {
      const { email, password } = req.body;

      // Get user by email
      const user = await getUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Invalid email or password' }
        });
      }

      // Verify password
      const isValidPassword = comparePassword(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: { message: 'Invalid email or password' }
        });
      }

      // Generate token
      const token = generateToken(user);

      // Return user info without password hash
      const userResponse = {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at
      };

      res.json({
        success: true,
        data: {
          user: userResponse,
          token
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
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      // User info is already attached by authenticateToken middleware
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

// Logout (client-side token removal)
router.post('/logout',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      // Since we're using stateless JWT tokens, logout is handled client-side
      // by removing the token from storage. We just confirm the request.
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