"use client";

import { useState, useEffect, useRef } from "react";
import { ATTR_SCHEMAS } from '@/data/attribute-schemas';
import { ATTR_SUBSCHEMAS } from '@/data/attribute-overrides';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Filter, MapPin, Heart, Star, TrendingUp, Grid, List, Facebook, Twitter, Instagram } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CATEGORIES as STATIC_CATEGORIES, Category, SubCategory } from "@/data/categories";
import { TURKEY_PROVINCES, getDistrictsByProvince } from "@/data/turkey-locations";

export const dynamic = 'force-dynamic';

interface Listing {
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
  seller: {
    name: string;
    rating: number;
  };
  createdAt: string;
  status: "active" | "sold";
  viewCount: number;
  isFavorited: boolean;
}

export default function ModernSearchPage() {
  const router = useRouter();
  const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || '');
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "price-low" | "price-high" | "popular">("newest");
  const [showFilters, setShowFilters] = useState(true);
  const [categories, setCategories] = useState<any[]>(STATIC_CATEGORIES);
  const [topListings, setTopListings] = useState<any[]>([]);
  const [sliderInit, setSliderInit] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasSearch, setHasSearch] = useState(false);
  const [openCategory, setOpenCategory] = useState<string>("");
  const [categoryQuery, setCategoryQuery] = useState("");
  const [expandAll, setExpandAll] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const t = window.localStorage.getItem('expandAllCats');
      if (t === null) {
        setExpandAll(true);
        window.localStorage.setItem('expandAllCats', 'true');
      } else {
        setExpandAll(t === 'true');
      }
    }
  }, []);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingTop, setLoadingTop] = useState(true);
  const [aiTarget, setAiTarget] = useState<{ category: string; subcategory?: string } | null>(null);
  const [aiParams, setAiParams] = useState<Record<string, string>>({});
  const [aiPreviewCount, setAiPreviewCount] = useState<number | null>(null);
  const [aiCandidates, setAiCandidates] = useState<Array<{ category: string; subcategory?: string; params: Record<string,string>; score: number; preview?: number }>>([]);
  const autoSubmitTimer = useRef<any>(null);
  const normalizeCity = (name: string) => {
    const n = name?.trim(); if (!n) return '';
    const t = n.toLowerCase().replace(/ş/g,'s').replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ü/g,'u');
    const hit = TURKEY_PROVINCES.find(p => p.name.toLowerCase().replace(/ş/g,'s').replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ü/g,'u') === t)
      || TURKEY_PROVINCES.find(p => t.includes(p.name.toLowerCase().replace(/ş/g,'s').replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ü/g,'u')))
      || TURKEY_PROVINCES.find(p => {
        const a = p.name.toLowerCase().replace(/ş/g,'s').replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ü/g,'u');
        const m = Math.abs(a.length - t.length);
        return m <= 2 && a.split('').filter((c,i)=> c!==t[i]).length <= 2;
      });
    return hit?.name || name;
  };
  const normalizeDistrict = (city: string, district: string) => {
    const c = normalizeCity(city); if (!district) return '';
    const ds = getDistrictsByProvince(c) || []; const d = district.toLowerCase();
    const hit = ds.find(x => String(x.name).toLowerCase() === d) || ds.find(x => d.includes(String(x.name).toLowerCase()));
    return hit?.name || district;
  };
  const runAiApply = async (target: { category: string; subcategory?: string } | null, params: Record<string,string>) => {
    if (!target) return;
    setHasSearch(true);
    setLoadingListings(true);
    const adj = { ...params } as Record<string,string>;
    if (adj.city) adj.city = normalizeCity(adj.city);
    if (adj.district) adj.district = normalizeDistrict(adj.city || '', adj.district);
    const qs = new URLSearchParams();
    if (target.category) qs.set('category', target.category);
    if (target.subcategory) qs.set('subcategory', target.subcategory);
    Object.entries(adj).forEach(([k,v])=> { if (v != null && String(v).trim() !== '') qs.set(k, String(v)); });
    const p = qs.toString();
    const res = await fetch(`/api/listings?${p}`);
    if (res.ok) {
      const data = await res.json();
      let finalData = Array.isArray(data) ? data : [];
      if (finalData.length === 0) {
        const pLite = new URLSearchParams({ category: target.category, subcategory: target.subcategory || '' }).toString();
        const resLite = await fetch(`/api/listings?${pLite}`);
        if (resLite.ok) {
          const liteData = await resLite.json();
          finalData = Array.isArray(liteData) ? liteData : [];
        }
      }
      setAiPreviewCount(Array.isArray(finalData) ? finalData.length : null);
      setListings(finalData);
      setFilteredListings(finalData);
      router.replace(p ? `/?${p}` : '/', { scroll: false });
      if (typeof window !== 'undefined') {
        try {
          const item = { category: target.category, subcategory: target.subcategory || '', params: adj, ts: Date.now() };
          const text = window.localStorage.getItem('aiSearchHistory');
          const arr = text ? JSON.parse(text) : [];
          const next = Array.isArray(arr) ? [item, ...arr].slice(0,5) : [item];
          setAiHistory(next);
          window.localStorage.setItem('aiSearchHistory', JSON.stringify(next));
        } catch {}
      }
    }
    setLoadingListings(false);
  };
  const getParamLabel = (k: string, v: string) => {
    const map: Record<string, (v:string)=>string> = {
      category: (x)=> `Kategori: ${x}`,
      subcategory: (x)=> `Alt: ${x}`,
      city: (x)=> `İl: ${x}`,
      district: (x)=> `İlçe: ${x}`,
      odaSayisi: (x)=> `Oda: ${x}`,
      metrekareMin: (x)=> `m² ≥ ${x}`,
      metrekareMax: (x)=> `m² ≤ ${x}`,
      balkon: (x)=> `Balkon: ${x==='true'?'Var':'Yok'}`,
      bulunduguKat: (x)=> `Kat: ${x}`,
      esyali: (x)=> `Eşyalı: ${x==='true'?'Evet':'Hayır'}`,
      binaYasiMin: (x)=> `Bina Yaşı ≥ ${x}`,
      binaYasiMax: (x)=> `Bina Yaşı ≤ ${x}`,
      katSayisiMin: (x)=> `Kat Sayısı ≥ ${x}`,
      katSayisiMax: (x)=> `Kat Sayısı ≤ ${x}`,
      aidatMin: (x)=> `Aidat ≥ ${x}`,
      aidatMax: (x)=> `Aidat ≤ ${x}`,
      asansor: (x)=> `Asansör: ${x==='true'?'Var':'Yok'}`,
      otopark: (x)=> `Otopark: ${x==='true'?'Var':'Yok'}`,
      siteIci: (x)=> `Site içi: ${x==='true'?'Evet':'Hayır'}`,
      krediyeUygun: (x)=> `Krediye Uygun: ${x==='true'?'Evet':'Hayır'}`,
      tapuDurumu: (x)=> `Tapu: ${x}`,
      cephe: (x)=> `Cephe: ${x}`,
      banyoSayisi: (x)=> `Banyo: ${x}`,
      ebeveynBanyosu: (x)=> `Ebeveyn Banyosu: ${x==='true'?'Var':'Yok'}`,
      isiYalitimi: (x)=> `Isı Yalıtımı: ${x==='true'?'Var':'Yok'}`,
      minPrice: (x)=> `Min ₺${x}`,
      maxPrice: (x)=> `Max ₺${x}`,
      yakit: (x)=> `Yakıt: ${x}`,
      vites: (x)=> `Vites: ${x}`,
      kasaTipi: (x)=> `Kasa: ${x}`,
      cekis: (x)=> `Çekiş: ${x}`,
      marka: (x)=> `Marka: ${x}`,
      model: (x)=> `Model: ${x}`,
      yilMin: (x)=> `Yıl ≥ ${x}`,
      yilMax: (x)=> `Yıl ≤ ${x}`,
      kmMin: (x)=> `KM ≥ ${x}`,
      kmMax: (x)=> `KM ≤ ${x}`,
      renk: (x)=> `Renk: ${x}`,
      sunroof: (x)=> `Sunroof: ${x}`,
      parkAsistani: (x)=> `Park Asistanı: ${x}`,
      pilKapasitesi: (x)=> `Pil: ${x} mAh`,
      pilKapasitesiMin: (x)=> `Pil ≥ ${x} mAh`,
      pilKapasitesiMax: (x)=> `Pil ≤ ${x} mAh`,
      kameraCozunurluk: (x)=> `Kamera: ${x} MP`,
      kameraCozunurlukMin: (x)=> `Kamera ≥ ${x} MP`,
      kameraCozunurlukMax: (x)=> `Kamera ≤ ${x} MP`,
      usbTipi: (x)=> `USB: ${x}`,
      nfc: (x)=> `NFC: ${x==='true'?'Var':'Yok'}`,
      suDirenci: (x)=> `IP: ${x}`,
      ag: (x)=> `Ağ: ${x}`,
      ekranBoyutu: (x)=> `Ekran: ${x}"`,
      ekranBoyutuMin: (x)=> `Ekran ≥ ${x}"`,
      ekranBoyutuMax: (x)=> `Ekran ≤ ${x}"`,
      cozunurluk: (x)=> `Çözünürlük: ${x}`,
      yenilemeOrani: (x)=> `Hz: ${x}`,
      hdr: (x)=> `HDR: ${x}`,
      panelTipi: (x)=> `Panel: ${x}`,
      cpu: (x)=> `CPU: ${x}`,
      gpu: (x)=> `GPU: ${x}`,
      depolama: (x)=> `Depolama: ${x}`,
      isletimSistemi: (x)=> `OS: ${x}`,
    };
    return (map[k]?.(v)) || `${k}: ${v}`;
  };
  const [aiHighlightTokens, setAiHighlightTokens] = useState<string[]>([]);
  const [aiHistory, setAiHistory] = useState<Array<{ category: string; subcategory?: string; params: Record<string,string>; ts: number }>>([]);
  const [aiSaved, setAiSaved] = useState<Array<{ name: string; category: string; subcategory?: string; params: Record<string,string> }>>([]);
  const [aiSaveName, setAiSaveName] = useState<string>('');

  // Gerçek veritabanından ilanları çek
  useEffect(() => {
    fetchListings();
    fetchCategories();
    fetchTopListings();
    if (typeof window !== 'undefined') {
      try { const text = window.localStorage.getItem('aiSearchHistory'); if (text) { const arr = JSON.parse(text); if (Array.isArray(arr)) setAiHistory(arr); } } catch {}
      try { const text2 = window.localStorage.getItem('aiSavedSearches'); if (text2) { const arr2 = JSON.parse(text2); if (Array.isArray(arr2)) setAiSaved(arr2); } } catch {}
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const usp = new URLSearchParams(window.location.search);
    const c = usp.get('category') || '';
    const city = usp.get('city') || '';
    const min = usp.get('minPrice');
    const max = usp.get('maxPrice');
    const s = usp.get('sort') as any;
    if (c) setSelectedCategory(c);
    if (city) setSelectedCity(city);
    if (min || max) setPriceRange({ min: Number(min||0), max: Number(max||1000000) });
    if (s) setSortBy(s);
  }, []);

  const fetchListings = async () => {
    try {
      setLoadingListings(true);
      const params = new URLSearchParams();
      const paramsNoQ = new URLSearchParams();
      if (searchTerm) params.set('q', searchTerm);
      if (selectedCategory) { params.set('category', selectedCategory); paramsNoQ.set('category', selectedCategory); }
      if (selectedCity) { params.set('city', selectedCity); paramsNoQ.set('city', selectedCity); }
      if (selectedDistrict) { params.set('district', selectedDistrict); paramsNoQ.set('district', selectedDistrict); }
      if (priceRange.min) { params.set('minPrice', String(priceRange.min)); paramsNoQ.set('minPrice', String(priceRange.min)); }
      if (priceRange.max) { params.set('maxPrice', String(priceRange.max)); paramsNoQ.set('maxPrice', String(priceRange.max)); }
      if (sortBy) { params.set('sort', sortBy); paramsNoQ.set('sort', sortBy); }
      {
        const normTR = (s: string) => s.toLowerCase().replace(/ş/g,'s').replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ü/g,'u');
        const s = normTR(searchTerm || '');
        const tokens = s.split(/\s+/).filter(Boolean);
        const isTV = tokens.some(t => ['tv','televizyon','television','oled','qled','led'].includes(t));
        if (isTV) {
          params.set('category', 'alisveris');
          params.set('subcategory', 'televizyon');
          paramsNoQ.set('category', 'alisveris');
          paramsNoQ.set('subcategory', 'televizyon');
        }
      }
      const url = params.toString() ? `/api/listings?${params.toString()}` : '/api/listings';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setListings(data);
        setFilteredListings(data);
        if (Array.isArray(data) && data.length === 0) {
          if (selectedCity || selectedDistrict) {
            const qTerm = selectedDistrict || selectedCity;
            const resQ = await fetch(`/api/listings?q=${encodeURIComponent(qTerm || '')}`);
            if (resQ.ok) {
              const qData = await resQ.json();
              if (Array.isArray(qData) && qData.length) { setListings(qData); setFilteredListings(qData); }
            }
          } else if (searchTerm) {
            const urlNoQ = paramsNoQ.toString() ? `/api/listings?${paramsNoQ.toString()}` : '/api/listings';
            const resNoQ = await fetch(urlNoQ);
            if (resNoQ.ok) {
              const allData = await resNoQ.json();
              const qlow = searchTerm.toLowerCase();
              const filtered = Array.isArray(allData) ? allData.filter((l:any)=>{
                const attrText = Object.values(l.attributes||{}).join(' ').toLowerCase();
                return (String(l.title||'').toLowerCase().includes(qlow) || String(l.description||'').toLowerCase().includes(qlow) || attrText.includes(qlow));
              }) : [];
              if (filtered.length) { setListings(filtered); setFilteredListings(filtered); }
            }
          }
        }
      } else {
        const status = response.status;
        let bodyText = '';
        try { bodyText = await response.text(); } catch {}
        console.error('İlanlar yüklenirken hata oluştu', status, bodyText, url);
        const resFallback = await fetch('/api/listings');
        if (resFallback.ok) {
          const fbData = await resFallback.json();
          setListings(fbData);
          setFilteredListings(fbData);
        }
      }
    } catch (error) {
      console.error('İlanlar yüklenirken hata:', error);
    } finally {
      setLoadingListings(false);
    }
  };
  const handleSearchSubmit = () => {
    const termRaw = (searchTerm || '').trim().toLowerCase();
    const term = termRaw
      .replace(/ı/g,'i').replace(/ş/g,'s').replace(/ğ/g,'g').replace(/ç/g,'c').replace(/ö/g,'o').replace(/ü/g,'u');
    if (!term) { setHasSearch(false); setListings([]); setFilteredListings([]); return; }
    const tokens = term.split(/\s+/).filter(Boolean);
    setAiHighlightTokens(tokens);
    const normTR = (s:string) => s
      .toLowerCase()
      .replace(/ş/g,'s').replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ü/g,'u');
  const lev = (a:string,b:string) => { const x=a.length,y=b.length; const dp=Array.from({length:x+1},()=>Array(y+1).fill(0)); for(let i=0;i<=x;i++) dp[i][0]=i; for(let j=0;j<=y;j++) dp[0][j]=j; for(let i=1;i<=x;i++) for(let j=1;j<=y;j++){ const cost=a[i-1]===b[j-1]?0:1; dp[i][j]=Math.min(dp[i-1][j]+1,dp[i][j-1]+1,dp[i-1][j-1]+cost);} return dp[x][y]; };
  const similar = (a:string,b:string) => { const x=normTR(a), y=normTR(b); if (x===y) return true; if (x.includes(y)||y.includes(x)) return true; const t = Math.max(x.length,y.length) <= 6 ? 1 : 2; return lev(x,y) <= t; };
  const fuzzyIncludes = (t:string, list:string[]) => list.some(w=> similar(t,w));

  const augmentParamsFromSchema = (cat: string, sub: string | undefined, term: string, tokens: string[], baseParams: Record<string,string>) => {
    const combined = [ ...(ATTR_SCHEMAS[cat] || []), ...((ATTR_SUBSCHEMAS[`${cat}/${sub||''}`] || [])) ];
    const params = { ...baseParams };
    const T = normTR(term);
    const toks = tokens.map(normTR);
    combined.forEach((f: any) => {
      if (f.type === 'select' && f.key && Array.isArray(f.options)) {
        const opt = f.options.find((o: string) => toks.includes(normTR(o)));
        if (opt) params[f.key] = opt;
      } else if (f.type === 'boolean' && f.key) {
        const k = normTR(f.key);
        const lbl = normTR(f.label||'');
        const hasTrue = toks.includes(k) || T.includes(lbl);
        const hasFalse = /degi[l|l]|yok/.test(T) && (T.includes(lbl) || toks.includes(k));
        if (hasTrue) params[f.key] = hasFalse ? 'false' : 'true';
      } else if (f.type === 'range-number' && f.minKey && f.maxKey) {
        const lbl = normTR(f.label||'');
        const m = T.match(new RegExp(`${lbl}[^0-9]{0,6}(\\d{1,6})[^0-9]{0,6}(?:-|–|—|ile|arası|between)[^0-9]{0,6}(\\d{1,6})`));
        if (m) { params[f.minKey] = m[1]; params[f.maxKey] = m[2]; }
      }
    });
    return params;
  };
    const sortHit = (() => {
      const lowPhrases = ['en ucuz','ucuz','düşük fiyat','dusuk fiyat','düşük','dusuk','en düşük','minimum'];
      const highPhrases = ['en pahalı','en pahali','yüksek fiyat','yuksek fiyat','yüksek','yuksek','en yüksek','maksimum'];
      const newestPhrases = ['yeni','yeniler','yeni ilanlar','son ilanlar','en yeni'];
      const t = term;
      if (lowPhrases.some(p => t.includes(p))) return 'price-low';
      if (highPhrases.some(p => t.includes(p))) return 'price-high';
      if (newestPhrases.some(p => t.includes(p))) return 'newest';
      return 'newest';
    })();
    const minTerm = /(min|minimum|en\s*az|altı|alt)/.test(term);
    const maxTerm = /(max|maksimum|en\s*çok|üstü|üst|en\s*fazla)/.test(term);
    const furnishedHit = tokens.includes('esyali') ? 'true' : (term.includes('esyali degil') || tokens.includes('esyasiz') ? 'false' : undefined);
    const buildingAge = (() => {
      const m = term.match(/bina\s*yas[iı]\s*(\d{1,2})/);
      if (m) return m[1];
      const m2 = term.match(/(\d{1,2})\s*(yil|yil)\b/);
      return m2 ? m2[1] : undefined;
    })();
    const floorsTotal = (() => {
      const m = term.match(/(\d{1,2})\s*katli/);
      if (m) return m[1];
      const m2 = term.match(/kat\s*sayisi\s*(\d{1,2})/);
      return m2 ? m2[1] : undefined;
    })();
    const feeHit = (() => {
      const m = term.match(/(\d{2,6})\s*aidat/);
      return m ? m[1].replace(/\./g,'') : undefined;
    })();
    const isRent = tokens.includes('kiralık') || tokens.includes('kiralik');
    const isSale = tokens.includes('satılık') || tokens.includes('satilik');
    const isApartment = tokens.some(t=> fuzzyIncludes(t,['daire','ev','konut','apartment','flat','home','house','residence']));
    const isCar = tokens.some(t=> fuzzyIncludes(t,['araba','oto','otomobil','vasita','car','vehicle','automobile']));
    const isPhone = tokens.some(t=> fuzzyIncludes(t,['iphone','telefon','phone','samsung','xiaomi','huawei','android','smartphone','cep','apple','galaxy']));
    const isTV = tokens.some(t=> fuzzyIncludes(t,['tv','televizyon','television','oled','qled','led']));
    const isPC = tokens.some(t=> fuzzyIncludes(t,['bilgisayar','laptop','notebook','pc','desktop','macbook','ultrabook','gaming']));
    const isJob = tokens.some(t=> fuzzyIncludes(t,['iş','is','kariyer','ilan','job','remote','staj','intern']));
    const isAnimals = tokens.some(t=> fuzzyIncludes(t,['hayvan','kedi','köpek','kopek','kuş','kus','evcil']));
    const cityAlias = (() => {
      const map: Record<string,string> = { ist:'İstanbul', izm:'İzmir', ank:'Ankara' };
      for (const t of tokens) { const val = map[t]; if (val) return val; }
      return undefined;
    })();
    const cityFromPlate = (() => {
      const m = term.match(/plaka\s*(0[1-9]|[1-7][0-9]|81)/);
      if (!m) return undefined;
      const code = m[1];
      const map: Record<string,string> = { '34':'İstanbul', '06':'Ankara', '35':'İzmir', '16':'Bursa', '01':'Adana', '07':'Antalya' };
      return map[code];
    })();
    const cityHit = (() => {
      const aliasName = cityAlias || cityFromPlate;
      if (aliasName) return { name: aliasName } as any;
      return TURKEY_PROVINCES.find(p => tokens.some(t=> similar(t, p.name.toLowerCase())));
    })();
    const districtHit = (() => {
      for (const prov of TURKEY_PROVINCES) {
        const ds = getDistrictsByProvince(prov.name) || [];
        const found = ds.find((d: any) => tokens.some(t => similar(String(d.name).toLowerCase(), t)));
        if (found) return { city: prov.name, district: found.name };
      }
      return undefined;
    })();
    if (districtHit) {
      setSelectedCity(districtHit.city);
      setSelectedDistrict(districtHit.district);
      setHasSearch(true);
    } else if (cityHit) {
      setSelectedCity((cityHit as any).name || (cityHit as any));
      setSelectedDistrict('');
      setHasSearch(true);
    }
    const roomsToken = tokens.find(t => /^(\d{1,2})\+(\d{1,2})$/.test(t));
    const roomMatch = roomsToken ? roomsToken.toUpperCase() : (()=>{ const m = term.match(/(\d{1,2})\s*oda/); return m ? `${m[1]}+1`.toUpperCase() : undefined; })();
    const fuelMap: Record<string,string> = { benzin: 'Benzin', dizel: 'Dizel', lpg: 'LPG', elektrik: 'Elektrik', hibrit: 'Hibrit', gasoline: 'Benzin', petrol: 'Benzin', diesel: 'Dizel', electric: 'Elektrik', hybrid: 'Hibrit' };
    const gearMap: Record<string,string> = { otomatik: 'Otomatik', manuel: 'Manuel', automatic: 'Otomatik', manual: 'Manuel' };
    const bodyMap: Record<string,string> = { sedan: 'Sedan', suv: 'SUV', hatchback: 'Hatchback', coupe: 'Coupe', cabrio: 'Cabrio', pickup: 'Pick-up' };
    const tractionMap: Record<string,string> = { '4x4': '4x4', awd: '4x4', '4wd': '4x4', fwd: 'Önden Çekiş', rwd: 'Arkadan İtiş', 'önden': 'Önden Çekiş', 'arkadan': 'Arkadan İtiş', 'çekiş': '' };
    const colorSet = new Set(['siyah','beyaz','gri','kırmızı','kirmizi','mavi','yeşil','yesil','turuncu','mor','kahverengi','black','white','gray','grey','red','blue','green','orange','purple','brown','silver','gold']);
    const brandList = ['bmw','mercedes','audi','volkswagen','renault','peugeot','citroen','toyota','honda','hyundai','kia','ford','fiat','opel','skoda','volvo','nissan','seat','alfa','subaru','mazda','mini','land rover','porsche','jaguar','dacia','tesla','byd','chery','mg','geely','gwm','ssangyong','jeep','mitsubishi','togg','cupra','smart'];
    const brandHit = (()=>{ for(const t of tokens){ const norm = t.replace(/[^a-z0-9\s]/g,'').trim(); const found = brandList.find(b=> similar(norm,b.replace(/\s+/g,''))); if(found) return found; } return undefined; })();
    const modelHit = (() => {
      const m = tokens.find(t => /^(a\d|3 serisi|c-?serisi|a4|corolla|civic|hilux|rav4|model\s?3|model\s?s)$/i.test(t));
      return m || undefined;
    })();
    const yearHit = tokens.find(t => /^(19\d{2}|20\d{2})$/.test(t));
    const yearRange = (() => {
      const m = term.match(/(19\d{2}|20\d{2})\s*(?:-|–|—|ile|arası|between)\s*(19\d{2}|20\d{2})/);
      if (!m) return undefined; return { min: m[1], max: m[2] };
    })();
    const kmHit = (() => {
      const k = tokens.find(t => /^(\d{2,6})\s?km$/.test(t));
      const b = tokens.find(t => /^(\d{2,3})\s?bin$/.test(t));
      if (k) return k.replace(/[^0-9]/g,'');
      if (b) return String(Number(b.replace(/[^0-9]/g,'')) * 1000);
      return undefined;
    })();
    const kmRange = (() => {
      const m = term.match(/(\d{2,6})\s*(?:km|k|bin)?\s*(?:-|–|—|ile|arası|between)\s*(\d{2,6})\s*(?:km|k|bin)?/i);
      if (!m) return undefined; const a = Number(m[1]); const b = Number(m[2]); if (Number.isNaN(a)||Number.isNaN(b)) return undefined; const min = Math.min(a,b); const max = Math.max(a,b); return { min: String(min), max: String(max) };
    })();
    const areaHit = (() => {
      const a = tokens.find(t => /^(\d{2,4})\s?(m2|m²|metrekare)$/.test(t));
      return a ? a.replace(/[^0-9]/g,'') : undefined;
    })();
    const areaRange = (() => {
      const m = term.match(/(\d{2,4})\s?(m2|m²|metrekare)\s*(?:-|–|—|ile|arası|between)\s*(\d{2,4})\s?(m2|m²|metrekare)/i);
      if (!m) return undefined; return { min: m[1], max: m[3] };
    })();
    const balconyHit = tokens.find(t => t === 'balkon' || t === 'balkonlu' || t === 'balkonsuz');
    const liftHit = (tokens.includes('asansor') || tokens.includes('asansör')) ? 'true' : undefined;
    const parkingHit = tokens.includes('otopark') ? 'true' : undefined;
    const siteHit = (term.includes('site içi') || tokens.includes('site')) ? 'true' : undefined;
    const krediHit = term.includes('krediye uygun') ? 'true' : (term.includes('krediye uygun değil') ? 'false' : undefined);
    const tapuHit = (() => { if (term.includes('kat mülkiyeti')) return 'Kat Mülkiyeti'; if (term.includes('kat irtifakı') || term.includes('kat irtifaki')) return 'Kat İrtifakı'; if (term.includes('hisseli')) return 'Hisseli'; if (term.includes('arsa tapulu')) return 'Arsa Tapulu'; return undefined; })();
    const cepheHit = (() => { const dirs: string[] = []; const map: Array<[string,string]> = [['kuzey','Kuzey'],['güney','Güney'],['guney','Güney'],['doğu','Doğu'],['dogu','Doğu'],['batı','Batı'],['bati','Batı'],['kuzeydoğu','Kuzeydoğu'],['kuzeybatı','Kuzeybatı'],['güneydoğu','Güneydoğu'],['guneydogu','Güneydoğu'],['güneybatı','Güneybatı'],['guneybati','Güneybatı']]; map.forEach(([k,v])=>{ if (term.includes(k)) dirs.push(v); }); return dirs.length? dirs.join(',') : undefined; })();
    const banyoHit = (() => { const m = term.match(/(\d{1,2})\s*banyo/); return m ? m[1] : undefined; })();
    const ebeveynHit = term.includes('ebeveyn banyosu') ? 'true' : undefined;
    const yalitimHit = (term.includes('ısı yalıt') || term.includes('isi yalit') || term.includes('yalitim') || term.includes('izolasyon')) ? 'true' : undefined;
    const hpHit = (() => { const m = term.match(/(\d{2,4})\s*(hp|beygir)/i); return m ? m[1] : undefined; })();
    const damageHit = (term.includes('hasar kaydı') || term.includes('hasar kaydi')) ? 'true' : undefined;
    const heatMap: Record<string,string> = { dogalgaz:'Doğalgaz', doğalgaz:'Doğalgaz', merkezi:'Merkezi', klima:'Klima', soba:'Soba', yerden:'Yerden Isıtma' };
    const floorHit = (() => {
      if (tokens.includes('zemin')) return 'Zemin Kat';
      const f = tokens.find(t => /^(\d{1,2})\.?\s?kat$/.test(t));
      return f ? f.replace(/\.$/,'').replace(/\s+/g,'') : undefined;
    })();
    const priceRangeHit = (() => {
      const m = term.match(/(\d{1,3}(?:\.\d{3})+|\d{2,7})\s*(bin|milyon|k|m)?\s*(?:tl|₺)?\s*(?:-|–|—|ile|arası|between)\s*(\d{1,3}(?:\.\d{3})+|\d{2,7})\s*(bin|milyon|k|m)?/);
      if (!m) return undefined;
      const norm = (n:string, u?:string) => { let v = Number(n.replace(/\./g,'')); if (u) { if (/bin|k/i.test(u)) v *= 1000; if (/milyon|m/i.test(u)) v *= 1000000; } return v; };
      return { min: norm(m[1], m[2]), max: norm(m[3], m[4]) };
    })();
    const priceHit = (() => {
      const m = term.match(/(\d{1,3}(?:\.\d{3})+|\d{2,7})\s?(tl|₺)?/);
      if (!m) return undefined;
      let n = m[1].replace(/\./g,'');
      const hasMax = /(max|maksimum|en\s*fazla|üstü|en\s*çok)/.test(term);
      const hasMin = /(min|minimum|en\s*az|altı|alt)/.test(term);
      return { value: Number(n), type: hasMin ? 'min' : hasMax ? 'max' : 'max' };
    })();
    const hzHit = (() => {
      const h = tokens.find(t => /^(\d{2,3})\s?hz$/i.test(t));
      return h ? h.replace(/[^0-9]/g,'') : undefined;
    })();
    const hdrHit = (() => {
      if (/dolby\s*vision/i.test(term)) return 'Dolby Vision';
      if (tokens.includes('hdr10')) return 'HDR10';
      if (tokens.includes('hlg')) return 'HLG';
      if (tokens.includes('hdr')) return 'HDR';
      return undefined;
    })();
    const fullHdHit = (/full\s*hd/i.test(term) || tokens.includes('1080p')) ? 'Full HD' : undefined;
    const twoKHit = (tokens.includes('2k')) ? '2K' : undefined;
    const panelTv = (() => {
      if (tokens.includes('oled')) return 'OLED';
      if (tokens.includes('qled')) return 'QLED';
      if (tokens.includes('led')) return 'LED';
      return undefined;
    })();
    const ipRating = (() => {
      if (term.includes('ip68')) return 'IP68';
      if (term.includes('ip67')) return 'IP67';
      return undefined;
    })();
    const fiveG = tokens.includes('5g') ? '5G' : undefined;
    const dualSim = (term.includes('dual sim') || term.includes('çift sim') || (tokens.includes('dual') && tokens.includes('sim')) || (tokens.includes('çift') && tokens.includes('sim'))) ? 'true' : undefined;
    const batteryMah = (() => {
      const m = term.match(/(\d{4,5})\s?mah/i);
      return m ? m[1] : undefined;
    })();
    const cameraMp = (() => {
      const m = term.match(/(\d{2,3})\s?mp/i);
      return m ? m[1] : undefined;
    })();
    const batteryRange = (() => {
      const m = term.match(/(\d{4,5})\s?mah\s*(?:-|–|—|ile|arası|between)\s*(\d{4,5})\s?mah/i);
      if (!m) return undefined; const a = Number(m[1]); const b = Number(m[2]);
      if (Number.isNaN(a) || Number.isNaN(b)) return undefined; const min = Math.min(a,b); const max = Math.max(a,b);
      return { min: String(min), max: String(max) };
    })();
    const cameraRange = (() => {
      const m = term.match(/(\d{2,3})\s?mp\s*(?:-|–|—|ile|arası|between)\s*(\d{2,3})\s?mp/i);
      if (!m) return undefined; const a = Number(m[1]); const b = Number(m[2]);
      if (Number.isNaN(a) || Number.isNaN(b)) return undefined; const min = Math.min(a,b); const max = Math.max(a,b);
      return { min: String(min), max: String(max) };
    })();
    const usbType = (term.includes('type-c') || term.includes('usb-c')) ? 'Type-C' : undefined;
    const nfcHit = tokens.includes('nfc') ? 'true' : undefined;
    const osHit = (() => {
      if (/windows\s*11/i.test(term)) return 'Windows 11';
      if (/windows\s*10/i.test(term)) return 'Windows 10';
      if (/mac\s?os|macos/i.test(term)) return 'macOS';
      if (/linux/i.test(term)) return 'Linux';
      return undefined;
    })();
    const pcHz = (() => {
      const h = tokens.find(t => /^(\d{2,3})\s?hz$/i.test(t));
      return h ? h.replace(/[^0-9]/g,'') : undefined;
    })();
    const pcPanel = (() => {
      if (tokens.includes('ips')) return 'IPS';
      if (tokens.includes('va')) return 'VA';
      if (tokens.includes('tn')) return 'TN';
      return undefined;
    })();
    const backlitKb = (term.includes('rgb klavye') || term.includes('ışıklı klavye') || term.includes('isikli klavye') || term.includes('backlit keyboard')) ? 'true' : undefined;
    const sunroofHit = (term.includes('sunroof') || term.includes('cam tavan')) ? 'true' : undefined;
    const panoRoof = term.includes('panoramik') ? 'Panoramik' : undefined;
    const parkAssist = (term.includes('otomatik park') || term.includes('park asistan')) ? 'true' : undefined;
    const candidates: Array<{ category: string; subcategory?: string; params: Record<string,string>; score: number }> = [];
    if (isApartment) {
      const sub = isRent ? 'kiralik-daire' : isSale ? 'satilik-daire' : 'satilik-daire';
      let params: Record<string,string> = {};
      if (roomMatch) params['odaSayisi'] = roomMatch.toUpperCase();
      const heatKeys = Object.keys(heatMap);
      const h = tokens.find(t => heatKeys.includes(t));
      if (h) params['isitma'] = heatMap[h];
      if (areaRange) { params['metrekareMin'] = areaRange.min; params['metrekareMax'] = areaRange.max; }
      else if (areaHit) params['metrekareMin'] = areaHit;
      if (balconyHit) params['balkon'] = balconyHit === 'balkonsuz' ? 'false' : 'true';
      if (floorHit) params['bulunduguKat'] = floorHit;
      if (furnishedHit) params['esyali'] = furnishedHit;
      if (buildingAge) {
        const k = maxTerm ? 'binaYasiMax' : 'binaYasiMin';
        params[k] = buildingAge;
      }
      if (floorsTotal) {
        const k = minTerm ? 'katSayisiMin' : 'katSayisiMax';
        params[k] = floorsTotal;
      }
      if (feeHit) {
        const k = maxTerm ? 'aidatMax' : 'aidatMin';
        params[k] = feeHit;
      }
      if (liftHit) params['asansor'] = liftHit;
      if (parkingHit) params['otopark'] = parkingHit;
      if (siteHit) params['siteIci'] = siteHit;
      if (krediHit) params['krediyeUygun'] = krediHit;
      if (tapuHit) params['tapuDurumu'] = tapuHit;
      if (cepheHit) params['cephe'] = cepheHit;
      if (banyoHit) params['banyoSayisi'] = banyoHit;
      if (ebeveynHit) params['ebeveynBanyosu'] = ebeveynHit;
      if (yalitimHit) params['isiYalitimi'] = yalitimHit;
      if (priceRangeHit) { params['minPrice'] = String(priceRangeHit.min); params['maxPrice'] = String(priceRangeHit.max); }
      else if (priceHit) { if (priceHit.type === 'min') params['minPrice'] = String(priceHit.value); else params['maxPrice'] = String(priceHit.value); }
      if (districtHit) { params['city'] = districtHit.city; params['district'] = districtHit.district; }
      if (sortHit) params['sort'] = sortHit;
      params = augmentParamsFromSchema('emlak', sub, term, tokens, params);
      candidates.push({ category: 'emlak', subcategory: sub, params, score: 4 + Object.keys(params).length + (sortHit?1:0) + (roomMatch?1:0) + (districtHit?1:0) });
    }
    if (isCar) {
      let params: Record<string,string> = {};
      tokens.forEach(t => {
        const fKey = Object.keys(fuelMap).find(k=> similar(t,k)); const f = fKey ? fuelMap[fKey] : undefined; if (f) params['yakit'] = f;
        const gKey = Object.keys(gearMap).find(k=> similar(t,k)); const g = gKey ? gearMap[gKey] : undefined; if (g) params['vites'] = g;
        const bKey = Object.keys(bodyMap).find(k=> similar(t,k)); const b = bKey ? bodyMap[bKey] : undefined; if (b) params['kasaTipi'] = b;
        const cKey = Object.keys(tractionMap).find(k=> similar(t,k)); const c = cKey ? tractionMap[cKey] : undefined; if (c) params['cekis'] = c;
      });
      if (brandHit) params['marka'] = brandHit.replace(/[^a-z0-9]/g,' ').trim().replace(/\s+/g,' ').replace(/\b\w/g, c=> c.toUpperCase());
      if (modelHit) params['model'] = modelHit.replace(/-/g,' ').replace(/\s+/g,' ').trim();
      if (yearRange) { params['yilMin'] = yearRange.min; params['yilMax'] = yearRange.max; }
      else if (yearHit) { const k = maxTerm ? 'yilMax' : 'yilMin'; params[k] = yearHit; }
      if (kmRange) { params['kmMin'] = kmRange.min; params['kmMax'] = kmRange.max; }
      else if (kmHit) { const k = minTerm ? 'kmMin' : 'kmMax'; params[k] = kmHit; }
      const colorHit = tokens.find(t => colorSet.has(t));
      if (colorHit) params['renk'] = colorHit.charAt(0).toUpperCase() + colorHit.slice(1);
      if (hpHit) params['motorGucu'] = hpHit;
      if (damageHit) params['hasarKaydi'] = damageHit;
      if (sunroofHit) params['sunroof'] = panoRoof || 'true';
      if (parkAssist) params['parkAsistani'] = 'true';
      if (priceRangeHit) { params['minPrice'] = String(priceRangeHit.min); params['maxPrice'] = String(priceRangeHit.max); }
      else if (priceHit) { if (priceHit.type === 'min') params['minPrice'] = String(priceHit.value); else params['maxPrice'] = String(priceHit.value); }
      if (districtHit) { params['city'] = districtHit.city; params['district'] = districtHit.district; }
      if (sortHit) params['sort'] = sortHit;
      params = augmentParamsFromSchema('vasita', 'otomobil', term, tokens, params);
      candidates.push({ category: 'vasita', subcategory: 'otomobil', params, score: 4 + Object.keys(params).length + (sortHit?1:0) + (brandHit?2:0) + (yearHit?1:0) + (kmHit?1:0) + (districtHit?1:0) });
    }
    if (isPhone) {
      let params: Record<string,string> = {};
      if (tokens.includes('iphone') || tokens.includes('apple')) params['marka'] = 'Apple';
      if (tokens.includes('samsung') || tokens.includes('galaxy')) params['marka'] = 'Samsung';
      if (tokens.includes('xiaomi')) params['marka'] = 'Xiaomi';
      if (tokens.includes('huawei')) params['marka'] = 'Huawei';
      if (tokens.includes('oppo')) params['marka'] = 'OPPO';
      if (tokens.includes('vivo')) params['marka'] = 'Vivo';
      if (tokens.includes('realme')) params['marka'] = 'Realme';
      if (tokens.includes('pixel') || tokens.includes('google')) params['marka'] = 'Google';
      const m = tokens.find(t => /^\d{1,2}(\s?pro|\s?plus)?$/.test(t));
      if (m) params['model'] = `iPhone ${m.toUpperCase()}`;
      const storage = tokens.find(t => /^(\d{2,3})\s?gb$/.test(t));
      if (storage) params['depolama'] = storage.replace(/\s*/g,'').toUpperCase();
      const ram = tokens.find(t => /^(\d{1,2})\s?gb\s?ram$/.test(t));
      if (ram) params['ram'] = ram.replace(/\s*/g,'').toUpperCase();
      if (batteryMah) params['pilKapasitesi'] = batteryMah;
      if (cameraMp) params['kameraCozunurluk'] = cameraMp;
      if (batteryRange) { params['pilKapasitesiMin'] = batteryRange.min; params['pilKapasitesiMax'] = batteryRange.max; }
      if (cameraRange) { params['kameraCozunurlukMin'] = cameraRange.min; params['kameraCozunurlukMax'] = cameraRange.max; }
      if (ipRating) params['suDirenci'] = ipRating;
      if (fiveG) params['ag'] = fiveG;
      if (dualSim) params['ciftSim'] = dualSim;
      if (usbType) params['usbTipi'] = usbType;
      if (nfcHit) params['nfc'] = nfcHit;
      params = augmentParamsFromSchema('alisveris', 'cep-telefonu', term, tokens, params);
      candidates.push({ category: 'alisveris', subcategory: 'cep-telefonu', params, score: 3 + Object.keys(params).length });
    }
    if (isTV) {
      let params: Record<string,string> = {};
      const size = tokens.find(t => /^(\d{2,3})\s?(inch|"|inç)$/.test(t));
      if (size) params['ekranBoyutu'] = size.replace(/[^0-9]/g,'');
      const sizeRange = (() => { const m = term.match(/(\d{2,3})\s?(inch|"|inç)\s*(?:-|–|—|ile|arası|between)\s*(\d{2,3})\s?(inch|"|inç)/i); if (!m) return undefined; const a = Number(m[1]); const b = Number(m[3]); if (Number.isNaN(a)||Number.isNaN(b)) return undefined; const min = Math.min(a,b); const max = Math.max(a,b); return { min: String(min), max: String(max) }; })();
      if (sizeRange) { params['ekranBoyutuMin'] = sizeRange.min; params['ekranBoyutuMax'] = sizeRange.max; }
      if (tokens.includes('4k')) params['cozunurluk'] = '4K';
      if (tokens.includes('8k')) params['cozunurluk'] = '8K';
      if (tokens.includes('smart')) params['smartTv'] = 'true';
      if (twoKHit) params['cozunurluk'] = '2K';
      if (fullHdHit) params['cozunurluk'] = fullHdHit;
      if (hzHit) params['yenilemeOrani'] = hzHit;
      if (hdrHit) params['hdr'] = hdrHit;
      if (panelTv) params['panelTipi'] = panelTv;
      params = augmentParamsFromSchema('alisveris', 'televizyon', term, tokens, params);
      candidates.push({ category: 'alisveris', subcategory: 'televizyon', params, score: 8 + Object.keys(params).length });
    }
    if (isPC) {
      let params: Record<string,string> = {};
      const cpu = tokens.find(t => /^(i3|i5|i7|i9|ryzen\s?\d)\-?\d{3,4}[a-z]?$/i.test(t) || /(ryzen\s?\d\s?\d{3,4})/i.test(t));
      if (cpu) params['cpu'] = cpu.toUpperCase().replace(/\s+/g,' ');
      const gpu = tokens.find(t => /(rtx|gtx)\s?\d{3,4}/i.test(t));
      if (gpu) params['gpu'] = gpu.toUpperCase().replace(/\s+/g,' ');
      const ram = tokens.find(t => /^(\d{1,2})\s?gb\s?ram$/.test(t));
      if (ram) params['ram'] = ram.replace(/\s*/g,'').toUpperCase();
      const ssd = tokens.find(t => /^(\d{3,4})\s?gb\s?(ssd|hdd|nvme)$/.test(t));
      if (ssd) params['depolama'] = ssd.replace(/[^0-9]/g,'');
      const screen = tokens.find(t => /^(\d{2})\s?inch$/.test(t));
      if (screen) params['ekranBoyutu'] = screen.replace(/[^0-9]/g,'');
      const screenRange = (() => { const m = term.match(/(\d{2})\s?inch\s*(?:-|–|—|ile|arası|between)\s*(\d{2})\s?inch/i); if (!m) return undefined; const a = Number(m[1]); const b = Number(m[2]); if (Number.isNaN(a)||Number.isNaN(b)) return undefined; const min = Math.min(a,b); const max = Math.max(a,b); return { min: String(min), max: String(max) }; })();
      if (screenRange) { params['ekranBoyutuMin'] = screenRange.min; params['ekranBoyutuMax'] = screenRange.max; }
      if (osHit) params['isletimSistemi'] = osHit;
      if (pcHz) params['yenilemeOrani'] = pcHz;
      if (pcPanel) params['panel'] = pcPanel;
      if (backlitKb) params['isikliKlavye'] = backlitKb;
      params = augmentParamsFromSchema('alisveris', 'bilgisayar', term, tokens, params);
      candidates.push({ category: 'alisveris', subcategory: 'bilgisayar', params, score: 2 + Object.keys(params).length });
    }
    if (isJob) {
      const params: Record<string,string> = {};
      if (tokens.includes('uzaktan')) params['calismaSekli'] = 'Uzaktan';
      if (tokens.includes('tam') && tokens.includes('zamanlı')) params['calismaSekli'] = 'Tam Zamanlı';
      if (tokens.includes('staj')) params['calismaSekli'] = 'Staj';
      if (tokens.includes('yarı') && tokens.includes('zamanlı')) params['calismaSekli'] = 'Yarı Zamanlı';
      if (tokens.includes('junior')) params['seviye'] = 'Junior';
      if (tokens.includes('mid')) params['seviye'] = 'Mid';
      if (tokens.includes('senior')) params['seviye'] = 'Senior';
      if (tokens.includes('lead')) params['seviye'] = 'Lead';
      const exp = tokens.find(t => /^(\d{1,2})\s?(yil|yıl)$/.test(t));
      if (exp) params['deneyimMin'] = exp.replace(/[^0-9]/g,'');
      const salary = term.match(/(\d{4,6})\s?(tl|₺)/);
      if (salary) params['maasMin'] = salary[1];
      candidates.push({ category: 'is-ilanlari', subcategory: params['calismaSekli'] === 'Uzaktan' ? 'uzaktan' : 'tam-zamanli', params, score: 3 + Object.keys(params).length });
    }
    if (isAnimals) {
      const params: Record<string,string> = {};
      if (tokens.includes('kedi')) { params['tur'] = 'Kedi'; }
      if (tokens.includes('köpek') || tokens.includes('kopek')) { params['tur'] = 'Köpek'; }
      if (tokens.includes('erkek')) params['cinsiyet'] = 'Erkek';
      if (tokens.includes('dişi') || tokens.includes('disi')) params['cinsiyet'] = 'Dişi';
      if (tokens.includes('aşılı') || tokens.includes('asilı') || tokens.includes('asili')) params['asili'] = 'true';
      const age = tokens.find(t => /^(\d{1,2})\s?(yas|yaş)$/.test(t));
      if (age) params['yasMin'] = age.replace(/[^0-9]/g,'');
      candidates.push({ category: 'hayvanlar-alemi', subcategory: params['tur'] === 'Kedi' ? 'kedi' : 'evcil-hayvan', params, score: 2 + Object.keys(params).length });
    }
    if (!candidates.length) {
      const partialCats: Array<{ category: string; subcategory?: string; params: Record<string,string>; score: number }> = [];
      categories.forEach((c: any) => {
        const name = String(c.name || '').toLowerCase();
        if (name.includes(term)) {
          const sub = (c.subcategories && c.subcategories[0] && c.subcategories[0].slug) || '';
          partialCats.push({ category: c.slug, subcategory: sub, params: {}, score: 1 });
        }
      });
      if (partialCats.length) candidates.push(...partialCats);
      if (!partialCats.length) {
        if (districtHit) {
          candidates.push({ category: '', params: { city: districtHit.city, district: districtHit.district }, score: 2 });
        } else if (cityHit) {
          candidates.push({ category: '', params: { city: cityHit.name }, score: 1 });
        }
      }
    }
    if (candidates.length) {
      candidates.sort((a,b)=> b.score - a.score);
      setAiCandidates(candidates);
      const top = candidates[0];
      setAiTarget({ category: top.category, subcategory: top.subcategory });
      setAiParams(top.params);
      setAiPreviewCount(null);
      (async () => {
        setHasSearch(true);
        setLoadingListings(true);
        const p = new URLSearchParams({ category: top.category, subcategory: top.subcategory || '', ...top.params }).toString();
        const res = await fetch(`/api/listings?${p}`);
        if (res.ok) {
          const data = await res.json();
          let finalData = Array.isArray(data) ? data : [];
          if (Array.isArray(finalData) && finalData.length === 0) {
            const pLite = new URLSearchParams({ category: top.category, subcategory: top.subcategory || '' }).toString();
            const resLite = await fetch(`/api/listings?${pLite}`);
            if (resLite.ok) {
              const liteData = await resLite.json();
              finalData = Array.isArray(liteData) ? liteData : [];
              if (finalData.length === 0) {
                const resQ = await fetch(`/api/listings?q=${encodeURIComponent(term)}`);
                if (resQ.ok) {
                  const qData = await resQ.json();
                  finalData = Array.isArray(qData) ? qData : [];
                }
              }
            }
          }
          setAiPreviewCount(Array.isArray(finalData) ? finalData.length : null);
          setListings(finalData);
          setFilteredListings(finalData);
          const qs = new URLSearchParams({ category: top.category, subcategory: top.subcategory || '', ...top.params }).toString();
          router.replace(qs ? `/?${qs}` : '/', { scroll: false });
        }
        setLoadingListings(false);
      })();
      setSearchTerm('');
      return;
    }
    const matchCat = categories.find((c:any)=> c.name.toLowerCase() === term || c.slug.toLowerCase() === term);
    const matchCity = TURKEY_PROVINCES.find((p)=> p.name.toLowerCase() === term);
    if (matchCat) { setSelectedCategory(matchCat.slug); setSearchTerm(''); setHasSearch(true); return; }
    if (matchCity) { setSelectedCity(matchCity.name); setSelectedDistrict(''); setSearchTerm(''); setHasSearch(true); return; }
    setHasSearch(true);
    fetchListings();
  };
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length) {
          const map = new Map<string, any>();
          const put = (c:any) => {
            const slug = String(c.slug);
            const prev = map.get(slug);
            if (!prev) {
              map.set(slug, { name: c.name, slug: c.slug, subcategories: Array.isArray(c.subcategories) ? c.subcategories.slice() : [] });
            } else {
              const subs = new Map<string, any>();
              [...(prev.subcategories||[]), ...(c.subcategories||[])].forEach((s:any)=> subs.set(String(s.slug), s));
              map.set(slug, { name: prev.name || c.name, slug, subcategories: Array.from(subs.values()) });
            }
          };
          STATIC_CATEGORIES.forEach(put);
          data.forEach(put);
          setCategories(Array.from(map.values()));
        }
      }
    } catch {}
  };
  const fetchTopListings = async () => {
    try {
      setLoadingTop(true);
      const res = await fetch('/api/listings/top');
      if (res.ok) {
        const data = await res.json();
        setTopListings(data);
        setSliderInit(true);
      }
    } catch {} finally {
      setLoadingTop(false);
    }
  };

  useEffect(() => {
    let t: any;
    if (sliderInit) {
      const el = document.getElementById('top-slider');
      if (el) {
        let dir = 1;
        t = setInterval(() => {
          if (!isPlaying) return;
          el.scrollLeft += 2 * dir;
          if (el.scrollLeft + el.clientWidth >= el.scrollWidth) dir = -1;
          if (el.scrollLeft <= 0) dir = 1;
        }, 30);
      }
    }
    return () => { if (t) clearInterval(t); };
  }, [sliderInit, isPlaying]);

  useEffect(() => {
    fetchListings();
  }, [searchTerm, selectedCategory, priceRange, selectedCity, selectedDistrict, sortBy]);

  useEffect(() => {
    const s = (searchTerm || '').trim();
    if (!s || s.length < 2) return;
    if (autoSubmitTimer.current) clearTimeout(autoSubmitTimer.current);
    autoSubmitTimer.current = setTimeout(() => { handleSearchSubmit(); }, 600);
    return () => { if (autoSubmitTimer.current) clearTimeout(autoSubmitTimer.current); };
  }, [searchTerm]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedCity) params.set('city', selectedCity);
    if (selectedDistrict) params.set('district', selectedDistrict);
    if (priceRange.min) params.set('minPrice', String(priceRange.min));
    if (priceRange.max) params.set('maxPrice', String(priceRange.max));
    if (sortBy) params.set('sort', sortBy);
    {
      const normTR = (s: string) => s.toLowerCase().replace(/ş/g,'s').replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ü/g,'u');
      const s = normTR(searchTerm || '');
      const tokens = s.split(/\s+/).filter(Boolean);
      const isTV = tokens.some(t => ['tv','televizyon','television','oled','qled','led'].includes(t));
      if (isTV) {
        params.set('category', 'alisveris');
        params.set('subcategory', 'televizyon');
      }
    }
    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : '/', { scroll: false });
  }, [searchTerm, selectedCategory, selectedCity, selectedDistrict, priceRange.min, priceRange.max, sortBy]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(id)) {
        newFavorites.delete(id)
      } else {
        newFavorites.add(id)
      }
      return newFavorites
    })
  };

  const handleQuickOffer = (listingId: string) => {
    router.push(`/teklif-ver/${listingId}`);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setPriceRange({ min: 0, max: 0 });
    setSelectedCity("");
    setSelectedDistrict("");
    setSortBy("newest");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-12">
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                İhtiyacını yaz, teklifler anında gelsin
              </h1>
              <p className="mt-3 text-lg text-gray-300">
                Kategoriyi seç, konumu ve bütçeyi belirle. Satıcılar saniyeler içinde teklif versin.
              </p>
              <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
                <div className="max-w-3xl mx-auto">
                  <label className="block text-xs font-medium text-white mb-2">Yapay Zekalı Arama</label>
                  <div className="relative flex items-center gap-2">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      value={searchTerm}
                      onChange={(e)=>setSearchTerm(e.target.value)}
                      onKeyDown={(e)=>{ if ((e as any).key === 'Enter') { handleSearchSubmit(); } }}
                      placeholder="Örn: kiralık daire 3+1 doğalgaz; bmw suv 4x4; iphone 13 128gb"
                      className="flex-1 pl-10 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={handleSearchSubmit} className="px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-md">Bul</button>
                  </div>
                  {hasSearch && aiTarget && (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">Niyet: {aiTarget.category}{aiTarget.subcategory ? ` • ${aiTarget.subcategory}` : ''}</span>
                        {Object.entries(aiParams).map(([k,v]) => (
                          <button key={k} onClick={()=> setAiParams(prev => { const n = { ...prev }; delete n[k]; return n; })} className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200">
                            {k}: {v} ✕
                          </button>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <button onClick={async ()=> {
                          if (!aiTarget) return;
                          setHasSearch(true);
                          setLoadingListings(true);
                          const p = new URLSearchParams({ category: aiTarget.category, subcategory: aiTarget.subcategory || '', ...aiParams }).toString();
                          const res = await fetch(`/api/listings?${p}`);
                          if (res.ok) {
                            const data = await res.json();
                            let finalData = Array.isArray(data) ? data : [];
                            if (finalData.length === 0) {
                              const pLite = new URLSearchParams({ category: aiTarget.category, subcategory: aiTarget.subcategory || '' }).toString();
                              const resLite = await fetch(`/api/listings?${pLite}`);
                              if (resLite.ok) {
                                const liteData = await resLite.json();
                                finalData = Array.isArray(liteData) ? liteData : [];
                              }
                            }
                            setAiPreviewCount(Array.isArray(finalData) ? finalData.length : null);
                            setListings(finalData);
                            setFilteredListings(finalData);
                            router.replace(p ? `/?${p}` : '/', { scroll: false });
                          }
                          setLoadingListings(false);
                        }} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Uygula</button>
                        
                        <button onClick={()=> { setAiTarget(null); setAiParams({}); setAiPreviewCount(null); }} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg">Temizle</button>
                        {aiPreviewCount !== null && (
                          <span className="text-sm text-white/80">Tahmini sonuç: {aiPreviewCount}</span>
                        )}
                      </div>
                      {aiCandidates.length > 1 && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                          {aiCandidates.slice(0,3).map((c,idx)=> (
                            <div key={idx} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3">
                              <div className="text-white text-sm font-semibold mb-2">Öneri: {c.category}{c.subcategory ? ` • ${c.subcategory}` : ''}</div>
                              <div className="flex flex-wrap gap-2 mb-3">
                                {Object.entries(c.params).slice(0,6).map(([k,v])=> (
                                  <span key={`${k}-${v}`} className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">{k}: {v}</span>
                                ))}
                              </div>
                              <button onClick={async ()=> {
                                setAiTarget({ category: c.category, subcategory: c.subcategory });
                                setAiParams(c.params);
                                setAiPreviewCount(null);
                                const p = new URLSearchParams({ category: c.category, subcategory: c.subcategory || '', ...c.params }).toString();
                                const res = await fetch(`/api/listings?${p}`);
                                if (res.ok) { const data = await res.json(); setAiPreviewCount(Array.isArray(data) ? data.length : null); }
                              }} className="px-3 py-1 bg-blue-600 text-white rounded text-xs">Seç</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3">
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
            <h3 className="text-xl font-bold text-white mb-4">Kategoriler</h3>
            <div className="mb-3">
              <input value={categoryQuery} onChange={(e)=>setCategoryQuery(e.target.value)} placeholder="Alt kategori ara" className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <button onClick={()=> { setExpandAll(true); if (typeof window!=='undefined') window.localStorage.setItem('expandAllCats','true'); }} className="px-3 py-1 text-xs bg-blue-600 text-white rounded">Genişlet</button>
              <button onClick={()=> { setExpandAll(false); if (typeof window!=='undefined') window.localStorage.setItem('expandAllCats','false'); }} className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded">Daralt</button>
            </div>
            <div className="space-y-3">
              {categories.map((category: any) => {
                const subs = (category.subcategories||[]).filter((s:any)=> s.name.toLowerCase().includes(categoryQuery.toLowerCase()));
                const isOpen = expandAll || openCategory === category.slug;
                return (
                  <div key={category.slug} className="rounded-lg border border-white/10">
                    <button onClick={()=>{ setOpenCategory(isOpen?"":category.slug); setSelectedCategory(category.slug); }} className="w-full text-left px-3 py-2 text-white/90 hover:text-white flex items-center justify-between">
                      <span>{category.name}</span>
                      <span className={`transition-transform ${isOpen?"rotate-180":""}`}>▾</span>
                    </button>
                    {isOpen && (
                      <div className="px-3 pb-3 grid grid-cols-1">
                        {(expandAll ? subs : subs.slice(0, 10)).map((sub: any) => (
                          <Link key={sub.slug} href={`/kategori/${category.slug}/${sub.slug}`} className="text-sm text-gray-300 hover:text-blue-300 py-1">
                            {sub.name}
                          </Link>
                        ))}
                        {subs.length === 0 && (
                          <div className="text-xs text-gray-400 py-1">Sonuç yok</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="lg:col-span-9" id="results">
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">{hasSearch ? 'Arama Sonuçları' : 'Son İlanlar'}</h3>
              <span className="text-white/80 text-sm">{loadingListings ? 'Yükleniyor...' : `${filteredListings.length} sonuç`}</span>
            </div>
            {loadingListings ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({length:6}).map((_,i)=> (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden animate-pulse">
                    <div className="h-28 bg-white/10"></div>
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-white/10 w-3/4"></div>
                      <div className="h-3 bg-white/10 w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-10 text-gray-300">Sonuç bulunamadı</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredListings.slice(0,9).map((l)=> (
                  <ListingCard key={l.id} listing={l} highlight={aiHighlightTokens} />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      

      

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                Varagel
              </h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Türkiye'nin en büyük online alım satım platformu. 
                Güvenli, hızlı ve kolay alışveriş deneyimi için buradayız.
              </p>
              <div className="flex space-x-4">
                <button className="bg-gray-800 hover:bg-gray-700 p-3 rounded-lg transition-colors">
                  <Facebook className="w-5 h-5" />
                </button>
                <button className="bg-gray-800 hover:bg-gray-700 p-3 rounded-lg transition-colors">
                  <Twitter className="w-5 h-5" />
                </button>
                <button className="bg-gray-800 hover:bg-gray-700 p-3 rounded-lg transition-colors">
                  <Instagram className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Kategoriler</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Emlak</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Vasıta</a></li>
                <li><a href="#" className="hover:text-white transition-colors">İkinci El</a></li>
                <li><a href="#" className="hover:text-white transition-colors">İş Makineleri</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Yardım</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Destek</a></li>
                <li><a href="#" className="hover:text-white transition-colors">İletişim</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Güvenlik</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kullanım Koşulları</a></li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8 bg-gray-700" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Varagel. Tüm hakları saklıdır.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Gizlilik Politikası</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Çerez Politikası</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Site Haritası</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// İlan Kartı Component'i
function ListingCard({ listing, highlight }: { listing: Listing; highlight?: string[] }) {
  const router = useRouter();
  const [favorited, setFavorited] = useState<boolean>(listing.isFavorited);
  const escapeHtml = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  const makeHighlight = (s: string) => {
    const toks = (highlight || []).filter(t => t && t.length >= 2);
    if (!toks.length) return { __html: escapeHtml(s) } as any;
    const pattern = toks.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const re = new RegExp(`(${pattern})`, 'gi');
    const esc = escapeHtml(s);
    const html = esc.replace(re, (m) => `<mark class="bg-yellow-300/30 text-inherit">${m}</mark>`);
    return { __html: html } as any;
  };
  
  const handleViewListing = () => {
    router.push(`/ilan/${listing.id}`);
  };
  const toggleFavorite = async () => {
    try {
      if (favorited) {
        const res = await fetch(`/api/favorites?listingId=${listing.id}`, { method: 'DELETE' })
        if (res.ok) setFavorited(false)
      } else {
        const res = await fetch(`/api/favorites`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listingId: listing.id }) })
        if (res.ok) setFavorited(true)
      }
    } catch {}
  }
  
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-md border border-white/20 overflow-hidden transition-all duration-200 hover:shadow-2xl hover:scale-[1.02]">
      <div className="bg-gray-200 relative">
        {listing.images && listing.images.length > 0 ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-36 object-cover"
            loading="lazy"
            onError={(e) => (e.currentTarget.src = '/images/placeholder-1.svg')}
          />
        ) : (
          <div className="w-full h-36 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-lg font-semibold">İlan Resmi</span>
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2 py-1 rounded text-xs font-semibold shadow-md">
          ₺{listing.price.toLocaleString('tr-TR')}
        </div>
        <button onClick={toggleFavorite} className={`absolute top-2 left-2 p-2 rounded-full ${favorited ? 'bg-red-600' : 'bg-white/30'} text-white hover:bg-white/40 transition`}>❤</button>
        {listing.status === 'sold' && (
          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
            Satıldı
          </div>
        )}
      </div>
      
      <div className="p-3">
        <h3 className="text-base font-semibold text-white mb-1 line-clamp-2" dangerouslySetInnerHTML={makeHighlight(listing.title)} />
        
        <p className="text-gray-300 text-xs mb-2 line-clamp-2" dangerouslySetInnerHTML={makeHighlight(listing.description || '')} />
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-gray-400 text-sm">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{listing.location.city}</span>
          </div>
          <span className="text-white/80 text-xs bg-white/10 px-2 py-1 rounded">
            {(() => {
              const cat = STATIC_CATEGORIES.find(c => c.slug === listing.category);
              const catName = cat?.name || listing.category;
              const subName = cat?.subcategories.find(s => s.slug === listing.subcategory)?.name;
              return subName ? `${catName} • ${subName}` : catName;
            })()}
          </span>
          <span className="text-white/80 text-xs bg-white/10 px-2 py-1 rounded">
            {listing.status}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-gray-400 text-xs mb-3">
          <div className="flex items-center">
            <Star className="w-4 h-4 mr-1 text-yellow-400" />
            <span>{listing.seller.rating}</span>
          </div>
          <span>{new Date(listing.createdAt).toLocaleDateString('tr-TR')}</span>
        </div>
        
        <button
          onClick={handleViewListing}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-3 rounded-md font-medium transition-all duration-200"
        >
          İncele
        </button>
      </div>
    </div>
  );
}

// Teknolojik Kategori Kartı Component'i
function CategoryCard({ category, index }: { category: Category; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Animasyonlu ikonlar için farklı renkler
  const gradientColors = [
    "from-blue-500 to-purple-600",
    "from-green-500 to-teal-600", 
    "from-orange-500 to-red-600",
    "from-pink-500 to-rose-600",
    "from-indigo-500 to-blue-600",
    "from-yellow-500 to-orange-600",
    "from-purple-500 to-pink-600",
    "from-cyan-500 to-blue-600",
    "from-emerald-500 to-green-600"
  ];
  
  const iconColors = gradientColors[index % gradientColors.length];
  
  return (
    <div className="group relative">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105">
        {/* Kart Başlığı */}
        <div className={`bg-gradient-to-r ${iconColors} p-6 text-white`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">{category.name}</h3>
            <div className="transform transition-transform duration-300 group-hover:scale-110">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z"/>
              </svg>
            </div>
          </div>
          <p className="text-sm opacity-90 mt-1">{category.subcategories.length} alt kategori</p>
        </div>
        
        {/* Alt Kategoriler */}
        <div className="p-6">
          <div className="space-y-2 mb-4">
            {category.subcategories.slice(0, isExpanded ? category.subcategories.length : 3).map((sub: SubCategory) => (
              <Link
                key={sub.slug}
                href={`/kategori/${category.slug}/${sub.slug}`}
                className="block p-3 rounded-lg bg-gray-50 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-300 group/item"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 group-hover/item:text-blue-600 font-medium">
                    {sub.name}
                  </span>
                  <svg className="w-4 h-4 text-gray-400 group-hover/item:text-blue-500 transform transition-transform group-hover/item:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Daha Fazla / Daha Az Göster Butonu */}
          {category.subcategories.length > 3 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full py-2 px-4 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-lg transition-all duration-300 text-gray-700 font-medium flex items-center justify-center space-x-2"
            >
              <span>{isExpanded ? 'Daha Az Göster' : `Tümünü Göster (${category.subcategories.length})`}</span>
              <svg 
                className={`w-4 h-4 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Animasyonlu Alt Çizgi */}
        <div className={`h-1 bg-gradient-to-r ${iconColors} transform transition-transform duration-300 group-hover:scale-x-110`}></div>
      </div>
    </div>
  );
}
