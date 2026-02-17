"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, List, Users, FolderTree, Settings, LogOut, FileText, SlidersHorizontal, Rocket, ShieldCheck, X, MessageSquare, Flag } from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: "/admin", label: "Genel Bakış", icon: LayoutDashboard },
    { href: "/admin/talepler", label: "Talepler", icon: List },
    { href: "/admin/sorular", label: "Sorular", icon: MessageSquare },
    { href: "/admin/reports", label: "Şikayet Edilen Talepler", icon: Flag },
    { href: "/admin/scans", label: "Virüs Tarama", icon: ShieldCheck },
    { href: "/admin/kategoriler", label: "Kategoriler", icon: FolderTree },
    { href: "/admin/attributes", label: "Özellik Yönetimi", icon: SlidersHorizontal },
    { href: "/admin/kullanicilar", label: "Kullanıcılar", icon: Users },
    { href: "/admin/sayfalar", label: "Sayfa Yönetimi", icon: FileText },
    { href: "/admin/deploy", label: "Deploy / Güncelle", icon: Rocket },
    { href: "/admin/ayarlar", label: "Ayarlar", icon: Settings },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transform -translate-x-full transition-transform duration-300 peer-checked:translate-x-0 md:translate-x-0 md:static md:min-h-screen">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h1 className="text-xl font-bold text-cyan-700">Varsagel Admin</h1>
        <label htmlFor="admin-sidebar-toggle" className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer">
          <X className="w-5 h-5" />
        </label>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                isActive 
                  ? "bg-cyan-50 text-cyan-700" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-cyan-600 rounded-lg hover:bg-gray-50 transition-colors">
          <LogOut className="w-5 h-5" />
          Siteye Dön
        </Link>
      </div>
    </aside>
  );
}
