import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

async function checkSchema() {
  const client = await pool.connect();
  try {
    // Check illustrations table columns
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'illustrations'
      ORDER BY ordinal_position;
    `);
    
    console.log('Illustrations table columns:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
    });
    
    // Check if illustration_sessions table exists
    const sessionTableResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'illustration_sessions'
      );
    `);
    
    console.log('\nIllustration_sessions table exists:', sessionTableResult.rows[0].exists);
    
    // Check migrations table
    const migrationsResult = await client.query(`
      SELECT filename, executed_at 
      FROM migrations 
      ORDER BY executed_at DESC
      LIMIT 5;
    `).catch(() => ({ rows: [] }));
    
    if (migrationsResult.rows.length > 0) {
      console.log('\nRecent migrations:');
      migrationsResult.rows.forEach(row => {
        console.log(`  - ${row.filename} (${new Date(row.executed_at).toLocaleString()})`);
      });
    } else {
      console.log('\nNo migrations table found or no migrations executed');
    }
    
  } finally {
    client.release();
    await pool.end();
  }
}

checkSchema().catch(console.error);