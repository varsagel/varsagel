import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Giriş Yap | Varsagel',
  description:
    'Varsagel hesabınıza giriş yapın. Talep oluşturun, teklif verin ve mesajlarınızı yönetin.',
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

