'use client';

import { ClipboardList, BarChart3, Shield } from 'lucide-react';

export default function AdminPanelContent() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #0B5ED7, #1E88E5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Shield size={20} color="#fff" strokeWidth={2} />
          </div>
          <div>
            <h1 style={{
              fontSize: '1.375rem', fontWeight: 700,
              color: 'var(--text-primary)', lineHeight: 1.3,
            }}>
              Admin Panel
            </h1>
            <p className="hindi" lang="hi" style={{
              fontSize: '0.8125rem', color: 'var(--text-muted)',
              lineHeight: 1.4, marginTop: 2,
            }}>
              प्रशासन नियंत्रण
            </p>
          </div>
        </div>
      </div>

      {/* Admin Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 20,
      }}>
        {/* All Submissions Card */}
        <a
          href="/admin/submissions"
          style={{
            display: 'block',
            textDecoration: 'none',
            color: 'inherit',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 28,
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
          className="admin-panel-card"
        >
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: '#EBF2FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
          }}>
            <ClipboardList size={22} color="#0B5ED7" strokeWidth={2} />
          </div>
          <h3 style={{
            fontSize: '1.0625rem', fontWeight: 600,
            color: 'var(--text-primary)', marginBottom: 8,
          }}>
            All Submissions
          </h3>
          <p style={{
            fontSize: '0.875rem', color: 'var(--text-muted)',
            lineHeight: 1.6, margin: 0,
          }}>
            View, approve, reject, and return leave applications
          </p>
        </a>

        {/* Analytics Card */}
        <a
          href="/admin/analytics"
          style={{
            display: 'block',
            textDecoration: 'none',
            color: 'inherit',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 28,
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
          className="admin-panel-card"
        >
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: '#E8F5E9',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
          }}>
            <BarChart3 size={22} color="#2E7D32" strokeWidth={2} />
          </div>
          <h3 style={{
            fontSize: '1.0625rem', fontWeight: 600,
            color: 'var(--text-primary)', marginBottom: 8,
          }}>
            Analytics
          </h3>
          <p style={{
            fontSize: '0.875rem', color: 'var(--text-muted)',
            lineHeight: 1.6, margin: 0,
          }}>
            Monthly trends, leave distribution, department stats
          </p>
        </a>
      </div>
    </div>
  );
}
