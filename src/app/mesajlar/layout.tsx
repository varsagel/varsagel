import type { Metadata } from 'next';
import { metadataBase } from '@/lib/metadata-base';

export const metadata: Metadata = {
  title: 'Mesajlar | Varsagel',
  description:
    'Varsagel üzerinden alıcılar ve satıcılar ile yaptığınız yazışmaları görüntüleyin.',
  metadataBase: metadataBase,
  robots: {
    index: false,
    follow: false,
  },
};

export default function MesajlarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
