import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

console.log('Testing direct DB connection...');
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

try {
  console.log('Attempting connection...');
  const client = await pool.connect();
  console.log('✅ Database connected successfully');
  
  // Test a simple query
  const result = await client.query('SELECT NOW()');
  console.log('✅ Query executed:', result.rows[0]);
  
  client.release();
  await pool.end();
  console.log('✅ Connection closed cleanly');
} catch (error) {
  console.error('❌ Database connection failed:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}