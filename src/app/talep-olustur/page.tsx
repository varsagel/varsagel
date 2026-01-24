import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import TalepForm from './TalepForm';
import type { Metadata } from 'next';
import { metadataBase, siteUrl } from '@/lib/metadata-base';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Talep Oluştur | Varsagel",
  description:
    "İhtiyacını detaylıca anlat, alım talebi oluştur. Güvenilir satıcılardan hızlı ve rekabetçi teklifler al.",
  metadataBase: metadataBase,
  alternates: {
    canonical: "/talep-olustur",
  },
  openGraph: {
    title: "Talep Oluştur | Varsagel",
    description:
      "Bütçene ve ihtiyacına göre talebini oluştur, satıcılar sana teklif versin.",
    type: "website",
    url: `${siteUrl}/talep-olustur`,
    siteName: "Varsagel",
    locale: "tr_TR",
    images: [`${siteUrl}/opengraph-image`],
  },
  twitter: {
    card: "summary_large_image",
    title: "Talep Oluştur | Varsagel",
    description:
      "İhtiyacını yaz, onlarca teklif arasından en uygununu seç. Türkiye'nin ilk alım platformu Varsagel'de talep oluştur.",
    creator: "@varsagel",
    images: [`${siteUrl}/twitter-image`],
  },
};

export default async function TalepOlusturPage() {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/giris?callbackUrl=/talep-olustur');
  }

  return <TalepForm />;
}
