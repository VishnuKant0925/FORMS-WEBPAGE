interface FormHeaderProps {
  orgNameHindi: string;
  orgNameEnglish: string;
  deptLine?: string;
  formTitleHindi: string;
  formTitleEnglish: string;
  formCode?: string; // Add optional form code support
}

export default function FormHeader({
  orgNameHindi,
  orgNameEnglish,
  deptLine = 'अन्तरिक्ष विभाग, भारत सरकार / Dept. of Space, Govt. of India',
  formTitleHindi,
  formTitleEnglish,
  formCode,
}: FormHeaderProps) {
  return (
    <div className="form-header">
      {/* Custom Brand Logo */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <div style={{
          width: '56px', height: '56px',
          borderRadius: '50%',
          overflow: 'hidden',
          background: '#FFFFFF',
          border: '1.5px solid rgba(11, 94, 215, 0.15)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
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
      </div>

      {/* Org Name */}
      <p className="org-name-hindi hindi" lang="hi" style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px', textAlign: 'center' }}>
        {orgNameHindi}
      </p>
      <p className="org-name-en" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.01em', margin: '0 0 2px', textAlign: 'center' }}>
        {orgNameEnglish}
      </p>
      <p className="dept-line" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0', textAlign: 'center' }}>
        {deptLine}
      </p>

      {/* Divider */}
      <div className="border-t border-[#D9E2EC] my-4" />

      {/* Form Title */}
      <p className="form-title-hindi hindi" lang="hi" style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px', textAlign: 'center' }}>
        {formTitleHindi}
      </p>
      <p className="form-title-en" style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', margin: '0', textAlign: 'center' }}>
        {formTitleEnglish} {formCode && <span style={{ color: 'var(--text-muted)' }}>({formCode})</span>}
      </p>
    </div>
  );
}
