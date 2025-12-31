import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profilim | Varsagel',
  description:
    'Varsagel profilinizden taleplerinizi, tekliflerinizi, favorilerinizi ve bildirimlerinizi yönetin.',
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

