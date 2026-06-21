import { Router } from 'express';
import { generatePdf } from '../controllers/pdfController';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.get('/:submissionId', verifyToken, generatePdf);

export default router;
