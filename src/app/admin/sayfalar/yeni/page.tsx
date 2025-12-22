"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";

export default function NewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    published: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast({ title: "Başarılı", description: "Sayfa oluşturuldu", variant: "success" });
        router.push("/admin/sayfalar");
      } else {
        toast({ title: "Hata", description: "Sayfa oluşturulamadı", variant: "destructive" });
      }
    } catch {
      toast({ title: "Hata", description: "Bir hata oluştu", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/sayfalar" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Yeni Sayfa Ekle</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sayfa Başlığı</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => {
                const title = e.target.value;
                const slug = title.toLowerCase()
                  .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
                  .replace(/[^a-z0-9]/g, '-')
                  .replace(/-+/g, '-');
                setFormData({ ...formData, title, slug });
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">URL (Slug)</label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">İçerik (HTML)</label>
          <textarea
            required
            rows={15}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
            placeholder="<h1>Sayfa Başlığı</h1><p>İçerik buraya...</p>"
          />
          <p className="text-xs text-gray-500 mt-1">Şimdilik sadece saf HTML desteklenmektedir.</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="published"
            checked={formData.published}
            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
            className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
          />
          <label htmlFor="published" className="text-sm font-medium text-gray-700">Bu sayfayı yayına al</label>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-cyan-600 text-white px-6 py-2.5 rounded-lg hover:bg-cyan-700 transition-all flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}
