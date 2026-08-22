import { Router, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.config';
import { processQuery, getSuggestions, getHistory, clearHistory } from '../controllers/aiAssistant.controller';

const router = Router();

// Middleware to extract user if available, without blocking demo/mock sessions
const optionalAuth = (req: any, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (token && token !== 'mock_jwt_token_123') {
      const decoded: any = jwt.verify(token, config.jwtSecret);
      req.user = decoded;
    } else {
      req.user = {
        id: 'usr_admin_01',
        name: 'Sarah Jenkins',
        role: 'ADMIN',
        email: 'sarah.j@company.com',
      };
    }
  } catch {
    req.user = {
      id: 'usr_admin_01',
      name: 'Sarah Jenkins',
      role: 'ADMIN',
      email: 'sarah.j@company.com',
    };
  }
  next();
};

router.use(optionalAuth);

router.post('/query', processQuery);
router.get('/suggestions', getSuggestions);
router.get('/history', getHistory);
router.delete('/history', clearHistory);

export default router;
