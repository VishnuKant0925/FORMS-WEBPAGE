import type { Metadata } from 'next';
import RrscCasualLeaveForm from '@/components/forms/RrscCasualLeaveForm';

export const metadata: Metadata = { title: 'RRSC-W CL/Spl CL/Comp Off — NRSC SLMS' };

export default async function RrscCasualLeavePage(props: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const searchParams = await props.searchParams;
  const draftId = searchParams.edit || undefined;

  return (
    <div className="py-4">
      <RrscCasualLeaveForm draftId={draftId} />
    </div>
  );
}
