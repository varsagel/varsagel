// Bu dosya site genelindeki varsayılan kategori ve alt kategori resimlerini yönetir.
// This file manages default category and subcategory images across the site.

import availableDefaults from "./available-defaults.json";

// ÖZEL DURUMLAR / OVERRIDES
// Standart isimlendirmeye uymayan veya özel bir resim kullanılması gereken alt kategoriler için burayı kullanın.
// Use this for subcategories that don't fit the standard naming or need a special image.
export const SUBCATEGORY_OVERRIDES: Record<string, string> = {
  // Örnek / Example:
  // "ozel-araclar": "/images/defaults/custom-vehicle.webp",
};

// Mevcut varsayılan resimlerin listesi
// List of available default images
const AVAILABLE_DEFAULTS = Array.isArray(availableDefaults) ? availableDefaults : [];

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  emlak: "/images/subcategories/Emlak.webp",
  vasita: "/images/subcategories/Vasıta.webp",
  "yedek-parca-aksesuar-donanim-tuning": "/images/subcategories/Yedek Parça, Aksesuar, Donanım & Tuning.webp",
  alisveris: "/images/subcategories/İkinci El Ve Sıfır Alışveriş.webp",
  sanayi: "/images/subcategories/İş Makineleri & Sanayi.webp",
  "ustalar-hizmetler": "/images/subcategories/Ustalar Ve Hizmetler.webp",
  "ozel-ders-arayanlar": "/images/subcategories/Özel Ders Arayanlar.webp",
  "is-arayanlar": "/images/subcategories/İş Arayanlar.webp",
  "yardimci-arayanlar": "/images/subcategories/Yardımcı Arayanlar.webp",
  "hayvanlar-alemi": "/images/subcategories/Hayvanlar Alemi.webp",
  yedekparcaaksesuardonanimtuning: "/images/subcategories/Yedek Parça, Aksesuar, Donanım & Tuning.webp",
  ikincielvesifiralisveris: "/images/subcategories/İkinci El Ve Sıfır Alışveriş.webp",
  ismakinelarisanayi: "/images/subcategories/İş Makineleri & Sanayi.webp",
  ustalarvehizmetler: "/images/subcategories/Ustalar Ve Hizmetler.webp",
  ozeldersarayanlar: "/images/subcategories/Özel Ders Arayanlar.webp",
  isarayanlar: "/images/subcategories/İş Arayanlar.webp",
  yardimciarayanlar: "/images/subcategories/Yardımcı Arayanlar.webp",
  hayvanlaralemi: "/images/subcategories/Hayvanlar Alemi.webp",
};
const DEFAULT_CATEGORY_IMAGE = "/images/subcategories/Emlak.webp";

const normalizeCategoryKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/[ıİ]/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "")
    .trim();

const encodePath = (value: string) => {
  if (!value) return value;
  return encodeURI(value);
};

export function getCategoryImage(category: string): string {
  const raw = String(category || "").trim();
  if (!raw) return encodePath(DEFAULT_CATEGORY_IMAGE);
  const direct = CATEGORY_IMAGE_MAP[raw.toLowerCase()];
  if (direct) return encodePath(direct);
  const normalized = normalizeCategoryKey(raw);
  return encodePath(CATEGORY_IMAGE_MAP[normalized] || DEFAULT_CATEGORY_IMAGE);
}

/**
 * Alt kategori için varsayılan resmi döndürür.
 * Returns the default image for a subcategory.
 * 
 * SİSTEMİN ÇALIŞMA MANTIĞI / SYSTEM LOGIC:
 * 1. Önce SUBCATEGORY_OVERRIDES listesine bakar. Varsa oradaki yolu kullanır.
 * 2. AVAILABLE_DEFAULTS listesinde varsa "/images/defaults/[alt-kategori-slug].webp" döner.
 * 3. Yoksa, "/images/placeholder-1.svg" döner.
 */
export function getSubcategoryImage(subcategory: string, category?: string): string {
  const categoryFallback = getCategoryImage(category || "");
  if (!subcategory) return categoryFallback;
  const raw = String(subcategory || '').trim();
  if (!raw) return categoryFallback;

  // 1. Özel tanımlama var mı kontrol et / Check for overrides
  if (SUBCATEGORY_OVERRIDES[raw]) {
    return encodePath(SUBCATEGORY_OVERRIDES[raw]);
  }

  // 2. Varsayılan resim mevcut mu? / Is default image available?
  if (AVAILABLE_DEFAULTS.includes(raw)) {
    return encodePath(`/images/defaults/${raw}.webp`);
  }

  const normalized = raw.replace(/\/+/g, '-').replace(/^-+|-+$/g, '');
  if (normalized && SUBCATEGORY_OVERRIDES[normalized]) {
    return encodePath(SUBCATEGORY_OVERRIDES[normalized]);
  }
  if (normalized && AVAILABLE_DEFAULTS.includes(normalized)) {
    return encodePath(`/images/defaults/${normalized}.webp`);
  }

  const parts = normalized.split('-').filter(Boolean);
  for (let i = parts.length - 1; i >= 1; i--) {
    const candidate = parts.slice(0, i).join('-');
    if (SUBCATEGORY_OVERRIDES[candidate]) return encodePath(SUBCATEGORY_OVERRIDES[candidate]);
    if (AVAILABLE_DEFAULTS.includes(candidate)) return encodePath(`/images/defaults/${candidate}.webp`);
  }

  return categoryFallback;
}
