"use client";

import { useState } from "react";
import { Check, X, Trash2, Eye, Filter, Search, Edit } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

export default function ListingTable({ listings, statusFilter }: { listings: any[], statusFilter: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (id: string, action: "approve" | "reject" | "delete") => {
    if (!confirm("Emin misiniz?")) return;
    setLoadingId(id);
    try {
      if (action === "approve") {
        const res = await fetch(`/api/talep?id=${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "OPEN" }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || "İşlem başarısız");
        }
        toast({
          title: "Başarılı",
          description: "Talep onaylandı.",
          variant: "default",
        });
      } else if (action === "reject") {
        const res = await fetch(`/api/talep?id=${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "REJECTED" }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || "İşlem başarısız");
        }
        toast({
          title: "Başarılı",
          description: "Talep reddedildi.",
          variant: "default",
        });
      } else {
        const res = await fetch(`/api/talep?id=${encodeURIComponent(id)}`, { method: "DELETE" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || "İşlem başarısız");
        }
        toast({
          title: "Başarılı",
          description: "Talep silindi.",
          variant: "default",
        });
      }
      router.refresh();
    } catch (e) {
      toast({
        title: "Hata",
        description: e instanceof Error ? e.message : "İşlem başarısız",
        variant: "destructive",
      });
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
              <th className="px-6 py-4">Başlık</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4">Fiyat</th>
              <th className="px-6 py-4">Kullanıcı</th>
              <th className="px-6 py-4">Durum</th>
              <th className="px-6 py-4">Tarih</th>
              <th className="px-6 py-4 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {listings.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  Bu filtrede talep bulunamadı.
                </td>
              </tr>
            ) : listings.map((l) => (
              <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900 line-clamp-1">{l.title}</div>
                  <div className="text-xs text-gray-500 line-clamp-1">{l.description}</div>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {l.category.name}
                  <span className="text-xs text-gray-400 block">{l.subCategory?.name}</span>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {l.budget ? `${Number(l.budget).toLocaleString()}` : '-'}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {l.owner.name}
                  <div className="text-xs text-gray-400">{l.owner.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${l.status === 'OPEN' ? 'bg-lime-100 text-lime-800' : 
                      l.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {l.status === 'OPEN' ? 'Yayında' : l.status === 'PENDING' ? 'Bekliyor' : 'Reddedildi'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                  {new Date(l.createdAt).toLocaleDateString('tr-TR')}
                </td>
                <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                  <Link href={`/talep/${l.id}`} target="_blank" className="inline-flex p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Görüntüle">
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link href={`/talep-olustur?editId=${l.id}&callbackUrl=/admin/talepler`} className="inline-flex p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Düzenle">
                    <Edit className="w-4 h-4" />
                  </Link>
                  {l.status === 'PENDING' && (
                    <>
                      <button 
                        onClick={() => handleAction(l.id, "approve")}
                        disabled={loadingId === l.id}
                        className="inline-flex p-2 text-lime-600 hover:bg-lime-50 rounded-lg disabled:opacity-50" 
                        title="Onayla"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleAction(l.id, "reject")}
                        disabled={loadingId === l.id}
                        className="inline-flex p-2 text-orange-600 hover:bg-orange-50 rounded-lg disabled:opacity-50" 
                        title="Reddet"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => handleAction(l.id, "delete")}
                    disabled={loadingId === l.id}
                    className="inline-flex p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50" 
                    title="Sil"
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
