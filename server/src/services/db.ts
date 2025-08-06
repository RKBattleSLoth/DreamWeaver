// Database abstraction layer
// This module exports the appropriate database implementation based on configuration

import * as postgresDb from './postgres-database.js';

// Always use PostgreSQL for Railway deployment
const usePostgres = true;

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
} = postgresDb;

// Export database-specific utilities
export const checkDatabaseConnection = postgresDb.checkDatabaseConnection;
export const closeDatabaseConnection = postgresDb.closeDatabaseConnection;

// Log which database is being used
console.log('Using PostgreSQL database');