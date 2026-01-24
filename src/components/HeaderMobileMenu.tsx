"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, List, LogOut, Menu, MessageSquare, PlusCircle, Settings, User } from "lucide-react";
import SignOutLink from "./SignOutLink";

export default function HeaderMobileMenu({
  isAuth,
  initial,
  userName,
  userEmail,
  unreadNotifications,
  unreadMessages,
}: {
  isAuth: boolean;
  initial: string;
  userName?: string | null;
  userEmail?: string | null;
  unreadNotifications?: number;
  unreadMessages?: number;
}) {
  const detailsRef = useRef<HTMLDetailsElement | null>(null);
  const pathname = usePathname();

  const safeName = useMemo(() => userName || "Hesabım", [userName]);
  const safeEmail = useMemo(() => userEmail || "", [userEmail]);

  const closeMenu = () => {
    detailsRef.current?.removeAttribute("open");
  };

  useEffect(() => {
    closeMenu();
  }, [pathname]);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const root = detailsRef.current;
      if (!root) return;
      if (!root.hasAttribute("open")) return;
      const target = e.target as Node | null;
      if (target && root.contains(target)) return;
      closeMenu();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, []);

  return (
    <details ref={detailsRef} className="md:hidden relative">
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
                <p className="font-semibold text-gray-900">{safeName}</p>
                <p className="text-xs text-gray-500">{safeEmail}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/talep-olustur"
              prefetch={false}
              onClick={closeMenu}
              className="col-span-2 flex items-center justify-center gap-2 bg-cyan-600 text-white p-3 rounded-xl font-medium shadow-md active:scale-95 transition-transform"
            >
              <PlusCircle className="w-5 h-5" />
              Talep Oluştur
            </Link>

            {isAuth && (
              <>
                <Link
                  href="/mesajlar"
                  onClick={closeMenu}
                  className="flex flex-col items-center justify-center gap-2 bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors relative"
                >
                  <MessageSquare className="w-6 h-6 text-cyan-600" />
                  <span className="text-sm font-medium text-gray-700">Mesajlar</span>
                  {(unreadMessages || 0) > 0 && (
                    <span className="absolute top-2 right-2 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-rose-600 text-white text-[11px] font-extrabold shadow-md ring-2 ring-gray-50">
                      {(unreadMessages || 0) > 99 ? "99+" : unreadMessages}
                    </span>
                  )}
                </Link>
                <Link
                  href="/bildirimler"
                  onClick={closeMenu}
                  className="flex flex-col items-center justify-center gap-2 bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors relative"
                >
                  <Bell className="w-6 h-6 text-cyan-600" />
                  <span className="text-sm font-medium text-gray-700">Bildirimler</span>
                  {(unreadNotifications || 0) > 0 && (
                    <span className="absolute top-2 right-2 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-rose-600 text-white text-[11px] font-extrabold shadow-md ring-2 ring-gray-50">
                      {(unreadNotifications || 0) > 99 ? "99+" : unreadNotifications}
                    </span>
                  )}
                </Link>
              </>
            )}
          </div>

          <nav className="space-y-1">
            <Link
              href="/#kategoriler"
              onClick={closeMenu}
              className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <List className="w-5 h-5 text-gray-400" />
              Kategoriler
            </Link>

            {isAuth ? (
              <>
                <Link
                  href="/profil"
                  onClick={closeMenu}
                  className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <User className="w-5 h-5 text-gray-400" />
                  Profilim
                </Link>
                <Link
                  href="/profil?tab=ayarlar"
                  onClick={closeMenu}
                  className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <Settings className="w-5 h-5 text-gray-400" />
                  Ayarlar
                </Link>
                <SignOutLink
                  onBeforeSignOut={closeMenu}
                  className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Çıkış Yap
                </SignOutLink>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Link
                  href="/giris"
                  onClick={closeMenu}
                  className="inline-flex items-center justify-center border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium h-10 px-4 py-2 rounded-md text-sm transition-colors"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/kayit"
                  onClick={closeMenu}
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
  );
}
