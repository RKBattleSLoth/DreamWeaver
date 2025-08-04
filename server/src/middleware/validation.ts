import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { VALIDATION_RULES } from '../../shared/constants/index.js';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            details: error.errors
          }
        });
      }
      
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid request body' }
      });
    }
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Query validation failed',
            details: error.errors
          }
        });
      }
      
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid query parameters' }
      });
    }
  };
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Parameter validation failed',
            details: error.errors
          }
        });
      }
      
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid parameters' }
      });
    }
  };
}

// Common validation schemas
export const authSchemas = {
  login: z.object({
    email: z.string()
      .email('Invalid email format')
      .min(VALIDATION_RULES.EMAIL.MIN_LENGTH)
      .max(VALIDATION_RULES.EMAIL.MAX_LENGTH),
    password: z.string()
      .min(VALIDATION_RULES.PASSWORD.MIN_LENGTH, `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters`)
      .max(VALIDATION_RULES.PASSWORD.MAX_LENGTH)
  }),
  
  register: z.object({
    email: z.string()
      .email('Invalid email format')
      .min(VALIDATION_RULES.EMAIL.MIN_LENGTH)
      .max(VALIDATION_RULES.EMAIL.MAX_LENGTH),
    password: z.string()
      .min(VALIDATION_RULES.PASSWORD.MIN_LENGTH, `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters`)
      .max(VALIDATION_RULES.PASSWORD.MAX_LENGTH)
  })
};

export const childProfileSchemas = {
  create: z.object({
    name: z.string()
      .min(VALIDATION_RULES.CHILD_NAME.MIN_LENGTH)
      .max(VALIDATION_RULES.CHILD_NAME.MAX_LENGTH),
    age: z.number().int().min(0).max(18).optional(),
    grade: z.string().max(50).optional(),
    reading_level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    interests: z.array(z.string().max(100)).optional(),
    favorite_themes: z.array(z.string().max(100)).optional(),
    content_safety: z.enum(['strict', 'moderate', 'relaxed']).optional(),
    preferred_art_style: z.string().max(50).optional()
  }),
  
  update: z.object({
    name: z.string()
      .min(VALIDATION_RULES.CHILD_NAME.MIN_LENGTH)
      .max(VALIDATION_RULES.CHILD_NAME.MAX_LENGTH)
      .optional(),
    age: z.number().int().min(0).max(18).optional(),
    grade: z.string().max(50).optional(),
    reading_level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    interests: z.array(z.string().max(100)).optional(),
    favorite_themes: z.array(z.string().max(100)).optional(),
    content_safety: z.enum(['strict', 'moderate', 'relaxed']).optional(),
    preferred_art_style: z.string().max(50).optional(),
    is_active: z.boolean().optional()
  })
};

export const storySchemas = {
  generate: z.object({
    child_profile_id: z.string().uuid().optional(),
    theme: z.string().max(100).optional(),
    custom_prompt: z.string()
      .min(VALIDATION_RULES.GENERATION_PROMPT.MIN_LENGTH)
      .max(VALIDATION_RULES.GENERATION_PROMPT.MAX_LENGTH)
      .optional(),
    story_length: z.enum(['short', 'medium', 'long']).optional(),
    reading_level: z.enum(['beginner', 'intermediate', 'advanced']).optional()
  }),
  
  create: z.object({
    child_profile_id: z.string().uuid().optional(),
    title: z.string()
      .min(VALIDATION_RULES.STORY_TITLE.MIN_LENGTH)
      .max(VALIDATION_RULES.STORY_TITLE.MAX_LENGTH),
    content: z.string()
      .min(VALIDATION_RULES.STORY_CONTENT.MIN_LENGTH)
      .max(VALIDATION_RULES.STORY_CONTENT.MAX_LENGTH),
    theme: z.string().max(100).optional(),
    reading_level: z.string().max(50).optional()
  }),
  
  update: z.object({
    child_profile_id: z.string().uuid().optional(),
    title: z.string()
      .min(VALIDATION_RULES.STORY_TITLE.MIN_LENGTH)
      .max(VALIDATION_RULES.STORY_TITLE.MAX_LENGTH)
      .optional(),
    content: z.string()
      .min(VALIDATION_RULES.STORY_CONTENT.MIN_LENGTH)
      .max(VALIDATION_RULES.STORY_CONTENT.MAX_LENGTH)
      .optional(),
    theme: z.string().max(100).optional(),
    reading_level: z.string().max(50).optional(),
    is_favorite: z.boolean().optional()
  })
};

export const illustrationSchemas = {
  generate: z.object({
    prompt: z.string()
      .min(VALIDATION_RULES.GENERATION_PROMPT.MIN_LENGTH)
      .max(VALIDATION_RULES.GENERATION_PROMPT.MAX_LENGTH),
    art_style: z.string().max(100).optional(),
    aspect_ratio: z.enum(['1:1', '16:9', '9:16', '4:3', '3:4']).optional(),
    quality: z.enum(['standard', 'hd']).optional()
  }),
  
  create: z.object({
    title: z.string().max(VALIDATION_RULES.ILLUSTRATION_TITLE.MAX_LENGTH).optional(),
    description: z.string().max(VALIDATION_RULES.ILLUSTRATION_DESCRIPTION.MAX_LENGTH).optional(),
    art_style: z.string().max(100).optional(),
    tags: z.array(z.string().max(50)).optional()
  }),
  
  update: z.object({
    title: z.string().max(VALIDATION_RULES.ILLUSTRATION_TITLE.MAX_LENGTH).optional(),
    description: z.string().max(VALIDATION_RULES.ILLUSTRATION_DESCRIPTION.MAX_LENGTH).optional(),
    art_style: z.string().max(100).optional(),
    tags: z.array(z.string().max(50)).optional()
  })
};

export const linkingSchemas = {
  linkIllustration: z.object({
    illustration_id: z.string().uuid(),
    position: z.number().int().min(0)
  }),
  
  reorderIllustrations: z.object({
    illustration_positions: z.array(z.object({
      illustration_id: z.string().uuid(),
      position: z.number().int().min(0)
    }))
  })
};

export const paramSchemas = {
  uuid: z.object({
    id: z.string().uuid('Invalid ID format')
  }),
  
  storyIllustration: z.object({
    storyId: z.string().uuid('Invalid story ID format'),
    illustrationId: z.string().uuid('Invalid illustration ID format')
  })
};