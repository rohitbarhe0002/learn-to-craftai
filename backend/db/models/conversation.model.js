import { 
  createConversation as dbCreateConversation,
  saveMessage as dbSaveMessage,
  getConversationHistory as dbGetConversationHistory,
  getConversationUserDetails as dbGetConversationUserDetails,
  getAllConversations as dbGetAllConversations,
  getConversationWithMessages as dbGetConversationWithMessages,
  deleteConversation as dbDeleteConversation
} from '../database.js';
import { randomUUID } from 'crypto';



/**
 * Creates a new conversation and returns its ID
 * @param {Object} userDetails - Optional user details (name, age, gender)
 * @returns {Promise<string>} Conversation ID
 */
export async function createConversation(userDetails = null) {
  const conversationId = randomUUID();
  await dbCreateConversation(conversationId, userDetails);
  return conversationId;
}

/**
 * Ensures a conversation exists (creates if it doesn't)
 * @param {string} conversationId - Conversation ID to ensure exists
 * @param {Object} userDetails - Optional user details (name, age, gender)
 * @returns {Promise<void>}
 */
export async function ensureConversationExists(conversationId, userDetails = null) {
  await dbCreateConversation(conversationId, userDetails);
}

/**
 * Gets user details for a conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object|null>} User details or null
 */
export async function getConversationUserDetails(conversationId) {
  return dbGetConversationUserDetails(conversationId);
}

/**
 * Saves a user message to the database
 * @param {string} conversationId - Conversation ID
 * @param {string} content - Message content
 * @param {string} intent - Detected intent (optional)
 * @returns {Promise<void>}
 */
export async function saveUserMessage(conversationId, content, intent = null) {
  return dbSaveMessage(conversationId, 'user', content, intent, null);
}

/**
 * Saves an assistant message to the database 
 * @param {string} conversationId - Conversation ID
 * @param {string} content - Message content
 * @param {string} responseType - Response type (optional)
 * @returns {Promise<void>}
 */
export async function saveAssistantMessage(conversationId, content, responseType = null) {
  return dbSaveMessage(conversationId, 'model', content, null, responseType);
}

/**
 * Retrieves conversation history
 * @param {string} conversationId - Conversation ID
 * @param {number} limit - Maximum number of messages (default: 20)
 * @returns {Promise<Array<{role: string, content: string}>>} Conversation history
 */
export async function getConversationHistory(conversationId, limit = 20) {
  return dbGetConversationHistory(conversationId, limit);
}

/**
 * Gets all conversations with their titles
 * @param {number} limit - Maximum number of conversations (default: 50)
 * @returns {Promise<Array<{id: string, title: string, created_at: string}>>} List of conversations
 */
export async function getAllConversations(limit = 50) {
  return dbGetAllConversations(limit);
}

/**
 * Gets a conversation with all its messages
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object|null>} Conversation with messages or null
 */
export async function getConversationWithMessages(conversationId) {
  return dbGetConversationWithMessages(conversationId);
}

/**
 * Deletes a conversation and all its messages
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<boolean>} True if deleted
 */
export async function deleteConversation(conversationId) {
  return dbDeleteConversation(conversationId);
}

