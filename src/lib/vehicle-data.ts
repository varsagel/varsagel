import generatedAutomobil from '@/data/generated-automobil.json';
import { EXTRA_BRAND_MODELS } from '@/data/extra-brands';
import { EXTRA_MODEL_SERIES, EXTRA_SERIES_TRIMS } from '@/data/extra-vehicle-details';

type BrandModelsMap = Record<string, Record<string, string[]>>;
type ModelSeriesMap = Record<string, Record<string, Record<string, string[]>>>;
type JsonPrimitive = string | number | boolean | null;
type Json = JsonPrimitive | Json[] | { [key: string]: Json };
type SeriesTrimsMap = Record<string, Json>;

const automobilData = generatedAutomobil as {
  modelSeries?: ModelSeriesMap;
  MODEL_SERIES?: ModelSeriesMap;
  seriesTrims?: SeriesTrimsMap;
  SERIES_TRIMS?: SeriesTrimsMap;
  seriesTrimsEx?: SeriesTrimsMap;
  SERIES_TRIMS_EX?: SeriesTrimsMap;
};

// 1. Start with generated Brand-Models
const generatedBrandModels: BrandModelsMap = {};
const modelSeriesData = automobilData.modelSeries || automobilData.MODEL_SERIES;

if (modelSeriesData) {
  for (const category in modelSeriesData) {
    generatedBrandModels[category] = {};
    for (const brand in modelSeriesData[category]) {
      generatedBrandModels[category][brand] = Object.keys(modelSeriesData[category][brand]);
    }
  }
}

// 2. Prepare Final Brand Models
const FINAL_BRAND_MODELS: BrandModelsMap = JSON.parse(JSON.stringify(generatedBrandModels));

// Helper to merge models into brand
const mergeModels = (category: string, brand: string, models: string[]) => {
  if (!FINAL_BRAND_MODELS[category]) FINAL_BRAND_MODELS[category] = {};
  if (!FINAL_BRAND_MODELS[category][brand]) FINAL_BRAND_MODELS[category][brand] = [];
  
  const existing = new Set(FINAL_BRAND_MODELS[category][brand]);
  models.forEach(m => existing.add(m));
  FINAL_BRAND_MODELS[category][brand] = Array.from(existing);
};

// Merge EXTRA_BRAND_MODELS
for (const category in EXTRA_BRAND_MODELS) {
  for (const brand in EXTRA_BRAND_MODELS[category]) {
    mergeModels(category, brand, EXTRA_BRAND_MODELS[category][brand]);
  }
}

// Merge EXTRA_MODEL_SERIES keys
for (const category in EXTRA_MODEL_SERIES) {
  for (const brand in EXTRA_MODEL_SERIES[category]) {
    mergeModels(category, brand, Object.keys(EXTRA_MODEL_SERIES[category][brand]));
  }
}

export const BRAND_MODELS: BrandModelsMap = FINAL_BRAND_MODELS;


// 3. Prepare Final Model Series
const baseModelSeries = automobilData.modelSeries || automobilData.MODEL_SERIES || {};
const FINAL_MODEL_SERIES: ModelSeriesMap = JSON.parse(JSON.stringify(baseModelSeries));

for (const category in EXTRA_MODEL_SERIES) {
  if (!FINAL_MODEL_SERIES[category]) FINAL_MODEL_SERIES[category] = {};
  for (const brand in EXTRA_MODEL_SERIES[category]) {
    if (!FINAL_MODEL_SERIES[category][brand]) FINAL_MODEL_SERIES[category][brand] = {};
    for (const model in EXTRA_MODEL_SERIES[category][brand]) {
      // Prefer EXTRA data as it's likely more "real" or updated
      FINAL_MODEL_SERIES[category][brand][model] = EXTRA_MODEL_SERIES[category][brand][model];
    }
  }
}

export const MODEL_SERIES: ModelSeriesMap = FINAL_MODEL_SERIES;


// 4. Prepare Final Series Trims
const baseSeriesTrims = automobilData.seriesTrims || automobilData.SERIES_TRIMS || {};
const FINAL_SERIES_TRIMS: SeriesTrimsMap = JSON.parse(JSON.stringify(baseSeriesTrims));

for (const category in EXTRA_SERIES_TRIMS) {
  if (!FINAL_SERIES_TRIMS[category]) FINAL_SERIES_TRIMS[category] = {};
  if (typeof FINAL_SERIES_TRIMS[category] === 'object' && !Array.isArray(FINAL_SERIES_TRIMS[category])) {
    for (const brand in EXTRA_SERIES_TRIMS[category]) {
      if (!FINAL_SERIES_TRIMS[category][brand]) FINAL_SERIES_TRIMS[category][brand] = {};
      if (typeof FINAL_SERIES_TRIMS[category][brand] === 'object' && !Array.isArray(FINAL_SERIES_TRIMS[category][brand])) {
        const brandData = FINAL_SERIES_TRIMS[category][brand] as Record<string, any>;
        
        for (const model in EXTRA_SERIES_TRIMS[category][brand]) {
           if (!brandData[model]) brandData[model] = {};
           const modelData = brandData[model];
           
           for (const series in EXTRA_SERIES_TRIMS[category][brand][model]) {
             modelData[series] = EXTRA_SERIES_TRIMS[category][brand][model][series];
           }
        }
      }
    }
  }
}

export const SERIES_TRIMS: SeriesTrimsMap = FINAL_SERIES_TRIMS;

export const SERIES_TRIMS_EX: SeriesTrimsMap =
  automobilData.seriesTrimsEx || automobilData.SERIES_TRIMS_EX || {};

export const MODEL_SERIES_EXTRA: ModelSeriesMap = EXTRA_MODEL_SERIES;
export const SERIES_TRIMS_EXTRA: SeriesTrimsMap = EXTRA_SERIES_TRIMS;

// 5. Accessor Functions with Sorting
export function getBrands(category: string): string[] {
  return Object.keys(BRAND_MODELS[category] || {}).sort((a, b) => a.localeCompare(b, 'tr'));
}

export function getModels(category: string, brand: string): string[] {
  return (BRAND_MODELS[category]?.[brand] || []).sort((a, b) => a.localeCompare(b, 'tr'));
}

export function getSeries(category: string, brand: string, model: string): string[] {
  const seriesObj = MODEL_SERIES[category]?.[brand]?.[model];
  if (Array.isArray(seriesObj)) return seriesObj.sort((a, b) => a.localeCompare(b, 'tr'));
  return [];
}

export function getTrims(category: string, brand: string, model: string, series: string): string[] {
  const categoryData = SERIES_TRIMS[category];
  if (categoryData && typeof categoryData === 'object' && !Array.isArray(categoryData)) {
    const brandData = (categoryData as any)[brand];
    if (brandData && typeof brandData === 'object' && !Array.isArray(brandData)) {
      const modelData = (brandData as any)[model];
      if (modelData && typeof modelData === 'object' && !Array.isArray(modelData)) {
        const trims = (modelData as any)[series];
        if (Array.isArray(trims)) {
          return trims.sort((a: string, b: string) => a.localeCompare(b, 'tr'));
        }
      }
    }
  }
  return [];
}
