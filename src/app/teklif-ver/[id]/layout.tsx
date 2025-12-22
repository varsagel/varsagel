import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Teklif Ver | Varsagel',
  description:
    'Varsagel’de ilgili talebe detaylı teklifinizi oluşturun, fiyat ve şartlarınızı paylaşın.',
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

