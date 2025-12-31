"use client";

import { useState, useEffect } from "react";
import { Search, User, Shield, ShieldAlert, Check } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import Image from "next/image";

type UserData = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  createdAt: string;
  _count: {
    listings: number;
    offers: number;
  };
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`Kullanıcı rolünü ${newRole} olarak değiştirmek istediğinize emin misiniz?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      });

      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        toast({ title: "Başarılı", description: "Kullanıcı rolü güncellendi", variant: "success" });
      } else {
        toast({ title: "Hata", description: "Güncelleme başarısız", variant: "destructive" });
      }
    } catch {
      toast({ title: "Hata", description: "Bir hata oluştu", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
          <p className="text-gray-500">Kayıtlı kullanıcıları ve yetkilerini yönetin.</p>
        </div>
        <div className="relative w-64">
          <input
            type="text"
            placeholder="İsim veya E-posta ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Kullanıcı</th>
              <th className="px-6 py-4">Rol</th>
              <th className="px-6 py-4">İlan/Teklif</th>
              <th className="px-6 py-4">Kayıt Tarihi</th>
              <th className="px-6 py-4 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Yükleniyor...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Kullanıcı bulunamadı.</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <Image src={user.image} alt={user.name || ""} width={40} height={40} className="rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{user.name || "İsimsiz"}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.role === "ADMIN" ? (
                      <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-semibold">
                        <ShieldAlert className="w-3 h-3" /> ADMIN
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                        <User className="w-3 h-3" /> USER
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex gap-3">
                      <span title="İlan Sayısı">📝 {user._count.listings}</span>
                      <span title="Teklif Sayısı">💬 {user._count.offers}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {user.role === "USER" && (
                        <button
                          onClick={() => handleRoleChange(user.id, "ADMIN")}
                          className="text-purple-600 hover:bg-purple-50 px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                        >
                          Admin Yap
                        </button>
                      )}
                      {user.role === "ADMIN" && (
                        <button
                          onClick={() => handleRoleChange(user.id, "USER")}
                          className="text-gray-600 hover:bg-gray-100 px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                        >
                          Yetkiyi Al
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
