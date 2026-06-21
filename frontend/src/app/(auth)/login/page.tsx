import type { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In — NRSC SLMS',
  description: 'Sign in to the NRSC Smart Leave Management System.',
};

export default function LoginPage() {
  return (
    <div className="auth-page">
      <div className="auth-card-premium">
        
        {/* Card Header */}
        <div className="auth-card-header">
          <div className="auth-card-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/nrsc_slms_logo.png"
              alt="NRSC SLMS Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <h1 className="auth-card-title">NRSC Smart Leave Management System</h1>
          <h2 className="auth-card-hindi">राष्ट्रीय सुदूर संवेदन केन्द्र</h2>
          <p className="auth-card-subtitle">Digital Leave Management Portal</p>
          <div className="auth-card-divider" />
          <p className="auth-card-tagline">Secure • Fast • Bilingual • Enterprise</p>
        </div>

        {/* Auth Form */}
        <LoginForm />

      </div>
    </div>
  );
}
