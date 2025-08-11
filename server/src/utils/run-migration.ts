#!/usr/bin/env tsx
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Pool } = pg;

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  const envPath = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '.env.local');
  try {
    const envFile = readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key] = value;
      }
    });
  } catch (error) {
    console.log('No .env.local file found, using environment variables');
  }
}

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('Usage: tsx run-migration.ts <migration-file>');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  });

  try {
    console.log('🚀 Running migration:', migrationFile);
    
    const migrationPath = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'migrations', migrationFile);
    const migrationSql = readFileSync(migrationPath, 'utf8');
    
    console.log('📝 Executing SQL...');
    await pool.query(migrationSql);
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();