'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '@/services/authService';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useLangStore } from '@/store/useLangStore';

const RegisterSchema = z.object({
  name:            z.string().min(2, 'Name must be at least 2 characters').max(100),
  email:           z.string().min(1, 'Email is required').email('Invalid email address'),
  password:        z.string()
    .min(8, 'Min 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a digit')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
type RegisterInputs = z.infer<typeof RegisterSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const { t }  = useLangStore();
  const [showPwd, setShowPwd]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [errorMsg, setErrorMsg]   = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInputs>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: RegisterInputs) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await authService.register({ name: data.name, email: data.email, password: data.password });
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.error || 'Registration failed. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {errorMsg && (
        <div className="alert alert-error animate-fade-in" role="alert">
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* Full Name */}
        <Field label={t('fullName')} error={errors.name?.message} htmlFor="reg-name">
          <input
            id="reg-name" type="text" autoComplete="name"
            placeholder="e.g. Ramesh Kumar"
            {...register('name')}
            className={`form-input ${errors.name ? 'form-input-error' : ''}`}
            disabled={loading}
          />
        </Field>

        {/* Email */}
        <Field label={t('email')} error={errors.email?.message} htmlFor="reg-email">
          <input
            id="reg-email" type="email" autoComplete="email"
            placeholder="name@isro.gov.in"
            {...register('email')}
            className={`form-input ${errors.email ? 'form-input-error' : ''}`}
            disabled={loading}
          />
        </Field>

        {/* Password */}
        <Field
          label={t('password')}
          error={errors.password?.message}
          hint="Min 8 chars · Uppercase · Lowercase · Digit · Special character"
          htmlFor="reg-password"
        >
          <div style={{ position: 'relative' }}>
            <input
              id="reg-password"
              type={showPwd ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              {...register('password')}
              className={`form-input ${errors.password ? 'form-input-error' : ''}`}
              style={{ paddingRight: '40px' }}
              disabled={loading}
            />
            <button
              type="button" tabIndex={-1}
              onClick={() => setShowPwd(v => !v)}
              aria-label={showPwd ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute', top: '50%', right: '12px',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: '2px', display: 'flex',
              }}
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>

        {/* Confirm Password */}
        <Field label={t('confirmPwd')} error={errors.confirmPassword?.message} htmlFor="reg-confirm">
          <input
            id="reg-confirm" type="password" autoComplete="new-password"
            placeholder="••••••••"
            {...register('confirmPassword')}
            className={`form-input ${errors.confirmPassword ? 'form-input-error' : ''}`}
            disabled={loading}
          />
        </Field>

        {/* Submit */}
        <button
          type="submit" id="register-submit"
          className="btn btn-primary btn-lg"
          style={{ width: '100%', marginTop: '6px', justifyContent: 'center' }}
          disabled={loading}
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /><span>Creating account…</span></>
          ) : (
            t('signUp')
          )}
        </button>
      </form>

      <p style={{
        textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)',
        paddingTop: '4px', borderTop: '1px solid var(--border)',
      }}>
        {t('hasAccount')}{' '}
        <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
          {t('signInHere')}
        </Link>
      </p>
    </div>
  );
}

/* ─── Field helper ───────────────────────────────────────── */
function Field({ label, error, hint, htmlFor, children }: {
  label: string; error?: string; hint?: string; htmlFor: string; children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label htmlFor={htmlFor} style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>
        {label}
      </label>
      {hint && <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px' }}>{hint}</p>}
      {children}
      {error && (
        <p style={{ fontSize: '0.75rem', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}
