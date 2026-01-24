import type { Metadata } from 'next';
import { metadataBase } from '@/lib/metadata-base';

export const metadata: Metadata = {
  title: 'Giriş Yap | Varsagel',
  description:
    'Varsagel hesabınıza giriş yapın. Talep oluşturun, teklif verin ve mesajlarınızı yönetin.',
  metadataBase: metadataBase,
  robots: {
    index: false,
    follow: false,
  },
};

export default function GirisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
