// Database connection check utility
import { config } from '../../config.js';
import { checkDatabaseConnection } from '../services/db.js';

async function checkDb() {
  console.log('🔍 Checking database connection...\n');
  
  console.log('Configuration:');
  console.log(`- Environment: ${config.NODE_ENV}`);
  console.log(`- Database URL: ${config.DATABASE_URL ? '✓ Found' : '✗ Missing'}`);
  console.log(`- Supabase URL: ${config.SUPABASE_URL ? '✓ Found' : '✗ Missing'}`);
  console.log(`- Storage Type: ${config.STORAGE_TYPE}`);
  console.log('');
  
  const isConnected = await checkDatabaseConnection();
  
  if (isConnected) {
    console.log('✅ Database connection successful!');
  } else {
    console.log('❌ Database connection failed!');
    console.log('\nPlease check:');
    console.log('1. DATABASE_URL is correctly set in .env.local');
    console.log('2. Supabase project is active');
    console.log('3. Network connectivity to database');
  }
  
  process.exit(isConnected ? 0 : 1);
}

checkDb().catch(console.error);