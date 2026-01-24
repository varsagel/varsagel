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
  'aksesuarlar',
  'akvaryum-baliklari',
  'anne-bebek',
  'arac-servis-bakim',
  'atv-utv',
  'avukatlik-hukuki-danismanlik',
  'bahce-yapi-market',
  'bebek-cocuk-bakicisi',
  'bilgisayar',
  'bilisim-yazilim',
  'bocekler',
  'buyukbas-hayvanlar',
  'cep-telefonu',
  'deniz-araci-ekipmanlari',
  'deniz-araclari',
  'deniz-canlilari',
  'devren-satilik',
  'diger-her-sey',
  'direksiyon',
  'dugun-etkinlik',
  'egitim',
  'eglence-ve-aktiviteler',
  'elektrik-enerji',
  'elektrikli-araclar',
  'elektrikli-ev-aletleri',
  'engelli-plakali-araclar',
  'ev-dekorasyon',
  'ev-elektronigi',
  'ev-tadilat-dekorasyon',
  'evcil-hayvanlar',
  'fotograf-kamera',
  'fotograf-video',
  'giyim-aksesuar',
  'guzellik-bakim',
  'guzellik-ve-bakim',
  'hasarli-araclar',
  'hava-araclari',
  'hobi-oyuncak',
  'hukuk-mali-musavirlik',
  'ilkogretim-takviye',
  'insaat-ve-yapi',
  'insan-kaynaklari',
  'is-ilanlari-temizlik',
  'is-makineleri',
  'isletme-ve-stratejik-yonetim',
  'it-ve-yazilim-gelistirme',
  'kamyon-cekici',
  'karavan',
  'kask-kiyafet-ekipman',
  'kiralik-araclar',
  'kiralik-arsa',
  'kiralik-daire',
  'kiralik-isyeri',
  'kiralik-villa',
  'kiralik-yazlik',
  'kisisel-bakim-kozmetik',
  'kisisel-gelisim',
  'kitap-dergi-film',
  'klasik-araclar',
  'kucukbas-hayvanlar',
  'kumes-hayvanlari',
  'lise-universite-hazirlik',
  'lojistik-ve-tasima',
  'magazacilik-ve-perakendecilik',
  'minibus-midibus',
  'minivan-panelvan',
  'motosiklet-ekipmanlari',
  'muhasebe-finans-ve-bankacilik',
  'muhendislik',
  'musteri-hizmetleri',
  'muzik-enstruman',
  'muzik-enstrumanlari',
  'nakliye',
  'ofis-kirtasiye',
  'otobus',
  'otomobil',
  'otomotiv-ekipmanlari',
  'oyun-konsol',
  'ozel-ders-bilgisayar',
  'ozel-ders-spor',
  'pet',
  'restoran-ve-konaklama',
  'saat',
  'sanat',
  'sanayi',
  'satilik-arsa',
  'satilik-bina',
  'satilik-daire',
  'satilik-isyeri',
  'satilik-villa',
  'satilik-yazlik',
  'satis',
  'sekreterlik-ve-idari-asistanlik',
  'ses-goruntu-sistemleri',
  'spor-outdoor',
  'surungenler',
  'tam-zamanli',
  'tamir-ve-bakim',
  'tarim-makineleri',
  'tarim-ve-sarapcilik',
  'tasarim-ve-yaraticilik',
  'teknik-elektronik',
  'tekstil-ve-konfeksiyon',
  'temizlik-hizmetleri',
  'ticari-araclar',
  'traktor',
  'turistik-tesis',
  'uretim-ve-imalat',
  'yabanci-dil',
  'yari-zamanli-ve-ogrenci-isleri',
  'yari-zamanli',
  'stajyer',
  'beyaz-esya',
  'yem-mama'
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
export function getSubcategoryImage(subcategory: string): string {
  if (!subcategory) return '/images/placeholder-1.svg';
  const raw = String(subcategory || '').trim();
  if (!raw) return '/images/placeholder-1.svg';

  // 1. Özel tanımlama var mı kontrol et / Check for overrides
  if (SUBCATEGORY_OVERRIDES[raw]) {
    return SUBCATEGORY_OVERRIDES[raw];
  }

  // 2. Varsayılan resim mevcut mu? / Is default image available?
  if (AVAILABLE_DEFAULTS.includes(raw)) {
    return `/images/defaults/${raw}.webp`;
  }

  const normalized = raw.replace(/\/+/g, '-').replace(/^-+|-+$/g, '');
  if (normalized && SUBCATEGORY_OVERRIDES[normalized]) {
    return SUBCATEGORY_OVERRIDES[normalized];
  }
  if (normalized && AVAILABLE_DEFAULTS.includes(normalized)) {
    return `/images/defaults/${normalized}.webp`;
  }

  const parts = normalized.split('-').filter(Boolean);
  for (let i = 1; i < parts.length; i++) {
    const candidate = parts.slice(i).join('-');
    if (SUBCATEGORY_OVERRIDES[candidate]) return SUBCATEGORY_OVERRIDES[candidate];
    if (AVAILABLE_DEFAULTS.includes(candidate)) return `/images/defaults/${candidate}.webp`;
  }

  // 3. Yoksa placeholder döndür / Return placeholder
  return '/images/placeholder-1.svg';
}
