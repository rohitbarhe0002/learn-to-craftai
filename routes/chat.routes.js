import express from 'express';
import { handleChatRequest } from '../controllers/chat.controller.js';

const router = express.Router();

/**
 * Chat Routes
 * Defines routes for chat-related endpoints
 */

// POST /chat - Process health information request
router.post('/', handleChatRequest);

export default router;

