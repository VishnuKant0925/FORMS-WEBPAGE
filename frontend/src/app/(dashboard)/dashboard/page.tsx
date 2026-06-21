import type { Metadata } from 'next';
import DashboardContent from '@/components/dashboard/DashboardContent';

export const metadata: Metadata = {
  title: 'Dashboard — NRSC Smart Leave Management System',
  description: 'View your leave application statistics, recent activity, and quick actions.',
};

export default function DashboardPage() {
  return <DashboardContent />;
}
