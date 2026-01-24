import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAdminUserId } from '@/auth';
import { metadataBase } from '@/lib/metadata-base';

export const metadata: Metadata = {
  title: 'Admin Paneli | Varsagel',
  description:
    'Varsagel admin panelinden talepleri, teklifleri, şikayetleri ve kullanıcıları yönetin.',
  metadataBase: metadataBase,
  robots: {
    index: false,
    follow: false,
  },
};

import AdminSidebar from './components/AdminSidebar';
import Header from './components/Header';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminId = await getAdminUserId();
  if (!adminId) redirect('/');

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
