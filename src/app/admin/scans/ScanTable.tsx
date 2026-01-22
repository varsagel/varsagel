"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

type Scan = {
  id: string;
  fileUrl: string;
  status: string | null;
  createdAt: string | Date;
  owner?: { name?: string | null; email?: string | null } | null;
};

export default function ScanTable({ scans }: { scans: Scan[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const updateStatus = async (id: string, status: string) => {
    setLoadingId(id);
    try {
      const res = await fetch("/api/admin/antivirus", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Güncelleme başarısız");
      }
      toast({ title: "Durum güncellendi", variant: "default" });
      router.refresh();
    } catch (e) {
      toast({
        title: "Hata",
        description: e instanceof Error ? e.message : "Güncelleme başarısız",
        variant: "destructive",
      });
    } finally {
      setLoadingId(null);
    }
  };

  if (!scans || scans.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-sm text-gray-500">
        Kayıt bulunamadı.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Görsel URL</th>
              <th className="px-6 py-4">Kullanıcı</th>
              <th className="px-6 py-4">Durum</th>
              <th className="px-6 py-4">Tarih</th>
              <th className="px-6 py-4 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {scans.map((scan) => {
              const status = String(scan.status || "PENDING").toUpperCase();
              const label =
                status === "CLEAN"
                  ? "CLEAN"
                  : status === "INFECTED"
                  ? "INFECTED"
                  : status === "FAILED"
                  ? "FAILED"
                  : status === "IN_PROGRESS"
                  ? "IN_PROGRESS"
                  : "PENDING";
              const badgeClass =
                status === "CLEAN"
                  ? "bg-lime-100 text-lime-800"
                  : status === "INFECTED"
                  ? "bg-red-100 text-red-800"
                  : status === "FAILED"
                  ? "bg-rose-100 text-rose-800"
                  : status === "IN_PROGRESS"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800";

              return (
                <tr key={scan.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 max-w-xs truncate" title={scan.fileUrl}>
                    {scan.fileUrl}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{scan.owner?.name || "Anonim"}</div>
                    {scan.owner?.email && <div className="text-xs text-gray-500">{scan.owner.email}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
                      {label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(scan.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => updateStatus(scan.id, "CLEAN")}
                      disabled={loadingId === scan.id || status === "CLEAN"}
                      className="inline-flex p-2 text-lime-600 hover:bg-lime-50 rounded-lg disabled:opacity-50"
                      title="Temiz olarak işaretle"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => updateStatus(scan.id, "INFECTED")}
                      disabled={loadingId === scan.id || status === "INFECTED"}
                      className="inline-flex p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                      title="Virüslü olarak işaretle"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => updateStatus(scan.id, "FAILED")}
                      disabled={loadingId === scan.id || status === "FAILED"}
                      className="inline-flex p-2 text-amber-600 hover:bg-amber-50 rounded-lg disabled:opacity-50"
                      title="Tarama başarısız olarak işaretle"
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
