import { Router } from 'express';
import { register, login, googleLogin, refresh, logout } from '../controllers/authController';
import { loginLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', register);
router.post('/login',    loginLimiter, login);
router.post('/google',   googleLogin);
router.post('/refresh',  refresh);
router.post('/logout',   logout);

export default router;
