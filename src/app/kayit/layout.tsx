import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kayıt Ol | Varsagel',
  description:
    'Varsagel’e ücretsiz üye olun, alım taleplerinizi oluşturun ve satıcılardan teklif alın.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function KayitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

