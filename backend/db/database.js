import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { config } from '../utils/config.js';
import { logInfo, logError, logDebug } from '../utils/logger.js';

// Get project root directory (one level up from db/)
const PROJECT_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Database connection instance
 * Singleton pattern for database access
 */
let db = null;

/**
 * Initializes SQLite database connection and creates tables
 * Must be called before any database operations
 * @returns {Promise<void>}
 */
export async function initDatabase() {
  return new Promise((resolve, reject) => {
    // Resolve database path relative to project root
    const dbPath = config.dbPath.startsWith('./') 
      ? join(PROJECT_ROOT, config.dbPath.replace('./', ''))
      : config.dbPath;
    
    // Ensure directory exists for the database file
    const dbDir = dirname(dbPath);
    if (dbDir !== '.' && !existsSync(dbDir)) {
      try {
        mkdirSync(dbDir, { recursive: true });
      } catch (mkdirErr) {
        logError('Error creating database directory', mkdirErr, { dbDir });
        reject(mkdirErr);
        return;
      }
    }
    
    logInfo('Initializing database', { dbPath });
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        logError('Error opening database', err, { dbPath });
        reject(err);
        return;
      }

      // Create conversations table
      db.run(`
        CREATE TABLE IF NOT EXISTS conversations (
          id TEXT PRIMARY KEY,
          name TEXT,
          age INTEGER,
          gender TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          logError('Error creating conversations table', err);
          reject(err);
          return;
        }
        logDebug('Conversations table created');

        // Create messages table
        db.run(`
          CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            intent TEXT,
            response_type TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (conversation_id) REFERENCES conversations(id)
          )
        `, (err) => {
          if (err) {
            logError('Error creating messages table', err);
            reject(err);
            return;
          }
          logDebug('Messages table created');

          // Create index for faster queries
          db.run(`
            CREATE INDEX IF NOT EXISTS idx_messages_conversation_id 
            ON messages(conversation_id, created_at)
          `, (err) => {
            if (err) {
              logError('Error creating index', err);
              reject(err);
              return;
            }
            logDebug('Index created');
            logInfo('Database initialized successfully', { dbPath });
            resolve();
          });
        });
      });
    });
  });
}

/**
 * Creates a new conversation in the database
 * @param {string} conversationId - Unique conversation ID
 * @param {Object} userDetails - Optional user details (name, age, gender)
 * @returns {Promise<void>}
 */
export async function createConversation(conversationId, userDetails = null) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    if (userDetails && (userDetails.name || userDetails.age || userDetails.gender)) {
      // Create conversation with user details
      db.run(
        `INSERT OR IGNORE INTO conversations (id, name, age, gender) VALUES (?, ?, ?, ?)`,
        [
          conversationId,
          userDetails.name || null,
          userDetails.age || null,
          userDetails.gender || null
        ],
      (err) => {
        if (err) {
          logError('Error creating conversation', err, { conversationId });
          reject(err);
          return;
        }
        logDebug('Conversation created', { conversationId });
        resolve();
      }
      );
    } else {
      // Create conversation without user details
      db.run(
        `INSERT OR IGNORE INTO conversations (id) VALUES (?)`,
        [conversationId],
      (err) => {
        if (err) {
          logError('Error creating conversation', err, { conversationId });
          reject(err);
          return;
        }
        logDebug('Conversation created', { conversationId });
        resolve();
      }
      );
    }
  });
}

/**
 * Gets user details for a conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object|null>} User details object or null
 */
export async function getConversationUserDetails(conversationId) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    db.get(
      `SELECT name, age, gender FROM conversations WHERE id = ?`,
      [conversationId],
      (err, row) => {
        if (err) {
          logError('Error fetching conversation user details', err, { conversationId });
          reject(err);
          return;
        }
        if (row && (row.name || row.age || row.gender)) {
          resolve({
            name: row.name || null,
            age: row.age || null,
            gender: row.gender || null
          });
        } else {
          resolve(null);
        }
      }
    );
  });
}

/**
 * Saves a message to the database
 * @param {string} conversationId - Conversation ID
 * @param {string} role - Message role ('user' or 'model')
 * @param {string} content - Message content
 * @param {string} intent - User intent (optional, for user messages)
 * @param {string} responseType - Response type (optional, for model messages)
 * @returns {Promise<void>}
 */
export async function saveMessage(conversationId, role, content, intent = null, responseType = null) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    db.run(
      `INSERT INTO messages (conversation_id, role, content, intent, response_type) VALUES (?, ?, ?, ?, ?)`,
      [conversationId, role, content, intent, responseType],
      (err) => {
        if (err) {
          logError('Error saving message', err, { conversationId, role, intent, responseType });
          reject(err);
          return;
        }
        resolve();
      }
    );
  });
}

/**
 * Retrieves conversation history (last N messages)
 * @param {string} conversationId - Conversation ID
 * @param {number} limit - Maximum number of messages to retrieve (default: 20)
 * @returns {Promise<Array<{role: string, content: string}>>} Array of messages
 */
export async function getConversationHistory(conversationId, limit = 20) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    db.all(
      `SELECT role, content, intent, response_type FROM messages 
       WHERE conversation_id = ? 
       ORDER BY created_at ASC 
       LIMIT ?`,
      [conversationId, limit],
      (err, rows) => {
        if (err) {
          logError('Error fetching conversation history', err, { conversationId, limit });
          reject(err);
          return;
        }
        resolve(rows || []);
      }
    );
  });
}

