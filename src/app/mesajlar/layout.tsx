import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mesajlar | Varsagel',
  description:
    'Varsagel üzerinden alıcılar ve satıcılar ile yaptığınız yazışmaları görüntüleyin.',
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

