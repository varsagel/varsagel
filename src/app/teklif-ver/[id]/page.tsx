"use client";
import { useState, useCallback, memo, useEffect, type ComponentType } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { ATTR_SCHEMAS, AttrField } from '@/data/attribute-schemas';
import { CATEGORIES } from "@/data/categories";
import { ATTR_SUBSCHEMAS, BRAND_MODELS, MODEL_SERIES, SERIES_TRIMS, SERIES_TRIMS_EX, MODEL_SERIES_EXTRA, SERIES_TRIMS_EXTRA } from '@/data/attribute-overrides';
import { 
  Upload, X, Image as ImageIcon, Check, AlertCircle, ChevronRight, 
  ChevronLeft, FileText, Send, MapPin, 
  Info, Lightbulb, ArrowLeft, ArrowRight, ShieldCheck, AlertTriangle,
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
const ATTRS: Record<string, AttrFieldLocal[]> = ATTR_SCHEMAS;

const ImageUploadStep = memo(function ImageUploadStep({ images, updateImages, error }: { images: string[]; updateImages: (imgs: string[]) => void; error?: string }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        updateImages([...images, data.url]);
      } else {
        toast({ title: 'Hata', description: 'Yükleme başarısız: ' + (data.error || 'Bilinmeyen hata'), variant: 'destructive' });
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Hata', description: 'Yükleme sırasında hata oluştu', variant: 'destructive' });
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
              <img src={img} alt={`Uploaded ${idx}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
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
            ${uploading ? 'border-cyan-300 bg-cyan-50' : 'border-gray-300 hover:border-cyan-500 hover:bg-cyan-50'}
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
                  <span className="text-[10px] text-gray-500">Max 5MB</span>
                </div>
              </>
            )}
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
          </label>
        </div>
      </div>
    </div>
  );
});

const CategoryAttributes = memo(function CategoryAttributes({ category, subcategory, attributes, errors, onChange, listingAttributes }: { category: string; subcategory: string; attributes: Record<string, any>; errors: Record<string, string>; onChange: (key: string, val: any) => void; listingAttributes?: Record<string, any> }) {
  const [manualModes, setManualModes] = useState<Record<string, boolean>>({});
  const overrideKey = `${category}/${subcategory || ''}`;
  const combined = [
    ...((ATTRS[category] ?? [])),
    ...((ATTR_SUBSCHEMAS[overrideKey] ?? [])),
  ];
  const fieldMap = new Map<string, AttrFieldLocal>();
  combined.forEach((f) => {
    const id = f.key ? `k:${f.key}` : (f.minKey && f.maxKey) ? `r:${f.minKey}:${f.maxKey}` : `l:${f.label}`;
    fieldMap.set(id, f);
  });
  
  const PRIORITY_KEYS = ['marka', 'model', 'seri', 'paket'];
  const fields = Array.from(fieldMap.values()).sort((a, b) => {
    const aKey = a.key || '';
    const bKey = b.key || '';
    const aIndex = PRIORITY_KEYS.indexOf(aKey);
    const bIndex = PRIORITY_KEYS.indexOf(bKey);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return 0;
  });
  
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
            const isRangeAsSingle = f.type === 'range-number';
            const specialKey = isRangeAsSingle && f.minKey ? f.minKey.replace('Min', '') : '';
            
            let warning = null;
            if (listingAttributes) {
               if (isRangeAsSingle && specialKey) {
                  if (attributes[specialKey]) {
                     const val = Number(attributes[specialKey]);
                     const min = Number(listingAttributes[f.minKey!]);
                     const max = Number(listingAttributes[f.maxKey!]);
                     const hasMin = listingAttributes[f.minKey!] !== undefined && listingAttributes[f.minKey!] !== '' && !isNaN(min);
                     const hasMax = listingAttributes[f.maxKey!] !== undefined && listingAttributes[f.maxKey!] !== '' && !isNaN(max);
             
                     if ((hasMin && val < min) || (hasMax && val > max)) {
                        warning = `Talep kriterlerine (${hasMin ? min : '...'} - ${hasMax ? max : '...'}) uymuyor`;
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

            if (isRangeAsSingle && specialKey) {
              return (
                <div key={id}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{f.label} {f.required ? <span className="text-red-500">*</span> : ''}</label>
                  <input
                    type="number"
                    value={attributes[specialKey] ?? ''}
                    onChange={(e)=>onChange(specialKey, e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${errors[specialKey] ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                  />
                  {errors[specialKey] && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors[specialKey]}</p>}
                  {warning && <p className="text-amber-600 text-xs mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {warning}</p>}
                </div>
              );
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
                        const brand = String(attributes['marka'] || '').trim();
                        const overrideKeyLocal = `${category}/${subcategory || ''}`;
                        let opts = f.options ? [...f.options] : [];
                        if (f.key === 'marka' && overrideKeyLocal === 'vasita/otomobil') {
                          // Use default options
                        }
                        if (f.key === 'model' && brand && BRAND_MODELS[overrideKeyLocal]) {
                          const base = BRAND_MODELS[overrideKeyLocal][brand] || [];
                          const extra = Object.keys(((MODEL_SERIES_EXTRA[overrideKeyLocal] || {})[brand] || {}));
                          const arr = [...base, ...extra];
                          opts = Array.from(new Set(arr)).sort((a,b)=> a.localeCompare(b,'tr'));
                        } else if (f.key === 'seri') {
                          const modelVal = String(attributes['model'] || '').trim();
                          const seriesBase = (MODEL_SERIES[overrideKeyLocal] || {}) as Record<string, Record<string, string[]>>;
                          const seriesExtra = (MODEL_SERIES_EXTRA[overrideKeyLocal] || {}) as Record<string, Record<string, string[]>>;
                          const brandSeries = { ...(seriesBase[brand] || {}), ...(seriesExtra[brand] || {}) } as Record<string, string[]>;
                          if (brand && modelVal && brandSeries && brandSeries[modelVal]) {
                            const arr: string[] = brandSeries[modelVal] || [];
                            const sorted = Array.from(new Set<string>(arr)).sort((a,b)=> a.localeCompare(b,'tr'));
                            opts = sorted.length ? sorted : ['Standart'];
                          } else {
                            opts = ['Standart'];
                          }
                        } else if (f.key === 'paket') {
                          const modelVal = String(attributes['model'] || '').trim();
                          const seriesVal = String(attributes['seri'] || '').trim();
                          let trimOpts: string[] | undefined;
                          if (overrideKeyLocal === 'vasita/otomobil') {
                            type TrimTree = Record<string, Record<string, Record<string, string[]>>>;
                            const trimsBase = (SERIES_TRIMS['vasita/otomobil'] || {}) as TrimTree;
                            const trimsExtra = (SERIES_TRIMS_EXTRA['vasita/otomobil'] || {}) as TrimTree;
                            const brandMap = {
                              ...(trimsBase[brand] || {}),
                              ...(trimsExtra[brand] || {}),
                            } as Record<string, Record<string, string[]>>;
                            const modelMap = brandMap[modelVal] || {};
                            trimOpts = modelMap[seriesVal];
                          } else {
                            type TrimTree = Record<string, Record<string, Record<string, string[]>>>;
                            const exMap = SERIES_TRIMS_EX[`vasita/${subcategory || ''}`] as TrimTree | undefined;
                            trimOpts = exMap?.[brand]?.[modelVal]?.[seriesVal];
                          }
                          const arr = trimOpts && trimOpts.length ? trimOpts : [];
                          const sorted = Array.from(new Set(arr)).sort((a,b)=> a.localeCompare(b,'tr'));
                          if (sorted.length) {
                            opts = sorted;
                          } else {
                            const defaultPaket = (ATTR_SUBSCHEMAS['vasita/otomobil'] || []).find((ff)=> ff.key === 'paket')?.options || ['Base','Comfort','Elegance','Premium','Sport','AMG Line','M Sport','S-Line','Trendline','Highline'];
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
    <div className="bg-gradient-to-br from-cyan-50 to-indigo-50 rounded-2xl p-6 border border-cyan-100 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-cyan-600 shrink-0">
          <Lightbulb className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Fiyatlandırma Önerisi</h3>
          <p className="text-sm text-gray-600 mb-3">Piyasa analizine göre bu Ürün veya İş için önerilen fiyat aralığı:</p>
          <p className="text-2xl font-bold text-cyan-700 tracking-tight">
            {typeof listingPrice === 'number' ? `${Math.max(1, Math.floor(listingPrice * 0.9)).toLocaleString('tr-TR')} - ${Math.floor(listingPrice).toLocaleString('tr-TR')} TL` : '2.500 - 4.000 TL'}
          </p>
        </div>
      </div>
    </div>

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
          <li>Komisyon oranı teklif kabul edildiğinde kesilecektir.</li>
          <li>Teklifiniz müşteriye doğrudan iletilecektir.</li>
          <li>Rekabetçi fiyatlar şansınızı artırır.</li>
        </ul>
      </div>
    </div>
  </div>
  );
});

const ReviewStep = memo(function ReviewStep({ formData, attrs, updateFormData, errors }: { formData: FormData, attrs: any, updateFormData: (field: keyof FormData, value: any) => void, errors: Partial<Record<keyof FormData, string>> }) {
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
                <div key={`${img}-${i}`} className="aspect-square rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-all">
                  <img src={img} alt={`Teklif görseli ${i+1}`} className="w-full h-full object-cover" />
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
                const label = k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1').trim();
                
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
              {formData.message.length} karakter
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

  const getCategoryName = (slug: string) => {
    const cat = CATEGORIES.find(c => c.slug === slug);
    return cat ? cat.name : slug;
  };
  
  const getSubCategoryName = (catSlug: string, subSlug: string) => {
    const cat = CATEGORIES.find(c => c.slug === catSlug);
    const sub = cat?.subcategories.find(s => s.slug === subSlug);
    return sub ? sub.name : subSlug;
  };

  const categoryName = listing.category?.name || (listing.category?.slug ? getCategoryName(listing.category.slug) : 'Kategori');
  const subCategoryName = listing.subCategory?.name || (listing.subCategory?.slug ? getSubCategoryName(listing.category?.slug, listing.subCategory.slug) : 'Alt Kategori');

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
                <div className="flex items-center justify-between bg-cyan-50 px-4 py-3 rounded-xl border border-cyan-100">
                  <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Bütçe
                  </span>
                  <span className="text-lg font-bold text-cyan-700">
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
              <div className="flex items-center justify-between bg-cyan-50 px-4 py-3 rounded-xl border border-cyan-100">
                <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Bütçe
                </span>
                <span className="text-lg font-bold text-cyan-700">
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
                const label = map[k] || k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1').trim();
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

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>> & { images?: string }>({});
  const [attributeErrors, setAttributeErrors] = useState<Record<string, string>>({});
  const [missingRequiredFields, setMissingRequiredFields] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> & { images?: string } = {};
    const newAttrErrors: Record<string, string> = {};

    if (step === 1) {
      if (listing) {
        const category = listing.category?.slug;
        const subcategory = listing.subCategory?.slug;
        if (category) {
           const overrideKey = `${category}/${subcategory || ''}`;
           const labelMap: Record<string, string> = {};
           const combined = [
             ...((ATTRS[category] ?? [])),
             ...((ATTR_SUBSCHEMAS[overrideKey] ?? [])),
           ];
           const fieldMap = new Map<string, AttrField>();
           combined.forEach((f) => {
             const id = f.key ? `k:${f.key}` : (f.minKey && f.maxKey) ? `r:${f.minKey}:${f.maxKey}` : `l:${f.label}`;
             fieldMap.set(id, f);
             if (f.key) {
               labelMap[f.key] = f.label;
             }
             if (f.type === 'range-number' && f.minKey) {
               const specialKey = f.minKey.replace('Min', '');
               labelMap[specialKey] = f.label;
             }
           });
           fieldMap.forEach((f) => {
             if (f.type === 'range-number' && f.minKey && f.required) {
                const specialKey = f.minKey.replace('Min', '');
                const v = attributes[specialKey];
                const present = v !== undefined && String(v).trim() !== '';
                if (!present) newAttrErrors[specialKey] = 'Zorunlu';
             } else if (f.key && f.required) {
               const v = attributes[f.key];
               const present = f.type === 'boolean' ? (f.key in attributes) : (v !== undefined && String(v).trim() !== '');
               if (!present) newAttrErrors[f.key] = 'Zorunlu';
             }
           });
           if (String(attributes['marka'] || '').trim() && !String(attributes['model'] || '').trim()) {
             newAttrErrors['model'] = 'Zorunlu';
           }
           const missingLabels = Object.keys(newAttrErrors).map((key) => labelMap[key] || key);
           setMissingRequiredFields(missingLabels);
        }
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
  }, [formData, attributes, listing]);

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

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (currentStep < STEPS.length) {
      nextStep();
      return;
    }

    if (!validateStep(currentStep)) return;
    try {
      setIsSubmitting(true);
      setSubmitError("");
      setSubmitSuccess("");
      const res = await fetch('/api/teklif-ver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: params?.id,
          price: formData.price,
          message: formData.message,
          attributes,
          images: formData.images,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Başarılı!', description: 'Teklifiniz gönderildi', variant: 'success' });
        setSubmitSuccess('Teklifiniz başarıyla gönderildi');
        setTimeout(() => { router.push(`/talep/${params?.id}`); }, 1500);
      } else {
        const msg = data?.error || 'Teklif gönderilemedi';
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
  }, [formData, params?.id, currentStep, validateStep, router, attributes, isSubmitting]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/talep?id=${params?.id}`);
        if (res.ok) {
          const data = await res.json();
          if (!active) return;
          setListing(data);
          if (!formData.price && typeof data.price === 'number') {
            setFormData(prev => ({ ...prev, price: String(Math.max(1, Math.floor(data.price * 0.9))) }));
          }
        }
      } catch {}
    })();
    return () => { active = false; };
  }, [params?.id]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CategoryAttributes
            category={listing?.category?.slug}
            subcategory={listing?.subCategory?.slug}
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
        return <ReviewStep formData={formData} attrs={attributes} updateFormData={updateFormData} errors={errors} />;
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
                      className="flex items-center gap-2 px-8 py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-200 hover:shadow-cyan-300 transform hover:-translate-y-0.5"
                    >
                      Devam Et
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`
                        flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg transform hover:-translate-y-0.5
                        ${isSubmitting 
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
