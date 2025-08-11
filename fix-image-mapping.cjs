const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fixImageMapping() {
  try {
    const client = await pool.connect();
    
    // Get all actual files and parse their information
    const storageDir = '/Users/edwardbeshers/dreamweaver/railway/DreamWeaver/server/storage/illustrations/';
    const files = fs.readdirSync(storageDir)
      .filter(f => f.endsWith('.png') && !f.includes('.meta'))
      .map(filename => {
        // Parse the filename format: timestamp-hash-originalname
        const parts = filename.split('-');
        if (parts.length >= 3) {
          const timestamp = parts[0];
          const hash = parts[1];
          const originalName = parts.slice(2).join('-');
          
          // Extract session info from original name
          const sessionMatch = originalName.match(/session_([^_]+)_r(\d+)_v(\d+)/);
          if (sessionMatch) {
            return {
              filename,
              timestamp: parseInt(timestamp),
              hash,
              originalName,
              sessionId: sessionMatch[1],
              round: parseInt(sessionMatch[2]),
              variation: parseInt(sessionMatch[3])
            };
          }
        }
        return null;
      })
      .filter(Boolean);
    
    console.log(`Parsed ${files.length} image files with session info`);
    
    // Get all illustrations from database with their session and timing info
    const result = await client.query(`
      SELECT id, image_path, session_id, iteration_round, created_at, generation_batch_id
      FROM illustrations 
      WHERE image_path LIKE '%session_%'
      ORDER BY created_at
    `);
    
    console.log(`Found ${result.rows.length} database records to map`);
    
    let mappedCount = 0;
    let unmappedCount = 0;
    
    for (const record of result.rows) {
      let bestMatch = null;
      
      // If we have session_id, try to match by session
      if (record.session_id) {
        const sessionMatches = files.filter(f => f.sessionId === record.session_id);
        
        if (sessionMatches.length > 0) {
          // If we have round info, match by round and variation
          if (record.iteration_round) {
            const roundMatches = sessionMatches.filter(f => f.round === record.iteration_round);
            if (roundMatches.length > 0) {
              // Sort by timestamp and pick the appropriate variation
              roundMatches.sort((a, b) => a.timestamp - b.timestamp);
              bestMatch = roundMatches[0]; // Take first one for this round
              
              // Remove from available files to avoid double-mapping
              const index = files.indexOf(bestMatch);
              if (index > -1) files.splice(index, 1);
            }
          } else {
            // No round info, pick the first session match
            bestMatch = sessionMatches[0];
            const index = files.indexOf(bestMatch);
            if (index > -1) files.splice(index, 1);
          }
        }
      }
      
      // If no session match, try to match by timestamp proximity to created_at
      if (!bestMatch && record.created_at) {
        const createdTime = new Date(record.created_at).getTime();
        
        // Find files with timestamps within 10 seconds of creation time
        const timeMatches = files.filter(f => {
          const timeDiff = Math.abs(f.timestamp - createdTime);
          return timeDiff < 10000; // 10 seconds tolerance
        });
        
        if (timeMatches.length > 0) {
          // Sort by closest timestamp
          timeMatches.sort((a, b) => {
            const diffA = Math.abs(a.timestamp - createdTime);
            const diffB = Math.abs(b.timestamp - createdTime);
            return diffA - diffB;
          });
          
          bestMatch = timeMatches[0];
          const index = files.indexOf(bestMatch);
          if (index > -1) files.splice(index, 1);
        }
      }
      
      // Update database record with correct mapping
      if (bestMatch) {
        console.log(`Mapping ${record.id}: ${record.image_path} -> ${bestMatch.filename}`);
        await client.query('UPDATE illustrations SET image_path = $1 WHERE id = $2', [bestMatch.filename, record.id]);
        mappedCount++;
      } else {
        console.log(`No match found for ${record.id}: ${record.image_path}`);
        unmappedCount++;
      }
    }
    
    console.log(`\nMapping complete:`);
    console.log(`- Successfully mapped: ${mappedCount}`);
    console.log(`- Could not map: ${unmappedCount}`);
    console.log(`- Remaining unused files: ${files.length}`);
    
    client.release();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

fixImageMapping();