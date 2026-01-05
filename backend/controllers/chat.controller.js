import { processChatRequest } from '../services/chat.service.js';
import { validateChatRequest, normalizeUserInput } from '../utils/validators.js';
import { config } from '../utils/config.js';
import { logInfo, logError, logWarn } from '../utils/logger.js';
import { routeHandler } from '../utils/errorHandler.js';
import { 
  getAllConversations, 
  getConversationWithMessages,
  deleteConversation 
} from '../db/models/conversation.model.js';



/**
 * Handles POST /chat endpoint
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleChatRequest = routeHandler(async (req, res) => {
  logInfo('Chat request received', { 
    method: req.method,
    path: req.path,
    hasConversationId: !!req.body.conversation_id 
  });

  // Validate API key
  if (!config.geminiApiKey) {
    logError('GEMINI_API_KEY not configured');
    return res.status(500).json({
      error: 'GEMINI_API_KEY environment variable is not set',
      code: 'CONFIG_ERROR'
    });
  }

  // Validate input
  const validation = validateChatRequest(req.body);
  if (!validation.valid) {
    logWarn('Invalid chat request', { error: validation.error, body: req.body });
    return res.status(400).json({
      error: validation.error,
      code: 'VALIDATION_ERROR'
    });
  }

  const { message, conversation_id, userDetails } = normalizeUserInput(req.body);
  const result = await processChatRequest(message, conversation_id, userDetails);

  logInfo('Chat request completed successfully', { 
    conversationId: result.conversation_id,
    disease: result.response.disease 
  });

  res.status(200).json({
    conversation_id: result.conversation_id,
    response: result.response
  });
});

/**
 * Handles GET /conversations endpoint - Get all conversations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleGetConversations = routeHandler(async (req, res) => {
  logInfo('Get conversations request received');
  
  const limit = parseInt(req.query.limit) || 50;
  const conversations = await getAllConversations(limit);
  
  logInfo('Conversations fetched successfully', { count: conversations.length });
  
  res.status(200).json({
    conversations
  });
});

/**
 * Handles GET /conversations/:id endpoint - Get a specific conversation with messages
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleGetConversation = routeHandler(async (req, res) => {
  const { id } = req.params;
  logInfo('Get conversation request received', { conversationId: id });
  
  if (!id) {
    logWarn('Missing conversation ID');
    return res.status(400).json({
      error: 'Conversation ID is required',
      code: 'VALIDATION_ERROR'
    });
  }
  
  const conversation = await getConversationWithMessages(id);
  
  if (!conversation) {
    logWarn('Conversation not found', { conversationId: id });
    return res.status(404).json({
      error: 'Conversation not found',
      code: 'NOT_FOUND'
    });
  }
  
  logInfo('Conversation fetched successfully', { 
    conversationId: id,
    messageCount: conversation.messages.length 
  });
  
  res.status(200).json({
    conversation
  });
});

/**
 * Handles DELETE /conversations/:id endpoint - Delete a conversation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleDeleteConversation = routeHandler(async (req, res) => {
  const { id } = req.params;
  logInfo('Delete conversation request received', { conversationId: id });
  
  if (!id) {
    logWarn('Missing conversation ID');
    return res.status(400).json({
      error: 'Conversation ID is required',
      code: 'VALIDATION_ERROR'
    });
  }
  
  const deleted = await deleteConversation(id);
  
  if (!deleted) {
    logWarn('Conversation not found for deletion', { conversationId: id });
    return res.status(404).json({
      error: 'Conversation not found',
      code: 'NOT_FOUND'
    });
  }
  
  logInfo('Conversation deleted successfully', { conversationId: id });
  
  res.status(200).json({
    success: true,
    message: 'Conversation deleted successfully'
  });
});

