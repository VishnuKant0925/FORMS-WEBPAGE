import type { Metadata } from 'next';
import SubmissionTable from '@/components/history/SubmissionTable';

export const metadata: Metadata = { title: 'Submission History — NRSC SLMS' };

export default function HistoryPage() {
  return (
    <div className="py-4">
      <h1 className="text-xl font-bold text-[#1F2937] mb-6">My Submission History</h1>
      <SubmissionTable />
    </div>
  );
}
