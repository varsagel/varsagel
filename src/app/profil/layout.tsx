import type { Metadata } from 'next';
import { metadataBase } from '@/lib/metadata-base';

export const metadata: Metadata = {
  title: 'Profilim | Varsagel',
  description:
    'Varsagel profilinizden taleplerinizi, tekliflerinizi, favorilerinizi ve bildirimlerinizi yönetin.',
  metadataBase: metadataBase,
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfilLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
