// Minimal version of main server to test tsx compilation
import './config/env.js'; // Add first suspect import
import express from 'express';
import cors from 'cors';

console.log('Starting minimal TypeScript server...');

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Minimal TypeScript server working'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Minimal TypeScript API working'
  });
});

console.log('About to start server...');

const server = app.listen(PORT, '0.0.0.0');

server.on('listening', () => {
  console.log(`✅ Minimal TypeScript server running on port ${PORT}`);
  console.log(`✅ Server accessible at http://localhost:${PORT}/health`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

console.log('Server setup completed, server object created:', !!server);