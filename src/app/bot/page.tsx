import { auth, getAdminUserId } from "@/auth";
import { redirect } from "next/navigation";
import BotClient from "./BotClient";

export default async function BotPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/giris');

  const SUPER_EMAIL = 'varsagel.com@gmail.com';
  const isSuper = (session.user.email || '') === SUPER_EMAIL;

  const adminId = await getAdminUserId();
  if (!adminId && !isSuper) redirect('/');

  return <BotClient />;
}
