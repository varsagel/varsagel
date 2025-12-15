"use client";
import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const search = useSearchParams();
  useEffect(() => {
    const send = async () => {
      try {
        await fetch('/api/analytics/visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pathname: `${pathname}${search?.toString() ? `?${search!.toString()}` : ''}` })
        });
      } catch {}
    };
    send();
  }, [pathname, search]);
  return <SessionProvider basePath="/api/auth">{children}</SessionProvider>;
}
