import { detectIntent, processAIRequest } from './ai.service.js';
import { 
  buildIntentDetectionPrompt,
  buildDiseaseInformationPrompt,
  buildConversationalResponsePrompt,
  getFallbackResponse,
  getDownloadReportResponse 
} from '../utils/prompts.js';
import { hasValidGrounding, parseAIResponse } from '../utils/responseParser.js';
import { 
  createConversation,
  ensureConversationExists,
  saveUserMessage,
  saveAssistantMessage,
  getConversationHistory,
  getConversationUserDetails
} from '../db/models/conversation.model.js';
import { config } from '../utils/config.js';
import { logInfo, logError, logDebug, logWarn } from '../utils/logger.js';


/**
 * Processes a conversational chat request and returns AI-generated response
 * @param {string} userMessage - User message
 * @param {string|null} conversationId - Existing conversation ID (optional)
 * @param {Object|null} userDetails - Optional user details (name, age, gender)
 * @returns {Promise<{conversation_id: string, response: Object}>} Conversation ID and structured AI response
 * @throws {Error} If processing fails
 */
export async function processChatRequest(userMessage, conversationId = null, userDetails = null) {
  logInfo('Processing chat request', { 
    hasConversationId: !!conversationId,
    hasUserDetails: !!userDetails,
    messageLength: userMessage.length 
  });

  let currentConversationId = conversationId;
  if (!currentConversationId) {
    logDebug('Creating new conversation', { hasUserDetails: !!userDetails });
    currentConversationId = await createConversation(userDetails);
    logInfo('New conversation created', { conversationId: currentConversationId });
  } else {
    logDebug('Using existing conversation', { conversationId: currentConversationId });
    await ensureConversationExists(currentConversationId);
  }

  const conversationUserDetails = await getConversationUserDetails(currentConversationId);

  const history = await getConversationHistory(currentConversationId, 20);
  logDebug('Conversation history fetched', { 
    conversationId: currentConversationId,
    historyLength: history.length 
  });

  let detectedIntent = 'disease_information';
  let intentReasoning = '';
  try {
    logDebug('Detecting user intent', { conversationId: currentConversationId });
    const intentPrompt = buildIntentDetectionPrompt(userMessage, history);
    const intentResult = await detectIntent(intentPrompt, config.geminiApiKey, userMessage, history);
    
    try {
      const intentData = parseAIResponse(intentResult.text);
      detectedIntent = intentData.intent || 'disease_information';
      intentReasoning = intentData.reasoning || '';
      logInfo('Intent detected', { 
        conversationId: currentConversationId,
        intent: detectedIntent,
        reasoning: intentReasoning 
      });
    } catch (parseError) {
      logWarn('Failed to parse intent response, using default', { 
        conversationId: currentConversationId,
        error: parseError.message 
      });
      detectedIntent = 'disease_information';
    }
  } catch (error) {
    logError('Error detecting intent', error, { conversationId: currentConversationId });
    detectedIntent = 'disease_information';
  }

  await saveUserMessage(currentConversationId, userMessage, detectedIntent);
  logDebug('User message saved with intent', { 
    conversationId: currentConversationId,
    intent: detectedIntent 
  });

  if (detectedIntent === 'download_report') {
    logInfo('Download report requested', { conversationId: currentConversationId });
    const downloadResponse = getDownloadReportResponse();
    await saveAssistantMessage(currentConversationId, JSON.stringify(downloadResponse), 'download_report');
    return {
      conversation_id: currentConversationId,
      response: downloadResponse
    };
  }

  let responsePrompt;
  let responseType;

  if (detectedIntent === 'disease_information' || detectedIntent === 'new_topic') {
    responsePrompt = buildDiseaseInformationPrompt(userMessage, conversationUserDetails);
    responseType = 'disease_information';
  } else {
    responsePrompt = buildConversationalResponsePrompt(userMessage, detectedIntent, conversationUserDetails);
    responseType = 'conversational';
  }

  logDebug('Generating response', { 
    conversationId: currentConversationId,
    intent: detectedIntent,
    responseType 
  });

  let aiResponse;
  try {
    const result = await processAIRequest(
      responsePrompt, 
      config.geminiApiKey, 
      history, 
      detectedIntent
    );

    if (!hasValidGrounding(result.groundingMetadata)) {
      logWarn('Invalid or missing grounding metadata', { conversationId: currentConversationId });
      aiResponse = getFallbackResponse(userMessage);
      responseType = 'fallback';
    } else {
      logDebug('Valid grounding metadata received');
      try {
        aiResponse = parseAIResponse(result.text);
        logDebug('AI response parsed successfully');
        
        if (responseType === 'disease_information') {
          const filteredResponse = {};
          if (aiResponse.disease) filteredResponse.disease = aiResponse.disease;
          if (aiResponse.description) filteredResponse.description = aiResponse.description;
          if (aiResponse.causes) filteredResponse.causes = aiResponse.causes;
          if (aiResponse.commonly_used_medicines) filteredResponse.commonly_used_medicines = aiResponse.commonly_used_medicines;
          aiResponse = filteredResponse;
          logDebug('Response filtered to include only required fields');
        } else {
          const filteredResponse = {};
          if (aiResponse.response) filteredResponse.response = aiResponse.response;
          if (aiResponse.sources_Link) {
            delete aiResponse.sources_Link;
          }
          aiResponse = filteredResponse;
          logDebug('Conversational response filtered - sources removed');
        }
      } catch (parseError) {
        logError('Error parsing AI response', parseError, { conversationId: currentConversationId });
        aiResponse = getFallbackResponse(userMessage);
        responseType = 'fallback';
      }
    }
  } catch (error) {
    logError('Error processing AI request', error, { conversationId: currentConversationId });
    aiResponse = getFallbackResponse(userMessage);
    responseType = 'fallback';
  }

  await saveAssistantMessage(currentConversationId, JSON.stringify(aiResponse), responseType);
  logInfo('Chat request processed successfully', { 
    conversationId: currentConversationId,
    intent: detectedIntent,
    responseType,
    hasDisease: !!aiResponse.disease
  });

  return {
    conversation_id: currentConversationId,
    response: aiResponse
  };
}

