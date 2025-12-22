"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Settings2, ChevronUp, ChevronDown } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";

type Attribute = {
  id: string;
  name: string;
  slug: string;
  type: string;
  optionsJson: string | null;
  required: boolean;
  order: number;
  subCategoryId: string | null;
  subCategory?: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

type SubCategory = {
  id: string;
  name: string;
  slug: string;
};

type CategoryDetail = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  attributes: Attribute[];
  subcategories: SubCategory[];
};

import { use } from "react";

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CategoryDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'attributes' | 'subcategories'>('details');

  // Attribute Form State
  const [newAttr, setNewAttr] = useState({
    name: "",
    slug: "",
    type: "text",
    options: "",
    required: false,
    targetSubCategoryId: ""
  });

  const [newSubcat, setNewSubcat] = useState({
    name: "",
    slug: ""
  });

  const [editingAttr, setEditingAttr] = useState<Attribute | null>(null);
  const [editingValues, setEditingValues] = useState({
    name: "",
    slug: "",
    type: "text",
    options: "",
    required: false,
    targetSubCategoryId: ""
  });

  const [orderDirty, setOrderDirty] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  const orderedAttributes = useMemo(() => {
    const attrs = data?.attributes ? [...data.attributes] : [];
    return attrs.sort((a, b) => a.order - b.order);
  }, [data?.attributes]);

  const moveAttribute = (attrId: string, direction: "up" | "down") => {
    if (!data) return;
    const list = [...orderedAttributes];
    const fromIndex = list.findIndex((a) => a.id === attrId);
    if (fromIndex === -1) return;

    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= list.length) return;

    const next = [...list];
    const tmp = next[fromIndex];
    next[fromIndex] = next[toIndex];
    next[toIndex] = tmp;

    const normalized = next.map((a, i) => ({ ...a, order: i }));
    setData({ ...data, attributes: normalized });
    setOrderDirty(true);
  };

  const discardOrderChanges = () => {
    setOrderDirty(false);
    fetchData();
  };

  const saveOrderChanges = async () => {
    if (!data) return;
    setSavingOrder(true);
    try {
      const attrs = [...data.attributes].sort((a, b) => a.order - b.order);
      const results = await Promise.all(
        attrs.map(async (a) => {
          const res = await fetch(`/api/admin/attributes/${a.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: a.order }),
          });
          return res.ok;
        })
      );

      if (results.some((ok) => !ok)) {
        toast({ title: "Hata", description: "Sıralama kaydedilemedi", variant: "destructive" });
        return;
      }

      toast({ title: "Başarılı", description: "Sıralama güncellendi", variant: "success" });
      setOrderDirty(false);
      fetchData();
    } catch {
      toast({ title: "Hata", description: "Sıralama kaydedilemedi", variant: "destructive" });
    } finally {
      setSavingOrder(false);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/categories/${unwrappedParams.id}`);
      if (res.ok) {
        const category = await res.json();
        setData(category);
      } else {
        let message = "Kategori yüklenemedi";
        try {
          const err = await res.json();
          if (err && typeof err === "object" && "error" in err && typeof err.error === "string") {
            message = err.error === "Not found" ? "Kategori bulunamadı" : err.error;
          }
        } catch {}
        toast({ title: "Hata", description: message, variant: "destructive" });
        router.push("/admin/kategoriler");
      }
    } catch {
      toast({ title: "Hata", description: "Veri yüklenemedi", variant: "destructive" });
    }
  }, [unwrappedParams.id, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/categories/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          slug: data.slug,
          icon: data.icon
        })
      });

      if (res.ok) {
        toast({ title: "Başarılı", description: "Kategori güncellendi", variant: "success" });
      } else {
        toast({ title: "Hata", description: "Güncelleme başarısız", variant: "destructive" });
      }
    } catch {
      toast({ title: "Hata", description: "Hata oluştu", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    try {
      let optionsJson = null;
      if (['select', 'multiselect'].includes(newAttr.type) && newAttr.options) {
        optionsJson = newAttr.options.split(',').map(s => s.trim());
      }

      const res = await fetch("/api/admin/attributes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: data.id,
          subCategoryId: newAttr.targetSubCategoryId || null,
          name: newAttr.name,
          slug: newAttr.slug,
          type: newAttr.type,
          optionsJson,
          required: newAttr.required,
          order: data.attributes.length
        })
      });

      if (res.ok) {
        toast({ title: "Başarılı", description: "Özellik eklendi", variant: "success" });
        setNewAttr({ name: "", slug: "", type: "text", options: "", required: false, targetSubCategoryId: "" });
        fetchData();
      } else {
        toast({ title: "Hata", description: "Özellik eklenemedi", variant: "destructive" });
      }
    } catch {
      toast({ title: "Hata", description: "Hata oluştu", variant: "destructive" });
    }
  };

  const handleDeleteAttribute = async (id: string) => {
    if (!confirm("Bu özelliği silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/admin/attributes/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Başarılı", description: "Özellik silindi", variant: "success" });
        setData(prev => prev ? { ...prev, attributes: prev.attributes.filter(a => a.id !== id) } : null);
      }
    } catch {
      toast({ title: "Hata", description: "Silinemedi", variant: "destructive" });
    }
  };

  const openEditAttribute = (attr: Attribute) => {
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
      targetSubCategoryId: attr.subCategoryId || ""
    });
  };

  const handleSaveEditedAttribute = async () => {
    if (!editingAttr || !data) return;

    try {
      let optionsJson = null as null | string[] | string;
      if (['select', 'multiselect'].includes(editingValues.type) && editingValues.options.trim()) {
        optionsJson = editingValues.options.split(",").map(s => s.trim());
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
          order: editingAttr.order,
          subCategoryId: editingValues.targetSubCategoryId || null
        })
      });

      if (res.ok) {
        toast({ title: "Başarılı", description: "Özellik güncellendi", variant: "success" });
        const updated = await res.json();
        setData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            attributes: prev.attributes.map(a =>
              a.id === editingAttr.id ? { ...a, ...updated } : a
            )
          };
        });
        setEditingAttr(null);
      } else {
        toast({ title: "Hata", description: "Özellik güncellenemedi", variant: "destructive" });
      }
    } catch {
      toast({ title: "Hata", description: "Hata oluştu", variant: "destructive" });
    }
  };

  const handleAddSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    try {
      const res = await fetch("/api/admin/subcategories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: data.id,
          name: newSubcat.name,
          slug: newSubcat.slug
        })
      });

      if (res.ok) {
        const created = await res.json();
        toast({ title: "Başarılı", description: "Alt kategori eklendi", variant: "success" });
        setData(prev => prev ? { ...prev, subcategories: [...prev.subcategories, created] } : prev);
        setNewSubcat({ name: "", slug: "" });
      } else {
        toast({ title: "Hata", description: "Alt kategori eklenemedi", variant: "destructive" });
      }
    } catch {
      toast({ title: "Hata", description: "Hata oluştu", variant: "destructive" });
    }
  };

  const handleDeleteSubcategory = async (id: string) => {
    if (!confirm("Bu alt kategoriyi silmek istediğinize emin misiniz? İlgili ilanların alt kategori bağlantısı kaldırılacaktır.")) return;
    try {
      const res = await fetch(`/api/admin/subcategories/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Başarılı", description: "Alt kategori silindi", variant: "success" });
        setData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            subcategories: prev.subcategories.filter(s => s.id !== id),
            attributes: prev.attributes.map(a =>
              a.subCategoryId === id ? { ...a, subCategoryId: null, subCategory: null } : a
            )
          };
        });
      } else {
        toast({ title: "Hata", description: "Alt kategori silinemedi", variant: "destructive" });
      }
    } catch {
      toast({ title: "Hata", description: "Hata oluştu", variant: "destructive" });
    }
  };

  if (!data) return <div className="p-8 text-center">Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/kategoriler" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{data.name}</h1>
          <p className="text-sm text-gray-500">Kategori detaylarını ve form alanlarını yönetin.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-cyan-500 text-cyan-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Genel Bilgiler
          </button>
          <button
            onClick={() => setActiveTab('attributes')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'attributes'
                ? 'border-cyan-500 text-cyan-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Form Özellikleri (Attributes)
          </button>
          <button
            onClick={() => setActiveTab('subcategories')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'subcategories'
                ? 'border-cyan-500 text-cyan-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Alt Kategoriler
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {activeTab === 'details' && (
          <form onSubmit={handleUpdateCategory} className="space-y-6 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori Adı</label>
              <input
                type="text"
                required
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
              <input
                type="text"
                required
                value={data.slug}
                onChange={(e) => setData({ ...data, slug: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">İkon</label>
              <input
                type="text"
                value={data.icon || ''}
                onChange={(e) => setData({ ...data, icon: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-cyan-600 text-white px-6 py-2.5 rounded-lg hover:bg-cyan-700 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Kaydet
              </button>
            </div>
          </form>
        )}

        {activeTab === 'attributes' && (
          <div className="space-y-8">
            <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-100 text-sm text-cyan-800">
              Bu özellikler, kullanıcı talep oluştururken bu kategoriyi seçtiğinde formda görünecek alanlardır.
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-gray-900">Mevcut Özellikler</h3>
                {data.attributes.length > 1 && (
                  <div className="flex items-center gap-2">
                    {orderDirty && (
                      <button
                        type="button"
                        onClick={discardOrderChanges}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        disabled={savingOrder}
                      >
                        İptal
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={saveOrderChanges}
                      disabled={!orderDirty || savingOrder}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 text-xs font-medium text-white hover:bg-cyan-700 disabled:bg-gray-300"
                    >
                      Sıralamayı Kaydet
                    </button>
                  </div>
                )}
              </div>
              {data.attributes.length === 0 ? (
                <p className="text-gray-500 text-sm italic">Henüz özellik eklenmemiş.</p>
              ) : (
                <div className="grid gap-3">
                  {orderedAttributes.map((attr, index) => (
                    <div key={attr.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          <div className="flex flex-col">
                            <button
                              type="button"
                              onClick={() => moveAttribute(attr.id, "up")}
                              disabled={index === 0 || savingOrder}
                              className="p-0.5 text-gray-400 hover:text-gray-700 disabled:text-gray-300"
                              title="Yukarı taşı"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveAttribute(attr.id, "down")}
                              disabled={index === orderedAttributes.length - 1 || savingOrder}
                              className="p-0.5 text-gray-400 hover:text-gray-700 disabled:text-gray-300"
                              title="Aşağı taşı"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{attr.name}</p>
                          <p className="text-xs text-gray-500 font-mono">
                            {attr.slug} • {attr.type} {attr.required ? '• Zorunlu' : ''} •{" "}
                            {attr.subCategory ? `Sadece: ${attr.subCategory.name}` : "Tüm alt kategoriler"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditAttribute(attr)}
                          className="text-cyan-600 hover:text-cyan-800 px-2 py-1 text-xs font-medium"
                        >
                          Düzenle
                        </button>
                        <button onClick={() => handleDeleteAttribute(attr.id)} className="text-red-500 hover:text-red-700 p-2">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Yeni Özellik Ekle</h3>
              <form onSubmit={handleAddAttribute} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end bg-gray-50 p-4 rounded-xl">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Başlık (Örn: Marka)</label>
                  <input
                    type="text"
                    required
                    value={newAttr.name}
                    onChange={(e) => {
                       const name = e.target.value;
                       const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
                       setNewAttr({ ...newAttr, name, slug });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Slug (Otomatik)</label>
                  <input
                    type="text"
                    required
                    value={newAttr.slug}
                    onChange={(e) => setNewAttr({ ...newAttr, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tip</label>
                  <select
                    value={newAttr.type}
                    onChange={(e) => setNewAttr({ ...newAttr, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="text">Metin</option>
                    <option value="number">Sayı</option>
                    <option value="select">Seçim Listesi (Select)</option>
                    <option value="multiselect">Çoklu Seçim</option>
                    <option value="checkbox">Onay Kutusu</option>
                    <option value="date">Tarih</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Hedef Alt Kategori</label>
                  <select
                    value={newAttr.targetSubCategoryId}
                    onChange={(e) => setNewAttr({ ...newAttr, targetSubCategoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Tüm alt kategoriler</option>
                    {data.subcategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
                {(newAttr.type === 'select' || newAttr.type === 'multiselect') && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Seçenekler (Virgülle ayırın)</label>
                    <input
                      type="text"
                      value={newAttr.options}
                      onChange={(e) => setNewAttr({ ...newAttr, options: e.target.value })}
                      placeholder="Örn: BMW, Mercedes, Audi"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2 pb-2">
                  <input
                    type="checkbox"
                    id="required"
                    checked={newAttr.required}
                    onChange={(e) => setNewAttr({ ...newAttr, required: e.target.checked })}
                    className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <label htmlFor="required" className="text-sm text-gray-700">Zorunlu Alan</label>
                </div>
                <div className="md:col-span-2">
                  <button type="submit" className="w-full bg-cyan-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-cyan-700">
                    Özelliği Ekle
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editingAttr && data && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Özelliği Düzenle</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Başlık</label>
                  <input
                    type="text"
                    value={editingValues.name}
                    onChange={(e) => setEditingValues(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Slug</label>
                  <input
                    type="text"
                    value={editingValues.slug}
                    onChange={(e) => setEditingValues(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tip</label>
                  <select
                    value={editingValues.type}
                    onChange={(e) => setEditingValues(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="text">Metin</option>
                    <option value="number">Sayı</option>
                    <option value="select">Seçim Listesi (Select)</option>
                    <option value="multiselect">Çoklu Seçim</option>
                    <option value="checkbox">Onay Kutusu</option>
                    <option value="date">Tarih</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Hedef Alt Kategori</label>
                  <select
                    value={editingValues.targetSubCategoryId}
                    onChange={(e) => setEditingValues(prev => ({ ...prev, targetSubCategoryId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Tüm alt kategoriler</option>
                    {data.subcategories.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
                {(editingValues.type === "select" || editingValues.type === "multiselect") && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Seçenekler (Virgülle ayırın)</label>
                    <input
                      type="text"
                      value={editingValues.options}
                      onChange={(e) => setEditingValues(prev => ({ ...prev, options: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2 md:col-span-2">
                  <input
                    type="checkbox"
                    id="edit-required"
                    checked={editingValues.required}
                    onChange={(e) => setEditingValues(prev => ({ ...prev, required: e.target.checked }))}
                    className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <label htmlFor="edit-required" className="text-sm text-gray-700">Zorunlu Alan</label>
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
                  onClick={handleSaveEditedAttribute}
                  className="px-5 py-2 rounded-lg bg-cyan-600 text-sm text-white font-medium hover:bg-cyan-700"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subcategories' && (
          <div className="space-y-8">
            <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-100 text-sm text-cyan-800 flex items-start gap-3">
              <Settings2 className="w-5 h-5 mt-0.5" />
              <div>
                <p>Bu alanda alt kategorileri yönetebilir ve her alt kategoriye özel form alanları tanımlayabilirsiniz.</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Mevcut Alt Kategoriler</h3>
              {data.subcategories.length === 0 ? (
                <p className="text-gray-500 text-sm italic">Henüz alt kategori eklenmemiş.</p>
              ) : (
                <div className="grid gap-3">
                  {data.subcategories.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <p className="font-medium text-gray-900">{sub.name}</p>
                        <p className="text-xs text-gray-500 font-mono">{sub.slug}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteSubcategory(sub.id)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Yeni Alt Kategori Ekle</h3>
              <form onSubmit={handleAddSubcategory} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-gray-50 p-4 rounded-xl">
                <div className="md:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Alt Kategori Adı</label>
                  <input
                    type="text"
                    required
                    value={newSubcat.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-");
                      setNewSubcat({ name, slug });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Slug</label>
                  <input
                    type="text"
                    required
                    value={newSubcat.slug}
                    onChange={(e) => setNewSubcat({ ...newSubcat, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100"
                  />
                </div>
                <div className="md:col-span-1">
                  <button
                    type="submit"
                    className="w-full bg-cyan-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-cyan-700 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Alt Kategoriyi Ekle
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
