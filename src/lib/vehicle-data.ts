import fs from 'node:fs';
import path from 'node:path';
import * as XLSX from 'xlsx';
import hierarchyData from '@/data/vehicle-hierarchy.json';
import allowedSchema from '@/data/vehicle-schema.json';
import extraBrandModelsData from '@/data/extra-brands.json';
import { EXTRA_MODEL_SERIES } from '@/data/extra-vehicle-details';
import { AUTOMOBILE_TRIM_EQUIPMENTS } from '@/data/automobile-data-clean';

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
        .replace(/[ç]/g, 'c')
        .replace(/[ğ]/g, 'g')
        .replace(/[ı]/g, 'i')
        .replace(/[ö]/g, 'o')
        .replace(/[ş]/g, 's')
        .replace(/[ü]/g, 'u')
        .replace(/[^a-z0-9]/g, '')
        .trim();
}

function normalizeModelToken(s: string): string {
    return String(s || "")
        .replace(/\([^)]*\)/g, '')
        .toLocaleLowerCase('tr')
        .replace(/[ç]/g, 'c')
        .replace(/[ğ]/g, 'g')
        .replace(/[ı]/g, 'i')
        .replace(/[ö]/g, 'o')
        .replace(/[ş]/g, 's')
        .replace(/[ü]/g, 'u')
        .replace(/[^a-z0-9]/g, '')
        .trim();
}

function resolveBrandKey(bucket: Record<string, any>, rawBrand: string): string {
    if (bucket[rawBrand]) return rawBrand;
    const target = normalizeBrandToken(rawBrand);
    const exact = Object.keys(bucket).find((k) => normalizeBrandToken(k) === target);
    if (exact) return exact;
    const relaxed = Object.keys(bucket).find((k) => {
        const token = normalizeBrandToken(k);
        return target.includes(token) || token.includes(target);
    });
    return relaxed || rawBrand;
}

function resolveKey(bucket: Record<string, any>, rawKey: string, normalizer: (s: string) => string): string {
    if (bucket[rawKey]) return rawKey;
    const target = normalizer(rawKey);
    const exact = Object.keys(bucket).find((k) => normalizer(k) === target);
    return exact || rawKey;
}

type ExcelCategoryBucket = Map<string, { display: string; models: Set<string> }>;

let excelCategoryModelCache: Record<string, ExcelCategoryBucket> | null = null;

function getExcelCategoryModels(): Record<string, ExcelCategoryBucket> {
    if (excelCategoryModelCache) return excelCategoryModelCache;
    const result: Record<string, ExcelCategoryBucket> = {
        'vasita/arazi-suv-pickup': new Map(),
        'vasita/minivan-panelvan': new Map()
    };
    try {
        const dir = path.join(process.cwd(), 'kategoriler');
        const fileName = fs.readdirSync(dir).find((n) => n.includes('VASITA ALT KATEGOR') && n.endsWith('.xlsx'));
        if (!fileName) {
            excelCategoryModelCache = result;
            return result;
        }
        const filePath = path.join(dir, fileName);
        const wb = XLSX.readFile(filePath);
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' }) as Record<string, string>[];
        for (const r of rows) {
            const alt = String(r['alt kategori'] || r['alt kategori '] || r['alt_kategori'] || r['Alt Kategori'] || r['Alt kategori'] || '').trim();
            const categoryKey =
                alt === 'Arazi, SUV & Pickup'
                    ? 'vasita/arazi-suv-pickup'
                    : alt === 'Minivan & Panelvan'
                        ? 'vasita/minivan-panelvan'
                        : null;
            if (!categoryKey) continue;
            const brand = String(r['Marka'] || r['marka'] || '').trim();
            const modelRaw = String(r['Model'] || r['model'] || '');
            const model = String(modelRaw).replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
            if (!brand || !model) continue;
            const brandKey = normalizeBrandToken(brand);
            if (!brandKey) continue;
            const bucket = result[categoryKey];
            if (!bucket.has(brandKey)) bucket.set(brandKey, { display: brand, models: new Set() });
            bucket.get(brandKey)?.models.add(model);
        }
    } catch {
        excelCategoryModelCache = result;
        return result;
    }
    excelCategoryModelCache = result;
    return result;
}

function getExcelModelExclusions(): Map<string, Set<string>> {
    const cache = getExcelCategoryModels();
    const map = new Map<string, Set<string>>();
    const addModel = (brand: string, model: string) => {
        const brandKey = normalizeBrandToken(brand);
        if (!brandKey) return;
        const modelKey = normalizeModelToken(model);
        if (!modelKey) return;
        if (!map.has(brandKey)) map.set(brandKey, new Set());
        map.get(brandKey)?.add(modelKey);
    };
    for (const bucket of Object.values(cache)) {
        for (const [, entry] of bucket.entries()) {
            for (const model of entry.models) addModel(entry.display, model);
        }
    }
    const extraSources = [
        extraBrandModels['vasita/arazi-suv-pickup'],
        extraBrandModels['vasita/minivan-panelvan']
    ];
    for (const source of extraSources) {
        if (!source) continue;
        for (const [brand, models] of Object.entries(source)) {
            if (!Array.isArray(models)) continue;
            for (const model of models) addModel(brand, model);
        }
    }
    const extraSeriesSources = [
        (EXTRA_MODEL_SERIES as Record<string, Record<string, Record<string, string[]>>> | undefined)?.['vasita/arazi-suv-pickup'],
        (EXTRA_MODEL_SERIES as Record<string, Record<string, Record<string, string[]>>> | undefined)?.['vasita/minivan-panelvan']
    ];
    for (const source of extraSeriesSources) {
        if (!source) continue;
        for (const [brand, models] of Object.entries(source)) {
            if (!models || typeof models !== 'object') continue;
            for (const model of Object.keys(models)) addModel(brand, model);
        }
    }
    return map;
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

// Türkiye'de yaygın olan markalar (kategoriye göre ayrılmış)
// XLSX dosyasındaki marka listelerine göre güncellenmiştir
const TURKEY_CATEGORY_BRANDS: Record<string, string[]> = {
    otomobil: [
        "Abarth", "Aion", "Alfa Romeo", "Alpine", "Anadol", "Arora", "Aston Martin", "Audi",
        "Bentley", "BMW", "Buick", "BYD", "Cadillac", "Chery", "Chevrolet", "Chrysler",
        "Citroen", "Cupra", "Dacia", "Daewoo", "Daihatsu", "Dodge", "DS Automobiles",
        "Eagle", "Ferrari", "Fiat", "Ford", "Geely", "Honda", "Hyundai", "I-GO", "Ikco",
        "Infiniti", "Jaguar", "Joyce", "Kia", "Kuba", "Lada", "Lamborghini", "Lancia",
        "Lexus", "Lincoln", "Lotus", "Maserati", "Mazda", "McLaren", "Mercedes-Benz",
        "Mercury", "MG", "MINI", "Mitsubishi", "Nissan", "Oldsmobile", "Opel", "Peugeot",
        "Plymouth", "Pontiac", "Porsche", "Proton", "Renault", "Rolls-Royce", "Rover",
        "Saab", "Seat", "Skoda", "Smart", "SsangYong", "Subaru", "Suzuki", "Tata",
        "Tesla", "Toyota", "Volkswagen", "Volvo", "Wartburg", "ZAZ"
    ],
    suv: [
        "Acura", "Alfa Romeo", "Aston Martin", "Audi", "Bentley", "BMW", "BYD", "Cadillac",
        "Chery", "Chevrolet", "Chrysler", "Citroen", "Cupra", "Dacia", "Daewoo", "Daihatsu",
        "DFM", "DFSK", "Dodge", "DS Automobiles", "Ferrari", "Fiat", "Ford", "Forthing",
        "Foton", "GMC", "Honda", "Hongqi", "Hummer", "Hyundai", "Infiniti", "Isuzu",
        "Jaecoo", "Jaguar", "Jeep", "KGM SsangYong", "Kia", "Lada", "Lamborghini",
        "Land Rover", "Lexus", "Lincoln", "Lotus", "Lynk & Co", "Mahindra", "Maserati",
        "Mazda", "Mercedes-Benz", "MG", "MINI", "Mitsubishi", "Nissan", "Opel", "Peugeot",
        "Porsche", "Range Rover", "Renault", "Rolls-Royce", "Rover", "Saab", "Seat",
        "Skoda", "SsangYong", "Subaru", "Suzuki", "Tata", "Toyota", "Volkswagen", "Volvo"
    ],
    minivan: [
        "Chery", "Chevrolet", "Chrysler", "Citroen", "Dacia", "Daewoo", "Dodge", "Fiat",
        "Ford", "Geely", "Honda", "Hyundai", "Kia", "Lancia", "Mercedes-Benz", "Nissan",
        "Opel", "Peugeot", "Renault", "Seat", "SsangYong", "Toyota", "Volkswagen"
    ],
    motosiklet: [
        'Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'BMW', 'Ducati', 'KTM', 'Aprilia',
        'Vespa', 'Piaggio', 'SYM', 'Kymco', 'TVS', 'Bajaj', 'Hero'
    ],
    ticari: [
        "Askam", "BMC", "DAF", "Fiat", "Ford", "Ford Trucks", "Habaş", "Iveco", "MAN",
        "MAZ", "Mercedes-Benz", "Mitsubishi", "Renault", "Renault Trucks", "Scania",
        "Tatra", "Volkswagen", "Volvo"
    ]
};

const TICARI_BRAND_ALLOWLIST: Record<string, string[]> = {
    otobus: ['Mercedes-Benz', 'MAN', 'Neoplan', 'Setra', 'Temsa', 'Otokar', 'BMC', 'Isuzu', 'Iveco', 'Volvo', 'Scania', 'Karsan'],
    'minibus-midibus': ['Mercedes-Benz', 'Ford', 'Fiat', 'Renault', 'Peugeot', 'Citroen', 'Opel', 'Volkswagen', 'Hyundai', 'Isuzu', 'Iveco', 'Toyota', 'Nissan', 'Mitsubishi', 'Karsan', 'Otokar', 'Temsa', 'BMC'],
    'kamyon-kamyonet': ['Mercedes-Benz', 'Ford', 'MAN', 'Volvo', 'Scania', 'Renault', 'Iveco', 'Isuzu', 'Toyota', 'Nissan', 'Mitsubishi', 'Hyundai', 'BMC', 'DAF', 'Ford Trucks'],
    cekici: ['Mercedes-Benz', 'MAN', 'Volvo', 'Scania', 'Renault', 'Iveco', 'BMC'],
    dorse: ['Mercedes-Benz', 'MAN', 'Volvo', 'Scania', 'Renault', 'Iveco'],
    romork: ['Mercedes-Benz', 'MAN', 'Volvo', 'Scania', 'Renault', 'Iveco'],
    'oto-kurtarici': ['Mercedes-Benz', 'Ford', 'MAN', 'Volvo', 'Scania', 'Renault', 'Iveco', 'Isuzu', 'BMC'],
    'karoser-ust-yapi': ['Mercedes-Benz', 'MAN', 'Volvo', 'Scania', 'Renault', 'Iveco'],
    'ticari-plaka': ['Mercedes-Benz', 'Ford', 'MAN', 'Volvo', 'Scania', 'Renault', 'Iveco', 'BMC']
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
    const commercialSubtype = getCommercialSubtype(categorySlug);

    if (commercialSubtype) {
        if (commercialSubtype === 'kamyon-kamyonet' || commercialSubtype === 'cekici') return 'vasita/kamyon-cekici';
        return 'ticari';
    }

    if (s.includes('kamyon-cekici')) return 'vasita/kamyon-cekici';
    if (s.includes('minivan') || s.includes('panelvan')) return 'minivan';
    if (s.includes('suv') || s.includes('arazi') || s.includes('pickup')) return 'suv';
    if (s.includes('ticari')) return 'ticari';
    if (s.includes('motosiklet')) return 'motosiklet';
    if (s.includes('karavan')) return 'karavan';
    if (s.includes('deniz')) return 'deniz';
    if (s.includes('hava')) return 'hava';
    if (s.includes('atv') || s.includes('utv')) return 'atv';
    if (s.includes('traktor') || s.includes('tarim')) return 'traktor';
    if (s.includes('otomobil')) return 'otomobil';
    if (s.includes('kiralik')) return 'kiralik';
    if (s.includes('hasarli')) return 'otomobil';
    if (s.includes('klasik')) return 'otomobil';
    if (s.includes('engelli')) return 'otomobil';

    return 'others';
}

export function getBrands(categorySlug: string): string[] {
    const canonical = resolveVehicleCategoryKey(categorySlug);
    const extra = extraBrandModels[categorySlug] || extraBrandModels[canonical];
    const extraSeries = (EXTRA_MODEL_SERIES as Record<string, Record<string, Record<string, string[]>>>)[categorySlug]
      || (EXTRA_MODEL_SERIES as Record<string, Record<string, Record<string, string[]>>>)[canonical];
    const hierarchyKey = getHierarchyKey(canonical);
    const commercialSubtype = getCommercialSubtype(categorySlug);
    const isCommercial = !!commercialSubtype || hierarchyKey === 'ticari' || hierarchyKey === 'vasita/kamyon-cekici';
    const excelBucket =
        canonical === 'vasita/arazi-suv-pickup' || canonical === 'vasita/minivan-panelvan'
            ? getExcelCategoryModels()[canonical]
            : null;

    let brands: string[] = [];
    
    if (extra) {
        brands = Object.keys(extra || {}).sort((a, b) => a.localeCompare(b, 'tr'));
    } else {
        brands = hierarchy[hierarchyKey] ? Object.keys(hierarchy[hierarchyKey]) : [];
    }
    
    if (brands.length === 0 && extraSeries) {
        brands = Object.keys(extraSeries).sort((a, b) => a.localeCompare(b, 'tr'));
    }
    if (excelBucket && excelBucket.size > 0) {
        const fromExcel = Array.from(excelBucket.values()).map((v) => v.display);
        brands = Array.from(new Set([...brands, ...fromExcel]));
    }

    const categoryBrands = TURKEY_CATEGORY_BRANDS[isCommercial ? 'ticari' : hierarchyKey];
    
    if (categoryBrands && categoryBrands.length > 0) {
        const categoryBrandSet = new Set(categoryBrands.map(b => normalizeBrandToken(b)));
        brands = brands.filter(brand => categoryBrandSet.has(normalizeBrandToken(brand)));
    }
    
    const sorted = brands.sort((a, b) => a.localeCompare(b, 'tr'));
    
    // Ticari araçlar için özel filtreleme
    if (isCommercial) {
        return filterBrandsByCommercialSubtype(categorySlug, sorted);
    }
    
    return sorted;
}

export function getModels(categorySlug: string, brands: string[]): string[] {
    const canonical = resolveVehicleCategoryKey(categorySlug);
    const extra = extraBrandModels[categorySlug] || extraBrandModels[canonical];
    const models = new Set<string>();
    const brandList = Array.isArray(brands) ? brands : [brands];
    const key = getHierarchyKey(canonical);
    if (!hierarchy[key]) return [];
    const exclusions = canonical === 'vasita/otomobil' ? getExcelModelExclusions() : null;
    const excelBucket =
        canonical === 'vasita/arazi-suv-pickup' || canonical === 'vasita/minivan-panelvan'
            ? getExcelCategoryModels()[canonical]
            : null;
    for (const brand of brandList) {
        const rawBrand = String(brand || "").trim();
        if (!rawBrand) continue;
        const perBrand = new Set<string>();
        if (extra) {
            const map = extra || {};
            const resolvedBrand = resolveBrandKey(map, rawBrand);
            const arr = map?.[resolvedBrand];
            if (Array.isArray(arr)) arr.forEach((m) => perBrand.add(m));
        }
        const bucket = hierarchy[key];
        const resolvedBrand = resolveBrandKey(bucket, rawBrand);
        if (bucket[resolvedBrand]) Object.keys(bucket[resolvedBrand]).forEach(m => perBrand.add(m));
        if (excelBucket) {
            const brandKey = normalizeBrandToken(rawBrand);
            const entry = excelBucket.get(brandKey);
            if (entry) entry.models.forEach((m) => perBrand.add(m));
        }
        if (exclusions) {
            const brandKey = normalizeBrandToken(rawBrand);
            const excluded = exclusions.get(brandKey);
            if (excluded && excluded.size > 0) {
                for (const m of Array.from(perBrand)) {
                    if (excluded.has(normalizeModelToken(m))) perBrand.delete(m);
                }
            }
        }
        for (const m of perBrand) models.add(m);
    }
    return Array.from(models).sort((a, b) => a.localeCompare(b, 'tr'));
}

export function getSeries(categorySlug: string, brands: string[], models: string[]): string[] {
    const canonical = resolveVehicleCategoryKey(categorySlug);
    const key = getHierarchyKey(canonical);
    const brandList = Array.isArray(brands) ? brands : [brands];
    const modelList = Array.isArray(models) ? models : [models];

    const series = new Set<string>();
    const extraSeries =
      (EXTRA_MODEL_SERIES as Record<string, Record<string, Record<string, string[]>>>)[categorySlug]
      || (EXTRA_MODEL_SERIES as Record<string, Record<string, Record<string, string[]>>>)[canonical];
    const autoBucket = (key === 'otomobil' || key === 'suv')
      ? (AUTOMOBILE_TRIM_EQUIPMENTS as Record<string, any>)
      : null;
    for (const brand of brandList) {
        const rawBrand = String(brand || "").trim();
        if (!rawBrand) continue;
        if (extraSeries) {
            const resolvedBrand = resolveBrandKey(extraSeries, rawBrand);
            const brandNode = extraSeries[resolvedBrand];
            if (brandNode) {
                for (const model of modelList) {
                    const rawModel = String(model || "").trim();
                    if (!rawModel) continue;
                    const resolvedModel = resolveKey(brandNode, rawModel, normalizeModelToken);
                    const modelNode = brandNode[resolvedModel];
                    if (Array.isArray(modelNode)) {
                        modelNode.forEach((s) => series.add(s));
                    }
                }
            }
        }
        if (autoBucket) {
            const resolvedBrand = resolveKey(autoBucket, rawBrand, normalizeBrandToken);
            const brandNode = autoBucket[resolvedBrand];
            if (brandNode) {
                for (const model of modelList) {
                    const rawModel = String(model || "").trim();
                    if (!rawModel) continue;
                    const resolvedModel = resolveKey(brandNode, rawModel, normalizeModelToken);
                    const modelNode = brandNode[resolvedModel];
                    if (modelNode && typeof modelNode === 'object') {
                        Object.keys(modelNode).forEach((s) => series.add(s));
                    }
                }
            }
        }
        if (!hierarchy[key]) continue;
        const bucket = hierarchy[key];
        const resolvedBrand = resolveBrandKey(bucket, rawBrand);
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
    
    const brandList = Array.isArray(brands) ? brands : [brands];
    const modelList = Array.isArray(models) ? models : [models];
    const seriesList = Array.isArray(series) ? series : [series];

    const trims = new Set<string>();
    if (key === 'otomobil' || key === 'suv') {
        const autoBucket = AUTOMOBILE_TRIM_EQUIPMENTS as Record<string, any>;
        for (const brand of brandList) {
            const rawBrand = String(brand || "").trim();
            if (!rawBrand) continue;
            const resolvedBrand = resolveKey(autoBucket, rawBrand, normalizeBrandToken);
            const brandNode = autoBucket[resolvedBrand];
            if (!brandNode) continue;
            for (const model of modelList) {
                const rawModel = String(model || "").trim();
                if (!rawModel) continue;
                const resolvedModel = resolveKey(brandNode, rawModel, normalizeModelToken);
                const modelNode = brandNode[resolvedModel];
                if (!modelNode) continue;
                for (const s of seriesList) {
                    const rawSeries = String(s || "").trim();
                    if (!rawSeries) continue;
                    const resolvedSeries = resolveKey(modelNode, rawSeries, normalizeModelToken);
                    const packages = modelNode[resolvedSeries];
                    if (Array.isArray(packages) && packages.length > 0) {
                        packages.forEach((p: string) => trims.add(p));
                    }
                }
            }
        }
    }

    if (key !== 'otomobil' || trims.size === 0) {
        if (!hierarchy[key]) return Array.from(trims).sort((a, b) => a.localeCompare(b, 'tr'));
        for (const brand of brandList) {
            const rawBrand = String(brand || "").trim();
            if (!rawBrand) continue;
            const bucket = hierarchy[key];
            const resolvedBrand = resolveBrandKey(bucket, rawBrand);
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
                    if (Array.isArray(packages) && packages.length > 0) {
                        packages.forEach(p => trims.add(p));
                    }
                }
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
