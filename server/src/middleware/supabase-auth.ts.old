import { Request, Response, NextFunction } from 'express';
import { getAuthenticatedUser } from '../services/supabase.js';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        email_confirmed_at?: string;
        created_at: string;
        updated_at: string;
      };
      authToken?: string;
    }
  }
}

export async function authenticateSupabaseUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getAuthenticatedUser(req.headers.authorization);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: { message: 'Authentication required' } 
      });
    }

    // Add user info to request object
    req.user = {
      id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    // Extract token for database operations
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      req.authToken = authHeader.substring(7);
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).json({ 
      success: false, 
      error: { message: 'Authentication failed' } 
    });
  }
}

export function optionalSupabaseAuth(req: Request, res: Response, next: NextFunction) {
  // Try to authenticate, but don't fail if it doesn't work
  authenticateSupabaseUser(req, res, (err) => {
    // Continue regardless of authentication result
    next();
  });
}