import { Router } from 'express';
import {
  processQuery,
  getSuggestions,
  getHistory,
  clearHistory,
} from '../controllers/aiAssistant.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Protect AI Assistant endpoints with authentication
router.use(authenticateToken);

router.post('/query', processQuery);
router.get('/suggestions', getSuggestions);
router.get('/history', getHistory);
router.delete('/history', clearHistory);

export default router;
