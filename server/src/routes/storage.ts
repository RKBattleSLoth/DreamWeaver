// Storage route handler for local development
// Serves files from local storage when using local storage adapter

import { Router } from 'express';
import path from 'path';
import { devConfig } from '../config/dev-config.js';
import { fileStorage } from '../services/file-storage.js';

const router = Router();

// Only enable local file serving in development with local storage
if (process.env.NODE_ENV === 'development' && devConfig.storage.type === 'local') {
  // Serve files from local storage
  router.get('/storage/:bucket/*', async (req, res) => {
    try {
      const { bucket } = req.params;
      const filePath = req.params[0]; // Everything after the bucket
      
      const data = await fileStorage.download(bucket, filePath);
      
      if (!data) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      // Determine content type based on file extension
      const ext = path.extname(filePath).toLowerCase();
      const contentTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.json': 'application/json',
        '.txt': 'text/plain',
      };
      
      const contentType = contentTypes[ext] || 'application/octet-stream';
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.send(data);
    } catch (error) {
      console.error('Storage route error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}

export default router;