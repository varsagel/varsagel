"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import YEDEK_PARCA_STRUCTURE from "@/data/yedek-parca-structure.json";

type SubCategory = {
  name: string;
  slug: string;
  fullSlug?: string;
  subcategories?: SubCategory[];
};

type Root = SubCategory & { icon?: string };

const categorySlug = "yedek-parca-aksesuar-donanim-tuning";
const root = YEDEK_PARCA_STRUCTURE as unknown as Root;

const findByPath = (items: SubCategory[] | undefined, path: string[]) => {
  let current: SubCategory | undefined;
  let list = items || [];

  for (const slug of path) {
    current = list.find((s) => s.slug === slug);
    if (!current) return undefined;
    list = current.subcategories || [];
  }

  return current;
};

export default function TestYedekParcaPage() {
  const [path, setPath] = useState<string[]>([]);
  const [schema, setSchema] = useState<Array<{ label: string; key?: string; type: string }>>([]);

  const node = useMemo(() => findByPath(root.subcategories, path), [path]);
  const nodeChildren = node?.subcategories || [];

  const levelItems = useMemo(() => {
    if (path.length === 0) return root.subcategories || [];
    const parent = findByPath(root.subcategories, path.slice(0, -1));
    return parent?.subcategories || [];
  }, [path]);

  const nextLevelItems = useMemo(() => {
    if (!node) return [];
    return node.subcategories || [];
  }, [node]);

  const overrideKey = useMemo(() => {
    const full = node?.fullSlug;
    if (full) return `${categorySlug}/${full}`;
    if (node?.slug) return `${categorySlug}/${node.slug}`;
    return categorySlug;
  }, [node]);

  useEffect(() => {
    const sub = node?.fullSlug || node?.slug || "";
    const url = `/api/categories/${categorySlug}/attributes?subcategory=${encodeURIComponent(sub)}`;
    fetch(url)
      .then((r) => r.json())
      .then((attrs) => {
        if (!Array.isArray(attrs)) {
          setSchema([]);
          return;
        }
        const mapped = attrs.map((a: any) => ({
          label: a?.name || "",
          key: a?.slug || undefined,
          type: a?.type || "text",
        }));
        setSchema(mapped.filter((x: any) => !!x.label));
      })
      .catch(() => setSchema([]));
  }, [node?.fullSlug, node?.slug]);

  const presets = useMemo(
    () => [
      {
        label: "Otomotiv > Yedek Parça > Otomobil > Ateşleme & Yakıt",
        path: ["otomotiv-ekipmanlari", "yedek-parca", "otomobil-arazi-araci", "atesleme-yakit"],
      },
      {
        label: "Otomotiv > Yedek Parça > Minivan & Panelvan > Motor",
        path: ["otomotiv-ekipmanlari", "yedek-parca", "minivan-panelvan", "motor"],
      },
      {
        label: "Otomotiv > Aksesuar & Tuning > Otomobil > İç Aksesuar",
        path: ["otomotiv-ekipmanlari", "aksesuar-tuning", "otomobil-arazi-araci", "i-c-aksesuar"],
      },
      {
        label: "Otomotiv > Ses & Görüntü Sistemleri > Aksesuar",
        path: ["otomotiv-ekipmanlari", "ses-goruntu-sistemleri", "aksesuar"],
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Yedek Parça Kategori Testi</h1>
              <p className="text-sm text-gray-600">{root.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link className="px-3 py-2 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200" href="/">
                Ana Sayfa
              </Link>
              <Link
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-cyan-600 text-white hover:bg-cyan-700"
                href={`/kategori/${categorySlug}`}
              >
                Kategoriye Git
              </Link>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="text-sm font-bold text-gray-800">Hızlı Seçimler</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {presets.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setPath(p.path)}
                      className="px-3 py-2 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPath([])}
                  className="px-3 py-2 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200"
                >
                  Sıfırla
                </button>
                <button
                  type="button"
                  onClick={() => setPath((prev) => prev.slice(0, -1))}
                  disabled={path.length === 0}
                  className="px-3 py-2 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                >
                  Geri
                </button>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="text-sm font-bold text-gray-800">Seçili Yol</div>
                <div className="mt-2 text-sm text-gray-700 break-words">
                  {path.length ? path.join(" / ") : "(kök)"}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {levelItems.map((s) => {
                    const isSelected = path[path.length - 1] === s.slug;
                    return (
                      <button
                        key={s.slug}
                        type="button"
                        onClick={() => setPath((prev) => [...prev.slice(0, -1), s.slug])}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border ${
                          isSelected
                            ? "bg-cyan-600 text-white border-cyan-600"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-bold text-gray-800">Alt Seviyeler</div>
                  {node && (
                    <Link
                      className="text-xs font-semibold text-cyan-700 hover:text-cyan-800"
                      href={`/kategori/${categorySlug}/${path.join("/")}`}
                    >
                      Bu sayfayı aç
                    </Link>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(path.length === 0 ? root.subcategories || [] : nextLevelItems).map((s) => (
                    <button
                      key={s.slug}
                      type="button"
                      onClick={() => setPath((prev) => [...prev, s.slug])}
                      className="px-3 py-2 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200"
                    >
                      {s.name}
                    </button>
                  ))}
                  {path.length > 0 && nodeChildren.length === 0 && (
                    <div className="text-xs text-gray-500">Seçili düğüm yaprak.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="text-sm font-bold text-gray-800">Anahtarlar</div>
                <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-gray-700">
                  <div className="break-words">
                    <span className="font-semibold">overrideKey: </span>
                    {overrideKey}
                  </div>
                  <div className="break-words">
                    <span className="font-semibold">fullSlug: </span>
                    {node?.fullSlug || "-"}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-bold text-gray-800">Filtre Alanları</div>
                  <div className="text-xs font-semibold text-gray-600">{schema.length} alan</div>
                </div>

                {schema.length === 0 ? (
                  <div className="mt-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    Bu seçim için override schema bulunamadı.
                  </div>
                ) : (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {schema.map((f, idx) => (
                      <div
                        key={`${f.key || f.label}-${idx}`}
                        className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                      >
                        <div className="text-xs font-bold text-gray-800">{f.label}</div>
                        <div className="text-[11px] text-gray-600">
                          {f.key ? `key: ${f.key}` : "key: -"} · {f.type}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="text-sm font-bold text-gray-800">Talep Oluştur Testi</div>
                <div className="mt-2 text-sm text-gray-700">
                  Talep oluşturma ekranında kategori seçip aynı yolu izleyerek alanların geldiğini doğrulayın.
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    className="px-3 py-2 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200"
                    href={`/talep-olustur?category=${categorySlug}`}
                  >
                    Talep Oluştur
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
