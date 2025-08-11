const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Starting migration 004_comprehensive_indexing_and_linking.sql...');
    
    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', '004_comprehensive_indexing_and_linking.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the entire migration as a transaction
    await client.query('BEGIN');
    
    try {
      await client.query(migration);
      await client.query('COMMIT');
      console.log('\nMigration completed successfully!');
      
      // Refresh materialized view
      console.log('Refreshing materialized view...');
      await client.query('REFRESH MATERIALIZED VIEW story_statistics');
      console.log('Materialized view refreshed.');
      
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Migration failed, rolled back:', err.message);
      throw err;
    }
    
    // Show some statistics
    const indexCount = await client.query(`
      SELECT COUNT(*) as count 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND tablename IN ('stories', 'illustrations', 'story_illustration_links')
    `);
    
    console.log(`\nTotal indexes created: ${indexCount.rows[0].count}`);
    
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();