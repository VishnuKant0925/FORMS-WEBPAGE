'use client';

import Link from 'next/link';
import {
  Calendar, FileText, ClipboardList, UserCircle,
  CheckCircle, Clock, XCircle, BarChart2, FileEdit,
  ArrowRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useLangStore } from '@/store/useLangStore';
import { useEffect, useState } from 'react';
import { formService } from '@/services/formService';
import type { Submission } from '@/types';
import StatusBadge from '@/components/common/StatusBadge';

/* ─── Form shortcuts data ────────────────────────────────── */
const FORM_SHORTCUTS = [
  {
    id:      'casual_leave_nrsc',
    href:    '/forms/casual-leave-nrsc',
    labelEn: 'NRSC Casual Leave',
    labelHi: 'आकस्मिक छुट्टी (NRSC)',
    org:     'National Remote Sensing Centre',
    icon:    Calendar,
    accent:  '#0B5ED7',
    accentBg:'#EBF2FF',
  },
  {
    id:      'earned_leave',
    href:    '/forms/earned-leave',
    labelEn: 'Leave / Extension',
    labelHi: 'अर्जित छुट्टी / बढ़ोतरी',
    org:     'National Remote Sensing Centre',
    icon:    FileText,
    accent:  '#00695C',
    accentBg:'#E8F5E9',
  },
  {
    id:      'casual_leave_rrsc',
    href:    '/forms/casual-leave-rrsc',
    labelEn: 'RRSC-W CL / Comp Off',
    labelHi: 'आकस्मिक / प्रतिपूरक',
    org:     'Regional Remote Sensing Centre – West',
    icon:    ClipboardList,
    accent:  '#1565C0',
    accentBg:'#E3F2FD',
  },
  {
    id:      'trainee_biodata',
    href:    '/forms/trainee-biodata',
    labelEn: 'Trainee Bio-Data',
    labelHi: 'प्रशिक्षणार्थी जीवन वृत्त',
    org:     'Regional Remote Sensing Centre – West',
    icon:    UserCircle,
    accent:  '#E65100',
    accentBg:'#FFF3E0',
  },
] as const;

/* ─── Stat card config ───────────────────────────────────── */
const STAT_CONFIG = [
  { key: 'total',    icon: BarChart2,   accent: '#0B5ED7', bg: '#EBF2FF' },
  { key: 'approved', icon: CheckCircle, accent: '#2E7D32', bg: '#E8F5E9' },
  { key: 'pending',  icon: Clock,       accent: '#E65100', bg: '#FFF3E0' },
  { key: 'rejected', icon: XCircle,     accent: '#C62828', bg: '#FFEBEE' },
] as const;

/* ─── Component ──────────────────────────────────────────── */
export default function DashboardContent() {
  const { user }  = useAuthStore();
  const { t, lang } = useLangStore();
  const [history, setHistory] = useState<Submission[]>([]);
  const [stats, setStats]     = useState({ total: 0, approved: 0, pending: 0, rejected: 0, drafts: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    Promise.all([formService.getStats(), formService.getHistory({ limit: 6 })])
      .then(([s, h]) => {
        setStats(s);
        setHistory(h.submissions ?? []);
      })
      .catch(() => setError('Failed to load dashboard data. Please reload.'))
      .finally(() => setLoading(false));
  }, []);

  /* ── Skeleton ─────────────────────────────────────────── */
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div className="skeleton" style={{ height: '100px', borderRadius: '12px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '88px', borderRadius: '12px' }} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '80px', borderRadius: '12px' }} />)}
        </div>
        <div className="skeleton" style={{ height: '220px', borderRadius: '12px' }} />
      </div>
    );
  }

  const firstName = user?.name?.split(' ')[0] ?? '';
  const today     = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* ── Error banner ───────────────────────────────────── */}
      {error && (
        <div className="alert alert-error animate-fade-in" role="alert">{error}</div>
      )}

      {/* ══ 1. Welcome Banner ══════════════════════════════ */}
      <div className="card animate-fade-in" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '16px', padding: '28px 32px',
      }}>
        <div>
          <p className={lang === 'hi' ? 'hindi' : ''} lang={lang === 'hi' ? 'hi' : undefined}
            style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            {lang === 'hi' ? `नमस्ते, ${user?.name} 🙏` : `Hello, ${firstName} 👋`}
          </p>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {t('welcome')}, {firstName}
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{today}</p>
        </div>
        <Link
          href="/forms/casual-leave-nrsc"
          className="btn btn-primary"
          style={{ flexShrink: 0, gap: '8px' }}
        >
          <FileEdit size={15} />
          {t('newApplication')}
        </Link>
      </div>

      {/* ══ 2. Stats Row ═══════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {STAT_CONFIG.map(({ key, icon: Icon, accent }) => {
          const labelKey = key === 'total' ? 'totalApplications' : key as 'approved' | 'pending' | 'rejected';
          return (
            <div key={key} className="card" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {t(labelKey)}
                </span>
                <Icon size={18} style={{ color: accent }} aria-hidden="true" />
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, margin: 0 }}>
                {stats[key as keyof typeof stats]}
              </p>
            </div>
          );
        })}
      </div>

      {/* ══ 3. Quick Actions ═══════════════════════════════ */}
      <div>
        <h3 style={{
          fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '14px',
        }}>
          {t('quickActions')}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
          {FORM_SHORTCUTS.map(f => {
            const Icon = f.icon;
            return (
              <Link
                key={f.id}
                href={f.href}
                className="card card-hover"
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '16px',
                  textDecoration: 'none', padding: '20px 22px',
                }}
              >
                {/* Icon */}
                <div style={{
                  width: '40px', height: '40px', borderRadius: '8px',
                  background: f.accentBg, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0, marginTop: '2px',
                }}>
                  <Icon size={18} style={{ color: f.accent }} aria-hidden="true" />
                </div>
                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '0.6875rem', color: 'var(--text-muted)',
                    marginBottom: '4px', textTransform: 'uppercase',
                    letterSpacing: '0.06em', fontWeight: 500,
                  }}>
                    {f.org.length > 30 ? f.org.substring(0, 28) + '…' : f.org}
                  </p>
                  <p style={{
                    fontSize: '0.9375rem', fontWeight: 600,
                    color: 'var(--text-primary)', lineHeight: 1.3,
                    marginBottom: '3px',
                  }}>
                    {lang === 'hi' ? f.labelHi : f.labelEn}
                  </p>
                </div>
                {/* Arrow */}
                <ArrowRight size={15} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '4px' }} />
              </Link>
            );
          })}
        </div>
      </div>

      {/* ══ 4. Recent Submissions ══════════════════════════ */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 0',
        }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {t('recentSubmissions')}
          </h3>
          <Link href="/history" style={{
            fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)',
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            {t('viewAll')} <ArrowRight size={13} />
          </Link>
        </div>

        {/* Table or empty state */}
        {history.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '48px 24px',
            color: 'var(--text-muted)', fontSize: '0.9rem',
          }}>
            <FileText size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p>{t('noSubmissions')}</p>
            <Link href="/forms/casual-leave-nrsc" className="btn btn-secondary btn-sm" style={{ marginTop: '16px' }}>
              {t('newApplication')}
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', marginTop: '16px' }}>
            <table className="data-table" style={{ minWidth: '560px' }}>
              <thead>
                <tr>
                  <th>{t('formType')}</th>
                  <th>{t('date')}</th>
                  <th>{t('status')}</th>
                  <th style={{ textAlign: 'right' }}>{t('action')}</th>
                </tr>
              </thead>
              <tbody>
                {history.map(s => (
                  <tr key={s._id}>
                    <td style={{ fontWeight: 500 }}>
                      {s.formType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {new Date(s.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td><StatusBadge status={s.status} /></td>
                    <td style={{ textAlign: 'right' }}>
                      <Link
                        href="/history"
                        style={{
                          fontSize: '0.8125rem', fontWeight: 600,
                          color: 'var(--primary)', textDecoration: 'none',
                        }}
                      >
                        {t('view')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
