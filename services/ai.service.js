import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { logError, logDebug, logInfo } from '../utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * AI Service
 * Handles all AI-related operations including worker thread management
 */

/**
 * Detects user intent using Gemini API in a worker thread
 * @param {string} intentPrompt - Intent detection prompt
 * @param {string} apiKey - Gemini API key
 * @param {string} userMessage - User message
 * @param {Array} history - Conversation history
 * @returns {Promise<{intent: string, reasoning: string}>} Detected intent
 * @throws {Error} If worker processing fails
 */
export function detectIntent(intentPrompt, apiKey, userMessage, history = []) {
  return new Promise((resolve, reject) => {
    const workerPath = join(__dirname, '..', 'workers', 'gemini.worker.js');
    logDebug('Creating worker thread for intent detection', { 
      workerPath,
      historyLength: history.length 
    });

    const worker = new Worker(workerPath, {
      workerData: { 
        task: 'detect_intent',
        prompt: intentPrompt,
        apiKey,
        userMessage,
        history
      }
    });

    worker.on('message', (result) => {
      if (result.error) {
        logError('Worker returned error during intent detection', new Error(result.error));
        reject(new Error(result.error));
      } else {
        logDebug('Intent detection completed', { 
          responseLength: result.text?.length || 0 
        });
        resolve(result);
      }
      worker.terminate();
    });

    worker.on('error', (error) => {
      logError('Worker thread error during intent detection', error);
      reject(error);
      worker.terminate();
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        logError('Worker exited with non-zero code during intent detection', null, { exitCode: code });
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

/**
 * Processes AI request using Gemini API in a worker thread
 * @param {string} prompt - System prompt for the AI
 * @param {string} apiKey - Gemini API key
 * @param {Array<{role: string, content: string}>} history - Conversation history (optional)
 * @param {string} intent - Detected intent
 * @param {string} userMessage - User message
 * @param {Object} userDetails - User details
 * @returns {Promise<{text: string, groundingMetadata: Object, intent: string}>} AI response with grounding metadata
 * @throws {Error} If worker processing fails
 */
export function processAIRequest(prompt, apiKey, history = [], intent = null, userMessage = null, userDetails = null) {
  return new Promise((resolve, reject) => {
    const workerPath = join(__dirname, '..', 'workers', 'gemini.worker.js');
    logDebug('Creating worker thread for response generation', { 
      workerPath,
      historyLength: history.length,
      intent,
      promptLength: prompt.length 
    });

    const worker = new Worker(workerPath, {
      workerData: { 
        task: 'generate_response',
        prompt,
        apiKey,
        history,
        intent,
        userMessage,
        userDetails
      }
    });

    worker.on('message', (result) => {
      if (result.error) {
        logError('Worker returned error', new Error(result.error));
        reject(new Error(result.error));
      } else {
        logDebug('Worker completed successfully', { 
          responseLength: result.text?.length || 0,
          hasGrounding: !!result.groundingMetadata,
          intent: result.intent
        });
        resolve(result);
      }
      worker.terminate();
    });

    worker.on('error', (error) => {
      logError('Worker thread error', error);
      reject(error);
      worker.terminate();
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        logError('Worker exited with non-zero code', null, { exitCode: code });
        reject(new Error(`Worker stopped with exit code ${code}`));
      } else {
        logDebug('Worker exited successfully', { exitCode: code });
      }
    });
  });
}

