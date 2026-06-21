import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profileController';
import { verifyToken } from '../middleware/auth';

const router = Router();
router.use(verifyToken);

// GET /api/profile
router.get('/', getProfile);

// PATCH /api/profile
router.patch('/', updateProfile);

export default router;
