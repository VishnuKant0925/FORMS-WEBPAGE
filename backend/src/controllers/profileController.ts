import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { validateBody, UpdateProfileSchema } from '../utils/validate';

// GET /api/profile
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash -refreshToken').lean();
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ user });
  } catch (err) {
    console.error('[profile] get error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// PATCH /api/profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const v = validateBody(UpdateProfileSchema, req.body);
  if (!v.success) {
    res.status(400).json({ error: v.errors[0] });
    return;
  }
  try {
    const user = await User.findByIdAndUpdate(req.userId, v.data, { new: true, runValidators: true })
      .select('-passwordHash -refreshToken').lean();
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ user });
  } catch (err) {
    console.error('[profile] update error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
