'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, FileText, History, UserCircle, ShieldCheck,
  Settings, HelpCircle, LogOut, Calendar, ClipboardList, ChevronDown, ChevronRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useLayoutStore } from '@/store/useLayoutStore';
import { authService } from '@/services/authService';
import { useLangStore } from '@/store/useLangStore';

const FORM_LINKS = [
  {
    href: '/forms/casual-leave-nrsc',
    labelEn: 'NRSC Casual Leave',
    labelHi: 'आकस्मिक छुट्टी (NRSC)',
    icon: Calendar,
  },
  {
    href: '/forms/earned-leave',
    labelEn: 'Leave / Extension',
    labelHi: 'अर्जित छुट्टी',
    icon: FileText,
  },
  {
    href: '/forms/casual-leave-rrsc',
    labelEn: 'RRSC-W CL / Comp Off',
    labelHi: 'आकस्मिक/प्रतिपूरक',
    icon: ClipboardList,
  },
  {
    href: '/forms/trainee-biodata',
    labelEn: 'Trainee Bio-Data',
    labelHi: 'प्रशिक्षणार्थी जीवन वृत्त',
    icon: UserCircle,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user } = useAuthStore();
  const { isSidebarOpen, closeSidebar } = useLayoutStore();
  const { lang, t } = useLangStore();
  const [formsOpen, setFormsOpen] = useState(() => pathname.startsWith('/forms'));

  useEffect(() => { closeSidebar(); }, [pathname, closeSidebar]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const handleLogout = async () => {
    await authService.logout();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      <nav
        className={`sidebar ${isSidebarOpen ? 'open' : ''}`}
        aria-label="Main navigation"
      >
        {/* Brand */}
        <div className="sidebar-brand">
          <div style={{
            width: '36px', height: '36px',
            borderRadius: '50%',
            overflow: 'hidden',
            background: '#FFFFFF',
            border: '1.5px solid rgba(11, 94, 215, 0.15)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/nrsc_slms_logo.png"
              alt="NRSC SLMS Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <div>
            <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              NRSC SLMS
            </p>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '1px' }}>
              Leave Management
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="sidebar-nav">
          {/* MAIN */}
          <p className="sidebar-section-label">Main</p>

          <NavItem
            href="/dashboard"
            icon={LayoutDashboard}
            label={t('dashboard')}
            labelHi="डैशबोर्ड"
            active={isActive('/dashboard')}
            lang={lang}
          />

          {/* Forms Submenu */}
          <div>
            <button
              onClick={() => setFormsOpen(v => !v)}
              className={`sidebar-nav-item ${pathname.startsWith('/forms') ? 'active' : ''}`}
              aria-expanded={formsOpen}
            >
              <FileText size={17} className="nav-icon" aria-hidden="true" />
              <span style={{ flex: 1, textAlign: 'left', fontSize: '0.875rem' }}>
                {t('newApp')}
              </span>
              {formsOpen
                ? <ChevronDown size={13} style={{ opacity: 0.6 }} />
                : <ChevronRight size={13} style={{ opacity: 0.6 }} />}
            </button>

            {formsOpen && (
              <div className="sidebar-nav-sub">
                {FORM_LINKS.map(f => (
                  <Link
                    key={f.href}
                    href={f.href}
                    className={`sidebar-nav-sub-item ${isActive(f.href) ? 'active' : ''}`}
                  >
                    <span style={{
                      fontSize: '0.8125rem',
                      fontWeight: isActive(f.href) ? 600 : 500,
                      color: isActive(f.href) ? 'var(--primary)' : 'var(--text-secondary)',
                    }}>
                      {lang === 'hi' ? f.labelHi : f.labelEn}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <NavItem
            href="/history"
            icon={History}
            label={t('history')}
            labelHi="मेरा इतिहास"
            active={isActive('/history')}
            lang={lang}
          />

          {/* ACCOUNT */}
          <p className="sidebar-section-label" style={{ marginTop: '12px' }}>Account</p>

          <NavItem
            href="/profile"
            icon={UserCircle}
            label={t('profile')}
            labelHi="प्रोफ़ाइल"
            active={isActive('/profile')}
            lang={lang}
          />

          {/* Admin / HR only */}
          {(user?.role === 'admin' || user?.role === 'hr') && (
            <NavItem
              href="/admin"
              icon={ShieldCheck}
              label={t('admin')}
              labelHi="प्रशासन"
              active={isActive('/admin')}
              lang={lang}
            />
          )}

          {/* SUPPORT */}
          <p className="sidebar-section-label" style={{ marginTop: '12px' }}>Support</p>

          <NavItem
            href="/settings"
            icon={Settings}
            label={t('settings')}
            labelHi="सेटिंग्स"
            active={isActive('/settings')}
            lang={lang}
          />
          <NavItem
            href="/help"
            icon={HelpCircle}
            label={t('help')}
            labelHi="सहायता"
            active={isActive('/help')}
            lang={lang}
          />
        </div>

        {/* Footer — User + Logout */}
        <div className="sidebar-footer">
          {/* User info */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', marginBottom: '8px',
            background: '#F9FAFB', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'var(--primary)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '0.8125rem', fontWeight: 700,
              flexShrink: 0,
            }}>
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontSize: '0.8125rem', fontWeight: 600,
                color: 'var(--text-primary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {user?.name}
              </p>
              <p style={{
                fontSize: '0.6875rem', color: 'var(--text-muted)',
                textTransform: 'capitalize', marginTop: '1px',
              }}>
                {user?.role}
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="sidebar-nav-item"
            style={{ color: 'var(--error)', borderRadius: 'var(--radius-sm)', width: '100%' }}
            aria-label="Logout"
          >
            <LogOut size={16} className="nav-icon" />
            <span style={{ fontSize: '0.875rem' }}>{t('logout')}</span>
          </button>
        </div>
      </nav>
    </>
  );
}

/* ─── NavItem ────────────────────────────────────────────── */
function NavItem({
  href, icon: Icon, label, labelHi, active, lang,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  labelHi: string;
  active: boolean;
  lang: 'en' | 'hi';
}) {
  return (
    <Link
      href={href}
      className={`sidebar-nav-item ${active ? 'active' : ''}`}
      aria-current={active ? 'page' : undefined}
    >
      <Icon size={17} className="nav-icon" aria-hidden="true" />
      <span style={{ flex: 1, fontSize: '0.875rem' }}>
        {lang === 'hi' ? labelHi : label}
      </span>
    </Link>
  );
}
