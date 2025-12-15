"use client";

import { useState } from "react";
import { toggleUserRole, deleteUser } from "../actions";
import { Shield, ShieldOff, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserTable({ users }: { users: any[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (id: string, action: typeof toggleUserRole) => {
    if (!confirm("Bu işlemden emin misiniz?")) return;
    setLoadingId(id);
    try {
      const res = await action(id);
      if (!res.success) alert(res.error);
      else router.refresh();
    } catch {
      alert("İşlem başarısız");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Kullanıcı</th>
              <th className="px-6 py-4">Rol</th>
              <th className="px-6 py-4">Kayıt Tarihi</th>
              <th className="px-6 py-4">Talepler</th>
              <th className="px-6 py-4 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{u.name || "İsimsiz"}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(u.createdAt).toLocaleDateString('tr-TR')}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {u._count.listings} Talep / {u._count.offers} Teklif
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button 
                    onClick={() => handleAction(u.id, toggleUserRole)}
                    disabled={loadingId === u.id}
                    className="inline-flex p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg disabled:opacity-50" 
                    title={u.role === 'ADMIN' ? "Admin Yetkisini Al" : "Admin Yap"}
                  >
                    {u.role === 'ADMIN' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => handleAction(u.id, deleteUser)}
                    disabled={loadingId === u.id}
                    className="inline-flex p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50" 
                    title="Kullanıcıyı Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

