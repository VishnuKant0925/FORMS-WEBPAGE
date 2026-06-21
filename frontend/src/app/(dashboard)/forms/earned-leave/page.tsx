import type { Metadata } from 'next';
import EarnedLeaveForm from '@/components/forms/EarnedLeaveForm';

export const metadata: Metadata = { title: 'NRSC Leave/Extension — NRSC SLMS' };

export default async function EarnedLeavePage(props: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const searchParams = await props.searchParams;
  const draftId = searchParams.edit || undefined;

  return (
    <div className="py-4">
      <EarnedLeaveForm draftId={draftId} />
    </div>
  );
}
