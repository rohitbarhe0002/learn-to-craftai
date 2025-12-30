import { parentPort, workerData } from 'worker_threads';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../utils/config.js';

const { task, prompt, apiKey, history, intent } = workerData;

/**
 * Gemini Worker Thread
 * Processes Gemini API requests in isolation
 * Handles intent detection and response generation with Google Search grounding
 */

/**
 * Processes Gemini API request with Google Search grounding
 * @returns {Promise<void>}
 */
async function processGeminiRequest() {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: config.geminiModel });

    if (task === 'detect_intent') {
      // Intent detection task
      const intentPrompt = prompt;
      const response = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: intentPrompt }] }],
        tools: [{ google_search: {} }]
      });

      const candidate = response.response.candidates[0];
      if (!candidate || !candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error('No response from Gemini API for intent detection');
      }

      const text = candidate.content.parts[0].text;
      parentPort.postMessage({ text, task: 'intent' });

    } else if (task === 'generate_response') {
      // Response generation task
      const responsePrompt = prompt;
      const contents = [];

      // Add conversation history if available
      if (history && Array.isArray(history) && history.length > 0) {
        history.forEach((msg) => {
          contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
          });
        });
      }

      // Add current prompt
      contents.push({
        role: 'user',
        parts: [{ text: responsePrompt }]
      });

      // Generate content with Google Search grounding
      const response = await model.generateContent({
        contents: contents,
        tools: [{ google_search: {} }]
      });

      const candidate = response.response.candidates[0];
      if (!candidate || !candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error('No response from Gemini API');
      }

      const text = candidate.content.parts[0].text;
      const groundingMetadata = candidate.groundingMetadata || null;

      parentPort.postMessage({
        text,
        groundingMetadata,
        task: 'response',
        intent
      });

    } else {
      throw new Error(`Unknown task: ${task}`);
    }

  } catch (error) {
    parentPort.postMessage({
      error: error.message || 'Unknown error in worker thread',
      task: task || 'unknown'
    });
  }
}

// Execute the Gemini request
processGeminiRequest();

