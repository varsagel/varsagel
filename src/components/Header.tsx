"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { Bell, MessageSquare, User, LogOut, PlusCircle, Menu, X, ChevronDown, Settings, List } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Logo } from "@/components/Logo";

export default function Header() {
  const { data: session, status } = useSession();
  const isAuth = status === "authenticated";
  const [unread, setUnread] = useState<number>(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let es: EventSource | null = null;
    if (isAuth) {
      es = new EventSource("/api/notifications/stream");
      es.addEventListener("count", (e: any) => {
        try {
          const data = JSON.parse(e.data);
          setUnread(data.unread ?? 0);
        } catch {}
      });
    }
    return () => { if (es) es.close(); };
  }, [isAuth]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="relative z-10">
          <Logo className="w-10 h-10" textClassName="text-2xl" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/#kategoriler"
            className="text-sm font-medium text-gray-600 hover:text-cyan-600 transition-colors relative group"
          >
            Kategoriler
            <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-cyan-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </Link>
          
          <Link href="/talep-olustur">
             <Button className="gap-2 bg-cyan-600 hover:bg-cyan-700 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 rounded-xl">
               <PlusCircle className="w-4 h-4" />
               Talep Oluştur
             </Button>
          </Link>

          <div className="h-6 w-px bg-gray-200 mx-2"></div>

          {!isAuth ? (
            <div className="flex items-center gap-3">
              <Link href="/giris">
                <Button variant="ghost" className="text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 font-medium">
                  Giriş Yap
                </Button>
              </Link>
              <Link href="/kayit">
                <Button variant="outline" className="border-cyan-200 text-cyan-600 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-300 font-medium">
                  Kayıt Ol
                </Button>
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
                  {unread > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                  )}
                </Link>
              </div>

              <div className="h-6 w-px bg-gray-200"></div>

              {/* User Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 pl-2 group outline-none"
                >
                  <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 group-hover:border-cyan-200 group-hover:bg-cyan-50 transition-all">
                    <User className="w-5 h-5 text-gray-600 group-hover:text-cyan-600" />
                  </div>
                  <div className="hidden lg:flex flex-col items-start">
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-cyan-600 transition-colors">
                      {session.user?.name?.split(' ')[0] ?? 'Hesabım'}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="px-4 py-2 border-b border-gray-100 mb-2">
                      <p className="text-sm font-semibold text-gray-900">{session.user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                    </div>
                    
                    <Link 
                      href="/profil" 
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Profilim
                    </Link>
                    
                    <Link 
                      href="/profil?tab=taleplerim" 
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <List className="w-4 h-4" />
                      Taleplerim
                    </Link>

                    <Link 
                      href="/profil?tab=ayarlar" 
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Ayarlar
                    </Link>

                    <div className="h-px bg-gray-100 my-2"></div>

                    <button
                      onClick={() => signOut({ callbackUrl: "https://varsagel.com/" })}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative z-10"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-0 bg-gray-800/20 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Mobile Menu Content */}
      <div className={`
        absolute top-16 left-0 w-full bg-white border-b border-gray-100 shadow-xl md:hidden transition-all duration-300 ease-in-out overflow-hidden
        ${isMobileMenuOpen ? 'max-h-[calc(100vh-4rem)] opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="p-4 space-y-4">
          {isAuth && (
            <div className="flex items-center gap-3 p-4 bg-cyan-50 rounded-xl mb-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-cyan-600 font-bold shadow-sm">
                {session.user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{session.user?.name}</p>
                <p className="text-xs text-gray-500">{session.user?.email}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Link 
              href="/talep-olustur"
              onClick={() => setIsMobileMenuOpen(false)}
              className="col-span-2 flex items-center justify-center gap-2 bg-cyan-600 text-white p-3 rounded-xl font-medium shadow-md active:scale-95 transition-transform"
            >
              <PlusCircle className="w-5 h-5" />
              Talep Oluştur
            </Link>

            {isAuth && (
              <>
                <Link 
                  href="/mesajlar"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex flex-col items-center justify-center gap-2 bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <MessageSquare className="w-6 h-6 text-cyan-600" />
                  <span className="text-sm font-medium text-gray-700">Mesajlar</span>
                </Link>
                <Link 
                  href="/bildirimler"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex flex-col items-center justify-center gap-2 bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors relative"
                >
                  <Bell className="w-6 h-6 text-cyan-600" />
                  {unread > 0 && (
                    <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                  <span className="text-sm font-medium text-gray-700">Bildirimler</span>
                </Link>
              </>
            )}
          </div>

          <nav className="space-y-1">
            <Link 
              href="/#kategoriler" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <List className="w-5 h-5 text-gray-400" />
              Kategoriler
            </Link>

            {isAuth && (
              <>
                <Link 
                  href="/profil" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <User className="w-5 h-5 text-gray-400" />
                  Profilim
                </Link>
                <Link 
                  href="/profil?tab=ayarlar" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <Settings className="w-5 h-5 text-gray-400" />
                  Ayarlar
                </Link>
                <button 
                  onClick={() => signOut({ callbackUrl: "https://varsagel.com/" })}
                  className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Çıkış Yap
                </button>
              </>
            )}

            {!isAuth && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Link href="/giris" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center border-gray-200">Giriş Yap</Button>
                </Link>
                <Link href="/kayit" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full justify-center bg-cyan-600 text-white hover:bg-cyan-700">Kayıt Ol</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

