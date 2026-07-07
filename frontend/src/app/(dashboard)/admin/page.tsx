import type { Metadata } from 'next';
import AdminPanelContent from './AdminPanelContent';

export const metadata: Metadata = { title: 'Admin Panel — NRSC SLMS' };

export default function AdminPage() {
  return <AdminPanelContent />;
}
