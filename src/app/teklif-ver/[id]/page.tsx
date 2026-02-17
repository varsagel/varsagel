"use client";
import { useState, useCallback, memo, useEffect, useMemo, useRef, type ComponentType } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { titleCaseTR } from "@/lib/title-case-tr";
import { 
  Upload, X, Image as ImageIcon, Check, AlertCircle, ChevronRight, 
  ChevronLeft, FileText, Send, MapPin, 
  ArrowLeft, ArrowRight, ShieldCheck, AlertTriangle,
  Loader2, CheckCircle2, MessageSquare, Tag, ListChecks
} from 'lucide-react';

// Adım tanımları
type Step = {
  id: number;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

const STEPS: Step[] = [
  { id: 1, title: "Fiyatlandırma", description: "Tutar belirleyin", icon: Tag },
  { id: 2, title: "Ürün Özellikleri", description: "Ürünü tanımlayın", icon: ListChecks },
  { id: 3, title: "Görseller", description: "Görsel ekleyin", icon: ImageIcon },
  { id: 4, title: "Mesaj", description: "Teklif mesajınızı yazın", icon: MessageSquare },
  { id: 5, title: "Özet", description: "Kontrol ve onay", icon: FileText },
];

// Form verileri
type FormData = { price: string; message: string; images: string[]; attributes: Record<string, any> };
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
  showInOffer?: boolean;
};

const isVehicleCategorySlug = (slug?: string) => {
  const normalized = String(slug || "").toLocaleLowerCase("tr");
  if (!normalized) return false;
  if (normalized === "vasita" || normalized.startsWith("vasita/") || normalized.startsWith("vasita-")) return true;
  return (
    normalized.includes("otomobil") ||
    normalized.includes("araba") ||
    normalized.includes("arazi") ||
    normalized.includes("suv") ||
    normalized.includes("pickup") ||
    normalized.includes("minivan") ||
    normalized.includes("panelvan") ||
    normalized.includes("motosiklet") ||
    normalized.includes("kamyon") ||
    normalized.includes("cekici") ||
    normalized.includes("otobus") ||
    normalized.includes("minibus") ||
    normalized.includes("ticari") ||
    normalized.includes("kiralik")
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

const MAX_UPLOAD_SIZE = 20 * 1024 * 1024;
const VALID_IMAGE_EXTS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "bmp",
  "tif",
  "tiff",
  "apng",
  "ico",
  "avif",
  "heic",
  "heif",
  "jfif",
  "jif",
]);

const validateImageFile = (file: File) => {
  if (!file) return "Dosya seçilmedi";
  if (file.size <= 0) return "Seçilen dosya boş";
  if (file.size > MAX_UPLOAD_SIZE) {
    return `Dosya çok büyük (${(file.size / 1024 / 1024).toFixed(2)}MB). Maksimum 20MB.`;
  }
  const type = String(file.type || "").toLowerCase();
  if (type.startsWith("image/")) return null;
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (ext && VALID_IMAGE_EXTS.has(ext)) return null;
  const allowed = Array.from(VALID_IMAGE_EXTS).join(", ");
  return `Geçersiz dosya tipi (${type || ext || "bilinmiyor"}). Kabul edilenler: ${allowed}.`;
};

const humanizeKeyTR = (rawKey: string) => {
  const raw = String(rawKey || '').trim();
  if (!raw) return '';
  const withSpaces = raw
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
  return titleCaseTR(withSpaces);
};

const labelForKey = (key: string) => {
  const map: Record<string, string> = {
    minPrice: 'Minimum Fiyat',
    maxPrice: 'Maksimum Fiyat',
    minBudget: 'Minimum Bütçe',
    budget: 'Maksimum Bütçe',
    marka: 'Marka',
    model: 'Model',
    seri: 'Motor / Seri',
    paket: 'Donanım / Paket',
    yil: 'Yıl',
    km: 'Kilometre',
    yakit: 'Yakıt',
    vites: 'Vites',
    kasaTipi: 'Kasa Tipi',
    motorGucu: 'Motor Gücü',
    motorHacmi: 'Motor Hacmi',
    plakaUyruk: 'Plaka / Uyruk',
    aracDurumu: 'Araç Durumu',
    agirhasarKayitli: 'Ağır Hasar Kayıtlı',
    aracDurumu1: 'Araç Durumu',
    motorSeri: 'Motor / Seri',
    donanimPaket: 'Donanım / Paket',
    'motor-seri': 'Motor / Seri',
    'donanim-paket': 'Donanım / Paket',
    'arac-durumu': 'Araç Durumu',
    'agirhasar-kayitli': 'Ağır Hasar Kayıtlı',
    'kasa-tipi': 'Kasa Tipi',
    'motor-gucu': 'Motor Gücü',
    'motor-hacmi': 'Motor Hacmi',
    'plaka-uyruk': 'Plaka / Uyruk',
  };
  if (map[key]) return map[key];
  return humanizeKeyTR(key);
};

const formatValueTR = (value: any, key?: string): string => {
  if (value === null || value === undefined) return '—';
  const noGroupForKey = (k?: string) => {
    if (!k) return false;
    return k === 'yil' || k.endsWith('yil') || k.endsWith('yilMin') || k.endsWith('yilMax');
  };
  const fmtNum = (n: number, k?: string) => {
    if (!Number.isFinite(n)) return String(n);
    if (noGroupForKey(k)) return new Intl.NumberFormat('tr-TR', { useGrouping: false }).format(n);
    return new Intl.NumberFormat('tr-TR').format(n);
  };
  if (typeof value === 'string') {
    const v = value.trim();
    if (!v) return '—';
    if (/^\d+$/.test(v)) return fmtNum(Number(v), key);
    return titleCaseTR(v);
  }
  if (typeof value === 'number') return fmtNum(value, key);
  if (typeof value === 'bigint') return fmtNum(Number(value), key);
  if (typeof value === 'boolean') return value ? 'Evet' : 'Hayır';
  if (Array.isArray(value)) return value.map((x) => formatValueTR(x, key)).filter(Boolean).join(', ') || '—';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
};

const normalizeAttributes = (raw: any): Record<string, any> => {
  if (!raw) return {};
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
};

const buildAttributeItems = (attributes: Record<string, any>) => {
  const entries = Object.entries(attributes || {});
  const items = entries
    .map(([key, value], order) => ({
      key,
      label: labelForKey(key),
      value: formatValueTR(value, key),
      order,
    }))
    .filter((item) => item.value && item.value !== '—');
  return items;
};

const parseAttributeOptions = (raw: any): string[] | undefined => {
  if (!raw) return undefined;
  if (Array.isArray(raw)) return raw.map((o) => String(o));
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map((o: any) => String(o));
    } catch {
      const split = raw.split(",").map((s) => s.trim()).filter(Boolean);
      return split.length > 0 ? split : undefined;
    }
  }
  return undefined;
};

const isAttributeFilled = (field: AttributeField, values: Record<string, any>) => {
  if (field.type === "range-number") {
    const val = values[field.slug];
    return String(val ?? "").trim() !== "";
  }
  if (field.type === "multiselect") {
    const val = values[field.slug];
    return Array.isArray(val) ? val.length > 0 : String(val ?? "").trim() !== "";
  }
  if (field.type === "boolean") {
    return !!values[field.slug];
  }
  const val = values[field.slug];
  if (Array.isArray(val)) return val.length > 0;
  return String(val ?? "").trim() !== "";
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
    
    const validationError = validateImageFile(file);
    if (validationError) {
      toast({ title: 'Hata', description: validationError, variant: 'destructive' });
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

const MessageStep = memo(function MessageStep({ formData, updateFormData, errors }: { formData: FormData; updateFormData: (field: keyof FormData, value: any) => void; errors: Partial<Record<keyof FormData, string>> }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Teklif Mesajı <span className="text-red-500">*</span></h3>
            <p className="text-sm text-gray-500">Müşteriye kendinizi tanıtın ve teklif detaylarını paylaşın.</p>
          </div>
        </div>
        <div className="relative">
          <textarea
            value={formData.message}
            onChange={(e) => updateFormData('message', e.target.value)}
            rows={6}
            placeholder="Örn: Deneyimleriniz, süreç, teslim süresi ve garanti detayları..."
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

const AttributesStep = memo(function AttributesStep({
  attributeFields,
  attributeValues,
  attributeLoading,
  attributeLoadError,
  updateAttribute,
  attributeErrors,
  listingAttributes,
  isVasita,
  brandOptions,
  modelOptions,
  seriesOptions,
  trimOptions,
  brandLoading,
  modelLoading,
  seriesLoading,
  trimLoading,
}: {
  attributeFields: AttributeField[];
  attributeValues: Record<string, any>;
  attributeLoading: boolean;
  attributeLoadError: string | null;
  updateAttribute: (key: string, value: any) => void;
  attributeErrors: Record<string, string>;
  listingAttributes: Record<string, any>;
  isVasita: boolean;
  brandOptions: string[];
  modelOptions: string[];
  seriesOptions: string[];
  trimOptions: string[];
  brandLoading: boolean;
  modelLoading: boolean;
  seriesLoading: boolean;
  trimLoading: boolean;
}) {
  const orderedFields = useMemo(() => {
    return [...attributeFields].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [attributeFields]);
  const normalizedListingAttributes = useMemo(() => {
    return listingAttributes || {};
  }, [listingAttributes]);

  const isBrandOrModel = useCallback((field: AttributeField) => {
    const slug = String(field.slug || "").toLowerCase();
    const name = String(field.name || "").toLowerCase();
    return slug.includes("marka") || slug.includes("model") || name.includes("marka") || name.includes("model");
  }, []);

  const normalizeList = useCallback((val: any) => {
    if (Array.isArray(val)) return val.map((v) => String(v));
    if (val === null || val === undefined) return [];
    const str = String(val).trim();
    return str ? [str] : [];
  }, []);

  const hasValue = useCallback((val: any) => {
    if (val === null || val === undefined) return false;
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === "string") return val.trim().length > 0;
    return true;
  }, []);

  const getInfoText = useCallback((field: AttributeField, offerValue: any) => {
    const listingValue = normalizedListingAttributes[field.slug];
    if (!hasValue(listingValue) || !hasValue(offerValue)) return "";
    if (field.type === "multiselect") {
      const listingList = normalizeList(listingValue);
      const offerList = normalizeList(offerValue);
      if (listingList.length === 0 || offerList.length === 0) return "";
      const hasOutside = offerList.some((v) => !listingList.includes(v));
      if (!hasOutside) return "";
      return `Talep sahibinin seçimi: ${formatValueTR(listingValue, field.slug)}. Sizin seçiminiz: ${formatValueTR(offerValue, field.slug)}.`;
    }
    if (field.type === "select") {
      const listingList = normalizeList(listingValue);
      const offerStr = String(offerValue).trim();
      if (!offerStr || listingList.length === 0) return "";
      if (listingList.includes(offerStr)) return "";
      return `Talep sahibinin seçimi: ${formatValueTR(listingValue, field.slug)}. Sizin seçiminiz: ${formatValueTR(offerValue, field.slug)}.`;
    }
    const offerStr = String(offerValue).trim();
    const listingStr = String(listingValue).trim();
    if (!offerStr || !listingStr || offerStr === listingStr) return "";
    return `Talep sahibinin seçimi: ${formatValueTR(listingValue, field.slug)}. Sizin seçiminiz: ${formatValueTR(offerValue, field.slug)}.`;
  }, [normalizeList, hasValue, normalizedListingAttributes]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Ürün Özellikleri</h3>
            <p className="text-sm text-gray-500">Elinizdeki ürünün özelliklerini girin.</p>
          </div>
        </div>

        {attributeLoading && (
          <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-600 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Özellikler yükleniyor...
          </div>
        )}

        {attributeLoadError && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {attributeLoadError}
          </div>
        )}

        {!attributeLoading && !attributeLoadError && orderedFields.length === 0 && (
          <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-600">
            Bu talep için ek ürün özelliği bulunmuyor.
          </div>
        )}

        {!attributeLoading && !attributeLoadError && orderedFields.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {orderedFields.map((field) => {
              const error = attributeErrors[field.slug];
              if (field.type === "range-number") {
                const value = attributeValues[field.slug] ?? "";
                const infoText = getInfoText(field, value);
                const minLabel = field.minLabel || "Minimum";
                const maxLabel = field.maxLabel || "Maksimum";
                const placeholder = field.minLabel && field.maxLabel ? `${minLabel} - ${maxLabel}` : undefined;
                return (
                  <div key={field.slug} className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">
                      {field.name} {field.required ? <span className="text-red-500">*</span> : null}
                    </label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => updateAttribute(field.slug, e.target.value)}
                      placeholder={placeholder}
                      className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-cyan-500 ${error ? "border-red-300 bg-red-50" : "border-gray-200"}`}
                    />
                    {error && <div className="text-xs text-red-500">{error}</div>}
                    {infoText && <div className="text-xs text-amber-700">{infoText}</div>}
                  </div>
                );
              }

              if (field.type === "boolean") {
                const checked = !!attributeValues[field.slug];
                const infoText = getInfoText(field, checked);
                return (
                  <div key={field.slug} className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => updateAttribute(field.slug, e.target.checked)}
                        className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                      />
                      <span>
                        {field.name} {field.required ? <span className="text-red-500">*</span> : null}
                      </span>
                    </label>
                    {error && <div className="text-xs text-red-500">{error}</div>}
                    {infoText && <div className="text-xs text-amber-700">{infoText}</div>}
                  </div>
                );
              }

              if (field.type === "multiselect") {
                const options = (field.options || []).map((o) => String(o));
                const withAny = !isBrandOrModel(field) && !options.includes("Farketmez");
                const optionList = withAny ? ["Farketmez", ...options] : options;
                const value = Array.isArray(attributeValues[field.slug]) ? attributeValues[field.slug] : [];
                const infoText = getInfoText(field, value);
                return (
                  <div key={field.slug} className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">
                      {field.name} {field.required ? <span className="text-red-500">*</span> : null}
                    </label>
                    <div className={`border rounded-xl p-3 space-y-2 ${error ? "border-red-300 bg-red-50" : "border-gray-200"}`}>
                      {optionList.length === 0 && <div className="text-xs text-gray-500">Seçenek bulunamadı.</div>}
                      {optionList.map((opt) => {
                        const checked = value.includes(opt);
                        return (
                          <label key={opt} className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const next = new Set(value.map(String));
                                if (e.target.checked) next.add(opt);
                                else next.delete(opt);
                                if (opt === "Farketmez") {
                                  if (e.target.checked) {
                                    next.clear();
                                    next.add("Farketmez");
                                  }
                                } else if (next.has("Farketmez")) {
                                  next.delete("Farketmez");
                                }
                                updateAttribute(field.slug, Array.from(next));
                              }}
                              className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                    {error && <div className="text-xs text-red-500">{error}</div>}
                    {infoText && <div className="text-xs text-amber-700">{infoText}</div>}
                  </div>
                );
              }

              if (field.type === "select") {
                const isVehicleField =
                  isVasita && (field.slug === "marka" || field.slug === "model" || field.slug === "seri" || field.slug === "paket");
                const optionsRaw = isVehicleField
                  ? field.slug === "marka"
                    ? (brandOptions.length > 0 ? brandOptions : (field.options || []))
                    : field.slug === "model"
                      ? modelOptions
                      : field.slug === "seri"
                        ? seriesOptions
                        : trimOptions
                  : (field.options || []);
                const options = (optionsRaw || []).map((o) => String(o));
                const withAny = !isVehicleField && !isBrandOrModel(field) && !options.includes("Farketmez");
                const optionList = withAny ? ["Farketmez", ...options] : options;
                const value = attributeValues[field.slug] ?? "";
                const infoText = getInfoText(field, value);
                const loading = isVehicleField
                  ? field.slug === "marka"
                    ? brandLoading
                    : field.slug === "model"
                      ? modelLoading
                      : field.slug === "seri"
                        ? seriesLoading
                        : trimLoading
                  : false;
                const disabled = isVehicleField
                  ? (field.slug === "model" && !String(attributeValues["marka"] || "").trim()) ||
                    (field.slug === "seri" && !String(attributeValues["model"] || "").trim()) ||
                    (field.slug === "paket" && !String(attributeValues["seri"] || "").trim())
                  : false;
                const placeholder = loading
                  ? "Yükleniyor..."
                  : disabled
                    ? field.slug === "model"
                      ? "Önce marka seçiniz"
                      : field.slug === "seri"
                        ? "Önce model seçiniz"
                        : "Önce motor/seri seçiniz"
                    : "Seçiniz";
                return (
                  <div key={field.slug} className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">
                      {field.name} {field.required ? <span className="text-red-500">*</span> : null}
                    </label>
                    <select
                      value={value}
                      onChange={(e) => updateAttribute(field.slug, e.target.value)}
                      disabled={disabled || loading}
                      className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-cyan-500 ${error ? "border-red-300 bg-red-50" : "border-gray-200"}`}
                    >
                      <option value="">{placeholder}</option>
                      {optionList.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    {error && <div className="text-xs text-red-500">{error}</div>}
                    {infoText && <div className="text-xs text-amber-700">{infoText}</div>}
                  </div>
                );
              }

              const value = attributeValues[field.slug] ?? "";
              const infoText = getInfoText(field, value);
              return (
                <div key={field.slug} className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {field.name} {field.required ? <span className="text-red-500">*</span> : null}
                  </label>
                  <input
                    type={field.type === "number" ? "number" : "text"}
                    value={value}
                    onChange={(e) => updateAttribute(field.slug, e.target.value)}
                    className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-cyan-500 ${error ? "border-red-300 bg-red-50" : "border-gray-200"}`}
                  />
                  {error && <div className="text-xs text-red-500">{error}</div>}
                  {infoText && <div className="text-xs text-amber-700">{infoText}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});

const ReviewStep = memo(function ReviewStep({ formData }: { formData: FormData }) {
  const attributeItems = buildAttributeItems(formData.attributes);
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
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

        {/* Mesaj Özeti */}
        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            Teklif Mesajınız
          </h4>
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-gray-700 text-sm leading-relaxed whitespace-pre-line">
            {formData.message?.trim() ? formData.message : 'Mesaj belirtilmemiş'}
          </div>
        </div>

        {attributeItems.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-cyan-500" />
              Ürün Özellikleri
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {attributeItems.map((item) => (
                <div key={`${item.key}-${item.order}`} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-500 text-xs">{item.label}</span>
                  <span className="font-medium text-gray-900 text-right text-sm">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
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
  const primaryAttributes = normalizeAttributes(listing.attributes);
  const fallbackAttributes = Object.keys(primaryAttributes).length === 0 ? normalizeAttributes(listing.attributesJson) : {};
  const attributes = Object.keys(primaryAttributes).length > 0 ? primaryAttributes : fallbackAttributes;
  const attributeItems = buildAttributeItems(attributes || {});

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
            const minP = attributes?.minPrice ? Number(attributes.minPrice) : 0;
            const maxPAttr = attributes?.maxPrice ? Number(attributes.maxPrice) : 0;
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

        {attributeItems.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1">
              <Tag className="w-3 h-3" /> Talep Özellikleri
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {attributeItems.map((item) => (
                <div key={`${item.key}-${item.order}`} className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-500 text-xs">{item.label}</span>
                  <span className="font-medium text-gray-900 text-right text-sm">{item.value}</span>
                </div>
              ))}
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
  const [formData, setFormData] = useState<FormData>({ price: "", message: "", images: [], attributes: {} });
  const [listing, setListing] = useState<any>(null);
  const attrs = formData.attributes || {};
  const listingCategorySlug = listing?.category?.slug;
  const listingSubcategorySlug = listing?.subCategory?.slug;
  const vehicleCategoryKey = listingSubcategorySlug || listingCategorySlug || "";
  const isVasita = useMemo(() => {
    return (
      isVehicleCategorySlug(listingCategorySlug) ||
      isVehicleCategorySlug(listingSubcategorySlug) ||
      isVehicleCategorySlug(vehicleCategoryKey)
    );
  }, [listingCategorySlug, listingSubcategorySlug, vehicleCategoryKey]);
  const brandSource = attrs["marka"];
  const modelSource = attrs["model"];
  const seriesSource = attrs["seri"];
  const brandList = useMemo(() => {
    const arr = Array.isArray(brandSource)
      ? brandSource.map((b: any) => String(b))
      : brandSource
        ? [String(brandSource)]
        : [];
    return arr.filter((v: string) => v.trim());
  }, [brandSource]);
  const modelList = useMemo(() => {
    const arr = Array.isArray(modelSource)
      ? modelSource.map((m: any) => String(m))
      : modelSource
        ? [String(modelSource)]
        : [];
    return arr.filter((v: string) => v.trim());
  }, [modelSource]);
  const seriesList = useMemo(() => {
    const arr = Array.isArray(seriesSource)
      ? seriesSource.map((s: any) => String(s))
      : seriesSource
        ? [String(seriesSource)]
        : [];
    return arr.filter((v: string) => v.trim());
  }, [seriesSource]);
  const brandKey = brandList.join("|");
  const modelKey = modelList.join("|");
  const seriesKey = seriesList.join("|");
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>> & { images?: string }>({});
  const [attributeFields, setAttributeFields] = useState<AttributeField[]>([]);
  const [attributeLoading, setAttributeLoading] = useState(false);
  const [attributeLoadError, setAttributeLoadError] = useState<string | null>(null);
  const [attributeErrors, setAttributeErrors] = useState<Record<string, string>>({});
  const [brandOptions, setBrandOptions] = useState<string[]>([]);
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [seriesOptions, setSeriesOptions] = useState<string[]>([]);
  const [trimOptions, setTrimOptions] = useState<string[]>([]);
  const [brandLoading, setBrandLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [seriesLoading, setSeriesLoading] = useState(false);
  const [trimLoading, setTrimLoading] = useState(false);
  const prevBrandRef = useRef<string | null>(null);
  const prevModelRef = useRef<string | null>(null);
  const prevSeriesRef = useRef<string | null>(null);
  const [blockedReason, setBlockedReason] = useState<string>("");
  const [elig, setElig] = useState<any>(null);
  const [tick, setTick] = useState<number>(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const listingAttributes = useMemo(() => {
    const primary = normalizeAttributes(listing?.attributes);
    const fallback = Object.keys(primary).length === 0 ? normalizeAttributes(listing?.attributesJson) : {};
    return Object.keys(primary).length > 0 ? primary : fallback;
  }, [listing?.attributes, listing?.attributesJson]);

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> & { images?: string } = {};
    let attributeOk = true;
    if (step === 1) {
      if (!formData.price) newErrors.price = 'Fiyat belirtmelisiniz';
      if (parseInt(formData.price) < 1) newErrors.price = 'Geçerli bir fiyat giriniz';
    }

    if (step === 2) {
      const nextAttributeErrors: Record<string, string> = {};
      if (attributeFields.length > 0) {
        const attrs = formData.attributes || {};
        attributeFields.forEach((field) => {
          if (!field.required) return;
          if (!isAttributeFilled(field, attrs)) {
            nextAttributeErrors[field.slug] = `${field.name} gerekli`;
          }
        });
      }
      setAttributeErrors(nextAttributeErrors);
      attributeOk = Object.keys(nextAttributeErrors).length === 0;
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
    return Object.keys(newErrors).length === 0 && attributeOk;
  }, [formData, attributeFields]);

  const updateFormData = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field] || (field === 'images' && errors.images)) {
      setErrors(prev => ({ ...prev, [field]: undefined, images: undefined }));
    }
  }, [errors]);

  const updateImages = useCallback((imgs: string[]) => {
    updateFormData('images', imgs);
  }, [updateFormData]);

  const updateAttribute = useCallback((key: string, value: any) => {
    setFormData((prev) => {
      const current = prev.attributes || {};
      return { ...prev, attributes: { ...current, [key]: value } };
    });
    if (attributeErrors[key] || attributeErrors[key.replace(/(Min|Max)$/, "")]) {
      setAttributeErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        const baseKey = key.replace(/(Min|Max)$/, "");
        if (baseKey !== key) delete next[baseKey];
        return next;
      });
    }
  }, [attributeErrors]);

  const nextStep = useCallback(() => {
    if (blockedReason) return;
    if (validateStep(currentStep) && currentStep < STEPS.length) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [validateStep, currentStep, blockedReason]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  useEffect(() => {
    if (currentStep !== STEPS.length && reviewConfirmed) {
      setReviewConfirmed(false);
    }
  }, [currentStep, reviewConfirmed]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (currentStep !== STEPS.length) {
      return;
    }
    if (!reviewConfirmed) {
      toast({ title: 'Onay gerekli', description: 'Devam etmek için teklifi onaylayın.', variant: 'warning' });
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

      const res = await fetch('/api/teklif-ver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          price: formData.price,
          message: formData.message,
          images: formData.images,
          attributes: formData.attributes,
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
  }, [formData, params?.id, currentStep, validateStep, router, isSubmitting, listing?.id, listing?.status, reviewConfirmed]);

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

        }
      } catch {}
    })();
    return () => { active = false; };
  }, [params?.id]);

  useEffect(() => {
    let active = true;
    const categorySlug = listingCategorySlug;
    const subcategorySlug = listingSubcategorySlug;
    if (!categorySlug) {
      setAttributeFields([]);
      setAttributeLoading(false);
      setAttributeLoadError(null);
      setAttributeErrors({});
      setFormData((prev) => {
        if (!prev.attributes || Object.keys(prev.attributes).length === 0) return prev;
        return { ...prev, attributes: {} };
      });
      return () => { active = false; };
    }
    (async () => {
      setAttributeLoading(true);
      setAttributeLoadError(null);
      try {
        const qs = subcategorySlug ? `?subcategory=${encodeURIComponent(subcategorySlug)}` : "";
        const res = await fetch(`/api/categories/${categorySlug}/attributes${qs}`);
        if (!res.ok) throw new Error("load-failed");
        const data = await res.json();
        const slugMap = new Map<string, string>();
        const mapped = Array.isArray(data)
          ? data
              .filter((a) => a?.showInOffer !== false)
              .map((a) => {
                const options = parseAttributeOptions(a.optionsJson);
                const normalizedType = a.type === "checkbox" ? "boolean" : a.type;
                const normalizedSlug = isVasita ? normalizeVasitaSlug(a.slug, a.name) : a.slug;
                if (isVasita && a.slug && normalizedSlug && normalizedSlug !== a.slug) {
                  slugMap.set(a.slug, normalizedSlug);
                }
                return {
                  id: a.id,
                  name: a.name,
                  slug: normalizedSlug || a.slug,
                  type: normalizedType,
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
          setAttributeErrors({});
          if (mapped.length === 0) {
            setFormData((prev) => {
              if (!prev.attributes || Object.keys(prev.attributes).length === 0) return prev;
              return { ...prev, attributes: {} };
            });
          } else {
            const allowed = new Set<string>();
            mapped.forEach((f) => {
              allowed.add(f.slug);
            });
            setFormData((prev) => {
              const current = prev.attributes || {};
              const next: Record<string, any> = {};
              let changed = false;
              for (const [k, v] of Object.entries(current)) {
                const mappedKey = slugMap.get(k) || k;
                if (mappedKey !== k) changed = true;
                if (allowed.has(mappedKey)) {
                  next[mappedKey] = v;
                } else {
                  changed = true;
                }
              }
              if (!changed && Object.keys(next).length === Object.keys(current).length) return prev;
              return { ...prev, attributes: next };
            });
          }
        }
      } catch {
        if (active) {
          setAttributeFields([]);
          setAttributeLoadError("Özellikler yüklenemedi");
        }
      } finally {
        if (active) setAttributeLoading(false);
      }
    })();
    return () => { active = false; };
  }, [listingCategorySlug, listingSubcategorySlug, isVasita]);

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
      setFormData((prev) => {
        const current = prev.attributes || {};
        const next = { ...current };
        let changed = false;
        if (next.model !== undefined) { delete next.model; changed = true; }
        if (next.seri !== undefined) { delete next.seri; changed = true; }
        if (next.paket !== undefined) { delete next.paket; changed = true; }
        return changed ? { ...prev, attributes: next } : prev;
      });
    }
    if (prevModelRef.current !== null && prevModelRef.current !== modelKey) {
      setFormData((prev) => {
        const current = prev.attributes || {};
        const next = { ...current };
        let changed = false;
        if (next.seri !== undefined) { delete next.seri; changed = true; }
        if (next.paket !== undefined) { delete next.paket; changed = true; }
        return changed ? { ...prev, attributes: next } : prev;
      });
    }
    if (prevSeriesRef.current !== null && prevSeriesRef.current !== seriesKey) {
      setFormData((prev) => {
        const current = prev.attributes || {};
        const next = { ...current };
        let changed = false;
        if (next.paket !== undefined) { delete next.paket; changed = true; }
        return changed ? { ...prev, attributes: next } : prev;
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
        return <PricingStep formData={formData} errors={errors} updateFormData={updateFormData} listingPrice={listing?.price ?? null} />;
      case 2:
        return (
          <AttributesStep
            attributeFields={attributeFields}
            attributeValues={formData.attributes || {}}
            attributeLoading={attributeLoading}
            attributeLoadError={attributeLoadError}
            updateAttribute={updateAttribute}
            attributeErrors={attributeErrors}
            listingAttributes={listingAttributes}
            isVasita={isVasita}
            brandOptions={brandOptions}
            modelOptions={modelOptions}
            seriesOptions={seriesOptions}
            trimOptions={trimOptions}
            brandLoading={brandLoading}
            modelLoading={modelLoading}
            seriesLoading={seriesLoading}
            trimLoading={trimLoading}
          />
        );
      case 3:
        return <ImageUploadStep images={formData.images} updateImages={updateImages} error={errors.images} />;
      case 4:
        return <MessageStep formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 5:
        return <ReviewStep formData={formData} />;
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

                {currentStep === STEPS.length && (
                  <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reviewConfirmed}
                        onChange={(e) => setReviewConfirmed(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                      />
                      <span className="text-sm text-gray-700 font-medium">Teklifi kontrol ettim ve onaylıyorum.</span>
                    </label>
                  </div>
                )}

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
                      disabled={isSubmitting || !!blockedReason || !reviewConfirmed}
                      className={`
                        flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg transform hover:-translate-y-0.5
                        ${isSubmitting || blockedReason || !reviewConfirmed
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
