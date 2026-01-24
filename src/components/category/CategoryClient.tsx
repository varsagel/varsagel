"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import TalepCard from '@/components/home/TalepCardOptimized';
import { CATEGORIES, SubCategory } from '@/data/categories';
import { TURKEY_PROVINCES } from '@/data/turkey-locations';
import { AttrField } from '@/data/attribute-schemas';
import { BellRing, Check, Loader2, ChevronDown, ChevronUp, ChevronLeft } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from '@/components/ui/use-toast';
import { SavedSearchModal } from '@/components/talep/SavedSearchModal';
import { titleCaseTR } from '@/lib/title-case-tr';

const findSubcategoryByPath = (categories: SubCategory[], path: string[]): SubCategory | undefined => {
  let currentCategories = categories;
  let found: SubCategory | undefined = undefined;

  for (const slug of path) {
    const normalizedSlug = decodeURIComponent(slug).trim();
    found = currentCategories.find(c => c.slug === normalizedSlug);
    
    // Fallback: Try case-insensitive match
    if (!found) {
       found = currentCategories.find(c => c.slug.toLowerCase() === normalizedSlug.toLowerCase());
    }

    if (!found) return undefined;
    
    if (found.subcategories) {
      currentCategories = found.subcategories;
    } else {
      currentCategories = [];
    }
  }
  return found;
};

interface Talep {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  location: {
    city: string;
    district: string;
  };
  images: string[];
  buyer: {
    name: string;
    rating: number;
  };
  createdAt: string;
  status: "active" | "pending" | "sold";
  viewCount: number;
  isFavorited: boolean;
  attributes?: Record<string, string | number | boolean | string[]>;
}

type FilterAttrs = Record<string, string | number | (string | number)[]>;

const FilterSelect = ({ 
  label, 
  value, 
  onChange, 
  options, 
  disabled = false, 
  className,
  placeholder = "Tümü"
}: {
  label: string;
  value: string | number | (string | number)[];
  onChange: (val: string) => void;
  options: (string | { value: string | number, label: string })[];
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}) => (
  <div>
    <label className="block text-sm font-bold text-gray-800 mb-2">{titleCaseTR(label)}</label>
    <select 
      value={Array.isArray(value) ? (value[0] || '') : value} 
      onChange={(e) => onChange(e.target.value)} 
      disabled={disabled}
      className={`w-full rounded-xl px-4 py-3 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${disabled ? 'bg-gray-100 border-2 border-gray-200 text-gray-500' : 'bg-white border-2 border-gray-300 text-gray-900 hover:border-cyan-400 shadow-sm'} ${className || ''}`}
    >
      <option value="" className="text-gray-900">{placeholder}</option>
      {options.map((o) => {
        const val = typeof o === 'object' ? o.value : o;
        const lbl = typeof o === 'object' ? o.label : o;
        return <option key={val} value={val} className="text-gray-900">{titleCaseTR(String(lbl))}</option>;
      })}
    </select>
  </div>
);

const FilterInput = ({ 
  label, 
  value, 
  onChange, 
  type = 'text', 
  placeholder, 
  className 
}: {
  label: string;
  value: string | number;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
}) => (
  <div>
    <label className="block text-sm font-bold text-gray-800 mb-2">{titleCaseTR(label)}</label>
    <input 
      type={type} 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      placeholder={placeholder}
      className={`w-full rounded-xl px-4 py-3 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white border-2 border-gray-300 text-gray-900 hover:border-cyan-400 shadow-sm ${className || ''}`}
    />
  </div>
);

const FilterRange = ({ 
  label, 
  minValue, 
  maxValue, 
  onMinChange, 
  onMaxChange, 
  type = 'number', 
  className,
  minPlaceholder = "En az",
  maxPlaceholder = "En çok"
}: {
  label: string;
  minValue: string | number;
  maxValue: string | number;
  onMinChange: (val: string) => void;
  onMaxChange: (val: string) => void;
  type?: string;
  className?: string;
  minPlaceholder?: string;
  maxPlaceholder?: string;
}) => (
  <div>
    <label className="block text-sm font-bold text-gray-800 mb-2">{titleCaseTR(label)}</label>
    <div className="grid grid-cols-2 gap-3">
      <input 
        type={type} 
        min={type === 'number' ? "0" : undefined}
        value={minValue} 
        onChange={(e) => {
          const val = e.target.value;
          if (type !== 'number' || val === '' || Number(val) >= 0) {
            onMinChange(val);
          }
        }} 
        placeholder={minPlaceholder}
        className={`w-full rounded-xl px-4 py-3 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white border-2 border-gray-300 text-gray-900 hover:border-cyan-400 shadow-sm ${className || ''}`}
      />
      <input 
        type={type} 
        min={type === 'number' ? "0" : undefined}
        value={maxValue} 
        onChange={(e) => {
          const val = e.target.value;
          if (type !== 'number' || val === '' || Number(val) >= 0) {
            onMaxChange(val);
          }
        }} 
        placeholder={maxPlaceholder}
        className={`w-full rounded-xl px-4 py-3 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white border-2 border-gray-300 text-gray-900 hover:border-cyan-400 shadow-sm ${className || ''}`}
      />
    </div>
  </div>
);

const MultiSelect = ({ 
  label, 
  value, 
  onChange, 
  options, 
  disabled = false, 
  className,
  placeholder = "Seçiniz"
}: {
  label: string;
  value: string | string[];
  onChange: (val: string[]) => void;
  options: (string | { value: string | number, label: string })[];
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = React.useMemo(
    () => (Array.isArray(value) ? value : (value ? [String(value)] : [])),
    [value]
  );
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const optionLabelForValue = React.useMemo(() => {
    const map = new Map<string, string>();
    options.forEach((o) => {
      const v = String(typeof o === 'object' ? o.value : o);
      const lbl = String(typeof o === 'object' ? o.label : o);
      map.set(v, titleCaseTR(lbl));
    });
    return map;
  }, [options]);

  const selectedText = React.useMemo(() => {
    if (selected.length === 0) return placeholder;
    const labels = selected.map((v) => optionLabelForValue.get(String(v)) || titleCaseTR(String(v)));
    if (labels.length <= 2) return labels.join(', ');
    return `${labels.slice(0, 2).join(', ')} +${labels.length - 2}`;
  }, [selected, optionLabelForValue, placeholder]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-bold text-gray-800 mb-2">{titleCaseTR(label)}</label>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full rounded-xl px-4 py-3 font-medium transition-all duration-200 bg-white border-2 border-gray-300 text-gray-900 shadow-sm flex items-center justify-between cursor-pointer ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'hover:border-cyan-400'} ${className || ''}`}
      >
        <span className="truncate">
          {selectedText}
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </div>
      
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full bg-white border-2 border-gray-100 rounded-xl mt-2 shadow-xl max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2">
          {options.length === 0 ? (
            <div className="p-3 text-gray-500 text-center text-sm">Seçenek yok</div>
          ) : (
            options.map((o) => {
              const val = String(typeof o === 'object' ? o.value : o);
              const lbl = typeof o === 'object' ? o.label : o;
              const isSelected = selected.includes(val);
              
              return (
                <div 
                  key={val} 
                  className={`px-4 py-3 hover:bg-cyan-50 cursor-pointer flex items-center gap-3 transition-colors ${isSelected ? 'bg-cyan-50/50' : ''}`}
                  onClick={() => {
                    const newValue = isSelected 
                      ? selected.filter(s => s !== val)
                      : [...selected, val];
                    onChange(newValue);
                    setIsOpen(false);
                  }}
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-cyan-500 border-cyan-500' : 'border-gray-300'}`}>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className={`text-sm ${isSelected ? 'font-semibold text-cyan-900' : 'text-gray-700'}`}>{lbl}</span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

const getSingleValue = (val: string | number | (string | number)[] | undefined): string | number => {
  if (Array.isArray(val)) {
    return val.length > 0 ? val[0] : '';
  }
  return val === undefined || val === null ? '' : val;
};

const getArrayValue = (val: string | number | (string | number)[] | undefined): string[] => {
  if (Array.isArray(val)) {
    return val.map(v => v.toString());
  }
  return val !== undefined && val !== null && val !== '' ? [val.toString()] : [];
};

export default function CategoryClient() {
  const params = useParams();
  const router = useRouter();
  const sp = useSearchParams();
  const categorySlug = params.category as string;
  const subcategorySlugParam = params.subcategory;
  
  const rawSlugParts = Array.isArray(subcategorySlugParam) 
    ? subcategorySlugParam 
    : (subcategorySlugParam ? [subcategorySlugParam as string] : []);
  
  // Explicitly decode all parts to handle URL encoding issues
  const slugParts = rawSlugParts.map(part => decodeURIComponent(part));

  const category = CATEGORIES.find(cat => cat.slug === categorySlug);
  
  useEffect(() => {
    if (!categorySlug) return;
    if (slugParts.length > 0) return;
    const first = category?.subcategories?.[0];
    if (!first) return;
    const target = first.fullSlug || first.slug;
    if (!target) return;
    const qs = sp.toString();
    router.replace(qs ? `/kategori/${categorySlug}/${target}?${qs}` : `/kategori/${categorySlug}/${target}`);
  }, [categorySlug, slugParts.length, category, router, sp]);
  
  // Resolve using full path to ensure correct hierarchy traversal
  const subcategory = slugParts.length > 0 
    ? findSubcategoryByPath(category?.subcategories || [], slugParts)
    : undefined;

  const subcategorySlug = subcategory?.slug || (slugParts.length > 0 ? slugParts[slugParts.length - 1] : undefined);
  const subcategoryFilter = subcategory?.fullSlug || subcategorySlug;

  // Parent subcategory is the one corresponding to path minus last segment
  const parentSubcategory = slugParts.length > 1
    ? findSubcategoryByPath(category?.subcategories || [], slugParts.slice(0, -1))
    : undefined;

  // Base path for link generation
  const basePath = React.useMemo(() => {
     // If we have children, we append to current path
     if (subcategory?.subcategories && subcategory.subcategories.length > 0) {
         return `/kategori/${categorySlug}/${slugParts.join('/')}`;
     }
     // If no children (leaf), we are showing siblings, so we replace last segment (i.e. use parent path)
     if (slugParts.length > 0) {
         const parentPath = slugParts.slice(0, -1).join('/');
         return parentPath ? `/kategori/${categorySlug}/${parentPath}` : `/kategori/${categorySlug}`;
     }
     // Root level
     return `/kategori/${categorySlug}`;
  }, [categorySlug, slugParts, subcategory]);

  const overrideKey = subcategory?.fullSlug 
    ? `${categorySlug}/${subcategory.fullSlug}` 
    : (subcategorySlug ? `${categorySlug}/${subcategorySlug}` : categorySlug);

  const prevOverrideKeyRef = React.useRef<string | null>(null);
  useEffect(() => {
    const prev = prevOverrideKeyRef.current;
    prevOverrideKeyRef.current = overrideKey;
    if (!prev || prev === overrideKey) return;
    setFilterAttrs((curr) => {
      const next = { ...(curr || {}) } as FilterAttrs;
      delete (next as any)['marka'];
      delete (next as any)['model'];
      delete (next as any)['seri'];
      delete (next as any)['paket'];
      return next;
    });
    setModelOptions([]);
    setSeriesOptions([]);
    setTrimOptions([]);
    setEquipmentOptions([]);
  }, [overrideKey]);

  const [listings, setListings] = useState<Talep[]>([]);
  const [filteredListings, setFilteredListings] = useState<Talep[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  // Common Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [selectedCity, setSelectedCity] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Dynamic Filters
  const [filterAttrs, setFilterAttrs] = useState<FilterAttrs>({});
  const [isSubcategoriesOpen, setIsSubcategoriesOpen] = useState(false);
  const [dynamicCategory, setDynamicCategory] = useState<any>(null);
  const [dynamicAttributes, setDynamicAttributes] = useState<any[]>([]);
  const filterBrand = filterAttrs['marka'];
  const filterModel = filterAttrs['model'];
  const filterSeries = filterAttrs['seri'];
  const filterTrim = filterAttrs['paket'];

  // Dynamic Options State
  const [brandOptions, setBrandOptions] = useState<string[]>([]);
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [seriesOptions, setSeriesOptions] = useState<string[]>([]);
  const [trimOptions, setTrimOptions] = useState<string[]>([]);
  const [equipmentOptions, setEquipmentOptions] = useState<string[]>([]);

  const subcategoriesToRender = React.useMemo(() => {
     if (subcategory?.subcategories && subcategory.subcategories.length > 0) return subcategory.subcategories;
     if (parentSubcategory?.subcategories) return parentSubcategory.subcategories;
     // Prefer static structure from JSON (category) over dynamic (DB) to ensure correct hierarchy with short slugs
     const toRender = category?.subcategories || dynamicCategory?.subcategories || [];
     return toRender;
  }, [subcategory, parentSubcategory, dynamicCategory, category]);

  const listParent = React.useMemo(() => {
     if (subcategory?.subcategories && subcategory.subcategories.length > 0) return subcategory;
     if (parentSubcategory) return parentSubcategory;
     return category;
  }, [subcategory, parentSubcategory, category]);

  const listParentPathParts = React.useMemo(() => {
    if (slugParts.length === 0) return [];
    if (subcategory?.subcategories && subcategory.subcategories.length > 0) return slugParts;
    if (parentSubcategory) return slugParts.slice(0, -1);
    return [];
  }, [slugParts, subcategory, parentSubcategory]);

  const upHref = React.useMemo(() => {
    if (listParentPathParts.length === 0) return `/kategori/${categorySlug}`;
    const upParts = listParentPathParts.slice(0, -1);
    return upParts.length > 0 ? `/kategori/${categorySlug}/${upParts.join('/')}` : `/kategori/${categorySlug}`;
  }, [categorySlug, listParentPathParts]);

  useEffect(() => {
    const brand = filterBrand;
    if (!brand || (Array.isArray(brand) && brand.length === 0)) {
      setModelOptions([]);
      return;
    }
    
    const params = new URLSearchParams();
    params.set('type', 'models');
    params.set('category', overrideKey);
    const brands = Array.isArray(brand) ? brand : [brand];
    brands.forEach(b => params.append('brand', String(b)));
    
    fetch(`/api/vehicle-data?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
         if (Array.isArray(data)) setModelOptions(data);
         else setModelOptions([]);
      })
      .catch(() => setModelOptions([]));
  }, [filterBrand, overrideKey]);

  useEffect(() => {
    const brand = filterBrand;
    const model = filterModel;
    if (!brand || !model || (Array.isArray(brand) && brand.length === 0) || (Array.isArray(model) && model.length === 0)) {
      setSeriesOptions([]);
      return;
    }

    const params = new URLSearchParams();
    params.set('type', 'series');
    params.set('category', overrideKey);
    const brands = Array.isArray(brand) ? brand : [brand];
    brands.forEach(b => params.append('brand', String(b)));
    const models = Array.isArray(model) ? model : [model];
    models.forEach(m => params.append('model', String(m)));

    fetch(`/api/vehicle-data?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
         if (Array.isArray(data)) setSeriesOptions(data);
         else setSeriesOptions([]);
      })
      .catch(() => setSeriesOptions([]));
  }, [filterBrand, filterModel, overrideKey]);

  useEffect(() => {
    const brand = filterBrand;
    const model = filterModel;
    const series = filterSeries;
    if (!brand || !model || !series || (Array.isArray(series) && series.length === 0)) {
      setTrimOptions([]);
      return;
    }

    const params = new URLSearchParams();
    params.set('type', 'trims');
    params.set('category', overrideKey);
    const brands = Array.isArray(brand) ? brand : [brand];
    brands.forEach(b => params.append('brand', String(b)));
    const models = Array.isArray(model) ? model : [model];
    models.forEach(m => params.append('model', String(m)));
    const seriess = Array.isArray(series) ? series : [series];
    seriess.forEach(s => params.append('series', String(s)));

    fetch(`/api/vehicle-data?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
         if (Array.isArray(data)) setTrimOptions(data);
         else setTrimOptions([]);
      })
      .catch(() => setTrimOptions([]));
  }, [filterBrand, filterModel, filterSeries, overrideKey]);

  useEffect(() => {
    const brand = filterBrand;
    const model = filterModel;
    const series = filterSeries;
    const trim = filterTrim;
    if (!brand || !model || !series || !trim || (Array.isArray(trim) && trim.length === 0)) {
      setEquipmentOptions([]);
      return;
    }

    const params = new URLSearchParams();
    params.set('type', 'equipments');
    params.set('category', overrideKey);
    const brands = Array.isArray(brand) ? brand : [brand];
    brands.forEach(b => params.append('brand', String(b)));
    const models = Array.isArray(model) ? model : [model];
    models.forEach(m => params.append('model', String(m)));
    const seriess = Array.isArray(series) ? series : [series];
    seriess.forEach(s => params.append('series', String(s)));
    const trims = Array.isArray(trim) ? trim : [trim];
    trims.forEach(t => params.append('trim', String(t)));

    fetch(`/api/vehicle-data?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setEquipmentOptions(data);
        else setEquipmentOptions([]);
      })
      .catch(() => setEquipmentOptions([]));
  }, [filterBrand, filterModel, filterSeries, filterTrim, overrideKey]);


  useEffect(() => {
    if (categorySlug) {
      fetch(`/api/categories/${categorySlug}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setDynamicCategory(data);
          }
        })
        .catch(err => console.error('Error fetching category attributes:', err));
    }
  }, [categorySlug]);

  useEffect(() => {
    if (!categorySlug) {
      setDynamicAttributes([]);
      return;
    }
    const query = new URLSearchParams();
    const sub = subcategory?.fullSlug || subcategorySlug || '';
    if (sub) query.set('subcategory', sub);
    const url = query.toString()
      ? `/api/categories/${categorySlug}/attributes?${query.toString()}`
      : `/api/categories/${categorySlug}/attributes`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDynamicAttributes(data);
        else setDynamicAttributes([]);
      })
      .catch(() => setDynamicAttributes([]));
  }, [categorySlug, subcategory?.fullSlug, subcategorySlug]);
  
  useEffect(() => {
    setFavorites(new Set(listings.filter(l => l.isFavorited).map(l => l.id)));
  }, [listings]);

  const combinedSchema = React.useMemo<AttrField[]>(() => {
    const isReservedField = (field: AttrField) => {
      if (field.key === 'minPrice' || field.key === 'maxPrice') return true;
      if (field.key === 'minBudget' || field.key === 'budget') return true;
      if (field.type !== 'range-number') return false;
      if (field.minKey === 'minPrice' && field.maxKey === 'maxPrice') return true;
      if (field.minKey === 'minBudget' && field.maxKey === 'budget') return true;
      const minBase = field.minKey?.endsWith('Min') ? field.minKey.slice(0, -3) : null;
      const maxBase = field.maxKey?.endsWith('Max') ? field.maxKey.slice(0, -3) : null;
      const base = minBase && maxBase && minBase === maxBase ? minBase : null;
      if (base === 'minPrice' || base === 'minBudget') return true;
      return false;
    };

    const stableFieldId = (field: AttrField) => {
      if (field.key) return `k:${field.key}`;
      if (field.type === 'range-number' && field.minKey && field.maxKey) {
        const min = field.minKey;
        const max = field.maxKey;
        const minBase = min.endsWith('Min') ? min.slice(0, -3) : null;
        const maxBase = max.endsWith('Max') ? max.slice(0, -3) : null;
        if (minBase && maxBase && minBase === maxBase) return `r:${minBase}`;
        return `r:${min}:${max}`;
      }
      return `l:${field.label}`;
    };

    // If we have dynamic category data, use it
    const map = new Map<string, AttrField>();

    const fromApi = Array.isArray(dynamicAttributes) && dynamicAttributes.length > 0;
    const directAttrs = fromApi ? dynamicAttributes : (dynamicCategory?.attributes || []);

    if (directAttrs && directAttrs.length > 0) {
        const subCat = subcategorySlug
          ? (dynamicCategory?.subcategories || []).find((s: any) => s.slug === subcategorySlug)
          : null;

        const relevantAttrs = fromApi
          ? directAttrs.filter((attr: any) => attr?.showInRequest !== false)
          : directAttrs.filter((attr: any) => {
              if (attr?.showInRequest === false) return false;
              if (!attr.subCategoryId) return true;
              if (subCat && attr.subCategoryId === subCat.id) return true;
              return false;
            });

        if (relevantAttrs.length > 0) {
            const orderedAttrs = [...relevantAttrs].sort((a: any, b: any) => {
              const aSpecific = a?.subCategoryId ? 1 : 0;
              const bSpecific = b?.subCategoryId ? 1 : 0;
              return aSpecific - bSpecific;
            });
            
            orderedAttrs.forEach((attr: any) => {
                let normalizedType = attr.type === 'checkbox' ? 'boolean' : attr.type;
                
                // Force multiselect for EMLAK/VASITA attributes that are select or specific keys
                if ((overrideKey.startsWith('vasita') || overrideKey.startsWith('emlak')) && 
                    (normalizedType === 'select' || ['marka', 'model', 'seri', 'paket'].includes(attr.slug))) {
                    normalizedType = 'multiselect';
                }

                const isRange = normalizedType === 'number' || normalizedType === 'range-number';
                let options: string[] = [];
                if (attr.optionsJson) {
                    try {
                        const parsed = JSON.parse(attr.optionsJson);
                        options = Array.isArray(parsed) ? parsed : [];
                    } catch {
                        options = [];
                    }
                }

                const field: AttrField = {
                    label: attr.name,
                    key: isRange ? undefined : attr.slug,
                    type: isRange ? 'range-number' : normalizedType,
                    options: options.length > 0 ? options : undefined,
                    minKey: isRange ? (attr.minKey || (attr.slug ? `${attr.slug}Min` : undefined)) : undefined,
                    maxKey: isRange ? (attr.maxKey || (attr.slug ? `${attr.slug}Max` : undefined)) : undefined,
                    required: attr.required
                };

                const id = attr.slug ? `s:${attr.slug}` : stableFieldId(field);
                map.set(id, field);
            });
        }
    }

    if (map.size > 0) {
        return Array.from(map.values()).filter((f) => !isReservedField(f)).sort((a: any, b: any) => {
            // Preserve order: static schema usually defines order.
            // But we mixed them.
            // Simple sort by label or key might be weird.
            // We can rely on insertion order of Map for iteration, but Array.from preserves it.
            // However, the sort at the end of original code sorted by 'order'.
            // Static fields don't have 'order' property explicitly in AttrField type (it's optional in some types).
            // Let's remove the sort by 'order' if it's not robust, or keep it safe.
            const orderA = a.order || 0;
            const orderB = b.order || 0;
            return orderA - orderB;
        });
    }

    return [];
  }, [subcategorySlug, overrideKey, dynamicCategory, dynamicAttributes]);

  useEffect(() => {
    const hasBrandField = combinedSchema.some((f) => f.key === 'marka' && (f.type === 'select' || f.type === 'multiselect'));
    if (!hasBrandField) {
      setBrandOptions([]);
      return;
    }

    fetch(`/api/vehicle-data?type=brands&category=${overrideKey}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBrandOptions(data);
        else setBrandOptions([]);
      })
      .catch(() => setBrandOptions([]));
  }, [combinedSchema, overrideKey]);

  // URL -> State Sync
  useEffect(() => {
    const num = (k: string): number | '' => {
      const v = sp.get(k);
      if (!v) return '';
      const n = Number(v);
      return Number.isNaN(n) ? '' : n;
    };
    
    const q = sp.get('q') || '';
    setSearchTerm(q);
    const s = sp.get('sort'); if (s) setSortBy(s);
    
    const cityQ = sp.getAll('city'); if (cityQ.length > 0) setSelectedCity(cityQ);
    const distQ = sp.getAll('district'); if (distQ.length > 0) setSelectedDistrict(distQ);
    const minP = num('minPrice'); const maxP = num('maxPrice'); 
    if (minP !== '' || maxP !== '') setPriceRange([minP || 0, maxP || 10000000]);

    const nextAttrs: FilterAttrs = {};
    combinedSchema.forEach(f => {
      if (f.type === 'range-number') {
        const minVal = sp.get(f.minKey!);
        const maxVal = sp.get(f.maxKey!);
        if (minVal) nextAttrs[f.minKey!] = minVal;
        if (maxVal) nextAttrs[f.maxKey!] = maxVal;
      } else if (f.key) {
        const val = sp.get(f.key);
        if (val) nextAttrs[f.key] = val;
      }
    });
    setFilterAttrs(nextAttrs);
  }, [sp, categorySlug, subcategorySlug, combinedSchema]);

  const handleFilterChange = (key: string, value: string | number | (string | number)[]) => {
    setFilterAttrs(prev => {
      const next = { ...prev, [key]: value };
      
      // Clear dependent fields
      if (key === 'marka') {
        delete next['model'];
        delete next['seri'];
        delete next['paket'];
        delete next['donanim'];
      } else if (key === 'model') {
        delete next['seri'];
        delete next['paket'];
        delete next['donanim'];
      } else if (key === 'seri') {
        delete next['paket'];
        delete next['donanim'];
      } else if (key === 'paket') {
        delete next['donanim'];
      }
      
      return next;
    });
  };

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categorySlug) params.set('category', categorySlug);
      if (subcategoryFilter) params.set('subcategory', subcategoryFilter);
      if (searchTerm) params.set('q', searchTerm);
      if (selectedCity.length > 0) selectedCity.forEach(c => params.append('city', c));
      if (selectedDistrict.length > 0) selectedDistrict.forEach(d => params.append('district', d));
      if (priceRange[0]) params.set('minPrice', String(priceRange[0]));
      if (priceRange[1]) params.set('maxPrice', String(priceRange[1]));
      params.set('sort', sortBy || 'newest');

      combinedSchema.forEach(f => {
        if (f.type === 'range-number') {
          const minVal = filterAttrs[f.minKey!];
          const maxVal = filterAttrs[f.maxKey!];
          if (minVal !== undefined && minVal !== '') params.set(f.minKey!, String(minVal));
          if (maxVal !== undefined && maxVal !== '') params.set(f.maxKey!, String(maxVal));
        } else if (f.key) {
          const val = filterAttrs[f.key];
          if (val !== undefined && val !== '') {
            if (Array.isArray(val)) {
                val.forEach(v => params.append(f.key!, String(v)));
            } else {
                params.set(f.key!, String(val));
            }
          }
        }
      });

      const response = await fetch(`/api/talepler?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        const rawListings = Array.isArray(data) ? data : (data?.data || []);
        setListings(rawListings);
        setFilteredListings(rawListings as Talep[]);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  }, [
    categorySlug,
    subcategoryFilter,
    searchTerm,
    selectedCity,
    selectedDistrict,
    priceRange,
    sortBy,
    filterAttrs,
    combinedSchema,
  ]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const { data: session } = useSession();
  const [isAlarmLoading, setIsAlarmLoading] = useState(false);
  const [hasAlarm, setHasAlarm] = useState(false);

  useEffect(() => {
    const checkAlarm = async () => {
      if (!session?.user?.id) return;

      const baseQuery = subcategory ? subcategory.name : category?.name;
      const query = searchTerm || baseQuery;
      if (!query) return;

      try {
        const params = new URLSearchParams();
        params.set('query', query);
        if (categorySlug) params.set('categorySlug', categorySlug);

        const res = await fetch(`/api/saved-searches?${params.toString()}`);
        if (res.ok) {
          const savedSearches = await res.json();
          setHasAlarm(Array.isArray(savedSearches) && savedSearches.length > 0);
        }
      } catch (error) {
        console.error('Error checking alarm:', error);
      }
    };
    
    checkAlarm();
  }, [session, categorySlug, searchTerm, subcategory, category]);

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Kategori Bulunamadı</h1>
          <Link href="/" className="text-cyan-400 hover:text-cyan-300">Ana Sayfaya Dön</Link>
        </div>
      </div>
    );
  }
  
  const toggleFavorite = async (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    try {
      if (favorites.has(id)) {
        await fetch(`/api/favorites?listingId=${id}`, { method: 'DELETE' });
      } else {
        await fetch(`/api/favorites`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listingId: id }) });
      }
    } catch {}
  };

  const getFieldOptions = (field: AttrField) => {
      // Dynamic options priority
      if (field.key === 'marka' && brandOptions.length > 0) return brandOptions;
      if (field.key === 'model' && modelOptions.length > 0) return modelOptions;
      if (field.key === 'seri' && seriesOptions.length > 0) return seriesOptions;
      if (field.key === 'paket' && trimOptions.length > 0) return trimOptions;
      if (field.key === 'donanim' && equipmentOptions.length > 0) return equipmentOptions;
      const options: (string | { value: string | number; label: string })[] = field.options || [];

      // Sort alphabetically for hierarchical keys and marka
      if (['marka', 'model', 'seri', 'paket', 'donanim'].includes(field.key || '')) {
         return [...options].sort((a, b) => {
             const labelA = typeof a === 'object' ? (a as any).label : a;
             const labelB = typeof b === 'object' ? (b as any).label : b;
             return String(labelA).localeCompare(String(labelB), 'tr');
         });
      }

      return options;
  };

  const renderFilters = () => {
    const priorityKeys = ['marka', 'model', 'seri', 'paket', 'donanim', 'motor'];
    const priorityAttributes = combinedSchema.filter(f => f.key && priorityKeys.includes(f.key));
    const otherAttributes = combinedSchema.filter(f => !f.key || !priorityKeys.includes(f.key));

    const renderAttribute = (field: AttrField, i: number) => {
        let isDisabled = false;
        
        // Hiyerarşik alanlar için özel görünürlük ve disabled mantığı
        // const hierarchicalKeys = ['model', 'seri', 'paket', 'donanim'];
        
        // Hiding logic removed to ensure fields are visible (even if disabled)
        // if (isVasitaOto && hierarchicalKeys.includes(field.key!)) {
        //    const options = getFieldOptions(field);
        //    if (options.length === 0) return null;
        // }

        const isAttrEmpty = (val: any) => !val || (Array.isArray(val) && val.length === 0);

        if (field.key === 'model' && isAttrEmpty(filterAttrs['marka'])) isDisabled = true;
        if (field.key === 'seri' && isAttrEmpty(filterAttrs['model'])) isDisabled = true;
        if (field.key === 'paket' && isAttrEmpty(filterAttrs['seri'])) isDisabled = true;
        if (field.key === 'donanim' && isAttrEmpty(filterAttrs['paket'])) isDisabled = true;

        if (field.type === 'select' || field.type === 'multiselect') {
             return (
                <MultiSelect
                    key={`${field.key}-${i}`}
                    label={field.label}
                    value={getArrayValue(filterAttrs[field.key!])}
                    onChange={(val: string[]) => handleFilterChange(field.key!, val)}
                    options={getFieldOptions(field)}
                    disabled={isDisabled}
                />
             );
        } else if (field.type === 'range-number') {
            return (
                <FilterRange
                    key={`${field.minKey}-${field.maxKey}-${i}`}
                    label={field.label}
                    minValue={getSingleValue(filterAttrs[field.minKey!])}
                    maxValue={getSingleValue(filterAttrs[field.maxKey!])}
                    onMinChange={(val) => handleFilterChange(field.minKey!, val)}
                    onMaxChange={(val) => handleFilterChange(field.maxKey!, val)}
                />
            );
        } else if (field.type === 'boolean') {
             return (
                <FilterSelect
                    key={`${field.key}-${i}`}
                    label={field.label}
                    value={getSingleValue(filterAttrs[field.key!]).toString()}
                    onChange={(val) => handleFilterChange(field.key!, val)}
                    options={[{value:'true', label:'Evet'}, {value:'false', label:'Hayır'}]}
                />
             );
        } else {
            return (
                <FilterInput
                    key={`${field.key}-${i}`}
                    label={field.label}
                    value={getSingleValue(filterAttrs[field.key!])}
                    onChange={(val) => handleFilterChange(field.key!, val)}
                />
            );
        }
    };

    return (
    <div className="bg-white rounded-2xl p-6 shadow-2xl text-gray-900">
      <div className="mb-6 relative">
        <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
            type="text"
            placeholder={`${titleCaseTR(subcategory ? subcategory.name : category.name)} Taleplerinde Ara...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 hover:border-cyan-400 shadow-sm transition-all duration-200"
        />
      </div>

      <div className="mb-6">
        <SavedSearchModal
          searchParams={{
            query: searchTerm,
            categorySlug,
            subcategorySlug,
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
            city: selectedCity,
            district: selectedDistrict,
            filtersJson: filterAttrs
          }}
          onSave={() => toast({ title: "Başarılı", description: "Arama kaydedildi." })}
        />
      </div>
      
      <div className="space-y-6">
        <div className="bg-white rounded-xl border-2 border-gray-300 overflow-hidden shadow-sm">
          <div className="p-4 space-y-2">
            <div className="text-sm font-bold text-gray-900">Ana Kategoriler</div>
            <select
              value={categorySlug || ""}
              onChange={(e) => {
                const next = e.target.value;
                if (!next || next === categorySlug) return;
                const qs = sp.toString();
                router.push(qs ? `/kategori/${next}?${qs}` : `/kategori/${next}`);
              }}
              className="w-full rounded-xl px-4 py-3 font-medium transition-all duration-200 bg-white border-2 border-gray-300 text-gray-900 shadow-sm hover:border-cyan-400"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* Subcategories Filter */}
        <div className="bg-white rounded-xl border-2 border-gray-300 overflow-hidden shadow-sm">
             <button 
                onClick={() => setIsSubcategoriesOpen(!isSubcategoriesOpen)}
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
             >
                 <div className="flex flex-col items-start">
                   <h3 className="text-gray-900 text-sm font-bold">Alt Kategoriler</h3>
                   <div className="text-xs text-gray-500 font-medium mt-0.5">
                     {subcategory
                       ? titleCaseTR(subcategory.name)
                       : (slugParts.length > 0 ? titleCaseTR(String(slugParts[slugParts.length - 1] || '').replace(/[-_]+/g, ' ')) : 'Tümü')}
                   </div>
                 </div>
                 {isSubcategoriesOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
             </button>
             
             {isSubcategoriesOpen && (
                 <div className="p-4 pt-0 space-y-2 border-t-2 border-gray-100 bg-white">
                    <div className="pt-2 space-y-2">
                        {listParentPathParts.length > 0 && (
                          <Link
                            href={upHref}
                            onClick={() => setIsSubcategoriesOpen(true)}
                            className="flex items-center gap-2 text-gray-600 hover:text-cyan-600 font-semibold"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            Üst Kategori
                          </Link>
                        )}
                        <Link 
                            href={basePath}
                            onClick={() => setIsSubcategoriesOpen(false)}
                            className={`flex items-center justify-between group ${
                                (listParent === category && !subcategorySlug) || (subcategorySlug === listParent?.slug) 
                                ? 'text-cyan-600 font-bold' 
                                : 'text-gray-600 hover:text-cyan-600'
                            }`}
                        >
                            <span className="text-sm">Tümü</span>
                            {((listParent === category && !subcategorySlug) || (subcategorySlug === listParent?.slug)) && <span className="w-2 h-2 bg-cyan-600 rounded-full"></span>}
                        </Link>
                        {subcategoriesToRender.map((sub: any) => (
                            <Link
                                key={sub.slug}
                                href={`${basePath}/${sub.slug}`}
                                onClick={() => setIsSubcategoriesOpen(!(sub.subcategories && sub.subcategories.length > 0))}
                                className={`flex items-center justify-between group ${subcategorySlug === sub.slug ? 'text-cyan-600 font-bold' : 'text-gray-600 hover:text-cyan-600'}`}
                            >
                                <span className="text-sm">{titleCaseTR(sub.name)}</span>
                                {subcategorySlug === sub.slug && <span className="w-2 h-2 bg-cyan-600 rounded-full"></span>}
                            </Link>
                        ))}
                    </div>
                 </div>
             )}
        </div>

        {/* Standard Filters & Priority Attributes */}
        <div className="grid grid-cols-1 gap-4">
            <MultiSelect
              label="Şehir"
              value={selectedCity}
              onChange={(val) => { setSelectedCity(val); if (val.length === 0) setSelectedDistrict([]); }}
              placeholder="Tüm Şehirler"
              options={TURKEY_PROVINCES.map(p => p.name)}
            />
            <MultiSelect
              label="İlçe"
              value={selectedDistrict}
              onChange={setSelectedDistrict}
              placeholder="Tüm İlçeler"
              disabled={selectedCity.length === 0}
              options={(() => {
                if (selectedCity.length === 0) return [];
                return TURKEY_PROVINCES
                  .filter(p => selectedCity.includes(p.name))
                  .flatMap(p => p.districts.map(d => d.name))
                  .sort((a, b) => a.localeCompare(b, 'tr'));
              })()}
            />
            
            {/* Priority Attributes (Marka, Model, Seri, Paket...) */}
            {priorityAttributes.map((field, i) => renderAttribute(field, i))}

            <FilterRange
              label={`Fiyat: ${priceRange[0].toLocaleString('tr-TR')} - ${priceRange[1].toLocaleString('tr-TR')} TL`}
              minValue={priceRange[0]}
              maxValue={priceRange[1]}
              onMinChange={(val) => setPriceRange([parseInt(val) || 0, priceRange[1]])}
              onMaxChange={(val) => setPriceRange([priceRange[0], parseInt(val) || 10000000])}
              className="bg-white border border-gray-200 text-gray-900 placeholder-gray-500"
            />
        </div>

        {/* Other Dynamic Filters */}
        {otherAttributes.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-4">
                <h3 className="text-gray-900 text-sm font-semibold mb-2 opacity-90">Detaylı Filtreler</h3>
                {otherAttributes.map((field, i) => renderAttribute(field, i + priorityAttributes.length))}
            </div>
        )}

        {/* Sort & Clear */}
        <div className="flex gap-2 items-end">
            <div className="flex-1">
                <FilterSelect
                label="Sırala"
                value={sortBy}
                onChange={setSortBy}
                className="bg-white border border-gray-200 text-gray-900"
                placeholder="Tarihe Göre"
                options={[
                    {value:'date', label:'Tarihe Göre'},
                    {value:'price-high', label:'Fiyat Azalan'},
                    {value:'price-low', label:'Fiyat Artan'},
                ]}
                />
            </div>
            <button
                onClick={() => {
                setSearchTerm(''); setSelectedCity([]); setSelectedDistrict([]); setPriceRange([0, 10000000]);
                setFilterAttrs({}); setSortBy('date');
                }}
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-all shadow-md mb-[1px]"
                title="Temizle"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
        </div>
      </div>
    </div>
  );
  };

  const handleCreateAlarm = async () => {
    if (!session) {
      toast({
        title: "Giriş yapmalısınız",
        description: "Alarm oluşturmak için lütfen giriş yapın.",
        variant: "warning"
      });
      return;
    }

    const query = searchTerm || titleCaseTR(subcategory ? subcategory.name : category.name);

    const filters: FilterAttrs = {};
    if (selectedCity.length > 0) filters.city = selectedCity;
    if (selectedDistrict.length > 0) filters.district = selectedDistrict;
    if (priceRange[0] > 0) filters.minPrice = priceRange[0];
    if (priceRange[1] < 10000000) filters.maxPrice = priceRange[1];
    Object.assign(filters, filterAttrs);

    const hasFilters = Object.keys(filters).length > 0;
    const hasSearchTerm = !!searchTerm && searchTerm.length >= 3;

    let matchMode: "TITLE" | "CATEGORY" | "FILTERS" = "TITLE";
    if (hasSearchTerm) {
      matchMode = "TITLE";
    } else if (hasFilters) {
      matchMode = "FILTERS";
    } else {
      matchMode = "CATEGORY";
    }

    if (matchMode === "TITLE" && !hasSearchTerm) {
      toast({
        title: "Geçersiz arama",
        description: "Alarm oluşturmak için en az 3 karakterlik bir arama yapın.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsAlarmLoading(true);
      const res = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          categorySlug: categorySlug || null,
          matchMode,
          filters,
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Alarm oluşturulamadı');
      }

      setHasAlarm(true);
      toast({
        title: "Alarm Oluşturuldu",
        description: `"${query}" için yeni talep geldiğinde size bildirim göndereceğiz.`,
        variant: "success",
      });

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';
      toast({
        title: "Hata",
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsAlarmLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Link href={subcategorySlug ? `/kategori/${categorySlug}` : '/'} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{titleCaseTR(subcategory ? subcategory.name : category.name)}</h1>
              <p className="text-sm text-gray-500">{filteredListings?.length || 0} talep</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateAlarm}
              disabled={isAlarmLoading || hasAlarm}
              className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                hasAlarm 
                  ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                  : 'bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100'
              }`}
            >
              {isAlarmLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : hasAlarm ? (
                <Check className="w-4 h-4" />
              ) : (
                <BellRing className="w-4 h-4" />
              )}
              {hasAlarm ? 'Alarm Kurulu' : 'Bu Aramayı Kaydet'}
            </button>

            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Listings Grid - Left */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                    <div className="h-48 bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (filteredListings?.length || 0) === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Talep Bulunamadı</h3>
                <p className="text-gray-500">Arama kriterlerinize uygun talep bulunmamaktadır.</p>
                <button 
                  onClick={() => {
                    setSearchTerm(''); setSelectedCity([]); setSelectedDistrict([]); setPriceRange([0, 10000000]);
                    setFilterAttrs({});
                  }}
                  className="mt-6 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                >
                  Filtreleri Temizle
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {filteredListings.map((listing) => (
                  <TalepCard 
                    key={listing.id} 
                    listing={{
                      ...listing,
                      isFavorited: favorites.has(listing.id)
                    }}
                    onToggleFavorite={session ? toggleFavorite : undefined}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Filters (Desktop) - Right */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 pb-4">
              {renderFilters()}
            </div>
          </div>

          {/* Mobile Filters Overlay */}
          {showFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-full max-w-xs bg-white shadow-xl overflow-y-auto">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                  <h2 className="text-lg font-bold text-gray-900">Filtrele</h2>
                  <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  {renderFilters()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
