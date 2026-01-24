"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, FolderTree } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { titleCaseTR } from "@/lib/title-case-tr";

type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  _count: {
    listings: number;
    subcategories: number;
  };
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch {
      toast({ title: "Hata", description: "Kategoriler yüklenemedi", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCategories(prev => prev.filter(c => c.id !== id));
        toast({ title: "Başarılı", description: "Kategori silindi", variant: "success" });
      } else {
        toast({ title: "Hata", description: "Silme işlemi başarısız", variant: "destructive" });
      }
    } catch {
      toast({ title: "Hata", description: "Bir hata oluştu", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kategori Yönetimi</h1>
          <p className="text-gray-500">Site kategorilerini ve özelliklerini yönetin.</p>
        </div>
        <Link href="/admin/kategoriler/yeni" className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Yeni Kategori
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Kategori Adı</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4">İlan Sayısı</th>
              <th className="px-6 py-4">Alt Kategori</th>
              <th className="px-6 py-4 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Yükleniyor...</td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Henüz kategori bulunmuyor.</td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-cyan-50 flex items-center justify-center text-cyan-600">
                      {category.icon ? <span className="text-xl">{category.icon}</span> : <FolderTree className="w-4 h-4" />}
                    </div>
                    {titleCaseTR(category.name)}
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-sm">{category.slug}</td>
                  <td className="px-6 py-4 text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">{category._count.listings}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">{category._count.subcategories}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/kategoriler/${category.id}`} className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg" title="Düzenle">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(category.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Sil">
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
