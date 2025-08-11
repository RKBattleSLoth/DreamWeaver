// Working server with illustration routes - bypassing complex import chains
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pg from 'pg';

// Load environment manually
dotenv.config({ path: '../.env.local' });

console.log('🚀 Starting working server...');

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
  hsts: false // Disable HTTPS enforcement in development
}));

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
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

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    message: 'Working server ready for illustration testing'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Working API ready'
  });
});

// Placeholder illustration routes for testing
app.get('/api/illustrations/gallery', (req, res) => {
  res.json({
    success: true,
    data: {
      illustrations: [],
      total: 0,
      message: 'Gallery endpoint working - ready for illustration implementation'
    }
  });
});

// Illustration sessions endpoint moved after auth middleware

// Authentication routes (imports already added at top)

// Database connection for auth (lazy initialization)
let dbPool = null;
function getDbPool() {
  if (!dbPool) {
    console.log('Creating database pool for auth...');
    dbPool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
    });
  }
  return dbPool;
}

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: { message: 'Access denied' } });
  }

  jwt.verify(token, process.env.SESSION_SECRET || 'dev-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: { message: 'Invalid token' } });
    }
    req.user = user;
    next();
  });
};

// Register route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email and password required' }
      });
    }

    const pool = getDbPool();
    
    // Check if user exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: { message: 'User already exists' }
      });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [email, hashedPassword]
    );

    // Generate token
    const token = jwt.sign(
      { id: newUser.rows[0].id, email: newUser.rows[0].email },
      process.env.SESSION_SECRET || 'dev-secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      data: {
        user: newUser.rows[0],
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Registration failed' }
    });
  }
});

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email and password required' }
      });
    }

    const pool = getDbPool();
    
    // Find user
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' }
      });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' }
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.rows[0].id, email: user.rows[0].email },
      process.env.SESSION_SECRET || 'dev-secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        user: { id: user.rows[0].id, email: user.rows[0].email, created_at: user.rows[0].created_at },
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
});

// Auth me route
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const pool = getDbPool();
    const user = await pool.query('SELECT id, email, created_at FROM users WHERE id = $1', [req.user.id]);
    
    if (user.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    res.json({
      success: true,
      data: { user: user.rows[0] }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get user info' }
    });
  }
});

// Child profiles routes - both endpoints for compatibility
app.get('/api/profiles', authenticateToken, async (req, res) => {
  try {
    const pool = getDbPool();
    const profiles = await pool.query(
      'SELECT * FROM child_profiles WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    
    res.json({
      success: true,
      data: profiles.rows
    });
  } catch (error) {
    console.error('Get profiles error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get profiles' }
    });
  }
});

app.get('/api/profiles/active', authenticateToken, async (req, res) => {
  try {
    const pool = getDbPool();
    const profile = await pool.query(
      'SELECT * FROM child_profiles WHERE user_id = $1 AND is_active = true LIMIT 1',
      [req.user.id]
    );
    
    res.json({
      success: true,
      data: profile.rows[0] || null
    });
  } catch (error) {
    console.error('Get active profile error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get active profile' }
    });
  }
});

app.post('/api/profiles', authenticateToken, async (req, res) => {
  try {
    const { name, age, grade, reading_level, interests, favorite_themes, content_safety, preferred_art_style } = req.body;
    
    if (!name || !age) {
      return res.status(400).json({
        success: false,
        error: { message: 'Name and age are required' }
      });
    }

    const pool = getDbPool();
    const newProfile = await pool.query(
      `INSERT INTO child_profiles 
       (user_id, name, age, grade, reading_level, interests, favorite_themes, content_safety, preferred_art_style, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [req.user.id, name, age, grade, reading_level, interests, favorite_themes, content_safety, preferred_art_style, false]
    );

    res.status(201).json({
      success: true,
      data: newProfile.rows[0]
    });
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create profile' }
    });
  }
});

// Profile activation endpoint
app.post('/api/profiles/:id/activate', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: { message: 'Profile ID is required' }
      });
    }

    const pool = getDbPool();
    
    // First deactivate all profiles for this user
    await pool.query(
      'UPDATE child_profiles SET is_active = false WHERE user_id = $1',
      [req.user.id]
    );
    
    // Then activate the selected profile
    const result = await pool.query(
      'UPDATE child_profiles SET is_active = true WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Profile not found' }
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Activate profile error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to activate profile' }
    });
  }
});

app.get('/api/child-profiles', authenticateToken, async (req, res) => {
  try {
    const pool = getDbPool();
    const profiles = await pool.query(
      'SELECT * FROM child_profiles WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    
    res.json({
      success: true,
      data: profiles.rows
    });
  } catch (error) {
    console.error('Get profiles error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get profiles' }
    });
  }
});

app.post('/api/child-profiles', authenticateToken, async (req, res) => {
  try {
    const { name, age, grade, reading_level, interests, favorite_themes, content_safety, preferred_art_style } = req.body;
    
    if (!name || !age) {
      return res.status(400).json({
        success: false,
        error: { message: 'Name and age are required' }
      });
    }

    const pool = getDbPool();
    const newProfile = await pool.query(
      `INSERT INTO child_profiles 
       (user_id, name, age, grade, reading_level, interests, favorite_themes, content_safety, preferred_art_style, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [req.user.id, name, age, grade, reading_level, interests, favorite_themes, content_safety, preferred_art_style, false]
    );

    res.status(201).json({
      success: true,
      data: { profile: newProfile.rows[0] }
    });
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create profile' }
    });
  }
});

// Stories routes
app.get('/api/stories', authenticateToken, async (req, res) => {
  try {
    const pool = getDbPool();
    const stories = await pool.query(
      'SELECT * FROM stories WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    
    res.json({
      success: true,
      data: stories.rows
    });
  } catch (error) {
    console.error('Get stories error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get stories' }
    });
  }
});

app.post('/api/stories', authenticateToken, async (req, res) => {
  try {
    const { title, content, theme, reading_level, word_count, generation_prompt, child_profile_id } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: { message: 'Title and content are required' }
      });
    }

    const pool = getDbPool();
    const newStory = await pool.query(
      `INSERT INTO stories 
       (user_id, child_profile_id, title, content, theme, reading_level, word_count, generation_prompt, is_favorite) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [req.user.id, child_profile_id, title, content, theme, reading_level, word_count, generation_prompt, false]
    );

    res.status(201).json({
      success: true,
      data: { story: newStory.rows[0] }
    });
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create story' }
    });
  }
});

// Story generation endpoint
app.post('/api/stories/generate', authenticateToken, async (req, res) => {
  try {
    console.log('Story generation request:', JSON.stringify(req.body, null, 2));
    
    const { 
      title, 
      theme, 
      characters, 
      setting, 
      plotPoints, 
      readingLevel, 
      reading_level,
      wordCount, 
      childProfileId,
      child_profile_id,
      length,
      story_length,
      specialInterests,
      custom_prompt,
      story_about
    } = req.body;
    
    // Handle both naming conventions
    const profileId = childProfileId || child_profile_id;
    const storyLength = length || story_length;
    const readLevel = readingLevel || reading_level;
    
    // More flexible validation - just need theme and childProfileId
    if (!theme) {
      return res.status(400).json({
        success: false,
        error: { message: 'Theme is required for story generation' }
      });
    }
    
    if (!profileId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Child profile ID is required' }
      });
    }

    // Generate title if not provided
    const storyTitle = title || `A Story About ${theme}`;
    
    // For now, create a placeholder story - later we'll integrate OpenRouter
    const generatedContent = `Once upon a time in ${setting || 'a magical land'}, there was a wonderful story about ${theme}. 
    
This is a placeholder story that will be replaced with actual AI generation using OpenRouter. The story will be about ${characters || 'brave characters'} and their adventures.

${custom_prompt ? `The story includes elements about ${custom_prompt} which makes it extra special.` : ''}
${specialInterests ? `The story includes elements about ${specialInterests} which makes it extra special.` : ''}

${plotPoints ? plotPoints.map((point, i) => `Chapter ${i + 1}: ${point}`).join('\n\n') : ''}

And they all lived happily ever after.

The End.`;

    const pool = getDbPool();
    const newStory = await pool.query(
      `INSERT INTO stories 
       (user_id, child_profile_id, title, content, theme, reading_level, word_count, generation_prompt, is_favorite) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        req.user.id, 
        profileId, 
        storyTitle, 
        generatedContent, 
        theme, 
        readLevel || storyLength || 'elementary', 
        wordCount || generatedContent.length, 
        JSON.stringify(req.body), 
        false
      ]
    );

    res.status(201).json({
      success: true,
      data: { story: newStory.rows[0] }
    });
  } catch (error) {
    console.error('Generate story error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to generate story' }
    });
  }
});

// Illustration session endpoint (properly placed after auth middleware)
app.post('/api/illustrations/sessions', authenticateToken, async (req, res) => {
  try {
    const { storyId, prompt, artStyle } = req.body;
    
    // Generate a unique session ID
    const sessionId = 'ill_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    res.json({
      success: true,
      data: {
        session_id: sessionId,  // frontend expects snake_case
        sessionId: sessionId,   // also provide camelCase for compatibility
        userId: req.user.id,
        storyId: storyId || null,
        prompt: prompt || '',
        artStyle: artStyle || 'illustrated',
        currentRound: 1,
        status: 'active',
        variations: [],
        createdAt: new Date().toISOString(),
        message: 'Illustration session created successfully'
      }
    });
  } catch (error) {
    console.error('Create illustration session error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create illustration session' }
    });
  }
});

// Test Replicate connection
app.get('/api/test-replicate', (req, res) => {
  res.json({
    success: true,
    message: 'Replicate endpoint ready - will implement actual connection',
    env_check: !!process.env.REPLICATE_API_TOKEN
  });
});

// Serve static files for uploads (if needed)
app.use('/uploads', express.static('../storage'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: { message: 'Route not found' }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message || err);
  res.status(err.status || 500).json({
    success: false,
    error: { 
      message: err.message || 'Internal server error'
    }
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Working server running on port ${PORT}`);
  console.log(`✅ Frontend: http://localhost:5173/`);
  console.log(`✅ Backend: http://localhost:${PORT}/health`);
  console.log(`✅ Ready for illustration feature testing!`);
});

console.log('Server setup completed');