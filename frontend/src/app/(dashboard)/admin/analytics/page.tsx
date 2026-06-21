import type { Metadata } from 'next';
import AnalyticsCharts from '@/components/admin/AnalyticsCharts';

export const metadata: Metadata = { title: 'Analytics — Admin — NRSC SLMS' };

export default function AdminAnalyticsPage() {
  return (
    <div className="py-4">
      <h1 className="text-xl font-bold text-[#1F2937] mb-6">Analytics Dashboard</h1>
      <AnalyticsCharts />
    </div>
  );
}
