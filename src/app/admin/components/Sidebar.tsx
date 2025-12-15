"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Users, Tag, Flag, Settings, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const menuItems = [
  { name: "Genel Bakış", href: "/admin", icon: LayoutDashboard },
  { name: "Talep Yönetimi", href: "/admin/talepler", icon: FileText },
  { name: "Kullanıcılar", href: "/admin/users", icon: Users },
  { name: "Teklifler", href: "/admin/offers", icon: Tag },
  { name: "Şikayetler", href: "/admin/reports", icon: Flag },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            V
          </div>
          <span className="text-xl font-bold text-gray-900">Varsagel</span>
        </Link>
        <div className="mt-2 text-xs font-medium text-gray-500 uppercase tracking-wider pl-1">Yönetim Paneli</div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-cyan-50 text-cyan-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-cyan-600" : "text-gray-400"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Çıkış Yap
        </button>
      </div>
    </div>
  );
}

