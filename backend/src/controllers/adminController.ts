import { Response } from 'express';
import mongoose from 'mongoose';
import Submission from '../models/Submission';
import User from '../models/User';
import AuditLog from '../models/AuditLog';
import { AuthRequest } from '../middleware/auth';
import { escapeRegex, validateBody, ReviewSchema, RejectSchema, UpdateRoleSchema } from '../utils/validate';

// ─── Get All Submissions (Admin) ──────────────────────────
export const getAllSubmissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page     = Math.max(1, Number(req.query.page)  || 1);
    const limit    = Math.min(100, Number(req.query.limit) || 20);
    const formType = req.query.formType as string | undefined;
    const status   = req.query.status   as string | undefined;
    const search   = req.query.search   as string | undefined;

    const filter: Record<string, unknown> = {};
    if (formType) filter.formType = formType;
    if (status)   filter.status   = status;

    if (search) {
      // Escape special regex chars to prevent injection + ReDoS
      const safeSearch = escapeRegex(search.trim().slice(0, 100));
      const users = await User.find({
        $or: [
          { name:         { $regex: safeSearch, $options: 'i' } },
          { email:        { $regex: safeSearch, $options: 'i' } },
          { employeeCode: { $regex: safeSearch, $options: 'i' } },
        ],
      }).select('_id').lean();
      filter.userId = { $in: users.map(u => u._id) };
    }

    const [submissions, total] = await Promise.all([
      Submission.find(filter)
        .populate('userId',     'name email employeeCode department designation')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Submission.countDocuments(filter),
    ]);

    res.json({ submissions, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[admin] get submissions error:', err);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
};

// ─── Shared workflow update helper ────────────────────────
const updateSubmissionStatus = async (
  req: AuthRequest,
  res: Response,
  status: 'approved' | 'rejected' | 'returned',
  comment: string | undefined,
  auditAction: string,
): Promise<void> => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Invalid submission ID' });
    return;
  }
  const submission = await Submission.findById(id);
  if (!submission) {
    res.status(404).json({ error: 'Submission not found' });
    return;
  }
  submission.status     = status;
  submission.hrComment  = comment ?? '';
  submission.reviewedBy = new mongoose.Types.ObjectId(req.userId) as unknown as typeof submission.reviewedBy;
  submission.reviewedAt = new Date();
  await submission.save();
  await AuditLog.create({
    userId:   req.userId,
    action:   auditAction,
    target:   String(submission._id),
    metadata: comment ? { comment } : undefined,
  });
  res.json({ submission });
};

// ─── Approve Submission ───────────────────────────────────
export const approveSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const v = validateBody(ReviewSchema, req.body);
    if (!v.success) { res.status(400).json({ error: v.errors[0] }); return; }
    await updateSubmissionStatus(req, res, 'approved', v.data.comment, 'SUBMISSION_APPROVE');
  } catch (err) {
    console.error('[admin] approve error:', err);
    res.status(500).json({ error: 'Failed to approve submission' });
  }
};

// ─── Reject Submission ────────────────────────────────────
export const rejectSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const v = validateBody(RejectSchema, req.body);
    if (!v.success) { res.status(400).json({ error: v.errors[0] }); return; }
    await updateSubmissionStatus(req, res, 'rejected', v.data.comment, 'SUBMISSION_REJECT');
  } catch (err) {
    console.error('[admin] reject error:', err);
    res.status(500).json({ error: 'Failed to reject submission' });
  }
};

// ─── Return for Correction ────────────────────────────────
export const returnSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const v = validateBody(RejectSchema, req.body);
    if (!v.success) { res.status(400).json({ error: v.errors[0] }); return; }
    await updateSubmissionStatus(req, res, 'returned', v.data.comment, 'SUBMISSION_RETURN');
  } catch (err) {
    console.error('[admin] return error:', err);
    res.status(500).json({ error: 'Failed to return submission' });
  }
};

// ─── Analytics ────────────────────────────────────────────
export const getAnalytics = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const [monthlyStats, statusStats, formTypeStats, topUsers, totalCount] = await Promise.all([
      Submission.aggregate([
        { $match: { createdAt: { $gte: yearStart } } },
        { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Submission.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Submission.aggregate([
        { $group: { _id: '$formType', count: { $sum: 1 } } },
      ]),
      Submission.aggregate([
        { $group: { _id: '$userId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $project: { name: '$user.name', email: '$user.email', employeeCode: '$user.employeeCode', count: 1 } },
      ]),
      Submission.countDocuments(),
    ]);
    res.json({ monthlyStats, statusStats, formTypeStats, topUsers, totalCount });
  } catch (err) {
    console.error('[admin] analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

// ─── Get All Users ────────────────────────────────────────
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page   = Math.max(1, Number(req.query.page)  || 1);
    const limit  = Math.min(100, Number(req.query.limit) || 20);
    const search = req.query.search as string | undefined;

    const filter: Record<string, unknown> = {};
    if (search) {
      const safeSearch = escapeRegex(search.trim().slice(0, 100));
      filter.$or = [
        { name:         { $regex: safeSearch, $options: 'i' } },
        { email:        { $regex: safeSearch, $options: 'i' } },
        { employeeCode: { $regex: safeSearch, $options: 'i' } },
      ];
    }
    const [users, total] = await Promise.all([
      User.find(filter).select('-passwordHash -refreshToken').skip((page - 1) * limit).limit(limit).lean(),
      User.countDocuments(filter),
    ]);
    res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[admin] get users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// ─── Update User Role ─────────────────────────────────────
export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }
    const v = validateBody(UpdateRoleSchema, req.body);
    if (!v.success) { res.status(400).json({ error: v.errors[0] }); return; }

    // Prevent admin from demoting themselves
    if (id === req.userId) {
      res.status(400).json({ error: 'You cannot change your own role' });
      return;
    }
    const user = await User.findByIdAndUpdate(id, { role: v.data.role }, { new: true })
      .select('-passwordHash -refreshToken').lean();
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    await AuditLog.create({ userId: req.userId, action: 'USER_ROLE_UPDATE', target: id, metadata: { newRole: v.data.role } });
    res.json({ user });
  } catch (err) {
    console.error('[admin] update role error:', err);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};
