'use client';

import { Bell, ChevronDown, UserCircle, LogOut, Menu, Settings } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useLayoutStore } from '@/store/useLayoutStore';
import { authService } from '@/services/authService';
import LanguageSelector from '@/components/common/LanguageSelector';
import { useLangStore } from '@/store/useLangStore';

export default function Topnav() {
  const { user }           = useAuthStore();
  const { toggleSidebar }  = useLayoutStore();
  const { lang }           = useLangStore();
  const router             = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMenuOpen(false);
    await authService.logout();
    router.push('/login');
  };

  const orgName     = lang === 'hi' ? 'राष्ट्रीय सुदूर संवेदन केन्द्र' : 'National Remote Sensing Centre';
  const isHi        = lang === 'hi';

  return (
    <header className="topnav animate-fade-in" role="banner">

      {/* ─── Left: Mobile hamburger + Org name ─────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          id="sidebar-toggle"
          onClick={toggleSidebar}
          className="btn btn-ghost btn-icon"
          aria-label="Toggle sidebar"
          style={{ display: 'none' }}
          // shown via CSS on mobile
        >
          <Menu size={20} />
        </button>

        {/* Custom Logo + ISRO / NRSC badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px', height: '28px',
            borderRadius: '50%',
            overflow: 'hidden',
            background: '#FFFFFF',
            border: '1.5px solid rgba(11, 94, 215, 0.15)',
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
          <div style={{
            display: 'flex', gap: '6px', alignItems: 'center',
          }}>
            <span style={{
              fontSize: '0.625rem', fontWeight: 700, color: 'var(--primary)',
              background: 'var(--primary-light)', padding: '1.5px 6px',
              borderRadius: 'var(--radius-xs)', letterSpacing: '0.06em',
            }}>
              ISRO
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>·</span>
            <span style={{
              fontSize: '0.625rem', fontWeight: 700, color: 'var(--accent)',
              background: '#E8F5E9', padding: '1.5px 6px',
              borderRadius: 'var(--radius-xs)', letterSpacing: '0.06em',
            }}>
              NRSC
            </span>
          </div>
          <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />

          <div>
            {isHi ? (
              <p
                className="hindi"
                lang="hi"
                style={{
                  fontSize: '0.8125rem', fontWeight: 600,
                  color: 'var(--text-primary)', lineHeight: 1.2,
                  maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}
              >
                {orgName}
              </p>
            ) : (
              <h1 style={{
                fontSize: '0.8125rem', fontWeight: 600,
                color: 'var(--text-primary)', lineHeight: 1.2,
                maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {orgName}
              </h1>
            )}
          </div>
        </div>
      </div>

      {/* ─── Right: Language + Bell + User ─────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <LanguageSelector />

        {/* Notification Bell */}
        <button
          id="notifications-btn"
          aria-label="Notifications"
          className="btn btn-ghost btn-icon"
          style={{ position: 'relative' }}
        >
          <Bell size={18} />
          <span
            style={{
              position: 'absolute', top: '6px', right: '6px',
              width: '7px', height: '7px',
              background: 'var(--error)', borderRadius: '50%',
              border: '1.5px solid var(--surface)',
            }}
            aria-hidden="true"
          />
        </button>

        {/* User Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            id="user-menu-btn"
            onClick={() => setMenuOpen(v => !v)}
            className="btn btn-ghost"
            style={{ gap: '8px', padding: '6px 10px' }}
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            {/* Avatar */}
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'var(--primary)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '0.875rem', fontWeight: 700, flexShrink: 0,
            }}>
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <span style={{
              fontSize: '0.875rem', fontWeight: 600,
              color: 'var(--text-primary)', maxWidth: '120px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
              className="hide-mobile"
            >
              {user?.name}
            </span>
            <ChevronDown size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <>
              {/* Backdrop */}
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 49 }}
                onClick={() => setMenuOpen(false)}
                aria-hidden="true"
              />
              <div
                className="animate-slide-up"
                role="menu"
                aria-labelledby="user-menu-btn"
                style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  width: '220px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-md)',
                  zIndex: 50, overflow: 'hidden',
                }}
              >
                {/* User info header */}
                <div style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {user?.name}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {user?.email}
                  </p>
                  <span style={{
                    display: 'inline-block', marginTop: '8px',
                    fontSize: '0.6875rem', fontWeight: 600, textTransform: 'capitalize',
                    background: 'var(--primary-light)', color: 'var(--primary)',
                    padding: '2px 8px', borderRadius: 'var(--radius-xs)',
                    letterSpacing: '0.04em',
                  }}>
                    {user?.role}
                  </span>
                </div>

                {/* Menu items */}
                <div style={{ padding: '6px 0' }}>
                  <MenuLink href="/profile" icon={UserCircle} label="Profile" onClick={() => setMenuOpen(false)} />
                  <MenuLink href="/settings" icon={Settings} label="Settings" onClick={() => setMenuOpen(false)} />
                </div>

                <div style={{ borderTop: '1px solid var(--border)', padding: '6px 0' }}>
                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center',
                      gap: '10px', padding: '9px 16px',
                      fontSize: '0.875rem', fontWeight: 500,
                      color: 'var(--error)', background: 'transparent',
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                      transition: 'var(--transition-fast)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#FEF2F2')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile hamburger (CSS-shown) */}
      <style>{`
        @media (max-width: 768px) {
          #sidebar-toggle { display: flex !important; }
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </header>
  );
}

/* ─── Menu Link ─────────────────────────────────────────── */
function MenuLink({
  href, icon: Icon, label, onClick,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '9px 16px', fontSize: '0.875rem',
        fontWeight: 500, color: 'var(--text-primary)',
        textDecoration: 'none', transition: 'var(--transition-fast)',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <Icon size={15} style={{ color: 'var(--text-muted)' }} />
      {label}
    </Link>
  );
}
