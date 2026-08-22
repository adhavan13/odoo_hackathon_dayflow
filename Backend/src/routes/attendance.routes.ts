import { Router } from 'express';
import {
  punchIn,
  punchOut,
  getTodayStatus,
  getAttendanceHistory,
} from '../controllers/attendance.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.post('/punch-in', punchIn);
router.post('/punch-out', punchOut);
router.get('/today', getTodayStatus);
router.get('/history', getAttendanceHistory);

export default router;
