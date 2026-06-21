'use client';
/**
 * SignatureUpload — Reusable employee signature upload widget.
 *
 * Features:
 *  - Drag-and-drop + click-to-browse
 *  - PNG / JPG / JPEG only, max 2 MB
 *  - Instant preview with remove button
 *  - Returns base64 data-URL to parent via onChange
 *  - Required for final submission, optional for draft save
 */

import React, { useCallback, useRef, useState } from 'react';
import { Upload, X, ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';

interface SignatureUploadProps {
  value?:         string;              // base64 data-URL or empty
  onChange:       (dataUrl: string) => void;
  required?:      boolean;
  errorMessage?:  string;
  labelHindi?:    string;
  labelEnglish?:  string;
}

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES  = ['image/png', 'image/jpeg', 'image/jpg'];

export default function SignatureUpload({
  value,
  onChange,
  required      = true,
  errorMessage,
  labelHindi    = 'कर्मचारी के हस्ताक्षर',
  labelEnglish  = 'Employee Signature',
}: SignatureUploadProps) {
  const inputRef           = useRef<HTMLInputElement>(null);
  const [isDragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = errorMessage ?? localError;

  const validate = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Only PNG, JPG, or JPEG files are accepted.';
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `File size must not exceed 2 MB. Selected file is ${(file.size / (1024 * 1024)).toFixed(2)} MB.`;
    }
    return null;
  };

  const processFile = useCallback((file: File) => {
    const err = validate(file);
    if (err) {
      setLocalError(err);
      return;
    }
    setLocalError(null);
    const reader = new FileReader();
    reader.onload = e => {
      onChange((e.target?.result as string) ?? '');
    };
    reader.readAsDataURL(file);
  }, [onChange]);

  /* ── Drag/Drop handlers ─────────────────────────── */
  const onDragEnter = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragging(false); };
  const onDrop      = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    /* Reset input so the same file can be re-selected after removal */
    if (inputRef.current) inputRef.current.value = '';
  };
  const remove = () => { setLocalError(null); onChange(''); };

  return (
    <div className="form-field-row">
      {/* Label */}
      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span className="label-hindi hindi" lang="hi">{labelHindi}</span>
        <span className="label-separator"> / </span>
        <span className="label-english">{labelEnglish}</span>
        {required && <span className="required-marker" aria-hidden="true">*</span>}
      </label>

      {/* Preview (when file is loaded) */}
      {value ? (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '16px',
          padding: '16px', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', background: 'var(--bg)',
        }}>
          {/* Signature preview */}
          <div style={{
            border: '1px solid var(--border)', borderRadius: '8px',
            overflow: 'hidden', background: '#fff',
            maxWidth: '240px', maxHeight: '100px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Uploaded signature preview"
              style={{ maxWidth: '240px', maxHeight: '100px', objectFit: 'contain' }}
            />
          </div>
          {/* Meta + remove */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--success)' }}>
                Signature uploaded
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              PNG / JPG · max 2 MB
            </span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                Replace
              </button>
              <button
                type="button"
                onClick={remove}
                className="btn btn-sm"
                style={{
                  fontSize: '0.75rem', color: 'var(--error)',
                  border: '1px solid var(--error)',
                  background: 'transparent', cursor: 'pointer',
                  padding: '4px 10px', borderRadius: 'var(--radius-sm)',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                <X size={11} /> Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Drop zone */
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload signature — click or drag and drop"
          onClick={() => inputRef.current?.click()}
          onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
          onDragEnter={onDragEnter}
          onDragOver={e => e.preventDefault()}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          style={{
            border: `2px dashed ${isDragging ? 'var(--primary)' : displayError ? 'var(--error)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '28px 24px',
            background: isDragging ? 'var(--primary-light)' : 'var(--bg)',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'border-color 0.15s, background 0.15s',
          }}
        >
          <div style={{
            width: '160px',
            height: '90px',
            position: 'relative',
            margin: '0 auto 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/signature_upload_illustration.png"
              alt="Signature Upload illustration"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '8px',
                opacity: isDragging ? 0.6 : 0.95,
                transition: 'opacity 0.15s',
              }}
            />
          </div>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {isDragging ? 'Drop signature image here' : 'Click to upload or drag & drop'}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            PNG, JPG, JPEG · Maximum 2 MB
          </p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        onChange={onFileChange}
        style={{ display: 'none' }}
        aria-hidden="true"
      />

      {/* Error */}
      {displayError && (
        <p className="field-error" role="alert" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <AlertCircle size={13} />
          {displayError}
        </p>
      )}
    </div>
  );
}
