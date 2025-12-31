"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Globe, FileText, CheckCircle, XCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

type Page = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  updatedAt: string;
};

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await fetch("/api/admin/pages");
      if (res.ok) {
        const data = await res.json();
        setPages(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu sayfayı silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPages(pages.filter(p => p.id !== id));
        toast({ title: "Başarılı", description: "Sayfa silindi", variant: "success" });
      }
    } catch {
      toast({ title: "Hata", description: "Silme işlemi başarısız", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sayfa Yönetimi</h1>
          <p className="text-gray-500">Statik içerik sayfalarını (Hakkımızda, Gizlilik vb.) yönetin.</p>
        </div>
        <Link href="/admin/sayfalar/yeni" className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Yeni Sayfa
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Başlık</th>
              <th className="px-6 py-4">URL (Slug)</th>
              <th className="px-6 py-4">Durum</th>
              <th className="px-6 py-4">Son Güncelleme</th>
              <th className="px-6 py-4 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Yükleniyor...</td></tr>
            ) : pages.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Henüz sayfa oluşturulmamış.</td></tr>
            ) : (
              pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    {page.title}
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-sm">/{page.slug}</td>
                  <td className="px-6 py-4">
                    {page.published ? (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                        <CheckCircle className="w-3 h-3" /> Yayında
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs font-medium">
                        <XCircle className="w-3 h-3" /> Taslak
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(page.updatedAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/s/${page.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-gray-100 rounded-lg" title="Görüntüle">
                        <Globe className="w-4 h-4" />
                      </Link>
                      <Link href={`/admin/sayfalar/${page.id}`} className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg" title="Düzenle">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(page.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Sil">
                        <Trash2 className="w-4 h-4" />
                      </button>
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
