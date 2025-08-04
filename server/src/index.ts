import './config/env.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import supabaseAuthRoutes from './routes/supabase-auth.js';

// Debug environment variables
console.log('Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Found' : 'Missing');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Found' : 'Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Found' : 'Missing');

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:5173'],
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
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// API routes
app.use('/api/auth', supabaseAuthRoutes);

// Import child profiles routes
import childProfileRoutes from './routes/child-profiles.js';
app.use('/api/profiles', childProfileRoutes);

// Import stories routes
import storyRoutes from './routes/stories.js';
app.use('/api/stories', storyRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: { message: 'Route not found' }
  });
});

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