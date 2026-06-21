import type { Metadata } from 'next';
import AdminSubmissionsTable from '@/components/admin/AdminSubmissionsTable';

export const metadata: Metadata = { title: 'All Submissions — Admin — NRSC SLMS' };

export default function AdminSubmissionsPage() {
  return (
    <div className="py-4">
      <h1 className="text-xl font-bold text-[#1F2937] mb-6">Employee Leave Applications</h1>
      <AdminSubmissionsTable />
    </div>
  );
}
