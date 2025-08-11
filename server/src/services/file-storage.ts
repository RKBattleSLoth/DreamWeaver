// File storage service for handling illustrations and other files
// Uses local storage in development, can be extended for cloud storage in production

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { config } from '../../config.js';

export interface StorageFile {
  name: string;
  id: string;
  path: string;
  size: number;
  mimeType?: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export class FileStorageService {
  private basePath: string;
  private useLocal: boolean;

  constructor() {
    this.useLocal = config.STORAGE_TYPE === 'local';
    this.basePath = path.resolve(config.LOCAL_STORAGE_PATH);
    
    if (this.useLocal) {
      this.initializeLocalStorage();
    }
  }

  private async initializeLocalStorage() {
    const buckets = ['stories', 'illustrations', 'profiles', 'temp'];
    for (const bucket of buckets) {
      await fs.mkdir(path.join(this.basePath, bucket), { recursive: true });
    }
  }

  async upload(
    bucket: string,
    fileName: string,
    data: Buffer | string,
    options?: {
      mimeType?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<StorageFile> {
    const fileId = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const safeFileName = `${timestamp}-${fileId}-${fileName}`;
    
    if (this.useLocal) {
      const filePath = path.join(this.basePath, bucket, safeFileName);
      const dir = path.dirname(filePath);
      
      console.log(`Uploading file to: ${filePath}`);
      
      await fs.mkdir(dir, { recursive: true });
      
      if (typeof data === 'string') {
        await fs.writeFile(filePath, data, 'utf8');
      } else {
        await fs.writeFile(filePath, data);
      }
      
      console.log(`File uploaded successfully: ${filePath}, size: ${Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data)} bytes`);
      
      // Save metadata
      if (options?.metadata) {
        const metaPath = `${filePath}.meta.json`;
        await fs.writeFile(metaPath, JSON.stringify({
          ...options.metadata,
          mimeType: options.mimeType,
          originalName: fileName,
          createdAt: new Date().toISOString(),
        }, null, 2));
      }
      
      return {
        id: fileId,
        name: safeFileName,
        path: `${bucket}/${safeFileName}`,
        size: Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data),
        mimeType: options?.mimeType,
        createdAt: new Date(),
        metadata: options?.metadata,
      };
    } else {
      // TODO: Implement cloud storage upload (e.g., AWS S3, Cloudflare R2)
      throw new Error('Cloud storage not yet implemented');
    }
  }

  async download(bucket: string, fileName: string): Promise<Buffer> {
    if (this.useLocal) {
      const filePath = path.join(this.basePath, bucket, fileName);
      return await fs.readFile(filePath);
    } else {
      // TODO: Implement cloud storage download
      throw new Error('Cloud storage not yet implemented');
    }
  }

  async delete(bucket: string, fileName: string): Promise<void> {
    if (this.useLocal) {
      const filePath = path.join(this.basePath, bucket, fileName);
      await fs.unlink(filePath);
      
      // Try to delete metadata file if it exists
      try {
        await fs.unlink(`${filePath}.meta.json`);
      } catch {}
    } else {
      // TODO: Implement cloud storage delete
      throw new Error('Cloud storage not yet implemented');
    }
  }

  async list(bucket: string, prefix?: string): Promise<StorageFile[]> {
    if (this.useLocal) {
      const bucketPath = path.join(this.basePath, bucket);
      const files: StorageFile[] = [];
      
      try {
        const entries = await fs.readdir(bucketPath);
        
        for (const entry of entries) {
          if (entry.endsWith('.meta.json')) continue;
          
          const filePath = path.join(bucketPath, entry);
          const stats = await fs.stat(filePath);
          
          if (stats.isFile()) {
            if (prefix && !entry.startsWith(prefix)) continue;
            
            // Try to load metadata
            let metadata: any = {};
            try {
              const metaContent = await fs.readFile(`${filePath}.meta.json`, 'utf8');
              metadata = JSON.parse(metaContent);
            } catch {}
            
            files.push({
              id: crypto.createHash('md5').update(entry).digest('hex'),
              name: metadata.originalName || entry,
              path: `${bucket}/${entry}`,
              size: stats.size,
              mimeType: metadata.mimeType,
              createdAt: stats.birthtime,
              metadata: metadata,
            });
          }
        }
      } catch (error) {
        console.error(`Error listing files in bucket ${bucket}:`, error);
      }
      
      return files;
    } else {
      // TODO: Implement cloud storage list
      throw new Error('Cloud storage not yet implemented');
    }
  }

  getPublicUrl(bucket: string, fileName: string): string {
    if (this.useLocal) {
      // For local development, return a URL that the server can handle
      return `/api/storage/${bucket}/${fileName}`;
    } else {
      // TODO: Implement cloud storage public URL
      throw new Error('Cloud storage not yet implemented');
    }
  }
}

// Export singleton instance
export const fileStorage = new FileStorageService();

// Export bucket names for consistency
export const StorageBuckets = {
  STORIES: 'stories',
  ILLUSTRATIONS: 'illustrations',
  PROFILES: 'profiles',
  TEMP: 'temp',
} as const;