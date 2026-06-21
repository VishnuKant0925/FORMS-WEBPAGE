import { z } from 'zod';

// ─── Auth Schemas ─────────────────────────────────────────
export const RegisterSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Invalid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export const LoginSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).trim().toLowerCase().email('Invalid email address'),
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

export const GoogleLoginSchema = z.object({
  credential: z.string({ required_error: 'Google credential is required' }).min(1),
});

// ─── Form Schemas ─────────────────────────────────────────
export const SubmitFormSchema = z.object({
  formType: z.enum(['casual_leave_nrsc', 'earned_leave', 'casual_leave_rrsc', 'trainee_biodata'], {
    required_error: 'Form type is required',
  }),
  language: z.string().default('hi'),
  formData: z.record(z.unknown()),
});

// ─── Admin Schemas ────────────────────────────────────────
export const ReviewSchema = z.object({
  comment: z.string().max(1000, 'Comment too long').optional(),
});

export const RejectSchema = z.object({
  comment: z
    .string({ required_error: 'Rejection comment is required' })
    .min(5, 'Comment must be at least 5 characters')
    .max(1000, 'Comment too long'),
});

export const UpdateRoleSchema = z.object({
  role: z.enum(['employee', 'supervisor', 'hr', 'admin'], { required_error: 'Valid role is required' }),
});

// ─── Profile Schema ────────────────────────────────────────
export const UpdateProfileSchema = z.object({
  name:         z.string().trim().min(2).max(100).optional(),
  employeeCode: z.string().trim().max(30).optional(),
  department:   z.string().trim().max(100).optional(),
  designation:  z.string().trim().max(100).optional(),
  profilePhoto: z.string().url('Invalid profile photo URL').optional(),
});

// ─── Utilities ────────────────────────────────────────────
/**
 * Escape a string so it is safe to use in a MongoDB $regex query.
 * Prevents ReDoS and regex injection attacks.
 */
export const escapeRegex = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Validate a request body against a Zod schema.
 * Returns { success, data, errors } instead of throwing.
 */
export const validateBody = <T>(schema: z.ZodSchema<T>, body: unknown): { success: true; data: T } | { success: false; errors: string[] } => {
  const result = schema.safeParse(body);
  if (result.success) return { success: true, data: result.data };
  const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
  return { success: false, errors };
};
