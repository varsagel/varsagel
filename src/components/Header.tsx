import { auth } from "@/auth";
import { Bell, MessageSquare, User, LogOut, PlusCircle, Menu, ChevronDown, Settings, List } from "lucide-react";
import Link from "next/link";
import SignOutLink from "./SignOutLink";

import { Logo } from "@/components/Logo";

export default async function Header() {
  const session = await auth();
  const isAuth = !!session?.user?.email;
  const firstName = session?.user?.name?.split(" ")?.[0] || "Hesabım";
  const initial = session?.user?.name?.trim()?.[0]?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="relative z-10">
          <Logo className="w-10 h-10" textClassName="text-2xl" />
        </Link>

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
                </Link>
                <Link href="/bildirimler" className="relative p-2.5 text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all" title="Bildirimler">
                  <Bell className="w-5 h-5" />
                </Link>
              </div>

              <div className="h-6 w-px bg-gray-200"></div>

              <details className="relative group">
                <summary className="list-none flex items-center gap-3 pl-2 cursor-pointer select-none outline-none">
                  <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 group-hover:border-cyan-200 group-hover:bg-cyan-50 transition-all">
                    <User className="w-5 h-5 text-gray-600 group-hover:text-cyan-600" />
                  </div>
                  <div className="hidden lg:flex flex-col items-start">
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-cyan-600 transition-colors">
                      {firstName}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  <div className="px-4 py-2 border-b border-gray-100 mb-2">
                    <p className="text-sm font-semibold text-gray-900">{session?.user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
                  </div>

                  <Link
                    href="/profil"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profilim
                  </Link>

                  <Link
                    href="/profil?tab=taleplerim"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition-colors"
                  >
                    <List className="w-4 h-4" />
                    Taleplerim
                  </Link>

                  <Link
                    href="/profil?tab=ayarlar"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Ayarlar
                  </Link>

                  <div className="h-px bg-gray-100 my-2"></div>

                  <SignOutLink className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut className="w-4 h-4" />
                    Çıkış Yap
                  </SignOutLink>
                </div>
              </details>
            </div>
          )}
        </nav>

        <details className="md:hidden relative">
          <summary className="list-none p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer select-none relative z-10">
            <Menu className="w-6 h-6" />
          </summary>
          <div className="absolute top-14 right-0 w-[calc(100vw-2rem)] max-w-sm bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden">
            <div className="p-4 space-y-4">
              {isAuth && (
                <div className="flex items-center gap-3 p-4 bg-cyan-50 rounded-xl">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-cyan-600 font-bold shadow-sm">
                    {initial}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{session?.user?.name}</p>
                    <p className="text-xs text-gray-500">{session?.user?.email}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/talep-olustur"
                  prefetch={false}
                  className="col-span-2 flex items-center justify-center gap-2 bg-cyan-600 text-white p-3 rounded-xl font-medium shadow-md active:scale-95 transition-transform"
                >
                  <PlusCircle className="w-5 h-5" />
                  Talep Oluştur
                </Link>

                {isAuth && (
                  <>
                    <Link
                      href="/mesajlar"
                      className="flex flex-col items-center justify-center gap-2 bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <MessageSquare className="w-6 h-6 text-cyan-600" />
                      <span className="text-sm font-medium text-gray-700">Mesajlar</span>
                    </Link>
                    <Link
                      href="/bildirimler"
                      className="flex flex-col items-center justify-center gap-2 bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors relative"
                    >
                      <Bell className="w-6 h-6 text-cyan-600" />
                      <span className="text-sm font-medium text-gray-700">Bildirimler</span>
                    </Link>
                  </>
                )}
              </div>

              <nav className="space-y-1">
                <Link
                  href="/#kategoriler"
                  className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <List className="w-5 h-5 text-gray-400" />
                  Kategoriler
                </Link>

                {isAuth ? (
                  <>
                    <Link
                      href="/profil"
                      className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <User className="w-5 h-5 text-gray-400" />
                      Profilim
                    </Link>
                    <Link
                      href="/profil?tab=ayarlar"
                      className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <Settings className="w-5 h-5 text-gray-400" />
                      Ayarlar
                    </Link>
                    <SignOutLink className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                      <LogOut className="w-5 h-5" />
                      Çıkış Yap
                    </SignOutLink>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <Link
                      href="/giris"
                      className="inline-flex items-center justify-center border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium h-10 px-4 py-2 rounded-md text-sm transition-colors"
                    >
                      Giriş Yap
                    </Link>
                    <Link
                      href="/kayit"
                      className="inline-flex items-center justify-center bg-cyan-600 text-white hover:bg-cyan-700 font-medium h-10 px-4 py-2 rounded-md text-sm transition-colors"
                    >
                      Kayıt Ol
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
