import dotenv from 'dotenv';

dotenv.config();

/**
 * Application configuration
 * Centralizes all environment variables and constants
 */
export const config = {
  port: process.env.PORT || 3001,
  
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: 'gemini-2.5-pro',
  
  dbPath: process.env.DB_PATH || './data/healthchat.db',
};

