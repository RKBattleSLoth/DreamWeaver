// Database abstraction layer
// This module exports the appropriate database implementation based on configuration

import * as supabaseDb from './database.js';
import * as postgresDb from './postgres-database.js';

// Determine which database to use based on environment variable
const usePostgres = process.env.USE_POSTGRES === 'true' || !process.env.SUPABASE_URL;

// Export the appropriate database implementation
export const {
  createUser,
  getUserByEmail,
  getUserById,
  getChildProfilesByUserId,
  createChildProfile,
  updateChildProfile,
  deleteChildProfile,
  setActiveChildProfile,
  getActiveChildProfile,
  getStoriesByUserId,
  createStory,
  getStoryById,
  updateStory,
  deleteStory,
  getIllustrationsByUserId,
  createIllustration,
  getIllustrationById,
  updateIllustration,
  deleteIllustration,
  linkIllustrationToStory,
  unlinkIllustrationFromStory,
  getStoryIllustrations
} = usePostgres ? postgresDb : supabaseDb;

// Export database-specific utilities
export const checkDatabaseConnection = usePostgres 
  ? postgresDb.checkDatabaseConnection 
  : async () => {
      try {
        // For Supabase, just check if the client is configured
        return !!supabaseDb.supabase;
      } catch {
        return false;
      }
    };

export const closeDatabaseConnection = usePostgres
  ? postgresDb.closeDatabaseConnection
  : async () => {
      // Supabase client doesn't need explicit closing
      return Promise.resolve();
    };

// Log which database is being used
console.log(`Using ${usePostgres ? 'PostgreSQL' : 'Supabase'} database`);