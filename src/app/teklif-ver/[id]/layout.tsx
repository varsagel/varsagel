import type { Metadata } from 'next';
import { metadataBase } from '@/lib/metadata-base';

export const metadata: Metadata = {
  title: 'Teklif Ver | Varsagel',
  description:
    'Varsagel’de ilgili talebe detaylı teklifinizi oluşturun, fiyat ve şartlarınızı paylaşın.',
  metadataBase: metadataBase,
  robots: {
    index: false,
    follow: false,
  },
};

export default function TeklifVerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
