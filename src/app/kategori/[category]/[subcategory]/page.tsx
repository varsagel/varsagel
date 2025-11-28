"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { CATEGORIES } from '@/data/categories';
import { TURKEY_PROVINCES } from '@/data/turkey-locations';
import { ATTR_SCHEMAS } from '@/data/attribute-schemas';
import { ATTR_SUBSCHEMAS, BRAND_MODELS, MODEL_SERIES, SERIES_TRIMS, SERIES_TRIMS_EX, MODEL_SERIES_EXTRA, SERIES_TRIMS_EXTRA } from '@/data/attribute-overrides';
import { FILTER_PRESETS } from '@/data/filter-presets';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  location: {
    city: string;
    district: string;
  };
  images: string[];
  seller: {
    name: string;
    rating: number;
  };
  createdAt: string;
  status: "active" | "sold";
  viewCount: number;
  isFavorited: boolean;
  attributes?: Record<string, any>;
}

export default function SubcategoryPage() {
  const params = useParams();
  const router = useRouter();
  const sp = useSearchParams();
  const categorySlug = params.category as string;
  const subcategorySlug = params.subcategory as string;
  const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || '');
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  
  // Filtre state'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [selectedCity, setSelectedCity] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [jobType, setJobType] = useState('all');
  const isOtomobil = categorySlug === 'vasita' && subcategorySlug === 'otomobil';
  const isEmlak = categorySlug === 'emlak';
  const [fBrand, setFBrand] = useState('');
  const [fModel, setFModel] = useState('');
  const [fFuel, setFFuel] = useState('');
  const [fGear, setFGear] = useState('');
  const [fSeries, setFSeries] = useState('');
  const [fPackage, setFPackage] = useState('');
  const [fYearMin, setFYearMin] = useState<number | ''>('');
  const [fYearMax, setFYearMax] = useState<number | ''>('');
  const [fKmMin, setFKmMin] = useState<number | ''>('');
  const [fKmMax, setFKmMax] = useState<number | ''>('');
  const [eM2Min, setEM2Min] = useState<number | ''>('');
  const [eM2Max, setEM2Max] = useState<number | ''>('');
  const [eRooms, setERooms] = useState('');
  const [eHeating, setEHeating] = useState('');
  const [eFurnished, setEFurnished] = useState('');
  const [eBuildingAgeMin, setEBuildingAgeMin] = useState<number | ''>('');
  const [eBuildingAgeMax, setEBuildingAgeMax] = useState<number | ''>('');
  const [eFloorMin, setEFloorMin] = useState<number | ''>('');
  const [eFloorMax, setEFloorMax] = useState<number | ''>('');
  const [eOnFloor, setEOnFloor] = useState('');
  const [eBalcony, setEBalcony] = useState('');
  const [eFeeMin, setEFeeMin] = useState<number | ''>('');
  const [eFeeMax, setEFeeMax] = useState<number | ''>('');
  const isYedekParca = categorySlug === 'yedek-parca-aksesuar';
  const isAlisveris = categorySlug === 'alisveris';
  const isPhone = categorySlug === 'alisveris' && subcategorySlug === 'cep-telefonu';
  const isIsMak = categorySlug === 'is-makineleri-sanayi';
  const isIsIlani = categorySlug === 'is-ilanlari';
  const isHayvan = categorySlug === 'hayvanlar-alemi';
  const [pType, setPType] = useState('');
  const [pCompat, setPCompat] = useState('');
  const [pBrand, setPBrand] = useState('');
  const [pModel, setPModel] = useState('');
  const [pCondition, setPCondition] = useState('');
  const [aCondition, setACondition] = useState('');
  const [aBrand, setABrand] = useState('');
  const [aModel, setAModel] = useState('');
  const [aWarranty, setAWarranty] = useState('');
  const [aColor, setAColor] = useState('');
  const [mType, setMType] = useState('');
  const [mHoursMin, setMHoursMin] = useState<number | ''>('');
  const [mHoursMax, setMHoursMax] = useState<number | ''>('');
  const [mPower, setMPower] = useState('');
  const [iWorkType, setIWorkType] = useState('');
  const [iExpMin, setIExpMin] = useState<number | ''>('');
  const [iExpMax, setIExpMax] = useState<number | ''>('');
  const [iSalaryMin, setISalaryMin] = useState<number | ''>('');
  const [iSalaryMax, setISalaryMax] = useState<number | ''>('');
  const [hSpecies, setHSpecies] = useState('');
  const [hAgeMin, setHAgeMin] = useState<number | ''>('');
  const [hAgeMax, setHAgeMax] = useState<number | ''>('');
  const [hGender, setHGender] = useState('');
  const [hVaccinated, setHVaccinated] = useState('');
  const [filterAttrs, setFilterAttrs] = useState<Record<string, any>>({});
  
  // Kategori bilgilerini bul
  const category = CATEGORIES.find(cat => cat.slug === categorySlug);
  const subcategory = category?.subcategories.find(sub => sub.slug === subcategorySlug);
  
  // Gerçek ilanları yükle
  useEffect(() => {
    fetchListings();
  }, [categorySlug, subcategorySlug]);

  useEffect(() => {
    const get = (k: string) => sp.get(k) || '';
    const num = (k: string) => {
      const v = sp.get(k); if (!v) return '' as any; const n = Number(v); return Number.isNaN(n) ? '' as any : n;
    };
    const sortMap: Record<string,string> = { 'newest':'date', 'price-low':'price-low', 'price-high':'price-high', 'popular':'date' };
    const s = sp.get('sort'); if (s) setSortBy(sortMap[s] || 'date');
    const cityQ = get('city'); if (cityQ) setSelectedCity(cityQ);
    const minP = num('minPrice'); const maxP = num('maxPrice'); if (minP!=='' || maxP!=='') setPriceRange([minP||0, maxP||10000000]);
    if (categorySlug === 'vasita' && subcategorySlug === 'otomobil') {
      const b = get('marka'); const m = get('model'); const y = get('yakit'); const v = get('vites'); const p = get('paket'); const s = get('seri');
      const yMin = num('yilMin'); const yMax = num('yilMax'); const kMin = num('kmMin'); const kMax = num('kmMax');
      if (b) setFBrand(b); if (m) setFModel(m); if (y) setFFuel(y); if (v) setFGear(v); if (p) setFPackage(p); if (s) setFSeries(s);
      if (yMin!=='') setFYearMin(yMin); if (yMax!=='') setFYearMax(yMax); if (kMin!=='') setFKmMin(kMin); if (kMax!=='') setFKmMax(kMax);
    }
    if (categorySlug === 'emlak') {
      const m2Min = num('metrekareMin'); const m2Max = num('metrekareMax'); const rooms = get('odaSayisi'); const heat = get('isitma'); const furn = get('esyali');
      const byMin = num('binaYasiMin'); const byMax = num('binaYasiMax'); const ksMin = num('katSayisiMin'); const ksMax = num('katSayisiMax'); const onFloor = get('bulunduguKat');
      const balcony = get('balkon'); const feeMin = num('aidatMin'); const feeMax = num('aidatMax');
      if (m2Min!=='') setEM2Min(m2Min); if (m2Max!=='') setEM2Max(m2Max); if (rooms) setERooms(rooms); if (heat) setEHeating(heat); if (furn) setEFurnished(furn);
      if (byMin!=='') setEBuildingAgeMin(byMin); if (byMax!=='') setEBuildingAgeMax(byMax); if (ksMin!=='') setEFloorMin(ksMin); if (ksMax!=='') setEFloorMax(ksMax);
      if (onFloor) setEOnFloor(onFloor); if (balcony) setEBalcony(balcony); if (feeMin!=='') setEFeeMin(feeMin); if (feeMax!=='') setEFeeMax(feeMax);
    }
    const schema = [ ...(ATTR_SCHEMAS[categorySlug] || []), ...(ATTR_SUBSCHEMAS[`${categorySlug}/${subcategorySlug}`] || []) ];
    const nextAttrs: Record<string, any> = {};
    schema.forEach(f => {
      if (f.type === 'range-number') {
        const a = num(f.minKey!); const b = num(f.maxKey!);
        if (a!=='') nextAttrs[f.minKey!] = a;
        if (b!=='') nextAttrs[f.maxKey!] = b;
      } else if (f.key) {
        const val = sp.get(f.key) || '';
        if (val) nextAttrs[f.key] = val;
      }
    });
    if (Object.keys(nextAttrs).length) setFilterAttrs(prev => ({ ...prev, ...nextAttrs }));
  }, [sp, categorySlug, subcategorySlug]);

  const fetchListings = async () => {
    try {
      const params = new URLSearchParams();
      if (categorySlug) params.set('category', categorySlug);
      if (subcategorySlug) params.set('subcategory', subcategorySlug);
      if (searchTerm) params.set('q', searchTerm);
      if (selectedCity && selectedCity !== 'all') params.set('city', selectedCity);
      if (priceRange[0]) params.set('minPrice', String(priceRange[0]));
      if (priceRange[1]) params.set('maxPrice', String(priceRange[1]));
      const sortMap: Record<string, string> = { date: 'newest', 'price-high': 'price-high', 'price-low': 'price-low' };
      const sortParam = sortMap[sortBy] || 'newest';
      params.set('sort', sortParam);
      if (isOtomobil) {
        if (fBrand) params.set('marka', fBrand);
        if (fModel) params.set('model', fModel);
        if (fFuel) params.set('yakit', fFuel);
        if (fGear) params.set('vites', fGear);
        if (fPackage) params.set('paket', fPackage);
        if (fSeries) params.set('seri', fSeries);
        if (fYearMin) params.set('yilMin', String(fYearMin));
        if (fYearMax) params.set('yilMax', String(fYearMax));
        if (fKmMin) params.set('kmMin', String(fKmMin));
        if (fKmMax) params.set('kmMax', String(fKmMax));
      }
      if (isEmlak) {
        if (eM2Min) params.set('metrekareMin', String(eM2Min));
        if (eM2Max) params.set('metrekareMax', String(eM2Max));
        if (eRooms) params.set('odaSayisi', eRooms);
        if (eHeating) params.set('isitma', eHeating);
        if (eFurnished) params.set('esyali', eFurnished);
        if (eBuildingAgeMin) params.set('binaYasiMin', String(eBuildingAgeMin));
        if (eBuildingAgeMax) params.set('binaYasiMax', String(eBuildingAgeMax));
        if (eFloorMin) params.set('katSayisiMin', String(eFloorMin));
        if (eFloorMax) params.set('katSayisiMax', String(eFloorMax));
        if (eOnFloor) params.set('bulunduguKat', eOnFloor);
        if (eBalcony) params.set('balkon', eBalcony);
        if (eFeeMin) params.set('aidatMin', String(eFeeMin));
        if (eFeeMax) params.set('aidatMax', String(eFeeMax));
      }
      if (isYedekParca) {
        if (pType) params.set('parcaTuru', pType);
        if (pCompat) params.set('uyumluArac', pCompat);
        if (pCondition) params.set('durum', pCondition);
        if (pBrand) params.set('marka', pBrand);
        if (pModel) params.set('model', pModel);
      }
      if (isAlisveris) {
        if (aCondition) params.set('urunDurumu', aCondition);
        if (aBrand) params.set('marka', aBrand);
        if (aModel) params.set('model', aModel);
        if (aWarranty) params.set('garanti', aWarranty);
        if (aColor) params.set('renk', aColor);
      }
      if (isIsMak) {
        if (mType) params.set('makineTuru', mType);
        if (mHoursMin) params.set('saatMin', String(mHoursMin));
        if (mHoursMax) params.set('saatMax', String(mHoursMax));
        if (mPower) params.set('gucKapasite', mPower);
      }
      if (isIsIlani) {
        if (iWorkType) params.set('calismaSekli', iWorkType);
        if (iExpMin) params.set('deneyimMin', String(iExpMin));
        if (iExpMax) params.set('deneyimMax', String(iExpMax));
        if (iSalaryMin) params.set('maasMin', String(iSalaryMin));
        if (iSalaryMax) params.set('maasMax', String(iSalaryMax));
      }
      if (isHayvan) {
        if (hSpecies) params.set('tur', hSpecies);
        if (hAgeMin) params.set('yasMin', String(hAgeMin));
        if (hAgeMax) params.set('yasMax', String(hAgeMax));
        if (hGender) params.set('cinsiyet', hGender);
        if (hVaccinated) params.set('asili', hVaccinated);
      }
      const schema = [
        ...((ATTR_SCHEMAS[categorySlug] || [])),
        ...((ATTR_SUBSCHEMAS[`${categorySlug}/${subcategorySlug}`] || [])),
      ];
      schema.forEach(f => {
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

      setLoading(true);
      const response = await fetch(`/api/listings?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setListings(data);
        let next = data as Listing[];
        if (isOtomobil) {
          next = next.filter((l) => {
            const a = l.attributes || {};
            if (fBrand && (a.marka || '').toLowerCase() !== fBrand.toLowerCase()) return false;
            if (fModel && (a.model || '').toLowerCase() !== fModel.toLowerCase()) return false;
            if (fFuel && (a.yakit || '').toLowerCase() !== fFuel.toLowerCase()) return false;
            if (fGear && (a.vites || '').toLowerCase() !== fGear.toLowerCase()) return false;
            const yMin = a.yilMin ?? a.yil;
            const yMax = a.yilMax ?? a.yil;
            const kMin = a.kmMin ?? a.km;
            const kMax = a.kmMax ?? a.km;
            if (fYearMin !== '' && yMin !== undefined && Number(yMin) < Number(fYearMin)) return false;
            if (fYearMax !== '' && yMax !== undefined && Number(yMax) > Number(fYearMax)) return false;
            if (fKmMin !== '' && kMin !== undefined && Number(kMin) < Number(fKmMin)) return false;
            if (fKmMax !== '' && kMax !== undefined && Number(kMax) > Number(fKmMax)) return false;
            return true;
          });
        }
        setFilteredListings(next);
      } else {
        console.error('İlanlar yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('İlanlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Filtreleme ve sıralama useEffect'i
  useEffect(() => {
    fetchListings();
  }, [searchTerm, selectedCity, priceRange, sortBy, fBrand, fModel, fFuel, fGear, fYearMin, fYearMax, fKmMin, fKmMax, eM2Min, eM2Max, eRooms, eHeating, eFurnished, eBuildingAgeMin, eBuildingAgeMax, eFloorMin, eFloorMax, eOnFloor, eBalcony, eFeeMin, eFeeMax, pType, pCompat, pBrand, pCondition, aCondition, aBrand, aModel, aWarranty, aColor, mType, mHoursMin, mHoursMax, mPower, iWorkType, iExpMin, iExpMax, iSalaryMin, iSalaryMax, hSpecies, hAgeMin, hAgeMax, hGender, hVaccinated, filterAttrs]);
  
  if (!category || !subcategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Kategori Bulunamadı</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            Ana Sayfaya Dön
          </Link>
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
  
  const handleViewListing = (id: string) => {
    router.push(`/ilan/${id}`);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link href="/" className="text-blue-400 hover:text-blue-300 mb-2 inline-block">
                ← Ana Sayfaya Dön
              </Link>
              <h1 className="text-4xl font-bold text-white mb-2">
                {category.name} - {subcategory.name}
              </h1>
              <p className="text-gray-300">{filteredListings.length} ilan bulundu</p>
            </div>
            
            {/* Görünüm Modu */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* NLP Özet */}
          {typeof window !== 'undefined' && window.location.search && (
            <div className="mt-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3">
              <div className="text-white text-sm font-semibold mb-2">Algılanan filtreler</div>
              <div className="flex flex-wrap gap-2">
                {Array.from(new URLSearchParams(window.location.search)).filter(([k,v])=> k!=='category' && k!=='subcategory' && v).slice(0,12).map(([k,v])=> (
                  <span key={`${k}-${v}`} className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">{k}: {v}</span>
                ))}
              </div>
            </div>
          )}

          {/* Arama ve Filtreleme */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
            {/* Preset Filtreler */}
            {FILTER_PRESETS[`${categorySlug}/${subcategorySlug}`] && (
              <div className="mb-6 flex flex-wrap gap-2">
                {FILTER_PRESETS[`${categorySlug}/${subcategorySlug}`].map(p => (
                  <button
                    key={p.name}
                    onClick={() => setFilterAttrs(prev => ({ ...prev, ...p.params }))}
                    className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
            {/* Arama Çubuğu */}
            <div className="mb-6">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder={`${subcategory.name} ilanlarında ara...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
            </div>
            
            {/* Filtreler */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Şehir Filtresi */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Şehir</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tüm Şehirler</option>
                  {TURKEY_PROVINCES.map((province) => (
                    <option key={province.name} value={province.name}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>

              {isOtomobil ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Marka</label>
                    <select value={fBrand} onChange={(e)=>{ setFBrand(e.target.value); setFModel(''); setFSeries(''); }} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Tümü</option>
                      {Object.keys(BRAND_MODELS['vasita/otomobil']).sort((a,b)=> a.localeCompare(b,'tr')).map((o)=> (<option key={o} value={o}>{o}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Model</label>
                    <select value={fModel} onChange={(e)=>{ setFModel(e.target.value); setFSeries(''); }} disabled={!fBrand} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Tümü</option>
                      {(() => {
                        const base = BRAND_MODELS['vasita/otomobil'][fBrand] || [];
                        const extra = Object.keys(((MODEL_SERIES_EXTRA['vasita/otomobil'] || {})[fBrand] || {}));
                        const list = Array.from(new Set([...(base as any), ...(extra as any)])).slice().sort((a,b)=> a.localeCompare(b,'tr'));
                        return list.map((m)=> (<option key={m} value={m}>{m}</option>));
                      })()}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Motor/Seri</label>
                    <select value={fSeries} onChange={(e)=>setFSeries(e.target.value)} disabled={!fBrand || !fModel} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Tümü</option>
                      {(() => {
                        const base = (((MODEL_SERIES['vasita/otomobil'] || {})[fBrand] || {})[fModel] || []);
                        const extra = (((MODEL_SERIES_EXTRA['vasita/otomobil'] || {})[fBrand] || {})[fModel] || []);
                        const list = Array.from(new Set([...(base as any), ...(extra as any)])).slice().sort((a,b)=> a.localeCompare(b,'tr'));
                        const effective = list.length ? list : ['Standart'];
                        return effective.map((o)=> (<option key={o} value={o}>{o}</option>));
                      })()}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Donanım/Paket</label>
                    <select value={fPackage} onChange={(e)=>setFPackage(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Tümü</option>
                      {(() => {
                        const base = (((SERIES_TRIMS['vasita/otomobil'] || {})[fBrand] || {})[fModel] || {})[fSeries] || [];
                        const extra = (((SERIES_TRIMS_EXTRA['vasita/otomobil'] || {})[fBrand] || {})[fModel] || {})[fSeries] || [];
                        const list = Array.from(new Set([...(base as any), ...(extra as any)])).slice().sort((a,b)=> a.localeCompare(b,'tr'));
                        const effective = list.length ? list : ['Base','Comfort','Elegance','Premium','Sport','AMG Line','M Sport','S-Line','Trendline','Highline'];
                        return effective.map((o)=> (<option key={o} value={o}>{o}</option>));
                      })()}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Yakıt</label>
                    <select value={fFuel} onChange={(e)=>setFFuel(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Tümü</option>
                      {['Benzin','Dizel','LPG','Elektrik','Hibrit'].map((o)=> (<option key={o} value={o}>{o}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vites</label>
                    <select value={fGear} onChange={(e)=>setFGear(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Tümü</option>
                      {['Manuel','Otomatik'].map((o)=> (<option key={o} value={o}>{o}</option>))}
                    </select>
                  </div>
                </>
              ) : (categorySlug === 'vasita') ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Marka</label>
                    <select value={String(filterAttrs.marka ?? '')} onChange={(e)=> setFilterAttrs(prev=> ({ ...prev, marka: e.target.value, model: '', seri: '', paket: '' }))} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Tümü</option>
                      {Object.keys(BRAND_MODELS[`vasita/${subcategorySlug}`] || {}).sort((a,b)=> a.localeCompare(b,'tr')).map((o)=> (<option key={o} value={o}>{o}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                    <select value={String(filterAttrs.model ?? '')} onChange={(e)=> setFilterAttrs(prev=> ({ ...prev, model: e.target.value, seri: '', paket: '' }))} disabled={!String(filterAttrs.marka ?? '')} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                      <option value="">Tümü</option>
                      {((BRAND_MODELS[`vasita/${subcategorySlug}`] || {})[String(filterAttrs.marka ?? '')] || []).slice().sort((a,b)=> a.localeCompare(b,'tr')).map((m)=> (<option key={m} value={m}>{m}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Donanım/Paket</label>
                    <select value={String(filterAttrs.paket ?? '')} onChange={(e)=> setFilterAttrs(prev=> ({ ...prev, paket: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Tümü</option>
                      {((((SERIES_TRIMS_EX[`vasita/${subcategorySlug}`] || {})[String(filterAttrs.marka ?? '')] || {})[String(filterAttrs.model ?? '')] || {})[String(filterAttrs.seri ?? '')] || (ATTR_SUBSCHEMAS[`vasita/${subcategorySlug}`] || []).find(f=> f.key==='paket')?.options || ['Standart','Konfor','Lüks']).map((o:any)=> (<option key={o} value={o}>{o}</option>))}
                  </select>
                 </div>
                </>
              ) : isPhone ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Marka</label>
                    <select value={aBrand} onChange={(e)=>{ setABrand(e.target.value); setAModel(''); }} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Tümü</option>
                      {Object.keys(BRAND_MODELS['alisveris/cep-telefonu']).sort((a,b)=> a.localeCompare(b,'tr')).map((o)=> (<option key={o} value={o}>{o}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Model</label>
                    <select value={aModel} onChange={(e)=>setAModel(e.target.value)} disabled={!aBrand} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Tümü</option>
                      {(BRAND_MODELS['alisveris/cep-telefonu'][aBrand]?.slice().sort((a,b)=> a.localeCompare(b,'tr')).map((m)=> (<option key={m} value={m}>{m}</option>))) ?? null}
                    </select>
                  </div>
                </>
              ) : (categorySlug === 'alisveris' && ['bilgisayar','televizyon','tablet','akilli-saat','beyaz-esya','fotograf-makinesi','oyun-konsolu','kucuk-ev-aletleri'].includes(subcategorySlug)) ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Marka</label>
                    <select value={aBrand} onChange={(e)=>{ setABrand(e.target.value); setAModel(''); }} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Tümü</option>
                      {Object.keys(BRAND_MODELS[`alisveris/${subcategorySlug}`]).sort((a,b)=> a.localeCompare(b,'tr')).map((o)=> (<option key={o} value={o}>{o}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Model</label>
                    <select value={aModel} onChange={(e)=>setAModel(e.target.value)} disabled={!aBrand} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Tümü</option>
                      {(BRAND_MODELS[`alisveris/${subcategorySlug}`][aBrand]?.slice().sort((a,b)=> a.localeCompare(b,'tr')).map((m)=> (<option key={m} value={m}>{m}</option>))) ?? null}
                    </select>
                  </div>
                </>
              ) : isEmlak ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Metrekare (Min)</label>
                    <input type="number" value={eM2Min as any} onChange={(e)=>setEM2Min(e.target.value ? Number(e.target.value) : '')} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Metrekare (Max)</label>
                    <input type="number" value={eM2Max as any} onChange={(e)=>setEM2Max(e.target.value ? Number(e.target.value) : '')} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Oda Sayısı</label>
                    <select value={eRooms} onChange={(e)=>setERooms(e.target.value)} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Tümü</option>
                      {['1+0','1+1','2+1','3+1','4+1','4+2','5+1'].map((o)=> (<option key={o} value={o}>{o}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Isıtma</label>
                    <select value={eHeating} onChange={(e)=>setEHeating(e.target.value)} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Tümü</option>
                      {['Doğalgaz','Klima','Soba','Yerden Isıtma','Yok'].map((o)=> (<option key={o} value={o}>{o}</option>))}
                    </select>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">İş Tipi</label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tüm İş Tipleri</option>
                    <option value="Tam Zamanlı">Tam Zamanlı</option>
                    <option value="Yarı Zamanlı">Yarı Zamanlı</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Staj">Staj</option>
                    <option value="Sözleşmeli">Sözleşmeli</option>
                  </select>
                </div>
              )}

              {/* Fiyat/Maaş veya Otomobil Yıl/Km */}
              <div>
                {isOtomobil ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Yıl (Min)</label>
                      <input type="number" value={fYearMin as any} onChange={(e)=>setFYearMin(e.target.value ? Number(e.target.value) : '')} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Yıl (Max)</label>
                      <input type="number" value={fYearMax as any} onChange={(e)=>setFYearMax(e.target.value ? Number(e.target.value) : '')} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Km (Min)</label>
                      <input type="number" value={fKmMin as any} onChange={(e)=>setFKmMin(e.target.value ? Number(e.target.value) : '')} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Km (Max)</label>
                      <input type="number" value={fKmMax as any} onChange={(e)=>setFKmMax(e.target.value ? Number(e.target.value) : '')} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                ) : isEmlak ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Bina Yaşı (Min)</label>
                      <input type="number" value={eBuildingAgeMin as any} onChange={(e)=>setEBuildingAgeMin(e.target.value ? Number(e.target.value) : '')} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Bina Yaşı (Max)</label>
                      <input type="number" value={eBuildingAgeMax as any} onChange={(e)=>setEBuildingAgeMax(e.target.value ? Number(e.target.value) : '')} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Kat Sayısı (Min)</label>
                      <input type="number" value={eFloorMin as any} onChange={(e)=>setEFloorMin(e.target.value ? Number(e.target.value) : '')} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Kat Sayısı (Max)</label>
                      <input type="number" value={eFloorMax as any} onChange={(e)=>setEFloorMax(e.target.value ? Number(e.target.value) : '')} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-300 mb-1">Bulunduğu Kat</label>
                      <select value={eOnFloor} onChange={(e)=>setEOnFloor(e.target.value)} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Tümü</option>
                        {['Giriş Kat','Ara Kat','En Üst Kat','Zemin','Bahçe Katı'].map((o)=> (<option key={o} value={o}>{o}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Balkon</label>
                      <select value={eBalcony} onChange={(e)=>setEBalcony(e.target.value)} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Tümü</option>
                        <option value="true">Var</option>
                        <option value="false">Yok</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Aidat (Min)</label>
                      <input type="number" value={eFeeMin as any} onChange={(e)=>setEFeeMin(e.target.value ? Number(e.target.value) : '')} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Aidat (Max)</label>
                      <input type="number" value={eFeeMax as any} onChange={(e)=>setEFeeMax(e.target.value ? Number(e.target.value) : '')} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                ) : (
                  <>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Maaş Aralığı: {priceRange[0].toLocaleString('tr-TR')} - {priceRange[1].toLocaleString('tr-TR')} TL</label>
                    <div className="flex space-x-2">
                      <input type="number" placeholder="Min" value={priceRange[0]} onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <input type="number" placeholder="Max" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 100000])} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </>
                )}
              </div>

              {/* Sıralama */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sırala</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Tarihe Göre</option>
                  <option value="price-high">Fiyat (Yüksekten Düşüğe)</option>
                  <option value="price-low">Fiyat (Düşükten Yükseğe)</option>
                  <option value="seller">Satıcıya Göre</option>
                </select>
              </div>

              {/* Temizle Butonu */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCity('all');
                    setJobType('all');
                    setFilterAttrs({});
                    if (isOtomobil) {
                      setFBrand('');
                      setFModel('');
                      setFFuel('');
                      setFGear('');
                      setFYearMin('');
                      setFYearMax('');
                      setFKmMin('');
                      setFKmMax('');
                    }
                    if (isEmlak) {
                      setEM2Min('');
                      setEM2Max('');
                      setERooms('');
                      setEHeating('');
                      setEFurnished('');
                      setEBuildingAgeMin('');
                      setEBuildingAgeMax('');
                      setEFloorMin('');
                      setEFloorMax('');
                      setEOnFloor('');
                      setEBalcony('');
                      setEFeeMin('');
                      setEFeeMax('');
                    }
                    if (isYedekParca) {
                      setPType('');
                      setPCompat('');
                      setPBrand('');
                      setPCondition('');
                    }
                    if (isAlisveris) {
                      setACondition('');
                      setABrand('');
                      setAModel('');
                      setAWarranty('');
                      setAColor('');
                    }
                    if (isIsMak) {
                      setMType('');
                      setMHoursMin('');
                      setMHoursMax('');
                      setMPower('');
                    }
                    if (isIsIlani) {
                      setIWorkType('');
                      setIExpMin('');
                      setIExpMax('');
                      setISalaryMin('');
                      setISalaryMax('');
                    }
                    if (isHayvan) {
                      setHSpecies('');
                      setHAgeMin('');
                      setHAgeMax('');
                      setHGender('');
                      setHVaccinated('');
                    }
                    setPriceRange([0, 100000]);
                    setSortBy('date');
                  }}
                  className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-2 px-4 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                >
                  Temizle
                </button>
              </div>
            </div>

            {/* Otomobil için ek Yakıt/Vites grubu kaldırıldı: üstte zaten mevcut */}
            {isEmlak && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bina Yaşı</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" value={eBuildingAgeMin as any} onChange={(e)=>setEBuildingAgeMin(e.target.value ? Number(e.target.value) : '')} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input type="number" value={eBuildingAgeMax as any} onChange={(e)=>setEBuildingAgeMax(e.target.value ? Number(e.target.value) : '')} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Kat Sayısı</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" value={eFloorMin as any} onChange={(e)=>setEFloorMin(e.target.value ? Number(e.target.value) : '')} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input type="number" value={eFloorMax as any} onChange={(e)=>setEFloorMax(e.target.value ? Number(e.target.value) : '')} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bulunduğu Kat</label>
                  <select value={eOnFloor} onChange={(e)=>setEOnFloor(e.target.value)} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Tümü</option>
                    {['Giriş Kat','Ara Kat','En Üst Kat','Zemin','Bahçe Katı'].map((o)=> (<option key={o} value={o}>{o}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Balkon</label>
                  <select value={eBalcony} onChange={(e)=>setEBalcony(e.target.value)} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Tümü</option>
                    <option value="true">Var</option>
                    <option value="false">Yok</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Aidat</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" value={eFeeMin as any} onChange={(e)=>setEFeeMin(e.target.value ? Number(e.target.value) : '')} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input type="number" value={eFeeMax as any} onChange={(e)=>setEFeeMax(e.target.value ? Number(e.target.value) : '')} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
            )}
            {isYedekParca && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Parça Türü</label>
                  <input value={pType} onChange={(e)=>setPType(e.target.value)} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Uyumlu Araç</label>
                  <input value={pCompat} onChange={(e)=>setPCompat(e.target.value)} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Durum</label>
                  <select value={pCondition} onChange={(e)=>setPCondition(e.target.value)} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Tümü</option>
                    <option value="Sıfır">Sıfır</option>
                    <option value="İkinci El">İkinci El</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Marka</label>
                  <select value={pBrand} onChange={(e)=>{ setPBrand(e.target.value); setPModel(''); }} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Tümü</option>
                    {Object.keys(BRAND_MODELS[`yedek-parca-aksesuar/${subcategorySlug}`] || {}).map((o)=> (<option key={o} value={o}>{o}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Model</label>
                  <select value={pModel} onChange={(e)=>setPModel(e.target.value)} disabled={!pBrand} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                    <option value="">Tümü</option>
                    {((BRAND_MODELS[`yedek-parca-aksesuar/${subcategorySlug}`] || {})[pBrand] || []).map((m)=> (<option key={m} value={m}>{m}</option>))}
                  </select>
                </div>
              </div>
            )}
            {isAlisveris && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Durumu</label>
                  <select value={aCondition} onChange={(e)=>setACondition(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Tümü</option>
                    <option value="Sıfır">Sıfır</option>
                    <option value="İkinci El">İkinci El</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Marka</label>
                  <input value={aBrand} onChange={(e)=>setABrand(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Garanti</label>
                  <select value={aWarranty} onChange={(e)=>setAWarranty(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Tümü</option>
                    <option value="true">Var</option>
                    <option value="false">Yok</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Renk</label>
                  <input value={aColor} onChange={(e)=>setAColor(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            )}
            {isIsMak && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Makine Türü</label>
                  <input value={mType} onChange={(e)=>setMType(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Çalışma Saati</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" value={mHoursMin as any} onChange={(e)=>setMHoursMin(e.target.value ? Number(e.target.value) : '')} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input type="number" value={mHoursMax as any} onChange={(e)=>setMHoursMax(e.target.value ? Number(e.target.value) : '')} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Güç/Kapasite</label>
                  <input value={mPower} onChange={(e)=>setMPower(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            )}
            {isIsIlani && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Çalışma Şekli</label>
                  <select value={iWorkType} onChange={(e)=>setIWorkType(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Tümü</option>
                    <option value="Tam Zamanlı">Tam Zamanlı</option>
                    <option value="Yarı Zamanlı">Yarı Zamanlı</option>
                    <option value="Uzaktan">Uzaktan</option>
                    <option value="Staj">Staj</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Deneyim (Yıl)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" value={iExpMin as any} onChange={(e)=>setIExpMin(e.target.value ? Number(e.target.value) : '')} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input type="number" value={iExpMax as any} onChange={(e)=>setIExpMax(e.target.value ? Number(e.target.value) : '')} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Maaş Beklentisi</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" value={iSalaryMin as any} onChange={(e)=>setISalaryMin(e.target.value ? Number(e.target.value) : '')} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input type="number" value={iSalaryMax as any} onChange={(e)=>setISalaryMax(e.target.value ? Number(e.target.value) : '')} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
            )}
            {isHayvan && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tür</label>
                  <input value={hSpecies} onChange={(e)=>setHSpecies(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Yaş</label>
                  <div className="grid grid-cols-2 gap-2">
                  <input type="number" value={hAgeMin as any} onChange={(e)=>setHAgeMin(e.target.value ? Number(e.target.value) : '')} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="number" value={hAgeMax as any} onChange={(e)=>setHAgeMax(e.target.value ? Number(e.target.value) : '')} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cinsiyet</label>
                  <select value={hGender} onChange={(e)=>setHGender(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Tümü</option>
                    <option value="Erkek">Erkek</option>
                    <option value="Dişi">Dişi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aşılı</label>
                  <select value={hVaccinated} onChange={(e)=>setHVaccinated(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Tümü</option>
                    <option value="true">Evet</option>
                    <option value="false">Hayır</option>
                  </select>
                </div>
              </div>
            )}
            {(() => {
              const base = (ATTR_SCHEMAS[categorySlug] || []);
              const override = (ATTR_SUBSCHEMAS[`${categorySlug}/${subcategorySlug}`] || []);
              if (!base.length && !override.length) return null;
              const map = new Map<string, typeof base[number]>();
              [...base, ...override].forEach((f) => {
                const id = f.key ? `k:${f.key}` : (f.minKey && f.maxKey) ? `r:${f.minKey}:${f.maxKey}` : `l:${f.label}`;
                map.set(id, f);
              });
              let fields = Array.from(map.values());
              const suppress = new Set<string>();
              if (isOtomobil) {
                ['marka','model','yakit','vites','yilMin','yilMax','kmMin','kmMax'].forEach(k=> suppress.add(k));
              }
              if (categorySlug === 'vasita' && !isOtomobil) {
                ['marka','model'].forEach(k=> suppress.add(k));
              }
              if (isPhone || (categorySlug === 'alisveris' && ['bilgisayar','televizyon','tablet','akilli-saat','beyaz-esya'].includes(subcategorySlug))) {
                ['marka','model'].forEach(k=> suppress.add(k));
              }
              if (isAlisveris) {
                ['urunDurumu','marka','garanti','renk'].forEach(k=> suppress.add(k));
              }
              if (isIsMak) {
                ['makineTuru','saatMin','saatMax','gucKapasite'].forEach(k=> suppress.add(k));
              }
              if (isIsIlani) {
                ['calismaSekli','deneyimMin','deneyimMax','maasMin','maasMax'].forEach(k=> suppress.add(k));
              }
              if (isHayvan) {
                ['tur','yasMin','yasMax','cinsiyet','asili'].forEach(k=> suppress.add(k));
              }
              if (isEmlak) {
                ['metrekareMin','metrekareMax','odaSayisi','isitma','esyali','binaYasiMin','binaYasiMax','katSayisiMin','katSayisiMax','bulunduguKat','balkon','aidatMin','aidatMax'].forEach(k=> suppress.add(k));
              }
              fields = fields.filter((f) => {
                if (f.type === 'range-number') {
                  return !(suppress.has(String(f.minKey)) || suppress.has(String(f.maxKey)));
                }
                if (f.key) {
                  return !suppress.has(f.key);
                }
                return true;
              });
              return (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {fields.map((f) => {
                    const id = f.key ? `k:${f.key}` : (f.minKey && f.maxKey) ? `r:${f.minKey}:${f.maxKey}` : `l:${f.label}`;
                    return (
                      <div key={id}>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{f.label}</label>
                        {f.type === 'select' ? (
                          <select
                            value={String(filterAttrs[f.key!] ?? '')}
                            onChange={(e)=> setFilterAttrs(prev=> ({ ...prev, [f.key!]: e.target.value }))}
                            className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Tümü</option>
                            {(f.options || []).map(o=> (<option key={o} value={o}>{o}</option>))}
                          </select>
                        ) : f.type === 'boolean' ? (
                          <select
                            value={String(filterAttrs[f.key!] ?? '')}
                            onChange={(e)=> setFilterAttrs(prev=> ({ ...prev, [f.key!]: e.target.value }))}
                            className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Tümü</option>
                            <option value="true">Evet</option>
                            <option value="false">Hayır</option>
                          </select>
                        ) : f.type === 'range-number' ? (
                          <div className="grid grid-cols-2 gap-2">
                            <input type="number" value={String(filterAttrs[f.minKey!] ?? '')} onChange={(e)=> setFilterAttrs(prev=> ({ ...prev, [f.minKey!]: e.target.value ? Number(e.target.value) : '' }))} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <input type="number" value={String(filterAttrs[f.maxKey!] ?? '')} onChange={(e)=> setFilterAttrs(prev=> ({ ...prev, [f.maxKey!]: e.target.value ? Number(e.target.value) : '' }))} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                        ) : f.type === 'multiselect' ? (
                          <select
                            multiple
                            value={String(filterAttrs[f.key!] ?? '').split(',').filter(Boolean)}
                            onChange={(e)=> {
                              const selected = Array.from((e.target as HTMLSelectElement).selectedOptions).map(o=> o.value)
                              setFilterAttrs(prev=> ({ ...prev, [f.key!]: selected.join(',') }))
                            }}
                            className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {(f.options || []).map(o=> (<option key={o} value={o}>{o}</option>))}
                          </select>
                        ) : (
                          <input type={f.type} value={String(filterAttrs[f.key!] ?? '')} onChange={(e)=> setFilterAttrs(prev=> ({ ...prev, [f.key!]: f.type === 'number' ? Number(e.target.value || 0) : e.target.value }))} className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
      </div>
    </div>
    
    {filteredListings.length > 0 && (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: filteredListings.map((l, idx) => ({
              '@type': 'ListItem',
              position: idx + 1,
              url: `${origin}/ilan/${l.id}`,
              name: l.title,
              offers: l.price ? { '@type': 'Offer', priceCurrency: 'TRY', price: String(l.price) } : undefined,
            })),
          }),
        }}
      />
    )}

    {/* İlanlar */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-4 text-white">İlanlar yükleniyor...</span>
          </div>
        ) : (
          <>
            {filteredListings.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-md mx-auto">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.306a7.962 7.962 0 00-6 0m6 0V5a2 2 0 00-2-2H9a2 2 0 00-2-2v1.306" />
                  </svg>
                  <h3 className="text-xl font-semibold text-white mb-2">İlan Bulunamadı</h3>
                  <p className="text-gray-300 mb-4">Aradığınız kriterlere uygun ilan bulunamadı.</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCity('all');
                      setJobType('all');
                      setPriceRange([0, 100000]);
                      setSortBy('date');
                    }}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg transition-all duration-200 font-medium"
                  >
                    Filtreleri Temizle
                  </button>
                </div>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
              }>
                {filteredListings.map((listing) => (
                  <Link
                    href={`/ilan/${listing.id}`}
                    key={listing.id}
                    className={`bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl block ${
                      viewMode === 'list' ? 'flex items-center p-4' : ''
                    }`}
                  >
                    {/* Görsel */}
                    <div className={`relative ${viewMode === 'list' ? 'w-32 h-32 flex-shrink-0 mr-4' : 'h-48'}`}>
                      <img
                        src={listing.images && listing.images.length ? listing.images[0] : '/images/placeholder-1.svg'}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => (e.currentTarget.src = '/images/placeholder-1.svg')}
                      />
                      <div className="absolute bottom-2 left-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2 py-1 rounded text-xs font-semibold shadow-md">
                        ₺{listing.price.toLocaleString('tr-TR')}
                      </div>
                      <button
                         onClick={(e) => {
                           e.preventDefault(); // Link'in tıklanmasını engelle
                           e.stopPropagation();
                           toggleFavorite(listing.id);
                         }}
                         className="absolute top-2 right-2 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-200 z-10"
                       >
                        <svg
                          className={`w-5 h-5 ${favorites.has(listing.id) ? 'text-red-500 fill-current' : 'text-white'}`}
                          fill={favorites.has(listing.id) ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* İçerik */}
                    <div className={viewMode === 'list' ? 'flex-1' : 'p-4'}>
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                        {listing.title}
                      </h3>
                      <p className="text-gray-300 text-sm mb-2 flex items-center">
                        <span className="mr-2">{listing.seller.name}</span>
                        <svg className="w-4 h-4 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L3.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                        <span className="text-white/80 text-xs bg-white/10 px-2 py-1 rounded">{listing.seller.rating}</span>
                      </p>
                      <p className="text-gray-400 text-sm mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {listing.location.city}
                      </p>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-white/80 text-xs bg-white/10 px-2 py-1 rounded">
                            {listing.status}
                          </span>
                          <span className="text-white/80 text-xs bg-white/10 px-2 py-1 rounded">
                            {listing.category}
                          </span>
                        </div>
                      </div>
                      <p className={`text-gray-400 text-sm mb-4 ${expandedIds.has(listing.id) ? '' : 'line-clamp-2'}`}>
                        {listing.description}
                      </p>
                      {(() => {
                        const a = listing.attributes || {};
                        const chips: string[] = [];
                        Object.keys(a).forEach((k) => {
                          const val = a[k];
                          if (val && typeof val === 'string' && val.includes(',')) {
                            const parts = val.split(',').map(p => p.trim()).filter(Boolean);
                            parts.slice(0, 4).forEach(p => chips.push(p));
                          }
                        });
                        return chips.length ? (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {chips.map((c) => (
                              <span key={c} className="text-white/80 text-xs bg-white/10 px-2 py-1 rounded">{c}</span>
                            ))}
                          </div>
                        ) : null;
                      })()}
                      {(() => {
                        if (!expandedIds.has(listing.id)) return null;
                        const a = listing.attributes || {};
                        const pairs: Record<string, { min?: any; max?: any }> = {};
                        const singles: Array<{ k: string; v: any }> = [];
                        Object.keys(a).forEach((k) => {
                          const v = a[k];
                          if (k.endsWith('Min')) {
                            const base = k.slice(0, -3); pairs[base] = pairs[base] || {}; pairs[base].min = v;
                          } else if (k.endsWith('Max')) {
                            const base = k.slice(0, -3); pairs[base] = pairs[base] || {}; pairs[base].max = v;
                          } else {
                            if (v !== undefined && v !== '') singles.push({ k, v });
                          }
                        });
                        const toLabel = (key: string) => {
                          const map: Record<string,string> = { marka:'Marka', model:'Model', yakit:'Yakıt', vites:'Vites', yil:'Yıl', km:'Kilometre', urunDurumu:'Ürün Durumu', garanti:'Garanti', renk:'Renk', ekranBoyutu:'Ekran Boyutu', cozunurluk:'Çözünürlük', hdr:'HDR', yenilemeOrani:'Yenileme', panelTipi:'Panel', metrekare:'Metrekare', odaSayisi:'Oda Sayısı', isitma:'Isıtma', esyali:'Eşyalı' };
                          return map[key] || key.charAt(0).toUpperCase() + key.slice(1);
                        };
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                            {Object.entries(pairs).map(([base, v]) => (
                              (v.min !== undefined || v.max !== undefined) ? (
                                <div key={base} className="flex items-center justify-between text-gray-300 text-xs bg-white/5 px-2 py-1 rounded">
                                  <span className="text-white/80 font-semibold">{toLabel(base)}</span>
                                  <span>{v.min ?? '—'}{(v.min !== undefined || v.max !== undefined) ? ' – ' : ''}{v.max ?? '—'}</span>
                                </div>
                              ) : null
                            ))}
                            {singles.slice(0, 8).map(({ k, v }) => (
                              <div key={k} className="flex items-center justify-between text-gray-300 text-xs bg-white/5 px-2 py-1 rounded">
                                <span className="text-white/80 font-semibold">{toLabel(k)}</span>
                                <span>{String(v)}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                      <div className="flex items-center justify-between">
                         <span className="text-gray-500 text-xs">
                           {new Date(listing.createdAt).toLocaleDateString('tr-TR')}
                         </span>
                         <button
                           onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpandedIds(prev => { const n = new Set(prev); if (n.has(listing.id)) n.delete(listing.id); else n.add(listing.id); return n; }); }}
                           className="text-xs px-2 py-1 rounded bg-white/10 text-white hover:bg-white/20"
                         >
                           {expandedIds.has(listing.id) ? 'Daralt' : 'Detayları göster'}
                         </button>
                       </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
        
        {/* Sonuç yok mesajı */}
        {!loading && listings.length === 0 && (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.306a7.962 7.962 0 00-6 0m6 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v1.306m8 0V7a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2h8a2 2 0 012-2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              Bu kategoride henüz ilan bulunmuyor
            </h3>
            <p className="text-gray-400 mb-4">
              İlk ilanı siz ekleyin!
            </p>
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
              İlan Ver
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
