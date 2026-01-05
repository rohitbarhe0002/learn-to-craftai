import express from 'express';
import { 
  handleChatRequest,
  handleGetConversations,
  handleGetConversation,
  handleDeleteConversation
} from '../controllers/chat.controller.js';

const router = express.Router();

router.post('/', handleChatRequest);
router.get('/conversations', handleGetConversations);
router.get('/conversations/:id', handleGetConversation);
router.delete('/conversations/:id', handleDeleteConversation);

export default router;

