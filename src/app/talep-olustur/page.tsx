import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import TalepForm from './TalepForm';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Talep Oluştur | Varsagel",
  description:
    "İhtiyacını detaylıca anlat, alım talebi oluştur. Güvenilir satıcılardan hızlı ve rekabetçi teklifler al.",
  alternates: {
    canonical: "/talep-olustur",
  },
  openGraph: {
    title: "Talep Oluştur | Varsagel",
    description:
      "Bütçene ve ihtiyacına göre talebini oluştur, satıcılar sana teklif versin.",
    type: "website",
    url: "/talep-olustur",
    siteName: "Varsagel",
    locale: "tr_TR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Talep Oluştur | Varsagel",
    description:
      "İhtiyacını yaz, onlarca teklif arasından en uygununu seç. Türkiye'nin ilk alım platformu Varsagel'de talep oluştur.",
    creator: "@varsagel",
  },
};

export default async function TalepOlusturPage() {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/giris?callbackUrl=/talep-olustur');
  }

  return <TalepForm />;
}
