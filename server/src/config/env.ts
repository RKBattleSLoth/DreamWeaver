// Load environment variables - Railway provides them directly, local dev needs .env.local
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// In development, load .env.local or .env.railway
if (process.env.NODE_ENV !== 'production') {
  const envLocalPath = path.resolve(__dirname, '../../../.env.local');
  const envRailwayPath = path.resolve(__dirname, '../../../.env.railway');
  
  if (fs.existsSync(envLocalPath)) {
    console.log('Loading environment variables from .env.local for development');
    config({ path: envLocalPath });
  } else if (fs.existsSync(envRailwayPath)) {
    console.log('Loading environment variables from .env.railway for development');
    config({ path: envRailwayPath });
  } else {
    console.log('No .env.local or .env.railway found - using system environment variables');
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