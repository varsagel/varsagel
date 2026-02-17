"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import TalepCard from '@/components/home/TalepCardOptimized';
import { CATEGORIES, SubCategory } from '@/data/categories';
import { TURKEY_PROVINCES } from '@/data/turkey-locations';
import { BellRing, Check, Loader2, ChevronDown, ChevronUp, ChevronLeft, Search } from 'lucide-react';
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

const DEFAULT_PRICE_RANGE: [number, number] = [0, 10000000];

const isVehicleCategorySlug = (slug?: string) => {
  const normalized = String(slug || "").toLocaleLowerCase("tr");
  if (!normalized) return false;
  if (normalized === "vasita" || normalized.startsWith("vasita/") || normalized.startsWith("vasita-")) return true;
  return (
    normalized.includes("otomobil") ||
    normalized.includes("arazi") ||
    normalized.includes("suv") ||
    normalized.includes("pickup") ||
    normalized.includes("minivan") ||
    normalized.includes("panelvan") ||
    normalized.includes("motosiklet") ||
    normalized.includes("kamyon") ||
    normalized.includes("cekici") ||
    normalized.includes("ticari") ||
    normalized.includes("otobus") ||
    normalized.includes("minibus")
  );
};

const normalizeVehicleToken = (value: string) => {
  return value
    .toLocaleLowerCase("tr")
    .replace(/[ç]/g, "c")
    .replace(/[ğ]/g, "g")
    .replace(/[ı]/g, "i")
    .replace(/[ö]/g, "o")
    .replace(/[ş]/g, "s")
    .replace(/[ü]/g, "u")
    .replace(/[^a-z0-9]/g, "");
};

const normalizeVasitaSlug = (rawSlug?: string, rawName?: string) => {
  const slug = normalizeVehicleToken(String(rawSlug || ""));
  const name = normalizeVehicleToken(String(rawName || ""));
  const has = (v: string) => slug.includes(v) || name.includes(v);
  if (has("marka")) return "marka";
  if (has("model") && !has("modelyili")) return "model";
  if (slug === "seri" || name === "seri" || has("motorseri")) return "seri";
  if (has("paket") || has("donanim") || has("trim")) return "paket";
  return rawSlug || "";
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

type AttributeField = {
  id?: string;
  name: string;
  slug: string;
  type: string;
  options?: string[];
  required?: boolean;
  order?: number;
  minKey?: string;
  maxKey?: string;
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
};

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
  
  // Resolve using full path to ensure correct hierarchy traversal
  const subcategory = slugParts.length > 0 
    ? findSubcategoryByPath(category?.subcategories || [], slugParts)
    : undefined;

  const subcategorySlug = subcategory?.slug || (slugParts.length > 0 ? slugParts[slugParts.length - 1] : undefined);
  const subcategoryFilter = subcategory?.fullSlug || subcategorySlug;
  const isVasita = useMemo(() => {
    return (
      isVehicleCategorySlug(categorySlug) ||
      isVehicleCategorySlug(subcategoryFilter) ||
      isVehicleCategorySlug(subcategorySlug)
    );
  }, [categorySlug, subcategoryFilter, subcategorySlug]);

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

  const [listings, setListings] = useState<Talep[]>([]);
  const [filteredListings, setFilteredListings] = useState<Talep[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  // Common Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>(DEFAULT_PRICE_RANGE);
  const [selectedCity, setSelectedCity] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isSubcategoriesOpen, setIsSubcategoriesOpen] = useState(false);
  const [attributeFields, setAttributeFields] = useState<AttributeField[]>([]);
  const [showAllAttributes, setShowAllAttributes] = useState(false);
  const [attributeLoading, setAttributeLoading] = useState(false);
  const [attributeLoadError, setAttributeLoadError] = useState<string | null>(null);
  const [attrValues, setAttrValues] = useState<Record<string, any>>({});
  const [dropdownSearch, setDropdownSearch] = useState<Record<string, string>>({});
  const [attributeSlugAliases, setAttributeSlugAliases] = useState<Record<string, string[]>>({});
  const [brandOptions, setBrandOptions] = useState<string[]>([]);
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [seriesOptions, setSeriesOptions] = useState<string[]>([]);
  const [trimOptions, setTrimOptions] = useState<string[]>([]);
  const [brandLoading, setBrandLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [seriesLoading, setSeriesLoading] = useState(false);
  const [trimLoading, setTrimLoading] = useState(false);
  const prevBrandRef = React.useRef<string | null>(null);
  const prevModelRef = React.useRef<string | null>(null);
  const prevSeriesRef = React.useRef<string | null>(null);

  const subcategoriesToRender = React.useMemo(() => {
     if (subcategory?.subcategories && subcategory.subcategories.length > 0) return subcategory.subcategories;
     if (parentSubcategory?.subcategories) return parentSubcategory.subcategories;
     return category?.subcategories || [];
  }, [subcategory, parentSubcategory, category]);

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
    setFavorites(new Set(listings.filter(l => l.isFavorited).map(l => l.id)));
  }, [listings]);

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
    if (minP !== '' || maxP !== '') setPriceRange([minP || 0, maxP || DEFAULT_PRICE_RANGE[1]]);

  }, [sp, categorySlug, subcategorySlug]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!categorySlug) {
        if (active) {
          setAttributeFields([]);
          setAttributeLoading(false);
          setAttributeLoadError(null);
          setAttrValues({});
        }
        return;
      }
      setAttributeLoading(true);
      setAttributeLoadError(null);
      try {
        const qs = subcategoryFilter ? `?subcategory=${encodeURIComponent(subcategoryFilter)}` : "";
        const res = await fetch(`/api/categories/${categorySlug}/attributes${qs}`);
        if (!res.ok) throw new Error("load-failed");
        const data = await res.json();
        const slugMap = new Map<string, string>();
        const aliasMap: Record<string, string[]> = {};
        const mapped = Array.isArray(data)
          ? data
              .filter((a) => a?.showInRequest !== false)
              .map((a) => {
                let options: string[] | undefined;
                if (Array.isArray(a.optionsJson)) {
                  options = a.optionsJson.map((o: any) => String(o));
                } else if (typeof a.optionsJson === "string") {
                  try {
                    const parsed = JSON.parse(a.optionsJson);
                    if (Array.isArray(parsed)) options = parsed.map((o: any) => String(o));
                  } catch {
                    options = a.optionsJson.split(",").map((s: string) => s.trim()).filter(Boolean);
                  }
                }
                const normalizedSlug = isVasita ? normalizeVasitaSlug(a.slug, a.name) : a.slug;
                if (isVasita && a.slug && normalizedSlug && normalizedSlug !== a.slug) {
                  slugMap.set(a.slug, normalizedSlug);
                }
                const finalSlug = normalizedSlug || a.slug;
                const aliasSet = new Set<string>();
                if (finalSlug) aliasSet.add(finalSlug);
                if (a.slug) aliasSet.add(a.slug);
                aliasMap[finalSlug] = Array.from(aliasSet);
                return {
                  id: a.id,
                  name: a.name,
                  slug: finalSlug,
                  type: a.type,
                  options,
                  required: a.required,
                  order: a.order,
                  minKey: a.minKey,
                  maxKey: a.maxKey,
                  min: a.min,
                  max: a.max,
                  minLabel: a.minLabel,
                  maxLabel: a.maxLabel,
                } as AttributeField;
              })
          : [];
        if (active) {
          setAttributeFields(mapped);
          setAttributeSlugAliases(aliasMap);
          if (mapped.length === 0) {
            setAttrValues({});
          } else {
            const allowed = new Set<string>();
            mapped.forEach((f) => {
              if (f.type === "range-number") {
                const minKey = f.minKey || `${f.slug}Min`;
                const maxKey = f.maxKey || `${f.slug}Max`;
                allowed.add(minKey);
                allowed.add(maxKey);
              } else {
                allowed.add(f.slug);
              }
            });
            setAttrValues((prev) => {
              const next: Record<string, any> = {};
              let changed = false;
              Object.entries(prev).forEach(([k, v]) => {
                const mappedKey = slugMap.get(k) || k;
                if (mappedKey !== k) changed = true;
                if (allowed.has(mappedKey)) {
                  next[mappedKey] = v;
                } else {
                  changed = true;
                }
              });
              if (!changed && Object.keys(next).length === Object.keys(prev).length) return prev;
              return next;
            });
          }
        }
      } catch {
        if (active) {
          setAttributeFields([]);
          setAttributeLoadError("Özellikler yüklenemedi");
          setAttrValues({});
        }
      } finally {
        if (active) setAttributeLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [categorySlug, subcategoryFilter, isVasita]);

  useEffect(() => {
    if (attributeFields.length === 0) return;
    const next: Record<string, any> = {};
    attributeFields.forEach((field) => {
      if (field.type === "range-number") {
        const minKey = field.minKey || `${field.slug}Min`;
        const maxKey = field.maxKey || `${field.slug}Max`;
        const minVal = sp.get(minKey);
        const maxVal = sp.get(maxKey);
        if (minVal !== null && minVal !== "") next[minKey] = minVal;
        if (maxVal !== null && maxVal !== "") next[maxKey] = maxVal;
      } else {
        const aliases = attributeSlugAliases[field.slug] || [field.slug];
        const all = Array.from(new Set(aliases.flatMap((alias) => sp.getAll(alias).filter((v) => v !== null && v !== ""))));
        if (all.length > 1) {
          next[field.slug] = all;
        } else {
          const single = all.length === 1 ? all[0] : sp.get(field.slug);
          if (single !== null && single !== "") next[field.slug] = single;
        }
      }
    });
    setAttrValues(next);
  }, [sp, attributeFields, attributeSlugAliases]);

  const updateAttribute = useCallback((key: string, value: any) => {
    setAttrValues((prev) => {
      const next = { ...prev };
      const remove = value === undefined || value === null || value === "" || value === false || (Array.isArray(value) && value.length === 0);
      if (remove) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  }, []);

  const brandSource = attrValues["marka"];
  const modelSource = attrValues["model"];
  const seriesSource = attrValues["seri"];
  const brandList = useMemo(() => {
    const arr = Array.isArray(brandSource) ? brandSource.map((b) => String(b)) : brandSource ? [String(brandSource)] : [];
    return arr.filter((v) => v.trim());
  }, [brandSource]);
  const modelList = useMemo(() => {
    const arr = Array.isArray(modelSource) ? modelSource.map((m) => String(m)) : modelSource ? [String(modelSource)] : [];
    return arr.filter((v) => v.trim());
  }, [modelSource]);
  const seriesList = useMemo(() => {
    const arr = Array.isArray(seriesSource) ? seriesSource.map((s) => String(s)) : seriesSource ? [String(seriesSource)] : [];
    return arr.filter((v) => v.trim());
  }, [seriesSource]);
  const brandKey = brandList.join("|");
  const modelKey = modelList.join("|");
  const seriesKey = seriesList.join("|");
  const vehicleCategoryKey = subcategoryFilter || categorySlug || "";

  useEffect(() => {
    if (!isVasita) {
      prevBrandRef.current = null;
      prevModelRef.current = null;
      prevSeriesRef.current = null;
      setBrandOptions([]);
      setModelOptions([]);
      setSeriesOptions([]);
      setTrimOptions([]);
      return;
    }
    if (prevBrandRef.current !== null && prevBrandRef.current !== brandKey) {
      setAttrValues((prev) => {
        const next = { ...prev };
        let changed = false;
        if (next.model !== undefined) { delete next.model; changed = true; }
        if (next.seri !== undefined) { delete next.seri; changed = true; }
        if (next.paket !== undefined) { delete next.paket; changed = true; }
        return changed ? next : prev;
      });
    }
    if (prevModelRef.current !== null && prevModelRef.current !== modelKey) {
      setAttrValues((prev) => {
        const next = { ...prev };
        let changed = false;
        if (next.seri !== undefined) { delete next.seri; changed = true; }
        if (next.paket !== undefined) { delete next.paket; changed = true; }
        return changed ? next : prev;
      });
    }
    if (prevSeriesRef.current !== null && prevSeriesRef.current !== seriesKey) {
      setAttrValues((prev) => {
        const next = { ...prev };
        let changed = false;
        if (next.paket !== undefined) { delete next.paket; changed = true; }
        return changed ? next : prev;
      });
    }
    prevBrandRef.current = brandKey;
    prevModelRef.current = modelKey;
    prevSeriesRef.current = seriesKey;
  }, [isVasita, brandKey, modelKey, seriesKey]);

  useEffect(() => {
    let active = true;
    if (!isVasita || !vehicleCategoryKey) {
      setBrandOptions([]);
      setBrandLoading(false);
      return;
    }
    setBrandLoading(true);
    const params = new URLSearchParams();
    params.set("type", "brands");
    params.set("category", vehicleCategoryKey);
    fetch(`/api/vehicle-data?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!active) return;
        setBrandOptions(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setBrandOptions([]);
      })
      .finally(() => {
        if (active) setBrandLoading(false);
      });
    return () => { active = false; };
  }, [isVasita, vehicleCategoryKey]);

  useEffect(() => {
    let active = true;
    if (!isVasita || brandList.length === 0 || !vehicleCategoryKey) {
      setModelOptions([]);
      setModelLoading(false);
      return;
    }
    setModelLoading(true);
    const params = new URLSearchParams();
    params.set("type", "models");
    params.set("category", vehicleCategoryKey);
    brandList.forEach((b) => params.append("brand", b));
    fetch(`/api/vehicle-data?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!active) return;
        setModelOptions(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setModelOptions([]);
      })
      .finally(() => {
        if (active) setModelLoading(false);
      });
    return () => { active = false; };
  }, [isVasita, brandKey, brandList, vehicleCategoryKey]);

  useEffect(() => {
    let active = true;
    if (!isVasita || brandList.length === 0 || modelList.length === 0 || !vehicleCategoryKey) {
      setSeriesOptions([]);
      setSeriesLoading(false);
      return;
    }
    setSeriesLoading(true);
    const params = new URLSearchParams();
    params.set("type", "series");
    params.set("category", vehicleCategoryKey);
    brandList.forEach((b) => params.append("brand", b));
    modelList.forEach((m) => params.append("model", m));
    fetch(`/api/vehicle-data?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!active) return;
        setSeriesOptions(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setSeriesOptions([]);
      })
      .finally(() => {
        if (active) setSeriesLoading(false);
      });
    return () => { active = false; };
  }, [isVasita, brandKey, modelKey, brandList, modelList, vehicleCategoryKey]);

  useEffect(() => {
    let active = true;
    if (!isVasita || brandList.length === 0 || modelList.length === 0 || seriesList.length === 0 || !vehicleCategoryKey) {
      setTrimOptions([]);
      setTrimLoading(false);
      return;
    }
    setTrimLoading(true);
    const params = new URLSearchParams();
    params.set("type", "trims");
    params.set("category", vehicleCategoryKey);
    brandList.forEach((b) => params.append("brand", b));
    modelList.forEach((m) => params.append("model", m));
    seriesList.forEach((s) => params.append("series", s));
    fetch(`/api/vehicle-data?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!active) return;
        setTrimOptions(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setTrimOptions([]);
      })
      .finally(() => {
        if (active) setTrimLoading(false);
      });
    return () => { active = false; };
  }, [isVasita, brandKey, modelKey, seriesKey, brandList, modelList, seriesList, vehicleCategoryKey]);

  const closeDetailsIfNeeded = useCallback((target: EventTarget | null) => {
    const el = target instanceof HTMLElement ? target : null;
    const details = el?.closest?.("details");
    if (details) details.removeAttribute("open");
  }, []);

  const isAttributeFilled = useCallback((field: AttributeField, values: Record<string, any>) => {
    if (field.type === "range-number") {
      const minKey = field.minKey || `${field.slug}Min`;
      const maxKey = field.maxKey || `${field.slug}Max`;
      const minVal = values[minKey];
      const maxVal = values[maxKey];
      return String(minVal ?? "").trim() !== "" || String(maxVal ?? "").trim() !== "";
    }
    if (field.type === "multiselect") {
      const val = values[field.slug];
      return Array.isArray(val) && val.length > 0;
    }
    if (field.type === "boolean") {
      return !!values[field.slug];
    }
    const val = values[field.slug];
    if (Array.isArray(val)) return val.length > 0;
    return String(val ?? "").trim() !== "";
  }, []);

  const filledAttributeCount = useMemo(() => {
    return attributeFields.reduce((acc, field) => acc + (isAttributeFilled(field, attrValues) ? 1 : 0), 0);
  }, [attributeFields, attrValues, isAttributeFilled]);

  const renderAttributeField = (field: AttributeField) => {
    const label = field.name || field.slug;
    if (isVasita && (field.slug === "marka" || field.slug === "model" || field.slug === "seri" || field.slug === "paket")) {
      const optionsRaw =
        field.slug === "marka"
          ? (brandOptions.length > 0 ? brandOptions : (field.options || []))
          : field.slug === "model"
            ? modelOptions
            : field.slug === "seri"
              ? seriesOptions
              : trimOptions;
      const options = (optionsRaw || []).map((o) => String(o));
      const loading =
        field.slug === "marka"
          ? brandLoading
          : field.slug === "model"
            ? modelLoading
            : field.slug === "seri"
              ? seriesLoading
              : trimLoading;
      const disabled =
        (field.slug === "model" && !String(attrValues["marka"] || "").trim()) ||
        (field.slug === "seri" && !String(attrValues["model"] || "").trim()) ||
        (field.slug === "paket" && !String(attrValues["seri"] || "").trim());
      const placeholder = loading
        ? "Yükleniyor..."
        : disabled
          ? field.slug === "model"
            ? "Önce marka seçiniz"
            : field.slug === "seri"
              ? "Önce model seçiniz"
              : "Önce motor/seri seçiniz"
          : "Tümü";
      const valueRaw = attrValues[field.slug];
      const value = Array.isArray(valueRaw) ? (valueRaw[0] || "") : (valueRaw ?? "");
      return (
        <FilterSelect
          key={field.slug}
          label={label}
          value={value}
          onChange={(val) => updateAttribute(field.slug, val)}
          options={options}
          disabled={disabled || loading}
          placeholder={placeholder}
        />
      );
    }
    if (field.type === "range-number") {
      const minKey = field.minKey || `${field.slug}Min`;
      const maxKey = field.maxKey || `${field.slug}Max`;
      const minValue = attrValues[minKey] ?? "";
      const maxValue = attrValues[maxKey] ?? "";
      return (
        <div key={field.slug} className="space-y-2">
          <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
            {label}
          </label>
          <div className="grid grid-cols-1 gap-3">
            <input
              type="number"
              value={minValue}
              onChange={(e) => updateAttribute(minKey, e.target.value)}
              placeholder={field.minLabel || "Min"}
              min={field.min}
              max={field.max}
              className="w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 border-gray-200 bg-gray-50/30 hover:bg-white hover:border-gray-300"
            />
            <input
              type="number"
              value={maxValue}
              onChange={(e) => updateAttribute(maxKey, e.target.value)}
              placeholder={field.maxLabel || "Max"}
              min={field.min}
              max={field.max}
              className="w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 border-gray-200 bg-gray-50/30 hover:bg-white hover:border-gray-300"
            />
          </div>
        </div>
      );
    }

    if (field.type === "boolean") {
      const value = !!attrValues[field.slug];
      return (
        <div key={field.slug} className="space-y-2">
          <label className="flex items-center gap-3 text-sm font-bold text-gray-700">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => updateAttribute(field.slug, e.target.checked)}
              className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
            />
            <span>{label}</span>
          </label>
        </div>
      );
    }

    if (field.type === "multiselect" || field.type === "select") {
      const value = Array.isArray(attrValues[field.slug]) ? attrValues[field.slug] : attrValues[field.slug] ? [String(attrValues[field.slug])] : [];
      const options = (field.options || []).map((o) => String(o));
      if (options.length === 0) {
        return (
          <div key={field.slug} className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
              {label}
            </label>
            <div className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-500">
              Seçenek yok
            </div>
          </div>
        );
      }
      const searchKey = `${field.slug}:${field.type}`;
      const searchVal = dropdownSearch[searchKey] || "";
      const showSearch = options.length >= 8;
      const filteredOptions = showSearch
        ? options.filter((o) => String(o || "").toLocaleLowerCase("tr").includes(searchVal.toLocaleLowerCase("tr")))
        : options;
      const effectiveOptions = filteredOptions.length === 0 && searchVal ? options : filteredOptions;
      const selectedCount = value.length;
      const selectedPreview = selectedCount
        ? value.slice(0, 2).join(", ") + (selectedCount > 2 ? ` +${selectedCount - 2}` : "")
        : "Seçiniz";
      const selectedSummary = selectedCount > 0 ? `${selectedCount} / ${options.length} seçili` : "";
      return (
        <div key={field.slug} className="space-y-2">
          <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
            {label}
          </label>
          <details className="rounded-xl border border-gray-200 bg-white">
            <summary className="cursor-pointer select-none px-3 py-2 text-sm font-semibold text-gray-700 flex flex-wrap items-center justify-between gap-2">
              <span className={selectedCount ? "text-gray-900" : "text-gray-500"}>{selectedPreview}</span>
              {selectedCount > 0 && (
                <span className="text-xs text-cyan-600 bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {selectedSummary}
                </span>
              )}
            </summary>
            <div className="space-y-1 p-2 pt-0">
              {(showSearch || selectedCount > 0) && (
                <div className="flex items-center gap-2 pb-2">
                  {showSearch && (
                    <input
                      type="text"
                      value={searchVal}
                      onChange={(e) => setDropdownSearch((prev) => ({ ...prev, [searchKey]: e.target.value }))}
                      placeholder="Seçeneklerde ara..."
                      className="flex-1 px-3 py-2 text-xs border rounded-lg focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 bg-gray-50/30 hover:bg-white hover:border-gray-300"
                    />
                  )}
                  {selectedCount > 0 && (
                    <button
                      type="button"
                      onClick={() => updateAttribute(field.slug, [])}
                      className="px-3 py-2 text-xs font-bold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                      Temizle
                    </button>
                  )}
                </div>
              )}
              {effectiveOptions.length === 0 && (
                <div className="text-xs text-gray-500 px-2 py-2">Aradığınız seçenek bulunamadı.</div>
              )}
              {effectiveOptions.map((opt) => {
                const checked = value.includes(opt);
                return (
                  <label key={opt} className="flex items-center gap-2 text-sm px-2 py-2 rounded hover:bg-gray-50 cursor-pointer w-full">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const next = new Set(value.map(String));
                        if (e.target.checked) next.add(opt);
                        else next.delete(opt);
                        updateAttribute(field.slug, Array.from(next));
                        closeDetailsIfNeeded(e.currentTarget);
                      }}
                      className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span className="text-gray-700">{opt}</span>
                  </label>
                );
              })}
            </div>
          </details>
        </div>
      );
    }

    const value = attrValues[field.slug] ?? "";
    return (
      <div key={field.slug} className="space-y-2">
        <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
          {label}
        </label>
        <input
          type={field.type === "number" ? "number" : "text"}
          value={value}
          onChange={(e) => updateAttribute(field.slug, e.target.value)}
          className="w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all duration-300 border-gray-200 bg-gray-50/30 hover:bg-white hover:border-gray-300"
        />
      </div>
    );
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
      Object.entries(attrValues).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => {
            if (v !== undefined && String(v).trim() !== "") params.append(key, String(v));
          });
        } else if (value !== undefined && value !== null && String(value).trim() !== "") {
          params.set(key, String(value));
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
    attrValues,
  ]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchListings();
    }, 300);
    return () => clearTimeout(t);
  }, [fetchListings]);

  const { data: session } = useSession();
  const [isAlarmLoading, setIsAlarmLoading] = useState(false);
  const [hasAlarm, setHasAlarm] = useState(false);

  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCity([]);
    setSelectedDistrict([]);
    setPriceRange(DEFAULT_PRICE_RANGE);
    setSortBy('date');
    setAttrValues({});
  }, []);

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
    const wasFav = favorites.has(id);
    setFavorites(prev => {
      const next = new Set(prev);
      if (wasFav) next.delete(id); else next.add(id);
      return next;
    });
    try {
      const res = wasFav
        ? await fetch(`/api/favorites?listingId=${id}`, { method: 'DELETE' })
        : await fetch(`/api/favorites`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listingId: id }) });
      if (!res.ok) {
        setFavorites(prev => {
          const next = new Set(prev);
          if (wasFav) next.add(id); else next.delete(id);
          return next;
        });
      }
    } catch {
      setFavorites(prev => {
        const next = new Set(prev);
        if (wasFav) next.add(id); else next.delete(id);
        return next;
      });
    }
  };

  const renderFilters = () => (
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

      {(() => {
        const chips: Array<{ key: string; label: string; onClear: () => void }> = [];
        const trimmedSearch = searchTerm.trim();
        if (trimmedSearch) {
          chips.push({
            key: 'q',
            label: `Arama: ${trimmedSearch}`,
            onClear: () => setSearchTerm(''),
          });
        }
        if (priceRange[0] !== DEFAULT_PRICE_RANGE[0] || priceRange[1] !== DEFAULT_PRICE_RANGE[1]) {
          chips.push({
            key: 'price',
            label: `Fiyat: ${priceRange[0].toLocaleString('tr-TR')} - ${priceRange[1].toLocaleString('tr-TR')}`,
            onClear: () => setPriceRange(DEFAULT_PRICE_RANGE),
          });
        }
        if (selectedCity.length > 0) {
          chips.push({
            key: 'city',
            label: `Şehir: ${selectedCity.join(', ')}`,
            onClear: () => { setSelectedCity([]); setSelectedDistrict([]); },
          });
        }
        if (selectedDistrict.length > 0) {
          chips.push({
            key: 'district',
            label: `İlçe: ${selectedDistrict.join(', ')}`,
            onClear: () => setSelectedDistrict([]),
          });
        }
        if (sortBy && sortBy !== 'date') {
          const sortLabel = sortBy === 'price-high' ? 'Fiyat Azalan' : sortBy === 'price-low' ? 'Fiyat Artan' : sortBy;
          chips.push({
            key: 'sort',
            label: `Sırala: ${sortLabel}`,
            onClear: () => setSortBy('date'),
          });
        }
        const usedAttrKeys = new Set<string>();
        attributeFields.forEach((field) => {
          if (field.type === "range-number") {
            const minKey = field.minKey || `${field.slug}Min`;
            const maxKey = field.maxKey || `${field.slug}Max`;
            const minVal = attrValues[minKey];
            const maxVal = attrValues[maxKey];
            if (String(minVal ?? "").trim() !== "" || String(maxVal ?? "").trim() !== "") {
              const label = `${field.name || field.slug}: ${minVal || "0"} - ${maxVal || "∞"}`;
              chips.push({
                key: `${field.slug}:range`,
                label,
                onClear: () => setAttrValues((prev) => {
                  const next = { ...prev };
                  delete next[minKey];
                  delete next[maxKey];
                  return next;
                }),
              });
            }
            usedAttrKeys.add(minKey);
            usedAttrKeys.add(maxKey);
          } else {
            const val = attrValues[field.slug];
            const hasValue = Array.isArray(val) ? val.length > 0 : String(val ?? "").trim() !== "";
            if (hasValue) {
              const display = Array.isArray(val) ? val.join(', ') : String(val);
              chips.push({
                key: `attr:${field.slug}`,
                label: `${field.name || field.slug}: ${display}`,
                onClear: () => setAttrValues((prev) => {
                  const next = { ...prev };
                  delete next[field.slug];
                  return next;
                }),
              });
            }
            usedAttrKeys.add(field.slug);
          }
        });
        Object.entries(attrValues).forEach(([key, val]) => {
          if (usedAttrKeys.has(key)) return;
          const hasValue = Array.isArray(val) ? val.length > 0 : String(val ?? "").trim() !== "";
          if (!hasValue) return;
          const display = Array.isArray(val) ? val.join(', ') : String(val);
          chips.push({
            key: `attr:${key}`,
            label: `${key}: ${display}`,
            onClear: () => setAttrValues((prev) => {
              const next = { ...prev };
              delete next[key];
              return next;
            }),
          });
        });
        if (chips.length === 0) return null;
        return (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.onClear}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-100 hover:bg-cyan-100"
              >
                <span>{chip.label}</span>
                <span className="text-cyan-500">×</span>
              </button>
            ))}
            <button
              type="button"
              onClick={clearAllFilters}
              className="ml-auto text-xs font-bold text-red-600 hover:text-red-700"
            >
              Hepsini Temizle
            </button>
          </div>
        );
      })()}

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
            filtersJson: Object.keys(attrValues).length > 0 ? attrValues : undefined
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

        {/* Standard Filters */}
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
            <FilterRange
              label={`Fiyat: ${priceRange[0].toLocaleString('tr-TR')} - ${priceRange[1].toLocaleString('tr-TR')} TL`}
              minValue={priceRange[0]}
              maxValue={priceRange[1]}
              onMinChange={(val) => setPriceRange([parseInt(val) || 0, priceRange[1]])}
              onMaxChange={(val) => setPriceRange([priceRange[0], parseInt(val) || 10000000])}
              className="bg-white border border-gray-200 text-gray-900 placeholder-gray-500"
            />
        </div>

        {(attributeLoading || attributeLoadError || attributeFields.length > 0) && (
          <div className="bg-white rounded-xl border-2 border-gray-300 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-cyan-50 rounded-xl shrink-0">
                  <Search className="w-4 h-4 text-cyan-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-gray-900">Ürün Özellikleri</h3>
                  <div className="text-xs text-gray-500 leading-4">Uygun seçenekleri işaretleyin</div>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                {attributeFields.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setAttrValues({})}
                    className="text-xs font-semibold text-gray-600 hover:text-gray-800"
                  >
                    Temizle
                  </button>
                )}
                <div className="text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded-full shrink-0">
                  {filledAttributeCount}/{attributeFields.length} seçili
                </div>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {attributeLoading && (
                <div className="text-sm text-gray-500 font-medium">Özellikler yükleniyor...</div>
              )}

              {!attributeLoading && attributeLoadError && (
                <div className="text-sm text-red-500 font-medium">{attributeLoadError}</div>
              )}

              {!attributeLoading && !attributeLoadError && attributeFields.length === 0 && (
                <div className="text-sm text-gray-500 font-medium">Bu kategori için ek özellik bulunmuyor.</div>
              )}

              {!attributeLoading && !attributeLoadError && attributeFields.length > 0 && (() => {
                const ordered = attributeFields
                  .slice()
                  .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
                const visible = showAllAttributes ? ordered : ordered.slice(0, 6);
                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      {visible.map(renderAttributeField)}
                    </div>
                    {ordered.length > 6 && (
                      <button
                        type="button"
                        onClick={() => setShowAllAttributes((prev) => !prev)}
                        className="w-full text-sm font-semibold text-cyan-700 hover:text-cyan-800 bg-cyan-50 border border-cyan-100 rounded-xl py-2"
                      >
                        {showAllAttributes ? "Daha az göster" : "Tüm özellikleri göster"}
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
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
                clearAllFilters();
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

    const filters: {
      city?: string[];
      district?: string[];
      minPrice?: number;
      maxPrice?: number;
    } = {};
    if (selectedCity.length > 0) filters.city = selectedCity;
    if (selectedDistrict.length > 0) filters.district = selectedDistrict;
    if (priceRange[0] > 0) filters.minPrice = priceRange[0];
    if (priceRange[1] < DEFAULT_PRICE_RANGE[1]) filters.maxPrice = priceRange[1];
    Object.entries(attrValues).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) (filters as any)[key] = value;
      } else if (value !== undefined && value !== null && String(value).trim() !== "") {
        (filters as any)[key] = value;
      }
    });

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
                  onClick={() => setSearchTerm('')}
                  className="mt-6 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                >
                  Aramayı Temizle
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
