import { Router } from 'express';
import { saveDraft, submitForm, getHistory, getSubmission, updateDraft, deleteDraft, getStats } from '../controllers/formController';
import { verifyToken } from '../middleware/auth';

const router = Router();
router.use(verifyToken);

router.get   ('/stats',   getStats);
router.post  ('/draft',   saveDraft);
router.post  ('/submit',  submitForm);
router.get   ('/history', getHistory);
router.get   ('/:id',     getSubmission);
router.put   ('/:id',     updateDraft);
router.delete('/:id',     deleteDraft);

export default router;
