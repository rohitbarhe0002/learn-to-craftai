import express from 'express';
import { handleChatRequest } from '../controllers/chat.controller.js';

const router = express.Router();

/**
 * Chat Routes
 * Defines routes for chat-related endpoints
 */

router.post('/', handleChatRequest);

export default router;

