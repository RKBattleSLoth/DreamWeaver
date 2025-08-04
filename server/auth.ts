import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from './config';
import type { Request, Response, NextFunction } from 'express';

// Initialize Supabase client with service role key for auth operations
const supabase = createClient(
  config.SUPABASE_URL,
  config.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// JWT token generation
export function generateToken(userId: string): string {
  return jwt.sign(
    { userId, iat: Math.floor(Date.now() / 1000) },
    config.SESSION_SECRET,
    { expiresIn: '7d' }
  );
}

// JWT token verification
export function verifyToken(token: string): { userId: string } {
  return jwt.verify(token, config.SESSION_SECRET) as { userId: string };
}

// Password hashing
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

// Password verification
export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

// Authentication middleware
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.cookies?.authToken;

  if (!token) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  try {
    const payload = verifyToken(token);
    
    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', payload.userId)
      .single();

    if (error || !user) {
      res.status(401).json({ message: 'Invalid authentication' });
      return;
    }

    req.user = {
      userId: user.id,
      email: user.email
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Create user in database
export async function createUser(email: string, password: string) {
  const hashedPassword = hashPassword(password);
  
  const { data, error } = await supabase
    .from('users')
    .insert({
      email,
      password_hash: hashedPassword,
      email_verified: false
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      throw new Error('Email already exists');
    }
    throw error;
  }

  return data;
}

// Verify user credentials
export async function verifyUser(email: string, password: string) {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
    throw new Error('Invalid email or password');
  }

  const isValid = verifyPassword(password, user.password_hash);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  return user;
}