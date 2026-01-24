import hierarchyData from '@/data/vehicle-hierarchy.json';
import allowedSchema from '@/data/vehicle-schema.json';
import extraBrandModelsData from '@/data/extra-brands.json';

// Type definitions
type Hierarchy = {
    [category: string]: {
        [brand: string]: {
            [model: string]: {
                [seri: string]: string[] // Packages
            }
        }
    }
};

const hierarchy = hierarchyData as Hierarchy;
const extraBrandModels = extraBrandModelsData as Record<string, Record<string, string[]>>;

export function resolveVehicleCategoryKey(categorySlug: string): string {
    const raw = String(categorySlug || "").trim();
    if (!raw) return "";
    const lower = raw.toLowerCase();

    // Normalize Satariz-style slugs like "vasita/vasita-arac" -> "vasita/arac"
    let normalized = lower.replace(/\/vasita-/g, "/");
    if (normalized.startsWith("vasita-")) normalized = `vasita/${normalized.slice("vasita-".length)}`;

    // Canonicalize to the existing vehicle-data keys when possible.
    // This is critical for bucket selection and for EXTRA_* lookups.
    if (normalized.includes("motosiklet")) return "vasita/motosiklet";
    if (normalized.includes("suv") || normalized.includes("arazi") || normalized.includes("pickup")) return "vasita/arazi-suv-pickup";
    if (normalized.includes("minivan") || normalized.includes("panelvan")) return "vasita/minivan-panelvan";
    if (normalized.includes("traktor") || normalized.includes("tarim")) return "vasita/traktor";

    // Truck-like commercial subtypes can reuse the existing "kamyon-cekici" dataset.
    if (
        normalized.includes("kamyon-cekici") ||
        normalized.includes("ticari-araclar-kamyon") ||
        normalized.includes("ticari-araclar-cekici") ||
        normalized.includes("ticari-araclar-dorse") ||
        normalized.includes("ticari-araclar-romork") ||
        normalized.includes("kamyon-kamyonet") ||
        normalized.includes("cekici")
    ) {
        return "vasita/kamyon-cekici";
    }

    if (normalized.includes("otomobil")) return "vasita/otomobil";

    // Some sources use "arac" as a generic "car" node.
    if (normalized.endsWith("/arac") || normalized === "vasita/arac") return "vasita/otomobil";

    return normalized;
}

function normalizeBrandToken(s: string): string {
    return String(s || "")
        .toLocaleLowerCase('tr')
        .replace(/\s+/g, ' ')
        .trim();
}

export function getCommercialSubtype(categorySlug: string): string | null {
    const raw = String(categorySlug || '').toLowerCase();
    const normalized = raw.replace(/\/vasita-/g, '/').replace(/^vasita-/, 'vasita/');
    const s = normalized;

    if (s.includes('ticari-araclar-otobus')) return 'otobus';
    if (s.includes('ticari-araclar-minibus-midibus')) return 'minibus-midibus';
    if (s.includes('ticari-araclar-kamyon-kamyonet')) return 'kamyon-kamyonet';
    if (s.includes('ticari-araclar-cekici')) return 'cekici';
    if (s.includes('ticari-araclar-dorse')) return 'dorse';
    if (s.includes('ticari-araclar-romork')) return 'romork';
    if (s.includes('ticari-araclar-oto-kurtarici-tasiyici')) return 'oto-kurtarici';
    if (s.includes('ticari-araclar-karoser-ust-yapi')) return 'karoser-ust-yapi';
    if (s.includes('ticari-araclar-ticari-hat-ticari-plaka')) return 'ticari-plaka';
    return null;
}

const TICARI_BRAND_ALLOWLIST: Record<string, string[]> = {
    otobus: ['Mercedes-Benz', 'Mercedes - Benz', 'MAN', 'Neoplan', 'Setra', 'Temsa', 'Otokar', 'BMC', 'Isuzu', 'Iveco', 'Volvo', 'Scania', 'Karsan'],
    'minibus-midibus': ['Mercedes-Benz', 'Mercedes - Benz', 'Ford', 'Fiat', 'Renault', 'Peugeot', 'Citroen', 'Citroën', 'Opel', 'Volkswagen', 'Hyundai', 'Isuzu', 'Iveco', 'Toyota', 'Nissan', 'Mitsubishi', 'Karsan', 'Otokar', 'Temsa', 'BMC'],
    'kamyon-kamyonet': ['Mercedes-Benz', 'Mercedes - Benz', 'Ford', 'MAN', 'Volvo', 'Scania', 'Renault', 'Iveco', 'Isuzu', 'Toyota', 'Nissan', 'Mitsubishi', 'Hyundai', 'BMC'],
    cekici: ['Mercedes-Benz', 'Mercedes - Benz', 'MAN', 'Volvo', 'Scania', 'Renault', 'Iveco'],
    dorse: [],
    romork: [],
    'oto-kurtarici': ['Mercedes-Benz', 'Mercedes - Benz', 'Ford', 'MAN', 'Volvo', 'Scania', 'Renault', 'Iveco', 'Isuzu', 'BMC'],
    'karoser-ust-yapi': [],
    'ticari-plaka': [],
};

function filterBrandsByCommercialSubtype(categorySlug: string, brands: string[]): string[] {
    const subtype = getCommercialSubtype(categorySlug);
    if (!subtype) return brands;
    const allow = TICARI_BRAND_ALLOWLIST[subtype];
    if (!Array.isArray(allow) || allow.length === 0) return [];
    const allowSet = new Set(allow.map(normalizeBrandToken));
    return (brands || []).filter((b) => allowSet.has(normalizeBrandToken(b)));
}

// Helper to map category slug to hierarchy key
function getHierarchyKey(categorySlug: string): string {
    if (!categorySlug) return 'others';
    const s = resolveVehicleCategoryKey(categorySlug).toLowerCase();
    
    // Specific types first to avoid partial matches (e.g. 'hasarli-araclar-motosiklet' containing 'otomobil' in slug)
    if (s.includes('motosiklet')) return 'motosiklet';
    if (s.includes('suv') || s.includes('arazi') || s.includes('pickup')) return 'suv';
    if (s.includes('minivan') || s.includes('panelvan')) return 'minivan';
    if (s.includes('ticari') || s.includes('kamyon') || s.includes('otobus') || s.includes('minibus')) return 'ticari';
    if (s.includes('karavan')) return 'karavan';
    if (s.includes('deniz')) return 'deniz';
    if (s.includes('hava')) return 'hava';
    if (s.includes('atv') || s.includes('utv')) return 'atv';
    if (s.includes('traktor') || s.includes('tarim')) return 'traktor';
    
    // Generic types or modifiers
    if (s.includes('otomobil')) return 'otomobil';
    if (s.includes('kiralik')) return 'kiralik';
    
    // Modifiers that map to otomobil if no specific type found
    if (s.includes('hasarli')) return 'otomobil';
    if (s.includes('klasik')) return 'otomobil';
    if (s.includes('engelli')) return 'otomobil';

    return 'others';
}

export function getBrands(categorySlug: string): string[] {
    const canonical = resolveVehicleCategoryKey(categorySlug);
    const extra = extraBrandModels[categorySlug] || extraBrandModels[canonical];
    if (extra) {
        const brands = Object.keys(extra || {}).sort((a, b) => a.localeCompare(b, 'tr'));
        if (getHierarchyKey(canonical) === 'ticari') return filterBrandsByCommercialSubtype(categorySlug, brands);
        return brands;
    }
    const key = getHierarchyKey(canonical);
    const brands = hierarchy[key] ? Object.keys(hierarchy[key]) : [];
    const sorted = brands.sort((a, b) => a.localeCompare(b, 'tr'));
    if (key === 'ticari') return filterBrandsByCommercialSubtype(categorySlug, sorted);
    return sorted;
}

export function getModels(categorySlug: string, brands: string[]): string[] {
    const canonical = resolveVehicleCategoryKey(categorySlug);
    const extra = extraBrandModels[categorySlug] || extraBrandModels[canonical];
    if (extra) {
        const models = new Set<string>();
        const brandList = Array.isArray(brands) ? brands : [brands];
        for (const brand of brandList) {
            const rawBrand = String(brand || "").trim();
            if (!rawBrand) continue;
            const map = extra || {};
            const resolvedBrand =
              map[rawBrand]
                ? rawBrand
                : (Object.keys(map).find((k) => k.toLowerCase() === rawBrand.toLowerCase()) || rawBrand);
            const arr = map?.[resolvedBrand];
            if (Array.isArray(arr)) arr.forEach((m) => models.add(m));
        }
        return Array.from(models).sort((a, b) => a.localeCompare(b, 'tr'));
    }
    const key = getHierarchyKey(canonical);
    if (!hierarchy[key]) return [];
    
    const models = new Set<string>();
    // Handle single string or array
    const brandList = Array.isArray(brands) ? brands : [brands];
    
    for (const brand of brandList) {
        const rawBrand = String(brand || "").trim();
        if (!rawBrand) continue;
        const bucket = hierarchy[key];
        const resolvedBrand =
          bucket[rawBrand]
            ? rawBrand
            : (Object.keys(bucket).find((k) => k.toLowerCase() === rawBrand.toLowerCase()) || rawBrand);
        if (bucket[resolvedBrand]) Object.keys(bucket[resolvedBrand]).forEach(m => models.add(m));
    }
    return Array.from(models).sort((a, b) => a.localeCompare(b, 'tr'));
}

export function getSeries(categorySlug: string, brands: string[], models: string[]): string[] {
    const canonical = resolveVehicleCategoryKey(categorySlug);
    const key = getHierarchyKey(canonical);
    if (!hierarchy[key]) return [];
    
    const brandList = Array.isArray(brands) ? brands : [brands];
    const modelList = Array.isArray(models) ? models : [models];

    const series = new Set<string>();
    for (const brand of brandList) {
        const rawBrand = String(brand || "").trim();
        if (!rawBrand) continue;
        const bucket = hierarchy[key];
        const resolvedBrand =
          bucket[rawBrand]
            ? rawBrand
            : (Object.keys(bucket).find((k) => k.toLowerCase() === rawBrand.toLowerCase()) || rawBrand);
        const brandNode = bucket[resolvedBrand];
        if (!brandNode) continue;
        for (const model of modelList) {
            const rawModel = String(model || "").trim();
            if (!rawModel) continue;
            const resolvedModel =
              brandNode[rawModel]
                ? rawModel
                : (Object.keys(brandNode).find((k) => k.toLowerCase() === rawModel.toLowerCase()) || rawModel);
            if (brandNode[resolvedModel]) {
                Object.keys(brandNode[resolvedModel]).forEach(s => series.add(s));
            }
        }
    }
    return Array.from(series).sort((a, b) => a.localeCompare(b, 'tr'));
}

export function getTrims(categorySlug: string, brands: string[], models: string[], series: string[]): string[] {
    const canonical = resolveVehicleCategoryKey(categorySlug);
    const key = getHierarchyKey(canonical);
    if (!hierarchy[key]) return [];
    
    const brandList = Array.isArray(brands) ? brands : [brands];
    const modelList = Array.isArray(models) ? models : [models];
    const seriesList = Array.isArray(series) ? series : [series];

    const trims = new Set<string>();
    for (const brand of brandList) {
        const rawBrand = String(brand || "").trim();
        if (!rawBrand) continue;
        const bucket = hierarchy[key];
        const resolvedBrand =
          bucket[rawBrand]
            ? rawBrand
            : (Object.keys(bucket).find((k) => k.toLowerCase() === rawBrand.toLowerCase()) || rawBrand);
        const brandNode = bucket[resolvedBrand];
        if (!brandNode) continue;
        for (const model of modelList) {
            const rawModel = String(model || "").trim();
            if (!rawModel) continue;
            const resolvedModel =
              brandNode[rawModel]
                ? rawModel
                : (Object.keys(brandNode).find((k) => k.toLowerCase() === rawModel.toLowerCase()) || rawModel);
            const modelNode = brandNode[resolvedModel];
            if (!modelNode) continue;
            for (const s of seriesList) {
                 const rawSeries = String(s || "").trim();
                 if (!rawSeries) continue;
                 const resolvedSeries =
                   modelNode[rawSeries]
                     ? rawSeries
                     : (Object.keys(modelNode).find((k) => k.toLowerCase() === rawSeries.toLowerCase()) || rawSeries);
                 const packages = modelNode[resolvedSeries];
                 if (Array.isArray(packages)) packages.forEach(p => trims.add(p));
            }
        }
    }
    return Array.from(trims).sort((a, b) => a.localeCompare(b, 'tr'));
}

export function getEquipments(category: string, brand: string, model: string, series: string, trim: string): string[] {
    if (!category || !brand || !model || !series || !trim) return [];
    return [];
}

export function getCategoryAttributes(category: string): any[] {
  const schema = (allowedSchema as any)[category];
  if (!schema || !schema.attributes) return [];

  const rawAttrs = schema.attributes as Record<string, string[]>;
  const result: any[] = [];

  const KEY_MAP: Record<string, string> = {
    'YAKIT TİPİ': 'yakit',
    'VİTES': 'vites',
    'KASA TİPİ': 'kasa-tipi',
    'RENK': 'renk',
    'AĞIRHASAR KAYITLI': 'agir-hasar-kayitli',
    'ARAÇ DURUMU': 'durumu',
    'ÇEKİŞ': 'cekis',
    'KAPI': 'kapi',
    'MOTOR HACMİ': 'motor-hacmi',
    'MOTOR GÜCÜ': 'motor-gucu'
  };

  const IGNORED_KEYS = ['MODEL', 'MOTOR/SERİ', 'DONANIM/PAKET', 'YIL', 'KM', 'FİYAT', 'YIL MAX', 'KM MAX'];

  for (const [key, values] of Object.entries(rawAttrs)) {
    if (IGNORED_KEYS.includes(key)) continue;
    
    if (key.includes('MAX') || key.includes('MİN')) continue;

    const mappedKey = KEY_MAP[key] || key.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const cleanValues = values.filter(v => 
      v && 
      !v.includes('MAX') && 
      !v.includes('MİN') && 
      v !== key
    );

    if (cleanValues.length === 0) continue;

    const label = key.charAt(0).toUpperCase() + key.slice(1).toLocaleLowerCase('tr');

    result.push({
      slug: mappedKey,
      name: label,
      type: 'select',
      options: cleanValues,
      key: mappedKey,
      label: label
    });
  }

  return result;
}
