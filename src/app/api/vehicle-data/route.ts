import { NextRequest, NextResponse } from 'next/server';
import { getBrands, getEquipments, getModels, getSeries, getTrims, getCategoryAttributes, resolveVehicleCategoryKey, getCommercialSubtype } from '@/lib/vehicle-data';
import { EXTRA_MODEL_SERIES, EXTRA_SERIES_TRIMS } from '@/data/extra-vehicle-details';

export const revalidate = 86400;

function cleanList(list: any): string[] {
  const bad = [/^$/, /\b(test|demo|deneme|örnek|sample|placeholder|fake|sahte|geçici)\b/i];
  const seen = new Set<string>();
  const res: string[] = [];
  const arr = Array.isArray(list) ? list : [];
  for (const v of arr) {
    const s = String(v || '').trim();
    if (!s) continue;
    let reject = false;
    for (const r of bad) {
      if (r.test(s)) { reject = true; break; }
    }
    if (reject) continue;
    if (!seen.has(s)) { seen.add(s); res.push(s); }
  }
  return res.sort((a, b) => a.localeCompare(b, 'tr'));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const category = searchParams.get('category');
  
  const brands = searchParams.getAll('brand');
  const models = searchParams.getAll('model');
  const series = searchParams.getAll('series');

  if (!category) {
    return NextResponse.json({ error: 'Category required' }, { status: 400 });
  }
  const effectiveCategory = resolveVehicleCategoryKey(category);
  const commercialSubtype = getCommercialSubtype(category);
  const noHierarchySubtype =
    commercialSubtype === 'dorse' ||
    commercialSubtype === 'romork' ||
    commercialSubtype === 'karoser-ust-yapi' ||
    commercialSubtype === 'ticari-plaka';

  try {
    if (type === 'brands') {
      const data = getBrands(category);
      return NextResponse.json(data);
    }

    if (type === 'attributes') {
      const data = getCategoryAttributes(effectiveCategory);
      return NextResponse.json(data);
    }
    
    if (type === 'models') {
      if (brands.length === 0) return NextResponse.json({ error: 'Brand required' }, { status: 400 });
      if (noHierarchySubtype) return NextResponse.json([]);
      const base = getModels(effectiveCategory, brands);
      const extraModels = new Set<string>();
      const extra = (EXTRA_MODEL_SERIES?.[effectiveCategory] || {}) as Record<string, Record<string, string[]>>;
      for (const b of brands) {
        const modelsForBrand = extra?.[b];
        if (!modelsForBrand) continue;
        Object.keys(modelsForBrand).forEach((m) => extraModels.add(m));
      }
      const merged = Array.from(new Set([...(Array.isArray(base) ? base : []), ...Array.from(extraModels)]));
      return NextResponse.json(cleanList(merged));
    }

    if (type === 'series') {
      if (brands.length === 0 || models.length === 0) return NextResponse.json({ error: 'Brand and Model required' }, { status: 400 });
      if (noHierarchySubtype) return NextResponse.json([]);
      const base = getSeries(effectiveCategory, brands, models);
      const extraSeries = new Set<string>();
      const extra = (EXTRA_MODEL_SERIES?.[effectiveCategory] || {}) as Record<string, Record<string, string[]>>;
      for (const b of brands) {
        const modelsForBrand = extra?.[b] || {};
        for (const m of models) {
          const seriesArr = modelsForBrand?.[m];
          if (!Array.isArray(seriesArr)) continue;
          seriesArr.forEach((s) => extraSeries.add(s));
        }
      }
      const merged = Array.from(new Set([...(Array.isArray(base) ? base : []), ...Array.from(extraSeries)]));
      return NextResponse.json(cleanList(merged));
    }

    if (type === 'trims') {
      if (brands.length === 0 || models.length === 0 || series.length === 0) return NextResponse.json({ error: 'Brand, Model and Series required' }, { status: 400 });
      if (noHierarchySubtype) return NextResponse.json([]);
      const base = getTrims(effectiveCategory, brands, models, series);
      const extraTrims = new Set<string>();
      const extra = (EXTRA_SERIES_TRIMS?.[effectiveCategory] || {}) as Record<string, Record<string, Record<string, Record<string, string[]>>>>;
      for (const b of brands) {
        const modelsForBrand = extra?.[b] || {};
        for (const m of models) {
          const seriesMap = modelsForBrand?.[m] || {};
          for (const s of series) {
            const trimsArr = seriesMap?.[s];
            if (!Array.isArray(trimsArr)) continue;
            trimsArr.forEach((t) => extraTrims.add(t));
          }
        }
      }
      const merged = Array.from(new Set([...(Array.isArray(base) ? base : []), ...Array.from(extraTrims)]));
      return NextResponse.json(cleanList(merged));
    }

    if (type === 'equipments') {
      const brand = searchParams.get('brand');
      const model = searchParams.get('model');
      const s = searchParams.get('series');
      const t = searchParams.get('trim') || searchParams.get('paket');

      if (!brand || !model || !s || !t) {
        return NextResponse.json({ error: 'Brand, Model, Series and Trim required' }, { status: 400 });
      }
      if (noHierarchySubtype) return NextResponse.json([]);
      const data = getEquipments(effectiveCategory, brand, model, s, t);
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Vehicle data error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
