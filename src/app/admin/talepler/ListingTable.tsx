"use client";

import { useMemo, useState } from "react";
import { Check, X, Trash2, Eye, Edit } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

export default function ListingTable({ listings }: { listings: any[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectableIds = useMemo(() => {
    return listings.filter((l) => l.status === "PENDING").map((l) => l.id);
  }, [listings]);

  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.includes(id));

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

  const handleToggleAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(selectableIds);
  };

  const handleToggleOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm("Seçili talepler onaylansın mı?")) return;
    setBulkLoading(true);
    try {
      const res = await fetch("/api/admin/talepler/bulk-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "İşlem başarısız");
      }
      const data = await res.json().catch(() => ({}));
      toast({
        title: "Başarılı",
        description: `${data?.updated || selectedIds.length} talep onaylandı.`,
        variant: "default",
      });
      setSelectedIds([]);
      router.refresh();
    } catch (e) {
      toast({
        title: "Hata",
        description: e instanceof Error ? e.message : "İşlem başarısız",
        variant: "destructive",
      });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm("Seçili talepler reddedilsin mi?")) return;
    setBulkLoading(true);
    try {
      const res = await fetch("/api/admin/talepler/bulk-reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "İşlem başarısız");
      }
      const data = await res.json().catch(() => ({}));
      toast({
        title: "Başarılı",
        description: `${data?.updated || selectedIds.length} talep reddedildi.`,
        variant: "default",
      });
      setSelectedIds([]);
      router.refresh();
    } catch (e) {
      toast({
        title: "Hata",
        description: e instanceof Error ? e.message : "İşlem başarısız",
        variant: "destructive",
      });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm("Seçili talepler silinsin mi?")) return;
    setBulkLoading(true);
    try {
      const res = await fetch("/api/admin/talepler/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "İşlem başarısız");
      }
      const data = await res.json().catch(() => ({}));
      toast({
        title: "Başarılı",
        description: `${data?.deleted || selectedIds.length} talep silindi.`,
        variant: "default",
      });
      setSelectedIds([]);
      router.refresh();
    } catch (e) {
      toast({
        title: "Hata",
        description: e instanceof Error ? e.message : "İşlem başarısız",
        variant: "destructive",
      });
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="text-sm text-gray-600">
          Seçili: <span className="font-semibold text-gray-900">{selectedIds.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleBulkApprove}
            disabled={selectedIds.length === 0 || bulkLoading}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-lime-600 text-white hover:bg-lime-700 disabled:opacity-50"
          >
            Toplu Onayla
          </button>
          <button
            onClick={handleBulkReject}
            disabled={selectedIds.length === 0 || bulkLoading}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50"
          >
            Toplu Reddet
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={selectedIds.length === 0 || bulkLoading}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            Toplu Sil
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
            <tr>
              <th className="px-4 py-4 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleToggleAll}
                  disabled={selectableIds.length === 0}
                  className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-600"
                />
              </th>
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
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  Bu filtrede talep bulunamadı.
                </td>
              </tr>
            ) : listings.map((l) => (
              <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(l.id)}
                    onChange={() => handleToggleOne(l.id)}
                    disabled={l.status !== "PENDING"}
                    className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-600 disabled:opacity-50"
                  />
                </td>
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
