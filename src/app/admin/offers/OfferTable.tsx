"use client";

import { useState } from "react";
import { Trash2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

export default function OfferTable({ offers }: { offers: any[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (id: string) => {
    if (!confirm("Emin misiniz?")) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/offers?offerId=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "İşlem başarısız");
      }
      toast({
        title: "Başarılı",
        description: "Teklif silindi.",
        variant: "default",
      });
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
              <th className="px-6 py-4">Teklif Veren</th>
              <th className="px-6 py-4">Talep</th>
              <th className="px-6 py-4">Tutar</th>
              <th className="px-6 py-4">Mesaj</th>
              <th className="px-6 py-4">Durum</th>
              <th className="px-6 py-4">Tarih</th>
              <th className="px-6 py-4 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {offers.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{o.seller.name}</div>
                  <div className="text-xs text-gray-500">{o.seller.email}</div>
                </td>
                <td className="px-6 py-4">
                  <Link href={`/talep/${o.listing.id}`} target="_blank" className="text-cyan-600 hover:underline line-clamp-1">
                    {o.listing.title}
                  </Link>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {Number(o.price).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={o.body}>
                  {o.body}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${o.status === 'ACCEPTED' ? 'bg-lime-100 text-lime-800' : 
                      o.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(o.createdAt).toLocaleDateString('tr-TR')}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Link href={`/teklif/${o.id}`} target="_blank" className="inline-flex p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button 
                    onClick={() => handleAction(o.id)}
                    disabled={loadingId === o.id}
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
