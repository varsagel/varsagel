"use client";

import { useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

export default function ReportTable({ reports }: { reports: any[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (id: string, action: "resolve" | "delete") => {
    if (!confirm("Emin misiniz?")) return;
    setLoadingId(id);
    try {
      if (action === "resolve") {
        const res = await fetch(`/api/reports`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status: "RESOLVED" }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || "İşlem başarısız");
        }
        toast({
          title: "Başarılı",
          description: "Şikayet çözüldü olarak işaretlendi.",
          variant: "default",
        });
      } else {
        const res = await fetch(`/api/reports?id=${encodeURIComponent(id)}`, { method: "DELETE" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || "İşlem başarısız");
        }
        toast({
          title: "Başarılı",
          description: "Şikayet silindi.",
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
              <th className="px-6 py-4">Şikayet Eden</th>
              <th className="px-6 py-4">Talep</th>
              <th className="px-6 py-4">Sebep</th>
              <th className="px-6 py-4">Açıklama</th>
              <th className="px-6 py-4">Durum</th>
              <th className="px-6 py-4">Tarih</th>
              <th className="px-6 py-4 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reports.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{r.user?.name || 'Anonim'}</div>
                  <div className="text-xs text-gray-500">{r.user?.email || ''}</div>
                </td>
                <td className="px-6 py-4">
                  <Link href={`/talep/${r.listing.id}`} target="_blank" className="text-cyan-600 hover:underline line-clamp-1">
                    {r.listing.title}
                  </Link>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {r.reason}
                </td>
                <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={r.description}>
                  {r.description || '-'}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${r.status === 'RESOLVED' ? 'bg-lime-100 text-lime-800' : 'bg-red-100 text-red-800'}`}>
                    {r.status === 'RESOLVED' ? 'Çözüldü' : 'Bekliyor'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(r.createdAt).toLocaleDateString('tr-TR')}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {r.status !== 'RESOLVED' && (
                    <button 
                      onClick={() => handleAction(r.id, "resolve")}
                      disabled={loadingId === r.id}
                      className="inline-flex p-2 text-lime-600 hover:bg-lime-50 rounded-lg disabled:opacity-50" 
                      title="Çözüldü İşaretle"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => handleAction(r.id, "delete")}
                    disabled={loadingId === r.id}
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
