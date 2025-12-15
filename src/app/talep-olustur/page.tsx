import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import TalepForm from './TalepForm';

export const dynamic = 'force-dynamic';

export default async function TalepOlusturPage() {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/giris?callbackUrl=/talep-olustur');
  }

  return <TalepForm />;
}
