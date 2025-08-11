const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fixRemainingMappings() {
  try {
    const client = await pool.connect();
    
    // Get unmapped records (still pointing to the same file)
    const unmappedResult = await client.query(`
      SELECT id, image_path, created_at 
      FROM illustrations 
      WHERE image_path = '1754684056601-d9dfcf2d845264c4df1b29eee4e3360a-session_26af7d3f-025d-4589-a2b3-1b9644f283bb_r1_v1_1754684056600.png'
      ORDER BY created_at
    `);
    
    console.log(`Found ${unmappedResult.rows.length} unmapped records`);
    
    // Get remaining unused files
    const storageDir = '/Users/edwardbeshers/dreamweaver/railway/DreamWeaver/server/storage/illustrations/';
    const allFiles = fs.readdirSync(storageDir).filter(f => f.endsWith('.png') && !f.includes('.meta'));
    
    // Get currently used files
    const usedResult = await client.query(`
      SELECT DISTINCT image_path 
      FROM illustrations 
      WHERE image_path != '1754684056601-d9dfcf2d845264c4df1b29eee4e3360a-session_26af7d3f-025d-4589-a2b3-1b9644f283bb_r1_v1_1754684056600.png'
    `);
    
    const usedFiles = new Set(usedResult.rows.map(row => row.image_path));
    const unusedFiles = allFiles.filter(f => !usedFiles.has(f));
    
    console.log(`Found ${unusedFiles.length} unused files:`, unusedFiles);
    
    // Map the unmapped records to unused files
    for (let i = 0; i < Math.min(unmappedResult.rows.length, unusedFiles.length); i++) {
      const record = unmappedResult.rows[i];
      const file = unusedFiles[i];
      
      console.log(`Mapping ${record.id} -> ${file}`);
      await client.query('UPDATE illustrations SET image_path = $1 WHERE id = $2', [file, record.id]);
    }
    
    // Check final state
    const finalCheck = await client.query(`
      SELECT COUNT(DISTINCT image_path) as unique_paths, COUNT(*) as total_records
      FROM illustrations
    `);
    
    console.log(`\\nFinal state: ${finalCheck.rows[0].unique_paths} unique images for ${finalCheck.rows[0].total_records} records`);
    
    client.release();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

fixRemainingMappings();