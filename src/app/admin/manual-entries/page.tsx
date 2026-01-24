"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface ManualEntry {
  id: string;
  title: string;
  category: { name: string; slug: string };
  subCategory: { name: string; slug: string } | null;
  attributesJson: string | null;
  manualAttributeKeys: string[];
  createdAt: string;
  owner: { name: string | null; email: string | null };
}

export default function ManualEntriesPage() {
  const [entries, setEntries] = useState<ManualEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/manual-entries")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEntries(data);
        } else {
          console.error("Invalid response format:", data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manuel Girilen Özellikler</h1>
        <p className="text-gray-500 text-sm mt-1">Kullanıcıların "Listede yok" seçeneği ile manuel olarak girdiği özellikler.</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">İlan Başlığı</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Manuel Girilenler</th>
                <th className="px-6 py-4">Tüm Özellikler</th>
                <th className="px-6 py-4">Kullanıcı</th>
                <th className="px-6 py-4">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Manuel giriş bulunamadı.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{entry.title}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {entry.category.name}
                      {entry.subCategory && ` / ${entry.subCategory.name}`}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {entry.manualAttributeKeys.map((key) => (
                          <span key={key} className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-medium border border-amber-100">
                            {key}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs truncate text-gray-500 font-mono text-xs" title={entry.attributesJson || ""}>
                        {entry.attributesJson}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{entry.owner.name || "İsimsiz"}</div>
                      <div className="text-xs text-gray-500">{entry.owner.email}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {format(new Date(entry.createdAt), "d MMM yyyy HH:mm", { locale: tr })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
