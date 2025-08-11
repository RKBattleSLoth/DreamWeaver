#!/usr/bin/env node

// Test script to verify credentials are properly set
import 'dotenv/config';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local if it exists
const envLocalPath = resolve(__dirname, '.env.local');
if (fs.existsSync(envLocalPath)) {
  config({ path: envLocalPath });
}

console.log('🔍 Checking DreamWeaver Credentials...\n');

const checks = {
  DATABASE_URL: {
    present: !!process.env.DATABASE_URL,
    valid: process.env.DATABASE_URL?.startsWith('postgresql://'),
    message: 'PostgreSQL connection string from Railway'
  },
  OPENROUTER_API_KEY: {
    present: !!process.env.OPENROUTER_API_KEY,
    valid: process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'sk-or-v1-your-openrouter-api-key' && process.env.OPENROUTER_API_KEY.length > 10,
    message: 'OpenRouter API key for AI models'
  },
  PORT: {
    present: true,
    valid: true,
    value: process.env.PORT || '3000',
    message: 'Server port'
  },
  STORAGE_TYPE: {
    present: true,
    valid: true,
    value: process.env.STORAGE_TYPE || 'local',
    message: 'Storage type (local/cloud)'
  }
};

let allValid = true;

Object.entries(checks).forEach(([key, check]) => {
  if (!check.present) {
    console.log(`❌ ${key}: Missing - ${check.message}`);
    allValid = false;
  } else if (!check.valid) {
    console.log(`⚠️  ${key}: Present but may be invalid - ${check.message}`);
    allValid = false;
  } else {
    console.log(`✅ ${key}: ${check.value || 'Set'} - ${check.message}`);
  }
});

console.log('\n📁 Storage Directory Check:');
const storageDir = './storage';
if (fs.existsSync(storageDir)) {
  console.log('✅ Storage directory exists');
  const subdirs = ['stories', 'illustrations', 'profiles', 'temp'];
  subdirs.forEach(dir => {
    if (fs.existsSync(`${storageDir}/${dir}`)) {
      console.log(`  ✅ ${dir}/`);
    } else {
      console.log(`  ❌ ${dir}/ (missing)`);
      allValid = false;
    }
  });
} else {
  console.log('❌ Storage directory missing');
  allValid = false;
}

if (allValid) {
  console.log('\n✨ All credentials and directories are properly configured!');
  console.log('You can now run: npm run dev');
} else {
  console.log('\n⚠️  Some configuration is missing. Please:');
  console.log('1. Update .env.local with missing credentials');
  console.log('2. Run ./setup-local-dev.sh to create directories');
  process.exit(1);
}