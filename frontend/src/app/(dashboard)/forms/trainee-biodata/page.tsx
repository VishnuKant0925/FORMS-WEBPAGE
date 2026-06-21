import type { Metadata } from 'next';
import TraineeBiodataForm from '@/components/forms/TraineeBiodataForm';

export const metadata: Metadata = { title: 'Trainee Bio-Data — NRSC SLMS' };

export default async function TraineeBiodataPage(props: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const searchParams = await props.searchParams;
  const draftId = searchParams.edit || undefined;

  return (
    <div className="py-4">
      <TraineeBiodataForm draftId={draftId} />
    </div>
  );
}
