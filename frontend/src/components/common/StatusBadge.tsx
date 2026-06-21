'use client';

import { useLangStore } from '@/store/useLangStore';

type Status = 'draft' | 'submitted' | 'recommended' | 'approved' | 'rejected' | 'returned';

const STATUS_CONFIG: Record<Status, { className: string; labelEn: string; labelHi: string }> = {
  draft:       { className: 'badge badge-draft',       labelEn: 'Draft',       labelHi: 'मसौदा'     },
  submitted:   { className: 'badge badge-submitted',   labelEn: 'Submitted',   labelHi: 'जमा किया'  },
  recommended: { className: 'badge badge-recommended', labelEn: 'Recommended', labelHi: 'अनुशंसित'  },
  approved:    { className: 'badge badge-approved',    labelEn: 'Approved',    labelHi: 'मंजूर'      },
  rejected:    { className: 'badge badge-rejected',    labelEn: 'Rejected',    labelHi: 'अस्वीकृत'  },
  returned:    { className: 'badge badge-returned',    labelEn: 'Returned',    labelHi: 'वापस किया' },
};

export default function StatusBadge({ status }: { status: string }) {
  const { lang } = useLangStore();
  const cfg = STATUS_CONFIG[status as Status] ?? {
    className: 'badge badge-draft',
    labelEn: status,
    labelHi: status,
  };
  return (
    <span className={cfg.className} aria-label={`Status: ${cfg.labelEn}`}>
      {lang === 'hi' ? cfg.labelHi : cfg.labelEn}
    </span>
  );
}
