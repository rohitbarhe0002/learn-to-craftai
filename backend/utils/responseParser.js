

import { logError, logDebug } from './logger.js';

/**
 * Parses AI response text into JSON object
 * Handles cases where response may contain extra text around JSON
 * @param {string} text - Raw AI response text
 * @returns {Object} Parsed JSON object
 * @throws {Error} If JSON cannot be parsed
 */
export function parseAIResponse(text) {
  try {
    // Try direct JSON parse first
    return JSON.parse(text);
  } catch (parseError) {
    logDebug('Direct JSON parse failed, attempting extraction', { error: parseError.message });
    // If direct parse fails, try to extract JSON from text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (extractError) {
        logError('Failed to parse extracted JSON', extractError);
        throw new Error('AI response is not valid JSON');
      }
    }
    logError('No JSON found in AI response', null, { textLength: text.length });
    throw new Error('AI response is not valid JSON');
  }
}

/**
 * Validates grounding metadata exists
 * @param {Object} groundingMetadata - Grounding metadata from Gemini API
 * @returns {boolean} True if grounding is present
 */
export function hasValidGrounding(groundingMetadata) {
  return (
    groundingMetadata &&
    groundingMetadata.groundingChunks &&
    groundingMetadata.groundingChunks.length > 0
  );
}

