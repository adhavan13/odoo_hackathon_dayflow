import { Router } from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployeeController,
  updateEmployeeProfile,
} from '../controllers/employee.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getEmployees);
router.post('/', createEmployeeController);
router.get('/:id', getEmployeeById);
router.patch('/:id', updateEmployeeProfile);

export default router;
