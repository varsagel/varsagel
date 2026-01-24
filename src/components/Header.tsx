import { auth } from "@/auth";
import { Bell, MessageSquare, PlusCircle } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/Logo";
import HeaderMobileMenu from "./HeaderMobileMenu";
import HeaderSearch from "./HeaderSearch";
import { prisma } from "@/lib/prisma";
import HeaderUserMenuClient from "./HeaderUserMenuClient";

export default async function Header() {
  const session = await auth();
  const isAuth = !!session?.user?.email;
  const firstName = session?.user?.name?.split(" ")?.[0] || "Hesabım";
  const initial = session?.user?.name?.trim()?.[0]?.toUpperCase() || "U";
  const userId = (session?.user as any)?.id as string | undefined;
  const unreadNotifications = isAuth && userId
    ? await prisma.notification.count({ where: { userId, read: false, NOT: { type: "message" } } })
    : 0;
  const unreadMessages = isAuth && userId
    ? await prisma.message.count({ where: { toUserId: userId, read: false } })
    : 0;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
        <Link href="/" className="relative z-10">
          <Logo className="w-10 h-10" textClassName="text-2xl" />
        </Link>

        <div className="hidden md:flex flex-1 justify-center px-6">
          <div className="w-full max-w-xl">
            <HeaderSearch />
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/#kategoriler"
            className="text-sm font-medium text-gray-600 hover:text-cyan-600 transition-colors relative group"
          >
            Kategoriler
            <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-cyan-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </Link>
          
          <Link
            href="/talep-olustur"
            prefetch={false}
            className="inline-flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 rounded-xl h-10 px-4 py-2 text-sm font-medium"
          >
            <PlusCircle className="w-4 h-4" />
            Talep Oluştur
          </Link>

          <div className="h-6 w-px bg-gray-200 mx-2"></div>

          {!isAuth ? (
            <div className="flex items-center gap-3">
              <Link
                href="/giris"
                className="inline-flex items-center justify-center text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 font-medium h-10 px-4 py-2 rounded-md text-sm transition-colors"
              >
                Giriş Yap
              </Link>
              <Link
                href="/kayit"
                className="inline-flex items-center justify-center border border-cyan-200 text-cyan-600 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-300 font-medium h-10 px-4 py-2 rounded-md text-sm transition-colors"
              >
                Kayıt Ol
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Link href="/mesajlar" className="relative p-2.5 text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all" title="Mesajlar">
                  <MessageSquare className="w-5 h-5" />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-rose-600 text-white text-[11px] font-extrabold shadow-md ring-2 ring-white">
                      {unreadMessages > 99 ? "99+" : unreadMessages}
                    </span>
                  )}
                </Link>
                <Link href="/bildirimler" className="relative p-2.5 text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all" title="Bildirimler">
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-rose-600 text-white text-[11px] font-extrabold shadow-md ring-2 ring-white">
                      {unreadNotifications > 99 ? "99+" : unreadNotifications}
                    </span>
                  )}
                </Link>
              </div>

              <div className="h-6 w-px bg-gray-200"></div>

              <HeaderUserMenuClient firstName={firstName} name={session?.user?.name} email={session?.user?.email} />
            </div>
          )}
        </nav>

        <div className="flex md:hidden items-center gap-2 ml-auto">
          <HeaderSearch mode="icon" />
          <HeaderMobileMenu
            isAuth={isAuth}
            initial={initial}
            userName={session?.user?.name}
            userEmail={session?.user?.email}
            unreadNotifications={unreadNotifications}
            unreadMessages={unreadMessages}
          />
        </div>
      </div>
    </header>
  );
}
