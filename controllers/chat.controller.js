import { processChatRequest } from '../services/chat.service.js';
import { validateChatRequest, normalizeUserInput } from '../utils/validators.js';
import { config } from '../utils/config.js';
import { logInfo, logError, logWarn } from '../utils/logger.js';
import { routeHandler } from '../utils/errorHandler.js';

/**
 * Chat Controller
 * Handles HTTP request/response for chat endpoints
 * Validates input and delegates business logic to services
 */

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

  // Normalize user input
  const { message, conversation_id, userDetails } = normalizeUserInput(req.body);

  // Process chat request
  const result = await processChatRequest(message, conversation_id, userDetails);

  logInfo('Chat request completed successfully', { 
    conversationId: result.conversation_id,
    disease: result.response.disease 
  });

  // Return response with conversation_id
  res.status(200).json({
    conversation_id: result.conversation_id,
    response: result.response
  });
});

