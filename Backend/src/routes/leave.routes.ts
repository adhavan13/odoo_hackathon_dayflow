import { Router } from 'express';
import {
  getLeaveRequests,
  getLeaveBalance,
  applyLeave,
  updateLeaveStatus,
} from '../controllers/leave.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/requests', getLeaveRequests);
router.get('/balance', getLeaveBalance);
router.post('/apply', applyLeave);
router.patch('/requests/:id', updateLeaveStatus);

export default router;
