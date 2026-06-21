import type { Metadata } from 'next';
import NrscCasualLeaveForm from '@/components/forms/NrscCasualLeaveForm';

export const metadata: Metadata = { title: 'NRSC Casual Leave — NRSC SLMS' };

export default async function CasualLeaveNrscPage(props: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const searchParams = await props.searchParams;
  const draftId = searchParams.edit || undefined;

  return (
    <div className="py-4">
      <NrscCasualLeaveForm draftId={draftId} />
    </div>
  );
}
