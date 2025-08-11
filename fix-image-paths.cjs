const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fixImagePaths() {
  try {
    const client = await pool.connect();
    
    // Get list of all actual files
    const storageDir = '/Users/edwardbeshers/dreamweaver/railway/DreamWeaver/server/storage/illustrations/';
    const files = fs.readdirSync(storageDir).filter(f => f.endsWith('.png') && !f.includes('.meta'));
    
    console.log('Found', files.length, 'image files in storage');
    
    // Get all illustrations with wrong paths
    const result = await client.query('SELECT id, image_path FROM illustrations WHERE image_path LIKE $1', ['session_%']);
    
    console.log('Found', result.rows.length, 'illustrations with incorrect paths');
    
    for (const row of result.rows) {
      const oldPath = row.image_path;
      
      // Find the actual file that ends with this session name
      const matchingFile = files.find(f => f.endsWith(oldPath));
      
      if (matchingFile) {
        console.log(`Updating ${row.id}: ${oldPath} -> ${matchingFile}`);
        await client.query('UPDATE illustrations SET image_path = $1 WHERE id = $2', [matchingFile, row.id]);
      } else {
        console.log(`No file found for ${oldPath}`);
      }
    }
    
    client.release();
    console.log('Path fixing complete');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

fixImagePaths();