"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Filter, Search, ListFilter } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

type SubCategory = {
  id: string;
  name: string;
  slug: string;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  subcategories: SubCategory[];
};

type Attribute = {
  id: string;
  name: string;
  slug: string;
  type: string;
  optionsJson: string | null;
  required: boolean;
  showInRequest: boolean;
  showInOffer: boolean;
  order: number;
  categoryId: string;
  subCategoryId: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  subCategory?: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

const ATTRIBUTE_TYPES = [
  { value: "text", label: "Metin" },
  { value: "number", label: "Sayı" },
  { value: "select", label: "Seçim Listesi" },
  { value: "multiselect", label: "Çoklu Seçim" },
  { value: "checkbox", label: "Onay Kutusu" },
  { value: "date", label: "Tarih" },
];

export default function AdminAttributesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [filterSubCategoryId, setFilterSubCategoryId] = useState("");
  const [search, setSearch] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [createValues, setCreateValues] = useState({
    categoryId: "",
    subCategoryId: "",
    name: "",
    slug: "",
    type: "text",
    options: "",
    required: false,
    showInRequest: true,
    showInOffer: true,
  });

  const [editingAttr, setEditingAttr] = useState<Attribute | null>(null);
  const [editingValues, setEditingValues] = useState({
    name: "",
    slug: "",
    type: "text",
    options: "",
    required: false,
    showInRequest: true,
    showInOffer: true,
    subCategoryId: "",
  });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const [catRes, attrRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/admin/attributes"),
        ]);

        if (catRes.ok) {
          const data = await catRes.json();
          if (active && Array.isArray(data)) {
            setCategories(
              data.map((c: any) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                subcategories: c.subcategories || [],
              }))
            );
          }
        } else {
          toast({ title: "Hata", description: "Kategoriler yüklenemedi", variant: "destructive" });
        }

        if (attrRes.ok) {
          const data = await attrRes.json();
          if (active && Array.isArray(data)) {
            setAttributes(data);
          }
        } else {
          toast({ title: "Hata", description: "Özellikler yüklenemedi", variant: "destructive" });
        }
      } catch {
        toast({ title: "Hata", description: "Veriler yüklenirken bir hata oluştu", variant: "destructive" });
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const filteredAttributes = useMemo(() => {
    let list = attributes.slice();

    if (filterCategoryId) {
      list = list.filter((a) => a.categoryId === filterCategoryId);
    }
    if (filterSubCategoryId) {
      list = list.filter((a) => a.subCategoryId === filterSubCategoryId);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.slug.toLowerCase().includes(q) ||
          (a.category?.name || "").toLowerCase().includes(q) ||
          (a.subCategory?.name || "").toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => {
      if (a.category?.name && b.category?.name && a.category.name !== b.category.name) {
        return a.category.name.localeCompare(b.category.name, "tr");
      }
      if (a.subCategory?.name && b.subCategory?.name && a.subCategory.name !== b.subCategory.name) {
        return a.subCategory.name.localeCompare(b.subCategory.name, "tr");
      }
      return a.order - b.order;
    });
  }, [attributes, filterCategoryId, filterSubCategoryId, search]);

  const currentCategoryForCreate = useMemo(
    () => categories.find((c) => c.id === createValues.categoryId) || null,
    [categories, createValues.categoryId]
  );

  const handleOpenCreate = () => {
    setCreateValues((prev) => ({
      ...prev,
      categoryId: filterCategoryId || prev.categoryId || "",
      subCategoryId: filterSubCategoryId || prev.subCategoryId || "",
    }));
    setShowCreate(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createValues.categoryId || !createValues.name || !createValues.slug) {
      toast({ title: "Eksik bilgi", description: "Kategori, başlık ve slug zorunludur", variant: "destructive" });
      return;
    }

    try {
      const optionsJson =
        (createValues.type === "select" || createValues.type === "multiselect") && createValues.options.trim()
          ? createValues.options.split(",").map((s) => s.trim())
          : null;

      const maxOrder =
        attributes
          .filter((a) => a.categoryId === createValues.categoryId)
          .reduce((max, a) => (a.order > max ? a.order : max), 0) ?? 0;

      const res = await fetch("/api/admin/attributes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: createValues.categoryId,
          subCategoryId: createValues.subCategoryId || null,
          name: createValues.name,
          slug: createValues.slug,
          type: createValues.type,
          optionsJson,
          required: createValues.required,
          showInRequest: createValues.showInRequest,
          showInOffer: createValues.showInOffer,
          order: maxOrder + 1,
        }),
      });

      if (!res.ok) {
        toast({ title: "Hata", description: "Özellik oluşturulamadı", variant: "destructive" });
        return;
      }

      const created = await res.json();
      setAttributes((prev) => [...prev, created]);
      toast({ title: "Başarılı", description: "Özellik oluşturuldu", variant: "success" });
      setShowCreate(false);
      setCreateValues({
        categoryId: "",
        subCategoryId: "",
        name: "",
        slug: "",
        type: "text",
        options: "",
        required: false,
        showInRequest: true,
        showInOffer: true,
      });
    } catch {
      toast({ title: "Hata", description: "Bir hata oluştu", variant: "destructive" });
    }
  };

  const handleDelete = async (attr: Attribute) => {
    if (!confirm(`"${attr.name}" özelliğini silmek istediğinize emin misiniz?`)) return;
    try {
      const res = await fetch(`/api/admin/attributes/${attr.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast({ title: "Hata", description: "Özellik silinemedi", variant: "destructive" });
        return;
      }
      setAttributes((prev) => prev.filter((a) => a.id !== attr.id));
      toast({ title: "Başarılı", description: "Özellik silindi", variant: "success" });
    } catch {
      toast({ title: "Hata", description: "Bir hata oluştu", variant: "destructive" });
    }
  };

  const openEdit = (attr: Attribute) => {
    let options = "";
    if (attr.optionsJson) {
      try {
        const arr = JSON.parse(attr.optionsJson) as string[];
        if (Array.isArray(arr)) {
          options = arr.join(", ");
        }
      } catch {}
    }
    setEditingAttr(attr);
    setEditingValues({
      name: attr.name,
      slug: attr.slug,
      type: attr.type,
      options,
      required: attr.required,
      showInRequest: attr.showInRequest,
      showInOffer: attr.showInOffer,
      subCategoryId: attr.subCategoryId || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingAttr) return;
    try {
      let optionsJson: string[] | null = null;
      if ((editingValues.type === "select" || editingValues.type === "multiselect") && editingValues.options.trim()) {
        optionsJson = editingValues.options.split(",").map((s) => s.trim());
      }

      const res = await fetch(`/api/admin/attributes/${editingAttr.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingValues.name,
          slug: editingValues.slug,
          type: editingValues.type,
          optionsJson,
          required: editingValues.required,
          showInRequest: editingValues.showInRequest,
          showInOffer: editingValues.showInOffer,
          order: editingAttr.order,
          subCategoryId: editingValues.subCategoryId || null,
        }),
      });

      if (!res.ok) {
        toast({ title: "Hata", description: "Özellik güncellenemedi", variant: "destructive" });
        return;
      }

      const updated = await res.json();
      setAttributes((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      toast({ title: "Başarılı", description: "Özellik güncellendi", variant: "success" });
      setEditingAttr(null);
    } catch {
      toast({ title: "Hata", description: "Bir hata oluştu", variant: "destructive" });
    }
  };

  const subcategoriesForFilter = useMemo(() => {
    const cat = categories.find((c) => c.id === filterCategoryId);
    return cat ? cat.subcategories : [];
  }, [categories, filterCategoryId]);

  const subcategoriesForCreate = useMemo(() => {
    return currentCategoryForCreate ? currentCategoryForCreate.subcategories : [];
  }, [currentCategoryForCreate]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Özellik Yönetimi</h1>
          <p className="text-gray-500">
            Talep ve teklif formlarında kullandığınız tüm kategori özelliklerini buradan yönetebilirsiniz.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/kategoriler"
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
          >
            Kategorilere Dön
          </Link>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Yeni Özellik
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div className="w-full md:w-auto">
            <label className="block text-xs font-medium text-gray-600 mb-1">Kategori</label>
            <div className="relative">
              <select
                value={filterCategoryId}
                onChange={(e) => {
                  setFilterCategoryId(e.target.value);
                  setFilterSubCategoryId("");
                }}
                className="block w-full md:w-56 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">Tüm kategoriler</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Filter className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
            </div>
          </div>
          <div className="w-full md:w-auto">
            <label className="block text-xs font-medium text-gray-600 mb-1">Alt kategori</label>
            <div className="relative">
              <select
                value={filterSubCategoryId}
                onChange={(e) => setFilterSubCategoryId(e.target.value)}
                disabled={!filterCategoryId}
                className="block w-full md:w-56 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">Tüm alt kategoriler</option>
                {subcategoriesForFilter.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ListFilter className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
            </div>
          </div>
        </div>
        <div className="w-full md:w-72">
          <label className="block text-xs font-medium text-gray-600 mb-1">Ara</label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Özellik adı, slug veya kategori ara..."
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pl-9 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-3">Özellik Adı</th>
                <th className="px-6 py-3">Slug</th>
                <th className="px-6 py-3">Tip</th>
                <th className="px-6 py-3">Kategori</th>
                <th className="px-6 py-3">Alt Kategori</th>
                <th className="px-6 py-3">Zorunlu</th>
                <th className="px-6 py-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Yükleniyor...
                  </td>
                </tr>
              ) : filteredAttributes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Seçili filtrelere uygun özellik bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredAttributes.map((attr) => {
                  const catName = attr.category?.name || categories.find((c) => c.id === attr.categoryId)?.name || "-";
                  const subName =
                    attr.subCategory?.name ||
                    categories
                      .find((c) => c.id === attr.categoryId)
                      ?.subcategories.find((s) => s.id === attr.subCategoryId)?.name ||
                    "-";
                  const typeLabel = ATTRIBUTE_TYPES.find((t) => t.value === attr.type)?.label || attr.type;

                  return (
                    <tr key={attr.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{attr.name}</td>
                      <td className="px-6 py-3 text-xs font-mono text-gray-500">{attr.slug}</td>
                      <td className="px-6 py-3 text-xs text-gray-700">
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-700">
                          {typeLabel}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700">{catName}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{subName}</td>
                      <td className="px-6 py-3 text-center">
                        {attr.required ? (
                          <span className="inline-flex items-center justify-center rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                            Evet
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center rounded-full bg-gray-50 px-2 py-0.5 text-[11px] font-semibold text-gray-500">
                            Hayır
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => openEdit(attr)}
                            className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg"
                            title="Düzenle"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(attr)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Yeni Özellik Ekle</h3>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  value={createValues.categoryId}
                  onChange={(e) =>
                    setCreateValues((prev) => ({
                      ...prev,
                      categoryId: e.target.value,
                      subCategoryId: "",
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  required
                >
                  <option value="">Seçiniz</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Alt Kategori</label>
                <select
                  value={createValues.subCategoryId}
                  onChange={(e) =>
                    setCreateValues((prev) => ({
                      ...prev,
                      subCategoryId: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  disabled={!currentCategoryForCreate}
                >
                  <option value="">Tüm alt kategoriler</option>
                  {subcategoriesForCreate.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Başlık</label>
                <input
                  type="text"
                  value={createValues.name}
                  onChange={(e) =>
                    setCreateValues((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={createValues.slug}
                  onChange={(e) =>
                    setCreateValues((prev) => ({
                      ...prev,
                      slug: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tip</label>
                <select
                  value={createValues.type}
                  onChange={(e) =>
                    setCreateValues((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {ATTRIBUTE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              {(createValues.type === "select" || createValues.type === "multiselect") && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Seçenekler (virgülle ayırın)
                  </label>
                  <input
                    type="text"
                    value={createValues.options}
                    onChange={(e) =>
                      setCreateValues((prev) => ({
                        ...prev,
                        options: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              )}
              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  type="checkbox"
                  id="create-required"
                  checked={createValues.required}
                  onChange={(e) =>
                    setCreateValues((prev) => ({
                      ...prev,
                      required: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                />
                <label htmlFor="create-required" className="text-sm text-gray-700">
                  Zorunlu alan
                </label>
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  type="checkbox"
                  id="create-showInRequest"
                  checked={createValues.showInRequest}
                  onChange={(e) =>
                    setCreateValues((prev) => ({
                      ...prev,
                      showInRequest: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                />
                <label htmlFor="create-showInRequest" className="text-sm text-gray-700">
                  Talep Oluşturmada Göster
                </label>
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  type="checkbox"
                  id="create-showInOffer"
                  checked={createValues.showInOffer}
                  onChange={(e) =>
                    setCreateValues((prev) => ({
                      ...prev,
                      showInOffer: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                />
                <label htmlFor="create-showInOffer" className="text-sm text-gray-700">
                  Teklif Vermede Göster
                </label>
              </div>
              <div className="flex justify-end gap-3 md:col-span-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-600 text-sm text-white font-medium hover:bg-cyan-700"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingAttr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Özelliği Düzenle</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Başlık</label>
                <input
                  type="text"
                  value={editingValues.name}
                  onChange={(e) =>
                    setEditingValues((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={editingValues.slug}
                  onChange={(e) =>
                    setEditingValues((prev) => ({
                      ...prev,
                      slug: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tip</label>
                <select
                  value={editingValues.type}
                  onChange={(e) =>
                    setEditingValues((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {ATTRIBUTE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Alt Kategori</label>
                <select
                  value={editingValues.subCategoryId}
                  onChange={(e) =>
                    setEditingValues((prev) => ({
                      ...prev,
                      subCategoryId: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Tüm alt kategoriler</option>
                  {categories
                    .find((c) => c.id === editingAttr.categoryId)
                    ?.subcategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </div>
              {(editingValues.type === "select" || editingValues.type === "multiselect") && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Seçenekler (virgülle ayırın)
                  </label>
                  <input
                    type="text"
                    value={editingValues.options}
                    onChange={(e) =>
                      setEditingValues((prev) => ({
                        ...prev,
                        options: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              )}
              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  type="checkbox"
                  id="edit-required"
                  checked={editingValues.required}
                  onChange={(e) =>
                    setEditingValues((prev) => ({
                      ...prev,
                      required: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                />
                <label htmlFor="edit-required" className="text-sm text-gray-700">
                  Zorunlu alan
                </label>
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  type="checkbox"
                  id="edit-showInRequest"
                  checked={editingValues.showInRequest}
                  onChange={(e) =>
                    setEditingValues((prev) => ({
                      ...prev,
                      showInRequest: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                />
                <label htmlFor="edit-showInRequest" className="text-sm text-gray-700">
                  Talep Oluşturmada Göster
                </label>
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  type="checkbox"
                  id="edit-showInOffer"
                  checked={editingValues.showInOffer}
                  onChange={(e) =>
                    setEditingValues((prev) => ({
                      ...prev,
                      showInOffer: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                />
                <label htmlFor="edit-showInOffer" className="text-sm text-gray-700">
                  Teklif Vermede Göster
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setEditingAttr(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-lg bg-cyan-600 text-sm text-white font-medium hover:bg-cyan-700"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
