"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Header() {
  const { data: session, status } = useSession();
  const isAuth = status === "authenticated";
  const [unread, setUnread] = useState<number>(0);

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

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-block h-6 w-6 rounded bg-primary"></span>
          <span className="text-xl font-semibold tracking-tight">Varsagel</span>
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            href="/#kategoriler"
            className="rounded-md border px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
          >
            Kategoriler
          </Link>
          <Link
            href="/ilan-ver"
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm hover:bg-primary/90"
          >
            Alıcı İlanı Ver
          </Link>
          {!isAuth ? (
            <div className="flex items-center gap-2">
              <Link
                href="/giris"
                className="rounded-md border px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
              >
                Giriş Yap
              </Link>
              <Link
                href="/kayit"
                className="rounded-md bg-secondary text-secondary-foreground px-4 py-2 text-sm hover:bg-secondary/80"
              >
                Kayıt Ol
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{session.user?.name ?? session.user?.email}</span>
              <Link
                href="/profil"
                className="rounded-md border px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
              >
                Profil
              </Link>
              <Link href="/mesajlar" className="relative rounded-md border px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground">
                ✉️ Mesajlar
              </Link>
              <Link href="/bildirimler" className="relative rounded-md border px-3 py-2 text-sm hover:bg-accent">
                🔔
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs px-1 rounded">{unread}</span>
                )}
              </Link>
              <button
                className="rounded-md border px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => signOut()}
              >
                Çıkış Yap
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
