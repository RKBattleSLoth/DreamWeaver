// Load environment variables - Railway provides them directly, local dev needs .env.local
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// In development, load .env.local
if (process.env.NODE_ENV !== 'production') {
  const envLocalPath = path.resolve(__dirname, '../../../.env.local');
  if (fs.existsSync(envLocalPath)) {
    console.log('Loading environment variables from .env.local for development');
    config({ path: envLocalPath });
  } else {
    console.log('No .env.local found - using system environment variables');
  }
} else {
  console.log('Environment variables loaded from Railway platform');
}

// List available environment variables for debugging
const dbVars = Object.keys(process.env).filter(key => 
  key.includes('DATABASE') || key.includes('POSTGRES') || key.includes('PG') || key.includes('OPENROUTER') || key.includes('REPLICATE')
);
console.log('Available env vars:', dbVars);

export {};