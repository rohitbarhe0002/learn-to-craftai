import express from 'express';
import { handleChatRequest } from '../controllers/chat.controller.js';

const router = express.Router();

router.post('/', handleChatRequest);

export default router;

