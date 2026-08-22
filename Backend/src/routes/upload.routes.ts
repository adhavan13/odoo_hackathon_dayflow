import { Router } from 'express';
import { uploadFile } from '../controllers/upload.controller';
import { upload } from '../middlewares/upload.middleware';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/cloudinary', authenticateToken, upload.single('file'), uploadFile);

export default router;
