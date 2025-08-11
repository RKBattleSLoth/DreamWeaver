// Development configuration that maintains Railway compatibility
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from .env.local in development
if (process.env.NODE_ENV === 'development') {
  config({ path: path.resolve(__dirname, '../../../.env.local') });
}

export const devConfig = {
  // Storage configuration
  storage: {
    type: process.env.STORAGE_TYPE || 'local',
    localPath: process.env.LOCAL_STORAGE_PATH || './storage',
  },
  
  // DALL-E 3 configuration for illustrations
  illustration: {
    model: process.env.OPENROUTER_DALLE3_MODEL || 'openai/dall-e-3',
    defaultSize: '1024x1024',
    defaultQuality: 'standard',
    defaultStyle: 'vivid',
  },
  
  // Development-specific overrides
  development: {
    // Faster iteration with disabled rate limiting
    rateLimit: {
      enabled: false,
      windowMs: 900000,
      maxRequests: 10000,
    },
    
    // Mock services for offline development
    mockServices: {
      email: process.env.EMAIL_SERVICE === 'disabled',
      storage: process.env.STORAGE_TYPE === 'local',
    },
    
    // Hot reload configuration
    hotReload: {
      enabled: true,
      watchDirs: ['./src', './shared'],
    },
  },
  
  // Railway compatibility checks
  railwayCompatibility: {
    // Ensure these match Railway's expected structure
    buildCommand: 'npm install && npm run build',
    startCommand: 'npm start',
    healthcheckPath: '/api/health',
  },
};

// Validate configuration consistency
export function validateDevConfig() {
  const errors = [];
  
  // Check required environment variables
  const required = ['DATABASE_URL', 'OPENROUTER_API_KEY'];
  for (const key of required) {
    if (!process.env[key]) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  }
  
  // Warn about development-specific settings
  if (process.env.NODE_ENV === 'development') {
    if (process.env.ENFORCE_AUTH_IN_DEV === 'true') {
      console.warn('⚠️  Authentication is enforced in development mode');
    }
    if (process.env.CONTENT_MODERATION_ENABLED === 'true') {
      console.warn('⚠️  Content moderation is enabled in development mode');
    }
  }
  
  return errors;
}