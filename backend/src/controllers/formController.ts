import { Response } from 'express';
import mongoose from 'mongoose';
import Submission from '../models/Submission';
import AuditLog from '../models/AuditLog';
import { AuthRequest } from '../middleware/auth';
import { SubmitFormSchema, validateBody } from '../utils/validate';

// ─── Save Draft ───────────────────────────────────────────
export const saveDraft = async (req: AuthRequest, res: Response): Promise<void> => {
  const v = validateBody(SubmitFormSchema, req.body);
  if (!v.success) { res.status(400).json({ error: v.errors[0] }); return; }
  try {
    const draft = await Submission.create({
      userId:   req.userId,
      formType: v.data.formType,
      language: v.data.language,
      formData: v.data.formData,
      status:   'draft',
    });
    res.status(201).json({ submission: { id: draft._id, formType: draft.formType, status: draft.status } });
  } catch (err) {
    console.error('[form] save draft error:', err);
    res.status(500).json({ error: 'Failed to save draft' });
  }
};

// ─── Submit Form ──────────────────────────────────────────
export const submitForm = async (req: AuthRequest, res: Response): Promise<void> => {
  const v = validateBody(SubmitFormSchema, req.body);
  if (!v.success) { res.status(400).json({ error: v.errors[0] }); return; }
  try {
    const submission = await Submission.create({
      userId:   req.userId,
      formType: v.data.formType,
      language: v.data.language,
      formData: v.data.formData,
      status:   'submitted',
    });
    await AuditLog.create({ userId: req.userId, action: 'FORM_SUBMIT', target: submission.formType, metadata: { submissionId: submission._id } });
    res.status(201).json({
      submission: { id: submission._id, formType: submission.formType, status: submission.status, createdAt: submission.createdAt },
    });
  } catch (err) {
    console.error('[form] submit error:', err);
    res.status(500).json({ error: 'Failed to submit form' });
  }
};

// ─── Get Statistics (for dashboard) ──────────────────────
export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [statusGroups, total] = await Promise.all([
      Submission.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Submission.countDocuments({ userId: req.userId }),
    ]);
    const stats: Record<string, number> = { total, approved: 0, pending: 0, rejected: 0, drafts: 0 };
    for (const { _id, count } of statusGroups) {
      if (_id === 'approved')                     stats.approved = count;
      else if (['submitted','recommended'].includes(_id)) stats.pending += count;
      else if (_id === 'rejected')                stats.rejected = count;
      else if (_id === 'draft' || _id === 'returned') stats.drafts += count;
    }
    res.json({ stats });
  } catch (err) {
    console.error('[form] stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

// ─── Get Submission History ───────────────────────────────
export const getHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page     = Math.max(1, Number(req.query.page)  || 1);
    const limit    = Math.min(50, Number(req.query.limit) || 10);
    const formType = req.query.formType as string | undefined;
    const status   = req.query.status   as string | undefined;

    const filter: Record<string, unknown> = { userId: req.userId };
    if (formType) filter.formType = formType;
    if (status)   filter.status   = status;

    const [submissions, total] = await Promise.all([
      Submission.find(filter)
        .select('formType language status createdAt updatedAt')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Submission.countDocuments(filter),
    ]);
    res.json({ submissions, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[form] get history error:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

// ─── Get Single Submission ────────────────────────────────
export const getSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ error: 'Invalid submission ID' });
      return;
    }
    const submission = await Submission.findOne({ _id: req.params.id, userId: req.userId });
    if (!submission) { res.status(404).json({ error: 'Submission not found' }); return; }
    res.json({ submission });
  } catch (err) {
    console.error('[form] get submission error:', err);
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
};

// ─── Update Draft ─────────────────────────────────────────
export const updateDraft = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ error: 'Invalid submission ID' });
      return;
    }
    const submission = await Submission.findOne({ _id: req.params.id, userId: req.userId, status: 'draft' });
    if (!submission) { res.status(404).json({ error: 'Draft not found' }); return; }

    const { formData, language } = req.body;
    if (formData && typeof formData === 'object') submission.formData = formData;
    if (language && typeof language === 'string') submission.language = language;
    await submission.save();
    res.json({ submission });
  } catch (err) {
    console.error('[form] update draft error:', err);
    res.status(500).json({ error: 'Failed to update draft' });
  }
};

// ─── Delete Draft ─────────────────────────────────────────
export const deleteDraft = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ error: 'Invalid submission ID' });
      return;
    }
    const result = await Submission.deleteOne({ _id: req.params.id, userId: req.userId, status: 'draft' });
    if (result.deletedCount === 0) { res.status(404).json({ error: 'Draft not found or already submitted' }); return; }
    res.json({ message: 'Draft deleted successfully' });
  } catch (err) {
    console.error('[form] delete draft error:', err);
    res.status(500).json({ error: 'Failed to delete draft' });
  }
};
