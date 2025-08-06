import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader, JWTPayload } from '../utils/auth.js';
import { getUserById } from '../services/db.js';
import { User } from '../../shared/types/index.js';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: Omit<User, 'password_hash'>;
      userId?: string;
    }
  }
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: { message: 'Access token required' } 
      });
    }

    const payload: JWTPayload | null = verifyToken(token);
    
    if (!payload) {
      return res.status(401).json({ 
        success: false, 
        error: { message: 'Invalid or expired token' } 
      });
    }

    // Get user from database to ensure they still exist
    const user = await getUserById(payload.userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: { message: 'User not found' } 
      });
    }

    // Add user info to request object (without password hash)
    req.user = {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
    req.userId = user.id;

    next();
  } catch (error) {
    console.error('Authentication error:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).json({ 
      success: false, 
      error: { message: 'Authentication failed' } 
    });
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractTokenFromHeader(req.headers.authorization);
  
  if (!token) {
    return next();
  }

  // Try to authenticate, but don't fail if it doesn't work
  authenticateToken(req, res, (err) => {
    // Continue regardless of authentication result
    next();
  });
}