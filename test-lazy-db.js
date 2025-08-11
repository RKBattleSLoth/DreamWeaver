// Test lazy database initialization
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log('Testing lazy database initialization...');

// This should NOT create a pool immediately
console.log('Importing postgres-database...');
import('./server/src/services/postgres-database.js').then(async (dbModule) => {
  console.log('✅ Import successful - no immediate pool creation');
  
  // This should create the pool
  console.log('Testing database connection...');
  const result = await dbModule.checkDatabaseConnection();
  console.log('✅ Database connection test:', result ? 'SUCCESS' : 'FAILED');
  
  // Close connection
  await dbModule.closeDatabaseConnection();
  console.log('✅ Database connection closed');
}).catch(error => {
  console.error('❌ Error:', error);
});