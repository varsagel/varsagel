"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import TalepCard from '@/components/home/TalepCardOptimized';
import { CATEGORIES } from '@/data/categories';
import { TURKEY_PROVINCES } from '@/data/turkey-locations';
import { ATTR_SCHEMAS, AttrField } from '@/data/attribute-schemas';
import { ATTR_SUBSCHEMAS, BRAND_MODELS, MODEL_SERIES, SERIES_TRIMS } from '@/data/attribute-overrides';
import { BellRing, Check, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from '@/components/ui/use-toast';
import { SavedSearchModal } from '@/components/talep/SavedSearchModal';

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
  attributes?: Record<string, string | number | boolean>;
}

type FilterAttrs = Record<string, string | number>;

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
  value: string | number;
  onChange: (val: string) => void;
  options: (string | { value: string | number, label: string })[];
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-900 mb-2">{label}</label>
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      disabled={disabled}
      className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${disabled ? 'bg-gray-100' : ''} ${className ? className : 'bg-white border border-gray-300 text-gray-900'}`}
    >
      <option value="" className="text-gray-900">{placeholder}</option>
      {options.map((o) => {
        const val = typeof o === 'object' ? o.value : o;
        const lbl = typeof o === 'object' ? o.label : o;
        return <option key={val} value={val} className="text-gray-900">{lbl}</option>;
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
    <label className="block text-sm font-medium text-gray-900 mb-2">{label}</label>
    <input 
      type={type} 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      placeholder={placeholder}
      className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${className ? className : 'bg-white border border-gray-300 text-gray-900'}`}
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
  minPlaceholder = "Min",
  maxPlaceholder = "Max"
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
    <label className="block text-sm font-medium text-gray-900 mb-2">{label}</label>
    <div className="grid grid-cols-2 gap-2">
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
        className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${className ? className : 'bg-white border border-gray-300 text-gray-900'}`}
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
        className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${className ? className : 'bg-white border border-gray-300 text-gray-900'}`}
      />
    </div>
  </div>
);

export default function CategoryClient() {
  const params = useParams();
  const sp = useSearchParams();
  const categorySlug = params.category as string;
  const subcategorySlug = params.subcategory as string | undefined;
  
  const [listings, setListings] = useState<Talep[]>([]);
  const [filteredListings, setFilteredListings] = useState<Talep[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  // Common Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Dynamic Filters
  const [filterAttrs, setFilterAttrs] = useState<FilterAttrs>({});
  
  useEffect(() => {
    setFavorites(new Set(listings.filter(l => l.isFavorited).map(l => l.id)));
  }, [listings]);

  const category = CATEGORIES.find(cat => cat.slug === categorySlug);
  const subcategory = subcategorySlug ? category?.subcategories.find(sub => sub.slug === subcategorySlug) : undefined;
  
  const overrideKey = subcategorySlug ? `${categorySlug}/${subcategorySlug}` : categorySlug;
  
  const combinedSchema = React.useMemo<AttrField[]>(() => {
    const base = ATTR_SCHEMAS[categorySlug] || [];
    const sub = subcategorySlug ? (ATTR_SUBSCHEMAS[overrideKey] || []) : [];
    
    const map = new Map<string, AttrField>();
    base.forEach((f) => {
      const id = f.key || (f.minKey && f.maxKey ? `${f.minKey}-${f.maxKey}` : f.label);
      map.set(id, f);
    });
    sub.forEach((f) => {
      const id = f.key || (f.minKey && f.maxKey ? `${f.minKey}-${f.maxKey}` : f.label);
      map.set(id, f);
    });
    
    let result = Array.from(map.values());

    // Custom reordering for 'vasita'
    if (categorySlug === 'vasita') {
      const priorityKeys = ['marka', 'model', 'seri', 'paket'];
      const prioritized: AttrField[] = [];
      const others: AttrField[] = [];
      
      // Separate priority items
      priorityKeys.forEach(key => {
        const found = result.find(f => f.key === key);
        if (found) {
          prioritized.push(found);
        }
      });
      
      // Add non-priority items
      result.forEach(f => {
        if (!priorityKeys.includes(f.key || '')) {
          others.push(f);
        }
      });
      
      result = [...prioritized, ...others];
    }
    
    return result;
  }, [categorySlug, subcategorySlug, overrideKey]);

  // URL -> State Sync
  useEffect(() => {
    const get = (k: string) => sp.get(k) || '';
    const num = (k: string): number | '' => {
      const v = sp.get(k);
      if (!v) return '';
      const n = Number(v);
      return Number.isNaN(n) ? '' : n;
    };
    
    const s = sp.get('sort'); if (s) setSortBy(s);
    
    const cityQ = get('city'); if (cityQ) setSelectedCity(cityQ);
    const distQ = get('district'); if (distQ) setSelectedDistrict(distQ);
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

  const handleFilterChange = (key: string, value: string | number) => {
    setFilterAttrs(prev => {
      const next = { ...prev, [key]: value };
      
      // Clear dependent fields
      if (key === 'marka') {
        delete next['model'];
        delete next['seri'];
        delete next['paket'];
      } else if (key === 'model') {
        delete next['seri'];
        delete next['paket'];
      } else if (key === 'seri') {
        delete next['paket'];
      }
      
      return next;
    });
  };

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categorySlug) params.set('category', categorySlug);
      if (subcategorySlug) params.set('subcategory', subcategorySlug);
      if (searchTerm) params.set('q', searchTerm);
      if (selectedCity) params.set('city', selectedCity);
      if (selectedDistrict) params.set('district', selectedDistrict);
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
          if (val !== undefined && val !== '') params.set(f.key, String(val));
        }
      });

      const response = await fetch(`/api/talepler?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        const rawListings = Array.isArray(data) ? data : (data.data || []);
        setListings(rawListings);
        
        // Generic client-side filtering
        let next = rawListings as Talep[];
        next = next.filter((l) => {
            const a = l.attributes || {};
            for (const f of combinedSchema) {
                if (f.type === 'range-number') {
                    const minVal = filterAttrs[f.minKey!];
                    const maxVal = filterAttrs[f.maxKey!];
                    const itemKey = f.minKey?.replace('Min', '') || f.maxKey?.replace('Max', '') || '';
                    const val = a[itemKey];
                    if (minVal !== undefined && minVal !== '' && val !== undefined && Number(val) < Number(minVal)) return false;
                    if (maxVal !== undefined && maxVal !== '' && val !== undefined && Number(val) > Number(maxVal)) return false;
                } else if (f.key) {
                    const filterVal = filterAttrs[f.key];
                    if (filterVal && filterVal !== '' && filterVal !== 'undefined') {
                         const itemVal = a[f.key];
                         if (itemVal !== undefined && String(itemVal).toLowerCase() !== String(filterVal).toLowerCase()) return false;
                    }
                }
            }
            return true;
        });
        setFilteredListings(next);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  }, [
    categorySlug,
    subcategorySlug,
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
          setHasAlarm(savedSearches.length > 0);
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
      const brand = typeof filterAttrs['marka'] === 'string' ? filterAttrs['marka'] : undefined;
      const model = typeof filterAttrs['model'] === 'string' ? filterAttrs['model'] : undefined;
      const series = typeof filterAttrs['seri'] === 'string' ? filterAttrs['seri'] : undefined;

      if (field.key === 'model' && brand) {
          const map = (BRAND_MODELS[overrideKey] || BRAND_MODELS['vasita/otomobil']) as Record<string, any>; 
          return (map?.[brand] as string[] | undefined) || [];
      }
      if (field.key === 'seri' && brand && model) {
          const map = (MODEL_SERIES[overrideKey] || MODEL_SERIES['vasita/otomobil']) as Record<string, any>;
          return (map?.[brand]?.[model] as string[] | undefined) || [];
      }
      if (field.key === 'paket' && brand && model && series) {
          const map = (SERIES_TRIMS[overrideKey] || SERIES_TRIMS['vasita/otomobil']) as Record<string, any>;
          return (map?.[brand]?.[model]?.[series] as string[] | undefined) || [];
      }

      return field.options || [];
  };

  const renderFilters = () => (
    <div className="bg-white rounded-2xl p-6 shadow-2xl text-gray-900">
      <div className="mb-6 relative">
        <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
            type="text"
            placeholder={`${subcategory ? subcategory.name : category.name} taleplerinde ara...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200"
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
        {/* Subcategories Filter */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
             <h3 className="text-gray-900 text-sm font-semibold mb-3 opacity-90">Alt Kategoriler</h3>
             <div className="space-y-2">
                <Link 
                    href={`/kategori/${categorySlug}`}
                    className={`flex items-center justify-between group ${!subcategorySlug ? 'text-cyan-600 font-bold' : 'text-gray-600 hover:text-cyan-600'}`}
                >
                    <span className="text-sm">Tümü</span>
                    {!subcategorySlug && <span className="w-2 h-2 bg-cyan-600 rounded-full"></span>}
                </Link>
                {category?.subcategories.map(sub => (
                    <Link
                        key={sub.slug}
                        href={`/kategori/${categorySlug}/${sub.slug}`}
                        className={`flex items-center justify-between group ${subcategorySlug === sub.slug ? 'text-cyan-600 font-bold' : 'text-gray-600 hover:text-cyan-600'}`}
                    >
                        <span className="text-sm">{sub.name}</span>
                        {subcategorySlug === sub.slug && <span className="w-2 h-2 bg-cyan-600 rounded-full"></span>}
                    </Link>
                ))}
             </div>
        </div>

        {/* Standard Filters */}
        <div className="grid grid-cols-1 gap-4">
            <FilterSelect
              label="Şehir"
              value={selectedCity}
              onChange={(val) => { setSelectedCity(val); setSelectedDistrict(''); }}
              placeholder="Tüm Şehirler"
              options={TURKEY_PROVINCES.map(p => p.name)}
            />
            <FilterSelect
              label="İlçe"
              value={selectedDistrict}
              onChange={setSelectedDistrict}
              placeholder="Tüm İlçeler"
              disabled={!selectedCity}
              options={selectedCity ? (TURKEY_PROVINCES.find(p => p.name === selectedCity)?.districts.map(d => d.name) || []) : []}
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

        {/* Dynamic Filters from Schema */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-4">
            <h3 className="text-gray-900 text-sm font-semibold mb-2 opacity-90">Detaylı Filtreler</h3>
            {combinedSchema.map((field, i) => {
                let isDisabled = false;
                if (field.key === 'model' && !filterAttrs['marka']) isDisabled = true;
                if (field.key === 'seri' && !filterAttrs['model']) isDisabled = true;
                if (field.key === 'paket' && !filterAttrs['seri']) isDisabled = true;

                if (field.type === 'select') {
                     return (
                        <FilterSelect
                            key={i}
                            label={field.label}
                            value={filterAttrs[field.key!] || ''}
                            onChange={(val) => handleFilterChange(field.key!, val)}
                            options={getFieldOptions(field)}
                            disabled={isDisabled}
                        />
                     );
                } else if (field.type === 'range-number') {
                    return (
                        <FilterRange
                            key={i}
                            label={field.label}
                            minValue={filterAttrs[field.minKey!] || ''}
                            maxValue={filterAttrs[field.maxKey!] || ''}
                            onMinChange={(val) => handleFilterChange(field.minKey!, val)}
                            onMaxChange={(val) => handleFilterChange(field.maxKey!, val)}
                        />
                    );
                } else if (field.type === 'boolean') {
                     return (
                        <FilterSelect
                            key={i}
                            label={field.label}
                            value={filterAttrs[field.key!] || ''}
                            onChange={(val) => handleFilterChange(field.key!, val)}
                            options={[{value:'true', label:'Evet'}, {value:'false', label:'Hayır'}]}
                        />
                     );
                } else {
                    return (
                        <FilterInput
                            key={i}
                            label={field.label}
                            value={filterAttrs[field.key!] || ''}
                            onChange={(val) => handleFilterChange(field.key!, val)}
                        />
                    );
                }
            })}
        </div>

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
                setSearchTerm(''); setSelectedCity(''); setSelectedDistrict(''); setPriceRange([0, 10000000]);
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

  const handleCreateAlarm = async () => {
    if (!session) {
      toast({
        title: "Giriş yapmalısınız",
        description: "Alarm oluşturmak için lütfen giriş yapın.",
        variant: "destructive"
      });
      return;
    }

    const query = searchTerm || (subcategory ? subcategory.name : category.name);

    const filters: FilterAttrs = {};
    if (selectedCity) filters.city = selectedCity;
    if (selectedDistrict) filters.district = selectedDistrict;
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
              <h1 className="text-xl font-bold text-gray-900">{subcategory ? subcategory.name : category.name}</h1>
              <p className="text-sm text-gray-500">{filteredListings.length} talep</p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
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
            ) : filteredListings.length === 0 ? (
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
                    setSearchTerm(''); setSelectedCity(''); setSelectedDistrict(''); setPriceRange([0, 10000000]);
                    setFilterAttrs({});
                  }}
                  className="mt-6 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                >
                  Filtreleri Temizle
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
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
