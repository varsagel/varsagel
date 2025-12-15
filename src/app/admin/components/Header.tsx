"use client";
import { useSession } from "next-auth/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { useState, useEffect } from "react";

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const currentQ = searchParams?.get("q") || "";
    setQuery(currentQ);
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    const params = new URLSearchParams();
    params.set("q", trimmed);

    if (trimmed.includes("@")) {
      router.push(`/admin/users?${params.toString()}`);
      return;
    }

    if (pathname.startsWith("/admin/talepler")) {
      const currentStatus = searchParams?.get("status") || "PENDING";
      params.set("status", currentStatus);
      router.push(`/admin/talepler?${params.toString()}`);
      return;
    }

    router.push(`/admin/talepler?${params.toString()}`);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <form onSubmit={handleSubmit} className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Kullanıcı veya talep ara..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-gray-900">{session?.user?.name || "Admin"}</div>
            <div className="text-xs text-gray-500">{session?.user?.email}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold border border-cyan-200">
            {session?.user?.name?.[0]?.toUpperCase() || "A"}
          </div>
        </div>
      </div>
    </header>
  );
}

