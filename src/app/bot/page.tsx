import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import BotClient from "./BotClient";

export const dynamic = 'force-dynamic';

export default async function BotPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/giris');

  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, email: true, role: true } });
  const SUPER_EMAIL = 'varsagel.com@gmail.com';
  const isSuper = me?.email === SUPER_EMAIL;
  const isAdmin = (me?.role || '').toUpperCase() === 'ADMIN';

  if (isSuper && !isAdmin) {
    await prisma.user.update({ where: { id: me!.id }, data: { role: 'ADMIN' } }).catch(() => {});
  }
  if (!(isAdmin || isSuper)) redirect('/');

  return <BotClient />;
}
