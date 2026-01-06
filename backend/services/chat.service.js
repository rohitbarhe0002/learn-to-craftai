import { detectIntent, processAIRequest } from './ai.service.js';
import { 
  buildIntentDetectionPrompt,
  buildDiseaseInformationPrompt,
  buildConversationalResponsePrompt,
  buildGreetingPrompt,
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
import {
  saveConversationLocation,
  getConversationLocation
} from '../db/database.js';

/**
 * Chat Service
 * Business logic for chat operations
 * Orchestrates AI processing, validation, and data persistence
 */

/**
 * Processes a conversational chat request and returns AI-generated response
 * @param {string} userMessage - User message
 * @param {string|null} conversationId - Existing conversation ID (optional)
 * @param {Object|null} userDetails - Optional user details (name, age, gender)
 * @returns {Promise<{conversation_id: string, response: Object}>} Conversation ID and structured AI response
 * @throws {Error} If processing fails
 */
export async function processChatRequest(userMessage, conversationId = null, userDetails = null, location = null) {
  logInfo('Processing chat request', { 
    hasConversationId: !!conversationId,
    hasUserDetails: !!userDetails,
    messageLength: userMessage.length 
  });
  
function hasExplicitInLocation(message) {
  return /\bin\b/i.test(message);
}


let resourceType = 'hospital'
  // Create or use existing conversation
  let currentConversationId = conversationId;
  if (!currentConversationId) {
    logDebug('Creating new conversation', { hasUserDetails: !!userDetails });
    currentConversationId = await createConversation(userDetails);
    logInfo('New conversation created', { conversationId: currentConversationId });
  } else {
    logDebug('Using existing conversation', { conversationId: currentConversationId });
    await ensureConversationExists(currentConversationId);
  }

  // Get user details for the conversation (if they exist)
  const conversationUserDetails = await getConversationUserDetails(currentConversationId);
  // Get stored location for this conversation (if any)
const storedLocation = await getConversationLocation(currentConversationId);
const hasInLocation = hasExplicitInLocation(userMessage);




  // Fetch conversation history (last 20 messages for context)
  const history = await getConversationHistory(currentConversationId, 20);
  logDebug('Conversation history fetched', { 
    conversationId: currentConversationId,
    historyLength: history.length 
  });
// Decide which location to use for this request


  // Step 1: Detect user intent
  let detectedIntent = 'disease_information';
  let intentReasoning = '';
  try {
    logDebug('Detecting user intent', { conversationId: currentConversationId });
    const intentPrompt = buildIntentDetectionPrompt(userMessage, history);
    const intentResult = await detectIntent(intentPrompt, config.geminiApiKey, userMessage, history);

    try {
      const intentData = parseAIResponse(intentResult.text);
       resourceType = intentData.resource_type || 'hospital';
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
  // Save user message with intent
  await saveUserMessage(currentConversationId, userMessage, detectedIntent);
  // ✅ ADD THIS (EXACT PLACE)
if (location && !storedLocation) {
  await saveConversationLocation(currentConversationId, location);
}
  // STEP: Handle hospital intent that requires location
  const effectiveLocation = location || storedLocation;
  
 if (detectedIntent === 'healthcare_location_search') {

  // ✅ STEP 1: Text-based location (e.g. "in Indore")
  if (hasInLocation) {
    const aiPrompt = `
You are a healthcare assistant.

User request:
"${userMessage}"

Task:
Based on the user's request, suggest relevant ${resourceType}s.

Rules:
- Use the location mentioned in the message
- Approximate information only
- No real-time accuracy
- Educational purpose only
- Respond ONLY in valid JSON

FORMAT:
{
  "type": "healthcare_list",
  "resource_type": "${resourceType}",
  "note": "Results are approximate and for informational purposes only.",
  "items": [
    {
      "name": "Name",
      "description": "Short description"
    }
  ]
}
`;

    const aiResult = await processAIRequest(
      aiPrompt,
      config.geminiApiKey,
      [],
      'healthcare_list'
    );

    const aiResponse = parseAIResponse(aiResult.text);

    await saveAssistantMessage(
      currentConversationId,
      JSON.stringify(aiResponse),
      'healthcare_list'
    );

    return {
      conversation_id: currentConversationId,
      response: aiResponse
    };
  }

  // 🟡 STEP 2: Proximity-based request (near me / nearby)
  if (!effectiveLocation) {
    const locationRequestResponse = {
      type: 'LOCATION_REQUIRED',
      message: 'To find nearby healthcare services, please allow location access.'
    };

    await saveAssistantMessage(
      currentConversationId,
      JSON.stringify(locationRequestResponse),
      'location_request'
    );

    return {
      conversation_id: currentConversationId,
      response: locationRequestResponse
    };
  }

  // 🟢 STEP 3: GPS or stored location exists
  const resourceMap = {
    hospital: 'hospitals',
    doctor: 'doctors or clinics',
    pharmacy: 'medical stores or pharmacies'
  };

  const resourceLabel =
    resourceMap[resourceType] || 'healthcare facilities';

  const aiPrompt = `
You are a healthcare assistant.

User approximate location:
Latitude: ${effectiveLocation.lat}
Longitude: ${effectiveLocation.lng}

Task:
List commonly known ${resourceLabel} in this area.

Rules:
- Approximate information only
- No real-time accuracy
- Educational purpose only
- Respond ONLY in valid JSON

FORMAT:
{
  "type": "healthcare_list",
  "resource_type": "${resourceType}",
  "note": "Results are approximate and for informational purposes only.",
  "items": [
    {
      "name": "Name",
      "description": "Short description"
    }
  ]
}
`;

  const aiResult = await processAIRequest(
    aiPrompt,
    config.geminiApiKey,
    [],
    'healthcare_list'
  );

  const aiResponse = parseAIResponse(aiResult.text);

  await saveAssistantMessage(
    currentConversationId,
    JSON.stringify(aiResponse),
    'healthcare_list'
  );

  return {
    conversation_id: currentConversationId,
    response: aiResponse
  };
}


  logDebug('User message saved with intent', { 
    conversationId: currentConversationId,
    intent: detectedIntent 
  });

  // Handle download_report intent immediately (no AI call needed)
  if (detectedIntent === 'download_report') {
    logInfo('Download report requested', { conversationId: currentConversationId });
    const downloadResponse = getDownloadReportResponse();
    await saveAssistantMessage(currentConversationId, JSON.stringify(downloadResponse), 'download_report');
    return {
      conversation_id: currentConversationId,
      response: downloadResponse
    };
  }

  // Step 2: Generate response based on intent
  let responsePrompt;
  let responseType;

  if (detectedIntent === 'greeting') {
    responsePrompt = buildGreetingPrompt(userMessage, conversationUserDetails);
    responseType = 'greeting';
  } else if (detectedIntent === 'disease_information' || detectedIntent === 'new_topic') {
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

  // Process AI request in worker thread with history
  let aiResponse;
  try {
    const result = await processAIRequest(
      responsePrompt, 
      config.geminiApiKey, 
      history, 
      detectedIntent
    );

    const requiresGrounding = responseType !== 'greeting';
    
    if (requiresGrounding && !hasValidGrounding(result.groundingMetadata)) {
      logWarn('Invalid or missing grounding metadata', { conversationId: currentConversationId });
      aiResponse = getFallbackResponse(userMessage);
      responseType = 'fallback';
    } else {
      logDebug(requiresGrounding ? 'Valid grounding metadata received' : 'Grounding skipped for greeting');
      try {
        aiResponse = parseAIResponse(result.text);
        logDebug('AI response parsed successfully');
        
        // Filter response to only include required fields for disease_information
        if (responseType === 'disease_information') {
          const filteredResponse = {};
          if (aiResponse.disease) filteredResponse.disease = aiResponse.disease;
          if (aiResponse.description) filteredResponse.description = aiResponse.description;
          if (aiResponse.causes) filteredResponse.causes = aiResponse.causes;
          if (aiResponse.commonly_used_medicines) filteredResponse.commonly_used_medicines = aiResponse.commonly_used_medicines;
          aiResponse = filteredResponse;
          logDebug('Response filtered to include only required fields');
        } else if (responseType === 'greeting') {
          const filteredResponse = {};
          if (aiResponse.response) filteredResponse.response = aiResponse.response;
          aiResponse = filteredResponse;
          logDebug('Greeting response processed');
        } else {
          // For conversational responses, only keep the response field (no sources)
          const filteredResponse = {};
          if (aiResponse.response) filteredResponse.response = aiResponse.response;
          // Remove sources_Link if present
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

  // Save assistant response with response type
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

