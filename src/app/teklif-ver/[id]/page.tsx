"use client";
import { useState, useCallback, memo, useEffect, useMemo, type ComponentType } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { AttrField } from "@/data/attribute-schemas";
import { humanizeKeyTR } from "@/lib/humanize-key-tr";
import { 
  Upload, X, Image as ImageIcon, Check, AlertCircle, ChevronRight, 
  ChevronLeft, FileText, Send, MapPin, 
  Info, ArrowLeft, ArrowRight, ShieldCheck, AlertTriangle,
  Loader2, CheckCircle2, MessageSquare, List, Tag
} from 'lucide-react';

// Adım tanımları
type Step = {
  id: number;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

const STEPS: Step[] = [
  { id: 1, title: "Kategori Detayları", description: "Özel bilgileri girin", icon: List },
  { id: 2, title: "Fiyatlandırma", description: "Tutar belirleyin", icon: Tag },
  { id: 3, title: "Görseller", description: "Görsel ekleyin", icon: ImageIcon },
  { id: 4, title: "Özet", description: "Kontrol ve onay", icon: FileText },
];

// Form verileri
type FormData = { price: string; message: string; images: string[] };

// CategoryAttributes definitions
type AttrFieldLocal = AttrField;

type AttrFieldLocalWithOrder = AttrFieldLocal & { __order?: number };

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

const isS3Image = (src: string) => {
  if (!/^https?:\/\//i.test(src)) return false;
  try {
    return new URL(src).hostname.toLowerCase().includes(".s3.");
  } catch {
    return false;
  }
};
const isCloudFrontImage = (src: string) => {
  if (!/^https?:\/\//i.test(src)) return false;
  try {
    return new URL(src).hostname.toLowerCase().includes(".cloudfront.net");
  } catch {
    return false;
  }
};
const toProxyImageSrc = (src: string) => {
  const raw = String(src || '').trim();
  if (!raw) return raw;
  if (!/^https?:\/\//i.test(raw)) return raw;
  try {
    const parsed = new URL(raw);
    const host = parsed.hostname.toLowerCase();
    if (host.includes(".s3.") || host.includes(".cloudfront.net")) {
      return `/api/upload?url=${encodeURIComponent(raw)}`;
    }
  } catch {}
  return raw;
};

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

const attributesToRequestFields = (category: string, subcategory: string, attrs: any[]): AttrFieldLocalWithOrder[] => {
  const list = Array.isArray(attrs) ? attrs : [];
  if (!category || list.length === 0) return [];

  const PRIORITY_KEYS = ['marka', 'model', 'seri', 'paket'];

  const source = list
    .filter((a) => {
      if (!a) return false;
      const isRequired = !!a.required;
      if (a.showInOffer === false && !isRequired) return false;
      if (!a.subCategoryId) return true;
      if (!subcategory) return isRequired;
      const attrSlug = a?.subCategory?.slug;
      if (!attrSlug) return isRequired;
      return subcategoryMatches(attrSlug, subcategory) || isRequired;
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
      const isVehicleHierarchy = slug && PRIORITY_KEYS.includes(slug);
      const type = isVehicleHierarchy ? 'select' : normalizedType;

      let options: string[] | undefined = undefined;
      try {
        const parsed = a.optionsJson ? JSON.parse(a.optionsJson) : null;
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.filter((x) => x != null).map(String);
          if (cleaned.length > 0) options = cleaned;
        }
      } catch {}

      const minKey = type === 'range-number' ? (a.minKey || `${slug}Min`) : undefined;
      const maxKey = type === 'range-number' ? (a.maxKey || `${slug}Max`) : undefined;
      const order = Number.isFinite(Number(a?.order)) ? Number(a.order) : 9999;

      const isM2 = slug === 'm2' || slug === 'metrekare' || a.name === 'Metrekare' || a.name === 'm2';
      const required = isM2 ? false : !!a.required;

      return {
        key: type === 'range-number' ? undefined : slug,
        label: a.name || slug || 'Alan',
        type,
        required,
        options,
        minKey,
        maxKey,
        minLabel: type === 'range-number' ? (a.minLabel || 'En düşük') : undefined,
        maxLabel: type === 'range-number' ? (a.maxLabel || 'En yüksek') : undefined,
        min: a.min,
        max: a.max,
        __order: order,
      } as AttrFieldLocalWithOrder;
    })
    .filter(Boolean) as AttrFieldLocalWithOrder[];

  const uniq = new Map<string, AttrFieldLocalWithOrder>();
  stripReservedAttrFields(mapped).forEach((f) => uniq.set(stableAttrFieldId(f), f));

  const baseSorted = Array.from(uniq.values()).sort((a, b) => {
    const aKey = a.key || '';
    const bKey = b.key || '';
    const aIndex = PRIORITY_KEYS.indexOf(aKey);
    const bIndex = PRIORITY_KEYS.indexOf(bKey);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    const ao = typeof a.__order === 'number' ? a.__order : 9999;
    const bo = typeof b.__order === 'number' ? b.__order : 9999;
    if (ao !== bo) return ao - bo;
    return String(a.label || '').localeCompare(String(b.label || ''), 'tr');
  });

  if (category === 'vasita') {
    const priorityKeys = ['marka', 'model', 'motor', 'seri', 'donanim', 'paket'];
    const rank = (f: AttrField) => {
      if (f.key) {
        const i = priorityKeys.indexOf(f.key);
        if (i !== -1) return i;
      }
      if (f.type === 'range-number' && f.minKey && f.minKey.endsWith('Min')) {
        const base = f.minKey.slice(0, -3);
        if (base === 'yil') return 10;
        if (base === 'km') return 11;
      }
      return 100;
    };
    return baseSorted
      .map((f, idx) => ({ f, idx }))
      .sort((a, b) => {
        const ra = rank(a.f);
        const rb = rank(b.f);
        if (ra !== rb) return ra - rb;
        return a.idx - b.idx;
      })
      .map((x) => x.f);
  }

  return baseSorted;
};

const isMeaningfulAttributeValue = (v: any) => {
  if (v === null || v === undefined) return false;
  if (typeof v === 'boolean') return true;
  if (typeof v === 'number') return Number.isFinite(v);
  const s = String(v).trim();
  return s.length > 0;
};

const listingEnteredAttributeKeys = (listingAttrs: Record<string, any> | null | undefined) => {
  const attrs = listingAttrs && typeof listingAttrs === 'object' ? listingAttrs : {};
  const reserved = new Set(['minPrice', 'maxPrice', 'minBudget', 'budget']);
  const keys = new Set<string>();
  for (const [k, v] of Object.entries(attrs)) {
    if (!k || reserved.has(k)) continue;
    if (!isMeaningfulAttributeValue(v)) continue;
    keys.add(k);
  }
  return keys;
};

const fieldsMatchingListingAttributes = (fields: AttrFieldLocal[], listingKeySet: Set<string>) => {
  const list = Array.isArray(fields) ? fields : [];
  if (list.length === 0) return [];
  return list.filter((f) => {
    if (!f) return false;
    if (f.required) return true;
    if (f.type === 'range-number' && f.minKey && f.maxKey) {
      return listingKeySet.has(f.minKey) || listingKeySet.has(f.maxKey);
    }
    if (f.key) return listingKeySet.has(f.key);
    return false;
  });
};

const ImageUploadStep = memo(function ImageUploadStep({ images, updateImages, error }: { images: string[]; updateImages: (imgs: string[]) => void; error?: string }) {
  const [uploading, setUploading] = useState(false);
  const [justAddedUrl, setJustAddedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!justAddedUrl) return;
    const id = window.setTimeout(() => setJustAddedUrl(null), 2500);
    return () => window.clearTimeout(id);
  }, [justAddedUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (images.length >= 10) {
      toast({ title: 'Limit', description: 'En fazla 10 görsel ekleyebilirsiniz.', variant: 'warning' });
      e.target.value = '';
      return;
    }
    
    setUploading(true);
    const file = e.target.files[0];
    
    if (file.size === 0) {
      toast({ title: 'Hata', description: 'Seçilen dosya boş', variant: 'destructive' });
      setUploading(false);
      return;
    }

    const formData = new FormData();
    // Sanitize filename to avoid encoding issues
    const ext = file.name.split('.').pop() || 'jpg';
    const safeName = `image-${Date.now()}.${ext}`;
    formData.append('file', file, safeName);
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        cache: 'no-store',
      });
      const raw = await res.text();
      const data = (() => {
        try { return JSON.parse(raw); } catch { return null; }
      })();
      if (!data) {
        throw new Error(raw || 'Yükleme başarısız');
      }
      if (data.success) {
        const next = [...images, data.url];
        updateImages(next);
        setJustAddedUrl(data.url);
        const scanStatus = String(data?.scan?.status || '').toUpperCase();
        const pending = scanStatus && scanStatus !== 'CLEAN';
        toast({
          title: pending ? 'Tarama Bekleniyor' : 'Yüklendi',
          description: pending ? 'Görsel yüklendi, güvenlik taraması bekleniyor.' : 'Görsel eklendi.',
          variant: pending ? 'warning' : 'success',
        });
      } else {
        toast({ title: 'Hata', description: 'Yükleme başarısız: ' + (data.error || 'Bilinmeyen hata'), variant: 'destructive' });
      }
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Yükleme sırasında hata oluştu';
      toast({ title: 'Hata', description: msg, variant: 'destructive' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    updateImages(newImages);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Görseller <span className="text-red-500">*</span></h3>
            <p className="text-sm text-gray-500">
              Yapacağınız işe veya önceki referanslarınıza dair görseller ekleyiniz.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div key={`${img}-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
              {(() => {
                const displaySrc = toProxyImageSrc(img);
                const unoptimized =
                  displaySrc.startsWith('/api/upload') ||
                  img.startsWith('/uploads/') ||
                  /\.jfif($|\?)/i.test(img) ||
                  /\.jif($|\?)/i.test(img) ||
                  isS3Image(img) ||
                  isCloudFrontImage(img);
                return (
              <Image 
                src={displaySrc} 
                alt={`Yüklenen Görsel ${idx + 1}`} 
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-110" 
                unoptimized={unoptimized}
              />
                );
              })()}
              {justAddedUrl === img && (
                <div className="absolute top-2 left-2 inline-flex items-center gap-1 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
                  <Check className="w-3 h-3" />
                  Yüklendi
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="bg-white/90 text-red-600 rounded-full p-2 hover:bg-white transition-colors transform hover:scale-110"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          
          <label className={`
            relative aspect-square rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3
            ${images.length >= 10 ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-70' : (uploading ? 'border-cyan-300 bg-cyan-50' : 'border-gray-300 hover:border-cyan-500 hover:bg-cyan-50')}
          `}>
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
                <span className="text-xs font-medium text-cyan-600">Yükleniyor...</span>
              </>
            ) : (
              <>
                <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                  <Upload className="w-5 h-5 text-cyan-600" />
                </div>
                <div className="text-center px-2">
                  <span className="text-xs font-bold text-gray-700 block">Resim Ekle</span>
                  <span className="text-[10px] text-gray-500">
                    {images.length >= 10 ? 'Limit doldu (10/10)' : `Maks. 20MB • ${images.length}/10`}
                  </span>
                </div>
              </>
            )}
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading || images.length >= 10} />
          </label>
        </div>
      </div>
    </div>
  );
});

const CategoryAttributes = memo(function CategoryAttributes({ category, subcategory, fields, attributes, errors, onChange, listingAttributes }: { category: string; subcategory: string; fields: AttrFieldLocal[]; attributes: Record<string, any>; errors: Record<string, string>; onChange: (key: string, val: any) => void; listingAttributes?: Record<string, any> }) {
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
         const arr = Array.isArray(data) ? data : [];
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
        const arr = Array.isArray(data) ? data : [];
        const sorted = Array.from(new Set(arr)).sort((a,b)=> a.localeCompare(b,'tr'));
        setSeries(sorted.length ? sorted : ['Standart']);
      })
      .catch(() => setSeries(['Standart']));
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
  
  if (!fields.length) return (
    <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        <Info className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900">Ek Bilgi Gerekmiyor</h3>
      <p className="text-gray-500 mt-1">Bu kategori için ek özellik bulunmamaktadır.</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
            <List className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Kategori Detayları</h3>
            <p className="text-sm text-gray-500">Alıcının aradığı özelliklere uygunluğunuzu belirtin</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((f)=> {
            const id = f.key ? `k:${f.key}` : (f.minKey && f.maxKey) ? `r:${f.minKey}:${f.maxKey}` : `l:${f.label}`;
            const isManual = f.key ? manualModes[f.key] : false;
            
            let warning = null;
            if (listingAttributes) {
               if (f.type === 'range-number' && f.minKey && f.maxKey) {
                  const lMinRaw = listingAttributes[f.minKey];
                  const lMaxRaw = listingAttributes[f.maxKey];
                  const lMin = Number(lMinRaw);
                  const lMax = Number(lMaxRaw);
                  const hasLMin = lMinRaw !== undefined && String(lMinRaw).trim() !== '' && !isNaN(lMin);
                  const hasLMax = lMaxRaw !== undefined && String(lMaxRaw).trim() !== '' && !isNaN(lMax);

                  const oMinRaw = attributes[f.minKey];
                  const oMaxRaw = attributes[f.maxKey];
                  const oMin = Number(oMinRaw);
                  const oMax = Number(oMaxRaw);
                  const hasOMin = oMinRaw !== undefined && String(oMinRaw).trim() !== '' && !isNaN(oMin);
                  const hasOMax = oMaxRaw !== undefined && String(oMaxRaw).trim() !== '' && !isNaN(oMax);

                  const offerLo = hasOMin ? oMin : hasOMax ? oMax : null;
                  const offerHi = hasOMax ? oMax : hasOMin ? oMin : null;

                  if ((hasLMin || hasLMax) && offerLo !== null && offerHi !== null) {
                    const violates =
                      (hasLMin && offerHi < lMin) ||
                      (hasLMax && offerLo > lMax);
                    if (violates) {
                      warning = `Talep kriterlerine (${hasLMin ? lMin : '...'} - ${hasLMax ? lMax : '...'}) uymuyor`;
                    }
                  }
               } else if (f.type === 'boolean') {
                  const listingVal = listingAttributes[f.key!];
                  const offerVal = attributes[f.key!];
                  const isListingTrue = listingVal === true || listingVal === 'true';
                  const isOfferTrue = offerVal === true || offerVal === 'true';
                  
                  if (isListingTrue !== isOfferTrue) {
                     warning = `Talep kriterlerine (${isListingTrue ? 'Evet' : 'Hayır'}) uymuyor`;
                  }
               } else if (f.key) {
                  const listingVal = listingAttributes[f.key];
                  const offerVal = attributes[f.key];
                  if (listingVal && offerVal && String(listingVal).trim() !== '' && String(offerVal).trim() !== '') {
                     const listingVals = String(listingVal).split(',').map(s => s.trim().toLowerCase());
                     const offerVals = String(offerVal).split(',').map(s => s.trim().toLowerCase());
                     const hasMatch = offerVals.some(ov => listingVals.includes(ov));
                     if (!hasMatch) {
                         warning = `Talep kriterlerine (${listingVal}) uymuyor`;
                     }
                  }
               }
            }

            return (
            <div key={id}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{f.label} {f.required ? <span className="text-red-500">*</span> : ''}</label>
              {f.type === 'select' ? (
                <>
                {isManual ? (
                  <input
                    type="text"
                    value={attributes[f.key!] ?? ''}
                    onChange={(e)=>onChange(f.key!, e.target.value)}
                    placeholder={`${f.label} giriniz`}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${errors[f.key!] ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
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
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none transition-all ${errors[f.key!] ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <option value="">Seçiniz</option>
                      {(() => {
                        let opts = f.options ? [...f.options] : [];
                        
                        if (f.key === 'marka' && overrideKeyLocal === 'vasita/otomobil') {
                          // Use default options
                        }
                        
                        if (f.key === 'model' && brand) {
                           opts = models;
                        } else if (f.key === 'seri') {
                           opts = series;
                        } else if (f.key === 'paket') {
                           if (trims.length > 0) {
                              opts = trims;
                           } else {
                              const defaultPaket = ['Base','Comfort','Elegance','Premium','Sport','AMG Line','M Sport','S-Line','Trendline','Highline'];
                              opts = defaultPaket;
                           }
                        }
                        return opts.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ));
                      })()}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <ChevronRight className="w-4 h-4 rotate-90" />
                    </div>
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
                  <Info className="w-3 h-3" />
                  {isManual ? 'Listeden seç' : 'Listede yok mu? Elle gir'}
                </button>
                </>
              ) : f.type === 'range-number' ? (
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder={f.minLabel || 'En düşük'}
                    value={attributes[f.minKey!] ?? ''}
                    onChange={(e)=>onChange(f.minKey!, e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${errors[f.minKey!] ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                  />
                  <input
                    type="number"
                    placeholder={f.maxLabel || 'En yüksek'}
                    value={attributes[f.maxKey!] ?? ''}
                    onChange={(e)=>onChange(f.maxKey!, e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${errors[f.maxKey!] ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                  />
                </div>
              ) : f.type === 'number' ? (
                <input
                  type="number"
                  value={attributes[f.key!] ?? ''}
                  onChange={(e)=>onChange(f.key!, e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${errors[f.key!] ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                />
              ) : f.type === 'boolean' ? (
                <label className="flex items-center p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={!!attributes[f.key!]}
                    onChange={(e)=>onChange(f.key!, e.target.checked)}
                    className="w-5 h-5 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                  />
                  <span className="ml-3 text-gray-700 font-medium">{f.label}</span>
                </label>
              ) : f.type === 'multiselect' ? (
                <div className="relative">
                  <select
                    multiple
                    value={String(attributes[f.key!] ?? '').split(',').filter(Boolean)}
                    onChange={(e)=> {
                      const selected = Array.from((e.target as HTMLSelectElement).selectedOptions).map(o=> o.value)
                      onChange(f.key!, selected.join(','))
                    }}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all min-h-[120px] ${errors[f.key!] ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    {(f.options || []).map((op: string) => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </select>
                  <div className="text-xs text-gray-500 mt-1">Birden fazla seçim yapmak için CTRL tuşuna basılı tutun.</div>
                </div>
              ) : (
                <input
                  type="text"
                  value={attributes[f.key!] ?? ''}
                  onChange={(e)=>onChange(f.key!, e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${errors[f.key!] ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                />
              )}
              {(errors[f.key!] || errors[f.minKey!] || errors[f.maxKey!]) && (
                 <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors[f.key!] || errors[f.minKey!] || errors[f.maxKey!]}</p>
              )}
              {warning && <p className="text-amber-600 text-xs mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {warning}</p>}
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

const StepIndicator = memo(function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
  <div className="mb-8 px-4 sm:px-0">
    <div className="relative flex items-center justify-between">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full" />
      <div 
        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-cyan-600 transition-all duration-500 rounded-full"
        style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
      />
      
      {STEPS.map((step) => {
        const isActive = currentStep >= step.id;
        const isCurrent = currentStep === step.id;
        const Icon = step.icon;
        
        return (
          <div key={step.id} className="flex flex-col items-center gap-2 bg-gray-50 px-2">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2
              ${isActive 
                ? 'bg-cyan-600 border-cyan-600 text-white shadow-lg scale-110' 
                : 'bg-white border-gray-300 text-gray-400'
              }
              ${isCurrent ? 'ring-4 ring-cyan-100' : ''}
            `}>
              {isActive ? (
                isCurrent ? <Icon className="w-5 h-5" /> : <Check className="w-6 h-6" />
              ) : (
                <span className="text-sm font-bold">{step.id}</span>
              )}
            </div>
            <div className="hidden sm:block text-center">
              <p className={`text-xs font-bold ${isActive ? 'text-cyan-600' : 'text-gray-500'}`}>
                {step.title}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
  );
});

const PricingStep = memo(function PricingStep({ formData, errors, updateFormData, listingPrice }: { formData: FormData; errors: Partial<Record<keyof FormData, string>>; updateFormData: (field: keyof FormData, value: any) => void; listingPrice: number | null }) {
  return (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teklif Tutarı (TL) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="1"
              value={formData.price}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || Number(val) >= 0) {
                  updateFormData('price', val);
                }
              }}
              placeholder="Örn: 2500"
              className={`
                w-full px-4 py-3 pl-12 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-lg font-medium
                ${errors.price ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}
              `}
            />
          </div>
          {errors.price && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.price}</p>}
          
          {(typeof listingPrice === 'number' && !isNaN(parseFloat(formData.price)) && parseFloat(formData.price) > listingPrice) && (
            <p className="text-amber-600 text-xs mt-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Teklifiniz talep bütçesinden ({listingPrice.toLocaleString('tr-TR')}) yüksek.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hızlı Tutar Seçimi</label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => typeof listingPrice === 'number' && updateFormData('price', String(Math.max(1, Math.floor(listingPrice * 0.95))))}
              className="px-4 py-2 text-sm font-medium rounded-xl bg-gray-50 text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-200 border border-gray-200 transition-all"
            >
              −%5
            </button>
            <button
              type="button"
              onClick={() => typeof listingPrice === 'number' && updateFormData('price', String(Math.floor(listingPrice)))}
              className="px-4 py-2 text-sm font-medium rounded-xl bg-gray-50 text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-200 border border-gray-200 transition-all"
            >
              Ortalama
            </button>
            <button
              type="button"
              onClick={() => typeof listingPrice === 'number' && updateFormData('price', String(Math.floor(listingPrice * 1.05)))}
              className="px-4 py-2 text-sm font-medium rounded-xl bg-gray-50 text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-200 border border-gray-200 transition-all"
            >
              +%5
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Fiyat teklifinizde malzeme ve işçilik maliyetlerini göz önünde bulundurunuz.
          </p>
        </div>
      </div>
    </div>

    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div>
        <h3 className="text-sm font-bold text-amber-800">Dikkat Edilmesi Gerekenler</h3>
        <ul className="mt-1 text-xs text-amber-700 space-y-1 list-disc list-inside">
          <li>Teklifiniz müşteriye doğrudan iletilecektir.</li>
          <li>Rekabetçi fiyatlar şansınızı artırır.</li>
        </ul>
      </div>
    </div>
  </div>
  );
});

const ReviewStep = memo(function ReviewStep({ formData, attrs, updateFormData, errors, fields }: { formData: FormData, attrs: any, updateFormData: (field: keyof FormData, value: any) => void, errors: Partial<Record<keyof FormData, string>>, fields: AttrFieldLocal[] }) {
  
  const attrLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    (fields || []).forEach((f) => {
      if (f?.key) map.set(f.key, f.label);
    });
    return map;
  }, [fields]);

  return (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200 text-cyan-600 shadow-sm">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Teklif Özeti</h3>
          <p className="text-xs text-gray-500">Teklifinizi son kez kontrol edip onaylayın</p>
        </div>
      </div>
      
      <div className="p-6 space-y-8">
        {/* Fiyat Kartı */}
        <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-lime-50 to-emerald-50 rounded-2xl border border-lime-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-lime-100 rounded-full blur-3xl -mr-16 -mt-16 opacity-50" />
            <div className="relative z-10 flex flex-col items-center">
            <span className="text-sm font-semibold text-lime-600 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Teklif Tutarı
            </span>
            <div className="text-5xl font-bold text-lime-700 tracking-tight">
              {formData.price ? `${Number(formData.price).toLocaleString('tr-TR')}` : 'Belirtilmemiş'}
            </div>
          </div>
        </div>

        {/* Görseller */}
        {formData.images && formData.images.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-cyan-500" />
              Eklenen Görseller <span className="text-gray-400 font-normal">({formData.images.length})</span>
            </h4>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {formData.images.map((img, i) => (
                <div key={`${img}-${i}`} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-all">
                  {(() => {
                    const displaySrc = toProxyImageSrc(img);
                    const unoptimized =
                      displaySrc.startsWith('/api/upload') ||
                      img.startsWith('/uploads/') ||
                      /\.jfif($|\?)/i.test(img) ||
                      /\.jif($|\?)/i.test(img) ||
                      isS3Image(img) ||
                      isCloudFrontImage(img);
                    return (
                      <Image 
                        src={displaySrc} 
                        alt={`Teklif görseli ${i+1}`} 
                        fill
                        sizes="(max-width: 768px) 25vw, 20vw"
                        className="object-cover" 
                        unoptimized={unoptimized}
                      />
                    );
                  })()}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Özellikler */}
        {attrs && Object.keys(attrs).length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <List className="w-4 h-4 text-purple-500" />
              Seçilen Özellikler
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(attrs).map(([k, v]: any) => {
                const s = String(v);
                const parts = s.split(',').map(p => p.trim()).filter(Boolean);
                
                // Use dynamic map first, then fallback to title case
                const label = attrLabelMap.get(k) || humanizeKeyTR(k);
                
                return (
                  <div key={k} className="flex flex-col bg-gray-50 p-3 rounded-xl border border-gray-100 hover:border-gray-300 transition-colors">
                    <span className="text-xs text-gray-500 mb-1">{label}</span>
                    <div className="flex flex-wrap gap-1">
                      {parts.length ? parts.map(p => (
                        <span key={`${k}-${p}`} className="text-sm font-semibold text-gray-900">{p}</span>
                      )) : (
                        <span key={`${k}-single`} className="text-sm font-semibold text-gray-900">{s}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Mesaj Alanı */}
        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            Teklif Mesajınız <span className="text-red-500">*</span>
          </h4>
          
          <div className="relative">
            <textarea
              value={formData.message}
              onChange={(e) => updateFormData('message', e.target.value)}
              rows={5}
              placeholder="Müşteriye kendinizi tanıtın ve teklif detaylarınızdan bahsedin..."
              className={`w-full px-5 py-4 border rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none ${errors.message ? 'border-red-300 focus:ring-red-200 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
            />
            <div className="absolute bottom-4 right-4 text-xs text-gray-400 font-medium bg-white/80 px-2 py-1 rounded-full backdrop-blur-sm border border-gray-100 shadow-sm">
              {(formData.message || '').length} karakter
            </div>
          </div>
          {errors.message && (
            <div className="flex items-center mt-2 text-red-500 text-xs">
              <AlertCircle className="w-3 h-3 mr-1" />
              {errors.message}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
});

const ListingDetailsCard = memo(function ListingDetailsCard({ listing }: { listing: any }) {
  if (!listing) return null;

  const categoryName =
    listing.category?.name || listing.category?.slug || "Kategori";
  const subCategoryName =
    listing.subCategory?.name || listing.subCategory?.slug || "Alt Kategori";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-8">
      {/* Header Banner */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
          <span className="font-medium">{categoryName}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="font-medium">{subCategoryName}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
            #{listing.id?.toString().slice(-6) || '...'}
          </span>
          <span className="text-[10px] text-lime-600 font-medium flex items-center gap-1 bg-lime-50 px-2 py-0.5 rounded-full border border-lime-100">
            <span className="w-1.5 h-1.5 bg-lime-500 rounded-full animate-pulse"></span> Aktif Talep
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 leading-tight mb-3 line-clamp-2">
            {listing.title}
          </h2>
          {(() => {
            const minP = listing.attributes?.minPrice ? Number(listing.attributes.minPrice) : 0;
            const maxPAttr = listing.attributes?.maxPrice ? Number(listing.attributes.maxPrice) : 0;
            const budget = typeof listing.price === 'number' ? listing.price : 0;

            const hasMin = minP > 0;
            const hasMax = maxPAttr > 0;
            const hasBudget = budget > 0;

            let from = 0;
            let to = 0;

            if (hasMin && hasMax) {
              from = minP;
              to = maxPAttr;
            } else if (hasMin && hasBudget) {
              from = minP;
              to = budget;
            } else if (hasMin) {
              return (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 bg-cyan-50 px-4 py-3 rounded-xl border border-cyan-100">
                  <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Bütçe
                  </span>
                  <span className="text-lg font-bold text-cyan-700 text-right sm:text-left">
                    {minP.toLocaleString('tr-TR')} - ∞
                  </span>
                </div>
              );
            } else if (hasMax) {
              from = 0;
              to = maxPAttr;
            } else if (hasBudget) {
              from = 0;
              to = budget;
            } else {
              return null;
            }

            return (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 bg-cyan-50 px-4 py-3 rounded-xl border border-cyan-100">
                <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Bütçe
                </span>
                <span className="text-lg font-bold text-cyan-700 text-right sm:text-left">
                  {from.toLocaleString('tr-TR')} - {to.toLocaleString('tr-TR')}
                </span>
              </div>
            );
          })()}
        </div>

        {/* Location Info */}
        <div className="flex items-center gap-2 text-gray-600 text-sm mb-6 pb-6 border-b border-gray-100">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="font-medium truncate">{listing.location?.city}{listing.location?.district ? `, ${listing.location?.district}` : ''}</span>
        </div>

        {/* Description */}
        {listing.description && (
            <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Talep Açıklaması
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 text-gray-700 text-sm leading-relaxed whitespace-pre-line border border-gray-100 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                    {listing.description}
                </div>
            </div>
        )}

        {/* Attributes */}
        {listing.attributes && Object.keys(listing.attributes).length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1">
              <List className="w-3 h-3" /> Özellikler
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(listing.attributes).map(([k, v]: any) => {
                if (k === 'minPrice' || k === 'maxPrice') return null;
                const s = String(v);
                if(!s) return null;
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
                const label = map[k] || humanizeKeyTR(k);
                return (
                    <div key={k} className="flex items-center justify-between group">
                        <span className="text-xs text-gray-500 font-medium shrink-0 group-hover:text-gray-700 transition-colors">{label}</span>
                        <div className="flex-1 border-b border-gray-100 border-dashed mx-2"></div>
                        <span className="text-xs font-semibold text-gray-900 text-right truncate">
                            {s}
                        </span>
                    </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default function TeklifVerPage() {
  const router = useRouter();
  const params = useParams();
  const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || '');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({ price: "", message: "", images: [] });
  const [listing, setListing] = useState<any>(null);
  const [attributes, setAttributes] = useState<any>({});
  const [dynamicAttributes, setDynamicAttributes] = useState<any[] | null>(null);
  const requestFields = useMemo(() => {
    const cat = listing?.category?.slug;
    const sub = listing?.subCategory?.slug;
    if (!cat || !Array.isArray(dynamicAttributes)) return [];
    return attributesToRequestFields(String(cat), String(sub || ''), dynamicAttributes);
  }, [listing?.category?.slug, listing?.subCategory?.slug, dynamicAttributes]);
  const listingKeySet = useMemo(() => listingEnteredAttributeKeys(listing?.attributes), [listing?.attributes]);
  const offerFieldsFromSchema = useMemo(() => fieldsMatchingListingAttributes(requestFields, listingKeySet), [requestFields, listingKeySet]);
  const offerFields = useMemo(() => {
    const covered = new Set<string>();
    offerFieldsFromSchema.forEach((f) => {
      if (!f) return;
      if (f.type === 'range-number' && f.minKey && f.maxKey) {
        covered.add(f.minKey);
        covered.add(f.maxKey);
        return;
      }
      if (f.key) covered.add(f.key);
    });

    const unknown: AttrFieldLocal[] = Array.from(listingKeySet)
      .filter((k) => !covered.has(k))
      .sort((a, b) => a.localeCompare(b, 'tr'))
      .map((k) => ({
        key: k,
        label: humanizeKeyTR(k),
        type: 'text',
        required: false,
      }));

    const combined = [...offerFieldsFromSchema, ...unknown];
    const merged = new Map<string, AttrFieldLocal>();
    combined.forEach((f) => {
      if (!f) return;
      const id = stableAttrFieldId(f);
      if (!merged.has(id)) {
        merged.set(id, f);
        return;
      }
      const existing = merged.get(id)!;
      if (!existing.required && f.required) {
        merged.set(id, f);
        return;
      }
      if (!existing.options && f.options) {
        merged.set(id, f);
        return;
      }
      if (existing.type === 'text' && f.type !== 'text') {
        merged.set(id, f);
      }
    });
    return Array.from(merged.values());
  }, [offerFieldsFromSchema, listingKeySet]);

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>> & { images?: string }>({});
  const [attributeErrors, setAttributeErrors] = useState<Record<string, string>>({});
  const [missingRequiredFields, setMissingRequiredFields] = useState<string[]>([]);
  const [blockedReason, setBlockedReason] = useState<string>("");
  const [elig, setElig] = useState<any>(null);
  const [tick, setTick] = useState<number>(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> & { images?: string } = {};
    const newAttrErrors: Record<string, string> = {};

    if (step === 1) {
      if (listing) {
        const labelMap: Record<string, string> = {};
        const visibleKeys = new Set<string>();
        offerFields.forEach((f) => {
          if (!f) return;
          if (f.key) labelMap[f.key] = f.label;
          if (f.key) visibleKeys.add(f.key);
          if (f.type === 'range-number') {
            if (f.minKey) labelMap[f.minKey] = f.label;
            if (f.maxKey) labelMap[f.maxKey] = f.label;
            if (f.minKey) visibleKeys.add(f.minKey);
            if (f.maxKey) visibleKeys.add(f.maxKey);
            const minBase = f.minKey?.endsWith('Min') ? f.minKey.slice(0, -3) : null;
            const maxBase = f.maxKey?.endsWith('Max') ? f.maxKey.slice(0, -3) : null;
            const base = minBase && maxBase && minBase === maxBase ? minBase : null;
            if (base) labelMap[base] = f.label;
            if (base) visibleKeys.add(base);
          }
        });

        offerFields.forEach((f) => {
          if (!f || !f.required) return;
          if (f.type === 'range-number' && f.minKey && f.maxKey) {
            const minBase = f.minKey.endsWith('Min') ? f.minKey.slice(0, -3) : null;
            const maxBase = f.maxKey.endsWith('Max') ? f.maxKey.slice(0, -3) : null;
            const baseKey = minBase && maxBase && minBase === maxBase ? minBase : null;
            if (baseKey && !visibleKeys.has(baseKey)) return;
            if (!visibleKeys.has(f.minKey) && !visibleKeys.has(f.maxKey)) return;
            const baseVal = baseKey ? attributes[baseKey] : undefined;
            const a = attributes[f.minKey];
            const b = attributes[f.maxKey];
            const hasBase = baseVal !== undefined && String(baseVal).trim() !== '';
            const hasA = a !== undefined && String(a).trim() !== '';
            const hasB = b !== undefined && String(b).trim() !== '';
            if (!hasBase && !hasA && !hasB) {
              if (baseKey) newAttrErrors[baseKey] = 'Zorunlu';
              else newAttrErrors[f.minKey] = 'Zorunlu';
            }
            return;
          }
          if (f.key) {
            if (!visibleKeys.has(f.key)) return;
            const v = attributes[f.key];
            const present =
              f.type === 'boolean'
                ? (f.key in attributes)
                : (v !== undefined && String(v).trim() !== '' && (!Array.isArray(v) || v.length > 0));
            if (!present) newAttrErrors[f.key] = 'Zorunlu';
          }
        });

        if (visibleKeys.has('model') && String(attributes['marka'] || '').trim() && !String(attributes['model'] || '').trim()) {
          newAttrErrors['model'] = 'Zorunlu';
        }

        const missingLabels = Object.keys(newAttrErrors).map((key) => labelMap[key] || key);
        setMissingRequiredFields(missingLabels);
      }
      if (Object.keys(newAttrErrors).length > 0) {
        setAttributeErrors(newAttrErrors);
        setSubmitError('Lütfen zorunlu alanları doldurunuz.');
        return false;
      } else {
        setAttributeErrors({});
        setMissingRequiredFields([]);
      }
    }

    if (step === 2) {
      if (!formData.price) newErrors.price = 'Fiyat belirtmelisiniz';
      if (parseInt(formData.price) < 1) newErrors.price = 'Geçerli bir fiyat giriniz';
    }

    if (step === 3) {
      if (!formData.images || formData.images.length === 0) {
        newErrors.images = 'En az bir görsel yüklemelisiniz';
      }
    }

    if (step === 4) {
      const effectiveMessage = formData.message?.trim() || '';
      if (effectiveMessage.length < 20) {
        newErrors.message = 'Mesaj en az 20 karakter olmalı';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, attributes, listing, offerFields]);

  const updateFormData = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field] || (field === 'images' && errors.images)) {
      setErrors(prev => ({ ...prev, [field]: undefined, images: undefined }));
    }
  }, [errors]);

  const updateImages = useCallback((imgs: string[]) => {
    updateFormData('images', imgs);
  }, [updateFormData]);

  const handleAttributeChange = useCallback((key: string, val: any) => {
    setAttributes((prev: any) => {
      const next = { ...prev, [key]: val };
      if (key === 'marka') { next['model'] = ''; next['seri'] = ''; next['paket'] = ''; }
      if (key === 'model') { next['seri'] = ''; next['paket'] = ''; }
      if (key === 'seri') { next['paket'] = ''; }
      return next;
    });
    setAttributeErrors(prev => {
      const next = { ...prev };
      delete next[key];
      if (key === 'marka') { delete next.model; delete next.seri; delete next.paket; }
      if (key === 'model') { delete next.seri; delete next.paket; }
      if (key === 'seri') { delete next.paket; }
      return next;
    });
  }, []);

  const nextStep = useCallback(() => {
    if (blockedReason) return;
    if (validateStep(currentStep) && currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [validateStep, currentStep, blockedReason]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (currentStep < STEPS.length) {
      nextStep();
      return;
    }

    if (listing?.status && listing.status !== 'OPEN') {
      const msg = 'Bu talep henüz yayında değil.';
      setSubmitError(msg);
      toast({ title: 'Hata', description: msg, variant: 'destructive' });
      return;
    }
    if (!validateStep(currentStep)) return;
    try {
      setIsSubmitting(true);
      setSubmitError("");
      setSubmitSuccess("");
      const listingId =
        (listing?.id as string | undefined) ||
        (typeof params?.id === "string"
          ? params.id
          : Array.isArray(params?.id)
            ? params?.id[0]
            : "");

      const priceForCheck = String(formData.price || '').trim();
      const eligRes = await fetch(
        `/api/offers/eligibility?listingId=${encodeURIComponent(listingId)}${priceForCheck ? `&price=${encodeURIComponent(priceForCheck)}` : ''}`,
        { cache: 'no-store' }
      );
      const eligData = await eligRes.json().catch(() => null);
      if (eligData && eligData.canOffer === false) {
        const msg =
          eligData.reason === 'DAILY_LIMIT'
            ? 'Aynı talebe günde en fazla 2 defa teklif verebilirsiniz.'
            : eligData.reason === 'COOLDOWN'
              ? 'Tekrar teklif vermek için 1 saat beklemelisiniz.'
              : eligData.reason === 'PENDING_EXISTS'
                ? 'Bu talep için zaten bekleyen bir teklifiniz var.'
                : eligData.reason === 'OVER_BUDGET_ONCE'
                  ? 'Bütçe üzeri teklifi bu talep için en fazla 1 defa verebilirsiniz.'
                  : eligData.reason === 'BLOCKED'
                    ? 'Bu talep için teklif verme yetkiniz bulunmuyor.'
                    : eligData.reason === 'UNAUTHENTICATED'
                      ? 'Teklif vermek için giriş yapmanız gerekiyor.'
                      : 'Şu anda teklif verilemiyor.'
        setBlockedReason(msg);
        toast({ title: 'Hata', description: msg, variant: 'destructive' });
        return;
      }

      const allowedAttributeKeys = new Set<string>();
      offerFields.forEach((f) => {
        if (!f) return;
        if (f.type === 'range-number' && f.minKey && f.maxKey) {
          allowedAttributeKeys.add(f.minKey);
          allowedAttributeKeys.add(f.maxKey);
          return;
        }
        if (f.key) allowedAttributeKeys.add(f.key);
      });

      const sanitizedAttributes: Record<string, any> = {};
      Object.entries(attributes || {}).forEach(([k, v]) => {
        if (!allowedAttributeKeys.has(k)) return;
        if (typeof v === 'boolean') {
          sanitizedAttributes[k] = v;
          return;
        }
        if (!isMeaningfulAttributeValue(v)) return;
        sanitizedAttributes[k] = v;
      });

      const res = await fetch('/api/teklif-ver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          price: formData.price,
          message: formData.message,
          attributes: sanitizedAttributes,
          images: formData.images,
        }),
      });
      if (res.status === 401) {
        const callbackUrl = `/teklif-ver/${listingId || params?.id || ''}`;
        toast({ title: 'Oturum Gerekli', description: 'Teklif vermek için tekrar giriş yapmalısınız.', variant: 'warning' });
        router.push(`/giris?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        return;
      }
      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }
      if (res.ok) {
        toast({ title: 'Başarılı!', description: 'Teklifiniz gönderildi', variant: 'success' });
        setSubmitSuccess('Teklifiniz başarıyla gönderildi');
        setTimeout(() => { router.push(`/talep/${params?.id}`); }, 1500);
      } else {
        const msg = data?.error || `Teklif gönderilemedi (HTTP ${res.status})`;
        setSubmitError(msg);
        toast({ title: 'Hata', description: msg, variant: 'destructive' });
      }
    } catch {
      const msg = 'Teklif gönderilirken hata oluştu';
      setSubmitError(msg);
      toast({ title: 'Hata', description: msg, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, params?.id, currentStep, validateStep, router, attributes, isSubmitting, listing?.id, listing?.status, nextStep, offerFields]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/talep?id=${params?.id}`);
        if (res.ok) {
          const data = await res.json();
          if (!active) return;
          setListing(data);
          if (data?.status && data.status !== 'OPEN') {
            setBlockedReason('Bu talep henüz yayında değil.');
          } else if (data?.currentUserId && Array.isArray(data?.offers)) {
            const hasPending = data.offers.some((o: any) => o && o.sellerId === data.currentUserId && o.status === 'PENDING');
            if (hasPending) {
              setBlockedReason('Bu talep için zaten bekleyen bir teklifiniz var. Talep sahibi yanıtlayana kadar yeni teklif veremezsiniz.');
            } else {
              setBlockedReason('');
            }
          } else {
            setBlockedReason('');
          }
          if (typeof data.price === 'number') {
            setFormData(prev => {
              if (prev.price) return prev;
              return { ...prev, price: String(Math.max(1, Math.floor(data.price * 0.9))) };
            });
          }

          const catSlug = data?.category?.slug;
          const subCatSlug = data?.subCategory?.slug;

          if (catSlug) {
            try {
              const query = new URLSearchParams();
              if (subCatSlug) {
                query.append('subcategory', subCatSlug);
              }

              const attrRes = await fetch(`/api/categories/${catSlug}/attributes?${query.toString()}`);
              
              if (attrRes.ok) {
                const attrs = await attrRes.json();
                if (!active) return;
                if (Array.isArray(attrs)) {
                  setDynamicAttributes(attrs);
                }
              }
            } catch (err) {
              console.error("Özellikler alınırken hata oluştu:", err);
            }
          }
        }
      } catch {}
    })();
    return () => { active = false; };
  }, [params?.id]);

  useEffect(() => {
    const listingId =
      (listing?.id as string | undefined) ||
      (typeof params?.id === "string"
        ? params.id
        : Array.isArray(params?.id)
          ? params?.id[0]
          : "");
    if (!listingId) return;
    const priceForCheck = String(formData.price || '').trim();
    fetch(`/api/offers/eligibility?listingId=${encodeURIComponent(listingId)}${priceForCheck ? `&price=${encodeURIComponent(priceForCheck)}` : ''}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => setElig(data))
      .catch(() => setElig(null));
  }, [listing?.id, params?.id, formData.price]);

  useEffect(() => {
    if (!elig) return;
    if (elig.canOffer) {
      if (listing?.status === 'OPEN') setBlockedReason('');
      return;
    }
    const msg =
      elig.reason === 'DAILY_LIMIT'
        ? 'Aynı talebe günde en fazla 2 defa teklif verebilirsiniz.'
        : elig.reason === 'COOLDOWN'
          ? 'Tekrar teklif vermek için 1 saat beklemelisiniz.'
          : elig.reason === 'PENDING_EXISTS'
            ? 'Bu talep için zaten bekleyen bir teklifiniz var. Talep sahibi yanıtlayana kadar yeni teklif veremezsiniz.'
            : elig.reason === 'OVER_BUDGET_ONCE'
              ? 'Bütçe üzeri teklifi bu talep için en fazla 1 defa verebilirsiniz.'
              : elig.reason === 'BLOCKED'
                ? 'Bu talep için teklif verme yetkiniz bulunmuyor.'
                : elig.reason === 'UNAUTHENTICATED'
                  ? 'Teklif vermek için giriş yapmanız gerekiyor.'
                  : 'Şu anda teklif verilemiyor.'
    setBlockedReason(msg);
  }, [elig, listing?.status]);

  useEffect(() => {
    if (!elig?.nextAllowedAt) return;
    const id = window.setInterval(() => setTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [elig?.nextAllowedAt]);

  const countdownText = useMemo(() => {
    if (!elig?.nextAllowedAt) return null;
    const until = new Date(elig.nextAllowedAt).getTime();
    const diff = Math.max(0, until - tick);
    const s = Math.floor(diff / 1000);
    const hh = String(Math.floor(s / 3600)).padStart(2, '0');
    const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }, [elig?.nextAllowedAt, tick]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CategoryAttributes
            category={listing?.category?.slug}
            subcategory={listing?.subCategory?.slug}
            fields={offerFields}
            attributes={attributes}
            errors={attributeErrors}
            onChange={handleAttributeChange}
            listingAttributes={listing?.attributes}
          />
        );
      case 2:
        return <PricingStep formData={formData} errors={errors} updateFormData={updateFormData} listingPrice={listing?.price ?? null} />;
      case 3:
        return <ImageUploadStep images={formData.images} updateImages={updateImages} error={errors.images} />;
      case 4:
        return <ReviewStep formData={formData} attrs={attributes} updateFormData={updateFormData} errors={errors} fields={offerFields} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
           <Link 
            href="/" 
            className="flex items-center gap-2 text-gray-500 hover:text-cyan-600 transition-colors"
          >
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-cyan-50">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <span className="font-medium">Ana Sayfa</span>
          </Link>
          <div className="text-sm font-medium text-gray-900">
            Talep #{params?.id}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Teklifinizi Oluşturun</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Alıcıya profesyonel bir teklif sunarak işi alma şansınızı artırın.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <StepIndicator currentStep={currentStep} />
            
            <div className="mt-6">
              {submitError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Hata Oluştu</h4>
                    <p className="text-sm mt-1">{submitError}</p>
                    {missingRequiredFields.length > 0 && (
                      <ul className="mt-2 text-xs text-red-700 list-disc list-inside">
                        {missingRequiredFields.map((name, index) => (
                          <li key={`${name}-${index}`}>{name}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
              {blockedReason && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Teklif Verilemedi</h4>
                    <p className="text-sm mt-1">{blockedReason}</p>
                    {countdownText && (
                      <p className="text-sm mt-1 font-bold">{countdownText}</p>
                    )}
                  </div>
                </div>
              )}
              {submitSuccess && (
                <div className="mb-6 p-4 bg-lime-50 border border-lime-100 rounded-xl flex items-start gap-3 text-lime-700 animate-in fade-in slide-in-from-top-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Başarılı</h4>
                    <p className="text-sm mt-1">{submitSuccess}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {renderStep()}

                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
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
                    <ArrowLeft className="w-4 h-4" />
                    Geri
                  </button>

                  {currentStep < STEPS.length ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!!blockedReason}
                      className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg transform hover:-translate-y-0.5 ${
                        blockedReason
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-gray-100'
                          : 'bg-cyan-600 text-white hover:bg-cyan-700 shadow-cyan-200 hover:shadow-cyan-300'
                      }`}
                    >
                      Devam Et
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting || !!blockedReason}
                      className={`
                        flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg transform hover:-translate-y-0.5
                        ${isSubmitting || blockedReason
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-lime-600 hover:bg-lime-700 shadow-lime-200 hover:shadow-lime-300'
                        }
                      `}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Gönderiliyor...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Teklifi Gönder
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
              
              {formData.price && (
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                      '@context': 'https://schema.org',
                      '@type': 'Offer',
                      priceCurrency: 'TRY',
                      price: String(formData.price),
                      itemOffered: listing?.id ? { '@type': 'Product', name: listing?.title, url: `${origin}/talep/${listing.id}` } : undefined,
                    }),
                  }}
                />
              )}
            </div>
          </div>
          
          <div className="lg:col-span-1">
             <ListingDetailsCard listing={listing} />
             
             <div className="mt-6 bg-cyan-50 rounded-2xl p-5 border border-cyan-100">
                <div className="flex items-center gap-3 mb-3">
                   <ShieldCheck className="w-6 h-6 text-cyan-600" />
                   <h3 className="font-bold text-cyan-900 text-sm">Güvenli Teklif</h3>
                </div>
                <p className="text-xs text-cyan-700 leading-relaxed">
                   Teklifiniz, müşteri kabul edene kadar bağlayıcı değildir. Ödemeler güvenli havuz hesabında tutulur.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
