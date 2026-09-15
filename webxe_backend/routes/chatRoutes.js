import { Router } from 'express';
import {
  chatWithAssistant,
  getAdminConversations,
  getConversationMessages,
  getCustomerConversation,
  markConversationRead,
  updateCustomerPresence,
  sendMessage,
} from '../controllers/chatController.js';
import { verifyAdmin, verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/', chatWithAssistant);
router.get('/conversation', verifyToken, getCustomerConversation);
router.get('/conversations', verifyToken, verifyAdmin, getAdminConversations);
router.get('/conversations/:conversationId', verifyToken, getConversationMessages);
router.post('/messages', verifyToken, sendMessage);
router.post('/presence', verifyToken, updateCustomerPresence);
router.post('/conversations/:conversationId/read', verifyToken, markConversationRead);

export default router;
