// Load environment configuration (Railway sets vars directly, no .env needed)
import './config/env.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { checkDatabaseConnection } from './services/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Debug environment variables
console.log('Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Found' : 'Missing');
console.log('USE_POSTGRES:', process.env.USE_POSTGRES || 'false');
console.log('STORAGE_TYPE:', process.env.STORAGE_TYPE || 'local');

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    },
  },
  // Disable HTTPS enforcement in development
  hsts: process.env.NODE_ENV !== 'development'
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',') 
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbHealthy = await checkDatabaseConnection();
  res.status(dbHealthy ? 200 : 503).json({ 
    status: dbHealthy ? 'ok' : 'database_error', 
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    database: dbHealthy ? 'connected' : 'disconnected'
  });
});

// API health check
app.get('/api/health', async (req, res) => {
  const dbHealthy = await checkDatabaseConnection();
  res.status(dbHealthy ? 200 : 503).json({ 
    status: dbHealthy ? 'ok' : 'database_error', 
    timestamp: new Date().toISOString(),
    database: dbHealthy ? 'connected' : 'disconnected'
  });
});

// Test Replicate connection endpoint
app.get('/api/test-replicate', async (req, res) => {
  try {
    const { testReplicateConnection } = await import('./services/replicate.js');
    const result = await testReplicateConnection();
    res.json({ 
      success: true, 
      replicate: result ? 'connected' : 'failed',
      message: result ? 'Replicate connection test passed' : 'Replicate connection test failed'
    });
  } catch (error: any) {
    console.error('Replicate test error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      replicate: 'error'
    });
  }
});

// Serve static files for uploads (local storage)
if (process.env.STORAGE_TYPE === 'local' || !process.env.STORAGE_TYPE) {
  const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'storage');
  console.log('Serving static files from:', uploadDir);
  app.use('/uploads', express.static(uploadDir));
}

// API routes
app.use('/api/auth', authRoutes);

// Import child profiles routes
import childProfileRoutes from './routes/child-profiles.js';
app.use('/api/profiles', childProfileRoutes);

// Import stories routes
import storyRoutes from './routes/stories.js';
app.use('/api/stories', storyRoutes);

// Import storage routes (for local development)
import storageRoutes from './routes/storage.js';
app.use('/api', storageRoutes);

// Import illustration routes
import illustrationRoutes from './routes/illustrations.js';
app.use('/api/illustrations', illustrationRoutes);

// Import story-illustration linking routes
import storyIllustrationRoutes from './routes/story-illustrations.js';
app.use('/api/story-illustrations', storyIllustrationRoutes);

// Serve built client files
const clientDistDir = path.join(__dirname, '../../client/dist');

// Check if client dist directory exists
if (fs.existsSync(clientDistDir)) {
  console.log('Serving client files from:', clientDistDir);
  app.use(express.static(clientDistDir));
  
  // Serve index.html for client-side routing (but not for API routes)
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      res.sendFile(path.join(clientDistDir, 'index.html'));
    } else {
      res.status(404).json({
        success: false,
        error: { message: 'API route not found' }
      });
    }
  });
} else {
  console.log('Client dist directory not found, API-only mode');
  // 404 handler for API-only mode
  app.use('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({
        success: false,
        error: { message: 'API route not found' }
      });
    } else {
      res.status(404).json({
        success: false,
        error: { message: 'Frontend not deployed - please access API endpoints directly' }
      });
    }
  });
}

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err.message || err);
  
  res.status(err.status || 500).json({
    success: false,
    error: { 
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`StoryTime AI v2.0 server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Server accessible at: http://0.0.0.0:${PORT}`);
});

export default app;