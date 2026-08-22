import { Router } from 'express';
import {
  getLeaveRequests,
  getLeaveBalance,
  applyLeave,
  updateLeaveStatus,
  getHolidays,
  createHoliday,
} from '../controllers/leave.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/requests', getLeaveRequests);
router.get('/balance', getLeaveBalance);
router.post('/apply', applyLeave);
router.patch('/requests/:id', updateLeaveStatus);
router.get('/holidays', getHolidays);
router.post('/holidays', createHoliday);

export default router;
