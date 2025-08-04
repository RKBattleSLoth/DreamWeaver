import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from the root .env file
const envPath = resolve(process.cwd(), '..', '.env');
console.log('Loading .env from:', envPath);

const result = config({ path: envPath });

if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('.env file loaded successfully');
}

// Also try loading from current directory as fallback
config();

export {};