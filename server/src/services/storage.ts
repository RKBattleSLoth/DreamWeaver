import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage configuration
const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local';
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const BASE_URL = process.env.APP_URL || 'http://localhost:3000';

// Ensure upload directory exists
async function ensureUploadDir(subdir?: string) {
  const uploadPath = path.join(__dirname, '../../..', UPLOAD_DIR, subdir || '');
  await fs.mkdir(uploadPath, { recursive: true });
  return uploadPath;
}

// Generate unique filename
function generateUniqueFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  return `${timestamp}-${random}${ext}`;
}

export interface StorageResult {
  filePath: string;
  publicUrl: string;
  storageType: string;
  fileSize: number;
  mimeType: string;
}

// Upload file to storage
export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  userId: string,
  subdir: string = 'illustrations'
): Promise<StorageResult> {
  switch (STORAGE_TYPE) {
    case 'local':
      return uploadToLocal(buffer, originalName, mimeType, userId, subdir);
    case 's3':
      return uploadToS3(buffer, originalName, mimeType, userId, subdir);
    case 'cloudinary':
      return uploadToCloudinary(buffer, originalName, mimeType, userId, subdir);
    default:
      return uploadToLocal(buffer, originalName, mimeType, userId, subdir);
  }
}

// Local storage implementation
async function uploadToLocal(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  userId: string,
  subdir: string
): Promise<StorageResult> {
  const userDir = path.join(subdir, userId);
  const uploadPath = await ensureUploadDir(userDir);
  const filename = generateUniqueFilename(originalName);
  const filePath = path.join(uploadPath, filename);
  const relativePath = path.join(UPLOAD_DIR, userDir, filename);
  
  await fs.writeFile(filePath, buffer);
  
  return {
    filePath: relativePath,
    publicUrl: `${BASE_URL}/uploads/${userDir}/${filename}`,
    storageType: 'local',
    fileSize: buffer.length,
    mimeType
  };
}

// S3 storage implementation (placeholder)
async function uploadToS3(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  userId: string,
  subdir: string
): Promise<StorageResult> {
  // TODO: Implement S3 upload using AWS SDK
  // For now, fallback to local storage
  console.warn('S3 storage not implemented, falling back to local storage');
  return uploadToLocal(buffer, originalName, mimeType, userId, subdir);
}

// Cloudinary storage implementation (placeholder)
async function uploadToCloudinary(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  userId: string,
  subdir: string
): Promise<StorageResult> {
  // TODO: Implement Cloudinary upload
  // For now, fallback to local storage
  console.warn('Cloudinary storage not implemented, falling back to local storage');
  return uploadToLocal(buffer, originalName, mimeType, userId, subdir);
}

// Delete file from storage
export async function deleteFile(filePath: string, storageType?: string): Promise<void> {
  const storage = storageType || STORAGE_TYPE;
  
  switch (storage) {
    case 'local':
      await deleteFromLocal(filePath);
      break;
    case 's3':
      await deleteFromS3(filePath);
      break;
    case 'cloudinary':
      await deleteFromCloudinary(filePath);
      break;
    default:
      await deleteFromLocal(filePath);
  }
}

// Delete from local storage
async function deleteFromLocal(filePath: string): Promise<void> {
  const fullPath = path.join(__dirname, '../../..', filePath);
  try {
    await fs.unlink(fullPath);
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
    // File doesn't exist, that's okay
  }
}

// Delete from S3 (placeholder)
async function deleteFromS3(filePath: string): Promise<void> {
  // TODO: Implement S3 delete
  console.warn('S3 delete not implemented');
}

// Delete from Cloudinary (placeholder)
async function deleteFromCloudinary(filePath: string): Promise<void> {
  // TODO: Implement Cloudinary delete
  console.warn('Cloudinary delete not implemented');
}

// Get file from storage
export async function getFile(filePath: string, storageType?: string): Promise<Buffer> {
  const storage = storageType || STORAGE_TYPE;
  
  switch (storage) {
    case 'local':
      return getFromLocal(filePath);
    case 's3':
      return getFromS3(filePath);
    case 'cloudinary':
      // Cloudinary serves files via URL, not direct file access
      throw new Error('Use public URL for Cloudinary files');
    default:
      return getFromLocal(filePath);
  }
}

// Get from local storage
async function getFromLocal(filePath: string): Promise<Buffer> {
  const fullPath = path.join(__dirname, '../../..', filePath);
  return fs.readFile(fullPath);
}

// Get from S3 (placeholder)
async function getFromS3(filePath: string): Promise<Buffer> {
  // TODO: Implement S3 get
  throw new Error('S3 get not implemented');
}