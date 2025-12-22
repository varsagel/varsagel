"use client";

import { useEffect, useMemo, useState, useCallback, memo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Category, SubCategory } from "@/data/categories";
import { TURKEY_PROVINCES, getProvinceByName, getDistrictsByProvince } from "@/data/turkey-locations";
import { toast } from "@/components/ui/use-toast";
import { ATTR_SCHEMAS, AttrField } from '@/data/attribute-schemas';
import { ATTR_SUBSCHEMAS, MODEL_SERIES_EXTRA, SERIES_TRIMS_EXTRA } from '@/data/attribute-overrides';
import BRAND_LOGOS from '@/data/brand-logos.json';
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
  Loader2,
  Search,
  Check,
  X
} from "lucide-react";

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
  city: string;
  district: string;
  minBudget: string;
  budget: string;
  images: string[];
  attributes: Record<string, any>;
};

// CategoryAttributes definitions
type AttrFieldLocal = AttrField;
const ATTRS: Record<string, AttrFieldLocal[]> = ATTR_SCHEMAS;

const CategoryAttributes = memo(function CategoryAttributes({ category, subcategory, attributes, errors, onChange, dynamicAttributes }: { category: string; subcategory: string; attributes: Record<string, any>; errors: Record<string, string>; onChange: (key: string, val: any) => void; dynamicAttributes?: any[] }) {
  const [manualModes, setManualModes] = useState<Record<string, boolean>>({});
  const [models, setModels] = useState<string[]>([]);
  const [series, setSeries] = useState<string[]>([]);
  const [trims, setTrims] = useState<string[]>([]);

  const brand = String(attributes['marka'] || '').trim();
  const modelVal = String(attributes['model'] || '').trim();
  const seriesVal = String(attributes['seri'] || '').trim();
  const overrideKeyLocal = `${category}/${subcategory || ''}`;

  useEffect(() => {
    if (!brand || !['vasita', 'alisveris'].includes(category)) {
      setModels([]);
      return;
    }
    fetch(`/api/vehicle-data?type=models&category=${overrideKeyLocal}&brand=${encodeURIComponent(brand)}`)
      .then(res => res.json())
      .then(data => {
         const extra = Object.keys(((MODEL_SERIES_EXTRA[overrideKeyLocal] || {})[brand] || {}));
         const arr = Array.isArray(data) ? [...data, ...extra] : [...extra];
         setModels(Array.from(new Set(arr)).sort((a,b)=> a.localeCompare(b,'tr')));
      })
      .catch(() => setModels([]));
  }, [brand, category, overrideKeyLocal]);

  useEffect(() => {
    if (!brand || !modelVal) {
      setSeries([]);
      return;
    }
    fetch(`/api/vehicle-data?type=series&category=${overrideKeyLocal}&brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(modelVal)}`)
      .then(res => res.json())
      .then(data => {
        const seriesExtra = (MODEL_SERIES_EXTRA[overrideKeyLocal] || {}) as Record<string, Record<string, string[]>>;
        const brandSeries = seriesExtra[brand] || {};
        const extra = brandSeries[modelVal] || [];
        
        const arr = Array.isArray(data) ? [...data, ...extra] : [...extra];
        const sorted = Array.from(new Set(arr)).sort((a,b)=> a.localeCompare(b,'tr'));
        setSeries(sorted);
      })
      .catch(() => setSeries([]));
  }, [brand, modelVal, overrideKeyLocal]);

  useEffect(() => {
    if (!brand || !modelVal || !seriesVal) {
      setTrims([]);
      return;
    }
    fetch(`/api/vehicle-data?type=trims&category=${overrideKeyLocal}&brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(modelVal)}&series=${encodeURIComponent(seriesVal)}`)
      .then(res => res.json())
      .then(data => {
         const arr = Array.isArray(data) ? data : [];
         setTrims(Array.from(new Set(arr)).sort((a,b)=> a.localeCompare(b,'tr')));
      })
      .catch(() => setTrims([]));
  }, [brand, modelVal, seriesVal, overrideKeyLocal]);
  
  const fields = useMemo(() => {
    if (dynamicAttributes && dynamicAttributes.length > 0) {
      const withScope = dynamicAttributes.filter((attr: any) => {
        // Filter by showInRequest
        if (attr.showInRequest === false) return false;

        if (!attr.subCategoryId) return true;
        if (!attr.subCategory) return false;
        if (!subcategory) return false;
        return attr.subCategory.slug === subcategory;
      });

      const source = withScope.length > 0 ? withScope : dynamicAttributes.filter((attr: any) => !attr.subCategoryId && attr.showInRequest !== false);

      if (source.length > 0) {
        return source.map((attr: any) => {
          let options: string[] = [];
          try {
            if (attr.optionsJson) {
              const parsed = JSON.parse(attr.optionsJson);
              if (Array.isArray(parsed)) {
                options = parsed;
              }
            }
          } catch (e) { console.error('Error parsing options', e); }

          const generatedMinKey = attr.minKey || (attr.type === 'range-number' ? `${attr.slug || attr.id}Min` : undefined);
          const generatedMaxKey = attr.maxKey || (attr.type === 'range-number' ? `${attr.slug || attr.id}Max` : undefined);

          if (attr.type === 'range-number' && (!attr.slug && !attr.id)) {
            console.warn('Attribute missing slug and id', attr);
          }

          return {
            key: attr.slug,
            label: attr.name,
            type: attr.type === 'checkbox' ? 'boolean' : attr.type, // Map DB types to UI types
            required: attr.required,
            options: options.length ? options : undefined,
            minKey: generatedMinKey,
            maxKey: generatedMaxKey,
            min: attr.min,
            max: attr.max,
            minLabel: attr.minLabel,
            maxLabel: attr.maxLabel
          } as AttrFieldLocal;
        });
      }
    }

    // 2. Fallback to Static Schemas
    const overrideKey = `${category}/${subcategory || ''}`;
    if (ATTR_SUBSCHEMAS[overrideKey]) {
       return ATTR_SUBSCHEMAS[overrideKey];
    }
    if (ATTR_SCHEMAS[category]) {
       return ATTR_SCHEMAS[category];
    }

    return [];
  }, [category, subcategory, dynamicAttributes, models, series, trims]); // Updated dependencies

  if (!fields.length) return null;
  return (
    <div className="space-y-6 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
        <List className="w-5 h-5 text-cyan-600" />
        <h3 className="text-lg font-semibold text-gray-900">Aradığınız Ürünün Özellikleri</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {fields.map((f)=> {
          const id = f.key ? `k:${f.key}` : (f.minKey && f.maxKey) ? `r:${f.minKey}:${f.maxKey}` : `l:${f.label}`;
          const isManual = f.key ? manualModes[f.key] : false;

          return (
          <div key={id} className={f.type === 'range-number' ? 'md:col-span-2' : ''}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {f.label} {f.required && <span className="text-red-500">*</span>}
            </label>
            {f.type === 'select' ? (
              <>
              {isManual ? (
                <input
                  type="text"
                  value={attributes[f.key!] ?? ''}
                  onChange={(e)=>onChange(f.key!, e.target.value)}
                  placeholder={`${f.label} giriniz`}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${errors[f.key!] ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'}`}
                />
              ) : (
                <div className="relative">
                  <select
                    value={attributes[f.key!] ?? ''}
                    onChange={(e)=>onChange(f.key!, e.target.value)}
                    disabled={
                      (f.key === 'model' && !String(attributes['marka'] || '').trim())
                      || (f.key === 'seri' && (!String(attributes['marka'] || '').trim() || !String(attributes['model'] || '').trim()))
                      || (f.key === 'paket' && !String(attributes['seri'] || '').trim())
                    }
                    className={`w-full px-4 py-2.5 border rounded-lg appearance-none bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${errors[f.key!] ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'} disabled:bg-gray-50 disabled:text-gray-400`}
                  >
                    <option value="">Seçiniz</option>
                    {(() => {
                      let opts = f.options ? [...f.options] : [];
                      
                      // Explicitly sort brands if they are not sorted
                      if (f.key === 'marka') {
                         opts.sort((a, b) => {
                             if (a === 'Farketmez') return 1;
                             if (b === 'Farketmez') return -1;
                             return a.localeCompare(b, 'tr');
                         });
                      }

                      if (f.key === 'model' && brand) {
                        opts = models;
                      } else if (f.key === 'seri') {
                        opts = series;
                      } else if (f.key === 'paket') {
                        if (trims.length > 0) {
                          opts = trims;
                        } else {
                           const defaultPaket = (ATTR_SUBSCHEMAS[overrideKeyLocal] || []).find((ff)=> ff.key === 'paket')?.options || [];
                           opts = defaultPaket;
                        }
                      }
                      return opts.map((o) => (
                        <option key={o} value={o}>{o}</option>
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
                     setManualModes(prev => ({ ...prev, [f.key!]: !prev[f.key!] }));
                  }
                }}
                className="text-xs text-cyan-600 mt-1.5 hover:text-cyan-700 hover:underline focus:outline-none flex items-center gap-1"
              >
                {isManual ? <List className="w-3 h-3"/> : <Search className="w-3 h-3"/>}
                {isManual ? 'Listeden seç' : 'Listede yok mu? Elle gir'}
              </button>
              </>
            ) : f.type === 'range-number' ? (
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min={f.min !== undefined ? f.min : "0"}
                  max={f.max}
                  placeholder={f.minLabel || 'En düşük'}
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
                  placeholder={f.maxLabel || 'En yüksek'}
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
                <span className="ml-3 text-gray-700 font-medium select-none">{f.label}</span>
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
               <div className="flex items-center gap-1 mt-1.5 text-red-500 text-xs font-medium">
                 <AlertCircle className="w-3 h-3" />
                 <span>Bu alan zorunludur</span>
               </div>
            )}
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
  <div className="mb-8">
    <div className="flex items-center justify-between relative z-0">
      {/* Connecting Line */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 -z-10 rounded-full" />
      
      {STEPS.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        const Icon = step.icon;
        
        return (
        <div key={step.id} className="flex flex-col items-center bg-white px-2">
          <div 
            className={`
              w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2
              ${isActive ? 'border-cyan-600 bg-cyan-50 text-cyan-600 shadow-lg scale-110' : 
                isCompleted ? 'border-lime-500 bg-lime-50 text-lime-600' : 
                'border-gray-200 bg-white text-gray-300'}
            `}
          >
            {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
          </div>
          <div className="mt-3 text-center hidden sm:block">
            <p className={`text-sm font-bold transition-colors ${isActive ? 'text-cyan-900' : isCompleted ? 'text-lime-700' : 'text-gray-400'}`}>
              {step.title}
            </p>
            <p className="text-xs text-gray-400 mt-0.5 font-medium">{step.description}</p>
          </div>
        </div>
      )})}
    </div>
  </div>
  );
});

const CategorySelection = memo(function CategorySelection({ formData, errors, updateFormData, subcats, categories }: { formData: FormData; errors: Record<string, string>; updateFormData: (field: keyof FormData, value: any) => void; subcats: SubCategory[]; categories: Category[] }) {
  return (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <List className="w-5 h-5 text-cyan-600" />
          Ana Kategori Seçimi
        </h3>
        {errors.category && <span className="text-red-500 text-sm font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.category}</span>}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((cat: any) => (
          <div
            key={cat.slug}
            onClick={() => updateFormData('category', cat.slug)}
            className={`
              group relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
              hover:shadow-md
              ${formData.category === cat.slug 
                ? 'border-cyan-600 bg-cyan-50/50 shadow-sm ring-1 ring-cyan-600/20' 
                : 'border-gray-200 hover:border-cyan-200 hover:bg-gray-50'
              }
            `}
          >
            <div className="flex items-center space-x-4">
              <div className={`
                w-12 h-12 rounded-lg flex items-center justify-center transition-colors
                ${formData.category === cat.slug ? 'bg-cyan-100 text-cyan-600' : 'bg-gray-100 text-gray-500 group-hover:bg-cyan-50 group-hover:text-cyan-500'}
              `}>
                <List className="w-6 h-6" />
              </div>
              <div>
                <h4 className={`font-semibold transition-colors ${formData.category === cat.slug ? 'text-cyan-900' : 'text-gray-900'}`}>{cat.name}</h4>
                <p className="text-sm text-gray-500 mt-0.5">{cat.subcategories.length} alt kategori</p>
              </div>
              {formData.category === cat.slug && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-6 h-6 bg-cyan-600 rounded-full flex items-center justify-center text-white">
                    <Check className="w-4 h-4" />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>

    {subcats.length > 0 && (
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ChevronRight className="w-5 h-5 text-cyan-600" />
            Alt Kategori Seçimi
          </h3>
          {errors.subcategory && <span className="text-red-500 text-sm font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.subcategory}</span>}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {subcats.map((sub: any) => (
            <button
              key={sub.slug}
              type="button"
              onClick={() => updateFormData('subcategory', sub.slug)}
              className={`
                relative px-4 py-3 rounded-lg text-sm font-medium transition-all text-left
                flex items-center justify-between group
                ${formData.subcategory === sub.slug
                  ? 'bg-cyan-600 text-white shadow-md ring-2 ring-cyan-600 ring-offset-2'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <span>{sub.name}</span>
              {formData.subcategory === sub.slug && <Check className="w-4 h-4 text-white" />}
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
  );
});

const DetailsStep = memo(function DetailsStep({ formData, errors, updateFormData }: { formData: FormData; errors: Record<string, string>; updateFormData: (field: keyof FormData, value: any) => void }) {
  return (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 pb-4 border-b border-gray-100 mb-6">
        <FileText className="w-5 h-5 text-cyan-600" />
        <h3 className="text-lg font-semibold text-gray-900">Temel Bilgiler</h3>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ne arıyorsunuz? <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateFormData('title', e.target.value)}
              placeholder="Örn: Temiz iPhone 13 arıyorum, Boyasız 2020 Honda Civic..."
              className={`
                w-full pl-4 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all
                ${errors.title ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'}
              `}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            {errors.title ? (
              <span className="text-red-500 text-xs font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.title}</span>
            ) : (
              <span className="text-gray-400 text-xs">En az 10 karakter</span>
            )}
            <span className={`text-xs ${formData.title.length >= 10 ? 'text-lime-600' : 'text-gray-400'}`}>{formData.title.length}/50</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Aradığınız Ürünü Anlatın <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateFormData('description', e.target.value)}
            rows={5}
            placeholder="Aradığınız ürünün durumunu, rengini, varsa kusurlarını kabul edip etmeyeceğinizi belirtin..."
            className={`
              w-full p-4 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none
              ${errors.description ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'}
            `}
          />
          <div className="flex justify-between mt-1.5">
            {errors.description ? (
              <span className="text-red-500 text-xs font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.description}</span>
            ) : (
              <span className="text-gray-400 text-xs">En az 20 karakter</span>
            )}
            <span className={`text-xs ${formData.description.length >= 20 ? 'text-lime-600' : 'text-gray-400'}`}>{formData.description.length}/500</span>
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
  const selectedProvince = getProvinceByName(formData.city);
  const availableDistricts = selectedProvince ? getDistrictsByProvince(selectedProvince.name) : [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Location Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-4 border-b border-gray-100 mb-6">
          <MapPin className="w-5 h-5 text-cyan-600" />
          <h3 className="text-lg font-semibold text-gray-900">Konum Bilgileri</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">İl <span className="text-red-500">*</span></label>
            {manualModes['city'] ? (
              <input
                type="text"
                value={formData.city}
                onChange={(e) => {
                  updateFormData('city', e.target.value);
                  updateFormData('district', '');
                }}
                placeholder="İl giriniz"
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
              />
            ) : (
              <div className="relative">
                <select
                  value={formData.city}
                  onChange={(e) => {
                    updateFormData('city', e.target.value);
                    updateFormData('district', '');
                  }}
                  className={`w-full px-4 py-2.5 border rounded-lg appearance-none bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">İl Seçiniz</option>
                  {TURKEY_PROVINCES.map((province) => (
                    <option key={province.name} value={province.name}>{province.name}</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3 top-3 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
              </div>
            )}
            <button
              type="button"
              onClick={() => setManualModes(prev => ({ ...prev, city: !prev.city }))}
              className="text-xs text-cyan-600 mt-1.5 hover:underline focus:outline-none flex items-center gap-1"
            >
              {manualModes['city'] ? <List className="w-3 h-3"/> : <Search className="w-3 h-3"/>}
              {manualModes['city'] ? 'Listeden seç' : 'Listede yok mu? Elle gir'}
            </button>
            {errors.city && <span className="text-red-500 text-xs font-medium flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3"/>{errors.city}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">İlçe <span className="text-red-500">*</span></label>
            {manualModes['district'] ? (
              <input
                type="text"
                value={formData.district}
                onChange={(e) => updateFormData('district', e.target.value)}
                placeholder="İlçe giriniz"
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${errors.district ? 'border-red-500' : 'border-gray-300'}`}
              />
            ) : (
              <div className="relative">
                <select
                  value={formData.district}
                  onChange={(e) => updateFormData('district', e.target.value)}
                  disabled={!formData.city && !manualModes['city']}
                  className={`
                    w-full px-4 py-2.5 border rounded-lg appearance-none bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all
                    ${errors.district ? 'border-red-500' : 'border-gray-300'}
                    ${(!formData.city && !manualModes['city']) ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}
                  `}
                >
                  <option value="">İlçe Seçiniz</option>
                  {availableDistricts.map((district) => (
                    <option key={district.id} value={district.name}>{district.name}</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3 top-3 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
              </div>
            )}
            <button
              type="button"
              onClick={() => setManualModes(prev => ({ ...prev, district: !prev.district }))}
              className="text-xs text-cyan-600 mt-1.5 hover:underline focus:outline-none flex items-center gap-1"
            >
              {manualModes['district'] ? <List className="w-3 h-3"/> : <Search className="w-3 h-3"/>}
              {manualModes['district'] ? 'Listeden seç' : 'Listede yok mu? Elle gir'}
            </button>
            {errors.district && <span className="text-red-500 text-xs font-medium flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3"/>{errors.district}</span>}
          </div>
        </div>
      </div>

      {/* Budget Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-4 border-b border-gray-100 mb-6">
          <TrendingUp className="w-5 h-5 text-cyan-600" />
          <h3 className="text-lg font-semibold text-gray-900">Bütçe Planlaması</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ayırdığınız Bütçe (TL) <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">EN DÜŞÜK BÜTÇE</span>
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
                className={`w-full pl-40 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${errors.minBudget ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="0"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">EN YÜKSEK BÜTÇE</span>
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
                className={`w-full pl-40 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${errors.budget ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="0"
              />
            </div>
          </div>
          {(errors.minBudget || errors.budget) && (
            <span className="text-red-500 text-xs font-medium flex items-center gap-1 mt-2"><AlertCircle className="w-3 h-3"/>{errors.minBudget || errors.budget}</span>
          )}
          <p className="mt-2 text-xs text-gray-500">Satıcılar bu bütçeye göre size teklif verecektir.</p>
        </div>
      </div>

      <div className="bg-cyan-50 border border-cyan-100 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-cyan-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-cyan-900">Önemli Bilgilendirme</h3>
            <p className="mt-1 text-sm text-cyan-700">
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
  const selectedSubcategory = selectedCategory?.subcategories.find((s: any) => s.slug === formData.subcategory);
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-500" />
            Talep Özeti
          </h3>
          <span className="px-3 py-1 bg-cyan-100 text-cyan-700 text-xs font-medium rounded-full">Taslak</span>
        </div>
        
        <div className="p-6 space-y-4">
          {formData.images && formData.images.length > 0 && (
            <div className="flex justify-center mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div className="relative h-32 w-full">
                <Image 
                  src={formData.images[0]} 
                  alt="Referans Görsel" 
                  fill
                  className="object-contain mix-blend-multiply" 
                />
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Başlık</span>
                <p className="text-gray-900 font-medium mt-0.5">{formData.title || 'Belirtilmemiş'}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</span>
                <p className="text-gray-900 font-medium mt-0.5">{selectedCategory?.name} / {selectedSubcategory?.name}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Konum</span>
                <p className="text-gray-900 font-medium mt-0.5 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {formData.city}, {formData.district}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Hedef Bütçe</span>
                <p className="text-cyan-600 font-bold mt-0.5 text-lg">
                  {formData.minBudget || formData.budget
                    ? `${formData.minBudget ? `${formData.minBudget} TL` : '0'} – ${formData.budget ? `${formData.budget} TL` : '∞'}`
                    : 'Belirtilmemiş'}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Açıklama</span>
            <p className="text-gray-700 mt-1.5 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
              {formData.description || 'Açıklama girilmemiş'}
            </p>
          </div>
        </div>
      </div>

      {(entries.length > 0 || Object.keys(pairs).length > 0) && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <List className="w-4 h-4 text-gray-500" />
            Teknik Özellikler
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
            {Object.entries(pairs).map(([base, v]) => (
              (v.min || v.max) ? (
                <div key={base} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-gray-600 text-sm">{label(base)}</span>
                  <span className="font-medium text-gray-900 text-sm">{v.min ?? '—'}{(v.min || v.max) ? ' – ' : ''}{v.max ?? '—'}</span>
                </div>
              ) : null
            ))}
            {entries.map(([k, v]) => (
              v !== undefined && v !== '' ? (
                <div key={k} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-gray-600 text-sm">{label(k)}</span>
                  <span className="font-medium text-gray-900 text-sm text-right">{String(v)}</span>
                </div>
              ) : null
            ))}
          </div>
        </div>
      )}

      <div className="bg-lime-50 border border-lime-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-lime-100 rounded-full">
            <CheckCircle className="w-6 h-6 text-lime-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-lime-900">Her Şey Hazır!</h3>
            <p className="mt-1 text-sm text-lime-700">
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
    minBudget: "",
    budget: "",
    images: [],
    attributes: {},
  });

  const subcats = useMemo(() => categories.find((c) => c.slug === formData.category)?.subcategories ?? [], [formData.category, categories]);

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
            minBudget: attrs.minPrice ? String(attrs.minPrice) : '',
            budget: attrs.maxPrice ? String(attrs.maxPrice) : (data.price ? String(data.price) : ''),
            images: data.images || [],
            attributes: attrs
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
    if (!formData.category && categories.length) {
      setFormData(prev => ({ ...prev, category: defaultCategory || categories[0].slug }));
    }
  }, [categories, defaultCategory, formData.category]);

  useEffect(() => {
    const valid = subcats.some((s: SubCategory) => s.slug === formData.subcategory);
    if (!valid) {
      const newValue = subcats[0]?.slug ?? "";
      if (formData.subcategory !== newValue) {
        setFormData(prev => ({ ...prev, subcategory: newValue }));
      }
    }

    // Generic default image logic
    if (formData.subcategory) {
      setFormData(prev => {
        const defaultPath = `/images/defaults/${formData.subcategory}.webp`;
        
        // Case 1: No images -> Set default
        if (prev.images.length === 0) {
          return { ...prev, images: [defaultPath] };
        }
        
        // Case 2: Has images, check if it's a default image (starts with /images/defaults/)
        // If so, update it to the new subcategory's default
        const firstImage = prev.images[0];
        if (firstImage.startsWith('/images/defaults/') && firstImage !== defaultPath) {
           return { ...prev, images: [defaultPath, ...prev.images.slice(1)] };
        }
        
        return prev;
      });
    }
  }, [formData.category, formData.subcategory, subcats]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorSummary, setErrorSummary] = useState<string[]>([]);

  const buildAttributeFields = useCallback((): AttrField[] => {
    const currentCategory = categories.find((c: any) => c.slug === formData.category);
    const dynamic = currentCategory?.attributes || [];
    if (Array.isArray(dynamic) && dynamic.length > 0) {
      const withScope = dynamic.filter((attr: any) => {
        if (!attr.subCategoryId) return true;
        if (!attr.subCategory) return false;
        if (!formData.subcategory) return false;
        return attr.subCategory.slug === formData.subcategory;
      });
      const source = withScope.length > 0 ? withScope : dynamic.filter((attr: any) => !attr.subCategoryId);
      if (source.length > 0) {
        return source.map((attr: any) => {
          let options: string[] = [];
          try {
            if (attr.optionsJson) {
              options = JSON.parse(attr.optionsJson);
            }
          } catch (e) {}
          return {
            key: attr.slug,
            label: attr.name,
            type: attr.type === "checkbox" ? "boolean" : attr.type,
            required: attr.required,
            options: options.length ? options : undefined,
            minKey: attr.type === 'range-number' ? `${attr.slug || attr.id}Min` : undefined,
            maxKey: attr.type === 'range-number' ? `${attr.slug || attr.id}Max` : undefined,
          } as AttrField;
        });
      }
    }

    // Fallback logic
    const overrideKey = `${formData.category}/${formData.subcategory || ''}`;
    if (ATTR_SUBSCHEMAS[overrideKey]) {
       return ATTR_SUBSCHEMAS[overrideKey];
    }
    if (ATTR_SCHEMAS[formData.category]) {
       return ATTR_SCHEMAS[formData.category];
    }
    
    return [];
  }, [categories, formData.category, formData.subcategory]);

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.category) newErrors.category = 'Kategori seçmelisiniz';
      if (!formData.subcategory) newErrors.subcategory = 'Alt kategori seçmelisiniz';
    }

    if (step === 2) {
      if (!formData.title.trim()) newErrors.title = 'Başlık girmelisiniz';
      if (formData.title.trim().length < 10) newErrors.title = 'Başlık en az 10 karakter olmalı';
      if (!formData.description.trim()) newErrors.description = 'Açıklama girmelisiniz';
      if (formData.description.trim().length < 20) newErrors.description = 'Açıklama en az 20 karakter olmalı';

      const combined = buildAttributeFields();
      const fieldMap = new Map<string, AttrField>();
      combined.forEach((f) => {
        const id = f.key ? `k:${f.key}` : (f.minKey && f.maxKey) ? `r:${f.minKey}:${f.maxKey}` : `l:${f.label}`;
        fieldMap.set(id, f);
      });
      const attrs = formData.attributes || {};
      fieldMap.forEach((f) => {
        if (f.type === 'range-number' && f.minKey && f.maxKey) {
          const a = attrs[f.minKey];
          const b = attrs[f.maxKey];
          if (f.required) {
             // Range-number alanlar için en az bir değer (min veya max) girilmiş olmalı
             const hasA = a !== undefined && String(a) !== '';
             const hasB = b !== undefined && String(b) !== '';
             if (!hasA && !hasB) {
               newErrors[f.minKey] = 'Zorunlu';
               newErrors[f.maxKey] = 'Zorunlu';
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
             // Eğer hem min hem max değerleri girilmişse, min <= max olmalı
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
            const present = f.type === 'boolean' ? (f.key in attrs) : (v !== undefined && String(v).trim() !== '');
            if (!present) newErrors[f.key] = 'Zorunlu';
          }
          if (f.type === 'number' && (f.min !== undefined || f.max !== undefined) && v !== undefined && String(v).trim() !== '') {
             const val = Number(v);
             if (f.min !== undefined && val < f.min) newErrors[f.key] = `En az ${f.min}`;
             if (f.max !== undefined && val > f.max) newErrors[f.key] = `En çok ${f.max}`;
          }
        }
      });
    }

  if (step === 3) {
    if (!formData.city.trim()) newErrors.city = 'Şehir girmelisiniz';
    if (!formData.district.trim()) newErrors.district = 'İlçe girmelisiniz';
    if (!formData.minBudget) newErrors.minBudget = 'Minimum tutar gerekli';
    else if (parseInt(formData.minBudget) < 0) newErrors.minBudget = 'Geçerli bir minimum tutar giriniz';
    if (!formData.budget) newErrors.budget = 'Maksimum tutar gerekli';
    else if (parseInt(formData.budget) < 1) newErrors.budget = 'Geçerli bir maksimum tutar giriniz';
    if (formData.minBudget && formData.budget) {
      const a = parseInt(formData.minBudget);
      const b = parseInt(formData.budget);
      if (!Number.isNaN(a) && !Number.isNaN(b) && a > b) {
        newErrors.minBudget = 'En düşük, En yüksek’ten büyük olamaz';
        newErrors.budget = 'En yüksek, En düşük’ten küçük olamaz';
      }
    }
  }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const validateAll = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.category) newErrors.category = 'Kategori seçmelisiniz';
    if (!formData.subcategory) newErrors.subcategory = 'Alt kategori seçmelisiniz';
    if (!formData.title.trim()) newErrors.title = 'Başlık girmelisiniz';
    else if (formData.title.trim().length < 10) newErrors.title = 'Başlık en az 10 karakter olmalı';
    if (!formData.description.trim()) newErrors.description = 'Açıklama girmelisiniz';
    else if (formData.description.trim().length < 20) newErrors.description = 'Açıklama en az 20 karakter olmalı';
    if (!formData.city.trim()) newErrors.city = 'Şehir girmelisiniz';
    if (!formData.district.trim()) newErrors.district = 'İlçe girmelisiniz';
    if (!formData.minBudget) newErrors.minBudget = 'Minimum tutar gerekli';
    else if (parseInt(formData.minBudget) < 0) newErrors.minBudget = 'Geçerli bir minimum tutar giriniz';
    if (!formData.budget) newErrors.budget = 'Maksimum tutar gerekli';
    else if (parseInt(formData.budget) < 1) newErrors.budget = 'Geçerli bir maksimum tutar giriniz';
    if (formData.minBudget && formData.budget) {
      const a = parseInt(formData.minBudget);
      const b = parseInt(formData.budget);
      if (!Number.isNaN(a) && !Number.isNaN(b) && a > b) {
        newErrors.minBudget = 'En düşük, En yüksek’ten büyük olamaz';
        newErrors.budget = 'En yüksek, En düşük’ten küçük olamaz';
      }
    }
    const combined = buildAttributeFields();
    const fieldMap = new Map<string, AttrField>();
    combined.forEach((f) => {
      const id = f.key ? `k:${f.key}` : (f.minKey && f.maxKey) ? `r:${f.minKey}:${f.maxKey}` : `l:${f.label}`;
      fieldMap.set(id, f);
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
              newErrors[f.minKey] = 'Zorunlu';
              newErrors[f.maxKey] = 'Zorunlu';
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
    const labels: Record<string,string> = { category:'Kategori', subcategory:'Alt kategori', title:'Başlık', description:'Açıklama', city:'İl', district:'İlçe', budget:'Bütçe' };
    const labelMap = new Map<string, string>();
    combined.forEach((f: AttrField) => {
      if (f.key) labelMap.set(f.key, f.label);
      if (f.minKey) labelMap.set(f.minKey, f.label);
      if (f.maxKey) labelMap.set(f.maxKey, f.label);
    });
    setErrorSummary(items.map(k => labels[k] || labelMap.get(k) || k));
    return items.length === 0;
  }, [formData]);

  const updateFormData = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Hata temizleme
    if (errors[field as string]) {
      setErrors(prev => { const n = { ...prev }; delete n[field as string]; return n; });
    }
  }, [errors]);

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
    if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
    if (key === 'marka') setErrors(prev => { const n = { ...prev }; delete n.model; delete n.seri; delete n.paket; return n; });
    if (key === 'model') setErrors(prev => { const n = { ...prev }; delete n.seri; delete n.paket; return n; });
    if (key === 'seri') setErrors(prev => { const n = { ...prev }; delete n.paket; return n; });
  }, [errors]);

  const nextStep = useCallback(() => {
    if (validateStep(currentStep) && currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [validateStep, currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  const handleAdCreate = useCallback(async () => {
    const ok = validateAll();
    if (!ok) {
      toast({ title: 'Eksik alanlar', description: `${errorSummary.join(', ')}`, variant: 'destructive' });
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
          },
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
  }, [formData, validateAll, errorSummary, editId, categories, router]);

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
        return <CategorySelection formData={formData} errors={errors} updateFormData={updateFormData} subcats={subcats} categories={categories} />;
      case 2:
        const currentCategory = categories.find((c: any) => c.slug === formData.category);
        return (
          <>
            <DetailsStep formData={formData} errors={errors} updateFormData={updateFormData} />
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <CategoryAttributes
                category={formData.category}
                subcategory={formData.subcategory}
                attributes={formData.attributes}
                errors={errors}
                onChange={handleAttributeChange}
                dynamicAttributes={currentCategory?.attributes}
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{editId ? 'Talebi Düzenle' : 'Yeni Talep Oluştur'}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {editId ? 'Talep detaylarınızı güncelleyerek daha iyi teklifler alın' : 'İhtiyacınızı detaylandırın, satıcılar size en uygun teklifleri sunsun'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-8">
            {errorSummary.length > 0 && (
              <div className="mb-6 bg-red-50 border border-red-100 text-red-700 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Lütfen aşağıdaki alanları kontrol ediniz:</h4>
                  <p className="text-sm mt-1 opacity-90">{errorSummary.join(', ')}</p>
                </div>
              </div>
            )}
            
            <StepIndicator currentStep={currentStep} />

            <form onSubmit={handleSubmit} className="mt-8">
              {renderStep()}
              
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
                    ${currentStep === 1 
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <ChevronLeft className="w-5 h-5" />
                  Geri
                </button>

                {currentStep < STEPS.length ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2 px-8 py-3 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-200 hover:shadow-cyan-300 transform hover:-translate-y-0.5"
                  >
                    Devam Et
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAdCreate}
                    className="flex items-center gap-2 px-8 py-3 bg-lime-600 text-white rounded-xl font-medium hover:bg-lime-700 transition-all shadow-lg shadow-lime-200 hover:shadow-lime-300 transform hover:-translate-y-0.5"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {editId ? 'İlanı Güncelle' : 'İlanı Yayınla'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="mt-8 text-center flex items-center justify-center gap-2 text-gray-400 text-sm">
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
