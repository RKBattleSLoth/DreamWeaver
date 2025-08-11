// Debug version of the main server to identify the binding issue
import dotenv from 'dotenv';
import express from 'express';

// Load environment manually
dotenv.config({ path: '../.env.local' });
import cors from 'cors';
import helmet from 'helmet';

console.log('🔍 Debug: Starting server setup...');

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

console.log('🔍 Debug: Port parsed as:', PORT, typeof PORT);

// Add error handlers
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('🔍 Debug: Adding basic middleware...');

// Basic middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

console.log('🔍 Debug: Adding routes...');

// Simple test routes
app.get('/health', (req, res) => {
  console.log('🔍 Debug: Health route hit');
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Debug server working'
  });
});

app.get('/api/health', (req, res) => {
  console.log('🔍 Debug: API health route hit');
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Debug API working'
  });
});

console.log('🔍 Debug: About to call app.listen...');

// Try to listen
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('✅ Debug: Server successfully bound to port', PORT);
  console.log(`✅ Debug: Server accessible at http://localhost:${PORT}/health`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

console.log('🔍 Debug: app.listen call completed, server object:', !!server);
console.log('🔍 Debug: Waiting for server to bind...');