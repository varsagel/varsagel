"use client";

import { useEffect, useMemo, useState, useCallback, memo, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Category, SubCategory, CATEGORIES as STATIC_CATEGORIES } from "@/data/categories";
import { TURKEY_PROVINCES, getProvinceByName, getDistrictsByProvince } from "@/data/turkey-locations";
import { toast } from "@/components/ui/use-toast";
import { AttrField } from '@/data/attribute-schemas';
import BRAND_LOGOS from '@/data/brand-logos.json';
import { titleCaseTR } from "@/lib/title-case-tr";
import { getSubcategoryImage } from "@/data/subcategory-images";
import { 
  List, 
  FileText, 
  MapPin, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft, 
  AlertCircle, 
  Info, 
  TrendingUp, 
  Search,
  Check,
  X
} from "lucide-react";

const stableAttrFieldId = (f: AttrField) => {
  if (f.type === 'range-number' && f.minKey && f.maxKey) {
    const minBase = f.minKey.endsWith('Min') ? f.minKey.slice(0, -3) : null;
    const maxBase = f.maxKey.endsWith('Max') ? f.maxKey.slice(0, -3) : null;
    if (minBase && maxBase && minBase === maxBase) return `r:${minBase}`;
    return `r:${f.minKey}:${f.maxKey}`;
  }
  if (f.key) return `k:${f.key}`;
  return `l:${f.label}`;
};

const stripReservedAttrFields = (fields: AttrField[]) =>
  fields.filter((f) => {
    if (f.key === 'minPrice' || f.key === 'maxPrice') return false;
    if (f.key === 'minBudget' || f.key === 'budget') return false;

    if (f.type !== 'range-number') return true;

    if (f.minKey === 'minPrice' && f.maxKey === 'maxPrice') return false;
    if (f.minKey === 'minBudget' && f.maxKey === 'budget') return false;

    const minBase = f.minKey?.endsWith('Min') ? f.minKey.slice(0, -3) : null;
    const maxBase = f.maxKey?.endsWith('Max') ? f.maxKey.slice(0, -3) : null;
    const base = minBase && maxBase && minBase === maxBase ? minBase : null;
    if (base === 'minPrice' || base === 'minBudget') return false;

    return true;
  });

const normalizeSubcategoryCompare = (s: any) =>
  String(s || '')
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .replace(/\/+/g, '/');

const subcategoryMatches = (attrSlugRaw: any, selectedRaw: any) => {
  const attrSlug = normalizeSubcategoryCompare(attrSlugRaw);
  const selected = normalizeSubcategoryCompare(selectedRaw);
  if (!attrSlug || !selected) return false;
  if (attrSlug === selected) return true;

  const attrDash = attrSlug.split('/').filter(Boolean).join('-');
  const selectedDash = selected.split('/').filter(Boolean).join('-');
  if (attrDash && selectedDash && attrDash === selectedDash) return true;

  if (attrSlug.endsWith(`-${selected}`) || selected.endsWith(`-${attrSlug}`)) return true;
  if (attrDash.endsWith(`-${selectedDash}`) || selectedDash.endsWith(`-${attrDash}`)) return true;

  return false;
};

const findSubcategoryBySlug = (items: SubCategory[], slug: string): SubCategory | undefined => {
  for (const item of items) {
    if (item.slug === slug || item.fullSlug === slug) return item;
    if (item.subcategories) {
      const found = findSubcategoryBySlug(item.subcategories, slug);
      if (found) return found;
    }
  }
  return undefined;
};

const attributesToFields = (category: string, subcategory: string, attrs: any[], subcategoryId?: string): AttrField[] => {
  const list = Array.isArray(attrs) ? attrs : [];
  if (!category || list.length === 0) return [];

  const source = list
    .filter((a) => {
      if (!a) return false;
      if (a.showInRequest === false) return false;
      if (!a.subCategoryId) return true;
      if (!subcategory) return false;
      if (subcategoryId && String(a.subCategoryId) === String(subcategoryId)) return true;
      const attrSlug = a?.subCategory?.slug;
      if (!attrSlug) return false;
      return subcategoryMatches(attrSlug, subcategory);
    })
    .sort((a, b) => {
      const aSpecific = a?.subCategoryId ? 1 : 0;
      const bSpecific = b?.subCategoryId ? 1 : 0;
      return aSpecific - bSpecific;
    });

  const mapped = source
    .map((a) => {
      const slug = String(a.slug || '').trim();
      const normalizedType = a.type === 'checkbox' ? 'boolean' : a.type;
      const isVehicleHierarchy = slug && ['marka', 'model', 'seri', 'paket'].includes(slug);
      const type = isVehicleHierarchy ? 'multiselect' : normalizedType;

      let options: string[] | undefined = undefined;
      try {
        const parsed = a.optionsJson ? JSON.parse(a.optionsJson) : null;
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.filter((x) => x != null).map(String);
          if (cleaned.length > 0) options = cleaned;
        }
      } catch {}

      const isM2 = slug === 'm2' || slug === 'metrekare' || a.name === 'Metrekare' || a.name === 'm2';
      const required = isM2 ? false : !!a.required;

      const minKey = a.minKey || (type === 'range-number' ? `${slug || a.id}Min` : undefined);
      const maxKey = a.maxKey || (type === 'range-number' ? `${slug || a.id}Max` : undefined);

      return {
        key: type === 'range-number' ? undefined : slug,
        label: a.name || slug || 'Alan',
        type,
        required,
        options,
        minKey,
        maxKey,
        min: a.min,
        max: a.max,
        minLabel: a.minLabel,
        maxLabel: a.maxLabel,
      } as AttrField;
    })
    .filter(Boolean) as AttrField[];

  const uniq = new Map<string, AttrField>();
  mapped.forEach((f) => uniq.set(stableAttrFieldId(f), f));
  const filtered = stripReservedAttrFields(Array.from(uniq.values()));

  if (category === 'vasita') {
    const priorityKeys = ["marka", "model", "motor", "seri", "donanim", "paket"];
    const rank = (f: AttrField) => {
      if (f.key) {
        const i = priorityKeys.indexOf(f.key);
        if (i !== -1) return i;
      }
      if (f.type === "range-number" && f.minKey && f.minKey.endsWith("Min")) {
        const base = f.minKey.slice(0, -3);
        if (base === "yil") return 10;
        if (base === "km") return 11;
      }
      return 100;
    };
    return filtered
      .map((f, idx) => ({ f, idx }))
      .sort((a, b) => {
        const ra = rank(a.f);
        const rb = rank(b.f);
        if (ra !== rb) return ra - rb;
        return a.idx - b.idx;
      })
      .map((x) => x.f);
  }

  return filtered;
};

const MultiSelect = memo(function MultiSelect({ options, value, onChange, error }: { options: string[], value: string[], onChange: (val: string[]) => void, error: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = Array.isArray(value) ? value : [];
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (opt: string) => {
    const safeSelected = selected || [];
    const newSelected = safeSelected.includes(opt)
      ? safeSelected.filter(s => s !== opt)
      : [...safeSelected, opt];
    onChange(newSelected);
  };

  return (
    <div className="relative" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 border rounded-lg bg-white flex items-center justify-between cursor-pointer transition-all ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-cyan-500'} ${isOpen ? 'ring-2 ring-cyan-500 border-transparent' : ''}`}
      >
        <span className={`block truncate ${(selected || []).length ? 'text-gray-900' : 'text-gray-400'}`}>
          {(selected || []).length > 0 ? `${(selected || []).length} seçim` : 'Seçiniz'}
        </span>
        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? '-rotate-90' : 'rotate-90'}`} />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          {(options || []).map(opt => (
            <div 
              key={opt}
              onClick={() => toggleOption(opt)}
              className="flex items-center px-4 py-2.5 hover:bg-cyan-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
            >
              <div className={`w-5 h-5 border rounded flex items-center justify-center transition-all ${(selected || []).includes(opt) ? 'bg-cyan-600 border-cyan-600' : 'border-gray-300 bg-white'}`}>
                {(selected || []).includes(opt) && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className={`ml-3 text-sm ${(selected || []).includes(opt) ? 'text-cyan-900 font-medium' : 'text-gray-700'}`}>{opt}</span>
            </div>
          ))}
        </div>
      )}
      
      {(selected || []).length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2.5">
          {(selected || []).map(s => (
            <span key={s} className="inline-flex items-center px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-medium border border-cyan-100">
              {s}
              <button type="button" onClick={(e) => { e.stopPropagation(); toggleOption(s); }} className="ml-1.5 hover:text-cyan-900 p-0.5 hover:bg-cyan-100 rounded-full transition-colors"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
});

// Adım tanımları
type Step = {
  id: number;
  title: string;
  description: string;
  icon: any;
};

const STEPS: Step[] = [
  { id: 1, title: "Kategori", description: "Kategori Seçimi", icon: List },
  { id: 2, title: "Detaylar", description: "Talep Detayları", icon: FileText },
  { id: 3, title: "Konum & Bütçe", description: "Konum ve Bütçe Aralığı", icon: MapPin },
  { id: 4, title: "Onay", description: "Önizleme", icon: CheckCircle },
];

// Form verileri
type FormData = {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  subcategoryFullSlug?: string;
  city: string;
  district: string;
  neighborhood: string;
  minBudget: string;
  budget: string;
  images: string[];
  attributes: Record<string, any>;
  manualAttributeKeys: string[];
};

// CategoryAttributes definitions
type AttrFieldLocal = AttrField;

const CategoryAttributes = memo(function CategoryAttributes({ 
  category, 
  subcategory, 
  fields,
  attributes, 
  errors, 
  onChange, 
  onManualChange,
  manualModes
}: { 
  category: string; 
  subcategory: string; 
  fields: AttrFieldLocal[];
  attributes: Record<string, any>; 
  errors: Record<string, string>; 
  onChange: (key: string, val: any) => void; 
  onManualChange: (key: string, isManual: boolean) => void;
  manualModes: Record<string, boolean>;
}) {
  const [brandOptions, setBrandOptions] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [series, setSeries] = useState<string[]>([]);
  const [trims, setTrims] = useState<string[]>([]);

  // Helper to ensure array
  const getArray = (val: any): string[] => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val.trim() !== '') return [val];
    return [];
  };

  const markaAttribute = attributes['marka'];
  const modelAttribute = attributes['model'];
  const seriAttribute = attributes['seri'];

  const brands = useMemo(() => getArray(markaAttribute), [markaAttribute]);
  const modelVals = useMemo(() => getArray(modelAttribute), [modelAttribute]);
  const seriesVals = useMemo(() => getArray(seriAttribute), [seriAttribute]);
  
  const overrideKeyLocal = `${category}/${subcategory || ''}`;

  useEffect(() => {
    if (!['vasita', 'alisveris'].includes(category)) {
      setBrandOptions([]);
      return;
    }
    fetch(`/api/vehicle-data?type=brands&category=${overrideKeyLocal}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBrandOptions(data);
        else setBrandOptions([]);
      })
      .catch(() => setBrandOptions([]));
  }, [category, overrideKeyLocal]);

  useEffect(() => {
    if (brands.length === 0 || !['vasita', 'alisveris'].includes(category)) {
      setModels([]);
      return;
    }
    
    const params = new URLSearchParams();
    params.append('type', 'models');
    params.append('category', overrideKeyLocal);
    brands.forEach(b => params.append('brand', b));

    fetch(`/api/vehicle-data?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
         const arr = Array.isArray(data) ? data : [];
         setModels(Array.from(new Set(arr)).sort((a,b)=> a.localeCompare(b,'tr')));
      })
      .catch(() => setModels([]));
  }, [brands, category, overrideKeyLocal]);

  useEffect(() => {
    if (brands.length === 0 || modelVals.length === 0) {
      setSeries([]);
      return;
    }

    const params = new URLSearchParams();
    params.append('type', 'series');
    params.append('category', overrideKeyLocal);
    brands.forEach(b => params.append('brand', b));
    modelVals.forEach(m => params.append('model', m));

    fetch(`/api/vehicle-data?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        const sorted = Array.from(new Set(arr)).sort((a,b)=> a.localeCompare(b,'tr'));
        setSeries(sorted);
      })
      .catch(() => setSeries([]));
  }, [brands, modelVals, overrideKeyLocal]);

  useEffect(() => {
    if (brands.length === 0 || modelVals.length === 0 || seriesVals.length === 0) {
      setTrims([]);
      return;
    }

    const params = new URLSearchParams();
    params.append('type', 'trims');
    params.append('category', overrideKeyLocal);
    brands.forEach(b => params.append('brand', b));
    modelVals.forEach(m => params.append('model', m));
    seriesVals.forEach(s => params.append('series', s));

    fetch(`/api/vehicle-data?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
         const arr = Array.isArray(data) ? data : [];
         setTrims(Array.from(new Set(arr)).sort((a,b)=> a.localeCompare(b,'tr')));
      })
      .catch(() => setTrims([]));
  }, [brands, modelVals, seriesVals, overrideKeyLocal]);
  
  if (!fields?.length) {
    return null;
  }
  return (
    <div className="space-y-6 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <List className="w-5 h-5 text-cyan-600" />
          <h3 className="text-lg font-semibold text-gray-900">Aradığınız Ürünün Özellikleri</h3>
        </div>
        <span className="text-xs text-gray-500 font-medium">
          <span className="text-red-500">*</span> Zorunlu alanlar
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {fields?.map((f)=> {
          if (!f) return null;
          const id = f.key ? `k:${f.key}` : (f.minKey && f.maxKey) ? `r:${f.minKey}:${f.maxKey}` : `l:${f.label}`;
          const isManual = f.key ? manualModes[f.key] : false;
          const hasError = !!(
            (f.key && errors[f.key]) ||
            (f.type === 'range-number' && ((f.minKey && errors[f.minKey]) || (f.maxKey && errors[f.maxKey])))
          );

          return (
          <div key={id} className={f.type === 'range-number' ? 'md:col-span-2' : ''}>
            <div className={`rounded-xl border-2 p-4 transition-colors ${hasError ? 'border-red-200 bg-red-50/40' : 'border-gray-200 bg-gray-50/40 hover:border-cyan-200'}`}>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                {titleCaseTR(f.label)} {f.required && <span className="text-red-500">*</span>}
              </label>
            {f.type === 'select' ? (
              <>
              {isManual ? (
                <input
                  type="text"
                  value={attributes[f.key!] ?? ''}
                  onChange={(e)=>onChange(f.key!, e.target.value)}
                  placeholder={`${titleCaseTR(f.label)} Giriniz`}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${errors[f.key!] ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'}`}
                />
              ) : (
                <div className="relative">
                  <select
                    value={attributes[f.key!] ?? ''}
                    onChange={(e)=>onChange(f.key!, e.target.value)}
                    disabled={
                      (f.key === 'model' && getArray(attributes['marka']).length === 0)
                      || (f.key === 'seri' && (getArray(attributes['marka']).length === 0 || getArray(attributes['model']).length === 0))
                      || (f.key === 'paket' && getArray(attributes['seri']).length === 0)
                    }
                    className={`w-full px-4 py-2.5 border rounded-lg appearance-none bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${errors[f.key!] ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'} disabled:bg-gray-50 disabled:text-gray-400`}
                  >
                    <option value="">Seçiniz</option>
                    {(() => {
                      let opts = f.options ? [...f.options] : [];
                      
                      if (f.key === 'marka') {
                         if (brandOptions.length > 0) opts = brandOptions;
                         opts.sort((a, b) => {
                             if (a === 'Farketmez') return 1;
                             if (b === 'Farketmez') return -1;
                             return a.localeCompare(b, 'tr');
                         });
                      }

                      if (f.key === 'model' && brands.length > 0) {
                        opts = models;
                      } else if (f.key === 'seri') {
                        opts = series;
                      } else if (f.key === 'paket') {
                        if (trims.length > 0) {
                          opts = trims;
                        }
                      }
                      return opts.map((o) => (
                        <option key={o} value={o}>{titleCaseTR(o)}</option>
                      ));
                    })()}
                  </select>
                  <ChevronRight className="absolute right-3 top-3 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  if (f.key) {
                     onManualChange(f.key, !isManual);
                     if (!isManual) {
                        onChange(f.key, '');
                     }
                  }
                }}
                className="text-xs text-cyan-600 mt-1.5 hover:text-cyan-700 hover:underline focus:outline-none flex items-center gap-1"
              >
                {isManual ? <List className="w-3 h-3"/> : <Search className="w-3 h-3"/>}
                {isManual ? 'Listeden seç' : 'Listede yok mu? Elle gir'}
              </button>
              </>
            ) : f.type === 'multiselect' ? (
                <>
                  <MultiSelect
                    options={(() => {
                        let opts = f.options ? [...f.options] : [];
                        if (f.key === 'marka') {
                            if (brandOptions.length > 0) opts = brandOptions;
                            opts.sort((a, b) => a.localeCompare(b, 'tr'));
                        }
                        if (f.key === 'model' && brands.length > 0) opts = models;
                        else if (f.key === 'seri') opts = series;
                        else if (f.key === 'paket' && trims.length > 0) opts = trims;
                        return opts;
                    })()}
                    value={attributes[f.key!] || []}
                    onChange={(val: any) => onChange(f.key!, val)}
                    error={!!errors[f.key!]}
                  />
                </>
            ) : f.type === 'range-number' ? (
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min={f.min !== undefined ? f.min : "0"}
                  max={f.max}
                  placeholder={
                    String(f.minLabel || '').trim().toLowerCase() === 'min'
                      ? 'En düşük'
                      : (f.minLabel || 'En düşük')
                  }
                  value={attributes[f.minKey!] ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || Number(val) >= 0) {
                      onChange(f.minKey!, val);
                    }
                  }}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${errors[f.minKey!] ? 'border-red-500' : 'border-gray-300'}`}
                />
                <input
                  type="number"
                  min={f.min !== undefined ? f.min : "0"}
                  max={f.max}
                  placeholder={
                    String(f.maxLabel || '').trim().toLowerCase() === 'max'
                      ? 'En yüksek'
                      : (f.maxLabel || 'En yüksek')
                  }
                  value={attributes[f.maxKey!] ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || Number(val) >= 0) {
                      onChange(f.maxKey!, val);
                    }
                  }}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${errors[f.maxKey!] ? 'border-red-500' : 'border-gray-300'}`}
                />
              </div>
            ) : f.type === 'number' ? (
              <input
                type="number"
                min={f.min !== undefined ? f.min : "0"}
                max={f.max}
                value={attributes[f.key!] ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || Number(val) >= 0) {
                    onChange(f.key!, val);
                  }
                }}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${errors[f.key!] ? 'border-red-500' : 'border-gray-300'}`}
              />
            ) : f.type === 'boolean' ? (
              <label className="flex items-center h-full cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={!!attributes[f.key!]}
                    onChange={(e)=>onChange(f.key!, e.target.checked)}
                    className="w-5 h-5 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                  />
                </div>
                <span className="ml-3 text-gray-700 font-medium select-none">{titleCaseTR(f.label)}</span>
              </label>
            ) : (
              <input
                type="text"
                value={attributes[f.key!] ?? ''}
                onChange={(e)=>onChange(f.key!, e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${errors[f.key!] ? 'border-red-500' : 'border-gray-300'}`}
              />
            )}
            {(errors[f.key!] || errors[f.minKey!] || errors[f.maxKey!]) && (
               <div className="flex items-center gap-1 mt-1.5 text-red-600 text-xs font-bold">
                 <AlertCircle className="w-3 h-3" />
                 <span>{errors[f.key!] || errors[f.minKey!] || errors[f.maxKey!]}</span>
               </div>
            )}
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
});

// Memoized component'ler
const StepIndicator = memo(function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
  <div className="mb-10 px-4">
    <div className="flex items-center justify-between relative z-0">
      {/* Connecting Line */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-gray-100 -z-10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-700 ease-out"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />
      </div>
      
      {STEPS.map((step) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        const Icon = step.icon;
        
        return (
        <div key={step.id} className="flex flex-col items-center bg-transparent">
          <div 
            className={`
              relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500
              ${isActive 
                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/30 scale-110 rotate-3 ring-4 ring-white' 
                : isCompleted 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 ring-4 ring-white' 
                  : 'bg-white text-gray-300 border-2 border-gray-100 shadow-sm'
              }
            `}
          >
            {isCompleted ? (
              <Check className="w-7 h-7 animate-in zoom-in duration-300" />
            ) : (
              <Icon className={`w-6 h-6 ${isActive ? 'animate-pulse' : ''}`} />
            )}
            
            {/* Active Step Glow Effect */}
            {isActive && (
              <div className="absolute inset-0 bg-cyan-400 rounded-2xl blur-xl opacity-40 -z-10" />
            )}
          </div>
          
          <div className={`mt-4 text-center hidden sm:block transition-all duration-300 ${isActive ? 'transform translate-y-0 opacity-100' : 'opacity-70'}`}>
            <p className={`text-sm font-bold tracking-tight ${isActive ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-blue-700' : isCompleted ? 'text-emerald-600' : 'text-gray-400'}`}>
              {step.title}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mt-1 font-semibold">{step.description}</p>
          </div>
        </div>
      )})}
    </div>
  </div>
  );
});

const CategorySelection = memo(function CategorySelection({ formData, errors, updateFormData, subcats, categories, nextStep }: { formData: FormData; errors: Record<string, string>; updateFormData: (field: keyof FormData, value: any) => void; subcats: SubCategory[]; categories: Category[]; nextStep: (override?: Partial<FormData>) => void }) {
  const subcategorySectionRef = useRef<HTMLDivElement | null>(null);
  const lastCategoryRef = useRef(formData.category);
  const [history, setHistory] = useState<SubCategory[]>([]);

  useEffect(() => {
    const prev = lastCategoryRef.current;
    if (prev === formData.category) return;
    lastCategoryRef.current = formData.category;
    setHistory([]);

    if (typeof window === "undefined") return;
    const isMobile = window.matchMedia("(max-width: 1023px)").matches;
    if (!isMobile) return;
    if (!subcats?.length) return;

    requestAnimationFrame(() => {
      subcategorySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [formData.category, subcats]);

  const currentLevelSubcats = useMemo(() => {
    if (history.length > 0) {
      return history[history.length - 1].subcategories || [];
    }
    return subcats;
  }, [history, subcats]);

  const handleSubcategoryClick = (sub: SubCategory) => {
    if (sub.subcategories && sub.subcategories.length > 0) {
      setHistory(prev => [...prev, sub]);
    } else {
      const selected = sub.fullSlug || sub.slug;
      updateFormData('subcategory', selected);
      if (sub.fullSlug) updateFormData('subcategoryFullSlug', sub.fullSlug);
      nextStep({ subcategory: selected, subcategoryFullSlug: sub.fullSlug });
    }
  };

  const handleSubcategorySelect = (sub: SubCategory) => {
    const selected = sub.fullSlug || sub.slug;
    updateFormData('subcategory', selected);
    if (sub.fullSlug) updateFormData('subcategoryFullSlug', sub.fullSlug);
    nextStep({ subcategory: selected, subcategoryFullSlug: sub.fullSlug });
  };

  const handleBack = () => {
    if (history.length > 0) {
      setHistory(prev => prev.slice(0, -1));
    } else {
       updateFormData('category', '');
       updateFormData('subcategory', '');
       setHistory([]);
    }
  };

  const currentCategoryName = useMemo(() => {
    const raw = categories?.find((c: any) => c.slug === formData.category)?.name || 'Kategori';
    return titleCaseTR(raw);
  }, [categories, formData.category]);

  return (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {(formData.category || history.length > 0) && (
            <button onClick={handleBack} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors group" title="Geri Dön">
              <ChevronLeft className="w-5 h-5 text-gray-500 group-hover:text-cyan-600" />
            </button>
          )}
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
            <div className="p-1.5 bg-cyan-100 rounded-lg text-cyan-700">
              <List className="w-5 h-5" />
            </div>
            {history.length > 0 ? 'Alt Kategori Seçimi' : 'Ana Kategori Seçimi'}
          </h3>
        </div>
        {errors.category && <span className="text-red-500 text-sm font-medium flex items-center gap-1 bg-red-50 px-3 py-1 rounded-full"><AlertCircle className="w-3 h-3"/>{errors.category}</span>}
      </div>

      {/* Breadcrumb Navigation */}
         <div className="flex flex-wrap items-center gap-2 mb-5 text-sm bg-gray-50 p-2.5 rounded-lg border border-gray-100">
         <div className="flex items-center gap-1">
            <span className={`font-medium ${history.length === 0 ? 'text-cyan-700' : 'text-gray-600'}`}>
              {currentCategoryName}
            </span>
         </div>
         {history.map((item, index) => (
           <div key={`${item.fullSlug || item.slug}:${index}`} className="flex items-center gap-1 animate-in fade-in slide-in-from-left-2">
             <ChevronRight className="w-4 h-4 text-gray-400" />
             <button 
               onClick={() => setHistory(prev => prev.slice(0, index + 1))}
               className={`hover:text-cyan-600 transition-colors ${index === history.length - 1 ? 'text-cyan-700 font-bold' : 'text-gray-600 font-medium'}`}
             >
               {titleCaseTR(item.name)}
             </button>
           </div>
         ))}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories?.map((cat: any) => (
          <div
            key={cat.slug}
            onClick={() => updateFormData('category', cat.slug)}
            className={`
              group relative p-3 rounded-xl border cursor-pointer transition-all duration-300
              hover:shadow-md hover:-translate-y-0.5
              ${formData.category === cat.slug 
                ? 'border-cyan-500 bg-cyan-50/50 shadow-sm ring-1 ring-cyan-500/20' 
                : 'border-gray-200 bg-white hover:border-cyan-200 hover:bg-cyan-50/30'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 shadow-sm
                ${formData.category === cat.slug 
                  ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-cyan-500/30' 
                  : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-cyan-600 group-hover:shadow-md'}
              `}>
                <List className="w-5 h-5" />
              </div>
              <div>
                <h4 className={`text-[15px] font-bold leading-tight transition-colors ${formData.category === cat.slug ? 'text-cyan-900' : 'text-gray-900'}`}>{titleCaseTR(cat.name)}</h4>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">{cat.subcategories?.length || 0} Alt Kategori</p>
              </div>
              {formData.category === cat.slug && (
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 animate-in zoom-in duration-300">
                  <div className="w-7 h-7 bg-cyan-600 rounded-full flex items-center justify-center text-white shadow-md shadow-cyan-600/30">
                    <Check className="w-4 h-4" />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>

    {subcats?.length > 0 && (
      <div ref={subcategorySectionRef} className="animate-in fade-in slide-in-from-bottom-2 duration-300 pt-4 border-t border-gray-100/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
            <div className="p-1.5 bg-cyan-100 rounded-lg text-cyan-700">
              <ChevronRight className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
                <button onClick={handleBack} className="hover:bg-gray-100 p-1 rounded-full transition-colors group" title="Geri Dön">
                    <ChevronLeft className="w-5 h-5 text-gray-500 group-hover:text-cyan-600" />
                </button>
                <span>{history.length > 0 ? titleCaseTR(history[history.length - 1].name) : 'Alt Kategori Seçimi'}</span>
            </div>
          </h3>
          {errors.subcategory && <span className="text-red-500 text-sm font-medium flex items-center gap-1 bg-red-50 px-3 py-1 rounded-full"><AlertCircle className="w-3 h-3"/>{errors.subcategory}</span>}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {currentLevelSubcats?.map((sub: any) => (
            <div key={sub.fullSlug || sub.slug} className="relative">
              <button
                type="button"
                onClick={() => handleSubcategoryClick(sub)}
                className={`
                  w-full relative px-3.5 py-2.5 rounded-lg text-[13px] font-semibold transition-all text-left
                  flex items-center justify-between group
                  ${formData.subcategory === (sub.fullSlug || sub.slug)
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-600 ring-offset-2 transform -translate-y-0.5'
                    : 'bg-white text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 border border-gray-200 hover:border-cyan-200 hover:shadow-sm'
                  }
                `}
              >
                <span className="pr-10 leading-snug">{titleCaseTR(sub.name)}</span>
                {sub.subcategories && sub.subcategories.length > 0 ? (
                  <ChevronRight className={`w-4 h-4 ${formData.subcategory === (sub.fullSlug || sub.slug) ? 'text-white' : 'text-gray-400 group-hover:text-cyan-600'}`} />
                ) : (
                  formData.subcategory === (sub.fullSlug || sub.slug) && <Check className="w-4 h-4 text-white animate-in zoom-in" />
                )}
              </button>

              {sub.subcategories && sub.subcategories.length > 0 && sub.fullSlug && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleSubcategorySelect(sub); }}
                  className={`
                    absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md text-[11px] font-bold transition-colors
                    ${formData.subcategory === (sub.fullSlug || sub.slug)
                      ? 'bg-white/15 text-white hover:bg-white/25'
                      : 'bg-white text-cyan-700 border border-cyan-200 hover:bg-cyan-50'
                    }
                  `}
                >
                  Seç
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
  );
});

const DetailsStep = memo(function DetailsStep({ formData, errors, updateFormData, categories }: { formData: FormData; errors: Record<string, string>; updateFormData: (field: keyof FormData, value: any) => void; categories: Category[] }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Helper to find subcategory name recursively
  const findSubcategoryName = (items: SubCategory[], slug: string): string | undefined => {
    for (const item of items) {
      if (item.slug === slug || item.fullSlug === slug) return item.name;
      if (item.subcategories) {
        const found = findSubcategoryName(item.subcategories, slug);
        if (found) return found;
      }
    }
    return undefined;
  };

  const selectedCategory = categories.find(c => c.slug === formData.category);
  const subcategoryName = selectedCategory && formData.subcategory 
    ? findSubcategoryName(selectedCategory.subcategories || [], formData.subcategory)
    : undefined;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-lg shadow-gray-200/40">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-50 rounded-xl">
              <FileText className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Temel Bilgiler</h3>
              <p className="text-xs text-gray-500 font-medium">İhtiyacınızı detaylandırın</p>
            </div>
          </div>
          
          {selectedCategory && (
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
              <span className="text-gray-600">{selectedCategory.name}</span>
              {subcategoryName && (
                <>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span className="text-cyan-700">{subcategoryName}</span>
                </>
              )}
            </div>
          )}
        </div>
        
        {selectedCategory && (
          <div className="sm:hidden mb-4 flex items-center gap-2 text-xs font-medium bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
             <span className="text-gray-600">{selectedCategory.name}</span>
             {subcategoryName && (
               <>
                 <ChevronRight className="w-3 h-3 text-gray-400" />
                 <span className="text-cyan-700">{subcategoryName}</span>
               </>
             )}
          </div>
        )}
      
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
            Ne arıyorsunuz? <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateFormData('title', e.target.value)}
              placeholder="Örn: Temiz iPhone 13 arıyorum, Boyasız 2020 Honda Civic..."
              className={`
                w-full pl-4 pr-4 py-3 text-base border rounded-xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300
                placeholder:text-gray-400
                ${errors.title 
                  ? 'border-red-300 bg-red-50/50 focus:ring-red-200' 
                  : 'border-gray-200 bg-gray-50/30 hover:bg-white hover:border-gray-300 hover:shadow-sm focus:bg-white focus:shadow-md'
                }
              `}
            />
          </div>
          <div className="flex justify-between mt-2 px-1">
            {errors.title ? (
              <span className="text-red-600 text-xs font-bold flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5"/>{errors.title}</span>
            ) : (
              <span className="text-gray-400 text-xs font-medium">En az 10 karakter</span>
            )}
            <span className={`text-xs font-bold ${(formData.title?.length || 0) >= 10 ? 'text-emerald-600' : 'text-gray-400'}`}>{formData.title?.length || 0}/50</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
            Aradığınız Ürünü Anlatın <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateFormData('description', e.target.value)}
            rows={5}
            placeholder="Aradığınız ürünün durumunu, rengini, varsa kusurlarını kabul edip etmeyeceğinizi belirtin..."
            className={`
              w-full p-4 text-sm border rounded-xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 resize-none
              placeholder:text-gray-400
              ${errors.description 
                ? 'border-red-300 bg-red-50/50 focus:ring-red-200' 
                : 'border-gray-200 bg-gray-50/30 hover:bg-white hover:border-gray-300 hover:shadow-sm focus:bg-white focus:shadow-md'
              }
            `}
          />
          <div className="flex justify-between mt-2 px-1">
            {errors.description ? (
              <span className="text-red-600 text-xs font-bold flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5"/>{errors.description}</span>
            ) : (
              <span className="text-gray-400 text-xs font-medium">En az 20 karakter</span>
            )}
            <span className={`text-xs font-bold ${(formData.description?.length || 0) >= 20 ? 'text-emerald-600' : 'text-gray-400'}`}>{formData.description?.length || 0}/500</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2.5 ml-1">
            Resim Ekle <span className="text-gray-400 font-semibold">(İsteğe Bağlı)</span>
          </label>
          <div className="bg-gray-50/30 border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-gray-600 font-medium">
                En fazla 10 resim ekleyebilirsiniz.
              </div>
              <label className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${uploading ? 'bg-gray-200 text-gray-500 border-gray-200 cursor-not-allowed' : 'bg-white text-cyan-700 border-cyan-200 hover:bg-cyan-50 cursor-pointer'}`}>
                Resim Yükle
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  disabled={uploading || (formData.images?.length || 0) >= 10}
                  onChange={async (e) => {
                    const files = e.target.files;
                    e.target.value = '';
                    if (!files || files.length === 0) return;
                    setUploadError(null);
                    setUploading(true);
                    try {
                      let current = Array.isArray(formData.images) ? [...formData.images] : [];
                      if (current[0]?.startsWith('/images/defaults/')) current = [];
                      for (let i = 0; i < files.length; i++) {
                        if (current.length >= 10) break;
                        const file = files[i];
                        if (!file) continue;
                        const fd = new FormData();
                        fd.append('file', file);
                        const res = await fetch('/api/upload', { method: 'POST', body: fd });
                        const data = await res.json().catch(() => null);
                        if (!res.ok || !data?.url) {
                          throw new Error(data?.error || 'Resim yüklenemedi');
                        }
                        current.push(String(data.url));
                      }
                      updateFormData('images', current);
                    } catch (err: any) {
                      setUploadError(err?.message || 'Resim yüklenemedi');
                    } finally {
                      setUploading(false);
                    }
                  }}
                />
              </label>
            </div>

            {uploadError && (
              <div className="mt-3 text-xs font-bold text-red-600 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {uploadError}
              </div>
            )}

            {Array.isArray(formData.images) && formData.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {formData.images.slice(0, 10).map((img, idx) => (
                  <div key={`${img}-${idx}`} className="relative border border-gray-200 rounded-xl overflow-hidden bg-white">
                    <div className="relative aspect-square">
                      <Image src={img} alt={`Resim ${idx + 1}`} fill unoptimized className="object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const next = formData.images.filter((_, i) => i !== idx);
                        updateFormData('images', next);
                      }}
                      className="w-full py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border-t border-red-100"
                    >
                      Kaldır
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
 </div>
  );
});

const LocationBudgetStep = memo(function LocationBudgetStep({ formData, errors, updateFormData }: {
  formData: FormData;
  errors: Record<string, string>;
  updateFormData: (field: keyof FormData, value: any) => void;
}) {
  const [manualModes, setManualModes] = useState<Record<string, boolean>>({});
  const manualDistrict = manualModes['district'];
  const manualNeighborhood = manualModes['neighborhood'];
  const selectedProvince = getProvinceByName(formData.city);
  const availableDistricts = selectedProvince ? getDistrictsByProvince(selectedProvince.name) : [];
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [neighborhoodOptions, setNeighborhoodOptions] = useState<string[]>([]);
  const [neighborhoodLoading, setNeighborhoodLoading] = useState(false);

  useEffect(() => {
    if (formData.category !== 'emlak') {
      setDistrictOptions([]);
      return;
    }
    if (!formData.city || manualDistrict) {
      setDistrictOptions([]);
      return;
    }
    setDistrictLoading(true);
    const params = new URLSearchParams();
    params.set('city', formData.city);
    fetch(`/api/locations/districts?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setDistrictOptions(Array.isArray(data) ? data : []))
      .catch(() => setDistrictOptions([]))
      .finally(() => setDistrictLoading(false));
  }, [formData.category, formData.city, manualDistrict]);

  useEffect(() => {
    if (formData.category !== 'emlak') {
      setNeighborhoodOptions([]);
      return;
    }
    if (!formData.city || !formData.district || manualNeighborhood) {
      setNeighborhoodOptions([]);
      return;
    }
    setNeighborhoodLoading(true);
    const params = new URLSearchParams();
    params.set('city', formData.city);
    params.set('district', formData.district);
    fetch(`/api/locations/neighborhoods?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setNeighborhoodOptions(Array.isArray(data) ? data : []);
      })
      .catch(() => setNeighborhoodOptions([]))
      .finally(() => setNeighborhoodLoading(false));
  }, [formData.category, formData.city, formData.district, manualNeighborhood]);

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Location Section */}
      <div className="group bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 p-5 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-5">
          <div className="w-8 h-8 rounded-xl bg-cyan-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <MapPin className="w-4 h-4 text-cyan-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">Konum Bilgileri</h3>
            <p className="text-xs text-gray-500 font-medium">Hizmetin gerçekleşeceği konum</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">İl <span className="text-red-500">*</span></label>
            {manualModes['city'] ? (
              <input
                type="text"
                value={formData.city}
                onChange={(e) => {
                  updateFormData('city', e.target.value);
                  updateFormData('district', '');
                  updateFormData('neighborhood', '');
                }}
                placeholder="İl giriniz"
                className={`w-full px-4 py-3 text-sm border rounded-xl bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 outline-none ${errors.city ? 'border-red-500/50 bg-red-50/50' : 'border-gray-200 hover:border-cyan-300'}`}
              />
            ) : (
              <div className="relative group/select">
                <select
                  value={formData.city}
                  onChange={(e) => {
                    updateFormData('city', e.target.value);
                    updateFormData('district', '');
                    updateFormData('neighborhood', '');
                  }}
                  className={`w-full px-4 py-3 text-sm border rounded-xl appearance-none bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 outline-none cursor-pointer ${errors.city ? 'border-red-500/50 bg-red-50/50' : 'border-gray-200 hover:border-cyan-300'}`}
                >
                  <option value="">İl Seçiniz</option>
                  {TURKEY_PROVINCES?.map((province) => (
                    <option key={province.name} value={province.name}>{province.name}</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none group-hover/select:text-cyan-500 transition-colors" />
              </div>
            )}
            <button
              type="button"
              onClick={() => setManualModes(prev => ({ ...prev, city: !prev.city }))}
              className="text-xs font-semibold text-cyan-600 mt-2 hover:text-cyan-700 focus:outline-none flex items-center gap-1.5 px-1 py-0.5 rounded hover:bg-cyan-50 w-fit transition-colors"
            >
              {manualModes['city'] ? <List className="w-3.5 h-3.5"/> : <Search className="w-3.5 h-3.5"/>}
              {manualModes['city'] ? 'Listeden seç' : 'Listede yok mu? Elle gir'}
            </button>
            {errors.city && <span className="text-red-500 text-xs font-bold flex items-center gap-1.5 mt-2 animate-in slide-in-from-left-2"><AlertCircle className="w-3.5 h-3.5"/>{errors.city}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">İlçe <span className="text-red-500">*</span></label>
            {manualModes['district'] ? (
              <input
                type="text"
                value={formData.district}
                onChange={(e) => {
                  updateFormData('district', e.target.value);
                  updateFormData('neighborhood', '');
                }}
                placeholder="İlçe giriniz"
                className={`w-full px-4 py-3 text-sm border rounded-xl bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 outline-none ${errors.district ? 'border-red-500/50 bg-red-50/50' : 'border-gray-200 hover:border-cyan-300'}`}
              />
            ) : (
              <div className="relative group/select">
                <select
                  value={formData.district}
                  onChange={(e) => {
                    updateFormData('district', e.target.value);
                    updateFormData('neighborhood', '');
                  }}
                  disabled={(!formData.city && !manualModes['city']) || (formData.category === 'emlak' && districtLoading)}
                  className={`
                    w-full px-4 py-3 text-sm border rounded-xl appearance-none bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 outline-none cursor-pointer
                    ${errors.district ? 'border-red-500/50 bg-red-50/50' : 'border-gray-200 hover:border-cyan-300'}
                    ${((!formData.city && !manualModes['city']) || (formData.category === 'emlak' && districtLoading)) ? 'bg-gray-100 text-gray-400 cursor-not-allowed hover:border-gray-200' : ''}
                  `}
                >
                  <option value="">İlçe Seçiniz</option>
                  {formData.category === 'emlak'
                    ? districtOptions?.map((district) => (
                        <option key={district} value={district}>{district}</option>
                      ))
                    : availableDistricts?.map((district) => (
                        <option key={district.id} value={district.name}>{district.name}</option>
                      ))}
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none group-hover/select:text-cyan-500 transition-colors" />
              </div>
            )}
            <button
              type="button"
              onClick={() => setManualModes(prev => ({ ...prev, district: !prev.district }))}
              className="text-xs font-semibold text-cyan-600 mt-2 hover:text-cyan-700 focus:outline-none flex items-center gap-1.5 px-1 py-0.5 rounded hover:bg-cyan-50 w-fit transition-colors"
            >
              {manualModes['district'] ? <List className="w-3.5 h-3.5"/> : <Search className="w-3.5 h-3.5"/>}
              {manualModes['district'] ? 'Listeden seç' : 'Listede yok mu? Elle gir'}
            </button>
            {errors.district && <span className="text-red-500 text-xs font-bold flex items-center gap-1.5 mt-2 animate-in slide-in-from-left-2"><AlertCircle className="w-3.5 h-3.5"/>{errors.district}</span>}
          </div>
        </div>

        {formData.category === 'emlak' && (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Mahalle <span className="text-red-500">*</span></label>
              {manualModes['neighborhood'] ? (
                <input
                  type="text"
                  value={formData.neighborhood}
                  onChange={(e) => updateFormData('neighborhood', e.target.value)}
                  placeholder="Mahalle giriniz"
                  className={`w-full px-4 py-3 text-sm border rounded-xl bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 outline-none ${errors.neighborhood ? 'border-red-500/50 bg-red-50/50' : 'border-gray-200 hover:border-cyan-300'}`}
                />
              ) : (
                <div className="relative group/select">
                  <select
                    value={formData.neighborhood}
                    onChange={(e) => updateFormData('neighborhood', e.target.value)}
                    disabled={!formData.city || !formData.district || neighborhoodLoading}
                    className={`
                      w-full px-4 py-3 text-sm border rounded-xl appearance-none bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 outline-none cursor-pointer
                      ${errors.neighborhood ? 'border-red-500/50 bg-red-50/50' : 'border-gray-200 hover:border-cyan-300'}
                      ${(!formData.city || !formData.district || neighborhoodLoading) ? 'bg-gray-100 text-gray-400 cursor-not-allowed hover:border-gray-200' : ''}
                    `}
                  >
                    <option value="">{neighborhoodLoading ? 'Yükleniyor...' : 'Mahalle Seçiniz'}</option>
                    {neighborhoodOptions?.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none group-hover/select:text-cyan-500 transition-colors" />
                </div>
              )}
              <button
                type="button"
                onClick={() => setManualModes(prev => ({ ...prev, neighborhood: !prev.neighborhood }))}
                className="text-xs font-semibold text-cyan-600 mt-2 hover:text-cyan-700 focus:outline-none flex items-center gap-1.5 px-1 py-0.5 rounded hover:bg-cyan-50 w-fit transition-colors"
              >
                {manualModes['neighborhood'] ? <List className="w-3.5 h-3.5"/> : <Search className="w-3.5 h-3.5"/>}
                {manualModes['neighborhood'] ? 'Listeden seç' : 'Listede yok mu? Elle gir'}
              </button>
              {errors.neighborhood && <span className="text-red-500 text-xs font-bold flex items-center gap-1.5 mt-2 animate-in slide-in-from-left-2"><AlertCircle className="w-3.5 h-3.5"/>{errors.neighborhood}</span>}
            </div>
          </div>
        )}
      </div>

      {/* Budget Section */}
      <div className="group bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 p-5 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">Bütçe Planlaması</h3>
            <p className="text-xs text-gray-500 font-medium">Bütçe aralığınızı belirleyin</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-bold text-gray-700 ml-1">Ayırdığınız Bütçe (TL) <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group/input">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-bold tracking-wider bg-gray-50 px-2 py-1 rounded border border-gray-200 group-hover/input:border-cyan-200 group-hover/input:text-cyan-600 transition-colors">EN DÜŞÜK</span>
              <input
                type="number"
                min="0"
                value={formData.minBudget}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || Number(val) >= 0) {
                    updateFormData('minBudget', val);
                  }
                }}
                className={`w-full pl-32 pr-4 py-3 text-sm border rounded-xl bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 outline-none font-medium ${errors.minBudget ? 'border-red-500/50 bg-red-50/50' : 'border-gray-200 hover:border-cyan-300'}`}
                placeholder="0"
              />
            </div>
            <div className="relative group/input">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-bold tracking-wider bg-gray-50 px-2 py-1 rounded border border-gray-200 group-hover/input:border-cyan-200 group-hover/input:text-cyan-600 transition-colors">EN YÜKSEK</span>
              <input
                key="budget-input"
                type="number"
                min="0"
                value={formData.budget}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || Number(val) >= 0) {
                    updateFormData('budget', val);
                  }
                }}
                className={`w-full pl-32 pr-4 py-3 text-sm border rounded-xl bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 outline-none font-medium ${errors.budget ? 'border-red-500/50 bg-red-50/50' : 'border-gray-200 hover:border-cyan-300'}`}
                placeholder="0"
              />
            </div>
          </div>
          {(errors.minBudget || errors.budget) && (
            <span className="text-red-500 text-xs font-bold flex items-center gap-1.5 mt-2 animate-in slide-in-from-left-2"><AlertCircle className="w-3.5 h-3.5"/>{errors.minBudget || errors.budget}</span>
          )}
          <p className="mt-3 text-xs text-gray-500 font-medium flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-500" />
            Satıcılar bu bütçeye göre size teklif verecektir.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100 rounded-2xl p-4 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-white rounded-lg shadow-sm ring-1 ring-cyan-100">
            <Info className="w-5 h-5 text-cyan-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-cyan-900">Önemli Bilgilendirme</h3>
            <p className="mt-1 text-xs text-cyan-700/80 font-medium leading-relaxed">
              Varsagel ödeme sistemine sahip değildir. Biz sadece alıcı ve satıcıyı buluşturan bir aracı platformuz. Ödeme ve teslimat detaylarını satıcı ile görüşerek belirleyebilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

const ReviewStep = memo(function ReviewStep({ formData, categories }: { formData: FormData, categories: Category[] }) {
  const selectedCategory = categories.find((c: any) => c.slug === formData.category);
  const findSubcategory = (items: SubCategory[], slug: string): SubCategory | undefined => {
    for (const item of items) {
      if (item.slug === slug || item.fullSlug === slug) return item;
      if (item.subcategories) {
        const found = findSubcategory(item.subcategories, slug);
        if (found) return found;
      }
    }
    return undefined;
  };
  const selectedSubcategory = selectedCategory && formData.subcategory
    ? findSubcategory(selectedCategory.subcategories || [], formData.subcategory)
    : undefined;
  const attrs = formData.attributes || {};
  const pairs: Record<string, { min?: any; max?: any }> = {};
  
  // Build attribute label map from dynamic attributes
  const attrLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    if ((selectedCategory as any)?.attributes) {
      (selectedCategory as any)?.attributes?.forEach((attr: any) => {
        map.set(attr.slug, attr.name);
      });
    }
    return map;
  }, [selectedCategory]);

  Object.keys(attrs).forEach((k) => {
    if (k.endsWith('Min')) {
      const base = k.slice(0, -3);
      pairs[base] = pairs[base] || {}; pairs[base].min = attrs[k];
    } else if (k.endsWith('Max')) {
      const base = k.slice(0, -3);
      pairs[base] = pairs[base] || {}; pairs[base].max = attrs[k];
    }
  });
  const entries = Object.entries(attrs).filter(([k]) => !k.endsWith('Min') && !k.endsWith('Max'));
  
  const label = (key: string) => {
    // Check dynamic map first
    if (attrLabelMap.has(key)) return attrLabelMap.get(key)!;
    
    // Check dynamic map for range base keys (if they exist as slugs)
    // Sometimes range base key matches a slug (e.g. 'price' -> 'priceMin', 'priceMax')
    // But usually in our schema 'yilMin' comes from 'yil' (year).
    if (attrLabelMap.has(key)) return attrLabelMap.get(key)!;

    const map: Record<string, string> = { 
      marka: 'Marka', 
      model: 'Model', 
      yakit: 'Yakıt', 
      vites: 'Vites', 
      yil: 'Yıl', 
      km: 'Kilometre', 
      hizmetKapsami: 'Hizmet Kapsamı',
      kasaTipi: 'Kasa Tipi',
      renk: 'Renk',
      hasarDurumu: 'Hasar Durumu',
      takas: 'Takas',
      kimden: 'Kimden',
      durumu: 'Durumu',
      motorGucu: 'Motor Gücü',
      motorHacmi: 'Motor Hacmi',
      cekis: 'Çekiş',
      garanti: 'Garanti',
      plakaUyruk: 'Plaka / Uyruk'
    };
    return map[key] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="group bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 overflow-hidden shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300">
        <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <FileText className="w-4 h-4 text-gray-600" />
            </div>
            Talep Özeti
          </h3>
          <span className="px-3 py-1 bg-cyan-50 text-cyan-700 text-[11px] font-bold uppercase tracking-wider rounded-full border border-cyan-100 shadow-sm">Taslak</span>
        </div>
        
        <div className="p-5 space-y-5">
          {formData.images && formData.images?.length > 0 && (
            <div className="mb-5 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 group-hover:border-cyan-100 transition-colors">
              <div className="relative h-40 w-full rounded-xl overflow-hidden bg-white group-hover:scale-105 transition-transform duration-500">
                <Image
                  src={formData.images[0]}
                  alt="Referans Görsel"
                  fill
                  unoptimized
                  className="object-contain mix-blend-multiply drop-shadow-lg"
                />
              </div>
              {formData.images.length > 1 && (
                <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {formData.images.slice(0, 10).map((img, idx) => (
                    <div key={`${img}-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white">
                      <Image src={img} alt={`Referans Görsel ${idx + 1}`} fill unoptimized className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="group/item">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block group-hover/item:text-cyan-600 transition-colors">Başlık</span>
                <p className="text-gray-900 font-bold text-base leading-tight">{formData.title || 'Belirtilmemiş'}</p>
              </div>
              <div className="group/item">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block group-hover/item:text-cyan-600 transition-colors">Kategori</span>
                <p className="text-gray-900 font-medium flex items-center gap-2">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">{selectedCategory?.name}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">{selectedSubcategory?.name}</span>
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="group/item">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block group-hover/item:text-cyan-600 transition-colors">Konum</span>
                <p className="text-gray-900 font-medium flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-red-500" />
                  </div>
                  {formData.city}, {formData.district}{formData.neighborhood ? `, ${formData.neighborhood}` : ''}
                </p>
              </div>
              <div className="group/item">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block group-hover/item:text-cyan-600 transition-colors">Hedef Bütçe</span>
                <p className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 font-black text-xl tracking-tight">
                  {formData.minBudget || formData.budget
                    ? `${formData.minBudget ? `${formData.minBudget} TL` : '0'} – ${formData.budget ? `${formData.budget} TL` : '∞'}`
                    : 'Belirtilmemiş'}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Açıklama</span>
            <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap hover:bg-white hover:shadow-md transition-all duration-300">
              {formData.description || 'Açıklama girilmemiş'}
            </div>
          </div>
        </div>
      </div>

      {(entries.length > 0 || Object.keys(pairs).length > 0) && (
        <div className="group bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 p-5 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <List className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900">Özellikler</h4>
              <div className="text-xs text-gray-500 font-medium mt-0.5">Talep özellikleri</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(pairs).map(([base, v]) => (
              (v.min || v.max) ? (
                <div key={base} className="grid grid-cols-[1fr_auto] gap-4 items-center p-3 rounded-xl border border-gray-200 bg-white shadow-sm hover:border-cyan-200 transition-colors">
                  <span className="text-gray-700 text-sm font-semibold">{label(base)}</span>
                  <span className="font-bold text-gray-900 text-sm bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 text-right">{v.min ?? '—'}{(v.min || v.max) ? ' – ' : ''}{v.max ?? '—'}</span>
                </div>
              ) : null
            ))}
            {entries.map(([k, v]) => (
              v !== undefined && v !== '' ? (
                <div key={k} className="grid grid-cols-[1fr_auto] gap-4 items-center p-3 rounded-xl border border-gray-200 bg-white shadow-sm hover:border-cyan-200 transition-colors">
                  <span className="text-gray-700 text-sm font-semibold">{label(k)}</span>
                  <span className="font-bold text-gray-900 text-sm text-right bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">{String(v)}</span>
                </div>
              ) : null
            ))}
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4 shadow-lg shadow-emerald-100/50">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-white rounded-full shadow-md ring-4 ring-emerald-50 animate-pulse">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-900">Her Şey Hazır!</h3>
            <p className="mt-1 text-xs text-emerald-700 font-medium">
              Talebiniz yayınlanmaya hazır. Onayladıktan sonra satıcılar teklif vermeye başlayacak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

function TalepOlusturPage() {
  const sp = useSearchParams();
  const [categories, setCategories] = useState<any[]>([]);
  const defaultCategory = sp.get("category") ?? "";
  const defaultSubcategory = sp.get("subcategory") ?? "";

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    category: defaultCategory,
    subcategory: defaultSubcategory,
    city: "",
    district: "",
    neighborhood: "",
    minBudget: "",
    budget: "",
    images: [],
    attributes: {},
    manualAttributeKeys: [],
  });

  const handleManualChange = useCallback((key: string, isManual: boolean) => {
    setFormData(prev => {
       const keys = prev.manualAttributeKeys || [];
       if (isManual) {
         // Avoid duplicates
         if (keys.includes(key)) return prev;
         return { ...prev, manualAttributeKeys: [...keys, key] };
       } else {
         return { ...prev, manualAttributeKeys: keys.filter(k => k !== key) };
       }
    });
  }, []);

  const subcats = useMemo(() => {
    // 1. Try to find hierarchical structure in static data first (for Emlak etc.)
    const staticCat = STATIC_CATEGORIES.find(c => c.slug === formData.category);
    if (staticCat?.subcategories && staticCat.subcategories.length > 0) {
      return staticCat.subcategories;
    }
    // 2. Fallback to API data (usually flat)
    return categories.find((c) => c.slug === formData.category)?.subcategories ?? [];
  }, [formData.category, categories]);

  const router = useRouter();
  const editId = sp.get("editId") || sp.get("edit");

  useEffect(() => {
    if (!editId) return;
    
    const fetchListing = async () => {
      try {
        const res = await fetch(`/api/talep?id=${editId}`);
        if (res.ok) {
          const data = await res.json();
          const attrs = data.attributes || {};
          setFormData({
            title: data.title,
            description: data.description,
            category: data.category.slug,
            subcategory: data.subCategory?.slug || '',
            city: data.location.city,
            district: data.location.district,
            neighborhood: attrs.mahalle ? String(attrs.mahalle) : '',
            minBudget: attrs.minPrice ? String(attrs.minPrice) : '',
            budget: attrs.maxPrice ? String(attrs.maxPrice) : (data.price ? String(data.price) : ''),
            images: data.images || [],
            attributes: attrs,
            manualAttributeKeys: data.manualAttributeKeys || []
          });
        } else {
          toast({ title: 'Hata', description: 'Talep bilgileri yüklenemedi', variant: 'destructive' });
        }
      } catch (e) {
        console.error(e);
        toast({ title: 'Hata', description: 'Bir hata oluştu', variant: 'destructive' });
      }
    };
    
    fetchListing();
  }, [editId]);


  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          if (active && Array.isArray(data) && data.length) {
            setCategories(data);
          }
        }
      } catch {}
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!formData.category && categories?.length) {
      setFormData(prev => ({ ...prev, category: defaultCategory || categories[0].slug }));
    }
  }, [categories, defaultCategory, formData.category]);

  useEffect(() => {
    // Recursive validation helper
    const isValidSubcategory = (items: SubCategory[], slug: string): boolean => {
      if (!slug) return false;
      return items.some(item => {
        if (item.slug === slug || item.fullSlug === slug) return true;
        if (item.subcategories && item.subcategories.length > 0) {
          return isValidSubcategory(item.subcategories, slug);
        }
        return false;
      });
    };

    const valid = isValidSubcategory(subcats, formData.subcategory);
    
    if (!valid && formData.subcategory) {
       // If currently selected subcategory is NOT in the tree at all, reset to first available.
       // But if subcategory is empty, we might want to auto-select ONLY if it's a flat list?
       // For Emlak, we don't want to auto-select 'konut' necessarily, or maybe we do.
       // But crucial fix is: don't reset if it IS valid deeply.
       
       // If valid is false, it means slug is not found anywhere in the tree.
       const newValue = subcats[0]?.fullSlug ?? subcats[0]?.slug ?? "";
       if (formData.subcategory !== newValue) {
          // Careful: This auto-selects the top-level parent (e.g. 'konut').
          // If the user had an invalid selection, this is a fallback.
          setFormData(prev => ({ ...prev, subcategory: newValue }));
       }
    } else if (!formData.subcategory && subcats.length > 0) {
       // Optional: Auto-select first item if nothing selected?
       // This was the behavior of the previous code (valid was false for empty string).
       const newValue = subcats[0]?.fullSlug ?? subcats[0]?.slug ?? "";
       setFormData(prev => ({ ...prev, subcategory: newValue }));
    }

    // Generic default image logic
    if (formData.subcategory) {
      setFormData(prev => {
        const defaultPath = getSubcategoryImage(formData.subcategory);
        
        // Case 1: No images -> Set default
        if (prev.images.length === 0) {
          return { ...prev, images: [defaultPath] };
        }
        
        // Case 2: Has images, check if it's a default image (starts with /images/defaults/)
        // If so, update it to the new subcategory's default
        const firstImage = prev.images[0];
        if ((firstImage.startsWith('/images/defaults/') || firstImage.startsWith('/images/placeholder-')) && firstImage !== defaultPath) {
           return { ...prev, images: [defaultPath, ...prev.images.slice(1)] };
        }
        
        return prev;
      });
    }
  }, [formData.category, formData.subcategory, subcats]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorSummary, setErrorSummary] = useState<string[]>([]);
  const [dynamicAttributes, setDynamicAttributes] = useState<any[]>([]);

  const mergeAttributeSources = useCallback((overrideAttrs: any[], dbAttrs: any[]) => {
    const norm = (s: any) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const override = Array.isArray(overrideAttrs) ? overrideAttrs : [];
    const base = Array.isArray(dbAttrs) ? dbAttrs : [];
    if (override.length === 0) return base;

    const overrideKeys = new Set<string>();
    override.forEach((a) => overrideKeys.add(norm(a?.slug)));

    const missingRequired = base.filter((a) => !!a?.required && !overrideKeys.has(norm(a?.slug)));
    const missingOptional = base.filter((a) => !a?.required && !overrideKeys.has(norm(a?.slug)));

    const sortByOrder = (a: any, b: any) => (Number(a?.order || 0) - Number(b?.order || 0));
    missingRequired.sort(sortByOrder);
    missingOptional.sort(sortByOrder);

    return [...missingRequired, ...override, ...missingOptional];
  }, []);

  // Calculate manualModes from formData.manualAttributeKeys
  const manualModes = useMemo(() => {
    const modes: Record<string, boolean> = {};
    (formData.manualAttributeKeys || []).forEach(k => {
      modes[k] = true;
    });
    return modes;
  }, [formData.manualAttributeKeys]);

  useEffect(() => {
    if (!formData.category) return;
    
    // Fetch dynamic attributes for the selected category
    const fetchAttributes = async () => {
      try {
        const query = new URLSearchParams();
        if (formData.subcategory) {
          query.append('subcategory', formData.subcategory);
        }

        const url = `/api/categories/${formData.category}/attributes?${query.toString()}`;

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setDynamicAttributes(data);
        } else {
          console.error('Fetch failed:', res.status);
        }
      } catch (error) {
        console.error('Error fetching attributes:', error);
      }
    };

    fetchAttributes();
  }, [formData.category, formData.subcategory]);

  const mergedDynamicAttributes = useMemo(() => {
    const currentCategory = categories.find((c: any) => c?.slug === formData.category);
    const base = currentCategory?.attributes || [];
    if (Array.isArray(dynamicAttributes) && dynamicAttributes.length > 0) {
      return mergeAttributeSources(dynamicAttributes, base);
    }
    return base;
  }, [categories, dynamicAttributes, formData.category, mergeAttributeSources]);

  const selectedCategory = useMemo(
    () => categories.find((c: any) => c?.slug === formData.category),
    [categories, formData.category]
  );

  const selectedSubcategory = useMemo(() => {
    if (!selectedCategory || !formData.subcategory) return undefined;
    return findSubcategoryBySlug(selectedCategory.subcategories || [], formData.subcategory);
  }, [selectedCategory, formData.subcategory]);

  const selectedSubcategoryId = useMemo(() => {
    const raw = (selectedSubcategory as any)?.id;
    return raw ? String(raw) : undefined;
  }, [selectedSubcategory]);

  const attributeFields = useMemo(
    () => attributesToFields(formData.category, formData.subcategory, mergedDynamicAttributes, selectedSubcategoryId),
    [formData.category, formData.subcategory, mergedDynamicAttributes, selectedSubcategoryId]
  );

  const validateStep = useCallback((step: number, data: FormData = formData): boolean => {
    try {
      const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!data.category) newErrors.category = 'Lütfen kategori seçiniz';
      if (!data.subcategory) newErrors.subcategory = 'Lütfen alt kategori seçiniz';
    }

    if (step === 2) {
      if (!data.title?.trim()) {
        newErrors.title = 'Lütfen başlık giriniz';
      }
      else if ((data.title?.trim().length || 0) < 10) {
        newErrors.title = 'Başlık en az 10 karakter olmalıdır';
      }
      
      if (!data.description?.trim()) {
        newErrors.description = 'Lütfen açıklama giriniz';
      }
      else if ((data.description?.trim().length || 0) < 20) {
        newErrors.description = 'Açıklama en az 20 karakter olmalıdır';
      }

      const combined = attributeFields;
      if (combined && combined.length > 0) {
        const fieldMap = new Map<string, AttrField>();
        combined.forEach((f) => {
          if (!f) return;
          fieldMap.set(stableAttrFieldId(f), f);
        });
        const attrs = data.attributes || {};
        fieldMap.forEach((f) => {
          if (!f) return;
          if (f.type === 'range-number' && f.minKey && f.maxKey) {
            const a = attrs[f.minKey];
            const b = attrs[f.maxKey];
            if (f.required) {
               const hasA = a !== undefined && String(a) !== '';
               const hasB = b !== undefined && String(b) !== '';
               if (!hasA && !hasB) {
                 newErrors[f.minKey] = `Lütfen minimum ${f.label.toLowerCase()} giriniz`;
                 newErrors[f.maxKey] = `Lütfen maksimum ${f.label.toLowerCase()} giriniz`;
               }
            }
            if (f.min !== undefined || f.max !== undefined) {
               if (a !== undefined && String(a) !== '') {
                   const val = Number(a);
                   if (f.min !== undefined && val < f.min) newErrors[f.minKey] = `En az ${f.min}`;
                   if (f.max !== undefined && val > f.max) newErrors[f.minKey] = `En çok ${f.max}`;
               }
               if (b !== undefined && String(b) !== '') {
                   const val = Number(b);
                   if (f.min !== undefined && val < f.min) newErrors[f.maxKey] = `En az ${f.min}`;
                   if (f.max !== undefined && val > f.max) newErrors[f.maxKey] = `En çok ${f.max}`;
               }
               if (a !== undefined && String(a) !== '' && b !== undefined && String(b) !== '') {
                   const minVal = Number(a);
                   const maxVal = Number(b);
                   if (!Number.isNaN(minVal) && !Number.isNaN(maxVal) && minVal > maxVal) {
                       newErrors[f.minKey] = 'Minimum maksimumdan büyük olamaz';
                       newErrors[f.maxKey] = 'Maksimum minimumdan küçük olamaz';
                   }
               }
            }
          } else if (f.key) {
            const v = attrs[f.key];
            if (f.required) {
              const present = f.type === 'boolean' ? (f.key in attrs) : (v !== undefined && String(v).trim() !== '' && (!Array.isArray(v) || v.length > 0));
              if (!present) newErrors[f.key] = `Lütfen ${f.label.toLowerCase()} seçiniz`;
            }
            if (f.type === 'number' && (f.min !== undefined || f.max !== undefined) && v !== undefined && String(v).trim() !== '') {
               const val = Number(v);
               if (f.min !== undefined && val < f.min) newErrors[f.key] = `En az ${f.min}`;
               if (f.max !== undefined && val > f.max) newErrors[f.key] = `En çok ${f.max}`;
            }
          }
        });
      }
    }

    if (step === 3) {
    if (!data.city?.trim()) newErrors.city = 'Lütfen şehir seçiniz';
    if (!data.district?.trim()) newErrors.district = 'Lütfen ilçe seçiniz';
    if (data.category === 'emlak' && !data.neighborhood?.trim()) newErrors.neighborhood = 'Lütfen mahalle seçiniz';
    if (!data.minBudget) newErrors.minBudget = 'Lütfen minimum bütçe giriniz';
    else if (parseInt(data.minBudget) < 0) newErrors.minBudget = 'Minimum bütçe 0 TL veya daha fazla olmalıdır';
    if (!data.budget) newErrors.budget = 'Lütfen maksimum bütçe giriniz';
    else if (parseInt(data.budget) < 1) newErrors.budget = 'Maksimum bütçe 1 TL veya daha fazla olmalıdır';
    if (data.minBudget && data.budget) {
      const a = parseInt(data.minBudget);
      const b = parseInt(data.budget);
      if (!Number.isNaN(a) && !Number.isNaN(b) && a > b) {
        newErrors.minBudget = 'Minimum bütçe maksimum bütçeden büyük olamaz';
        newErrors.budget = 'Maksimum bütçe minimum bütçeden küçük olamaz';
      }
    }
  }

    setErrors(newErrors);

    // Hata özeti oluştur
    const items = Object.keys(newErrors);
    const labels: Record<string,string> = { 
      category:'Kategori', 
      subcategory:'Alt kategori', 
      title:'Başlık', 
      description:'Açıklama', 
      city:'İl', 
      district:'İlçe', 
      neighborhood:'Mahalle',
      minBudget:'Minimum bütçe', 
      budget:'Maksimum bütçe',
      model:'Model',
      seri:'Seri',
      paket:'Paket'
    };

    const labelMap = new Map<string, string>();
    if (step === 2) {
      if (attributeFields && attributeFields.length > 0) {
        attributeFields.forEach((f) => {
          if (!f) return;
          if (f.key) labelMap.set(f.key, f.label);
          if (f.minKey) labelMap.set(f.minKey, f.label);
          if (f.maxKey) labelMap.set(f.maxKey, f.label);
        });
      }
    }

    const detailedErrors = items.map(k => {
      const fieldLabel = labels[k] || labelMap.get(k) || k;
      const errorMsg = newErrors[k];
      
      if (errorMsg.includes('En az') || errorMsg.includes('En çok') || errorMsg.includes('Minimum') || errorMsg.includes('Maksimum')) {
        return `${fieldLabel}: ${errorMsg}`;
      }
      
      return fieldLabel;
    });
    
    setErrorSummary(detailedErrors);

    return Object.keys(newErrors).length === 0;
    } catch (error) {
      console.error('Error in validateStep:', error);
      return false;
    }
  }, [formData, attributeFields]);

  const validateAll = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.category) newErrors.category = 'Lütfen kategori seçiniz';
    if (!formData.subcategory) newErrors.subcategory = 'Lütfen alt kategori seçiniz';
    if (!formData.title?.trim()) newErrors.title = 'Lütfen başlık giriniz';
    else if ((formData.title?.trim().length || 0) < 10) newErrors.title = 'Başlık en az 10 karakter olmalıdır';
    if (!formData.description?.trim()) newErrors.description = 'Lütfen açıklama giriniz';
    else if ((formData.description?.trim().length || 0) < 20) newErrors.description = 'Açıklama en az 20 karakter olmalıdır';
    if (!formData.city?.trim()) newErrors.city = 'Lütfen şehir seçiniz';
    if (!formData.district?.trim()) newErrors.district = 'Lütfen ilçe seçiniz';
    if (!formData.minBudget) newErrors.minBudget = 'Lütfen minimum bütçe giriniz';
    else if (parseInt(formData.minBudget) < 0) newErrors.minBudget = 'Minimum bütçe 0 TL veya daha fazla olmalıdır';
    if (!formData.budget) newErrors.budget = 'Lütfen maksimum bütçe giriniz';
    else if (parseInt(formData.budget) < 1) newErrors.budget = 'Maksimum bütçe 1 TL veya daha fazla olmalıdır';
    if (formData.minBudget && formData.budget) {
      const a = parseInt(formData.minBudget);
      const b = parseInt(formData.budget);
      if (!Number.isNaN(a) && !Number.isNaN(b) && a > b) {
        newErrors.minBudget = 'En düşük, En yüksek’ten büyük olamaz';
        newErrors.budget = 'En yüksek, En düşük’ten küçük olamaz';
      }
    }
    const combined = attributeFields;
    const fieldMap = new Map<string, AttrField>();
    combined.forEach((f) => {
      fieldMap.set(stableAttrFieldId(f), f);
    });
    const attrs = formData.attributes || {};
    fieldMap.forEach((f) => {
      if (f.type === 'range-number' && f.minKey && f.maxKey) {
          const a = attrs[f.minKey];
          const b = attrs[f.maxKey];
          const hasA = a !== undefined && String(a) !== '';
          const hasB = b !== undefined && String(b) !== '';
          if (f.required) {
            // Range-number alanlar için en az bir değer (min veya max) girilmiş olmalı
            if (!hasA && !hasB) {
              newErrors[f.minKey] = 'En az bir değer girilmelidir';
              newErrors[f.maxKey] = 'En az bir değer girilmelidir';
            }
          }
          if (f.min !== undefined || f.max !== undefined) {
               if (hasA) {
                   const val = Number(a);
                   if (f.min !== undefined && val < f.min) newErrors[f.minKey] = `En az ${f.min}`;
                   if (f.max !== undefined && val > f.max) newErrors[f.minKey] = `En çok ${f.max}`;
               }
               if (hasB) {
                   const val = Number(b);
                   if (f.min !== undefined && val < f.min) newErrors[f.maxKey] = `En az ${f.min}`;
                   if (f.max !== undefined && val > f.max) newErrors[f.maxKey] = `En çok ${f.max}`;
               }
               // Eğer hem min hem max değerleri girilmişse, min <= max olmalı
               if (hasA && hasB) {
                   const minVal = Number(a);
                   const maxVal = Number(b);
                   if (!Number.isNaN(minVal) && !Number.isNaN(maxVal) && minVal > maxVal) {
                       newErrors[f.minKey] = 'Minimum maksimumdan büyük olamaz';
                       newErrors[f.maxKey] = 'Maksimum minimumdan küçük olamaz';
                   }
               }
          }
      } else if (f.key) {
        const v = attrs[f.key];
        const present = f.type === 'boolean' ? (f.key in attrs) : (v !== undefined && String(v).trim() !== '');
        if (f.required && !present) newErrors[f.key] = 'Zorunlu';
        
        if (f.type === 'number' && (f.min !== undefined || f.max !== undefined) && present) {
             const val = Number(v);
             if (f.min !== undefined && val < f.min) newErrors[f.key] = `En az ${f.min}`;
             if (f.max !== undefined && val > f.max) newErrors[f.key] = `En çok ${f.max}`;
        }
      }
    });
    if (String(attrs['marka'] || '').trim() && !String(attrs['model'] || '').trim()) {
      newErrors['model'] = 'Zorunlu';
    }
    setErrors(newErrors);
    const items = Object.keys(newErrors);
    const labels: Record<string,string> = { 
      category:'Kategori', 
      subcategory:'Alt kategori', 
      title:'Başlık', 
      description:'Açıklama', 
      city:'İl', 
      district:'İlçe', 
      minBudget:'Minimum bütçe', 
      budget:'Maksimum bütçe',
      model:'Model',
      seri:'Seri',
      paket:'Paket'
    };
    const labelMap = new Map<string, string>();
    if (combined && combined.length > 0) {
      combined.forEach((f: AttrField) => {
        if (f.key) labelMap.set(f.key, f.label);
        if (f.minKey) labelMap.set(f.minKey, f.label);
        if (f.maxKey) labelMap.set(f.maxKey, f.label);
      });
    }
    
    // Daha detaylı hata mesajları
    const detailedErrors = items.map(k => {
      const fieldLabel = labels[k] || labelMap.get(k) || k;
      const errorMsg = newErrors[k];
      
      if (errorMsg.includes('En az') || errorMsg.includes('En çok') || errorMsg.includes('Minimum') || errorMsg.includes('Maksimum')) {
        return `${fieldLabel}: ${errorMsg}`;
      }
      
      return fieldLabel;
    });
    
    setErrorSummary(detailedErrors);
    return items.length === 0;
  }, [formData, attributeFields]);

  const updateFormData = useCallback((field: keyof FormData, value: any) => {
    setFormData((prev) => {
      if (field === 'category') {
        if (prev.category === value) return prev;
        return { ...prev, category: value, subcategory: '', subcategoryFullSlug: undefined, attributes: {}, manualAttributeKeys: [], images: [] };
      }
      if (field === 'subcategory') {
        if (prev.subcategory === value) return prev;
        return { ...prev, subcategory: value, subcategoryFullSlug: undefined, attributes: {}, manualAttributeKeys: [] };
      }
      return { ...prev, [field]: value };
    });

    if (field === 'category' || field === 'subcategory') {
      if (Object.keys(errors).length) setErrors({});
      if (errorSummary.length) setErrorSummary([]);
      return;
    }

    if (errors[field as string]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field as string];
        return n;
      });
    }
  }, [errors, errorSummary]);

const getBrandLogo = (brand: string) => {
    if (!brand) return '';
    // Use local logos from generated index
    return (BRAND_LOGOS as Record<string, string>)[brand] || '';
  };

  const handleAttributeChange = useCallback((key: string, val: any) => {
    setFormData(prev => {
      const next = { ...prev, attributes: { ...prev.attributes, [key]: val } };
      if (key === 'marka') { 
        next.attributes['model'] = ''; next.attributes['seri'] = ''; next.attributes['paket'] = '';
        // Otomatik logo ekle
        if (val && typeof val === 'string') {
          const logoUrl = getBrandLogo(val);
          next.images = logoUrl ? [logoUrl] : [];
        } else {
          next.images = [];
        }
      }
      if (key === 'model') { next.attributes['seri'] = ''; next.attributes['paket'] = ''; }
      if (key === 'seri') { next.attributes['paket'] = ''; }
      return next;
    });
    setErrors(prev => {
      const n = { ...prev };
      delete n[key];
      if (key === 'marka') { delete n.model; delete n.seri; delete n.paket; }
      if (key === 'model') { delete n.seri; delete n.paket; }
      if (key === 'seri') { delete n.paket; }
      return n;
    });
  }, []);

  const nextStep = useCallback((overrideData?: Partial<FormData>) => {
    try {
      const currentData = { ...formData, ...overrideData };
      const isValid = validateStep(currentStep, currentData);
      
      if (isValid && currentStep < STEPS.length) {
        setCurrentStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        toast({ title: 'Eksik alanlar', description: 'Lütfen yukarıdaki eksik alanları kontrol ediniz.', variant: 'destructive' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error in nextStep:', error);
      toast({ title: 'Hata', description: 'Bir hata oluştu. Lütfen tekrar deneyiniz.', variant: 'destructive' });
    }
  }, [validateStep, currentStep, formData]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  const handleAdCreate = useCallback(async () => {
    const ok = validateAll();
    if (!ok) {
      toast({ title: 'Eksik alanlar', description: 'Lütfen yukarıdaki eksik alanları kontrol ediniz.', variant: 'destructive' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    try {
      toast({
        title: editId ? "İlan güncelleniyor..." : "İlanınız oluşturuluyor...",
        description: "Lütfen bekleyiniz",
        variant: "info",
      });

      const url = editId ? `/api/talep?id=${editId}` : '/api/talep-olustur';
      const method = editId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          subcategory: formData.subcategory,
          city: formData.city,
          district: formData.district,
          budget: formData.budget ? String(parseInt(formData.budget)) : '',
          images: formData.images,
          attributes: {
            ...formData.attributes,
            ...(formData.minBudget ? { minPrice: parseInt(formData.minBudget) } : {}),
            ...(formData.budget ? { maxPrice: parseInt(formData.budget) } : {}),
            ...(formData.category === 'emlak' && formData.neighborhood?.trim() ? { mahalle: formData.neighborhood.trim() } : {}),
          },
          manualAttributeKeys: formData.manualAttributeKeys || []
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Başarılı!",
          description: result.message || (editId ? 'Talep başarıyla güncellendi!' : 'Talebiniz başarıyla oluşturuldu!'),
          variant: "success",
        });
        
        const callbackUrl = sp.get('callbackUrl');
        if (editId) {
          router.push(callbackUrl || '/profil');
        } else {
          router.push('/');
        }
      } else {
        toast({
          title: "Hata!",
          description: result.error || "İşlem başarısız oldu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Hata!",
        description: "Bir sorun oluştu. Lütfen tekrar deneyiniz.",
        variant: "destructive",
      });
    }
  }, [formData, validateAll, editId, router, sp]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep < STEPS.length) {
      nextStep();
    }
    // Son adımda enter ile submit olmasını engelliyoruz.
    // Kullanıcı butona tıklamalı.
  }, [currentStep, nextStep]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CategorySelection formData={formData} errors={errors} updateFormData={updateFormData} subcats={subcats} categories={categories} nextStep={nextStep} />;
      case 2:
        return (
          <>
            <DetailsStep formData={formData} errors={errors} updateFormData={updateFormData} categories={categories} />
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <CategoryAttributes
                category={formData.category}
                subcategory={formData.subcategory}
                fields={attributeFields}
                attributes={formData.attributes}
                errors={errors}
                onChange={handleAttributeChange}
                onManualChange={handleManualChange}
                manualModes={manualModes}
              />
            </div>
          </>
        );
      case 3:
        return <LocationBudgetStep formData={formData} errors={errors} updateFormData={updateFormData} />;
      case 4:
        return <ReviewStep formData={formData} categories={categories} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/30 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-cyan-900 to-blue-900 mb-3 drop-shadow-sm">
            {editId ? 'Talebi Düzenle' : 'Yeni Talep Oluştur'}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
            {editId ? 'Talep detaylarınızı güncelleyerek daha iyi teklifler alın' : 'İhtiyacınızı detaylandırın, satıcılar size en uygun teklifleri sunsun'}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-gray-200/50 border border-white/50 overflow-hidden ring-1 ring-gray-900/5">
          <div className="p-6 sm:p-10">
            {errorSummary?.length > 0 && (
              <div className="mb-8 bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-800 rounded-2xl p-5 flex items-start gap-4 animate-in fade-in slide-in-from-top-2 shadow-lg shadow-red-100/50">
                <div className="flex-shrink-0 p-2 bg-red-100 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1 py-1">
                  <h4 className="font-bold text-base mb-2">⚠️ Lütfen eksik alanları doldurunuz:</h4>
                  <div className="space-y-1.5">
                    {errorSummary.map((error, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm font-medium">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-red-200"></span>
                        <span>{error}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-red-200/60">
                    <p className="text-xs text-red-700 font-semibold">
                      💡 Tüm zorunlu alanları doldurduktan sonra devam edebilirsiniz.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <StepIndicator currentStep={currentStep} />

            <form onSubmit={handleSubmit} className="mt-10">
              {renderStep()}
              
              <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-100">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`
                    flex items-center gap-2 px-6 py-3.5 rounded-2xl font-semibold transition-all duration-300
                    ${currentStep === 1 
                      ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                      : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-lg hover:shadow-gray-200/50 border border-transparent hover:border-gray-100'
                    }
                  `}
                >
                  <ChevronLeft className="w-5 h-5" />
                  Geri Dön
                </button>

                {currentStep < STEPS.length ? (
                  <button
                    type="button"
                    onClick={() => nextStep()}
                    className="group relative flex items-center gap-2 px-10 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl font-semibold hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-1 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Devam Et
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAdCreate}
                    className="group relative flex items-center gap-2 px-10 py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl font-semibold hover:from-emerald-500 hover:to-green-500 transition-all duration-300 shadow-xl shadow-green-500/20 hover:shadow-green-500/40 hover:-translate-y-1 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      {editId ? 'İlanı Güncelle' : 'İlanı Yayınla'}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="mt-8 text-center flex items-center justify-center gap-2 text-gray-400 text-sm font-medium">
          <Info className="w-4 h-4" />
          <p>Varsagel güvenli ihtiyaç bulma platformu • Tüm hakları saklıdır</p>
        </div>
      </div>
    </div>
  );
}

export default function TalepForm() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Yükleniyor...</p>
        </div>
      </div>
    }>
      <TalepOlusturPage />
    </Suspense>
  );
}
