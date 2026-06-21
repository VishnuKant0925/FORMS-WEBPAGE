import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Admin Panel — NRSC SLMS' };
export default function AdminPage() {
  return (
    <div>
      <h1 className="text-xl font-700 text-[#1F2937] mb-2">Admin Panel</h1>
      <p className="text-sm text-[#6B7280] mb-8 hindi" lang="hi">प्रशासन नियंत्रण</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a href="/admin/submissions" className="card hover:shadow-card-hover transition-shadow">
          <h3 className="font-600 text-[#1F2937] mb-1">All Submissions</h3>
          <p className="text-sm text-[#6B7280]">View, approve, reject, and return leave applications</p>
        </a>
        <a href="/admin/analytics" className="card hover:shadow-card-hover transition-shadow">
          <h3 className="font-600 text-[#1F2937] mb-1">Analytics</h3>
          <p className="text-sm text-[#6B7280]">Monthly trends, leave distribution, department stats</p>
        </a>
      </div>
    </div>
  );
}
