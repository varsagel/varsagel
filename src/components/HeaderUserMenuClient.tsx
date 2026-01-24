"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, Settings, User, List } from "lucide-react";
import SignOutLink from "./SignOutLink";

export default function HeaderUserMenuClient({
  firstName,
  name,
  email,
}: {
  firstName: string;
  name?: string | null;
  email?: string | null;
}) {
  const detailsRef = useRef<HTMLDetailsElement | null>(null);

  const safeFirstName = useMemo(() => firstName || "Hesabım", [firstName]);
  const safeName = useMemo(() => name || "Hesabım", [name]);
  const safeEmail = useMemo(() => email || "", [email]);

  const closeMenu = () => {
    detailsRef.current?.removeAttribute("open");
  };

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
    <details ref={detailsRef} className="relative group">
      <summary className="list-none flex items-center gap-3 pl-2 cursor-pointer select-none outline-none">
        <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 group-hover:border-cyan-200 group-hover:bg-cyan-50 transition-all">
          <User className="w-5 h-5 text-gray-600 group-hover:text-cyan-600" />
        </div>
        <div className="hidden lg:flex flex-col items-start">
          <span className="text-sm font-semibold text-gray-700 group-hover:text-cyan-600 transition-colors">
            {safeFirstName}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-200 group-open:rotate-180" />
      </summary>

      <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
        <div className="px-4 py-2 border-b border-gray-100 mb-2">
          <p className="text-sm font-semibold text-gray-900">{safeName}</p>
          <p className="text-xs text-gray-500 truncate">{safeEmail}</p>
        </div>

        <Link
          href="/profil"
          onClick={closeMenu}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition-colors"
        >
          <User className="w-4 h-4" />
          Profilim
        </Link>

        <Link
          href="/profil?tab=taleplerim"
          onClick={closeMenu}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition-colors"
        >
          <List className="w-4 h-4" />
          Taleplerim
        </Link>

        <Link
          href="/profil?tab=ayarlar"
          onClick={closeMenu}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition-colors"
        >
          <Settings className="w-4 h-4" />
          Ayarlar
        </Link>

        <div className="h-px bg-gray-100 my-2"></div>

        <SignOutLink
          onBeforeSignOut={closeMenu}
          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Çıkış Yap
        </SignOutLink>
      </div>
    </details>
  );
}

