import { Router } from 'express';
import { getAllSubmissions, approveSubmission, rejectSubmission, returnSubmission, getAnalytics, getUsers, updateUserRole } from '../controllers/adminController';
import { verifyToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';

const router = Router();

router.use(verifyToken);
router.use(requireRole('hr', 'admin'));

router.get   ('/submissions',             getAllSubmissions);
router.patch ('/submissions/:id/approve', approveSubmission);
router.patch ('/submissions/:id/reject',  rejectSubmission);
router.patch ('/submissions/:id/return',  returnSubmission);
router.get   ('/analytics',               getAnalytics);
router.get   ('/users',                   getUsers);
router.patch ('/users/:id/role',          requireRole('admin'), updateUserRole);

export default router;
