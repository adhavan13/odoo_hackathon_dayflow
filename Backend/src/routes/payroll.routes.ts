import { Router } from 'express';
import {
  getSalarySlips,
  getSalaryStructure,
  getPayrollOverview,
  updateSalaryStructure,
} from '../controllers/payroll.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/slips', getSalarySlips);
router.get('/structure', getSalaryStructure);
router.put('/structure', updateSalaryStructure);
router.get('/overview', getPayrollOverview);

export default router;
