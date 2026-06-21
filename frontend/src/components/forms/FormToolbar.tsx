'use client';
/**
 * FormToolbar — Shared top bar for all 4 NRSC forms.
 *
 * Shows:
 *  - Auto-save status (saving / saved / error / idle)
 *  - Save Draft button
 *  - Script language selector (always-on — selects WHICH Indic script)
 *
 * Transliteration is always-on. There is no enable/disable toggle.
 */

import React from 'react';
import { Save, Globe, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useTranslitStore, TRANSLIT_LANGUAGES, TranslitCode } from '@/store/useTranslitStore';

interface FormToolbarProps {
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved:  Date | null;
  onSave:     () => void;
  isSaving:   boolean;
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  saving: <Loader2 size={13} className="animate-spin" />,
  saved:  <CheckCircle size={13} style={{ color: 'var(--success)' }} />,
  error:  <AlertCircle size={13} style={{ color: 'var(--error)' }} />,
  idle:   <Save size={13} style={{ color: 'var(--text-muted)' }} />,
};
const STATUS_TEXT: Record<string, string> = {
  saving: 'Saving draft…',
  saved:  'Draft saved',
  error:  'Save failed',
  idle:   'All changes saved',
};

export default function FormToolbar({ saveStatus, lastSaved, onSave, isSaving }: FormToolbarProps) {
  const { lang, setLang } = useTranslitStore();

  return (
    <div style={{
      display:        'flex',
      flexWrap:       'wrap',
      alignItems:     'center',
      justifyContent: 'space-between',
      gap:            '12px',
      padding:        '11px 18px',
      marginBottom:   '20px',
      background:     'var(--surface)',
      border:         '1px solid var(--border)',
      borderRadius:   'var(--radius-lg)',
      boxShadow:      'var(--shadow-xs)',
    }}>

      {/* ── Left: Save status + button ────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          {STATUS_ICON[saveStatus]}
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {STATUS_TEXT[saveStatus]}
            {saveStatus === 'saved' && lastSaved && (
              <span style={{ marginLeft: '4px', color: 'var(--text-subtle)', fontWeight: 400 }}>
                at {lastSaved.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </span>
        </div>

        <button
          type="button"
          id="form-save-draft"
          onClick={onSave}
          disabled={isSaving}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Save size={13} />
          Save Draft
        </button>
      </div>

      {/* ── Right: Script language (always-on) ────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Globe size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          लिप्यंतरण /
        </span>
        <select
          id="translit-lang-selector"
          value={lang}
          onChange={e => setLang(e.target.value as TranslitCode)}
          className="form-input"
          style={{ padding: '5px 28px 5px 10px', fontSize: '0.8rem', maxWidth: '175px', height: 'auto' }}
          aria-label="Transliteration script language"
        >
          {TRANSLIT_LANGUAGES.map(l => (
            <option key={l.code} value={l.code}>
              {l.label} ({l.native})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
