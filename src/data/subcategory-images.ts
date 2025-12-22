// Bu dosya site genelindeki varsayılan kategori ve alt kategori resimlerini yönetir.
// This file manages default category and subcategory images across the site.

// ÖZEL DURUMLAR / OVERRIDES
// Standart isimlendirmeye uymayan veya özel bir resim kullanılması gereken alt kategoriler için burayı kullanın.
// Use this for subcategories that don't fit the standard naming or need a special image.
export const SUBCATEGORY_OVERRIDES: Record<string, string> = {
  // Örnek / Example:
  // "ozel-araclar": "/images/defaults/custom-vehicle.webp",
};

// Mevcut varsayılan resimlerin listesi
// List of available default images
const AVAILABLE_DEFAULTS = [
  'satilik-daire',
  'yem-mama',
];

/**
 * Alt kategori için varsayılan resmi döndürür.
 * Returns the default image for a subcategory.
 * 
 * SİSTEMİN ÇALIŞMA MANTIĞI / SYSTEM LOGIC:
 * 1. Önce SUBCATEGORY_OVERRIDES listesine bakar. Varsa oradaki yolu kullanır.
 * 2. AVAILABLE_DEFAULTS listesinde varsa "/images/defaults/[alt-kategori-slug].webp" döner.
 * 3. Yoksa, "/images/placeholder-1.svg" döner.
 */
export function getSubcategoryImage(subcategory: string, category: string): string {
  if (!subcategory) return '/images/placeholder-1.svg';

  // 1. Özel tanımlama var mı kontrol et / Check for overrides
  if (SUBCATEGORY_OVERRIDES[subcategory]) {
    return SUBCATEGORY_OVERRIDES[subcategory];
  }

  // 2. Varsayılan resim mevcut mu? / Is default image available?
  if (AVAILABLE_DEFAULTS.includes(subcategory)) {
    return `/images/defaults/${subcategory}.webp`;
  }

  // 3. Yoksa placeholder döndür / Return placeholder
  return '/images/placeholder-1.svg';
}
